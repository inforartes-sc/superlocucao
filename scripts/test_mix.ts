import { mixVoiceAndSoundtrack } from '../server/soundtracks.ts';

const sampleRate = 24000;
const duration = 3;
const numSamples = sampleRate * duration;
const buf = Buffer.alloc(44 + numSamples * 2);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + numSamples * 2, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(sampleRate, 24);
buf.writeUInt32LE(sampleRate * 2, 28);
buf.writeUInt16LE(2, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(numSamples * 2, 40);
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const sample = Math.sin(2 * Math.PI * 440 * t) * 0.4;
  buf.writeInt16LE(Math.floor(sample * 32767), 44 + i * 2);
}

console.log('Testing mixVoiceAndSoundtrack...');
const start = Date.now();
const mixed = mixVoiceAndSoundtrack(buf, 'varejo_alegre', 0.20);
console.log(`Finished in ${Date.now() - start}ms`);
console.log('Mixed buffer size:', mixed.length, 'bytes');
const isMp3 = mixed.length > 3 && (mixed[0] === 0x49 || (mixed[0] === 0xff && (mixed[1] & 0xe0) === 0xe0));
console.log('Is valid MP3?', isMp3);
