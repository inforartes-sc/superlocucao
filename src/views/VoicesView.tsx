import React, { useState } from 'react';
import { Volume2, Play, Pause, CheckCircle2, Sparkles, Sliders, Shield, BookOpen } from 'lucide-react';
import { VoicePreset } from '../types/index.ts';

interface VoicesViewProps {
  voices: VoicePreset[];
}

export const VoicesView: React.FC<VoicesViewProps> = ({ voices }) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const toggleSample = (voice: VoicePreset) => {
    if (playingVoiceId === voice.id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(voice.id);
      if (audioRef.current) {
        audioRef.current.src = voice.previewUrl || `/api/samples/voice/${voice.id}.mp3`;
        audioRef.current.play().catch(console.warn);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      <audio ref={audioRef} onEnded={() => setPlayingVoiceId(null)} />

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Catálogo de Locutores com IA Neural HD</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
          Vozes & Configurações de Locução
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Selecione e teste as vozes calibradas para o varejo brasileiro, projetadas para se destacarem no sistema de som do seu supermercado.
        </p>
      </div>

      {/* Voices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {voices.map((voice) => (
          <div
            key={voice.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {voice.styleTag}
                </span>
                <span className="text-xs font-semibold text-slate-400 capitalize">
                  {voice.gender}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">{voice.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{voice.description}</p>

              <div className="space-y-1.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl mb-4">
                <div className="flex justify-between">
                  <span>Sotaque:</span>
                  <strong className="text-slate-700">{voice.accent}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Motor IA:</span>
                  <strong className="text-emerald-700">Voz Neural Ultra HD (Português BR)</strong>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => toggleSample(voice)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                {playingVoiceId === voice.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{playingVoiceId === voice.id ? 'Pausar' : 'Ouvir Amostra'}</span>
              </button>

              {voice.isDefault && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Voz Padrão
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Supermarket Pronunciation Guide / Dicionário de Varejo */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>Regras de Pronúncia Fonética Automática</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          Nossa aplicação converte abreviações e valores do seu sistema de retaguarda para fala natural antes de enviar ao sintetizador de voz:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Preço em Reais</span>
            <div className="font-mono text-slate-800 font-bold mb-1">R$ 24,99</div>
            <div className="text-emerald-700 font-semibold italic">→ "vinte e quatro reais e noventa e nove centavos"</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Unidade por Quilo</span>
            <div className="font-mono text-slate-800 font-bold mb-1">R$ 3,99/kg</div>
            <div className="text-emerald-700 font-semibold italic">→ "três reais e noventa e nove centavos o quilo"</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Embalagens & Litros</span>
            <div className="font-mono text-slate-800 font-bold mb-1">Leite 1L / Arroz 5kg</div>
            <div className="text-emerald-700 font-semibold italic">→ "um litro" / "pacote de cinco quilos"</div>
          </div>
        </div>
      </div>
    </div>
  );
};

