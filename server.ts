import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes.ts';
import { audioBinaryStore, saveAudioBinary } from './server/db.ts';
import { convertWavToMp3 } from './server/mp3_converter.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { initializeRealVoiceDemos } from './server/tts.ts';

initializeRealVoiceDemos().catch((e) => console.warn('Real voice demos init warning:', e));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON Body Parser with ample limit for product lists
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // API router
  app.use('/api', apiRouter);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Locução Super IA',
      timestamp: new Date().toISOString(),
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: [
            '**/.locucao_db.json*',
            '**/.locucao_audios/**',
            '**/.locucao_*',
            '**/server/**',
            '**/.env*',
            '**/data/**',
            '**/dist/**',
          ],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Dev] Vite middleware mounted.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Locução Super IA iniciada com sucesso!`);
    console.log(`🔗 Acesso local: http://localhost:${PORT}`);
    console.log(`🔗 Acesso na rede: http://127.0.0.1:${PORT}`);
    console.log(`==================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
