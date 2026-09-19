import path from 'path';
import { getImageProvider, IImageProvider } from '../providers/image.provider.js';
import { PresentationManifest, SlideData } from '../types/presentation.js';

export class ImageAgent {
  private imageProvider: IImageProvider;

  constructor(imageProvider?: IImageProvider) {
    this.imageProvider = imageProvider || getImageProvider();
  }

  /**
   * Identifies slides requiring visuals, generates assets, and binds the image path.
   */
  async processImages(
    manifest: PresentationManifest,
    outputBaseDir: string
  ): Promise<PresentationManifest> {
    const imagesDir = path.join(outputBaseDir, manifest.id, 'images');

    const updatedSlides: SlideData[] = [];

    for (const slide of manifest.slides) {
      if (slide.visual.imagePrompt && !slide.visual.imageUrl) {
        const result = await this.imageProvider.generateImage(
          slide.visual.imagePrompt,
          slide.id,
          imagesDir
        );

        updatedSlides.push({
          ...slide,
          visual: {
            ...slide.visual,
            imageUrl: result.imageUrl,
          },
        });
      } else {
        updatedSlides.push(slide);
      }
    }

    return {
      ...manifest,
      slides: updatedSlides,
    };
  }
}
