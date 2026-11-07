import fs from 'fs';
import path from 'path';
import https from 'https';
import { mixVoiceAndSoundtrack } from '../server/soundtracks.ts';
import { convertWavToMp3 } from '../server/mp3_converter.ts';

const ELEVEN_KEY = 'sk_140d10dcdc705e07ae8a1a65ce5d8fc3675f06082a590f40';
const VPS_URL = 'https://superlocucao.inforartes.com.br';

const SPOTS = [
  {
    id: 'aud-vitrine-padaria',
    voiceName: 'Mariana (Voz Jovem & Dinâmica)',
    voiceId: 'AKXBn24T1f9tvTDnWzWT', // Mariana / Bruna Costa
    soundtrackId: 'varejo_alegre' as const,
    soundtrackVol: 0.18,
    text: 'Atenção clientes! Tem fornada fresquinha saindo agora na nossa padaria! Pão francês crocante quentinho a toda hora, além de bolos caseiros e salgados com preços especiais. Venha sentir esse aroma irresistível no setor de panificação!',
  },
  {
    id: 'aud-vitrine-atacarejo',
    voiceName: 'Nassif (Oferta Relâmpago & Varejo Rápido)',
    voiceId: 'Fjiik8aKXNDjmxd1Q2jF', // Nassif
    soundtrackId: 'black_friday_urgente' as const,
    soundtrackVol: 0.18,
    text: 'Atenção: começou a grande queima de estoque em toda a mercearia e limpeza! Arroz cinco quilos, óleo de soja e sabão em pó com preços de atacado para você encher o carrinho e pagar muito menos! É por tempo limitado, aproveite!',
  },
  {
    id: 'aud-vitrine-adega',
    voiceName: 'Will (Premium & Gourmet)',
    voiceId: 'IKpiSijWzlhOL6uX83EH', // Will
    soundtrackId: 'institucional_gourmet' as const,
    soundtrackVol: 0.20,
    text: 'Aprecie os melhores momentos com a nossa seleção exclusiva de vinhos nacionais, importados e queijos nobres. Visite o nosso espaço gourmet e descubra rótulos selecionados com descontos especiais para harmonizar com o seu jantar de hoje.',
  },
  {
    id: 'aud-vitrine-app',
    voiceName: 'Roberta (Moderna & Comunicativa)',
    voiceId: 'ohZOfA9iwlZ5nOsoY7LB', // Roberta
    soundtrackId: 'batida_comercial' as const,
    soundtrackVol: 0.18,
    text: 'Você já baixou o aplicativo da nossa rede? Baixe agora no seu celular, ative os cupons de desconto exclusivos e receba ofertas direto no caixa. Economizar de verdade é simples, rápido e direto na tela do seu celular!',
  },
];

async function synthesizeEleven(voiceId: string, text: string): Promise<Buffer> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVEN_KEY,
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.35,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs error ${response.status}: ${err}`);
  }

  const arr = await response.arrayBuffer();
  return Buffer.from(arr);
}

function uploadToVps(id: string, fileName: string, buffer: Buffer): Promise<boolean> {
  const payload = JSON.stringify({
    id,
    filename: fileName,
    mimeType: 'audio/mpeg',
    fileBase64: buffer.toString('base64'),
  });

  return new Promise((resolve) => {
    const req = https.request(
      `${VPS_URL}/api/sync/audio`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 45000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            console.warn(`[VPS Upload Fail] ${fileName}: HTTP ${res.statusCode} - ${body.slice(0, 100)}`);
            resolve(false);
          }
        });
      }
    );
    req.on('error', (err) => {
      console.warn(`[VPS Upload Error] ${fileName}:`, err.message);
      resolve(false);
    });
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('===============================================================');
  console.log('🎙️ GERANDO NOVAS AMOSTRAS DE VOZES REAIS ELEVENLABS PARA A VITRINE');
  console.log('===============================================================\n');

  const seedDir = path.resolve(process.cwd(), 'server', 'seed_audios');
  const localDir = path.resolve(process.cwd(), '.locucao_audios');
  if (!fs.existsSync(seedDir)) fs.mkdirSync(seedDir, { recursive: true });
  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

  for (const spot of SPOTS) {
    console.log(`🎙️ Sintetizando [${spot.id}] com ElevenLabs: ${spot.voiceName}...`);
    try {
      const voiceMp3 = await synthesizeEleven(spot.voiceId, spot.text);
      console.log(`   ✓ Voz pura gerada: ${(voiceMp3.length / 1024).toFixed(1)} KB`);

      console.log(`   🎵 Mixando com trilha "${spot.soundtrackId}" (vol: ${spot.soundtrackVol})...`);
      let finalMp3: Buffer;
      try {
        finalMp3 = mixVoiceAndSoundtrack(voiceMp3, spot.soundtrackId, spot.soundtrackVol);
      } catch (e) {
        console.warn('   ⚠️ Mix falhou, usando voz pura:', e);
        finalMp3 = voiceMp3;
      }

      const fileName = `${spot.id}.mp3`;
      fs.writeFileSync(path.join(seedDir, fileName), finalMp3);
      fs.writeFileSync(path.join(localDir, fileName), finalMp3);
      console.log(`   💾 Salvo localmente em seed_audios e .locucao_audios (${(finalMp3.length / 1024).toFixed(1)} KB)`);

      console.log(`   📤 Enviando para VPS (${VPS_URL})...`);
      const ok = await uploadToVps(spot.id, fileName, finalMp3);
      console.log(`   ${ok ? '✅' : '❌'} Envio para VPS concluído!\n`);
    } catch (err: any) {
      console.error(`   ❌ Erro ao gerar ${spot.id}:`, err.message);
    }
  }

  console.log('🎉 Todas as 4 novas demonstrações de vozes reais foram geradas e sincronizadas!');
}

main().catch(console.error);

