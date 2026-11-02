import fs from 'fs';
import path from 'path';
import https from 'https';

const VPS_URL = 'https://superlocucao.inforartes.com.br';
const AUDIOS_DIR = path.resolve(process.cwd(), '.locucao_audios');

async function uploadFile(fileName: string): Promise<boolean> {
  const filePath = path.join(AUDIOS_DIR, fileName);
  const id = fileName.replace(/\.(mp3|wav)$/i, '');
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString('base64');

  const payload = JSON.stringify({
    id,
    filename: fileName,
    mimeType: fileName.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg',
    fileBase64: base64,
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
        timeout: 30000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            console.warn(`[Fail] ${fileName}: HTTP ${res.statusCode} - ${body.slice(0, 100)}`);
            resolve(false);
          }
        });
      }
    );

    req.on('error', (err) => {
      console.warn(`[Error] ${fileName}:`, err.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  if (!fs.existsSync(AUDIOS_DIR)) {
    console.error('Pasta .locucao_audios não encontrada.');
    return;
  }

  const files = fs.readdirSync(AUDIOS_DIR).filter((f) => f.endsWith('.mp3'));
  console.log(`Iniciando sincronização de ${files.length} áudios para ${VPS_URL}...`);

  let successCount = 0;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const ok = await uploadFile(f);
    if (ok) successCount++;
    if ((i + 1) % 10 === 0 || i === files.length - 1) {
      console.log(`Progresso: ${i + 1}/${files.length} (${successCount} enviados)`);
    }
  }

  console.log(`\nSincronização concluída! ${successCount}/${files.length} arquivos enviados com sucesso.`);
}

run();

