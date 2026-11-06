import fs from 'fs';
import path from 'path';
import https from 'https';

const VPS_URL = 'https://superlocucao.inforartes.com.br';
const DIRS_TO_SCAN = [
  path.resolve(process.cwd(), 'server', 'seed_audios'),
  path.resolve(process.cwd(), '.locucao_audios')
];

async function uploadFile(filePath: string, fileName: string): Promise<boolean> {
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
  const seenFiles = new Map<string, string>();

  for (const dir of DIRS_TO_SCAN) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp3') || f.endsWith('.wav'));
    for (const file of files) {
      if (!seenFiles.has(file)) {
        seenFiles.set(file, path.join(dir, file));
      }
    }
  }

  const entries = Array.from(seenFiles.entries());
  console.log(`Iniciando sincronização de ${entries.length} áudios para ${VPS_URL}...\n`);

  // Prioritize demo audios first
  entries.sort(([a], [b]) => {
    const aPriority = a.startsWith('aud-demo') || a.startsWith('voice_') || a.startsWith('style_') ? 1 : 0;
    const bPriority = b.startsWith('aud-demo') || b.startsWith('voice_') || b.startsWith('style_') ? 1 : 0;
    return bPriority - aPriority;
  });

  let successCount = 0;
  for (let i = 0; i < entries.length; i++) {
    const [fileName, filePath] = entries[i];
    const ok = await uploadFile(filePath, fileName);
    if (ok) successCount++;
    console.log(`[${i + 1}/${entries.length}] ${ok ? '✓' : '✗'} ${fileName}`);
  }

  console.log(`\nSincronização concluída! ${successCount}/${entries.length} arquivos enviados com sucesso para a VPS.`);
}

run();

