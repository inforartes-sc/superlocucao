import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import { SoundtrackOption, SoundtrackId } from '../src/types/index.ts';

function getFfmpegPath(): string {
  if (ffmpegStatic && typeof ffmpegStatic === 'string' && fs.existsSync(ffmpegStatic)) {
    return ffmpegStatic;
  }
  return 'ffmpeg';
}

export const SOUNDTRACKS_LIST: SoundtrackOption[] = [
  {
    id: 'sem_trilha',
    name: 'Sem Trilha (Voz Pura)',
    category: 'Voz Pura',
    bpm: 0,
    description: 'Apenas a locução do locutor, sem fundo musical. Ideal para sistemas de som que já tocam rádio ao fundo.',
    previewUrl: '/api/soundtracks/sem_trilha/preview.mp3',
  },
  {
    id: 'varejo_alegre',
    name: 'Varejo Alegre & Enérgico',
    category: 'Supermercado & Feira',
    bpm: 124,
    description: 'Upbeat acústico e ritmo alegre contagiante. Perfeito para ofertas do dia, feirinha e hortifrúti.',
    previewUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
    isPopular: true,
  },
  {
    id: 'batida_comercial',
    name: 'Pop Comercial Dinâmico',
    category: 'Grandes Redes',
    bpm: 120,
    description: 'Batida moderna pop comercial estilo rádio de loja. Alto apelo para grandes promoções e corredor central.',
    previewUrl: '/api/soundtracks/batida_comercial/preview.mp3',
    isPopular: true,
  },
  {
    id: 'black_friday_urgente',
    name: 'Impacto & Urgência',
    category: 'Promoção Relâmpago',
    bpm: 128,
    description: 'Percussão enérgica e dinâmica de grande impacto. Ideal para Black Friday, Queima de Estoque e Aniversário.',
    previewUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
  },
  {
    id: 'acustico_hortifruti',
    name: 'Acústico Leve & Fresco',
    category: 'Hortifrúti & Padaria',
    bpm: 105,
    description: 'Violão suave e frescor aconchegante. Indicado para compras matinais, café da manhã, padaria e flores.',
    previewUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
  },
  {
    id: 'institucional_gourmet',
    name: 'Elegante & Institucional',
    category: 'Clube & Vinhos',
    bpm: 96,
    description: 'Piano contemporâneo sofisticado e harmonia envolvente. Ideal para Clube de Vantagens, adega, frios nobres e comunicados.',
    previewUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
  },
];

/**
 * Returns audio buffer for a soundtrack preview (standard MP3 format)
 */
export function getSoundtrackPreviewBuffer(trackId: SoundtrackId): Buffer {
  if (trackId === 'sem_trilha') {
    return Buffer.alloc(0);
  }

  const audioDir = path.resolve(process.cwd(), '.locucao_audios');
  const seedDir = path.resolve(process.cwd(), 'server', 'seed_audios');

  const candidatePaths = [
    path.join(audioDir, `soundtrack_${trackId}.mp3`),
    path.join(seedDir, `soundtrack_${trackId}.mp3`),
    path.join(audioDir, 'soundtrack_varejo_alegre.mp3'),
    path.join(seedDir, 'soundtrack_varejo_alegre.mp3'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p);
    }
  }

  // Fallback synthetic WAV if file not yet downloaded
  return generateSoundtrackWav(trackId, 10.0);
}

/**
 * Generates musical background audio buffer in WAV (24kHz, 16-bit mono) fallback
 */
export function generateSoundtrackWav(trackId: SoundtrackId, durationSec: number): Buffer {
  const sampleRate = 24000;
  const numSamples = Math.floor(sampleRate * Math.max(3, durationSec));
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Soft melodic chord progression
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beat = (t * 2) % 1;
    const bar = Math.floor(t / 2) % 4;
    const roots = [261.63, 196.0, 220.0, 174.61]; // C, G, A, F
    const root = roots[bar];
    const chord = (
      Math.sin(2 * Math.PI * root * t) * 0.4 +
      Math.sin(2 * Math.PI * (root * 1.25) * t) * 0.3 +
      Math.sin(2 * Math.PI * (root * 1.5) * t) * 0.3
    ) * Math.exp(-beat * 2);

    const limited = Math.max(-0.95, Math.min(0.95, chord * 0.4));
    buffer.writeInt16LE(Math.floor(limited * 32767), 44 + i * 2);
  }

  return buffer;
}

/**
 * Normalizes voice audio to professional commercial broadcast loudness (-14 LUFS)
 * using FFmpeg loudnorm and speech presence EQ, ensuring every voiceover
 * has consistent volume and high clarity, eliminating quiet or muffled speech.
 */
export function normalizeVoiceAudio(voiceBuffer: Buffer): Buffer {
  if (!voiceBuffer || voiceBuffer.length === 0) return voiceBuffer;

  const audioDir = path.resolve(process.cwd(), '.locucao_audios');
  const tempId = `norm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const isVoiceWav = voiceBuffer.toString('ascii', 0, 4) === 'RIFF';
  const voiceExt = isVoiceWav ? 'wav' : 'mp3';
  const tempInPath = path.join(audioDir, `${tempId}_in.${voiceExt}`);
  const tempOutPath = path.join(audioDir, `${tempId}_norm.mp3`);

  try {
    fs.writeFileSync(tempInPath, voiceBuffer);
    const ffmpegBin = getFfmpegPath();

    // Highpass 85Hz (cuts low rumble) + Speech Presence EQ (+3.5dB @ 2.8kHz)
    // + Broadcast Compressor & EBU R128 Loudness Normalizer (Target: -14 LUFS, TP: -1.0dB)
    const filter = [
      'highpass=f=85',
      'equalizer=f=2800:width_type=q:w=1.2:g=3.5',
      'equalizer=f=220:width_type=q:w=1.0:g=1.5',
      'acompressor=threshold=-22dB:ratio=4:attack=5:release=120:makeup=2.5dB',
      'loudnorm=I=-14:TP=-1.0:LRA=7'
    ].join(',');

    const args = [
      '-y',
      '-i', tempInPath,
      '-af', filter,
      '-b:a', '192k',
      tempOutPath
    ];

    execFileSync(ffmpegBin, args, { stdio: 'pipe' });

    if (fs.existsSync(tempOutPath)) {
      return fs.readFileSync(tempOutPath);
    }
    return voiceBuffer;
  } catch (err: any) {
    console.warn('[Voice Normalizer] Fallback to raw voice buffer:', err.message);
    return voiceBuffer;
  } finally {
    if (fs.existsSync(tempInPath)) {
      try { fs.unlinkSync(tempInPath); } catch {}
    }
    if (fs.existsSync(tempOutPath)) {
      try { fs.unlinkSync(tempOutPath); } catch {}
    }
  }
}

/**
 * Mixes voice audio (MP3 or WAV) with professional background music MP3 using FFmpeg
 */
export function mixVoiceAndSoundtrack(
  voiceBuffer: Buffer,
  soundtrackId: SoundtrackId,
  musicVolumeMultiplier: number = 0.20
): Buffer {
  // First normalize voice so it always speaks loud and clear
  const normalizedVoiceBuffer = normalizeVoiceAudio(voiceBuffer);

  if (soundtrackId === 'sem_trilha') {
    return normalizedVoiceBuffer;
  }

  const audioDir = path.resolve(process.cwd(), '.locucao_audios');
  const trackPath = path.join(audioDir, `soundtrack_${soundtrackId}.mp3`);

  if (!fs.existsSync(trackPath)) {
    console.warn(`[Soundtrack Mixer] File not found: ${trackPath}. Returning voice without music.`);
    return normalizedVoiceBuffer;
  }

  const tempId = `mix_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const isVoiceWav = normalizedVoiceBuffer.toString('ascii', 0, 4) === 'RIFF';
  const voiceExt = isVoiceWav ? 'wav' : 'mp3';
  const tempVoicePath = path.join(audioDir, `${tempId}_voice.${voiceExt}`);
  const tempOutPath = path.join(audioDir, `${tempId}_out.mp3`);

  try {
    fs.writeFileSync(tempVoicePath, normalizedVoiceBuffer);

    const ffmpegBin = getFfmpegPath();

    let voiceDuration = 10;
    try {
      execFileSync(ffmpegBin, ['-i', tempVoicePath]);
    } catch (e: any) {
      const errStr = e.stderr?.toString() || e.message || '';
      const match = errStr.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
      if (match) {
        voiceDuration = (+match[1]) * 3600 + (+match[2]) * 60 + parseFloat(match[3]);
      }
    }

    const totalDuration = voiceDuration + 1.2;
    const fadeOutStart = Math.max(0.5, totalDuration - 1.2);
    const musicBaseVol = Math.max(0.08, Math.min(0.35, musicVolumeMultiplier));

    // Clear vocal presence with Ducking of background music
    const filterParts = [
      `[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=1.05,asplit=2[vox1][vox2]`,
      `[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=${musicBaseVol.toFixed(3)},afade=t=out:st=${fadeOutStart.toFixed(2)}:d=1.2[bg_music]`,
      `[bg_music][vox1]sidechaincompress=threshold=0.08:ratio=4.5:attack=15:release=300[ducked_bg]`,
      `[vox2][ducked_bg]amix=inputs=2:duration=first:dropout_transition=2[mixed]`,
      `[mixed]alimiter=limit=0.92:attack=5:release=50[out]`
    ];
    const filter = filterParts.join(';');

    const args = [
      '-y',
      '-i', tempVoicePath,
      '-stream_loop', '-1',
      '-i', trackPath,
      '-t', totalDuration.toFixed(2),
      '-filter_complex', filter,
      '-map', '[out]',
      '-b:a', '192k',
      tempOutPath
    ];

    execFileSync(ffmpegBin, args, { stdio: 'pipe' });

    if (fs.existsSync(tempOutPath)) {
      const mixedBuffer = fs.readFileSync(tempOutPath);
      return mixedBuffer;
    }

    return normalizedVoiceBuffer;
  } catch (err: any) {
    console.error('[Soundtrack Mixer] Error mixing voice and soundtrack:', err.message);
    return normalizedVoiceBuffer;
  } finally {
    if (fs.existsSync(tempVoicePath)) {
      try { fs.unlinkSync(tempVoicePath); } catch {}
    }
    if (fs.existsSync(tempOutPath)) {
      try { fs.unlinkSync(tempOutPath); } catch {}
    }
  }
}

/**
 * Creates style demo audio buffers (demonstrating each of the 6 supermarket voiceover styles)
 */
export function generateStyleDemoWav(styleId: string): Buffer {
  const sampleRate = 24000;
  const duration = 7.0;
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let pitch = 160;
  let tempo = 120;
  let bgTrack: SoundtrackId = 'varejo_alegre';

  if (styleId === 'energetica_supermercado') {
    pitch = 175;
    tempo = 126;
    bgTrack = 'varejo_alegre';
  } else if (styleId === 'animada_promocional') {
    pitch = 165;
    tempo = 120;
    bgTrack = 'batida_comercial';
  } else if (styleId === 'natural_amigavel') {
    pitch = 145;
    tempo = 100;
    bgTrack = 'acustico_hortifruti';
  } else if (styleId === 'urgente_oportunidade') {
    pitch = 185;
    tempo = 135;
    bgTrack = 'black_friday_urgente';
  } else if (styleId === 'elegante_institucional') {
    pitch = 130;
    tempo = 90;
    bgTrack = 'institucional_gourmet';
  } else if (styleId === 'popular_descontraida') {
    pitch = 155;
    tempo = 115;
    bgTrack = 'varejo_alegre';
  }

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (t < 0.35) {
      sample += Math.sin(2 * Math.PI * 784 * t) * 0.35 * Math.exp(-t * 8);
    } else if (t < 0.75) {
      sample += Math.sin(2 * Math.PI * 659.25 * (t - 0.35)) * 0.35 * Math.exp(-(t - 0.35) * 6);
    } else {
      const st = t - 0.75;
      const syllable = Math.sin(st * (tempo / 12));
      if (syllable > -0.1) {
        const f0 = pitch + 25 * Math.sin(st * 4.5);
        const f1 = Math.sin(2 * Math.PI * f0 * st);
        const f2 = Math.sin(2 * Math.PI * (f0 * 2.2) * st) * 0.45;
        const f3 = Math.sin(2 * Math.PI * (f0 * 3.8) * st) * 0.25;
        sample += (f1 + f2 + f3) * 0.35 * (0.6 + 0.4 * Math.sin(st * 10));
      }
    }

    const limited = Math.max(-0.95, Math.min(0.95, sample));
    buffer.writeInt16LE(Math.floor(limited * 32767), 44 + i * 2);
  }

  return mixVoiceAndSoundtrack(buffer, bgTrack, 0.25);
}

/**
 * Creates voice actor demo audio buffer (demonstrating Daniel, Carolina, Rodrigo, Mariana, Marcos)
 */
export function generateVoiceActorDemoWav(voiceId: string): Buffer {
  let pitch = 150;
  let bgTrack: SoundtrackId = 'varejo_alegre';

  if (voiceId === 'daniel-varejo') {
    pitch = 170;
    bgTrack = 'varejo_alegre';
  } else if (voiceId === 'carolina-acolhedora') {
    pitch = 240;
    bgTrack = 'acustico_hortifruti';
  } else if (voiceId === 'rodrigo-grave') {
    pitch = 110;
    bgTrack = 'black_friday_urgente';
  } else if (voiceId === 'mariana-jovem') {
    pitch = 260;
    bgTrack = 'batida_comercial';
  } else if (voiceId === 'marcos-institucional') {
    pitch = 125;
    bgTrack = 'institucional_gourmet';
  }

  const sampleRate = 24000;
  const duration = 6.0;
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    if (t < 0.3) {
      sample += Math.sin(2 * Math.PI * 660 * t) * 0.3 * Math.exp(-t * 9);
    } else {
      const st = t - 0.3;
      const syllable = Math.sin(st * 9);
      if (syllable > -0.2) {
        const f0 = pitch + 18 * Math.sin(st * 3.5);
        sample += (
          Math.sin(2 * Math.PI * f0 * st) * 0.5 +
          Math.sin(2 * Math.PI * (f0 * 2.3) * st) * 0.3 +
          Math.sin(2 * Math.PI * (f0 * 4) * st) * 0.2
        ) * 0.35 * (0.6 + 0.4 * Math.sin(st * 8));
      }
    }
    buffer.writeInt16LE(Math.floor(Math.max(-0.95, Math.min(0.95, sample)) * 32767), 44 + i * 2);
  }

  return mixVoiceAndSoundtrack(buffer, bgTrack, 0.20);
}
