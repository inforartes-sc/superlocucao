import fs from 'fs';
import path from 'path';
import { saveAudioBinary } from './db.ts';
import { expandUnitsAndMeasuresToWords } from '../src/utils/textNormalizer.ts';

const AUDIO_STORAGE_DIR = path.resolve(process.cwd(), '.locucao_audios');

/**
 * Split text into natural sentence phrases below 180 chars for Google TTS
 */
function splitTextForTts(text: string): string[] {
  const clean = text
    .replace(/["“”«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = clean.match(/[^.!?,\n]+[.!?,\n]+|[^.!?,\n]+$/g) || [clean];
  const chunks: string[] = [];
  let current = '';

  for (const part of sentences) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).trim().length <= 160) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > 160) {
        // Break by spaces
        const words = trimmed.split(' ');
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).trim().length <= 160) {
            sub = (sub + ' ' + w).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        if (sub) current = sub;
      } else {
        current = trimmed;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [clean];
}

/**
 * Generates natural Brazilian Portuguese speech (MP3 buffer)
 */
export async function fetchRealBrazilianTTS(text: string): Promise<Buffer> {
  const normalized = expandUnitsAndMeasuresToWords(text);
  const chunks = splitTextForTts(normalized);
  const audioBuffers: Buffer[] = [];

  for (const chunk of chunks) {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' +
      encodeURIComponent(chunk) +
      '&tl=pt-BR&client=tw-ob';

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'audio/mpeg, audio/*',
      },
    });

    if (!res.ok) {
      throw new Error(`TTS service returned HTTP ${res.status}`);
    }

    const arr = await res.arrayBuffer();
    audioBuffers.push(Buffer.from(arr));
  }

  return Buffer.concat(audioBuffers);
}

/**
 * Initialize all demonstration audios with real spoken Brazilian voices
 */
export async function initializeRealVoiceDemos(): Promise<void> {
  const seedDir = path.resolve(process.cwd(), 'server', 'seed_audios');
  if (!fs.existsSync(AUDIO_STORAGE_DIR)) {
    try {
      fs.mkdirSync(AUDIO_STORAGE_DIR, { recursive: true });
    } catch {}
  }

  const allDemos = [
    // Landing Page Demos
    {
      id: 'aud-demo-1',
      file: 'aud-demo-1.mp3',
      filename: 'aud-demo-1.mp3',
    },
    {
      id: 'aud-demo-2',
      file: 'aud-demo-2.mp3',
      filename: 'aud-demo-2.mp3',
    },
    {
      id: 'aud-demo-3',
      file: 'aud-demo-3.mp3',
      filename: 'aud-demo-3.mp3',
    },

    // Voice Actor Samples
    {
      id: 'voice_daniel-varejo',
      file: 'voice_daniel-varejo.mp3',
      filename: 'voice_daniel-varejo.mp3',
    },
    {
      id: 'voice_carolina-acolhedora',
      file: 'voice_carolina-acolhedora.mp3',
      filename: 'voice_carolina-acolhedora.mp3',
    },
    {
      id: 'voice_rodrigo-grave',
      file: 'voice_rodrigo-grave.mp3',
      filename: 'voice_rodrigo-grave.mp3',
    },
    {
      id: 'voice_mariana-jovem',
      file: 'voice_mariana-jovem.mp3',
      filename: 'voice_mariana-jovem.mp3',
    },
    {
      id: 'voice_marcos-institucional',
      file: 'voice_marcos-institucional.mp3',
      filename: 'voice_marcos-institucional.mp3',
    },

    // Style Samples
    {
      id: 'style_energetica_supermercado',
      file: 'style_energetica_supermercado.mp3',
      filename: 'style_energetica_supermercado.mp3',
    },
    {
      id: 'style_animada_promocional',
      file: 'style_animada_promocional.mp3',
      filename: 'style_animada_promocional.mp3',
    },
    {
      id: 'style_natural_amigavel',
      file: 'style_natural_amigavel.mp3',
      filename: 'style_natural_amigavel.mp3',
    },
    {
      id: 'style_urgente_oportunidade',
      file: 'style_urgente_oportunidade.mp3',
      filename: 'style_urgente_oportunidade.mp3',
    },
    {
      id: 'style_elegante_institucional',
      file: 'style_elegante_institucional.mp3',
      filename: 'style_elegante_institucional.mp3',
    },
    {
      id: 'style_popular_descontraida',
      file: 'style_popular_descontraida.mp3',
      filename: 'style_popular_descontraida.mp3',
    },
  ];

  for (const item of allDemos) {
    const seedPath = path.join(seedDir, item.file);
    const localPath = path.join(AUDIO_STORAGE_DIR, item.file);
    let buf: Buffer | null = null;

    if (fs.existsSync(seedPath)) {
      buf = fs.readFileSync(seedPath);
    } else if (fs.existsSync(localPath)) {
      buf = fs.readFileSync(localPath);
    }

    if (buf && buf.length > 0) {
      saveAudioBinary(item.id, buf, 'audio/mpeg', item.filename);
    }
  }

  // Garantir que todos os MP3s de trilha sonora em seedDir estejam disponíveis em AUDIO_STORAGE_DIR
  try {
    if (fs.existsSync(seedDir)) {
      const seedFiles = fs.readdirSync(seedDir);
      for (const f of seedFiles) {
        if (f.startsWith('soundtrack_') && (f.endsWith('.mp3') || f.endsWith('.wav'))) {
          const src = path.join(seedDir, f);
          const dst = path.join(AUDIO_STORAGE_DIR, f);
          if (!fs.existsSync(dst)) {
            try {
              fs.copyFileSync(src, dst);
            } catch {}
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Seed Sync] Warning syncing soundtracks:', err);
  }

  console.log('[Real TTS] Todas as demonstrações de voz real e trilhas sonoras oficiais inicializadas.');
}
