import fs from 'fs';
import path from 'path';
import { PresentationManifest, SlideData } from '../types/presentation';

export interface SyncOptions {
  paddingSeconds?: number; // Visual padding after audio finishes
  fallbackDurationSeconds?: number; // Used if slide has no audio
}

/**
 * Converts a local file path into a data URL so Remotion's headless browser
 * can load audio and images reliably without external web server routing.
 */
function fileToDataUrl(
  filePath?: string,
  defaultMime: string = 'application/octet-stream'
): string | undefined {
  if (!filePath) return undefined;
  if (
    filePath.startsWith('http://') ||
    filePath.startsWith('https://') ||
    filePath.startsWith('data:')
  ) {
    return filePath;
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    let mime = defaultMime;
    if (ext === '.wav') mime = 'audio/wav';
    else if (ext === '.mp3') mime = 'audio/mpeg';
    else if (ext === '.svg') mime = 'image/svg+xml';
    else if (ext === '.png') mime = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';

    const buffer = fs.readFileSync(filePath);
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }

  return filePath;
}

export class SyncService {
  /**
   * Synchronizes slide visual duration with voiceover audio duration
   * and prepares local assets as browser-safe data URLs.
   */
  synchronizeTimeline(
    manifest: PresentationManifest,
    options?: SyncOptions
  ): PresentationManifest {
    const fps = manifest.fps || 30;
    const padding = options?.paddingSeconds ?? 0.6; // 0.6 seconds buffer
    const fallback = options?.fallbackDurationSeconds ?? 5.0;

    let totalFrames = 0;

    const synchronizedSlides: SlideData[] = manifest.slides.map((slide) => {
      const audioSeconds = slide.narration.durationSeconds;
      const totalSeconds = audioSeconds ? audioSeconds + padding : fallback;
      const durationInFrames = Math.ceil(totalSeconds * fps);

      totalFrames += durationInFrames;

      const resolvedAudio = fileToDataUrl(slide.narration.audioPath, 'audio/wav');
      const resolvedImage = fileToDataUrl(slide.visual.imageUrl, 'image/svg+xml');

      return {
        ...slide,
        visual: {
          ...slide.visual,
          imageUrl: resolvedImage,
        },
        narration: {
          ...slide.narration,
          audioPath: resolvedAudio,
          durationInFrames,
        },
      };
    });

    return {
      ...manifest,
      totalDurationInFrames: totalFrames,
      slides: synchronizedSlides,
    };
  }
}
