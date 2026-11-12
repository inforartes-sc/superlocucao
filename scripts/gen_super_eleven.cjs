const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
const dotenv = require('dotenv');
dotenv.config();

const key = process.env.ELEVENLABS_API_KEY;
const audioDir = path.resolve('.locucao_audios');
const seedDir = path.resolve('server', 'seed_audios');

const STYLES = [
  { id: 'energetica_supermercado', voice: 'dXQsuVXyCGkF7meZLeFk', track: 'varejo_alegre' },
  { id: 'animada_promocional', voice: 'ohZOfA9iwlZ5nOsoY7LB', track: 'varejo_alegre' },
  { id: 'natural_amigavel', voice: 'BKv4Uz2HPF6TFlDgFBKN', track: 'acustico_leve' },
  { id: 'urgente_oportunidade', voice: 'Fjiik8aKXNDjmxd1Q2jF', track: 'impacto_urgencia' },
  { id: 'elegante_institucional', voice: 'a1ijbt2xmlhzaGXHewzV', track: 'elegante_institucional' },
  { id: 'popular_descontraida', voice: 'plASsyS7JE6GCAvx9uIc', track: 'varejo_alegre' }
];

const TRACK_FILES = {
  varejo_alegre: 'soundtrack_varejo_alegre.mp3',
  acustico_leve: 'soundtrack_acustico_hortifruti.mp3',
  impacto_urgencia: 'soundtrack_black_friday_urgente.mp3',
  elegante_institucional: 'soundtrack_institucional_gourmet.mp3'
};

const SUPERMERCADO_TEXTS = {
  energetica_supermercado: 'Atenção clientes! É mega oferta relâmpago acontecendo agora no corredor central! Aproveite preços baixos em todo o supermercado!',
  animada_promocional: 'O festival de ofertas da semana começou! Venha economizar de verdade e encher o carrinho com as melhores promoções para toda a família!',
  natural_amigavel: 'Bom dia vizinhança! Frutas, verduras e legumes colhidos com todo carinho e frescor, direto para a mesa da sua família.',
  urgente_oportunidade: 'Urgente! Últimas unidades com preço de custo! É queima de estoque exclusiva, corra e garanta o seu antes que acabe tudo!',
  elegante_institucional: 'Tradição e excelência em cada detalhe. Conheça as vantagens exclusivas do nosso clube e seleções especiais de cortes nobres e vinhos.',
  popular_descontraida: 'Olha o precinho que você gosta! Aqui você leva muito mais por muito menos. Chega mais e confira as ofertas de hoje!'
};

async function run() {
  for (const s of STYLES) {
    const text = SUPERMERCADO_TEXTS[s.id];
    console.log('Generating supermarket style:', s.id, 'with voice:', s.voice);

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${s.voice}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': key,
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true }
      })
    });

    if (!res.ok) {
      console.error('Failed ElevenLabs TTS for', s.id, res.status);
      continue;
    }

    const rawBuf = Buffer.from(await res.arrayBuffer());
    const tempRaw = path.join(audioDir, `temp_super_${s.id}.mp3`);
    fs.writeFileSync(tempRaw, rawBuf);

    const trackFile = path.join(audioDir, TRACK_FILES[s.track]);
    const outFiles = [
      path.join(audioDir, `style_eleven_${s.id}_supermercado.mp3`),
      path.join(audioDir, `style_${s.id}.mp3`),
      path.join(seedDir, `style_${s.id}.mp3`),
      path.join(seedDir, `style_eleven_${s.id}_supermercado.mp3`)
    ];

    let voiceDuration = 10;
    try {
      execFileSync(ffmpegStatic, ['-i', tempRaw], { stdio: 'pipe' });
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
      '-i', tempRaw,
      '-stream_loop', '-1',
      '-i', trackFile,
      '-t', totalDuration.toFixed(2),
      '-filter_complex', filter,
      '-map', '[out]',
      '-b:a', '192k',
      outFiles[0]
    ];

    try {
      execFileSync(ffmpegStatic, args, { stdio: 'pipe' });
      const mixedBuf = fs.readFileSync(outFiles[0]);
      for (let i = 1; i < outFiles.length; i++) {
        fs.writeFileSync(outFiles[i], mixedBuf);
      }
      console.log('Mixed and saved across all paths for:', s.id, mixedBuf.length, 'bytes');
    } catch (err) {
      console.error('Mix error for', s.id, err.message);
    }

    try { fs.unlinkSync(tempRaw); } catch {}
    await new Promise(r => setTimeout(r, 600));
  }
}

run().catch(console.error);

