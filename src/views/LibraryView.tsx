import React, { useState } from 'react';
import {
  Radio, Search, Download, Trash2, Copy, Play, Pause, Calendar,
  Volume2, Archive, Filter, Sparkles, ExternalLink, AlertTriangle
} from 'lucide-react';
import { Project, AudioGenerationItem } from '../types/index.ts';
import { AudioPlayer } from '../components/AudioPlayer.tsx';
import { api } from '../services/api.ts';

interface LibraryViewProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onNewVoiceover: () => void;
  onRefreshProjects: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  projects,
  onOpenProject,
  onNewVoiceover,
  onRefreshProjects,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isZippingAll, setIsZippingAll] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.storeName && p.storeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || p.campaignType === selectedType;
    return matchesSearch && matchesType;
  });

  const allAudios = projects.flatMap((p) => p.audios);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await api.deleteProject(id);
      setDeleteConfirmId(null);
      onRefreshProjects();
    } catch (e: any) {
      alert(`Erro ao excluir: ${e.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await api.duplicateProject(id);
      onRefreshProjects();
      onOpenProject(res.project.id);
    } catch (e: any) {
      alert(`Erro ao duplicar: ${e.message}`);
    }
  };

  const handleDownloadAllZip = async () => {
    if (allAudios.length === 0) return;
    setIsZippingAll(true);
    try {
      const ids = allAudios.map((a) => a.id);
      const blob = await api.downloadZip(ids, `biblioteca-completa-${Date.now()}.zip`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todas-as-locucoes-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      alert(`Erro ao gerar ZIP: ${e.message}`);
    } finally {
      setIsZippingAll(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
            Biblioteca de Locuções
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gerencie todas as campanhas criadas, reproduza os áudios e faça o download dos arquivos em MP3.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {allAudios.length > 0 && (
            <button
              onClick={handleDownloadAllZip}
              disabled={isZippingAll}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Archive className="w-4 h-4 text-emerald-600" />
              <span>{isZippingAll ? 'Compactando...' : 'Baixar Biblioteca em ZIP'}</span>
            </button>
          )}

          <button
            onClick={onNewVoiceover}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Radio className="w-4 h-4" />
            <span>Nova Locução</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome da campanha ou supermercado..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            <option value="ofertas_dia">Ofertas do Dia</option>
            <option value="ofertas_semana">Ofertas da Semana</option>
            <option value="superofertas">Superofertas</option>
            <option value="queima_estoque">Queima de Estoque</option>
            <option value="aniversario">Aniversário</option>
            <option value="black_friday">Black Friday</option>
            <option value="institucional">Institucional</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((proj) => {
          const hasAudio = proj.audios.length > 0;
          return (
            <div
              key={proj.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 capitalize">
                    {proj.campaignType.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3 h-3" />
                    {new Date(proj.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {proj.title}
                </h3>
                {proj.storeName && (
                  <p className="text-xs text-slate-500 mb-3">{proj.storeName}</p>
                )}

                {/* Embedded Mini Player if audio available */}
                {hasAudio ? (
                  <div className="my-4">
                    <AudioPlayer audio={proj.audios[0]} compact />
                  </div>
                ) : (
                  <div className="my-4 p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Roteiro pronto. Áudio ainda não gerado.</span>
                  </div>
                )}

                {/* Product Summary */}
                <div className="text-xs text-slate-500 mb-4">
                  <strong>{proj.products.length} itens:</strong>{' '}
                  <span className="text-slate-600">
                    {proj.products.map((p) => p.name).slice(0, 3).join(', ')}
                    {proj.products.length > 3 ? '...' : ''}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenProject(proj.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Abrir no Estúdio
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(proj.id)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                    title="Duplicar projeto"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(proj.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">Nenhuma locução encontrada</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tente outro termo de busca ou crie uma nova campanha comercial de ofertas agora mesmo.
          </p>
          <button
            onClick={onNewVoiceover}
            className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition cursor-pointer"
          >
            Criar primeira locução
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-900 text-lg">Excluir locução?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Esta ação apagará o projeto, seus produtos cadastrados e os áudios associados. Esta ação não poderá ser desfeita.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
