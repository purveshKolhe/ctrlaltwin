import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { GenerationJob, PresentationPipeline } from './pipeline';
import { THEMES } from './remotion/themes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env and root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 4000;
const WORK_DIR = path.resolve(__dirname, '../out');
const UPLOADS_DIR = path.resolve(__dirname, '../out/uploads');
const PUBLIC_DIR = path.resolve(__dirname, '../public');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB PDF limit
});

// In-memory job repository
const jobs = new Map<string, GenerationJob>();
const pipeline = new PresentationPipeline();

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List available presentation templates
app.get('/api/templates', (_req: Request, res: Response) => {
  res.json({
    templates: Object.values(THEMES).map((t) => ({
      id: t.id,
      name: t.name,
      primaryColor: t.primaryColor,
      backgroundColor: t.backgroundColor,
    })),
  });
});

// Create and trigger a presentation generation job (supports JSON or multipart with PDF)
app.post(
  '/api/presentations',
  upload.single('pdf'),
  async (req: Request, res: Response) => {
    try {
      const prompt = req.body?.prompt || '';
      const templateId = req.body?.templateId || 'tech-modern-dark';
      const pdfPath = req.file ? req.file.path : undefined;

      if (!prompt.trim() && !pdfPath) {
        return res
          .status(400)
          .json({ error: 'Please provide either a prompt or a PDF document.' });
      }

      const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const job: GenerationJob = {
        id: jobId,
        prompt: prompt.trim(),
        pdfPath,
        templateId,
        status: 'pending',
        progress: 0,
        logs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jobs.set(jobId, job);

      // Launch pipeline asynchronously
      pipeline
        .execute(job, WORK_DIR, (updated) => {
          jobs.set(jobId, { ...updated });
        })
        .catch((err) => {
          console.error(`[Job ${jobId}] Failed:`, err);
        });

      res.status(202).json({
        message: 'Presentation generation started',
        jobId,
        status: job.status,
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err?.message || 'Failed to start presentation job' });
    }
  }
);

// Get job status, details, and live logs
app.get('/api/presentations/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const job = jobs.get(id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    prompt: job.prompt,
    templateId: job.templateId,
    manifest: job.manifest,
    hasVideo: !!job.videoPath && fs.existsSync(job.videoPath),
    error: job.error,
    logs: job.logs || [],
    metrics: job.metrics || {},
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });
});

// Get raw plaintext backend logs for a job
app.get('/api/presentations/:id/logs', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const job = jobs.get(id);
  if (!job) {
    return res.status(404).send('Job not found');
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send((job.logs || []).join('\n'));
});

// Download / stream rendered video
app.get('/api/presentations/:id/video', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const job = jobs.get(id);
  if (!job || !job.videoPath || !fs.existsSync(job.videoPath)) {
    return res.status(404).json({ error: 'Video not found or still rendering' });
  }

  res.sendFile(job.videoPath);
});

app.listen(PORT, () => {
  console.log(`Presenter Video Engine backend listening on http://localhost:${PORT}`);
});
