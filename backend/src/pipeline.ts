import fs from 'fs';
import path from 'path';
import { ImageAgent } from './agents/image.agent';
import { OrchestratorAgent } from './agents/orchestrator.agent';
import { VoiceoverAgent } from './agents/voiceover.agent';
import { RenderService } from './services/render.service';
import { SyncService } from './services/sync.service';
import { PresentationManifest } from './types/presentation';

export interface JobMetrics {
  llmTimeSeconds?: number;
  ttsTimeSeconds?: number;
  imageTimeSeconds?: number;
  syncTimeSeconds?: number;
  renderTimeSeconds?: number;
  totalTimeSeconds?: number;
  totalFrames?: number;
  renderAvgFps?: number;
  slideCount?: number;
}

export interface GenerationJob {
  id: string;
  prompt: string;
  pdfPath?: string;
  templateId?: string;
  status:
    | 'pending'
    | 'orchestrating'
    | 'generating_assets'
    | 'syncing'
    | 'rendering'
    | 'completed'
    | 'failed';
  progress: number;
  manifest?: PresentationManifest;
  videoPath?: string;
  error?: string;
  logs: string[];
  metrics?: JobMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export class PresentationPipeline {
  private orchestrator: OrchestratorAgent;
  private voiceoverAgent: VoiceoverAgent;
  private imageAgent: ImageAgent;
  private syncService: SyncService;
  private renderService: RenderService;

  constructor() {
    this.orchestrator = new OrchestratorAgent();
    this.voiceoverAgent = new VoiceoverAgent();
    this.imageAgent = new ImageAgent();
    this.syncService = new SyncService();
    this.renderService = new RenderService();
  }

  /**
   * Executes the full generation pipeline end-to-end with detailed metrics and logging.
   */
  async execute(
    job: GenerationJob,
    workDir: string,
    onStatusUpdate?: (job: GenerationJob) => void
  ): Promise<GenerationJob> {
    const startTime = Date.now();
    job.logs = job.logs || [];
    job.metrics = job.metrics || {};

    let logFilePath: string | null = null;

    const addLog = (msg: string) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      const entry = `[+${elapsed}s] ${msg}`;
      job.logs.push(entry);
      console.log(`[Job ${job.id}] ${entry}`);

      if (logFilePath) {
        try {
          fs.appendFileSync(logFilePath, `${entry}\n`);
        } catch (_) {}
      }

      if (onStatusUpdate) {
        onStatusUpdate(job);
      }
    };

    const update = (patch: Partial<GenerationJob>) => {
      Object.assign(job, patch, { updatedAt: new Date() });
      if (onStatusUpdate) {
        onStatusUpdate(job);
      }
    };

    try {
      addLog(`🚀 Pipeline initiated for prompt: "${job.prompt || '(from PDF)'}"`);
      addLog(`Selected Template: "${job.templateId || 'healthcare-modern-blue'}"`);
      if (job.pdfPath) {
        const stats = fs.existsSync(job.pdfPath) ? fs.statSync(job.pdfPath) : null;
        addLog(`Attached PDF document: ${job.pdfPath} (${stats ? (stats.size / 1024).toFixed(1) + ' KB' : 'unknown'})`);
      }

      // Step 1: Orchestrator Agent (LLM Script Generation)
      update({ status: 'orchestrating', progress: 10 });
      addLog('Step 1/5: Calling Orchestrator Agent (LLM) to generate presentation script...');
      const tLlm0 = Date.now();

      let manifest = await this.orchestrator.generatePresentation(job.prompt, {
        templateId: job.templateId,
        pdfPath: job.pdfPath,
      });

      job.metrics.llmTimeSeconds = Number(((Date.now() - tLlm0) / 1000).toFixed(2));
      job.metrics.slideCount = manifest.slides.length;
      addLog(
        `✅ Script generated in ${job.metrics.llmTimeSeconds}s: "${manifest.title}" with ${manifest.slides.length} slides.`
      );
      manifest.slides.forEach((s, idx) => {
        addLog(`   Slide ${idx + 1} [${s.type}]: "${s.visual.title}" (${s.narration.script.length} chars voiceover)`);
      });

      // Prepare project directory for logs & assets
      const jobDir = path.join(workDir, manifest.id);
      fs.mkdirSync(jobDir, { recursive: true });
      logFilePath = path.join(jobDir, 'job.log');
      fs.writeFileSync(logFilePath, job.logs.join('\n') + '\n');

      // Step 2: Voiceover Agent (TTS Synthesis)
      update({ status: 'generating_assets', progress: 25 });
      addLog('Step 2/5: Synthesizing voiceover audio tracks via TTS Provider...');
      const tTts0 = Date.now();

      manifest = await this.voiceoverAgent.processVoiceovers(manifest, workDir);

      job.metrics.ttsTimeSeconds = Number(((Date.now() - tTts0) / 1000).toFixed(2));
      const totalAudioSeconds = manifest.slides.reduce(
        (acc, s) => acc + (s.narration.durationSeconds || 0),
        0
      );
      addLog(
        `✅ Voiceovers synthesized in ${job.metrics.ttsTimeSeconds}s (Total audio duration: ${totalAudioSeconds.toFixed(1)}s).`
      );

      // Step 3: Visual Asset Agent (Image Generation)
      update({ progress: 50 });
      addLog('Step 3/5: Resolving visual slide assets & diagrams...');
      const tImg0 = Date.now();

      manifest = await this.imageAgent.processImages(manifest, workDir);

      job.metrics.imageTimeSeconds = Number(((Date.now() - tImg0) / 1000).toFixed(2));
      addLog(`✅ Visual assets prepared in ${job.metrics.imageTimeSeconds}s.`);

      // Step 4: Audio-Visual Sync & Timeline Construction
      update({ status: 'syncing', progress: 65 });
      addLog('Step 4/5: Computing dynamic audio-video timeline and frame sequences...');
      const tSync0 = Date.now();

      manifest = this.syncService.synchronizeTimeline(manifest);
      job.manifest = manifest;
      job.metrics.syncTimeSeconds = Number(((Date.now() - tSync0) / 1000).toFixed(2));
      job.metrics.totalFrames = manifest.totalDurationInFrames;

      addLog(
        `✅ Timeline synchronized: ${manifest.totalDurationInFrames} frames total (~${(
          manifest.totalDurationInFrames / (manifest.fps || 30)
        ).toFixed(1)}s at ${manifest.fps}fps).`
      );

      // Step 5: Remotion Rendering
      update({ status: 'rendering', progress: 70 });
      addLog('Step 5/5: Launching Remotion rendering engine...');
      const videoOutputPath = path.join(jobDir, `${manifest.id}.mp4`);

      const renderResult = await this.renderService.renderPresentation(
        manifest,
        videoOutputPath,
        (renderPercent) => {
          const overallProgress = 70 + Math.round((renderPercent / 100) * 28);
          update({ progress: Math.min(overallProgress, 99) });
        },
        (renderLog) => {
          addLog(`[Remotion] ${renderLog}`);
        }
      );

      job.metrics.renderTimeSeconds = renderResult.renderTimeSeconds;
      job.metrics.renderAvgFps = renderResult.avgFps;
      job.metrics.totalTimeSeconds = Number(((Date.now() - startTime) / 1000).toFixed(2));

      addLog(`🎉 Video render finished in ${renderResult.renderTimeSeconds}s (Avg ${renderResult.avgFps} fps).`);
      addLog(`📁 Final MP4: ${renderResult.outputPath || videoOutputPath}`);
      addLog(`🏁 Total pipeline duration: ${job.metrics.totalTimeSeconds}s.`);

      // Completed
      update({
        status: 'completed',
        progress: 100,
        videoPath: renderResult.outputPath || videoOutputPath,
      });

      return job;
    } catch (err: any) {
      addLog(`❌ Pipeline failed: ${err?.message || err}`);
      update({
        status: 'failed',
        error: err?.message || 'Unknown error occurred in pipeline',
      });
      throw err;
    }
  }
}
