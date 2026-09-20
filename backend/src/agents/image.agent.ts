import path from 'path';
import { getImageProvider, IImageProvider } from '../providers/image.provider.js';
import { PresentationManifest, SlideData } from '../types/presentation.js';

export class ImageAgent {
  private imageProvider: IImageProvider;

  constructor(imageProvider?: IImageProvider) {
    this.imageProvider = imageProvider || getImageProvider();
  }

  /**
   * Identifies slides requiring visuals, generates AI assets via Pollinations, and binds the image path.
   */
  async processImages(
    manifest: PresentationManifest,
    outputBaseDir: string
  ): Promise<PresentationManifest> {
    const imagesDir = path.join(outputBaseDir, manifest.id, 'images');

    const updatedSlides: SlideData[] = [];

    for (const slide of manifest.slides) {
      const needsImage =
        slide.type === 'two-column' ||
        slide.type === 'image-content' ||
        slide.type === 'stat-highlight' ||
        slide.type === 'stat-chart';

      if (!slide.visual.imageUrl && (slide.visual.imagePrompt || needsImage)) {
        const prompt =
          slide.visual.imagePrompt ||
          `${slide.visual.title}, ${slide.visual.subtitle || 'healthcare medical care'}`;

        const isPortrait = slide.type === 'two-column' || slide.type === 'stat-highlight';
        try {
          const result = await this.imageProvider.generateImage(
            prompt,
            slide.id,
            imagesDir,
            { width: isPortrait ? 800 : 1200, height: isPortrait ? 1200 : 800 }
          );

          updatedSlides.push({
            ...slide,
            visual: {
              ...slide.visual,
              imageUrl: result.imageUrl,
            },
          });
        } catch (err) {
          console.warn(`[ImageAgent] Could not generate image for slide ${slide.id}:`, err);
          updatedSlides.push(slide);
        }
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
