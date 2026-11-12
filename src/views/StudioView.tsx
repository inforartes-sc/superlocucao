import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Plus, Trash2,
  Copy, Volume2, Loader2, RefreshCw, Check, Zap, Layers, Play, Pause,
  Archive, Music, Sliders, Search, Radio, Star
} from 'lucide-react';
import {
  Project, ProductItem, CampaignType, LocutionTone,
  DesiredDuration, PresentationFormat, VoicePreset,
  SoundtrackOption, SoundtrackId, CAMPAIGN_PRESETS, STYLE_PRESETS,
  User, ProjectNiche
} from '../types/index.ts';
import {
  getCampaignsByNiche, getStylesByNiche, getNicheInfo
} from '../types/campaigns.ts';
import { getSoundtracksByNiche } from '../utils/nicheDefaults.ts';
import { api } from '../services/api.ts';
import { AudioPlayer } from '../components/AudioPlayer.tsx';
import { expandUnitsAndMeasuresToWords } from '../utils/textNormalizer.ts';
import { calculateCreditCost } from '../utils/credits.ts';
import { useRadio } from '../context/RadioContext.tsx';
import { useFavoriteVoices } from '../services/voiceFavorites.ts';

interface StudioViewProps {
  project: Project;
  user?: User | null;
  onUpdateProject: (project: Project) => void;
  onNavigate: (view: string) => void;
  onCreditsChanged?: (newBalance: number) => void;
}

const DURATION_OPTIONS: { id: DesiredDuration; label: string; approxWords: string }[] = [
  { id: '15s', label: '15 segundos', approxWords: '~35-45 palavras (ultra-rápido)' },
  { id: '30s', label: '30 segundos', approxWords: '~75-85 palavras (padrão rádio)' },
  { id: '45s', label: '45 segundos', approxWords: '~110-125 palavras' },
  { id: '60s', label: '60 segundos', approxWords: '~150-165 palavras (bloco completo)' },
];

export const StudioView: React.FC<StudioViewProps> = ({
  project: initialProject,
  user,
  onUpdateProject,
  onNavigate,
  onCreditsChanged,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [project, setProject] = useState<Project>(initialProject);

  const effectiveNiche: ProjectNiche = project.niche || user?.niche || 'supermercado';
  const displaySoundtracks = useMemo(() => getSoundtracksByNiche(effectiveNiche), [effectiveNiche]);

  // Audio preview playback state for listening to styles, soundtracks and voices
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioListRef = useRef<HTMLDivElement | null>(null);
  const [activeSampleKey, setActiveSampleKey] = useState<string | null>(null);
  const [isSamplePlaying, setIsSamplePlaying] = useState(false);

  // Soundtracks
  const [soundtracks, setSoundtracks] = useState<SoundtrackOption[]>([]);
  const [selectedSoundtrackId, setSelectedSoundtrackId] = useState<SoundtrackId>(() => {
    if (project.soundtrackId && project.soundtrackId !== 'sem_trilha') {
      return project.soundtrackId;
    }
    const suggested = CAMPAIGN_PRESETS[project.campaignType]?.suggestedSoundtrack;
    return suggested || 'varejo_alegre';
  });
  const [soundtrackVolume, setSoundtrackVolume] = useState<number>(
    project.soundtrackVolume ?? 0.28
  );

  // Step 2 state: Manual vs List import
  const [insertMode, setInsertMode] = useState<'manual' | 'list'>('manual');
  const [pastedListText, setPastedListText] = useState('');
  const [isParsingList, setIsParsingList] = useState(false);

  // Manual product input form
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdPackaging, setNewProdPackaging] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdPrevPrice, setNewProdPrevPrice] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('unidade');

  // Step 4 state: Script editor & Audio Studio
  const [scriptText, setScriptText] = useState(
    project.scripts[project.currentScriptIndex]?.text || ''
  );
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isRefiningScript, setIsRefiningScript] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState<string | null>(null);

  // Audio generation state
  const [voices, setVoices] = useState<VoicePreset[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('OlxPtqeyGl5zwd5zVlKX');
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [voiceTab, setVoiceTab] = useState<'todas' | 'favoritas'>('todas');
  const [voiceGenderFilter, setVoiceGenderFilter] = useState<'todos' | 'masculino' | 'feminino'>('todos');
  const { favorites, toggleFavorite, isFavorite } = useFavoriteVoices();
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioProgressStatus, setAudioProgressStatus] = useState<string | null>(null);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [publishToRadio, setPublishToRadio] = useState(false);
  const [playImmediatelyOnRadio, setPlayImmediatelyOnRadio] = useState(false);

  let radioCtx: ReturnType<typeof useRadio> | null = null;
  try {
    radioCtx = useRadio();
  } catch {
    radioCtx = null;
  }

  // System Announcement
  const [systemNotice, setSystemNotice] = useState<string>('');
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);

  // Keep script text in sync with project
  useEffect(() => {
    if (project.scripts[project.currentScriptIndex]?.text) {
      setScriptText(project.scripts[project.currentScriptIndex].text);
    }
  }, [project.currentScriptIndex, project.scripts]);

  // Load voices, soundtracks and public settings on mount / niche change
  useEffect(() => {
    Promise.all([
      api.getVoices().catch(() => ({ voices: [], hasElevenKey: false })),
      api.getSoundtracks(effectiveNiche).catch(() => ({ soundtracks: [] })),
      api.getPublicSettings().catch(() => ({ systemAnnouncement: '' })),
    ]).then(([vRes, sRes, setRes]) => {
      if (vRes.voices && vRes.voices.length > 0) {
        setVoices(vRes.voices);
        const storedVoice = localStorage.getItem('superlocucao_selected_voice');
        const defaultVoice = (storedVoice && vRes.voices.find((v: VoicePreset) => v.id === storedVoice)) ||
          vRes.voices.find((v: VoicePreset) => v.isDefault) ||
          vRes.voices[0];
        setSelectedVoiceId(defaultVoice.id);
      }
      if (sRes.soundtracks && sRes.soundtracks.length > 0) {
        setSoundtracks(sRes.soundtracks);
      }
      if (setRes && setRes.systemAnnouncement) {
        setSystemNotice(setRes.systemAnnouncement);
      }
    });
  }, [effectiveNiche]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const saveProjectChanges = (updated: Partial<Project>, immediate = false) => {
    const merged = { ...project, ...updated, niche: (updated.niche || project.niche || user?.niche || 'supermercado') };
    setProject(merged);
    onUpdateProject(merged);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (immediate) {
      api.updateProject(merged.id, merged).catch((e) => {
        console.warn('Auto-save error:', e);
      });
    } else {
      saveTimeoutRef.current = setTimeout(() => {
        api.updateProject(merged.id, merged).catch((e) => {
          console.warn('Auto-save error:', e);
        });
      }, 500);
    }
  };

  const currentNicheInfo = getNicheInfo(effectiveNiche);
  const campaignsForNiche = getCampaignsByNiche(effectiveNiche);
  const stylesForNiche = getStylesByNiche(effectiveNiche);

  const campaignTitlePlaceholder = useMemo(() => {
    switch (effectiveNiche) {
      case 'moda': return 'Ex: Festival Nova Coleção & Promoção Jeans';
      case 'farmacia': return 'Ex: Quinzena da Saúde & Cuidados Pessoais';
      case 'petshop': return 'Ex: Semana do Pet & Ofertas de Rações';
      case 'construcao': return 'Ex: Feirão da Reforma & Construção';
      case 'beleza': return 'Ex: Festival da Beleza & Linha Capilar';
      case 'restaurante': return 'Ex: Rodízio Especial & Festival de Sobremesas';
      case 'autopecas': return 'Ex: Mês da Manutenção & Troca de Óleo';
      case 'otica': return 'Ex: Festival das Lentes & Armações em Oferta';
      case 'geral': return 'Ex: Liquidação de Variedades & Utilidades';
      case 'supermercado':
      default: return 'Ex: Quarta e Quinta da Carne & Hortifrúti';
    }
  }, [effectiveNiche]);

  const objectivePlaceholder = useMemo(() => {
    switch (effectiveNiche) {
      case 'moda': return 'Ex: Apresentar a nova coleção e aumentar as vendas nos provadores';
      case 'farmacia': return 'Ex: Divulgar ofertas em dermocosméticos, vitaminas e cuidados diários';
      case 'petshop': return 'Ex: Aumentar o giro de rações premium e atrair tutores para a loja';
      case 'construcao': return 'Ex: Atrair construtores e divulgar materiais básicos para obras';
      case 'beleza': return 'Ex: Destacar cosméticos em destaque e perfumes importados';
      case 'restaurante': return 'Ex: Estimular os pedidos de pratos especiais e combos da casa';
      case 'autopecas': return 'Ex: Movimentar os serviços e a linha de filtros e óleos';
      case 'otica': return 'Ex: Convidar para revisão visual e escolha de novas armações';
      case 'geral': return 'Ex: Acelerar vendas e atrair clientes para a loja';
      case 'supermercado':
      default: return 'Ex: Acelerar vendas do açougue e giro de carnes resfriadas';
    }
  }, [effectiveNiche]);

  const handleSelectCampaign = (type: CampaignType) => {
    const preset = CAMPAIGN_PRESETS[type];
    const updates: Partial<Project> = {
      niche: effectiveNiche,
      campaignType: type,
    };
    if (preset) {
      updates.style = preset.suggestedStyle;
      updates.tone = preset.suggestedTone;
      updates.soundtrackId = preset.suggestedSoundtrack;
      setSelectedSoundtrackId(preset.suggestedSoundtrack);
    }
    saveProjectChanges(updates, true);
  };

  // Preview audio player handler (styles, voices, soundtracks)
  const handleTogglePreview = (key: string, url: string) => {
    const audio = sampleAudioRef.current;
    if (!audio) return;

    if (activeSampleKey === key && isSamplePlaying) {
      audio.pause();
      setIsSamplePlaying(false);
    } else {
      audio.pause();
      audio.src = url;
      audio.play().then(() => {
        setActiveSampleKey(key);
        setIsSamplePlaying(true);
      }).catch((e) => {
        console.warn('Preview play failed:', e);
      });
    }
  };

  // -------------------------------------------------------------
  // STEP 2: Product management
  // -------------------------------------------------------------
  const handleAddManualProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;

    const promoPrice = parseFloat(newProdPrice.replace(',', '.')) || 0;
    const prevPrice = newProdPrevPrice
      ? parseFloat(newProdPrevPrice.replace(',', '.'))
      : undefined;

    const newProduct: ProductItem = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      brand: newProdBrand.trim() || undefined,
      packaging: newProdPackaging.trim() ? expandUnitsAndMeasuresToWords(newProdPackaging.trim()) : undefined,
      promotionalPrice: promoPrice,
      previousPrice: prevPrice && !isNaN(prevPrice) ? prevPrice : undefined,
      unit: newProdUnit,
    };

    const updatedProducts = [...project.products, newProduct];
    saveProjectChanges({ products: updatedProducts });

    // Reset inputs
    setNewProdName('');
    setNewProdBrand('');
    setNewProdPackaging('');
    setNewProdPrice('');
    setNewProdPrevPrice('');
  };

  const handleParsePastedList = async () => {
    if (!pastedListText.trim()) return;
    setIsParsingList(true);
    try {
      const res = await api.parseProducts(pastedListText, effectiveNiche);
      if (res.products && res.products.length > 0) {
        const updatedProducts = [...project.products, ...res.products];
        saveProjectChanges({ products: updatedProducts });
        setPastedListText('');
        setInsertMode('manual');
      }
    } catch (err: any) {
      alert(`Não foi possível interpretar a lista: ${err.message}`);
    } finally {
      setIsParsingList(false);
    }
  };

  const handleDuplicateProduct = (index: number) => {
    const prod = project.products[index];
    const duplicated: ProductItem = {
      ...prod,
      id: `prod-${Date.now()}`,
      name: `${prod.name} (Cópia)`,
    };
    const updated = [...project.products];
    updated.splice(index + 1, 0, duplicated);
    saveProjectChanges({ products: updated });
  };

  const handleDeleteProduct = (id: string) => {
    const updated = project.products.filter((p) => p.id !== id);
    saveProjectChanges({ products: updated });
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= project.products.length) return;
    const updated = [...project.products];
    const item = updated.splice(index, 1)[0];
    updated.splice(newIdx, 0, item);
    saveProjectChanges({ products: updated });
  };

  // -------------------------------------------------------------
  // STEP 4: Script & Voiceover Generation
  // -------------------------------------------------------------
  const handleGenerateScript = async () => {
    if (project.products.length === 0) {
      alert('Cadastre pelo menos 1 produto em oferta antes de gerar o roteiro.');
      setCurrentStep(2);
      return;
    }

    setIsGeneratingScript(true);
    try {
      const result = await api.generateScript({
        niche: effectiveNiche,
        storeName: project.storeName,
        storeCity: project.storeCity,
        campaignType: project.campaignType,
        style: project.style,
        desiredDuration: project.desiredDuration,
        tone: project.tone,
        presentationFormat: project.presentationFormat,
        customOpening: project.customOpening,
        customClosing: project.customClosing,
        freeInstructions: project.freeInstructions,
        products: project.products,
      });

      const newScript = {
        id: `script-${Date.now()}`,
        text: expandUnitsAndMeasuresToWords(result.text || ''),
        spokenPhoneticText: result.spokenPhoneticText ? expandUnitsAndMeasuresToWords(result.spokenPhoneticText) : undefined,
        estimatedDurationSeconds: result.estimatedDurationSeconds,
        wordCount: result.wordCount,
        createdAt: new Date().toISOString(),
      };

      const updatedScripts = [newScript, ...project.scripts];
      setScriptText(newScript.text);
      saveProjectChanges({
        scripts: updatedScripts,
        currentScriptIndex: 0,
        status: 'scripted',
      });
    } catch (err: any) {
      alert(`Erro ao gerar roteiro: ${err.message}`);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleRefineScript = async (
    action: 'improve' | 'shorten' | 'energize' | 'natural' | 'verify_prices',
    feedbackMsg: string
  ) => {
    if (!scriptText.trim()) return;
    setIsRefiningScript(true);
    try {
      const res = await api.refineScript(scriptText, action, undefined, project.products, effectiveNiche);
      const normalizedText = expandUnitsAndMeasuresToWords(res.text || '');
      setScriptText(normalizedText);
      setRefineFeedback(feedbackMsg);
      setTimeout(() => setRefineFeedback(null), 3000);

      const words = normalizedText.split(/\s+/).filter(Boolean).length;
      const newVersion = {
        id: `script-${Date.now()}`,
        text: normalizedText,
        estimatedDurationSeconds: Math.round(words / 2.7),
        wordCount: words,
        createdAt: new Date().toISOString(),
        note: feedbackMsg,
      };

      saveProjectChanges({
        scripts: [newVersion, ...project.scripts],
        currentScriptIndex: 0,
      });
    } catch (err: any) {
      alert(`Falha ao aprimorar: ${err.message}`);
    } finally {
      setIsRefiningScript(false);
    }
  };

  const handleExpandUnits = () => {
    if (!scriptText.trim()) return;
    const expanded = expandUnitsAndMeasuresToWords(scriptText);
    setScriptText(expanded);
    saveProjectChanges({
      scripts: [
        {
          id: `script-${Date.now()}`,
          text: expanded,
          estimatedDurationSeconds: Math.round(expanded.split(/\s+/).filter(Boolean).length / 2.7),
          wordCount: expanded.split(/\s+/).filter(Boolean).length,
          createdAt: new Date().toISOString(),
          note: 'Unidades convertidas por extenso',
        },
        ...project.scripts,
      ],
      currentScriptIndex: 0,
    });
    setRefineFeedback('Medidas e unidades convertidas 100% por extenso!');
    setTimeout(() => setRefineFeedback(null), 3000);
  };

  // Trigger real audio generation with ElevenLabs / Gemini + Soundtrack Mixing
  const handleGenerateOfficialAudio = async () => {
    if (!scriptText.trim()) {
      alert('O roteiro não pode estar vazio.');
      return;
    }

    const creditCost = calculateCreditCost(project.products.length);
    if (user && user.creditsBalance < creditCost) {
      alert(`Saldo de créditos insuficiente (${user.creditsBalance} disponíveis). São necessários ${creditCost} créditos para gerar esta locução.`);
      return;
    }

    const cleanScriptText = expandUnitsAndMeasuresToWords(scriptText);
    if (cleanScriptText !== scriptText) {
      setScriptText(cleanScriptText);
    }

    setIsGeneratingAudio(true);
    setAudioProgressStatus('Preparando roteiro comercial...');

    try {
      setTimeout(() => setAudioProgressStatus('Sintetizando voz com IA Neural em alta fidelidade...'), 800);
      if (selectedSoundtrackId !== 'sem_trilha') {
        setTimeout(() => setAudioProgressStatus('Mixando com trilha de fundo & ducking profissional...'), 1800);
      }
      setTimeout(() => setAudioProgressStatus('Equalizando áudio em alta fidelidade...'), 2600);

      const res = await api.generateAudio({
        projectId: project.id,
        scriptText: cleanScriptText,
        voiceId: selectedVoiceId,
        title: project.title,
        soundtrackId: selectedSoundtrackId || 'varejo_alegre',
        soundtrackVolume: soundtrackVolume,
        publishToRadio,
        radioPriority: playImmediatelyOnRadio ? 'alta' : 'normal',
        storeName: project.storeName,
        productCount: project.products.length,
      });

      setAudioProgressStatus('Áudio finalizado!');
      setTimeout(() => setAudioProgressStatus(null), 1500);

      // Atualiza o saldo de créditos do usuário na aplicação imediatamente
      if (typeof res.creditsBalance === 'number' && onCreditsChanged) {
        onCreditsChanged(res.creditsBalance);
      }

      const updatedAudios = [res.audio, ...project.audios];
      saveProjectChanges({
        audios: updatedAudios,
        soundtrackId: selectedSoundtrackId,
        soundtrackVolume: soundtrackVolume,
        status: 'ready',
      });

      if (radioCtx) {
        if (publishToRadio) {
          await radioCtx.publishAudioToRadio(res.audio, {
            storeName: project.storeName,
            type: 'oferta',
            priority: playImmediatelyOnRadio ? 'alta' : 'normal',
            playImmediately: playImmediatelyOnRadio,
          });
        }
        await radioCtx.refreshRadioData();
      }

      setTimeout(() => {
        audioListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    } catch (err: any) {
      alert(`Não foi possível gerar a locução: ${err.message}`);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Batch generation with soundtrack
  const handleGenerateBatch = async () => {
    if (project.products.length === 0) {
      alert('Nenhum produto cadastrado para gerar em lote.');
      return;
    }

    const totalCost = calculateCreditCost(project.products.length, true);
    if (user && user.creditsBalance < totalCost) {
      alert(`Saldo de créditos insuficiente (${user.creditsBalance} disponíveis). São necessários ${totalCost} créditos (${project.products.length} produtos x 10 créditos) para gerar o lote.`);
      return;
    }

    setIsGeneratingBatch(true);
    setBatchProgress({ current: 1, total: project.products.length });

    try {
      const res = await api.generateBatchAudios({
        projectId: project.id,
        products: project.products,
        voiceId: selectedVoiceId,
        storeName: project.storeName,
        soundtrackId: selectedSoundtrackId || 'varejo_alegre',
        soundtrackVolume: soundtrackVolume,
        publishToRadio,
      });

      // Atualiza o saldo de créditos do usuário na aplicação imediatamente
      if (typeof res.creditsBalance === 'number' && onCreditsChanged) {
        onCreditsChanged(res.creditsBalance);
      }

      const updatedAudios = [...res.audios, ...project.audios];
      saveProjectChanges({
        audios: updatedAudios,
        soundtrackId: selectedSoundtrackId,
        soundtrackVolume: soundtrackVolume,
        status: 'ready',
      });

      if (radioCtx) {
        if (publishToRadio) {
          for (const aud of res.audios) {
            await radioCtx.publishAudioToRadio(aud, {
              storeName: project.storeName,
              type: 'oferta',
              priority: 'normal',
              playImmediately: false,
            });
          }
        }
        await radioCtx.refreshRadioData();
      }

      setTimeout(() => {
        audioListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
      alert(`Lote concluído com sucesso! ${res.audios.length} áudios gerados com trilha.`);
    } catch (err: any) {
      alert(`Erro no processamento em lote: ${err.message}`);
    } finally {
      setIsGeneratingBatch(false);
      setBatchProgress(null);
    }
  };

  const handleDownloadZipAll = async () => {
    if (project.audios.length === 0) return;
    setIsDownloadingZip(true);
    try {
      const audioIds = project.audios.map((a) => a.id);
      const safeName = `pacote-locucoes-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zip`;
      const blob = await api.downloadZip(audioIds, safeName);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      alert(`Erro ao baixar ZIP: ${e.message}`);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Hidden audio element for preview samples */}
      <audio
        ref={sampleAudioRef}
        onEnded={() => setIsSamplePlaying(false)}
        className="hidden"
      />

      {/* SYSTEM ANNOUNCEMENT (Configured in Admin) */}
      {systemNotice && !isNoticeDismissed && (
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase shrink-0">
              Aviso
            </span>
            <span>{systemNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsNoticeDismissed(true)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
            title="Fechar aviso"
          >
            ✕
          </button>
        </div>
      )}

      {/* Studio Header & Breadcrumbs */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-blue-600">
              Dashboard
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600">Estúdio de Gravação</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
            {project.title || 'Nova Campanha de Ofertas'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {project.storeName ? `${project.storeName} • ` : ''}
            {`${project.products.length} ${project.products.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}`}
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          {[
            { num: 1, label: '1. Campanha' },
            { num: 2, label: '2. Produtos' },
            { num: 3, label: '3. Roteiro & Trilha' },
            { num: 4, label: '4. Voz & Gravação' },
          ].map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  sampleAudioRef.current?.pause();
                  setIsSamplePlaying(false);
                  setCurrentStep(step.num as any);
                }}
                className={`px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-xs'
                    : isCompleted
                    ? 'text-slate-700 hover:bg-white/60'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : null}
                <span className="truncate">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: SUPERMARKET CAMPAIGN INFO */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm space-y-6 sm:space-y-8 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Etapa 1 — Informações de {currentNicheInfo.name} & Campanha
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Defina os detalhes da sua campanha para ajustar automaticamente o tom de voz, estilo do roteiro e trilha sonora.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Segmento / Nicho do Comércio
              </label>
              <select
                value={effectiveNiche}
                onChange={(e) => saveProjectChanges({ niche: e.target.value as ProjectNiche })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="supermercado">🛒 Supermercado & Varejo Alimentício</option>
                <option value="farmacia">💊 Farmácia & Drogaria</option>
                <option value="moda">👗 Loja de Roupas, Calçados & Moda</option>
                <option value="petshop">🐾 Pet Shop & Agropecuária</option>
                <option value="construcao">🧱 Materiais de Construção & Reforma</option>
                <option value="beleza">💄 Cosméticos, Beleza & Perfumaria</option>
                <option value="restaurante">🍔 Restaurante, Lanchonete & Delivery</option>
                <option value="autopecas">🚗 Auto Peças & Centro Automotivo</option>
                <option value="otica">👓 Ótica, Joalheria & Relojoaria</option>
                <option value="geral">🛍️ Comércio Geral, Bazar & Variedades</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nome da Campanha ou Título da Locução *
              </label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => saveProjectChanges({ title: e.target.value })}
                placeholder={campaignTitlePlaceholder}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {currentNicheInfo.entityNameLabel} (Opcional)
              </label>
              <input
                type="text"
                value={project.storeName || ''}
                onChange={(e) => saveProjectChanges({ storeName: e.target.value })}
                placeholder={currentNicheInfo.entityNamePlaceholder}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {currentNicheInfo.entityLocationLabel} (Opcional)
              </label>
              <input
                type="text"
                value={project.storeCity || ''}
                onChange={(e) => saveProjectChanges({ storeCity: e.target.value })}
                placeholder={currentNicheInfo.entityLocationPlaceholder}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Objetivo do Anúncio (Opcional)
              </label>
              <input
                type="text"
                value={project.objective || ''}
                onChange={(e) => saveProjectChanges({ objective: e.target.value })}
                placeholder={objectivePlaceholder}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Campaign Categories Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tipo de Campanha — {currentNicheInfo.name}
              </label>
              <span className="text-xs text-blue-600 font-medium">
                A IA adapta vocabulário, ritmo e abertura ao tipo escolhido
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {campaignsForNiche.map((preset) => {
                const isSelected = project.campaignType === preset.id;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectCampaign(preset.id);
                    }}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-600/80'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                          {preset.label}
                        </span>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : preset?.badge ? (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {preset.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-500 leading-normal">{preset.desc}</p>
                    </div>

                    {preset && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className={`px-2 py-0.5 rounded font-medium ${
                          isSelected ? 'bg-blue-200/80 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Estilo: {STYLE_PRESETS[preset.suggestedStyle]?.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-medium capitalize ${
                          isSelected ? 'bg-blue-200/80 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Tom: {preset.suggestedTone}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Campaign Styling Banner */}
            {CAMPAIGN_PRESETS[project.campaignType] && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50/40 border border-blue-200 flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-blue-950">
                    Estilo ativo: {CAMPAIGN_PRESETS[project.campaignType].label} ({CAMPAIGN_PRESETS[project.campaignType].badge})
                  </span>
                  <p className="text-slate-600 mt-0.5">
                    {CAMPAIGN_PRESETS[project.campaignType].themeGuidelines}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
            >
              <span>Avançar para {currentNicheInfo.itemsSectionTitle}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: PRODUCTS REGISTRATION (MANUAL + SMART LIST PARSER) */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Etapa 2 — {currentNicheInfo.itemsSectionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {currentNicheInfo.itemsSectionSubtitle}
              </p>
            </div>

            {/* Mode Toggle: Manual vs Colar Lista */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setInsertMode('manual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  insertMode === 'manual' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Modo Manual
              </button>
              <button
                type="button"
                onClick={() => setInsertMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  insertMode === 'list' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Colar Lista (IA)</span>
              </button>
            </div>
          </div>

          {/* MODE: PASTE LIST WITH GEMINI */}
          {insertMode === 'list' && (
            <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Interpretação Inteligente de Ofertas</span>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Cole abaixo o texto com seus produtos (copiado do WhatsApp, encarte, mensagem ou bloco de notas). A inteligência artificial organiza nomes, marcas, embalagens e preços automaticamente.
              </p>

              <textarea
                rows={5}
                value={pastedListText}
                onChange={(e) => setPastedListText(e.target.value)}
                placeholder={currentNicheInfo.pasteListPlaceholder}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 mb-3"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Valores e unidades serão conferidos antes de salvar.
                </span>
                <button
                  onClick={handleParsePastedList}
                  disabled={isParsingList || !pastedListText.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow flex items-center gap-2 cursor-pointer"
                >
                  {isParsingList ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando lista com IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Organizar e Importar Produtos</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* MODE: MANUAL FORM */}
          {insertMode === 'manual' && (
            <form onSubmit={handleAddManualProduct} className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Adicionar Produto em Oferta
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {currentNicheInfo.itemNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder={currentNicheInfo.itemNamePlaceholder}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {currentNicheInfo.itemDetailLabel}
                  </label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    placeholder={currentNicheInfo.itemDetailPlaceholder}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {currentNicheInfo.itemExtraLabel}
                  </label>
                  <input
                    type="text"
                    value={newProdPackaging}
                    onChange={(e) => setNewProdPackaging(e.target.value)}
                    placeholder={currentNicheInfo.itemExtraPlaceholder}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {currentNicheInfo.itemValueLabel || 'Preço Oferta (R$) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder={currentNicheInfo.itemValuePlaceholder || '0,00'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Unidade
                  </label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="unidade">unidade</option>
                    <option value="kg">kg (quilo)</option>
                    <option value="g">100g (grama)</option>
                    <option value="litro">litro</option>
                    <option value="pacote">pacote</option>
                    <option value="caixa">caixa</option>
                    <option value="bandeja">bandeja</option>
                    <option value="duzia">dúzia</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Preço por extenso gerado automaticamente para o locutor.
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Inserir Produto</span>
                </button>
              </div>
            </form>
          )}

          {/* PRODUCTS TABLE / REVIEW LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Relação de Produtos ({project.products.length})
              </h3>
              <span className="text-xs text-slate-500">
                Use as setas para reorganizar a ordem de fala
              </span>
            </div>

            {project.products.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-500 text-sm">
                {currentNicheInfo.emptyListMessage}
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Produto & Marca</th>
                      <th className="py-3 px-4">Embalagem</th>
                      <th className="py-3 px-4">Preço</th>
                      <th className="py-3 px-4">Pronúncia Fonética (TTS)</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.products.map((prod, idx) => (
                      <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {prod.name}
                          {prod.brand && (
                            <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                              ({prod.brand})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {prod.packaging || prod.notes || prod.unit}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          {prod.promotionalPrice && prod.promotionalPrice > 0 ? (
                            <>
                              R$ {prod.promotionalPrice.toFixed(2).replace('.', ',')}
                              {prod.previousPrice && (
                                <span className="line-through text-slate-400 text-[11px] ml-1.5">
                                  R$ {prod.previousPrice.toFixed(2).replace('.', ',')}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-500 font-normal">Sob Consulta</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                          "{prod.spokenPrice || prod.name}"
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleMoveProduct(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Subir na lista"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handleMoveProduct(idx, 'down')}
                              disabled={idx === project.products.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Descer na lista"
                            >
                              ▼
                            </button>
                            <button
                              onClick={() => handleDuplicateProduct(idx)}
                              className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                              title="Duplicar"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Remover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={project.products.length === 0}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
            >
              <span>Avançar para Configuração do Roteiro</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: SCRIPT CONFIGURATION & SOUNDTRACK SELECTION */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Etapa 3 — Personalização do Roteiro & Trilha Sonora
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ouça amostras de cada estilo de voz, escolha a trilha de fundo para o som da sua loja e ajuste o tempo do anúncio.
            </p>
          </div>

          <div className="space-y-8">
            {/* 1. LOCUTION STYLE WITH DIRECT PREVIEW BUTTONS */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Estilo da Locução
                </label>
                <span className="text-xs text-blue-600 font-medium">
                  Clique em <strong>"Ouvir Estilo"</strong> em cada card para ouvir o tom antes de escolher
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {stylesForNiche.map((style) => {
                  const isSelected = project.style === style.id;
                  const isPreviewing = activeSampleKey === `style-${style.id}` && isSamplePlaying;

                  return (
                    <div
                      key={style.id}
                      onClick={() => saveProjectChanges({ style: style.id })}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between relative ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/80 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                            {style.label}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {style.tag}
                          </span>
                          {style.id === CAMPAIGN_PRESETS[project.campaignType]?.suggestedStyle && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              ★ Recomendado para {CAMPAIGN_PRESETS[project.campaignType]?.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-normal">{style.desc}</p>
                      </div>

                      {/* INLINE AUDIO PREVIEW BUTTON FOR STYLE */}
                      <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePreview(
                              `style-${style.id}`,
                              `/api/samples/style/${style.id}.mp3?niche=${encodeURIComponent(effectiveNiche)}`
                            );
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            isPreviewing
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
                          }`}
                        >
                          {isPreviewing ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>Pausar demonstração</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 ml-0.5 text-blue-600" />
                              <span>Ouvir estilo</span>
                            </>
                          )}
                        </button>

                        {isPreviewing && (
                          <div className="flex items-center gap-1 pr-1">
                            <span className="w-1 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                            <span className="w-1 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:0.25s]" />
                            <span className="w-1 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.15s]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. SOUNDTRACK / TRILHA SONORA DE FUNDO (BACKGROUND MUSIC) */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-blue-50/30 to-purple-50/40 p-6 rounded-3xl border border-blue-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Trilha Sonora Comercial de Fundo
                    </h3>
                    <p className="text-xs text-slate-500">
                      Músicas de fundo e jingles de varejo com efeito <em>ducking</em> (voz na frente, música suave ao fundo).
                    </p>
                  </div>
                </div>

                {/* Volume Slider for background music */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700">Volume da Trilha:</span>
                  <input
                    type="range"
                    min="0.05"
                    max="0.45"
                    step="0.05"
                    value={soundtrackVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setSoundtrackVolume(v);
                      saveProjectChanges({ soundtrackVolume: v });
                    }}
                    className="w-20 accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-blue-700 w-8 text-right">
                    {Math.round(soundtrackVolume * 100)}%
                  </span>
                </div>
              </div>

              {/* Soundtracks Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displaySoundtracks.map((track) => {
                  const isSelected = selectedSoundtrackId === track.id;
                  const isPreviewing = activeSampleKey === `soundtrack-${track.id}` && isSamplePlaying;

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        setSelectedSoundtrackId(track.id);
                        saveProjectChanges({ soundtrackId: track.id });
                      }}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-white ring-2 ring-blue-600 shadow-xs'
                          : 'border-slate-200/90 bg-white/90 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                            {track.name}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </div>

                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {track.category}
                          </span>
                          {track.bpm > 0 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {track.bpm} BPM
                            </span>
                          )}
                          {track.isPopular && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Mais tocada
                            </span>
                          )}
                          {track.id === CAMPAIGN_PRESETS[project.campaignType]?.suggestedSoundtrack && (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                              ★ Ideal p/ esta campanha
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                          {track.description}
                        </p>
                      </div>

                      {/* Preview Button for Soundtrack */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        {track.id === 'sem_trilha' ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Gravação com voz pura
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePreview(
                                `soundtrack-${track.id}`,
                                track.previewUrl
                              );
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                              isPreviewing
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isPreviewing ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>Pausar trilha</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 ml-0.5 text-purple-600" />
                                <span>Ouvir trilha</span>
                              </>
                            )}
                          </button>
                        )}

                        {isPreviewing && (
                          <span className="text-[10px] font-bold text-purple-600 animate-pulse">
                            Tocando trilha...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. DURATION OPTIONS */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Duração Desejada
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DURATION_OPTIONS.map((dur) => {
                  const isSelected = project.desiredDuration === dur.id;
                  return (
                    <button
                      key={dur.id}
                      onClick={() => saveProjectChanges({ desiredDuration: dur.id })}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 font-bold text-blue-700'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-bold">{dur.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{dur.approxWords}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. TONE & PRESENTATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tom da Comunicação
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['persuasivo', 'alegre', 'direto', 'familiar', 'festivo'] as LocutionTone[]).map((t) => {
                    const isSelected = project.tone === t;
                    return (
                      <button
                        key={t}
                        onClick={() => saveProjectChanges({ tone: t })}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Formato da Locução
                </label>
                <select
                  value={project.presentationFormat}
                  onChange={(e) => saveProjectChanges({ presentationFormat: e.target.value as PresentationFormat })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="abertura_sequencia_encerramento">Abertura, Sequência de Ofertas e Encerramento</option>
                  <option value="unico_completo">Anúncio Único Dinâmico</option>
                  <option value="individual_por_produto">Um Áudio Separado por Produto (Modo Lote)</option>
                </select>
              </div>
            </div>

            {/* Custom Opening & Closing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Frase de Abertura Personalizada (Opcional)
                </label>
                <input
                  type="text"
                  value={project.customOpening || ''}
                  onChange={(e) => saveProjectChanges({ customOpening: e.target.value })}
                  placeholder={`Ex: Atenção clientes da ${project.storeName || 'nossa loja'}!`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Frase de Encerramento (Opcional)
                </label>
                <input
                  type="text"
                  value={project.customClosing || ''}
                  onChange={(e) => saveProjectChanges({ customClosing: e.target.value })}
                  placeholder={`Ex: Ofertas válidas enquanto durarem os estoques. Aproveite!`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                sampleAudioRef.current?.pause();
                setIsSamplePlaying(false);
                setCurrentStep(2);
              }}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => {
                sampleAudioRef.current?.pause();
                setIsSamplePlaying(false);
                setCurrentStep(4);
                if (!scriptText) {
                  handleGenerateScript();
                }
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Avançar para Estúdio de Voz & Gravação</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: SCRIPT EDITOR & AUDIO STUDIO (VOICES + SOUNDTRACK + GENERATION) */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Script Editor (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Roteiro Comercial da Locução
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Roteiro personalizado com unidades de medida e preços 100% por extenso para pronúncia perfeita. Você pode editar livremente.
                  </p>
                </div>

                <button
                  onClick={handleGenerateScript}
                  disabled={isGeneratingScript}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                >
                  {isGeneratingScript ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>{scriptText ? 'Gerar Outra Versão' : 'Gerar Roteiro com IA'}</span>
                </button>
              </div>

              {/* Active Campaign Badges & Info Pill */}
              <div className="p-3 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 rounded-2xl border border-blue-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-blue-900 flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Estilo da Campanha:
                </span>
                <span className="bg-white px-2.5 py-1 rounded-xl border border-blue-200/80 font-bold text-blue-800 shadow-2xs">
                  {CAMPAIGN_PRESETS[project.campaignType]?.label || project.campaignType}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 font-semibold text-slate-700 shadow-2xs">
                  {STYLE_PRESETS[project.style]?.label || project.style}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 font-semibold text-slate-700 capitalize shadow-2xs">
                  Tom: {project.tone}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 font-semibold text-slate-700 shadow-2xs">
                  {project.desiredDuration}
                </span>
              </div>

              {/* Quick AI Refine Chips */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase px-2">Refinar:</span>
                <button
                  onClick={() => handleRefineScript('improve', 'Texto aprimorado com cadência profissional!')}
                  disabled={isRefiningScript || !scriptText}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 cursor-pointer disabled:opacity-50"
                >
                  ✨ Melhorar Texto
                </button>
                <button
                  onClick={() => handleRefineScript('energize', 'Texto energizado com estilo promocional!')}
                  disabled={isRefiningScript || !scriptText}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 cursor-pointer disabled:opacity-50"
                >
                  ⚡ Mais Animado
                </button>
                <button
                  onClick={() => handleRefineScript('shorten', 'Texto encurtado com sucesso!')}
                  disabled={isRefiningScript || !scriptText}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 cursor-pointer disabled:opacity-50"
                >
                  ⏱️ Encurtar
                </button>
                <button
                  onClick={() => handleRefineScript('natural', 'Texto com tom acolhedor e natural!')}
                  disabled={isRefiningScript || !scriptText}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 cursor-pointer disabled:opacity-50"
                >
                  🌿 Mais Natural
                </button>
                <button
                  onClick={() => handleRefineScript('verify_prices', 'Preços e produtos verificados com sucesso!')}
                  disabled={isRefiningScript || !scriptText}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-700 font-medium rounded-lg border border-emerald-200 cursor-pointer disabled:opacity-50"
                >
                  🔍 Revisar Preços
                </button>
                <button
                  onClick={handleExpandUnits}
                  disabled={!scriptText}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 font-medium rounded-lg border border-blue-200 cursor-pointer disabled:opacity-50"
                  title="Garante que todas as unidades e medidas (kg, g, ml, l, un, pct) fiquem escritas por extenso"
                >
                  📏 Unidades por Extenso
                </button>
              </div>

              {refineFeedback && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{refineFeedback}</span>
                </div>
              )}

              {/* Editor Textarea */}
              <div className="relative">
                <textarea
                  rows={8}
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Clique em 'Gerar Roteiro com IA' ou digite seu texto aqui..."
                  className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm leading-relaxed text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-normal"
                />

                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-lg text-[11px] font-mono text-slate-500 shadow-2xs">
                  {scriptText.split(/\s+/).filter(Boolean).length} palavras • ~{Math.round(scriptText.split(/\s+/).filter(Boolean).length / 2.7)}s estimados
                </div>
              </div>

              {/* Verified Product Pills for reference */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Produtos incluídos nesta gravação:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.products.map((p) => (
                    <span
                      key={p.id}
                      className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs text-slate-700 font-medium"
                    >
                      {p.name}: <strong className="text-emerald-700">R$ {p.promotionalPrice.toFixed(2).replace('.', ',')}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Voice Selection, Soundtrack Summary & Audio Generator (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Voice Selector Card with Preview Button on Each Card */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Voz do Locutor</h3>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {voices.length} vozes
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Português BR
                  </span>
                </div>

                {/* Filter and Search Bar for voices */}
                <div className="space-y-2.5">
                  {/* Category toggle: Geral vs Favoritas */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setVoiceTab('todas')}
                      className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        voiceTab === 'todas'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Todas ({voices.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoiceTab('favoritas')}
                      className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        voiceTab === 'favoritas'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${voiceTab === 'favoritas' ? 'fill-white' : 'text-amber-500'}`} />
                      <span>Favoritas ({voices.filter(v => isFavorite(v.id)).length})</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={voiceSearchQuery}
                      onChange={(e) => setVoiceSearchQuery(e.target.value)}
                      placeholder="Buscar locutor por nome ou estilo..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(['todos', 'masculino', 'feminino'] as const).map((g) => {
                      const baseList = voiceTab === 'favoritas' ? voices.filter(v => isFavorite(v.id)) : voices;
                      const count = g === 'todos' ? baseList.length : baseList.filter((v) => v.gender === g).length;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setVoiceGenderFilter(g)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition cursor-pointer ${
                            voiceGenderFilter === g
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {g === 'todos' ? `Todas (${count})` : `${g} (${count})`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable list of voices */}
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {(() => {
                    const filtered = voices.filter((voice) => {
                      if (voiceTab === 'favoritas' && !isFavorite(voice.id)) {
                        return false;
                      }
                      if (voiceGenderFilter !== 'todos' && voice.gender !== voiceGenderFilter) {
                        return false;
                      }
                      if (voiceSearchQuery.trim()) {
                        const q = voiceSearchQuery.toLowerCase();
                        const matchName = voice.name.toLowerCase().includes(q);
                        const matchDesc = (voice.description || '').toLowerCase().includes(q);
                        const matchTag = (voice.styleTag || '').toLowerCase().includes(q);
                        return matchName || matchDesc || matchTag;
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          {voiceTab === 'favoritas' ? (
                            <>
                              <Star className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
                              <p className="text-xs font-bold text-slate-700">Nenhuma voz favoritada</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Clique na estrela ⭐ em qualquer voz para salvá-la em suas favoritas.
                              </p>
                              <button
                                type="button"
                                onClick={() => setVoiceTab('todas')}
                                className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                              >
                                Ver todas as vozes
                              </button>
                            </>
                          ) : (
                            <p className="text-xs text-slate-500">Nenhuma voz encontrada para esta busca.</p>
                          )}
                        </div>
                      );
                    }

                    return filtered.map((voice) => {
                      const isSelected = selectedVoiceId === voice.id;
                      const isPreviewing = activeSampleKey === `voice-${voice.id}` && isSamplePlaying;
                      const isFav = isFavorite(voice.id);

                      return (
                        <div
                          key={voice.id}
                          onClick={() => setSelectedVoiceId(voice.id)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer relative ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                                  {voice.name}
                                </span>
                                <span className="text-[10px] uppercase font-semibold text-slate-400 px-1.5 py-0.2 bg-slate-100 rounded">
                                  {voice.gender}
                                </span>
                                {voice.styleTag && (
                                  <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded truncate max-w-[120px]">
                                    {voice.styleTag}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{voice.description}</p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(voice.id);
                                }}
                                title={isFav ? "Remover dos favoritos" : "Favoritar este locutor"}
                                className={`p-1 rounded-lg border transition cursor-pointer ${
                                  isFav
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                    : 'bg-white hover:bg-amber-50 text-slate-300 hover:text-amber-500 border-slate-200'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                              </button>

                              {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                            </div>
                          </div>

                          {/* Inline button to hear this voice */}
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePreview(
                                  `voice-${voice.id}`,
                                  voice.previewUrl || `/api/samples/voice/${voice.id}.mp3`
                                );
                              }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                isPreviewing
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isPreviewing ? (
                                <>
                                  <Pause className="w-3 h-3" />
                                  <span>Pausar voz</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 ml-0.5 text-blue-600" />
                                  <span>Ouvir amostra da voz</span>
                                </>
                              )}
                            </button>

                            {isPreviewing && (
                              <span className="text-[10px] text-blue-600 font-semibold animate-pulse">
                                Reproduzindo locutor...
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Selected Soundtrack Banner in Step 4 */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Trilha sonora de fundo:</div>
                      <div className="text-xs font-bold text-slate-800">
                        {displaySoundtracks.find((s) => s.id === selectedSoundtrackId)?.name || 'Varejo Alegre & Enérgico'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Alterar trilha
                  </button>
                </div>

                {/* Web Radio Broadcast Integration Box */}
                <div className="bg-orange-50/90 p-3.5 rounded-2xl border border-orange-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-extrabold text-orange-950">
                        Divulgação Direta na Rádio Web da Loja
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('radio')}
                      className="text-[11px] font-bold text-orange-700 hover:underline cursor-pointer"
                    >
                      Abrir Rádio Web →
                    </button>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publishToRadio}
                      onChange={(e) => setPublishToRadio(e.target.checked)}
                      className="accent-orange-600 rounded"
                    />
                    Publicar automaticamente na grade da Rádio Web ao gerar
                  </label>

                  {publishToRadio && (
                    <label className="flex items-center gap-2 text-xs text-orange-800 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={playImmediatelyOnRadio}
                        onChange={(e) => setPlayImmediatelyOnRadio(e.target.checked)}
                        className="accent-orange-600 rounded"
                      />
                      ⚡ Tocar IMEDIATAMENTE ao vivo na Rádio assim que finalizar
                    </label>
                  )}
                </div>

                {/* Primary Official Audio Generator CTA */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <button
                    onClick={handleGenerateOfficialAudio}
                    disabled={isGeneratingAudio || !scriptText.trim()}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isGeneratingAudio ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{audioProgressStatus || 'Gerando locução...'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        <span>Gerar Áudio da Locução (MP3)</span>
                      </>
                    )}
                  </button>

                  {/* Batch Generation Button */}
                  <button
                    onClick={handleGenerateBatch}
                    disabled={isGeneratingBatch || project.products.length === 0}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-slate-600" />
                    <span>Gerar 1 Áudio por Produto em Lote</span>
                  </button>

                  {batchProgress && (
                    <div className="text-xs text-center text-blue-600 font-medium animate-pulse">
                      Processando lote: {batchProgress.current} de {batchProgress.total} produtos com trilha sonora...
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Custo do lote: {calculateCreditCost(project.products.length, true)} créditos ({project.products.length} áudios x 10 créditos)
                    </span>
                    {user && (
                      <>
                        <span>•</span>
                        <span className={`font-semibold flex items-center gap-1 ${user.creditsBalance < calculateCreditCost(project.products.length, true) ? 'text-red-600' : 'text-emerald-700'}`}>
                          <span>Saldo disponível:</span>
                          <strong>{user.creditsBalance} créditos</strong>
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="text-slate-400">10 créditos por áudio gerado</span>
                    <span>•</span>
                    <span>Com trilha inclusa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* GENERATED AUDIO SECTION & PLAYERS */}
          {/* ========================================================================= */}
          {project.audios.length > 0 && (
            <div ref={audioListRef} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Áudios Gerados Prontos para Download ({project.audios.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Reproduza os áudios ou baixe em MP3 para usar no sistema de som da loja.
                  </p>
                </div>

                {project.audios.length > 1 && (
                  <button
                    onClick={handleDownloadZipAll}
                    disabled={isDownloadingZip}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-xs cursor-pointer"
                  >
                    {isDownloadingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                    <span>Baixar Todos em ZIP ({project.audios.length} arquivos)</span>
                  </button>
                )}
              </div>

              {/* Main spotlight audio player */}
              <AudioPlayer audio={project.audios[0]} storeName={project.storeName} />

              {/* Secondary list if multiple audios (e.g. batch product spots) */}
              {project.audios.length > 1 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Demais Spots do Projeto (Lote Individual)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.audios.slice(1).map((aud) => (
                      <AudioPlayer key={aud.id} audio={aud} compact storeName={project.storeName} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
