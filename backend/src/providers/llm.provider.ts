import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import { PresentationManifest, PresentationManifestSchema } from '../types/presentation';

export interface ScriptGenerationOptions {
  templateId?: string;
  targetSlideCount?: number;
  pdfPath?: string;
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
    const cleanPrompt = prompt.trim() || 'Visual Presentation Analysis';
    const id = `pres-${Date.now()}`;

    const manifest: PresentationManifest = {
      id,
      topic: cleanPrompt,
      title: cleanPrompt.length > 50 ? `${cleanPrompt.slice(0, 47)}...` : cleanPrompt,
      templateId,
      fps: 30,
      width: 1920,
      height: 1080,
      totalDurationInFrames: 0,
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

    return PresentationManifestSchema.parse(manifest);
  }
}

/**
 * GeminiProvider: Uses Google AI Studio (Gemini 2.5 Flash / 1.5 Flash)
 * with multimodal capabilities, reading both text prompts and visual PDF documents directly.
 */
export class GeminiProvider implements ILLMProvider {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash') {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async generatePresentationScript(
    prompt: string,
    options?: ScriptGenerationOptions
  ): Promise<PresentationManifest> {
    const templateId = options?.templateId || 'tech-modern-dark';
    const targetSlideCount = options?.targetSlideCount || 5;
    const presId = `pres-${Date.now()}`;

    const systemPrompt = `You are an expert presentation designer and video director.
Your task is to transform the user's input (and any attached PDF document) into a structured presentation video script.

IMPORTANT GUIDELINES:
1. SEPARATION OF CONCERNS:
   - visual: Contains crisp, concise, high-impact titles, subtitles, bullet points, charts, or quotes.
   - narration.script: Contains natural, conversational spoken prose for a voiceover actor / TTS engine.
   - If a slide visual contains equations (e.g. E = mc^2) or symbols, the narration.script MUST spell them out phonetically (e.g., "E equals m c squared"). Do not put raw mathematical formulas or symbols in narration.script.

2. SLIDE TYPES TO USE:
   - 'title': Opening slide with title, subtitle, and badge.
   - 'bullet-list': 3-4 bullet takeaways.
   - 'stat-chart': Visual metrics or bar chart comparisons (specify chartData or metrics).
   - 'image-content': Explains a visual diagram or concept, with an imagePrompt describing the scene.
   - 'quote': Memorable takeaway or conclusion quote with author.

3. PDF VISUAL UNDERSTANDING:
   - If a PDF is attached, analyze it VISUALLY (charts, diagrams, figures, layout, tables, key findings) as well as its text.
   - Extract key insights, statistics, and conclusions from the PDF into appropriate visual slides.

Return ONLY a valid JSON object with this exact structure:
{
  "id": "${presId}",
  "topic": "topic summary",
  "title": "presentation title",
  "templateId": "${templateId}",
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "totalDurationInFrames": 0,
  "slides": [
    {
      "id": "${presId}-slide-1",
      "type": "title",
      "visual": {
        "title": "...",
        "subtitle": "...",
        "badge": "..."
      },
      "narration": {
        "script": "spoken voiceover text..."
      }
    }
    // ... between 4 and ${targetSlideCount} slides
  ]
}`;

    const contents: any[] = [];

    // If PDF is provided, attach it as visual inlineData for Gemini
    if (options?.pdfPath && fs.existsSync(options.pdfPath)) {
      const pdfBuffer = fs.readFileSync(options.pdfPath);
      contents.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBuffer.toString('base64'),
        },
      });
      contents.push({
        text: `Analyze the attached PDF visually and textually. Based on its content, generate a presentation video script following the requested structure. User additional notes: ${prompt || 'Summarize key insights'}`,
      });
    } else {
      contents.push({
        text: `Topic / Request: ${prompt}\nGenerate a presentation video script with ~${targetSlideCount} slides following the requested structure.`,
      });
    }

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (err) {
      console.error('Failed to parse Gemini response as JSON:', responseText);
      throw new Error('Gemini did not return valid JSON');
    }

    // Ensure id and templateId
    parsed.id = parsed.id || presId;
    parsed.templateId = parsed.templateId || templateId;

    return PresentationManifestSchema.parse(parsed);
  }
}

/**
 * Factory function to retrieve the configured LLM provider
 */
export function getLLMProvider(): ILLMProvider {
  const providerType = process.env.LLM_PROVIDER || 'gemini';
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (providerType === 'gemini' && geminiApiKey && geminiApiKey.trim().length > 0) {
    return new GeminiProvider(geminiApiKey.trim());
  }

  if (providerType === 'gemini') {
    console.warn(
      '[LLM Provider] GEMINI_API_KEY is not set in .env. Falling back to MockLLMProvider for offline testing.'
    );
  }

  return new MockLLMProvider();
}
