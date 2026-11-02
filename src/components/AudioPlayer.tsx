import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, VolumeX, Repeat, Sparkles, Radio, Zap, Check, Gauge } from 'lucide-react';
import { attachVoiceNormalizer, BroadcastVoiceProcessor } from '../utils/audioNormalizer';
import { AudioGenerationItem } from '../types';
import { useRadio } from '../context/RadioContext';

interface AudioPlayerProps {
  audio: AudioGenerationItem;
  compact?: boolean;
  storeName?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audio, compact = false, storeName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audio.durationSeconds || 15);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [publishedFeedback, setPublishedFeedback] = useState<'added' | 'playing' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const normalizerRef = useRef<BroadcastVoiceProcessor | null>(null);
  const [boostDb, setBoostDb] = useState<number>(0);

  let radioCtx: ReturnType<typeof useRadio> | null = null;
  try {
    radioCtx = useRadio();
  } catch {
    radioCtx = null;
  }

  const queueItem = radioCtx?.config?.queue?.find(q => q.audioId === audio.id);
  const willPlayOnRadio = Boolean(queueItem && queueItem.active);
  const isInRadioQueue = Boolean(queueItem);
  const [isTogglingRadio, setIsTogglingRadio] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const handleTimeUpdate = () => {
      setCurrentTime(el.currentTime);
      if (el.duration && !isNaN(el.duration)) {
        setDuration(el.duration);
        setProgress((el.currentTime / el.duration) * 100);
      }
    };

    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      }
    };

    const handleLoadedMetadata = () => {
      if (el.duration && !isNaN(el.duration)) {
        setDuration(el.duration);
      }
    };

    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('ended', handleEnded);
    el.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('ended', handleEnded);
      el.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isLooping]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;

    if (!normalizerRef.current) {
      normalizerRef.current = attachVoiceNormalizer(el, {
        initialUserVolume: 1.0,
        enabled: true,
        onGainChange: (gain) => setBoostDb(gain),
      });
    } else {
      normalizerRef.current.resetAgcForNewTrack();
    }

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().catch(err => console.error('Playback error:', err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    el.currentTime = ratio * duration;
    setProgress(ratio * 100);
  };

  const toggleMute = () => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleLoop = () => {
    const el = audioRef.current;
    if (!el) return;
    el.loop = !isLooping;
    setIsLooping(!isLooping);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    const safeTitle = (audio.title || 'locucao-supermercado')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-_]+/g, '-');
    const filename = `${safeTitle}.mp3`;
    const url = audio.downloadUrl || `${audio.audioUrl}?download=1`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao baixar arquivo MP3');
      const blob = await response.blob();
      const mp3Blob = new Blob([blob], { type: 'audio/mpeg' });
      const blobUrl = window.URL.createObjectURL(mp3Blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleAddToRadio = async (playImmediately: boolean) => {
    if (!radioCtx) return;
    await radioCtx.publishAudioToRadio(audio, {
      storeName,
      type: 'oferta',
      priority: playImmediately ? 'alta' : 'normal',
      playImmediately,
    });
    setPublishedFeedback(playImmediately ? 'playing' : 'added');
    setTimeout(() => setPublishedFeedback(null), 3500);
  };

  const handleToggleRadioPlay = async () => {
    if (!radioCtx || isTogglingRadio) return;
    setIsTogglingRadio(true);
    try {
      if (queueItem) {
        // Se já está na rádio, alterna entre ativa (vai tocar) e pausada (não vai tocar)
        await radioCtx.toggleQueueItemActive(queueItem.id);
      } else {
        // Se ainda não estava na rádio, adiciona na programação marcada para tocar
        await radioCtx.publishAudioToRadio(audio, {
          storeName,
          type: 'oferta',
          priority: 'normal',
          playImmediately: false,
        });
      }
    } catch (err) {
      console.error('Erro ao alterar status na rádio:', err);
    } finally {
      setIsTogglingRadio(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const bars = Array.from({ length: compact ? 22 : 34 }, (_, i) => {
    const seed = (audio.id.charCodeAt(i % audio.id.length) + i * 17) % 100;
    return Math.max(22, seed);
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-orange-500/40 rounded-2xl p-4 transition-all shadow-lg space-y-3">
      <audio ref={audioRef} src={audio.audioUrl} preload="metadata" />

      {/* Top Row: Title & Badges */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <h4 className="font-bold text-white text-sm truncate max-w-full">{audio.title}</h4>
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 whitespace-nowrap">
            {audio.voiceName}
          </span>
          {audio.soundtrackName && audio.soundtrackId !== 'sem_trilha' && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
              🎵 {audio.soundtrackName}
            </span>
          )}
          {willPlayOnRadio ? (
            <span
              className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 whitespace-nowrap"
              title="Esta locução está ativa na programação da rádio da loja"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Na Rádio
            </span>
          ) : isInRadioQueue ? (
            <span
              className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1 whitespace-nowrap"
              title="Esta locução está pausada (não tocará na rádio)"
            >
              Pausada na Rádio
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            Voz Neural Studio HD
          </span>
          <span>•</span>
          <span className="whitespace-nowrap">MP3 Alta Qualidade</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold whitespace-nowrap bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]" title="Nivelador inteligente automático ativo: todas as vozes tocam no mesmo padrão de volume comercial, sem voz baixa">
            <Gauge className="w-3 h-3 text-emerald-400" />
            Voz Nivelada {boostDb > 0 ? `+${boostDb}dB` : 'Auto'}
          </span>
          <span>•</span>
          <span className="font-mono text-zinc-300 whitespace-nowrap">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Middle Row: Play Button + Waveform + Time */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlay}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/25 transition cursor-pointer"
          title={isPlaying ? 'Pausar prévia' : 'Ouvir locução'}
        >
          {isPlaying ? <Pause className="w-4 h-4 shrink-0" /> : <Play className="w-4 h-4 ml-0.5 shrink-0" />}
        </button>

        {/* Waveform progress bar */}
        <div
          onClick={handleSeek}
          className="flex-1 h-10 bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-2.5 flex items-center gap-1 cursor-pointer relative overflow-hidden min-w-0"
        >
          {bars.map((height, idx) => {
            const barPercent = (idx / bars.length) * 100;
            const active = barPercent <= progress;
            return (
              <div
                key={idx}
                style={{ height: `${height}%` }}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  active
                    ? 'bg-gradient-to-t from-orange-500 to-amber-400'
                    : 'bg-zinc-700/60 hover:bg-zinc-600'
                }`}
              />
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-zinc-400 whitespace-nowrap shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {!compact && (
          <div className="hidden sm:flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={toggleLoop}
              title="Repetir em loop"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isLooping ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              title="Silenciar"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Row: Clean Action Bar (Rádio Web & Download MP3) */}
      <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {radioCtx && (
            <>
              {/* Opção interativa: MARCAR se vai tocar ou não na Rádio */}
              <button
                type="button"
                onClick={handleToggleRadioPlay}
                disabled={isTogglingRadio}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs border whitespace-nowrap transition cursor-pointer shadow-xs ${
                  willPlayOnRadio
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/50 shadow-emerald-950/20'
                    : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border-zinc-700'
                }`}
                title={
                  willPlayOnRadio
                    ? 'Esta locução está MARCADA para tocar na rádio. Clique para desmarcar (não tocar).'
                    : 'Esta locução NÃO está marcada para tocar na rádio. Clique para marcar e colocá-la na programação.'
                }
              >
                <span
                  className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border text-[10px] font-black transition ${
                    willPlayOnRadio
                      ? 'bg-emerald-500 border-emerald-400 text-zinc-950'
                      : 'bg-zinc-900 border-zinc-600 text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span>{willPlayOnRadio ? 'Tocar na Rádio' : 'Não Tocar na Rádio'}</span>
              </button>

              {/* Botão de Disparar no Ao Vivo da Rádio Web */}
              <button
                type="button"
                onClick={() => handleAddToRadio(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30 font-bold text-xs whitespace-nowrap transition cursor-pointer"
                title="Transmitir esta oferta agora mesmo ao vivo na Rádio Web do Supermercado"
              >
                <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>{publishedFeedback === 'playing' ? 'No Ar Agora!' : 'Tocar Agora'}</span>
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs whitespace-nowrap transition shadow-md shadow-orange-500/20 cursor-pointer sm:ml-auto w-full sm:w-auto"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Baixar MP3</span>
        </button>
      </div>
    </div>
  );
};
