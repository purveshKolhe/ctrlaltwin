import fs from 'fs';
import path from 'path';

export interface ImageResult {
  imageUrl: string;
  localPath: string;
}

export interface IImageProvider {
  generateImage(
    prompt: string,
    slideId: string,
    outputDir: string,
    options?: { width?: number; height?: number }
  ): Promise<ImageResult>;
}

/**
 * PollinationsImageProvider: Generates high quality medical and contextual visual
 * assets using the free Pollinations AI image generation API.
 */
export class PollinationsImageProvider implements IImageProvider {
  async generateImage(
    prompt: string,
    slideId: string,
    outputDir: string,
    options?: { width?: number; height?: number }
  ): Promise<ImageResult> {
    const fileName = `${slideId}_asset.jpg`;
    const localPath = path.join(outputDir, fileName);
    fs.mkdirSync(outputDir, { recursive: true });

    const width = options?.width || 1200;
    const height = options?.height || 800;

    // Enhance prompt for clean modern healthcare photography
    const cleanPrompt = prompt.replace(/[^\w\s,-]/g, ' ').trim();
    const enhancedPrompt = `${cleanPrompt}, professional healthcare medical photography, modern clean hospital clinic, natural daylight, high resolution`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Date.now() % 10000}`;

    try {
      console.log(`[PollinationsImageProvider] Fetching AI image for ${slideId} from Pollinations...`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const res = await fetch(pollinationsUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(localPath, buffer);
        console.log(`[PollinationsImageProvider] Saved image for ${slideId} (${buffer.length} bytes)`);

        // Convert to data URI for zero-latency, sandbox-safe Remotion rendering
        const base64Data = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        return {
          imageUrl: base64Data,
          localPath,
        };
      } else {
        console.warn(`[PollinationsImageProvider] Pollinations returned HTTP ${res.status}`);
      }
    } catch (err: any) {
      console.warn(`[PollinationsImageProvider] Warning: could not download image (${err.message}). Using fallback.`);
    }

    // Fallback: Curated high-res medical Unsplash photography
    const fallbackUrls = [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    ];
    const fallbackUrl = fallbackUrls[Math.abs(slideId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % fallbackUrls.length];

    return {
      imageUrl: fallbackUrl,
      localPath: fallbackUrl,
    };
  }
}

/**
 * MockImageProvider: Generates a high-resolution styled SVG visual asset locally.
 */
export class MockImageProvider implements IImageProvider {
  async generateImage(
    prompt: string,
    slideId: string,
    outputDir: string
  ): Promise<ImageResult> {
    const fileName = `${slideId}_asset.svg`;
    const localPath = path.join(outputDir, fileName);

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" rx="24" fill="url(#bg-grad)"/>
  <text x="400" y="300" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="20" text-anchor="middle">
    ${prompt.slice(0, 40)}
  </text>
</svg>`;

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(localPath, svgContent, 'utf-8');

    return {
      imageUrl: localPath,
      localPath,
    };
  }
}

/**
 * Factory function to retrieve the configured image provider.
 * Defaults to PollinationsImageProvider.
 */
export function getImageProvider(): IImageProvider {
  const providerType = process.env.IMAGE_PROVIDER || 'pollinations';
  switch (providerType) {
    case 'mock':
      return new MockImageProvider();
    case 'pollinations':
    default:
      return new PollinationsImageProvider();
  }
}
