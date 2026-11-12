// Soundboard & Audio Synthesis Utilities for Retail Radio
// High-fidelity synthesized sound effects for supermarket broadcast without requiring external assets.

let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!globalAudioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioCtx = new AudioCtx();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

/**
 * Supermarket Paging Chime (Classic Ding-Dong F5 -> C5)
 * The universal dual-tone supermarket & airport paging announcement chime.
 */
export function playSupermarketChime(volume: number = 0.8) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(volume, now);
  master.connect(ctx.destination);

  // Tone 1: F5 (698.46 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(698.46, now);
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.5, now + 0.03);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
  osc1.connect(gain1);
  gain1.connect(master);
  osc1.start(now);
  osc1.stop(now + 0.85);

  // Tone 2: C5 (523.25 Hz) after 300ms
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(523.25, now + 0.32);
  gain2.gain.setValueAtTime(0, now + 0.32);
  gain2.gain.linearRampToValueAtTime(0.55, now + 0.35);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  osc2.connect(gain2);
  gain2.connect(master);
  osc2.start(now + 0.32);
  osc2.stop(now + 1.5);
}

/**
 * Flash Sale Siren (Oferta Relâmpago)
 * Two-cycle rising/falling urgency siren
 */
export function playFlashSiren(volume: number = 0.7) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(volume, now);
  master.connect(ctx.destination);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';

  // Wave 1
  osc.frequency.setValueAtTime(480, now);
  osc.frequency.linearRampToValueAtTime(880, now + 0.35);
  osc.frequency.linearRampToValueAtTime(480, now + 0.7);
  // Wave 2
  osc.frequency.linearRampToValueAtTime(880, now + 1.05);
  osc.frequency.linearRampToValueAtTime(440, now + 1.4);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
  gain.gain.setValueAtTime(0.25, now + 1.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.45);

  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 1.45);
}

/**
 * Attention Alert Beep (Triple high chime)
 */
export function playAttentionAlert(volume: number = 0.7) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(volume, now);
  master.connect(ctx.destination);

  const freqs = [880, 1108.73, 1318.51]; // A5 -> C#6 -> E6
  freqs.forEach((freq, idx) => {
    const startTime = now + idx * 0.12;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
    osc.connect(gain);
    gain.connect(master);
    osc.start(startTime);
    osc.stop(startTime + 0.4);
  });
}

/**
 * Cash Register "Cha-Ching" (Simulated retail sale / discount)
 */
export function playCashRegister(volume: number = 0.7) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(volume, now);
  master.connect(ctx.destination);

  // High metallic ping 1
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(987.77, now); // B5
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.4, now + 0.02);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc1.connect(gain1);
  gain1.connect(master);
  osc1.start(now);
  osc1.stop(now + 0.5);

  // Metallic ping 2
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1318.51, now + 0.12); // E6
  gain2.gain.setValueAtTime(0, now + 0.12);
  gain2.gain.linearRampToValueAtTime(0.45, now + 0.14);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc2.connect(gain2);
  gain2.connect(master);
  osc2.start(now + 0.12);
  osc2.stop(now + 0.8);
}

/**
 * Live Microphone Broadcaster (Push-To-Talk)
 * Streams local microphone directly to store sound system output with live VU level monitoring
 */
export class LiveMicrophoneBroadcaster {
  private mediaStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isBroadcasting: boolean = false;

  public get isActive(): boolean {
    return this.isBroadcasting;
  }

  async start(
    onVuLevel?: (vuPercent: number) => void,
    gainBoost: number = 1.3
  ): Promise<boolean> {
    if (this.isBroadcasting) return true;

    try {
      this.audioCtx = getAudioContext();
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.micSource = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(gainBoost, this.audioCtx.currentTime);

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;

      // Pipe to speakers
      this.micSource.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);

      this.isBroadcasting = true;

      // VU Meter loop
      if (onVuLevel && this.analyserNode) {
        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        const updateVu = () => {
          if (!this.isBroadcasting || !this.analyserNode) return;
          this.analyserNode.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const vuPct = Math.min(100, Math.round((average / 128) * 100));
          onVuLevel(vuPct);
          this.animFrameId = requestAnimationFrame(updateVu);
        };
        updateVu();
      }

      return true;
    } catch (err) {
      console.error('Failed to open microphone:', err);
      this.stop();
      return false;
    }
  }

  stop() {
    this.isBroadcasting = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {}
      this.micSource = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
      this.gainNode = null;
    }
    if (this.analyserNode) {
      try {
        this.analyserNode.disconnect();
      } catch {}
      this.analyserNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
  }
}

export type TimeChimeSoundType = 'moderno' | 'cristalino' | 'classico';

/**
 * Toca uma nota acústica com ressonância harmônica (estilo carrilhão / vibrafone / marimba de rádio)
 */
function playAcousticBell(
  ctx: AudioContext,
  master: GainNode,
  freq: number,
  startTime: number,
  duration: number = 1.2,
  options?: { subBassFreq?: number; shimmerGain?: number }
) {
  // 1. Frequência Fundamental (Corpo do sino)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, startTime);

  gain1.gain.setValueAtTime(0, startTime);
  gain1.gain.linearRampToValueAtTime(0.58, startTime + 0.015);
  gain1.gain.exponentialRampToValueAtTime(0.0006, startTime + duration);

  osc1.connect(gain1);
  gain1.connect(master);
  osc1.start(startTime);
  osc1.stop(startTime + duration);

  // 2. Harmônico Superior Oitava (Brilho e presença acústica calorosa)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2, startTime);

  gain2.gain.setValueAtTime(0, startTime);
  gain2.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.0006, startTime + (duration * 0.75));

  osc2.connect(gain2);
  gain2.connect(master);
  osc2.start(startTime);
  osc2.stop(startTime + duration);

  // 3. Shimmer Cintilante (Harmônico metálico de sino límpido)
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'triangle';
  osc3.frequency.setValueAtTime(freq * 3.02, startTime);

  const shimmerVol = options?.shimmerGain ?? 0.14;
  gain3.gain.setValueAtTime(0, startTime);
  gain3.gain.linearRampToValueAtTime(shimmerVol, startTime + 0.008);
  gain3.gain.exponentialRampToValueAtTime(0.0006, startTime + (duration * 0.45));

  osc3.connect(gain3);
  gain3.connect(master);
  osc3.start(startTime);
  osc3.stop(startTime + duration);

  // 4. Sub-Grave aveludado opcional (para o acorde majestoso de encerramento)
  if (options?.subBassFreq) {
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(options.subBassFreq, startTime);

    subGain.gain.setValueAtTime(0, startTime);
    subGain.gain.linearRampToValueAtTime(0.38, startTime + 0.02);
    subGain.gain.exponentialRampToValueAtTime(0.0006, startTime + duration);

    subOsc.connect(subGain);
    subGain.connect(master);
    subOsc.start(startTime);
    subOsc.stop(startTime + duration);
  }
}

/**
 * Chamada Sonora de Hora Certa para Rádio Comercial
 * Gera toques modernos, atrativos e musicais antes do anúncio vocal.
 * - 'moderno': Arpejo musical sofisticado e acolhedor (Dó5 -> Mi5 -> Sol5 -> Dó6 + Dó4) com cauda acústica
 * - 'cristalino': Chime leve e brilhante (Fá5 -> Lá5 -> Dó6 -> Fá6) estilo glockenspiel
 * - 'classico': 3 bips curtos e 1 longo com atenuação suave
 */
export function playRadioTimePips(
  volume: number = 0.85,
  soundType: TimeChimeSoundType = 'moderno'
): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(volume, now);
      master.connect(ctx.destination);

      if (soundType === 'cristalino') {
        // Sequência Cristalina estilo Glockenspiel / Marimba leve
        // Fá5 (698.46 Hz) -> Lá5 (880.00 Hz) -> Dó6 (1046.50 Hz) -> Fá6 (1396.91 Hz)
        const notes = [
          { freq: 698.46, time: 0.00, dur: 0.9 },
          { freq: 880.00, time: 0.32, dur: 0.9 },
          { freq: 1046.50, time: 0.64, dur: 1.0 },
          { freq: 1396.91, time: 0.98, dur: 1.35, sub: 349.23 },
        ];

        notes.forEach(n => {
          playAcousticBell(ctx, master, n.freq, now + n.time, n.dur, {
            subBassFreq: n.sub,
            shimmerGain: 0.18,
          });
        });

        setTimeout(resolve, 2350);
        return;
      }

      if (soundType === 'classico') {
        // Sinal Horário Clássico com envelope arredondado suave
        const shortPips = [0, 0.55, 1.1];
        shortPips.forEach((startTime) => {
          const t = now + startTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(980, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.5, t + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

          osc.connect(gain);
          gain.connect(master);
          osc.start(t);
          osc.stop(t + 0.15);
        });

        const finalPipTime = now + 1.65;
        const oscFinal = ctx.createOscillator();
        const gainFinal = ctx.createGain();
        oscFinal.type = 'sine';
        oscFinal.frequency.setValueAtTime(1480, finalPipTime);

        gainFinal.gain.setValueAtTime(0, finalPipTime);
        gainFinal.gain.linearRampToValueAtTime(0.65, finalPipTime + 0.02);
        gainFinal.gain.exponentialRampToValueAtTime(0.001, finalPipTime + 0.6);

        oscFinal.connect(gainFinal);
        gainFinal.connect(master);
        oscFinal.start(finalPipTime);
        oscFinal.stop(finalPipTime + 0.65);

        setTimeout(resolve, 2300);
        return;
      }

      // Padrão: 'moderno' (Chime Comercial Elegante & Cativante de Rádio FM)
      // Dó5 (523.25 Hz) -> Mi5 (659.25 Hz) -> Sol5 (783.99 Hz) -> Dó6 (1046.50 Hz) + Dó4 (261.63 Hz)
      const modernNotes = [
        { freq: 523.25, time: 0.00, dur: 1.05 },
        { freq: 659.25, time: 0.35, dur: 1.05 },
        { freq: 783.99, time: 0.70, dur: 1.15 },
        { freq: 1046.50, time: 1.08, dur: 1.35, sub: 261.63 },
      ];

      modernNotes.forEach(n => {
        playAcousticBell(ctx, master, n.freq, now + n.time, n.dur, {
          subBassFreq: n.sub,
          shimmerGain: 0.15,
        });
      });

      setTimeout(resolve, 2400);
    } catch (e) {
      console.warn('Erro ao reproduzir chamada da hora certa:', e);
      resolve();
    }
  });
}


