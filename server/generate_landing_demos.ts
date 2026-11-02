import fs from 'fs';
import path from 'path';
import { mixVoiceAndSoundtrack } from '../server/soundtracks.ts';

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_140d10dcdc705e07ae8a1a65ce5d8fc3675f06082a590f40';
const AUDIO_DIR = path.resolve(process.cwd(), '.locucao_audios');

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

async function generateElevenTts(voiceId: string, text: string): Promise<Buffer> {
  const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVEN_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.35,
        use_speaker_boost: true,
      },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`ElevenLabs error: ${resp.status} - ${err}`);
  }

  const ab = await resp.arrayBuffer();
  return Buffer.from(ab);
}

async function run() {
  console.log('--- GERANDO AMOSTRAS REAIS DA LANDING PAGE COM ELEVENLABS ---');

  const demos = [
    {
      id: 'aud-demo-1',
      file: 'aud-demo-1.mp3',
      voiceId: 'dXQsuVXyCGkF7meZLeFk', // Dany Varejo (Varejo Enérgico Oficial)
      track: 'varejo_alegre',
      volume: 0.18,
      text: 'Atenção clientes do Supermercado! Quarta da Carne com Alcatra Friboi por apenas trinta e seis reais e noventa centavos o quilo! Coxa e sobrecoxa Sadia só oito reais e noventa e nove centavos!',
    },
    {
      id: 'aud-demo-2',
      file: 'aud-demo-2.mp3',
      voiceId: 'zNEsdgTUa3ndwKry8Xcq', // Elvis (Voz de Impacto Grave / Atacarejo)
      track: 'black_friday_urgente',
      volume: 0.20,
      text: 'O fim de semana chegou com tudo! Picanha bovina fatiada grill por só cinquenta e nove reais e noventa centavos o quilo! Cerveja Heineken lata trezentos e cinquenta mililitros bem gelada por quatro e oitenta e nove!',
    },
    {
      id: 'aud-demo-3',
      file: 'aud-demo-3.mp3',
      voiceId: 'cabLxBh81HurPAAJfEHo', // Bea / Carolina (Acolhedora & Amigável)
      track: 'acustico_hortifruti',
      volume: 0.18,
      text: 'Na nossa feirinha hoje tem tomate italiano fresquinho por quatro reais e quarenta e nove centavos o quilo! Banana nanica por apenas três reais e noventa e nove centavos o quilo! Aproveite!',
    },
    {
      id: 'voice_daniel-varejo',
      file: 'voice_daniel-varejo.mp3',
      voiceId: 'dXQsuVXyCGkF7meZLeFk', // Dany Varejo
      track: 'varejo_alegre',
      volume: 0.15,
      text: 'Atenção clientes do Supermercado! Ofertas relâmpago e preços baixos no açougue e mercearia para você encher o carrinho com a maior economia da cidade!',
    },
    {
      id: 'voice_carolina-acolhedora',
      file: 'voice_carolina-acolhedora.mp3',
      voiceId: 'cabLxBh81HurPAAJfEHo', // Bea
      track: 'acustico_hortifruti',
      volume: 0.15,
      text: 'Olá! Sejam muito bem-vindos ao nosso supermercado. Na nossa feirinha e padaria temos produtos fresquinhos e selecionados com todo o carinho para a sua família!',
    },
    {
      id: 'voice_rodrigo-grave',
      file: 'voice_rodrigo-grave.mp3',
      voiceId: 'zNEsdgTUa3ndwKry8Xcq', // Elvis
      track: 'black_friday_urgente',
      volume: 0.18,
      text: 'Atenção clientes! Começou o grande festival de economia e atacarejo! Preços esmagados e as melhores marcas esperando por você!',
    },
  ];

  for (const item of demos) {
    try {
      console.log(`Gerando locução real oficial para ${item.id} (${item.voiceId})...`);
      const voiceBuf = await generateElevenTts(item.voiceId, item.text);
      console.log(` -> Voz gerada com sucesso (${voiceBuf.length} bytes). Mixando trilha ${item.track}...`);
      const mixedBuf = mixVoiceAndSoundtrack(voiceBuf, item.track as any, item.volume);
      const outPath = path.join(AUDIO_DIR, item.file);
      fs.writeFileSync(outPath, mixedBuf);
      console.log(` -> Arquivo final gravado em ${item.file} (${mixedBuf.length} bytes)`);
    } catch (err: any) {
      console.error(`Erro ao gerar ${item.id}:`, err.message);
    }
  }

  console.log('TODAS AS AMOSTRAS REAIS FORAM GERADAS COM SUCESSO!');
}

run();
