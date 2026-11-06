import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function main() {
  const argUrl = process.argv[2];
  const dbUrl = argUrl || process.env.DATABASE_URL;

  console.log('========================================================');
  console.log('🎙️ SINCRONIZADOR DE LOCUÇÕES REAIS PARA O BANCO DE DADOS (VPS)');
  console.log('========================================================\n');

  if (!dbUrl) {
    console.error('❌ ERRO: Nenhuma URL de conexão PostgreSQL foi informada.');
    console.log('\nComo usar:');
    console.log('  npx tsx scripts/sync_audios_to_vps.ts "postgresql://usuario:senha@ip-da-vps:5432/nomedobanco"');
    console.log('Ou configure DATABASE_URL no seu arquivo .env\n');
    process.exit(1);
  }

  const cleanUrlForDisplay = dbUrl.replace(/:[^:@]+@/, ':****@');
  console.log(`🔌 Conectando ao PostgreSQL: ${cleanUrlForDisplay}...`);

  const useSsl = dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true') || dbUrl.includes('supabase.co');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : false
  });

  try {
    await pool.query('SELECT 1');
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!\n');

    console.log('📦 Verificando/Criando tabela "audio_binaries"...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audio_binaries (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        mime_type TEXT NOT NULL DEFAULT 'audio/mpeg',
        file_size INTEGER NOT NULL DEFAULT 0,
        data_base64 TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_audio_binaries_id ON audio_binaries(id);
    `);
    console.log('✅ Tabela "audio_binaries" pronta!\n');

    const dirsToScan = [
      path.resolve(process.cwd(), 'server', 'seed_audios'),
      path.resolve(process.cwd(), '.locucao_audios')
    ];

    const seenIds = new Set<string>();
    const filesToUpload: { id: string; file: string; filePath: string; mimeType: string }[] = [];

    for (const dir of dirsToScan) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (!file.endsWith('.mp3') && !file.endsWith('.wav')) continue;
        const id = file.replace(/\.(mp3|wav)$/i, '');
        if (seenIds.has(id)) continue;
        seenIds.add(id);

        filesToUpload.push({
          id,
          file,
          filePath: path.join(dir, file),
          mimeType: file.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg'
        });
      }
    }

    console.log(`🔍 Encontradas ${filesToUpload.length} locuções e áudios reais para processar.`);
    console.log('🚀 Iniciando envio para o PostgreSQL da VPS...\n');

    let uploaded = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < filesToUpload.length; i++) {
      const item = filesToUpload[i];
      try {
        const buffer = fs.readFileSync(item.filePath);
        const base64Data = buffer.toString('base64');

        await pool.query(`
          INSERT INTO audio_binaries (id, filename, mime_type, file_size, data_base64, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT (id) DO UPDATE SET
            filename = EXCLUDED.filename,
            mime_type = EXCLUDED.mime_type,
            file_size = EXCLUDED.file_size,
            data_base64 = EXCLUDED.data_base64,
            updated_at = NOW();
        `, [item.id, item.file, item.mimeType, buffer.length, base64Data]);

        uploaded++;
        process.stdout.write(`\r  [${i + 1}/${filesToUpload.length}] Enviado: ${item.file.padEnd(45)} (${(buffer.length / 1024).toFixed(1)} KB)`);
      } catch (err: any) {
        errors++;
        console.error(`\n❌ Falha ao enviar ${item.file}:`, err.message);
      }
    }

    console.log('\n\n========================================================');
    console.log(`🎉 SUCESSO! ${uploaded} locuções reais sincronizadas com a VPS!`);
    if (errors > 0) console.log(`⚠️ Avisos: ${errors} erros durante o upload.`);
    console.log('========================================================\n');
  } catch (err: any) {
    console.error('❌ Falha na conexão ou execução do PostgreSQL:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);

