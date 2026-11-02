/**
 * Intelligent Broadcast Vocal Leveler & Normalizer (Web Audio API)
 *
 * Ensures all voiceover spots (whether quiet or loud) play at a consistent,
 * crystal-clear broadcast loudness level with:
 *  1. High-Pass Filter (85 Hz) to clean low-frequency mud
 *  2. Vocal Presence EQ Boost (+3.5 dB @ 2.8 kHz) for speech intelligibility
 *  3. Real-Time Automatic Gain Control (AGC) that measures speech RMS energy
 *     and automatically boosts quiet voices (up to +11 dB / 3.5x) while keeping
 *     loud voices balanced
 *  4. Broadcast Dynamics Compressor + Limiter so peaks never clip or distort
 */

export interface BroadcastVoiceProcessor {
  audioContext: AudioContext;
  userGainNode: GainNode;
  agcGainNode: GainNode;
  compressorNode: DynamicsCompressorNode;
  setUserVolume: (volumeMultiplier: number) => void;
  setNormalizerEnabled: (enabled: boolean) => void;
  getCurrentGainDb: () => number;
  resetAgcForNewTrack: () => void;
}

const processorMap = new WeakMap<HTMLMediaElement, BroadcastVoiceProcessor>();
let sharedAudioContext: AudioContext | null = null;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

/**
 * Attaches the Intelligent Broadcast Vocal Leveler to an HTMLAudioElement.
 * Safe to call multiple times on the same element (returns cached processor).
 */
export function attachVoiceNormalizer(
  audioEl: HTMLMediaElement | null,
  options?: {
    initialUserVolume?: number;
    enabled?: boolean;
    onGainChange?: (gainDb: number) => void;
  }
): BroadcastVoiceProcessor | null {
  if (!audioEl) return null;

  const existing = processorMap.get(audioEl);
  if (existing) {
    if (existing.audioContext.state === 'suspended') {
      existing.audioContext.resume().catch(() => {});
    }
    if (options?.initialUserVolume !== undefined) {
      existing.setUserVolume(options.initialUserVolume);
    }
    if (options?.enabled !== undefined) {
      existing.setNormalizerEnabled(options.enabled);
    }
    return existing;
  }

  const ctx = getOrCreateAudioContext();
  if (!ctx) return null;

  try {
    const source = ctx.createMediaElementSource(audioEl);

    // 1. High-pass filter at 85 Hz to remove rumble
    const highPass = ctx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 85;
    highPass.Q.value = 0.7;

    // 2. Vocal Presence & Articulation Boost at 2.8 kHz (+4 dB for clear speech in store speakers)
    const presenceEq = ctx.createBiquadFilter();
    presenceEq.type = 'peaking';
    presenceEq.frequency.value = 2800;
    presenceEq.Q.value = 1.1;
    presenceEq.gain.value = 4.0;

    // 3. Warmth body filter at 220 Hz (+1.5 dB so thin voices sound fuller)
    const bodyEq = ctx.createBiquadFilter();
    bodyEq.type = 'peaking';
    bodyEq.frequency.value = 220;
    bodyEq.Q.value = 1.0;
    bodyEq.gain.value = 1.5;

    // 4. Analyser before AGC to measure true input speech RMS
    const inputAnalyser = ctx.createAnalyser();
    inputAnalyser.fftSize = 1024;
    const sampleBuffer = new Float32Array(inputAnalyser.fftSize);

    // 5. Automatic Gain Control (AGC) Node — dynamically boosts quiet voices
    const agcGainNode = ctx.createGain();
    agcGainNode.gain.value = 2.0; // Start with a healthy +6.0 dB broadcast presence gain

    // 6. Broadcast Safety Peak Limiter (Brickwall limiter at -3 dB to catch sudden peaks without squashing body)
    const compressorNode = ctx.createDynamicsCompressor();
    compressorNode.threshold.value = -3.0; // Engage ONLY at -3 dBFS to prevent clipping/distortion
    compressorNode.knee.value = 2.0;       // Tight transparent knee
    compressorNode.ratio.value = 20.0;     // True brickwall peak limiter
    compressorNode.attack.value = 0.001;   // Ultra-fast 1ms attack to catch transients
    compressorNode.release.value = 0.08;   // 80ms fast recovery so vocal volume stays loud and full

    // 7. User Master Volume Node (allows user volume slider)
    const userGainNode = ctx.createGain();
    userGainNode.gain.value = options?.initialUserVolume ?? 1.0;

    // Connect chain:
    // source -> highPass -> bodyEq -> presenceEq -> inputAnalyser -> agcGainNode -> compressorNode -> userGainNode -> destination
    source.connect(highPass);
    highPass.connect(bodyEq);
    bodyEq.connect(presenceEq);
    presenceEq.connect(inputAnalyser);
    inputAnalyser.connect(agcGainNode);
    agcGainNode.connect(compressorNode);
    compressorNode.connect(userGainNode);
    userGainNode.connect(ctx.destination);

    let isEnabled = options?.enabled ?? true;
    let currentAgcGain = isEnabled ? 2.0 : 1.0;
    let runningRms = 0.08;

    // Real-time AGC leveling loop (runs every 60ms while audio is playing)
    const agcInterval = window.setInterval(() => {
      if (audioEl.paused || audioEl.ended) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (!isEnabled) {
        agcGainNode.gain.setTargetAtTime(1.0, ctx.currentTime, 0.05);
        currentAgcGain = 1.0;
        options?.onGainChange?.(0);
        return;
      }

      inputAnalyser.getFloatTimeDomainData(sampleBuffer);
      let sumSquares = 0;
      for (let i = 0; i < sampleBuffer.length; i++) {
        const s = sampleBuffer[i];
        sumSquares += s * s;
      }
      const instantRms = Math.sqrt(sumSquares / sampleBuffer.length);

      // Only adapt AGC when voice is actively speaking (ignore silence gaps between words)
      if (instantRms > 0.008) {
        // Fast adaptation when voice is quiet, smooth adaptation when loud
        const alpha = instantRms < runningRms ? 0.22 : 0.35;
        runningRms = runningRms * (1 - alpha) + instantRms * alpha;

        // Target broadcast commercial RMS = 0.26 (strong, punchy supermarket voice loudness)
        const targetRms = 0.26;
        const desiredGain = targetRms / Math.max(0.025, runningRms);

        // Clamp gain between 1.2x (+1.6 dB) and 4.2x (+12.5 dB boost for quiet voices like Carla)
        const clampedGain = Math.max(1.2, Math.min(4.2, desiredGain));
        currentAgcGain = currentAgcGain * 0.65 + clampedGain * 0.35;

        agcGainNode.gain.setTargetAtTime(currentAgcGain, ctx.currentTime, 0.04);

        if (options?.onGainChange) {
          const db = Math.round(20 * Math.log10(currentAgcGain) * 10) / 10;
          options.onGainChange(db);
        }
      }
    }, 60);

    // Ensure AudioContext resumes whenever audio starts playing
    audioEl.addEventListener('play', () => {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    });

    // Clean up interval if element is ever garbage collected (optional safety)
    void agcInterval;

    const processor: BroadcastVoiceProcessor = {
      audioContext: ctx,
      userGainNode,
      agcGainNode,
      compressorNode,
      setUserVolume: (vol: number) => {
        const safeVol = Math.max(0, Math.min(2.0, vol));
        userGainNode.gain.setTargetAtTime(safeVol, ctx.currentTime, 0.05);
      },
      setNormalizerEnabled: (enabled: boolean) => {
        isEnabled = enabled;
        presenceEq.gain.value = enabled ? 4.0 : 0;
        bodyEq.gain.value = enabled ? 1.5 : 0;
        if (!enabled) {
          agcGainNode.gain.setTargetAtTime(1.0, ctx.currentTime, 0.05);
          currentAgcGain = 1.0;
          options?.onGainChange?.(0);
        } else {
          currentAgcGain = 2.0;
          agcGainNode.gain.setTargetAtTime(2.0, ctx.currentTime, 0.05);
        }
      },
      getCurrentGainDb: () => Math.round(20 * Math.log10(currentAgcGain) * 10) / 10,
      resetAgcForNewTrack: () => {
        runningRms = 0.08;
        currentAgcGain = isEnabled ? 2.0 : 1.0;
        agcGainNode.gain.setValueAtTime(currentAgcGain, ctx.currentTime);
      },
    };

    processorMap.set(audioEl, processor);
    return processor;
  } catch (err) {
    console.warn('Web Audio API normalizer fallback:', err);
    return null;
  }
}

/**
 * Intelligent Broadcast Music Leveler & Normalizer (Web Audio API)
 *
 * Ensures all background music tracks (MP3s, playlists, uploaded tracks)
 * play at a consistent, comfortable loudness level in the store.
 * - Sub-bass rumble protection filter (25 Hz)
 * - Transparent broadcast dynamics compressor (3.5:1 ratio, 25ms attack, 250ms release)
 * - Real-Time Automatic Gain Control (AGC) that smooths loud sections and boosts quiet songs
 * - Safety Peak Limiter (-1.5 dBFS)
 */
export function attachMusicNormalizer(
  audioEl: HTMLMediaElement | null,
  options?: {
    initialUserVolume?: number;
    enabled?: boolean;
    onGainChange?: (gainDb: number) => void;
  }
): BroadcastVoiceProcessor | null {
  if (!audioEl) return null;

  const existing = processorMap.get(audioEl);
  if (existing) {
    if (existing.audioContext.state === 'suspended') {
      existing.audioContext.resume().catch(() => {});
    }
    if (options?.initialUserVolume !== undefined) {
      existing.setUserVolume(options.initialUserVolume);
    }
    if (options?.enabled !== undefined) {
      existing.setNormalizerEnabled(options.enabled);
    }
    return existing;
  }

  const ctx = getOrCreateAudioContext();
  if (!ctx) return null;

  try {
    const source = ctx.createMediaElementSource(audioEl);

    // 1. Sub-bass rumble protection filter at 25 Hz
    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'highpass';
    subFilter.frequency.value = 25;
    subFilter.Q.value = 0.7;

    // 2. Analyser for measuring ambient music RMS
    const inputAnalyser = ctx.createAnalyser();
    inputAnalyser.fftSize = 2048;
    const sampleBuffer = new Float32Array(inputAnalyser.fftSize);

    // 3. AGC Gain Node
    const agcGainNode = ctx.createGain();
    agcGainNode.gain.value = 1.35; // +2.6 dB default presence

    // 4. Smooth broadcast compressor for background music
    const compressorNode = ctx.createDynamicsCompressor();
    compressorNode.threshold.value = -16.0;
    compressorNode.knee.value = 8.0;
    compressorNode.ratio.value = 3.5;
    compressorNode.attack.value = 0.025;
    compressorNode.release.value = 0.25;

    // 5. Safety peak limiter
    const limiterNode = ctx.createDynamicsCompressor();
    limiterNode.threshold.value = -1.5;
    limiterNode.knee.value = 0.0;
    limiterNode.ratio.value = 20.0;
    limiterNode.attack.value = 0.002;
    limiterNode.release.value = 0.05;

    // 6. User Volume Node
    const userGainNode = ctx.createGain();
    userGainNode.gain.value = options?.initialUserVolume ?? 0.75;

    // Connect:
    // source -> subFilter -> inputAnalyser -> agcGainNode -> compressorNode -> limiterNode -> userGainNode -> destination
    source.connect(subFilter);
    subFilter.connect(inputAnalyser);
    inputAnalyser.connect(agcGainNode);
    agcGainNode.connect(compressorNode);
    compressorNode.connect(limiterNode);
    limiterNode.connect(userGainNode);
    userGainNode.connect(ctx.destination);

    let isEnabled = options?.enabled ?? true;
    let currentAgcGain = isEnabled ? 1.35 : 1.0;
    let runningRms = 0.12;

    const agcInterval = window.setInterval(() => {
      if (audioEl.paused || audioEl.ended) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (!isEnabled) {
        agcGainNode.gain.setTargetAtTime(1.0, ctx.currentTime, 0.08);
        currentAgcGain = 1.0;
        options?.onGainChange?.(0);
        return;
      }

      inputAnalyser.getFloatTimeDomainData(sampleBuffer);
      let sumSquares = 0;
      for (let i = 0; i < sampleBuffer.length; i++) {
        const s = sampleBuffer[i];
        sumSquares += s * s;
      }
      const instantRms = Math.sqrt(sumSquares / sampleBuffer.length);

      if (instantRms > 0.005) {
        // Slow and musical smoothing (avoids pumping or sudden jumps)
        runningRms = runningRms * 0.90 + instantRms * 0.10;

        // Target broadcast background music RMS = ~0.15
        const targetRms = 0.15;
        const desiredGain = targetRms / Math.max(0.02, runningRms);

        // Clamp gain between 0.7x (-3 dB for loud tracks) and 2.5x (+8 dB for quiet tracks)
        const clampedGain = Math.max(0.7, Math.min(2.5, desiredGain));
        currentAgcGain = currentAgcGain * 0.85 + clampedGain * 0.15;

        agcGainNode.gain.setTargetAtTime(currentAgcGain, ctx.currentTime, 0.08);

        if (options?.onGainChange) {
          const db = Math.round(20 * Math.log10(currentAgcGain) * 10) / 10;
          options.onGainChange(db);
        }
      }
    }, 80);

    audioEl.addEventListener('play', () => {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    });

    void agcInterval;

    const processor: BroadcastVoiceProcessor = {
      audioContext: ctx,
      userGainNode,
      agcGainNode,
      compressorNode,
      setUserVolume: (vol: number) => {
        const safeVol = Math.max(0, Math.min(2.0, vol));
        userGainNode.gain.setTargetAtTime(safeVol, ctx.currentTime, 0.05);
      },
      setNormalizerEnabled: (enabled: boolean) => {
        isEnabled = enabled;
        if (!enabled) {
          agcGainNode.gain.setTargetAtTime(1.0, ctx.currentTime, 0.08);
          currentAgcGain = 1.0;
          options?.onGainChange?.(0);
        } else {
          currentAgcGain = 1.35;
          agcGainNode.gain.setTargetAtTime(1.35, ctx.currentTime, 0.08);
        }
      },
      getCurrentGainDb: () => Math.round(20 * Math.log10(currentAgcGain) * 10) / 10,
      resetAgcForNewTrack: () => {
        runningRms = 0.12;
        currentAgcGain = isEnabled ? 1.35 : 1.0;
        agcGainNode.gain.setValueAtTime(currentAgcGain, ctx.currentTime);
      },
    };

    processorMap.set(audioEl, processor);
    return processor;
  } catch (err) {
    console.warn('Web Audio API music normalizer fallback:', err);
    return null;
  }
}

