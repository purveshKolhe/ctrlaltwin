import fs from 'fs';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import path from 'path';

export interface TTSOptions {
  voice?: string;
  speed?: number;
}

export interface TTSResult {
  audioPath: string;
  durationSeconds: number;
}

export interface ITTSProvider {
  synthesizeSpeech(
    text: string,
    slideId: string,
    outputDir: string,
    options?: TTSOptions
  ): Promise<TTSResult>;
}

/**
 * Creates a valid PCM 44.1kHz 16-bit mono WAV file with silence/soft tone
 * to serve as a realistic audio mock when no network/API is available.
 */
function createMockWavFile(filePath: string, durationSeconds: number): void {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * 440 * t) * 0.05 * 32767;
    buffer.writeInt16LE(Math.floor(sample), offset);
    offset += 2;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

/**
 * MockTTSProvider: Synthesizes speech locally by estimating duration from word count.
 */
export class MockTTSProvider implements ITTSProvider {
  async synthesizeSpeech(
    text: string,
    slideId: string,
    outputDir: string,
    _options?: TTSOptions
  ): Promise<TTSResult> {
    const wordCount = text.trim().split(/\s+/).length;
    const estimatedDuration = Math.max(3.5, Number((wordCount / 2.5).toFixed(2)));

    const fileName = `${slideId}_voiceover.wav`;
    const audioPath = path.join(outputDir, fileName);

    createMockWavFile(audioPath, estimatedDuration);

    return {
      audioPath,
      durationSeconds: estimatedDuration,
    };
  }
}

/**
 * EdgeTTSProvider: Uses Microsoft Edge TTS (free, high quality, no API key required).
 */
export class EdgeTTSProvider implements ITTSProvider {
  private defaultVoice: string;

  constructor(defaultVoice: string = 'en-US-ChristopherNeural') {
    this.defaultVoice = defaultVoice;
  }

  async synthesizeSpeech(
    text: string,
    slideId: string,
    outputDir: string,
    options?: TTSOptions
  ): Promise<TTSResult> {
    fs.mkdirSync(outputDir, { recursive: true });

    const voice = options?.voice || process.env.EDGE_TTS_VOICE || this.defaultVoice;
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Save to a temp subfolder or file
    const tempDir = path.join(outputDir, `tmp_${slideId}_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      const { audioFilePath } = await tts.toFile(tempDir, text);
      const targetPath = path.join(outputDir, `${slideId}_voiceover.mp3`);

      // Rename to target file
      fs.renameSync(audioFilePath, targetPath);

      // Clean up temp dir
      try {
        fs.rmdirSync(tempDir);
      } catch (_) {}

      // Calculate duration: 48kbps mono MP3 = 48,000 bits/sec = 6,000 bytes/sec
      const stats = fs.statSync(targetPath);
      const durationSeconds = Math.max(2.0, Number((stats.size / 6000).toFixed(2)));

      return {
        audioPath: targetPath,
        durationSeconds,
      };
    } catch (err) {
      console.warn(`[EdgeTTS] Failed for slide ${slideId}, falling back to mock WAV:`, err);
      const fallback = new MockTTSProvider();
      return fallback.synthesizeSpeech(text, slideId, outputDir, options);
    }
  }
}

/**
 * Factory function to retrieve the configured TTS provider
 */
export function getTTSProvider(): ITTSProvider {
  const providerType = process.env.TTS_PROVIDER || 'edge-tts';
  switch (providerType) {
    case 'edge-tts':
      return new EdgeTTSProvider();
    case 'mock':
    default:
      return new MockTTSProvider();
  }
}
