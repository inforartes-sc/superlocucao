import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let Mp3EncoderClass: any = null;

function getMp3Encoder() {
  if (Mp3EncoderClass) return Mp3EncoderClass;

  const candidatePaths = [
    path.resolve(process.cwd(), 'node_modules/@breezystack/lamejs/dist/lamejs.iife.js'),
    path.resolve(__dirname, '../node_modules/@breezystack/lamejs/dist/lamejs.iife.js'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const code = fs.readFileSync(p, 'utf8');
        const sandbox: any = {};
        vm.runInNewContext(code, sandbox);
        if (sandbox.lamejs?.Mp3Encoder) {
          Mp3EncoderClass = sandbox.lamejs.Mp3Encoder;
          return Mp3EncoderClass;
        }
      } catch (err) {
        console.warn(`Failed reading lamejs from ${p}:`, err);
      }
    }
  }

  return null;
}

/**
 * Converts a 16-bit PCM WAV buffer to standard MP3 buffer
 */
export function convertWavToMp3(wavBuffer: Buffer, targetSampleRate?: number): Buffer {
  let sampleRate = targetSampleRate || 24000;
  let numChannels = 1;
  let pcmOffset = 44;
  let pcmLength = wavBuffer.length - 44;

  // Inspect WAV header if present
  if (wavBuffer.toString('ascii', 0, 4) === 'RIFF' && wavBuffer.toString('ascii', 8, 12) === 'WAVE') {
    numChannels = wavBuffer.readUInt16LE(22) || 1;
    sampleRate = targetSampleRate || wavBuffer.readUInt32LE(24) || 24000;

    // Search for 'data' chunk
    const dataIdx = wavBuffer.indexOf('data');
    if (dataIdx !== -1) {
      pcmOffset = dataIdx + 8;
      const dataSize = wavBuffer.readUInt32LE(dataIdx + 4);
      pcmLength = Math.min(dataSize, wavBuffer.length - pcmOffset);
    }
  }

  // Read 16-bit PCM samples
  const numSamples = Math.floor(pcmLength / (2 * numChannels));
  const samples = new Int16Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const byteOffset = pcmOffset + i * 2 * numChannels;
    if (byteOffset + 1 < wavBuffer.length) {
      samples[i] = wavBuffer.readInt16LE(byteOffset);
    }
  }

  const Encoder = getMp3Encoder();
  if (!Encoder) {
    console.warn('[MP3 Converter] Mp3Encoder not available, returning original buffer');
    return wavBuffer;
  }

  // Initialize MP3 Encoder: channels=1, sampleRate, kbps=128
  const kbps = 128;
  const encoder = new Encoder(1, sampleRate, kbps);
  const mp3Chunks: Buffer[] = [];

  const blockSize = 1152;
  for (let i = 0; i < samples.length; i += blockSize) {
    const chunk = samples.subarray(i, i + blockSize);
    const mp3Buf = encoder.encodeBuffer(chunk);
    if (mp3Buf && mp3Buf.length > 0) {
      mp3Chunks.push(Buffer.from(mp3Buf));
    }
  }

  const flushBuf = encoder.flush();
  if (flushBuf && flushBuf.length > 0) {
    mp3Chunks.push(Buffer.from(flushBuf));
  }

  const finalMp3 = Buffer.concat(mp3Chunks);
  if (finalMp3.length > 0) {
    return finalMp3;
  }

  return wavBuffer;
}
