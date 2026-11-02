import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const files = [
  { id: 'batida_comercial', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Cipher_%28ISRC_USUAN1100844%29.mp3' },
  { id: 'black_friday_urgente', url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Call_to_Adventure_%28ISRC_USUAN1300022%29.mp3' },
  { id: 'acustico_hortifruti', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Life_of_Riley_%28ISRC_USUAN1400054%29.mp3' },
  { id: 'institucional_gourmet', url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Airport_Lounge_%28ISRC_USUAN1100806%29.mp3' }
];

const targetDir = path.resolve('.locucao_audios');

for (const f of files) {
  const outPath = path.join(targetDir, `soundtrack_${f.id}.mp3`);
  console.log(`Downloading ${f.id}...`);
  execSync(`curl.exe -s -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -o "${outPath}" "${f.url}"`, { stdio: 'inherit' });
  if (fs.existsSync(outPath)) {
    console.log(`Saved ${outPath}: ${fs.statSync(outPath).size} bytes`);
  }
}

console.log('All downloads completed!');
