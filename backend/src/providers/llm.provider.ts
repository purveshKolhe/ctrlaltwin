import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import Groq from 'groq-sdk';
import { PDFParse } from 'pdf-parse';
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
 * Sanitizes and normalizes LLM outputs so slight deviations (missing titles on quote slides,
 * object chartData vs array) are corrected before strict schema validation.
 */
function normalizeManifest(raw: any, presId: string, templateId: string): any {
  const manifest = { ...raw };
  manifest.id = manifest.id || presId;
  manifest.templateId = manifest.templateId || templateId;
  manifest.fps = manifest.fps || 30;
  manifest.width = manifest.width || 1920;
  manifest.height = manifest.height || 1080;
  manifest.topic = manifest.topic || manifest.title || 'Presentation';
  manifest.title = manifest.title || manifest.topic || 'Presentation';

  if (!Array.isArray(manifest.slides)) {
    manifest.slides = [];
  }

  manifest.slides = manifest.slides.map((slide: any, idx: number) => {
    const s = { ...slide };
    s.id = s.id || `${presId}-slide-${idx + 1}`;

    const validTypes = [
      'title',
      'two-column',
      'card-grid',
      'bullet-list',
      'stat-chart',
      'image-content',
      'quote',
      'conclusion',
    ];
    s.type = validTypes.includes(s.type) ? s.type : (idx === 0 ? 'title' : 'two-column');

    s.visual = s.visual || {};
    s.visual.title = s.visual.title || s.visual.quote || s.visual.subtitle || `Key Insights ${idx + 1}`;

    // Normalize cards: if array, ensure title and description
    if (Array.isArray(s.visual.cards)) {
      s.visual.cards = s.visual.cards.map((c: any, cIdx: number) => ({
        title: typeof c === 'string' ? c : (c.title || `Pillar 0${cIdx + 1}`),
        description: typeof c === 'string' ? '' : (c.description || c.text || ''),
        tag: c.tag || undefined,
        icon: c.icon || undefined,
      }));
    }

    // Normalize highlightCard: ensure title exists
    if (s.visual.highlightCard && typeof s.visual.highlightCard === 'object') {
      s.visual.highlightCard = {
        title: s.visual.highlightCard.title || 'Key Highlight',
        subtitle: s.visual.highlightCard.subtitle || undefined,
        stat: s.visual.highlightCard.stat || undefined,
        text: s.visual.highlightCard.text || undefined,
      };
    }

    // Normalize chartData: if object, convert to array
    if (s.visual.chartData && typeof s.visual.chartData === 'object' && !Array.isArray(s.visual.chartData)) {
      s.visual.chartData = Object.entries(s.visual.chartData).map(([label, value]) => ({
        label,
        value: typeof value === 'number' ? value : Number(value) || 0,
      }));
    }

    // Normalize metrics: if object, convert to array
    if (s.visual.metrics && typeof s.visual.metrics === 'object' && !Array.isArray(s.visual.metrics)) {
      s.visual.metrics = Object.entries(s.visual.metrics).map(([label, value]) => ({
        label,
        value: String(value),
      }));
    }

    s.narration = s.narration || {};
    s.narration.script =
      s.narration.script ||
      s.visual.subtitle ||
      s.visual.title ||
      'In this section, we review the key findings.';

    return s;
  });

  return manifest;
}

/**
 * GroqProvider: Uses Groq Cloud with fast inference models like qwen/qwen3.8-27b.
 */
export class GroqProvider implements ILLMProvider {
  private groq: Groq;
  private model: string;

  constructor(
    apiKey: string,
    model: string = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b'
  ) {
    this.groq = new Groq({ apiKey });
    this.model = model;
  }

  async generatePresentationScript(
    prompt: string,
    options?: ScriptGenerationOptions
  ): Promise<PresentationManifest> {
    const templateId = options?.templateId || 'healthcare-modern-blue';
    const targetSlideCount = options?.targetSlideCount || 5;
    const presId = `pres-${Date.now()}`;

    let userContent = `Topic / Request: ${prompt || 'Create presentation from attached content'}\nTarget slide count: ~${targetSlideCount} slides.`;

    // If PDF is attached, parse its text and structure
    if (options?.pdfPath && fs.existsSync(options.pdfPath)) {
      try {
        const pdfBuffer = fs.readFileSync(options.pdfPath);
        const parser = new PDFParse(new Uint8Array(pdfBuffer));
        const parsed = await parser.getText();
        const extractedText = parsed.text?.trim() || '';
        userContent += `\n\n--- EXTRACTED CONTENT FROM ATTACHED PDF DOCUMENT ---\n${extractedText.slice(0, 35000)}\n--- END OF ATTACHED DOCUMENT ---`;
      } catch (err) {
        console.warn('[GroqProvider] Could not extract text from PDF:', err);
      }
    }

    const systemPrompt = `You are an expert presentation designer and video director.
Your task is to transform the user's input (and any attached document content) into a concise, high-impact presentation video script with rich slide layout variety.

IMPORTANT GUIDELINES:
1. SLIDE VARIETY & NARRATIVE PACING:
   - Create 4 to 5 slides tailored to the topic. Do NOT use the same generic slide sequence for every presentation.
   - Dynamically select from these 8 layout types:
     * 'title': Opening slide with title, subtitle, and badge (e.g., "Borcelle Hospital", "Keynote 2026").
     * 'two-column': Left column narrative context + Right column clinical highlight card (with stat like "98% Accuracy" and title/text).
     * 'card-grid': 3 feature or service cards (cards: [{ title, description, tag }]).
     * 'stat-chart': Visual metrics or bar chart (metrics: [{ label, value, subtext }], chartData: [{ label, value }]).
     * 'bullet-list': 3 concise bullet points (under 10 words each).
     * 'image-content': Explaining a visual concept with an imagePrompt.
     * 'quote': Memorable testimonial, philosophy, or clinical quote with author.
     * 'conclusion': "Thank You" closing slide with summary badge and footerText.
   - Example diverse sequences:
     - Sequence A: 'title' -> 'two-column' -> 'card-grid' -> 'stat-chart' -> 'conclusion'
     - Sequence B: 'title' -> 'card-grid' -> 'two-column' -> 'quote' -> 'conclusion'
     - Sequence C: 'title' -> 'two-column' -> 'stat-chart' -> 'bullet-list' -> 'conclusion'

2. CONCISENESS (CRITICAL FOR TOKEN LIMITS):
   - Visual text: brief, punchy phrases.
   - Narration script: exactly 1 to 2 spoken sentences per slide. Do not write long paragraphs.

3. SEPARATION OF CONCERNS:
   - visual: On-screen titles, bullets, cards, metrics, or charts.
   - narration.script: Natural, conversational spoken prose for a voiceover actor. If visual contains equations or symbols, spell them out phonetically.

Return ONLY a valid JSON object matching this structure (no markdown formatting):
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
  ]
}`;

    const maxTokens = Number(process.env.GROQ_MAX_TOKENS) || 950;

    const completion = await this.groq.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      max_tokens: maxTokens,
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse Groq response as JSON:', content);
      throw new Error('Groq did not return valid JSON');
    }

    const normalized = normalizeManifest(parsed, presId, templateId);
    return PresentationManifestSchema.parse(normalized);
  }
}

/**
 * GeminiProvider: Uses Google AI Studio (Gemini 2.5 Flash / 1.5 Flash)
 */
export class GeminiProvider implements ILLMProvider {
  private ai: GoogleGenAI;
  private model: string;

  constructor(
    apiKey: string,
    model: string = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  ) {
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
   - If a slide visual contains equations (e.g. E = mc^2) or symbols, the narration.script MUST spell them out phonetically.

2. SLIDE TYPES TO USE:
   - 'title': Opening slide with title, subtitle, and badge.
   - 'bullet-list': 3-4 bullet takeaways.
   - 'stat-chart': Visual metrics or bar chart comparisons (specify chartData or metrics).
   - 'image-content': Explains a visual diagram or concept, with an imagePrompt.
   - 'quote': Memorable takeaway or conclusion quote with author.

Return ONLY a valid JSON object matching the PresentationManifest structure.`;

    const contents: any[] = [];

    if (options?.pdfPath && fs.existsSync(options.pdfPath)) {
      const pdfBuffer = fs.readFileSync(options.pdfPath);
      contents.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBuffer.toString('base64'),
        },
      });
      contents.push({
        text: `Analyze the attached PDF visually and textually. Generate a presentation video script with ~${targetSlideCount} slides. User notes: ${prompt || 'Summarize key insights'}`,
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

    const normalized = normalizeManifest(parsed, presId, templateId);
    return PresentationManifestSchema.parse(normalized);
  }
}

/**
 * Factory function to retrieve the configured LLM provider
 */
export function getLLMProvider(): ILLMProvider {
  const providerType = process.env.LLM_PROVIDER || 'groq';
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // 1. Groq Cloud (Qwen 3.8 27B)
  if (
    (providerType === 'groq' || groqApiKey) &&
    groqApiKey &&
    groqApiKey.trim().length > 0
  ) {
    const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
    return new GroqProvider(groqApiKey.trim(), model);
  }

  // 2. Google AI Studio (Gemini)
  if (providerType === 'gemini' && geminiApiKey && geminiApiKey.trim().length > 0) {
    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    return new GeminiProvider(geminiApiKey.trim(), model);
  }

  if (providerType === 'groq') {
    console.warn(
      '[LLM Provider] GROQ_API_KEY is not set in .env. Falling back to MockLLMProvider for offline testing.'
    );
  }

  return new MockLLMProvider();
}
