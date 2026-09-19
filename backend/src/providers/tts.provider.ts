import fs from 'fs';
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
 * to serve as a realistic audio mock when no API key is provided.
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
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // ByteRate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate subtle tone (440Hz at very low volume) so audio track is valid and detectable
  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // 0.05 amplitude sine wave
    const sample = Math.sin(2 * Math.PI * 440 * t) * 0.05 * 32767;
    buffer.writeInt16LE(Math.floor(sample), offset);
    offset += 2;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

/**
 * MockTTSProvider: Synthesizes speech locally by estimating duration from word count
 * and writing a valid WAV file.
 */
export class MockTTSProvider implements ITTSProvider {
  async synthesizeSpeech(
    text: string,
    slideId: string,
    outputDir: string,
    _options?: TTSOptions
  ): Promise<TTSResult> {
    const wordCount = text.trim().split(/\s+/).length;
    // Average speech rate is ~2.5 words per second
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
 * Factory function to retrieve the configured TTS provider
 */
export function getTTSProvider(): ITTSProvider {
  const providerType = process.env.TTS_PROVIDER || 'mock';
  switch (providerType) {
    case 'mock':
    default:
      return new MockTTSProvider();
  }
}
