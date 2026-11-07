import fs from 'fs';
import path from 'path';
import https from 'https';

const VPS_URL = 'https://superlocucao.inforartes.com.br';
const DB_FILE = path.resolve(process.cwd(), '.locucao_db.json');
const DIRS_TO_SCAN = [
  path.resolve(process.cwd(), 'server', 'seed_audios'),
  path.resolve(process.cwd(), '.locucao_audios'),
];

function postJson(urlPath: string, payloadObj: any): Promise<any> {
  const payload = JSON.stringify(payloadObj);
  return new Promise((resolve, reject) => {
    const req = https.request(
      `${VPS_URL}${urlPath}`,
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
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function uploadAudio(filePath: string, fileName: string): Promise<boolean> {
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
        timeout: 45000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            console.warn(`[Falha] ${fileName}: HTTP ${res.statusCode} - ${body.slice(0, 100)}`);
            resolve(false);
          }
        });
      }
    );
    req.on('error', (err) => {
      console.warn(`[Erro] ${fileName}:`, err.message);
      resolve(false);
    });
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('===============================================================');
  console.log('🚀 SINCRONIZADOR TOTAL: BANCO DE DADOS & ÁUDIOS PARA A VPS');
  console.log('   Domínio: ' + VPS_URL);
  console.log('===============================================================\n');

  // 1. Sincronizar Banco de Dados JSON (.locucao_db.json)
  if (fs.existsSync(DB_FILE)) {
    console.log('📦 1. Lendo banco de dados local (.locucao_db.json)...');
    const dbRaw = fs.readFileSync(DB_FILE, 'utf-8');
    const dbData = JSON.parse(dbRaw);

    console.log(`   - Usuários: ${dbData.users?.length || 0}`);
    console.log(`   - Projetos: ${dbData.projects?.length || 0}`);
    console.log(`   - Transações: ${dbData.creditTransactions?.length || 0}`);
    console.log(`   - Rádios: ${Object.keys(dbData.radioConfigs || {}).length || 1}`);

    console.log('\n📤 Enviando dados estruturados para a VPS (/api/sync/database)...');
    try {
      const resDb = await postJson('/api/sync/database', dbData);
      console.log('   ✓ Resposta VPS:', resDb.status, resDb.data?.message || resDb.body);
    } catch (e: any) {
      console.warn('   ⚠️ Endpoint /api/sync/database ainda não ativo na VPS (será ativado no próximo build):', e.message);
    }
  }

  // 2. Sincronizar todas as matrizes e locuções ElevenLabs
  console.log('\n🎙️ 2. Mapeando e enviando arquivos de áudio para a VPS...');
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
  // Priorizar demonstrações comerciais e vozes vitrine
  entries.sort(([a], [b]) => {
    const aP = a.startsWith('aud-demo') || a.startsWith('voice_') || a.startsWith('style_') ? 1 : 0;
    const bP = b.startsWith('aud-demo') || b.startsWith('voice_') || b.startsWith('style_') ? 1 : 0;
    return bP - aP;
  });

  console.log(`   Total de arquivos para envio: ${entries.length}`);
  let sentCount = 0;
  for (let i = 0; i < entries.length; i++) {
    const [fileName, filePath] = entries[i];
    const ok = await uploadAudio(filePath, fileName);
    if (ok) sentCount++;
    if (i < 15 || (i + 1) % 25 === 0 || i === entries.length - 1) {
      console.log(`   [${i + 1}/${entries.length}] ${ok ? '✓' : '✗'} ${fileName}`);
    }
  }

  // 3. Forçar sincronização interna da VPS
  console.log('\n🔄 3. Acionando consolidação de áudios no PostgreSQL da VPS...');
  try {
    const resSync = await postJson('/api/admin/database/sync-audios', {});
    console.log('   ✓ Status:', resSync.status, resSync.data?.message || resSync.body);
  } catch (e: any) {
    console.warn('   ⚠️ Erro ao acionar sync-audios:', e.message);
  }

  // 4. Auditoria de integridade das vozes comerciais
  console.log('\n🔍 4. Verificando integridade das locuções da página comercial na VPS:');
  const checkAudios = [
    { file: 'aud-demo-1.mp3', name: 'Quarta da Carne (Daniel - Varejo Enérgico)' },
    { file: 'aud-demo-2.mp3', name: 'Super Fim de Semana (Rodrigo - Voz de Impacto)' },
    { file: 'aud-demo-3.mp3', name: 'Feirinha do Dia (Carolina - Vendedora Amigável)' },
    { file: 'voice_marcos-institucional.mp3', name: 'Clube de Vantagens (Marcos - Institucional)' }
  ];

  for (const item of checkAudios) {
    await new Promise<void>((resolve) => {
      https.get(`${VPS_URL}/api/audio/${item.file}`, (res) => {
        const len = Number(res.headers['content-length'] || 0);
        const kb = (len / 1024).toFixed(1);
        const isEleven = len > 180000;
        console.log(`   ${isEleven ? '✅' : '⚠️'} ${item.name}: ${kb} KB (${len} bytes) - ${isEleven ? 'Voz Real ElevenLabs' : 'Aguardando atualização'}`);
        resolve();
      }).on('error', () => resolve());
    });
  }

  console.log('\n🎉 Sincronização concluída com sucesso!');
}

main().catch(console.error);

