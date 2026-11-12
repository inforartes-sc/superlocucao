const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');

const audioDir = path.resolve('.locucao_audios');

const STYLES = [
  { id: 'energetica_supermercado', track: 'varejo_alegre' },
  { id: 'animada_promocional', track: 'varejo_alegre' },
  { id: 'natural_amigavel', track: 'acustico_leve' },
  { id: 'urgente_oportunidade', track: 'impacto_urgencia' },
  { id: 'elegante_institucional', track: 'elegante_institucional' },
  { id: 'popular_descontraida', track: 'varejo_alegre' }
];

const TRACK_FILES = {
  varejo_alegre: 'soundtrack_varejo_alegre.mp3',
  acustico_leve: 'soundtrack_acustico_hortifruti.mp3',
  impacto_urgencia: 'soundtrack_black_friday_urgente.mp3',
  elegante_institucional: 'soundtrack_institucional_gourmet.mp3'
};

for (const s of STYLES) {
  const rawPath = path.join(audioDir, 'raw_eleven_' + s.id + '_moda.mp3');
  const outPath = path.join(audioDir, 'style_eleven_' + s.id + '_moda.mp3');
  const trackFile = path.join(audioDir, TRACK_FILES[s.track]);

  if (!fs.existsSync(rawPath)) {
    console.warn('Raw missing:', rawPath);
    continue;
  }
  if (!fs.existsSync(trackFile)) {
    console.warn('Track missing:', trackFile);
    fs.copyFileSync(rawPath, outPath);
    continue;
  }

  let voiceDuration = 10;
  try {
    execFileSync(ffmpegStatic, ['-i', rawPath], { stdio: 'pipe' });
  } catch (e) {
    const errStr = e.stderr?.toString() || '';
    const match = errStr.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
    if (match) {
      voiceDuration = (+match[1]) * 3600 + (+match[2]) * 60 + parseFloat(match[3]);
    }
  }

  const totalDuration = voiceDuration + 1.2;
  const fadeOutStart = voiceDuration;
  const musicBaseVol = 0.22;

  const filter = [
    `[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,apad=whole_dur=${totalDuration.toFixed(2)},asplit=2[vox1][vox2]`,
    `[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=${musicBaseVol.toFixed(3)},afade=t=out:st=${fadeOutStart.toFixed(2)}:d=1.2[bg_music]`,
    `[bg_music][vox1]sidechaincompress=threshold=0.12:ratio=2.6:attack=20:release=350[ducked_bg]`,
    `[vox2][ducked_bg]amix=inputs=2:duration=first:weights=1.0 1.0:normalize=0[mixed]`,
    `[mixed]alimiter=limit=0.95:attack=5:release=50[out]`
  ].join(';');

  const args = [
    '-y',
    '-i', rawPath,
    '-stream_loop', '-1',
    '-i', trackFile,
    '-t', totalDuration.toFixed(2),
    '-filter_complex', filter,
    '-map', '[out]',
    '-b:a', '192k',
    outPath
  ];

  try {
    execFileSync(ffmpegStatic, args, { stdio: 'pipe' });
    console.log('Mixed successfully:', s.id, fs.statSync(outPath).size, 'bytes');
  } catch (err) {
    console.error('FFmpeg error for', s.id, err.message);
  }
}
