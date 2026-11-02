import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const audioDir = path.resolve('.locucao_audios');
const userAudio = path.join(audioDir, 'user_downloaded_sample.mp3');
const trackPath = path.join(audioDir, 'soundtrack_varejo_alegre.mp3');
const outTest1 = path.join(audioDir, 'test_mix_sidechain.mp3');

// Sidechain ducking filter test:
// [0:a] is voice (44.1kHz stereo normalized)
// [1:a] is music (44.1kHz stereo)
// sidechaincompress: music is automatically compressed whenever voice is present, and swells up in pauses / outro
const filter = [
  // Resample & convert voice to 44.1kHz stereo
  '[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=1.0[vox]',
  // Resample music, set initial volume to 0.18
  '[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.20[music]',
  // Duck music with voice as key (threshold 0.125, ratio 4:1, attack 20ms, release 300ms)
  '[music][vox]sidechaincompress=threshold=0.10:ratio=5:attack=20:release=350[ducked_music]',
  // Mix vox and ducked_music
  '[vox][ducked_music]amix=inputs=2:duration=first:dropout_transition=2[mixed]',
  // Soft limiter to prevent ANY clipping distortion (ceiling -1.0dB)
  '[mixed]alimiter=limit=0.89:attack=5:release=50[out]'
].join(';');

const cmd = `ffmpeg -y -i "${userAudio}" -stream_loop -1 -i "${trackPath}" -filter_complex "${filter}" -map "[out]" -b:a 192k "${outTest1}"`;

console.log('Running test ffmpeg...');
execSync(cmd, { stdio: 'inherit' });
console.log('Finished! Size:', fs.statSync(outTest1).size);
