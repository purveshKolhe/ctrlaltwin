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
 * PollinationsImageProvider: Generates high quality visual assets using
 * the free Pollinations AI image generation API.
 * All images are converted to local Base64 Data URIs so Remotion renders
 * instantaneously without network latency or delayRender timeouts.
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

    const cleanPrompt = prompt.replace(/[^\w\s,-]/g, ' ').trim();
    const enhancedPrompt = `${cleanPrompt}, professional editorial photography, cinematic lighting, modern clean presentation visual, high resolution, 4k`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;

    try {
      console.log(`[PollinationsImageProvider] Fetching AI image for ${slideId} ("${prompt.slice(0, 45)}...")...`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const res = await fetch(pollinationsUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(localPath, buffer);
        console.log(`[PollinationsImageProvider] ✅ Saved image for ${slideId} (${buffer.length} bytes)`);

        const base64Data = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        return {
          imageUrl: base64Data,
          localPath,
        };
      } else {
        console.warn(`[PollinationsImageProvider] Pollinations returned HTTP ${res.status}`);
      }
    } catch (err: any) {
      console.warn(`[PollinationsImageProvider] Warning: could not download image (${err.message}). Using local high-res visual fallback.`);
    }

    // Local Data URI fallback: Sleek modern presentation graphic matching topic
    const svgFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#091736" />
      <stop offset="50%" stop-color="#0d276b" />
      <stop offset="100%" stop-color="#050d24" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.2" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <circle cx="${width * 0.5}" cy="${height * 0.45}" r="${Math.min(width, height) * 0.28}" fill="url(#accent)" />
  <text x="${width * 0.5}" y="${height * 0.85}" fill="#ffffff" opacity="0.85" font-family="system-ui, sans-serif" font-size="24" font-weight="600" text-anchor="middle">
    ${cleanPrompt.slice(0, 48)}
  </text>
</svg>`;

    const fallbackBase64 = `data:image/svg+xml;base64,${Buffer.from(svgFallback).toString('base64')}`;
    return {
      imageUrl: fallbackBase64,
      localPath,
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

    const base64Data = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    return {
      imageUrl: base64Data,
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
