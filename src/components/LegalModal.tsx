import React, { useState } from 'react';
import { ShieldCheck, FileText, X, Scale, Lock, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface LegalModalProps {
  isOpen: boolean;
  initialTab?: 'terms' | 'privacy';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141722] text-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-zinc-700/80 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between gap-4 bg-[#11131c]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-white truncate">
                Termos de Uso & Políticas de Privacidade
              </h2>
              <p className="text-xs text-zinc-400 truncate">
                SuperLocução Varejo IA • Documentação Jurídica & Responsabilidades
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-4 sm:px-6 pt-3 pb-2 gap-2 bg-[#12141e] border-b border-zinc-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Termos de Uso & Responsabilidades</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Política de Privacidade (LGPD)</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans custom-scrollbar">
          {activeTab === 'terms' ? (
            <div className="space-y-6">
              {/* Highlight Alert Box */}
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-orange-400 text-sm">
                  <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
                  <span>Resumo Importante para Supermercados e Lojistas</span>
                </div>
                <p className="text-xs text-orange-200/90 leading-relaxed">
                  A plataforma <strong>SuperLocução Varejo IA</strong> é uma solução tecnológica de software (SaaS) voltada à geração de locuções neurais publicitárias, gestão de ofertas e automação de transmissão sonora. A execução pública de obras musicais no ambiente físico do supermercado ou estabelecimento comercial é de responsabilidade exclusiva do lojista contratante.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-white font-black text-sm uppercase tracking-wide">
                  1. Natureza do Serviço e Objeto
                </h3>
                <p>
                  O presente Termo de Uso regula a utilização da plataforma tecnológica <strong>SuperLocução Varejo IA</strong>, disponibilizada sob o modelo SaaS (Software as a Service). O serviço consiste no fornecimento de ferramentas digitais para geração de roteiros, conversão de textos em áudio neural com inteligência artificial, aplicação de trilhas sonoras de produção comercial e automação de grade sonora para reprodução no ponto de venda.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-2">
                  <span>2. Direitos Autorais, Execução Pública e ECAD</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Cláusula Específica
                  </span>
                </h3>
                <p>
                  <strong>2.1. Execução no Ponto de Venda Físico:</strong> O Contratante (lojista, proprietário, franqueado ou administrador do estabelecimento comercial) declara-se ciente de que, nos termos da Lei Federal nº 9.610/98 (Lei de Direitos Autorais), em especial o art. 68 e seus parágrafos, a responsabilidade pelo recolhimento de retribuições relativas à <em>execução pública musical em estabelecimentos de frequência coletiva</em> perante o Escritório Central de Arrecadação e Distribuição (ECAD) e/ou associações de gestão coletiva <strong>recai única e exclusivamente sobre o estabelecimento comercial físico onde o áudio é irradiado e reproduzido para o público consumidor</strong>.
                </p>
                <p>
                  <strong>2.2. Isenção e Autonomia da Plataforma:</strong> A SuperLocução atua estritamente como fornecedora da tecnologia de software, geração de áudio por IA e motor de automação, não realizando execução pública de música em ambiente físico, razão pela qual não responde, solidária ou subsidiariamente, por quaisquer taxas, fiscalizações, notificações, autos de infração ou débitos emitidos por entidades de arrecadação autoral contra o estabelecimento comercial contratante.
                </p>
                <p>
                  <strong>2.3. Trilhas Sonoras Nativas (Royalty-Free):</strong> As vinhetas, carimbos e trilhas sonoras de produção fornecidas diretamente na plataforma para acompanhamento das locuções comerciais são disponibilizadas com licença de sincronização comercial, não gerando ônus autorais adicionais à plataforma.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-black text-sm uppercase tracking-wide">
                  3. Conteúdo Transmitido e Uploads Próprios
                </h3>
                <p>
                  Ao realizar o envio (upload) de arquivos MP3, faixas musicais, textos de encartes, logotipos ou slogans para a plataforma, o lojista declara e garante possuir todos os direitos, autorizações, licenças e cessões cabíveis sobre o material, respondendo integralmente pela legitimidade do conteúdo perante terceiros e órgãos fiscalizadores.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-black text-sm uppercase tracking-wide">
                  4. Planos, Créditos e Pagamentos
                </h3>
                <p>
                  Os créditos da plataforma são debitados na geração de áudios de acordo com o plano contratado. Planos recorrentes são renovados mensalmente conforme o método de pagamento selecionado (PIX, Cartão de Crédito ou boleto bancário). O cancelamento pode ser efetuado a qualquer momento pelo usuário, cessando as cobranças do ciclo seguinte.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-black text-sm uppercase tracking-wide">
                  5. Foro e Legislação Aplicável
                </h3>
                <p>
                  Estes Termos de Uso são regidos e interpretados segundo a legislação da República Federativa do Brasil, em especial o Código Civil Brasileiro, o Marco Civil da Internet (Lei nº 12.965/14) e a Lei de Direitos Autorais (Lei nº 9.610/98).
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Privacy Header Alert */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                  <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Conformidade com a LGPD (Lei nº 13.709/2018)</span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Garantimos a total confidencialidade, segurança e privacidade dos dados da sua empresa e seus operadores. Não comercializamos dados cadastrais com terceiros sob nenhuma hipótese.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-white font-black text-sm uppercase tracking-wide">
                  1. Dados Coletados e Finalidade
                </h3>
                <p>
                  Coletamos apenas as informações necessárias para a prestação dos serviços e emissão de notas fiscais:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>Dados cadastrais do lojista: Nome, E-mail profissional, Telefone/WhatsApp, Nome Fantasia ou Razão Social da Loja e Cidade/UF.</li>
                  <li>Dados técnicos de uso: Endereço IP e registros de data/hora de login para proteção de segurança da conta.</li>
                  <li>Conteúdos gerados: Textos de anúncios de ofertas e áudios gerados armazenados na nuvem privada da conta do lojista.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-black text-sm uppercase tracking-wide">
                  2. Armazenamento e Segurança da Informação
                </h3>
                <p>
                  Todas as comunicações entre o seu navegador e a plataforma trafegam através de conexões criptografadas com certificado SSL/TLS de ponta a ponta. Senhas são armazenadas em hash criptográfico irreversível e os dados operacionais contam com rotinas diárias de backup seguro.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-black text-sm uppercase tracking-wide">
                  3. Não Compartilhamento com Terceiros
                </h3>
                <p>
                  A SuperLocução não vende, não aluga e não compartilha dados de lojistas, listas de produtos ou tabelas de preços com redes concorrentes ou terceiros anunciantes. Compartilhamentos ocorrem estritamente com processadores de pagamento homologados (Mercado Pago / Gateways) exclusivamente para a liquidação das assinaturas.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-white font-black text-sm uppercase tracking-wide">
                  4. Direitos do Titular dos Dados
                </h3>
                <p>
                  Conforme os artigos 18 e seguintes da LGPD, o titular dos dados pode a qualquer momento solicitar a confirmação, correção de dados incompletos ou a exclusão definitiva de sua conta e histórico de áudios através de nossos canais de atendimento ou pelo e-mail <strong>contato@superlocucao.inforartes.com.br</strong>.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-[#11131c] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Documento oficial atualizado em {new Date().getFullYear()}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-xl transition cursor-pointer shadow-md text-center"
          >
            Entendido e Concordo
          </button>
        </div>
      </div>
    </div>
  );
};

