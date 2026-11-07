import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Mail,
  Send,
  Copy,
  Check,
  Clock,
  Store,
  Phone,
  User as UserIcon,
  HelpCircle,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.ts';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultStoreName?: string;
  configuredWhatsapp?: string;
  configuredEmail?: string;
}

function cleanWhatsAppForUrl(val: string): string {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '5596981248000';
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

function formatPhoneForDisplay(val: string): string {
  const clean = val.replace(/\D/g, '');
  if (clean.length === 13 && clean.startsWith('55')) {
    const ddd = clean.slice(2, 4);
    const part1 = clean.slice(4, 9);
    const part2 = clean.slice(9);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }
  if (clean.length === 11) {
    const ddd = clean.slice(0, 2);
    const part1 = clean.slice(2, 7);
    const part2 = clean.slice(7);
    return `(${ddd}) ${part1}-${part2}`;
  }
  return val;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = 'Dúvidas sobre os Planos & Rádio Web',
  defaultStoreName = '',
  configuredWhatsapp,
  configuredEmail,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [storeName, setStoreName] = useState(defaultStoreName);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Email oficial e número do suporte WhatsApp carregados do backend ou props
  const [contactEmail, setContactEmail] = useState(configuredEmail || 'contato@superlocucao.inforartes.com.br');
  const [contactWhatsAppNumber, setContactWhatsAppNumber] = useState(configuredWhatsapp || '5596981248000');

  useEffect(() => {
    if (isOpen) {
      api.getPublicSettings().then((settings) => {
        if (settings.contactEmail) setContactEmail(settings.contactEmail);
        if (settings.contactWhatsapp) setContactWhatsAppNumber(settings.contactWhatsapp);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const urlWhatsapp = cleanWhatsAppForUrl(contactWhatsAppNumber);
  const displayWhatsapp = formatPhoneForDisplay(contactWhatsAppNumber);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedMessage = [
      `👋 Olá! Gostaria de falar com o atendimento da SuperLocução Varejo IA.`,
      name ? `👤 *Nome:* ${name}` : null,
      storeName ? `🛒 *Supermercado / Loja:* ${storeName}` : null,
      phone ? `📱 *Telefone / Contato:* ${phone}` : null,
      subject ? `📌 *Assunto:* ${subject}` : null,
      message ? `💬 *Mensagem:* ${message}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const encodedText = encodeURIComponent(formattedMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${urlWhatsapp}&text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendEmail = () => {
    const emailSubject = encodeURIComponent(`[Contato SuperLocução] ${subject || 'Contato pelo Site'}`);
    const emailBody = encodeURIComponent(
      `Nome: ${name || 'Não informado'}\n` +
      `Supermercado: ${storeName || 'Não informado'}\n` +
      `Telefone/WhatsApp: ${phone || 'Não informado'}\n\n` +
      `Mensagem:\n${message || 'Gostaria de mais informações sobre a plataforma SuperLocução.'}`
    );
    window.location.href = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#141721] border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-[#181b26]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-orange-500/20">
              <Headphones className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Fale Conosco
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Online
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Atendimento comercial, suporte técnico e projetos personalizados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Canais Rápidos: WhatsApp & E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Botão WhatsApp Direto */}
            <a
              href={`https://api.whatsapp.com/send?phone=${urlWhatsapp}&text=${encodeURIComponent(
                'Olá! Gostaria de falar com o atendimento comercial da SuperLocução Varejo IA.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black shrink-0 group-hover:scale-105 transition shadow-md shadow-emerald-500/25">
                <MessageSquare className="w-5 h-5 text-zinc-950 fill-current" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Atendimento WhatsApp
                </span>
                <span className="text-sm font-black text-white truncate block">
                  {displayWhatsapp}
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  Iniciar Conversa Imediata
                </span>
              </div>
            </a>

            {/* Caixa E-mail Oficial */}
            <div className="p-4 rounded-2xl bg-[#1a1d28] border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    E-mail Oficial
                  </span>
                  <span className="text-xs font-bold text-white truncate block" title={contactEmail}>
                    {contactEmail}
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    Envio de propostas
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition shrink-0 cursor-pointer"
                title="Copiar e-mail"
              >
                {copiedEmail ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Divisor Visual */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-[#141721] px-3 text-[11px] font-bold text-zinc-300 uppercase tracking-wider shrink-0">
              Ou envie sua mensagem abaixo
            </span>
          </div>

          {/* Formulário de Mensagem */}
          <form onSubmit={handleSendWhatsApp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Seu Nome
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full bg-[#1a1d28] border border-zinc-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-300 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-[#1a1d28] border border-zinc-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-300 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Nome do Supermercado / Loja
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-zinc-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ex: Supermercado Alvorada"
                    className="w-full bg-[#1a1d28] border border-zinc-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-300 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Assunto
                </label>
                <div className="relative">
                  <HelpCircle className="w-4 h-4 text-zinc-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#1a1d28] border border-zinc-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition cursor-pointer"
                  >
                    <option value="Dúvidas sobre os Planos & Rádio Web">Dúvidas sobre Planos & Preços</option>
                    <option value="Proposta para Redes & Atacarejos">Proposta para Redes & Atacarejos</option>
                    <option value="Suporte Técnico & Dúvidas de Uso">Suporte Técnico</option>
                    <option value="Parceria Comercial">Parceria Comercial</option>
                    <option value="Outro Assunto">Outro Assunto</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Sua Mensagem
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Como podemos te ajudar? Descreva sua dúvida, número de lojas ou o que precisa para o seu negócio."
                className="w-full bg-[#1a1d28] border border-zinc-700/80 rounded-xl p-3 text-sm text-white placeholder-zinc-300 focus:outline-none focus:border-orange-500 transition resize-none"
              />
            </div>

            {/* Botões de Envio */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="submit"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current shrink-0" />
                <span>Enviar pelo WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#1e2230] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Enviar por E-mail</span>
              </button>
            </div>
          </form>

          {/* Horário de Atendimento Info */}
          <div className="p-3 rounded-xl bg-[#181b24] border border-zinc-800/80 flex items-center gap-2.5 text-xs text-zinc-300">
            <Clock className="w-4 h-4 text-orange-400 shrink-0" />
            <span>
              <strong>Horário de Atendimento:</strong> Segunda a Sábado, das 08h às 20h. Respondemos rapidamente!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

