import path from 'path';
import { getTTSProvider, ITTSProvider } from '../providers/tts.provider.js';
import { PresentationManifest, SlideData } from '../types/presentation.js';

export class VoiceoverAgent {
  private ttsProvider: ITTSProvider;

  constructor(ttsProvider?: ITTSProvider) {
    this.ttsProvider = ttsProvider || getTTSProvider();
  }

  /**
   * Normalizes text for speech synthesis:
   * Expands common mathematical symbols, abbreviations, and equations to spoken words.
   */
  normalizeTextForSpeech(rawText: string): string {
    let text = rawText;

    // Common math & symbols
    text = text.replace(/E\s*=\s*mc\^?2/gi, 'E equals m c squared');
    text = text.replace(/%/g, ' percent');
    text = text.replace(/&/g, ' and ');
    text = text.replace(/\+/g, ' plus ');
    text = text.replace(/=/g, ' equals ');
    text = text.replace(/\$/g, ' dollars ');
    text = text.replace(/#/g, ' number ');
    text = text.replace(/@/g, ' at ');
    text = text.replace(/°C/g, ' degrees Celsius');
    text = text.replace(/°F/g, ' degrees Fahrenheit');

    // Common abbreviations
    text = text.replace(/\bYoY\b/g, 'year over year');
    text = text.replace(/\bMoM\b/g, 'month over month');
    text = text.replace(/\bQ([1-4])\b/g, 'Quarter $1');
    text = text.replace(/\bAI\b/g, 'A I');
    text = text.replace(/\bAPI\b/g, 'A P I');
    text = text.replace(/\bUI\b/g, 'U I');
    text = text.replace(/\bUX\b/g, 'U X');

    // Collapse multiple spaces
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Processes all slides in a manifest: normalizes script, synthesizes audio,
   * and populates audioPath and durationSeconds.
   */
  async processVoiceovers(
    manifest: PresentationManifest,
    outputBaseDir: string
  ): Promise<PresentationManifest> {
    const audioDir = path.join(outputBaseDir, manifest.id, 'audio');

    const updatedSlides: SlideData[] = [];

    for (const slide of manifest.slides) {
      // Normalize narration text for clear speech
      const normalizedScript = this.normalizeTextForSpeech(slide.narration.script);

      // Synthesize audio
      const result = await this.ttsProvider.synthesizeSpeech(
        normalizedScript,
        slide.id,
        audioDir
      );

      updatedSlides.push({
        ...slide,
        narration: {
          ...slide.narration,
          script: normalizedScript,
          audioPath: result.audioPath,
          durationSeconds: result.durationSeconds,
        },
      });
    }

    return {
      ...manifest,
      slides: updatedSlides,
    };
  }
}
