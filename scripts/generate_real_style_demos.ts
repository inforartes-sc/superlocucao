import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { mixVoiceAndSoundtrack } from '../server/soundtracks.ts';
import { SoundtrackId } from '../src/types/index.ts';

dotenv.config();

const elevenKey = process.env.ELEVENLABS_API_KEY;
if (!elevenKey) {
  console.error('ELEVENLABS_API_KEY not found in .env');
  process.exit(1);
}

const audioDir = path.resolve('.locucao_audios');

// Map each of the 6 commercial styles to a dedicated Brazilian voice actor and commercial soundtrack:
const stylesConfig: Array<{
  styleId: string;
  voiceId: string;
  voiceName: string;
  soundtrackId: SoundtrackId;
  text: string;
  stability: number;
  similarity_boost: number;
}> = [
  {
    styleId: 'energetica_supermercado',
    voiceId: 'dXQsuVXyCGkF7meZLeFk', // Dany Varejo (Locutor clássico de supermercado com alta energia)
    voiceName: 'Dany Varejo',
    soundtrackId: 'varejo_alegre',
    text: 'Atenção clientes! É mega oferta relâmpago acontecendo agora no corredor central! Aproveite preços baixos em todo o supermercado!',
    stability: 0.35,
    similarity_boost: 0.85
  },
  {
    styleId: 'animada_promocional',
    voiceId: 'plASsyS7JE6GCAvx9uIc', // Marcio - Viral Hook Narrator (Alegre, dinâmico e comercial)
    voiceName: 'Marcio',
    soundtrackId: 'batida_comercial',
    text: 'O festival de ofertas da semana começou! Venha economizar de verdade e encher o carrinho com as melhores promoções para toda a família!',
    stability: 0.40,
    similarity_boost: 0.80
  },
  {
    styleId: 'natural_amigavel',
    voiceId: 'ORgG8rwdAiMYRug8RJwR', // Ana Alice - Friendly & Clear (Acolhedora, amigável)
    voiceName: 'Ana Alice',
    soundtrackId: 'acustico_hortifruti',
    text: 'Bom dia vizinhança! Frutas, verduras e legumes colhidos com todo carinho e frescor, direto para a mesa da sua família.',
    stability: 0.50,
    similarity_boost: 0.80
  },
  {
    styleId: 'urgente_oportunidade',
    voiceId: 'zNEsdgTUa3ndwKry8Xcq', // Elvis - Resonating, Deep and Engaging (Impacto, urgência, Black Friday)
    voiceName: 'Elvis',
    soundtrackId: 'black_friday_urgente',
    text: 'Urgente! Últimas unidades com preço de custo! É queima de estoque exclusiva, corra e garanta o seu antes que acabe tudo!',
    stability: 0.30,
    similarity_boost: 0.90
  },
  {
    styleId: 'elegante_institucional',
    voiceId: '4XmhZ74tBbUVCXIYNMMo', // Leonardo - Deep & Resonant (Elegante, encorpado, clube e adega)
    voiceName: 'Leonardo',
    soundtrackId: 'institucional_gourmet',
    text: 'Tradição e excelência em cada detalhe. Conheça as vantagens exclusivas do nosso clube e seleções especiais de cortes nobres e vinhos.',
    stability: 0.65,
    similarity_boost: 0.85
  },
  {
    styleId: 'popular_descontraida',
    voiceId: 'YU8EsJtXFMyKMxYtheDk', // Mário - Excited, Cheerful (Voz popular, descontraída)
    voiceName: 'Mário',
    soundtrackId: 'varejo_alegre',
    text: 'Olha o precinho que você gosta! Aqui você leva muito mais por muito menos. Chega mais e confira as ofertas de hoje!',
    stability: 0.35,
    similarity_boost: 0.80
  }
];

async function generateSample(item: typeof stylesConfig[0]) {
  console.log(`\nSynthesizing style "${item.styleId}" using real voice "${item.voiceName}" (${item.voiceId})...`);
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${item.voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': elevenKey!,
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: item.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: item.stability,
        similarity_boost: item.similarity_boost
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs error: ${response.status} - ${errText}`);
  }

  const rawVoiceBuffer = Buffer.from(await response.arrayBuffer());
  console.log(`Voice generated (${rawVoiceBuffer.length} bytes). Mixing with soundtrack "${item.soundtrackId}"...`);

  const mixedBuffer = mixVoiceAndSoundtrack(rawVoiceBuffer, item.soundtrackId, 0.20);
  
  const outPath = path.join(audioDir, `style_${item.styleId}.mp3`);
  fs.writeFileSync(outPath, mixedBuffer);
  console.log(`-> Saved: ${outPath} (${mixedBuffer.length} bytes)`);

  // Also update metadata
  fs.writeFileSync(
    path.join(audioDir, `style_${item.styleId}.meta.json`),
    JSON.stringify({
      mimeType: 'audio/mpeg',
      filename: `amostra-estilo-${item.styleId}.mp3`,
      voiceId: item.voiceId,
      voiceName: item.voiceName,
      soundtrackId: item.soundtrackId
    })
  );
}

async function main() {
  for (const item of stylesConfig) {
    try {
      await generateSample(item);
    } catch (e: any) {
      console.error(`Failed to generate sample for ${item.styleId}:`, e.message);
    }
  }
  console.log('\nALL 6 STYLE SAMPLES GENERATED WITH REAL ELEVENLABS BRAZILIAN VOICES!');
}

main();
