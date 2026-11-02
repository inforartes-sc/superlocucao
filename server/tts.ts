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
  if (!fs.existsSync(AUDIO_STORAGE_DIR)) {
    fs.mkdirSync(AUDIO_STORAGE_DIR, { recursive: true });
  }

  const allDemos = [
    // Landing Page Demos
    {
      id: 'aud-demo-1',
      file: 'aud-demo-1.mp3',
      filename: 'locucao-quarta-da-carne-alvorada.mp3',
      text: 'Atenção clientes do Supermercado! Quarta da Carne com Alcatra Friboi por apenas trinta e seis reais e noventa centavos o quilo! Coxa e sobrecoxa Sadia só oito reais e noventa e nove centavos!',
    },
    {
      id: 'aud-demo-2',
      file: 'aud-demo-2.mp3',
      filename: 'locucao-fim-de-semana-churrasco.mp3',
      text: 'O fim de semana chegou com tudo! Picanha bovina fatiada grill por só cinquenta e nove reais e noventa centavos o quilo! Cerveja Heineken lata trezentos e cinquenta mililitros bem gelada por quatro reais e oitenta e nove centavos a unidade!',
    },
    {
      id: 'aud-demo-3',
      file: 'aud-demo-3.mp3',
      filename: 'locucao-hortifruti-terca-quarta.mp3',
      text: 'Na nossa feirinha hoje tem tomate italiano fresquinho por quatro reais e quarenta e nove centavos o quilo! Banana nanica por apenas três reais e noventa e nove centavos o quilo! Aproveite!',
    },

    // Voice Actor Samples
    {
      id: 'voice_daniel-varejo',
      file: 'voice_daniel-varejo.mp3',
      filename: 'demonstracao-voz-daniel-varejo.mp3',
      text: 'Atenção clientes do Supermercado! Sou o Daniel. Ofertas relâmpago e preços baixos no açougue e mercearia para você encher o carrinho com a maior economia da cidade!',
    },
    {
      id: 'voice_carolina-acolhedora',
      file: 'voice_carolina-acolhedora.mp3',
      filename: 'demonstracao-voz-carolina-acolhedora.mp3',
      text: 'Olá! Sejam muito bem-vindos ao nosso supermercado. Eu sou a Carolina! Na nossa feirinha e padaria temos produtos fresquinhos e selecionados com todo o carinho para a sua família!',
    },
    {
      id: 'voice_rodrigo-grave',
      file: 'voice_rodrigo-grave.mp3',
      filename: 'demonstracao-voz-rodrigo-grave.mp3',
      text: 'Atenção clientes! Sou o Rodrigo. Começou o grande festival de economia e atacarejo! Preços esmagados e as melhores marcas esperando por você!',
    },
    {
      id: 'voice_mariana-jovem',
      file: 'voice_mariana-jovem.mp3',
      filename: 'demonstracao-voz-mariana-jovem.mp3',
      text: 'Oi gente! Eu sou a Mariana. Chegou a hora de conferir as maiores novidades e promoções em lanches, bebidas geladas e conveniência com super descontos!',
    },
    {
      id: 'voice_marcos-institucional',
      file: 'voice_marcos-institucional.mp3',
      filename: 'demonstracao-voz-marcos-institucional.mp3',
      text: 'Sejam bem-vindos à nossa loja. Sou o Marcos. Conheça as vantagens exclusivas do nosso clube de benefícios, atendimento diferenciado e tradição em servir você e sua família.',
    },

    // Style Samples
    {
      id: 'style_energetica_supermercado',
      file: 'style_energetica_supermercado.mp3',
      filename: 'estilo-energetica-supermercado.mp3',
      text: 'Parou tudo! É mega oferta relâmpago de supermercado! Preço baixo exclusivo acontecendo agora no corredor central!',
    },
    {
      id: 'style_animada_promocional',
      file: 'style_animada_promocional.mp3',
      filename: 'estilo-animada-promocional.mp3',
      text: 'O festival de preços baixos da semana chegou! Aproveite promoções imperdíveis para economizar em todas as suas compras!',
    },
    {
      id: 'style_natural_amigavel',
      file: 'style_natural_amigavel.mp3',
      filename: 'estilo-natural-amigavel.mp3',
      text: 'Frutas, verduras e legumes colhidos com todo o frescor para levar saúde e muito sabor para a mesa da sua família.',
    },
    {
      id: 'style_urgente_oportunidade',
      file: 'style_urgente_oportunidade.mp3',
      filename: 'estilo-urgente-oportunidade.mp3',
      text: 'Atenção: são as últimas unidades com preço promocional de custo! Corra e garanta o seu antes que acabe o estoque!',
    },
    {
      id: 'style_elegante_institucional',
      file: 'style_elegante_institucional.mp3',
      filename: 'estilo-elegante-institucional.mp3',
      text: 'Tradição em cuidar do seu bem-estar com produtos de alta procedência e a qualidade superior que você e sua família merecem.',
    },
    {
      id: 'style_popular_descontraida',
      file: 'style_popular_descontraida.mp3',
      filename: 'estilo-popular-descontraida.mp3',
      text: 'Aqui você paga muito menos e leva muito mais! Economia garantida de verdade para o seu bolso hoje!',
    },
  ];

  for (const item of allDemos) {
    const filePath = path.join(AUDIO_STORAGE_DIR, item.file);
    let buf: Buffer;

    if (fs.existsSync(filePath)) {
      buf = fs.readFileSync(filePath);
    } else {
      try {
        console.log(`[Real TTS] Synthesizing real voice demo: ${item.file}...`);
        buf = await fetchRealBrazilianTTS(item.text);
        fs.writeFileSync(filePath, buf);
        fs.writeFileSync(
          path.join(AUDIO_STORAGE_DIR, `${item.id}.meta.json`),
          JSON.stringify({ mimeType: 'audio/mpeg', filename: item.filename })
        );
      } catch (err) {
        console.warn(`[Real TTS] Failed to generate ${item.file}:`, err);
        continue;
      }
    }

    saveAudioBinary(item.id, buf, 'audio/mpeg', item.filename);
  }

  console.log('[Real TTS] Todas as demonstrações de voz real inicializadas com sucesso.');
}
