import path from 'path';
import { ImageAgent } from './agents/image.agent.js';
import { OrchestratorAgent } from './agents/orchestrator.agent.js';
import { VoiceoverAgent } from './agents/voiceover.agent.js';
import { RenderService } from './services/render.service.js';
import { SyncService } from './services/sync.service.js';
import { PresentationManifest } from './types/presentation.js';

export interface GenerationJob {
  id: string;
  prompt: string;
  status: 'pending' | 'orchestrating' | 'generating_assets' | 'syncing' | 'rendering' | 'completed' | 'failed';
  progress: number;
  templateId?: string;
  manifest?: PresentationManifest;
  videoPath?: string;
  error?: string;
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
   * Executes the full generation pipeline end-to-end.
   */
  async execute(
    job: GenerationJob,
    workDir: string,
    onStatusUpdate?: (job: GenerationJob) => void
  ): Promise<GenerationJob> {
    const update = (patch: Partial<GenerationJob>) => {
      Object.assign(job, patch, { updatedAt: new Date() });
      if (onStatusUpdate) {
        onStatusUpdate(job);
      }
    };

    try {
      // Step 1: Orchestrator generates presentation script
      update({ status: 'orchestrating', progress: 10 });
      let manifest = await this.orchestrator.generatePresentation(job.prompt, {
        templateId: job.templateId,
      });

      // Step 2: Voiceover & TTS generation
      update({ status: 'generating_assets', progress: 30 });
      manifest = await this.voiceoverAgent.processVoiceovers(manifest, workDir);

      // Step 3: Visual asset / image generation
      update({ progress: 50 });
      manifest = await this.imageAgent.processImages(manifest, workDir);

      // Step 4: Audio-visual timeline synchronization
      update({ status: 'syncing', progress: 65 });
      manifest = this.syncService.synchronizeTimeline(manifest);
      job.manifest = manifest;

      // Step 5: Remotion rendering
      update({ status: 'rendering', progress: 70 });
      const videoOutputPath = path.join(workDir, manifest.id, `${manifest.id}.mp4`);

      await this.renderService.renderPresentation(
        manifest,
        videoOutputPath,
        (renderPercent) => {
          const overallProgress = 70 + Math.round((renderPercent / 100) * 28);
          update({ progress: Math.min(overallProgress, 99) });
        }
      );

      // Completed
      update({
        status: 'completed',
        progress: 100,
        videoPath: videoOutputPath,
      });

      return job;
    } catch (err: any) {
      update({
        status: 'failed',
        error: err?.message || 'Unknown error occurred in pipeline',
      });
      throw err;
    }
  }
}
