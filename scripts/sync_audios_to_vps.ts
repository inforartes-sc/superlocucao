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

    console.log('📦 Verificando/Criando tabelas no PostgreSQL...');
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

      CREATE TABLE IF NOT EXISTS admin_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        default_voice_id TEXT DEFAULT 'daniel-varejo',
        credits_per_generation INTEGER DEFAULT 5,
        initial_credits INTEGER DEFAULT 50,
        eleven_labs_model TEXT DEFAULT 'eleven_multilingual_v2',
        gemini_model TEXT DEFAULT 'gemini-3.8-flash',
        system_announcement TEXT,
        recharge_packages JSONB,
        commercial_plans JSONB,
        payment_gateway JSONB,
        subscriptions JSONB,
        payments JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS recharge_packages JSONB;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS commercial_plans JSONB;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS payment_gateway JSONB;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS subscriptions JSONB;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS payments JSONB;
    `);
    console.log('✅ Tabelas verificadas e prontas!\n');

    // Sincronizar dados de .locucao_db.json
    const dbJsonPath = path.resolve(process.cwd(), '.locucao_db.json');
    if (fs.existsSync(dbJsonPath)) {
      try {
        console.log('📄 Sincronizando usuários, projetos e planos de .locucao_db.json...');
        const localData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));

        if (Array.isArray(localData.users)) {
          for (const u of localData.users) {
            await pool.query(`
              INSERT INTO profiles (id, name, email, phone, company_name, city, role, plan, status, notes, credits_balance, created_at, last_login)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone,
                company_name = EXCLUDED.company_name, city = EXCLUDED.city, role = EXCLUDED.role,
                plan = EXCLUDED.plan, status = EXCLUDED.status, notes = EXCLUDED.notes,
                credits_balance = EXCLUDED.credits_balance, last_login = EXCLUDED.last_login;
            `, [
              u.id, u.name, u.email, u.phone || null, u.companyName, u.city || null,
              u.role, u.plan, u.status || 'ativo', u.notes || null, u.creditsBalance,
              u.createdAt || new Date().toISOString(), u.lastLogin || new Date().toISOString()
            ]);
          }
          console.log(`  ✓ ${localData.users.length} usuários sincronizados.`);
        }

        if (Array.isArray(localData.projects)) {
          for (const p of localData.projects) {
            await pool.query(`
              INSERT INTO projects (
                id, user_id, title, store_name, store_city, objective,
                campaign_type, style, desired_duration, tone, presentation_format,
                custom_opening, custom_closing, free_instructions, products, scripts,
                current_script_index, audios, soundtrack_id, soundtrack_volume, status,
                created_at, updated_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                $15::jsonb, $16::jsonb, $17, $18::jsonb, $19, $20, $21, $22, $23
              )
              ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title, store_name = EXCLUDED.store_name, store_city = EXCLUDED.store_city,
                objective = EXCLUDED.objective, campaign_type = EXCLUDED.campaign_type, style = EXCLUDED.style,
                desired_duration = EXCLUDED.desired_duration, tone = EXCLUDED.tone,
                presentation_format = EXCLUDED.presentation_format, custom_opening = EXCLUDED.custom_opening,
                custom_closing = EXCLUDED.custom_closing, free_instructions = EXCLUDED.free_instructions,
                products = EXCLUDED.products, scripts = EXCLUDED.scripts,
                current_script_index = EXCLUDED.current_script_index, audios = EXCLUDED.audios,
                soundtrack_id = EXCLUDED.soundtrack_id, soundtrack_volume = EXCLUDED.soundtrack_volume,
                status = EXCLUDED.status, updated_at = EXCLUDED.updated_at;
            `, [
              p.id, p.userId, p.title, p.storeName || '', p.storeCity || '', p.objective || '',
              p.campaignType || 'ofertas_dia', p.style || 'energetica_supermercado',
              p.desiredDuration || '30s', p.tone || 'persuasivo',
              p.presentationFormat || 'abertura_sequencia_encerramento',
              p.customOpening || '', p.customClosing || '', p.freeInstructions || '',
              JSON.stringify(p.products || []), JSON.stringify(p.scripts || []),
              p.currentScriptIndex || 0, JSON.stringify(p.audios || []),
              p.soundtrackId || 'sem_trilha', p.soundtrackVolume || 0.2, p.status || 'draft',
              p.createdAt || new Date().toISOString(), p.updatedAt || new Date().toISOString()
            ]);
          }
          console.log(`  ✓ ${localData.projects.length} projetos sincronizados.`);
        }

        if (localData.adminSettings) {
          const s = localData.adminSettings;
          await pool.query(`
            INSERT INTO admin_settings (
              id, default_voice_id, credits_per_generation, initial_credits,
              eleven_labs_model, system_announcement, recharge_packages, commercial_plans,
              payment_gateway, subscriptions, payments, updated_at
            ) VALUES (
              1, $1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
              default_voice_id = EXCLUDED.default_voice_id,
              credits_per_generation = EXCLUDED.credits_per_generation,
              initial_credits = EXCLUDED.initial_credits,
              eleven_labs_model = EXCLUDED.eleven_labs_model,
              system_announcement = EXCLUDED.system_announcement,
              recharge_packages = EXCLUDED.recharge_packages,
              commercial_plans = EXCLUDED.commercial_plans,
              payment_gateway = EXCLUDED.payment_gateway,
              subscriptions = EXCLUDED.subscriptions,
              payments = EXCLUDED.payments,
              updated_at = NOW();
          `, [
            s.defaultVoiceId || 'daniel-varejo',
            s.creditsPerGeneration || 5,
            s.initialCredits || 50,
            s.elevenLabsModel || 'eleven_multilingual_v2',
            s.systemAnnouncement || null,
            JSON.stringify(s.rechargePackages || []),
            JSON.stringify(s.commercialPlans || []),
            JSON.stringify(s.paymentGateway || {}),
            JSON.stringify(s.subscriptions || []),
            JSON.stringify(s.payments || [])
          ]);
          console.log('  ✓ Configurações de planos, pacotes e gateway sincronizados.');
        }
      } catch (err: any) {
        console.warn('⚠️ Aviso ao sincronizar .locucao_db.json:', err.message);
      }
    }

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

