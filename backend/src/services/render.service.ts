import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PresentationManifest } from '../types/presentation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RenderProgressCallback {
  (progressPercent: number): void;
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
   * Renders the synchronized presentation manifest into an MP4 video.
   */
  async renderPresentation(
    manifest: PresentationManifest,
    outputPath: string,
    onProgress?: RenderProgressCallback
  ): Promise<string> {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const serveUrl = await this.getBundle();

    const composition = await selectComposition({
      serveUrl,
      id: 'MainPresentation',
      inputProps: { manifest },
    });

    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { manifest },
      onProgress: ({ progress }) => {
        if (onProgress) {
          onProgress(Math.round(progress * 100));
        }
      },
    });

    return outputPath;
  }
}
