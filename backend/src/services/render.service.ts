import { bundle } from '@remotion/bundler';
import { renderFrames, selectComposition, stitchFramesToVideo } from '@remotion/renderer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { PresentationManifest, SlideData } from '../types/presentation';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RenderProgressCallback {
  (progressPercent: number): void;
}

export interface RenderResult {
  outputPath: string;
  renderTimeSeconds: number;
  avgFps: number;
  totalFrames: number;
}

/**
 * Calculates the exact animation duration in frames for each slide type
 * so animations finish completely and gracefully before freezing/duplicating.
 */
export function getSlideAnimationDurationInFrames(slide: SlideData): number {
  switch (slide.type) {
    case 'title':
      return 35; // ~1.17s @ 30fps
    case 'two-column':
      return 45; // ~1.5s @ 30fps
    case 'stat-highlight':
    case 'stat-chart':
      return 45; // ~1.5s @ 30fps
    case 'card-grid': {
      const cardCount = slide.visual.cards?.length || 3;
      return Math.min(70, Math.max(50, 15 + cardCount * 10 + 20)); // ~55–65 frames
    }
    case 'bullet-list': {
      const bulletCount = slide.visual.bullets?.length || 3;
      return Math.min(70, Math.max(50, 10 + bulletCount * 10 + 20)); // ~55–65 frames
    }
    case 'quote':
      return 45; // ~1.5s @ 30fps
    case 'image-content':
      return 45; // ~1.5s @ 30fps
    case 'conclusion':
      return 50; // ~1.67s @ 30fps
    default:
      return 45;
  }
}

/**
 * Converts local audio file paths to Base64 Data URIs so headless Chromium
 * in Remotion can load audio assets seamlessly without file:// protocol restrictions.
 */
function convertAudioToDataUri(audioPath?: string): string | undefined {
  if (!audioPath) return undefined;
  if (
    audioPath.startsWith('data:') ||
    audioPath.startsWith('http://') ||
    audioPath.startsWith('https://')
  ) {
    return audioPath;
  }
  const cleanPath = audioPath.replace(/^file:\/\//, '');
  if (fs.existsSync(cleanPath)) {
    const ext = path.extname(cleanPath).toLowerCase();
    const mime = ext === '.wav' ? 'audio/wav' : 'audio/mp3';
    const base64 = fs.readFileSync(cleanPath).toString('base64');
    return `data:${mime};base64,${base64}`;
  }
  return audioPath;
}

export class RenderService {
  private bundleLocation: string | null = null;

  /**
   * Caches or creates the Remotion bundle for fast rendering
   */
  async getBundle(): Promise<string> {
    if (this.bundleLocation) {
      return this.bundleLocation;
    }

    const entryPoint = path.resolve(__dirname, '../remotion/index.ts');
    this.bundleLocation = await bundle({
      entryPoint,
    });

    return this.bundleLocation;
  }

  /**
   * Renders the synchronized presentation manifest into an MP4 video using
   * selective animation rendering + static frame duplication + ultrafast encoding.
   * This reduces Chromium rendering work by 60–80% while keeping all animations intact.
   */
  async renderPresentation(
    manifest: PresentationManifest,
    outputPath: string,
    onProgress?: RenderProgressCallback,
    onLog?: (msg: string) => void
  ): Promise<RenderResult> {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const log = (msg: string) => {
      console.log(`[RenderService] ${msg}`);
      if (onLog) onLog(msg);
    };

    const t0 = Date.now();
    log('Preparing Remotion Webpack bundle...');
    const serveUrl = await this.getBundle();
    const tBundle = ((Date.now() - t0) / 1000).toFixed(2);
    log(`Webpack bundle ready in ${tBundle}s`);

    // Prepare manifest with Data URI audio for Chromium compatibility
    const manifestForRendering: PresentationManifest = {
      ...manifest,
      slides: manifest.slides.map((s) => ({
        ...s,
        narration: {
          ...s.narration,
          audioPath: convertAudioToDataUri(s.narration.audioPath),
        },
      })),
    };

    const composition = await selectComposition({
      serveUrl,
      id: 'MainPresentation',
      inputProps: { manifest: manifestForRendering },
    });

    const totalFrames = composition.durationInFrames;
    log(
      `Selected composition "${composition.id}": ${totalFrames} frames (~${(
        totalFrames / composition.fps
      ).toFixed(1)}s) @ ${composition.fps}fps, ${composition.width}x${composition.height}`
    );

    // Calculate per-slide animation frames and build the selective render list
    let currentFrame = 0;
    const framesToRender: number[] = [];
    const slideSchedules: Array<{
      slideIndex: number;
      type: string;
      startFrame: number;
      duration: number;
      animFrames: number;
      lastAnimFrame: number;
    }> = [];

    for (let i = 0; i < manifest.slides.length; i++) {
      const slide = manifest.slides[i];
      const duration =
        slide.narration.durationInFrames ||
        (slide.narration.durationSeconds
          ? Math.ceil(slide.narration.durationSeconds * (manifest.fps || 30))
          : 150);

      const animFrames = Math.min(getSlideAnimationDurationInFrames(slide), duration);
      const startFrame = currentFrame;
      const lastAnimFrame = startFrame + animFrames - 1;

      slideSchedules.push({
        slideIndex: i,
        type: slide.type,
        startFrame,
        duration,
        animFrames,
        lastAnimFrame,
      });

      for (let f = startFrame; f <= lastAnimFrame; f++) {
        framesToRender.push(f);
      }

      currentFrame += duration;
    }

    const savedFrames = totalFrames - framesToRender.length;
    const savingsPercent = Math.round((savedFrames / totalFrames) * 100);
    log(
      `Selective Frame Optimization: Rendering ${framesToRender.length} animation frames (Skipping ${savedFrames} static frames = ${savingsPercent}% render reduction!)`
    );
    slideSchedules.forEach((s) => {
      log(
        `   Slide ${s.slideIndex + 1} [${s.type}]: render frames ${s.startFrame}..${s.lastAnimFrame} (${s.animFrames} frames), duplicate ${s.duration - s.animFrames} static frames`
      );
    });

    const optimalConcurrency = Math.min(4, Math.max(1, Math.floor(os.cpus().length / 2)));
    log(`Spawning ${optimalConcurrency} parallel Chromium workers (Host CPU cores: ${os.cpus().length})`);

    const outputDir = path.join(path.dirname(outputPath), `render-frames-${Date.now()}`);
    fs.mkdirSync(outputDir, { recursive: true });

    const tRenderStart = Date.now();
    let lastLoggedPercent = -1;

    try {
      // Step 1: Render active animation frames only
      const { assetsInfo } = await renderFrames({
        composition,
        serveUrl,
        inputProps: { manifest: manifestForRendering },
        outputDir,
        frames: framesToRender,
        imageFormat: 'jpeg',
        jpegQuality: 85,
        concurrency: optimalConcurrency,
        onStart: () => {},
        onFrameUpdate: (rendered) => {
          const percent = Math.round((rendered / framesToRender.length) * 70);
          if (onProgress) onProgress(percent);
          if (percent % 20 === 0 && percent !== lastLoggedPercent) {
            lastLoggedPercent = percent;
            log(`Chromium rendering active frames: ${percent}%`);
          }
        },
      });

      const tAnimRendered = ((Date.now() - tRenderStart) / 1000).toFixed(2);
      log(`Active animation frames rendered in ${tAnimRendered}s`);

      // Helper to format frame filename according to Remotion's imageSequenceName pattern
      const getFramePath = (frameIndex: number) => {
        return assetsInfo.imageSequenceName.replace(/%0?(\d*)d/, (_, width) => {
          return width ? String(frameIndex).padStart(Number(width), '0') : String(frameIndex);
        });
      };

      // Step 2: Duplicate last animated frame for the static duration of each slide
      const tCopyStart = Date.now();
      let copiedCount = 0;

      for (const schedule of slideSchedules) {
        const { startFrame, duration, animFrames, lastAnimFrame } = schedule;
        const lastFrameFile = getFramePath(lastAnimFrame);

        if (!fs.existsSync(lastFrameFile)) {
          log(`Warning: Frame ${lastFrameFile} not found for duplication.`);
          continue;
        }

        // Find the template frame asset from the rendered animation frames of this slide
        const templateFrameAsset = assetsInfo.assets.find((a) => a.frame === lastAnimFrame);

        for (let f = startFrame + animFrames; f < startFrame + duration; f++) {
          const targetFile = getFramePath(f);
          fs.copyFileSync(lastFrameFile, targetFile);

          // Propagate audio assets across static frames with updated frame & mediaFrame
          // so Remotion's audio timeline mixer maintains continuous voiceover playback!
          const audioAndVideoAssets = (templateFrameAsset?.audioAndVideoAssets || []).map((asset) => ({
            ...asset,
            frame: f,
            mediaFrame: f - startFrame,
          }));

          const inlineAudioAssets = (templateFrameAsset?.inlineAudioAssets || []).map((asset) => ({
            ...asset,
            frame: f,
          }));

          assetsInfo.assets.push({
            frame: f,
            audioAndVideoAssets,
            artifactAssets: [],
            inlineAudioAssets,
          });
          copiedCount++;
        }
      }

      // Sort assets by frame index ascending
      assetsInfo.assets.sort((a, b) => a.frame - b.frame);

      const tCopyEnd = ((Date.now() - tCopyStart) / 1000).toFixed(2);
      log(`Duplicated ${copiedCount} static frames in ${tCopyEnd}s`);

      // Step 3: Fast video stitching with ultrafast x264 preset
      log('Stitching frames and audio with x264 ultrafast preset...');
      const tStitchStart = Date.now();

      await stitchFramesToVideo({
        assetsInfo,
        fps: composition.fps,
        width: composition.width,
        height: composition.height,
        outputLocation: outputPath,
        x264Preset: 'ultrafast',
        crf: 22,
        enforceAudioTrack: true,
        onProgress: (stitchProgress) => {
          const overallPercent = 70 + Math.round(stitchProgress * 30);
          if (onProgress) onProgress(overallPercent);
        },
      });

      const tStitchEnd = ((Date.now() - tStitchStart) / 1000).toFixed(2);
      log(`Video stitching completed in ${tStitchEnd}s`);

      const totalRenderTime = Number(((Date.now() - tRenderStart) / 1000).toFixed(2));
      const avgFps = Number((totalFrames / (totalRenderTime || 1)).toFixed(1));

      log(
        `Render completed in ${totalRenderTime}s (Average ${avgFps} fps). Output file: ${outputPath}`
      );

      return {
        outputPath,
        renderTimeSeconds: totalRenderTime,
        avgFps,
        totalFrames,
      };
    } finally {
      // Clean up temporary frame directory
      try {
        fs.rmSync(outputDir, { recursive: true, force: true });
      } catch (_) {}
    }
  }
}
