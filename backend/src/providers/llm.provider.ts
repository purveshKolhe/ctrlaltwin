import { PresentationManifest, PresentationManifestSchema } from '../types/presentation.js';

export interface ScriptGenerationOptions {
  templateId?: string;
  targetSlideCount?: number;
}

export interface ILLMProvider {
  generatePresentationScript(
    prompt: string,
    options?: ScriptGenerationOptions
  ): Promise<PresentationManifest>;
}

/**
 * MockLLMProvider: Returns high-quality, fully structured presentation data
 * without needing an active API key, allowing offline development and testing.
 */
export class MockLLMProvider implements ILLMProvider {
  async generatePresentationScript(
    prompt: string,
    options?: ScriptGenerationOptions
  ): Promise<PresentationManifest> {
    const templateId = options?.templateId || 'tech-modern-dark';
    const cleanPrompt = prompt.trim();
    const id = `pres-${Date.now()}`;

    const manifest: PresentationManifest = {
      id,
      topic: cleanPrompt,
      title: cleanPrompt.length > 50 ? `${cleanPrompt.slice(0, 47)}...` : cleanPrompt,
      templateId,
      fps: 30,
      width: 1920,
      height: 1080,
      totalDurationInFrames: 0, // Will be computed dynamically by SyncService
      slides: [
        {
          id: `${id}-slide-1`,
          type: 'title',
          visual: {
            title: cleanPrompt,
            subtitle: 'A comprehensive technical overview and strategic perspective',
            badge: 'Keynote 2026',
          },
          narration: {
            script: `Welcome to our presentation on ${cleanPrompt}. Today we will explore the key ideas, current trends, and future trajectories.`,
          },
        },
        {
          id: `${id}-slide-2`,
          type: 'bullet-list',
          visual: {
            title: 'Core Fundamentals',
            subtitle: 'Essential principles and foundations you need to know',
            bullets: [
              'System architecture designed for high scalability and modularity',
              'Decoupled components enabling independent iteration and testing',
              'Real-time observability and telemetry throughout the pipeline',
            ],
          },
          narration: {
            script:
              'Let us begin with the core fundamentals. First, the architecture is built for high scalability. Second, decoupled components allow teams to move rapidly without regressions.',
          },
        },
        {
          id: `${id}-slide-3`,
          type: 'stat-chart',
          visual: {
            title: 'Performance & Benchmarks',
            subtitle: 'Measurable impact and performance evaluation metrics',
            metrics: [
              { label: 'Throughput', value: '4.8x', subtext: 'Compared to baseline' },
              { label: 'Latency', value: '18ms', subtext: 'Median p95 response' },
            ],
            chartData: [
              { label: 'Baseline', value: 24, color: '#64748b' },
              { label: 'Optimized', value: 72, color: '#818cf8' },
              { label: 'Next-Gen', value: 96, color: '#38bdf8' },
            ],
          },
          narration: {
            script:
              'Turning to the data, our performance benchmarks demonstrate a four point eight times improvement in throughput, while reducing p95 latency to eighteen milliseconds.',
          },
        },
        {
          id: `${id}-slide-4`,
          type: 'image-content',
          visual: {
            title: 'Visualizing The System',
            subtitle: 'How data flows between interconnected subsystems',
            bullets: [
              'Continuous feedback loop monitors execution health',
              'Edge nodes cache intermediate artifacts for low latency',
            ],
            imagePrompt: `High tech holographic visualization of ${cleanPrompt}, futuristic isometric perspective, glowing data streams, 8k resolution`,
          },
          narration: {
            script:
              'In this diagram, you can see how data flows through the system. Each edge node caches intermediate results, guaranteeing sub-second responsiveness.',
          },
        },
        {
          id: `${id}-slide-5`,
          type: 'quote',
          visual: {
            title: 'Conclusion',
            quote:
              'Simplicity is prerequisite for reliability. Complex systems work best when constructed from simple, verified parts.',
            author: 'Edsger W. Dijkstra',
          },
          narration: {
            script:
              'To conclude, as Edsger Dijkstra observed: Simplicity is prerequisite for reliability. Thank you for your time.',
          },
        },
      ],
    };

    // Validate against Zod schema
    return PresentationManifestSchema.parse(manifest);
  }
}

/**
 * Factory function to retrieve the configured LLM provider
 */
export function getLLMProvider(): ILLMProvider {
  const providerType = process.env.LLM_PROVIDER || 'mock';
  switch (providerType) {
    case 'mock':
    default:
      return new MockLLMProvider();
  }
}
