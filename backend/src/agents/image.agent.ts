import path from 'path';
import { getImageProvider, IImageProvider } from '../providers/image.provider.js';
import { PresentationManifest, SlideData } from '../types/presentation.js';

export class ImageAgent {
  private imageProvider: IImageProvider;

  constructor(imageProvider?: IImageProvider) {
    this.imageProvider = imageProvider || getImageProvider();
  }

  /**
   * Identifies slides requiring visuals and generates AI assets via Pollinations in parallel.
   */
  async processImages(
    manifest: PresentationManifest,
    outputBaseDir: string
  ): Promise<PresentationManifest> {
    const imagesDir = path.join(outputBaseDir, manifest.id, 'images');

    const imagePromises = manifest.slides.map(async (slide): Promise<SlideData> => {
      const needsImage =
        slide.type === 'two-column' ||
        slide.type === 'image-content' ||
        slide.type === 'stat-highlight' ||
        slide.type === 'stat-chart';

      let updatedSlide = { ...slide };

      if (!slide.visual.imageUrl && (slide.visual.imagePrompt || needsImage)) {
        const prompt =
          slide.visual.imagePrompt ||
          `${manifest.topic || manifest.title}: ${slide.visual.title}`;

        const isPortrait = slide.type === 'two-column' || slide.type === 'stat-highlight';
        try {
          const result = await this.imageProvider.generateImage(
            prompt,
            slide.id,
            imagesDir,
            { width: isPortrait ? 800 : 1200, height: isPortrait ? 1200 : 800 }
          );

          updatedSlide = {
            ...updatedSlide,
            visual: {
              ...updatedSlide.visual,
              imageUrl: result.imageUrl,
            },
          };
        } catch (err) {
          console.warn(`[ImageAgent] Could not generate primary image for slide ${slide.id}:`, err);
        }
      }

      // If image-content requires dual images, generate the secondary image as well
      if (slide.type === 'image-content' && !slide.visual.secondaryImageUrl) {
        try {
          const secondaryPrompt = `${manifest.topic || manifest.title}: ${slide.visual.title} detail perspective`;
          const secondaryResult = await this.imageProvider.generateImage(
            secondaryPrompt,
            `${slide.id}-sec`,
            imagesDir,
            { width: 1200, height: 800 }
          );

          updatedSlide = {
            ...updatedSlide,
            visual: {
              ...updatedSlide.visual,
              secondaryImageUrl: secondaryResult.imageUrl,
            },
          };
        } catch (err) {
          console.warn(`[ImageAgent] Could not generate secondary image for slide ${slide.id}:`, err);
        }
      }

      return updatedSlide;
    });

    const updatedSlides = await Promise.all(imagePromises);

    return {
      ...manifest,
      slides: updatedSlides,
    };
  }
}
