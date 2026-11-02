import fs from 'fs';
import path from 'path';
import { mixVoiceAndSoundtrack } from '../server/soundtracks.ts';

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_140d10dcdc705e07ae8a1a65ce5d8fc3675f06082a590f40';
const AUDIO_DIR = path.resolve(process.cwd(), '.locucao_audios');

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
  console.log('Gerando áudio exclusivo para o Hero Demo com Dany Varejo...');
  const heroText = 'Atenção clientes! Temos uma oferta especial esperando por você! Arroz Primavera pacote de cinco quilos por apenas vinte e quatro reais e noventa e nove centavos! E leite Italac por só quatro reais e quarenta e nove centavos o litro! Corra e aproveite!';
  
  const voiceBuf = await generateElevenTts('dXQsuVXyCGkF7meZLeFk', heroText);
  const mixedBuf = mixVoiceAndSoundtrack(voiceBuf, 'varejo_alegre', 0.18);
  
  const outPath = path.join(AUDIO_DIR, 'aud-hero-demo.mp3');
  fs.writeFileSync(outPath, mixedBuf);
  console.log(`Hero demo gerado com sucesso: ${mixedBuf.length} bytes!`);
}

run();
