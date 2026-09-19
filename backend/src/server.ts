import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GenerationJob, PresentationPipeline } from './pipeline.js';
import { THEMES } from './remotion/themes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const WORK_DIR = path.resolve(__dirname, '../out');

app.use(cors());
app.use(express.json());

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

// Create and trigger a presentation generation job
app.post('/api/presentations', async (req: Request, res: Response) => {
  try {
    const { prompt, templateId } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'A valid prompt string is required.' });
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const job: GenerationJob = {
      id: jobId,
      prompt: prompt.trim(),
      templateId: templateId || 'tech-modern-dark',
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jobs.set(jobId, job);

    // Launch pipeline execution asynchronously in background
    pipeline.execute(job, WORK_DIR, (updated) => {
      jobs.set(jobId, { ...updated });
    }).catch((err) => {
      console.error(`[Job ${jobId}] Failed:`, err);
    });

    res.status(202).json({
      message: 'Presentation generation started',
      jobId,
      status: job.status,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to start presentation job' });
  }
});

// Get job status and details
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
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });
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
