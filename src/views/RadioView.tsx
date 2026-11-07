import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  Zap,
  Megaphone,
  Music,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sliders,
  ChevronUp,
  ChevronDown,
  Mic2,
  Upload,
  Flame,
  RefreshCw,
  Download,
  Maximize2,
  Minimize2,
  ListMusic,
  History,
  Settings2,
  FolderPlus,
  Wand2,
  ShoppingCart,
  BellRing,
  ArrowRight,
  Star,
  Headphones,
  AlertTriangle,
  Mic,
  VolumeX,
  Car,
  Baby,
  CreditCard,
  Info,
  PhoneCall,
  ShieldAlert,
  Edit3,
  Check,
  Radio as RadioIcon,
  Bell,
  Calendar,
  Building2,
  Lock,
  Crown,
} from 'lucide-react';
import { PlanUpgradeModal } from '../components/PlanUpgradeModal';
import { useRadio } from '../context/RadioContext';
import { attachVoiceNormalizer, BroadcastVoiceProcessor } from '../utils/audioNormalizer';
import {
  playSupermarketChime,
  playFlashSiren,
  playAttentionAlert,
  playCashRegister,
  LiveMicrophoneBroadcaster,
} from '../utils/soundboard';
import { VoicePreset, SoundtrackOption, SoundtrackId, RadioQueueItem, RadioPlaylist, RadioMusicTrack, UserProfile } from '../types';
import { api } from '../services/api';
import { useFavoriteVoices } from '../services/voiceFavorites';

interface RadioViewProps {
  user?: UserProfile;
  onCreditsChanged: (newBalance: number) => void;
  onOpenStudio: () => void;
}

interface QuickRadioTemplate {
  id: string;
  label: string;
  badge: string;
  type: RadioQueueItem['type'];
  title: string;
  script: string;
  soundtrackId: SoundtrackId;
}

const SUPERMARKET_LIVE_TEMPLATES: QuickRadioTemplate[] = [
  {
    id: 'fornada-padaria',
    label: '🥖 Pão Quentinho na Padaria',
    badge: 'Padaria',
    type: 'comunicado',
    title: 'Aviso Padaria — Fornada de Pão Francês Quentinho',
    script:
      'Atenção clientes! Acabou de sair mais uma fornada de pão francês quentinho e crocante na nossa padaria! Passe agora mesmo no setor de panificação e leve pão fresquinho para a sua família!',
    soundtrackId: 'varejo_alegre',
  },
  {
    id: 'relampago-acougue',
    label: '🥩 Oferta Relâmpago Açougue',
    badge: 'Açougue',
    type: 'relampago',
    title: 'Oferta Relâmpago — Cortes Selecionados no Açougue',
    script:
      'Atenção clientes para a oferta relâmpago no nosso açougue! Só pelos próximos trinta minutos: Contrafilé Bovino fresquinho por apenas trinta e nove reais e noventa centavos o quilo! Corra para o balcão do açougue e garanta o seu churrasco!',
    soundtrackId: 'black_friday_urgente',
  },
  {
    id: 'feira-hortifruti',
    label: '🥬 Feirinha do Hortifrúti',
    badge: 'Hortifrúti',
    type: 'oferta',
    title: 'Oferta Hortifrúti — Frutas e Verduras direto do Produtor',
    script:
      'Clientes amigos, aproveitem a nossa seleção especial no setor de hortifrúti! Banana Prata selecionada por apenas quatro reais e noventa e nove centavos o quilo! Tomate maduro e batata lavada com preço baixo de verdade. Confira!',
    soundtrackId: 'acustico_hortifruti',
  },
  {
    id: 'boas-vindas-loja',
    label: '🛒 Vinheta de Boas-Vindas',
    badge: 'Institucional',
    type: 'vinheta',
    title: 'Vinheta Institucional — Boas-Vindas aos Clientes',
    script:
      'Seja muito bem-vindo ao nosso supermercado! É uma alegria receber você e sua família. Você está ouvindo a nossa Rádio Interna com as melhores ofertas do dia para você economizar de verdade. Boas compras!',
    soundtrackId: 'varejo_alegre',
  },
  {
    id: 'chamada-estacionamento',
    label: '🚗 Chamada de Estacionamento',
    badge: 'Comunicado',
    type: 'comunicado',
    title: 'Comunicado — Solicitação de Comparecimento ao Estacionamento',
    script:
      'Atenção senhor cliente proprietário do veículo estacionado no pátio da loja, solicitamos por gentileza o seu comparecimento imediato ao balcão de atendimento ao cliente na entrada da loja. Obrigado!',
    soundtrackId: 'institucional_gourmet',
  },
  {
    id: 'fechamento-loja',
    label: '⏰ Aviso de Fechamento',
    badge: 'Comunicado',
    type: 'comunicado',
    title: 'Comunicado — Aviso de Encerramento do Expediente',
    script:
      'Atenção senhores clientes! Informamos que a nossa loja encerrará o atendimento dentro de quinze minutos. Pedimos por gentileza que se dirijam aos caixas para finalizar suas compras. Agradecemos a preferência!',
    soundtrackId: 'institucional_gourmet',
  },
];

export interface QuickAnnouncementItem {
  id: string;
  category: 'estacionamento' | 'fechamento' | 'caixa' | 'seguranca' | 'informativo' | 'operacional';
  categoryLabel: string;
  icon: string;
  title: string;
  badge: string;
  description: string;
  script: string;
  soundtrackId: SoundtrackId;
  defaultPriority: 'normal' | 'alta';
}

export const SUPERMARKET_ANNOUNCEMENTS: QuickAnnouncementItem[] = [
  // 🚗 Estacionamento
  {
    id: 'carro-farol-aceso',
    category: 'estacionamento',
    categoryLabel: 'Estacionamento',
    icon: '🚗',
    title: 'Veículo com Faróis Acesos no Estacionamento',
    badge: 'Urgente',
    description: 'Avisa o proprietário para desligar as luzes e não descarregar a bateria.',
    script:
      'Atenção clientes: identificamos um veículo no estacionamento da loja com os faróis acesos. Solicitamos por gentileza que o proprietário verifique seu automóvel para evitar o descarregamento da bateria. Agradecemos a atenção!',
    soundtrackId: 'institucional_gourmet',
    defaultPriority: 'alta',
  },
  {
    id: 'carro-bloqueando',
    category: 'estacionamento',
    categoryLabel: 'Estacionamento',
    icon: '🚫',
    title: 'Veículo Bloqueando Passagem no Estacionamento',
    badge: 'Atenção',
    description: 'Solicita a retirada de carro bloqueando a saída ou vaga de outro cliente.',
    script:
      'Atenção proprietário do veículo estacionado no pátio: solicitamos a gentileza de comparecer ao estacionamento para manobrar seu veículo, pois o mesmo está bloqueando a passagem de outros clientes. Agradecemos a compreensão!',
    soundtrackId: 'institucional_gourmet',
    defaultPriority: 'alta',
  },
  {
    id: 'alarme-disparado',
    category: 'estacionamento',
    categoryLabel: 'Estacionamento',
    icon: '🚨',
    title: 'Alarme de Carro Disparando no Pátio Externo',
    badge: 'Segurança',
    description: 'Alerta sobre veículo com alarme sonoro ativado no pátio.',
    script:
      'Atenção senhores clientes: comunicamos que há um veículo com o alarme sonoro disparado no nosso estacionamento externo. Por gentileza, solicitamos ao proprietário que verifique seu veículo no pátio.',
    soundtrackId: 'institucional_gourmet',
    defaultPriority: 'alta',
  },

  // ⏰ Fechamento de Loja
  {
    id: 'fechamento-15min',
    category: 'fechamento',
    categoryLabel: 'Fechamento',
    icon: '⏰',
    title: 'Aviso de Fechamento em 15 Minutos',
    badge: 'Horário',
    description: 'Orienta os clientes a se dirigirem aos caixas para finalizar compras.',
    script:
      'Atenção estimados clientes! Informamos que a nossa loja encerrará o atendimento dentro de quinze minutos. Aproveite para finalizar suas compras e se dirigir a um de nossos caixas abertos. Agradecemos a preferência e boas compras!',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'alta',
  },
  {
    id: 'fechamento-5min',
    category: 'fechamento',
    categoryLabel: 'Fechamento',
    icon: '⏳',
    title: 'Aviso de Fechamento em 5 Minutos (Últimas Compras)',
    badge: 'Última Chamada',
    description: 'Aviso urgente de caixas fechando em 5 minutos.',
    script:
      'Atenção senhores clientes: faltam apenas cinco minutos para o encerramento das nossas atividades hoje. Por gentileza, dirijam-se imediatamente aos caixas para registrar seus produtos. Desejamos a todos uma excelente noite!',
    soundtrackId: 'institucional_gourmet',
    defaultPriority: 'alta',
  },
  {
    id: 'fechamento-concluido',
    category: 'fechamento',
    categoryLabel: 'Fechamento',
    icon: '🌙',
    title: 'Encerramento do Expediente & Agradecimento',
    badge: 'Boa Noite',
    description: 'Mensagem de encerramento da loja e agradecimento aos clientes.',
    script:
      'Informamos que encerramos o nosso expediente de hoje. Agradecemos a todos os nossos clientes pela presença e preferência. Amanhã estaremos de volta a partir das sete da manhã com produtos fresquinhos e muitas promoções para você. Tenham todos uma ótima noite!',
    soundtrackId: 'institucional_gourmet',
    defaultPriority: 'normal',
  },

  // 💳 Frente de Caixa e Atendimento
  {
    id: 'caixa-rapido-10itens',
    category: 'caixa',
    categoryLabel: 'Frente de Caixa',
    icon: '⚡',
    title: 'Abertura de Caixa Rápido (Até 10 Volumes)',
    badge: 'Agilidade',
    description: 'Convida clientes com poucas compras para atendimento expresso.',
    script:
      'Atenção clientes com compras de até dez volumes: temos caixa rápido aberto para atendimento imediato e sem fila! Passe suas compras com total agilidade e economia de tempo.',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'normal',
  },
  {
    id: 'caixa-preferencial',
    category: 'caixa',
    categoryLabel: 'Frente de Caixa',
    icon: '👵',
    title: 'Atendimento Preferencial Aberto',
    badge: 'Prioridade',
    description: 'Aviso de caixas prioritários para idosos, gestantes e PcD.',
    script:
      'Comunicamos que os caixas de atendimento preferencial estão à disposição para gestantes, idosos, lactantes e pessoas com deficiência. Nosso compromisso é o respeito, o conforto e a dedicação ao seu atendimento!',
    soundtrackId: 'institucional_gourmet',
    defaultPriority: 'normal',
  },
  {
    id: 'novo-caixa-fila',
    category: 'caixa',
    categoryLabel: 'Frente de Caixa',
    icon: '🛒',
    title: 'Abertura de Novo Caixa para Agilizar Atendimento',
    badge: 'Sem Fila',
    description: 'Chamada de clientes da fila para novo caixa aberto.',
    script:
      'Atenção clientes amigos: estamos abrindo mais um caixa para agilizar o atendimento de vocês! Por gentileza, os próximos clientes da fila podem se dirigir ao caixa ao lado.',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'alta',
  },

  // 👶 Segurança e Apoio
  {
    id: 'crianca-atendimento',
    category: 'seguranca',
    categoryLabel: 'Segurança & Clientes',
    icon: '👶',
    title: 'Criança Aguardando Responsáveis no Atendimento',
    badge: 'Urgente',
    description: 'Localização de responsáveis por criança na loja.',
    script:
      'Atenção clientes e colaboradores: temos uma criança aguardando seus pais ou responsáveis com toda a segurança no balcão de atendimento ao cliente, na entrada da loja. Solicitamos por gentileza que os responsáveis se dirijam ao balcão. Obrigado!',
    soundtrackId: 'institucional_gourmet',
    defaultPriority: 'alta',
  },
  {
    id: 'achados-perdidos',
    category: 'seguranca',
    categoryLabel: 'Segurança & Clientes',
    icon: '🔑',
    title: 'Achados e Perdidos — Documento ou Objeto Localizado',
    badge: 'Atendimento',
    description: 'Comunica achado de documento, bolsa ou chave na loja.',
    script:
      'Atenção clientes: foi encontrado um objeto pessoal no interior da nossa loja. O mesmo encontra-se guardado no balcão de atendimento ao cliente. Para retirá-lo, favor comparecer ao balcão mediante identificação. Agradecemos a atenção!',
    soundtrackId: 'institucional_gourmet',
    defaultPriority: 'normal',
  },
  {
    id: 'limpeza-corredor',
    category: 'operacional',
    categoryLabel: 'Operacional',
    icon: '🧼',
    title: 'Chamada Operacional — Apoio de Limpeza no Corredor',
    badge: 'Equipe',
    description: 'Solicita equipe de limpeza e apoio no corredor.',
    script:
      'Atenção equipe de apoio e limpeza da loja: solicitamos o comparecimento com material de apoio ao corredor da loja para atendimento imediato. Obrigado!',
    soundtrackId: 'sem_trilha',
    defaultPriority: 'alta',
  },

  // 📢 Informativos da Loja
  {
    id: 'clube-descontos-cpf',
    category: 'informativo',
    categoryLabel: 'Informativo',
    icon: '📱',
    title: 'Clube de Descontos & CPF no Caixa',
    badge: 'Economia',
    description: 'Estimula os clientes a informarem o CPF para descontos exclusivos.',
    script:
      'Você sabia que informando o seu CPF no caixa você garante descontos automáticos e exclusivos em centenas de itens? É rápido, gratuito e a economia cai direto na sua nota! Peça ao nosso operador e aproveite os benefícios do nosso clube!',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'normal',
  },
  {
    id: 'formas-pagamento-pix',
    category: 'informativo',
    categoryLabel: 'Informativo',
    icon: '💳',
    title: 'Formas de Pagamento, PIX e Vales-Alimentação',
    badge: 'Facilidade',
    description: 'Informa todas as opções de pagamento aceitas pelo supermercado.',
    script:
      'Facilidade e comodidade para você economizar: aceitamos pagamentos via PIX, cartões de crédito e débito das principais bandeiras e todos os vales-alimentação e refeição. Venha encher o carrinho com total tranquilidade!',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'normal',
  },
  {
    id: 'delivery-whatsapp',
    category: 'informativo',
    categoryLabel: 'Informativo',
    icon: '🛵',
    title: 'Delivery & Pedidos pelo WhatsApp da Loja',
    badge: 'Comodidade',
    description: 'Divulga o canal de compras online e entrega em domicílio.',
    script:
      'Sabia que você pode fazer suas compras sem sair de casa? Envie sua lista de compras agora mesmo para o nosso WhatsApp oficial e receba tudo fresquinho com entrega rápida no conforto do seu lar! Consulte nosso número nos cartazes da loja.',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'normal',
  },
];

export interface RadioVinhetaItem {
  id: string;
  category: 'identificacao' | 'institucional' | 'setores' | 'clube' | 'sweepers';
  categoryLabel: string;
  icon: string;
  title: string;
  badge: string;
  description: string;
  scriptTemplate: string;
  soundtrackId: SoundtrackId;
  defaultPriority: 'normal' | 'alta';
}

export const SUPERMARKET_VINHETAS: RadioVinhetaItem[] = [
  // 📻 Identificação da Rádio
  {
    id: 'vinheta-radio-principal',
    category: 'identificacao',
    categoryLabel: 'Identificação da Rádio',
    icon: '📻',
    title: 'Identificação Oficial da Rádio da Loja',
    badge: 'Rádio Oficial',
    description: 'Apresenta a rádio interna da loja para os clientes em compras.',
    scriptTemplate:
      'Você está sintonizado na Rádio {loja}! A sua melhor escolha em economia, variedade e produtos selecionados todos os dias.',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'alta',
  },
  {
    id: 'vinheta-radio-slogan',
    category: 'identificacao',
    categoryLabel: 'Identificação da Rádio',
    icon: '✨',
    title: 'Slogan & Economia Familiar',
    badge: 'Slogan da Loja',
    description: 'Reforça a marca e a economia garantida para a família.',
    scriptTemplate:
      'Rádio {loja}! A rádio da economia e das melhores ofertas para a sua família. Aqui você compra mais gastando menos!',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'alta',
  },
  {
    id: 'vinheta-radio-frequencia',
    category: 'identificacao',
    categoryLabel: 'Identificação da Rádio',
    icon: '🎵',
    title: 'Música & Melhores Compras',
    badge: 'Trilha & Ofertas',
    description: 'Passagem descontraída valorizando o ambiente agradável da loja.',
    scriptTemplate:
      'No ar, a Rádio {loja}! A seleção musical perfeita para embalar o seu dia com ofertas imperdíveis em todos os corredores.',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'normal',
  },

  // 🏪 Institucional & Boas-Vindas
  {
    id: 'vinheta-boas-vindas',
    category: 'institucional',
    categoryLabel: 'Institucional',
    icon: '🛒',
    title: 'Boas-Vindas com Carinho ao Cliente',
    badge: 'Boas-Vindas',
    description: 'Dá as boas-vindas e deseja uma excelente experiência de compras.',
    scriptTemplate:
      'Seja muito bem-vindo ao {loja}! É um prazer imenso ter você aqui com a gente. Aproveite nossas promoções e tenha um ótimo dia de compras!',
    soundtrackId: 'institucional_gourmet',
    defaultPriority: 'alta',
  },
  {
    id: 'vinheta-obrigado-preferencia',
    category: 'institucional',
    categoryLabel: 'Institucional',
    icon: '❤️',
    title: 'Agradecimento pela Preferência',
    badge: 'Gratidão',
    description: 'Agradece a confiança e fidelidade dos clientes.',
    scriptTemplate:
      'Obrigado pela sua preferência em comprar no {loja}! Nossa equipe trabalha diariamente com muito carinho para levar sempre o melhor até a sua mesa.',
    soundtrackId: 'institucional_gourmet',
    defaultPriority: 'normal',
  },
  {
    id: 'vinheta-compromisso-qualidade',
    category: 'institucional',
    categoryLabel: 'Institucional',
    icon: '⭐',
    title: 'Compromisso com a Qualidade',
    badge: 'Qualidade Total',
    description: 'Destaca o compromisso da loja com produtos de excelência.',
    scriptTemplate:
      '{loja}: aqui a qualidade máxima anda de mãos dadas com o preço justo! Obrigado por escolher a nossa casa para abastecer a sua.',
    soundtrackId: 'institucional_gourmet',
    defaultPriority: 'normal',
  },

  // 🥩 Setores Especializados
  {
    id: 'vinheta-setor-acougue',
    category: 'setores',
    categoryLabel: 'Setores da Loja',
    icon: '🥩',
    title: 'Açougue — Carnes Nobres & Cortes Especiais',
    badge: 'Açougue',
    description: 'Chama a atenção dos clientes para o balcão de carnes e churrasco.',
    scriptTemplate:
      'As melhores carnes, cortes nobres e procedência rigorosa para o seu dia a dia e para o churrasco do fim de semana. Venha conferir o açougue do {loja}!',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'alta',
  },
  {
    id: 'vinheta-setor-hortifruti',
    category: 'setores',
    categoryLabel: 'Setores da Loja',
    icon: '🍎',
    title: 'Hortifrúti — Frescor & Saúde Direto da Roça',
    badge: 'Hortifrúti',
    description: 'Valoriza o setor de frutas, legumes e verduras fresquinhas.',
    scriptTemplate:
      'Frutas, legumes e verduras fresquinhas, selecionadas e cheias de sabor esperando por você. Dê uma passadinha no setor de hortifrúti do {loja}!',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'alta',
  },
  {
    id: 'vinheta-setor-padaria',
    category: 'setores',
    categoryLabel: 'Setores da Loja',
    icon: '🥖',
    title: 'Padaria — Pão Quentinho & Confeitaria',
    badge: 'Padaria',
    description: 'Desperta o apetite para os pães e doces recém-saídos do forno.',
    scriptTemplate:
      'Aquele cheirinho irresistível de pão quentinho e delícias saindo do forno a toda hora! Passe na padaria e confeitaria do {loja} e leve o melhor para o seu café.',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'normal',
  },
  {
    id: 'vinheta-setor-bebidas',
    category: 'setores',
    categoryLabel: 'Setores da Loja',
    icon: '🍾',
    title: 'Bebidas & Adega — Cervejas & Vinhos Especiais',
    badge: 'Bebidas & Adega',
    description: 'Divulga o setor de bebidas geladas e vinhos com ótimos preços.',
    scriptTemplate:
      'Cervejas estupidamente geladas, vinhos selecionados, sucos e refrigerantes com descontos imperdíveis no setor de bebidas do {loja}!',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'normal',
  },

  // 💳 Clube & Vantagens
  {
    id: 'vinheta-clube-cpf',
    category: 'clube',
    categoryLabel: 'Clube & Vantagens',
    icon: '💳',
    title: 'Clube de Descontos & CPF no Caixa',
    badge: 'Clube da Loja',
    description: 'Lembra os clientes de informar o CPF para garantir descontos.',
    scriptTemplate:
      'Você já garantiu seus descontos exclusivos hoje? Ao passar no caixa, informe o seu CPF e aproveite as vantagens do Clube de Descontos do {loja}!',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'alta',
  },
  {
    id: 'vinheta-delivery-whatsapp',
    category: 'clube',
    categoryLabel: 'Clube & Vantagens',
    icon: '📱',
    title: 'Delivery & Pedidos pelo WhatsApp',
    badge: 'Delivery Rápido',
    description: 'Informa sobre o canal de compras práticas sem sair de casa.',
    scriptTemplate:
      'Sabia que você pode fazer suas compras pelo WhatsApp? Mande sua lista para o nosso número oficial e receba tudo fresquinho na sua casa com o Delivery do {loja}!',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'normal',
  },

  // ⚡ Sweepers / Carimbos Rápidos (5 a 8s)
  {
    id: 'vinheta-sweeper-oferta',
    category: 'sweepers',
    categoryLabel: 'Carimbos Rápidos (Sweepers)',
    icon: '⚡',
    title: 'Carimbo Curto — Economia Garantida',
    badge: 'Carimbo 5s',
    description: 'Passagem ultracurta para carimbar o nome da loja entre músicas.',
    scriptTemplate:
      '{loja}! Lugar de comprar barato e economizar de verdade.',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'alta',
  },
  {
    id: 'vinheta-sweeper-qualidade',
    category: 'sweepers',
    categoryLabel: 'Carimbos Rápidos (Sweepers)',
    icon: '🔥',
    title: 'Carimbo Curto — As Melhores Ofertas',
    badge: 'Carimbo 6s',
    description: 'Intercalador sonoro rápido focado em ofertas.',
    scriptTemplate:
      'Fique ligado! As melhores ofertas do dia estão aqui no {loja}!',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'alta',
  },
  {
    id: 'vinheta-sweeper-passagem',
    category: 'sweepers',
    categoryLabel: 'Carimbos Rápidos (Sweepers)',
    icon: '🎶',
    title: 'Carimbo Musical — Rádio no Ar',
    badge: 'Carimbo 5s',
    description: 'Assinatura sonora rápida da rádio da loja.',
    scriptTemplate:
      'Você está ouvindo a Rádio {loja}! Música e economia o dia todo.',
    soundtrackId: 'varejo_alegre',
    defaultPriority: 'normal',
  },
];

export const RadioView: React.FC<RadioViewProps> = ({ user, onCreditsChanged, onOpenStudio }) => {
  const {
    config,
    availableAudios,
    isOnAir,
    isDucking,
    currentMusic,
    currentSpot,
    nextSpot,
    countdownSeconds,
    spotCurrentTime,
    spotDuration,
    musicCurrentTime,
    musicDuration,
    broadcastLogs,
    loading,
    refreshRadioData,
    updateConfig,
    toggleOnAir,
    restartRadio,
    autoplayBlocked,
    resumeAutoplay,
    playSpotNow,
    stopCurrentSpot,
    skipMusicTrack,
    publishAudioToRadio,
    removeQueueItem,
    moveQueueItem,
    updateQueueItem,
    toggleQueueItemActive,
    toggleQueueItemPriority,
    addCustomMusicFiles,
    uploadCustomMusic,
    createCustomPlaylist,
    deleteCustomPlaylist,
    deleteMusicTrack,
    updateMusicTrack,
    setActivePlaylist,
    playMusicTrackNow,
    uploadSpotAudioFile,
    vocalBoostDb,
    isVocalLevelerEnabled,
    toggleVocalLeveler,
    musicBoostDb,
    isMusicLevelerEnabled,
    toggleMusicLeveler,
    triggerManualDucking,
    isLiveMicActive,
    setLiveMicActive,
    sessionConflict,
    clearSessionConflict,
    takeoverRadioSession,
    supersededMessage,
    clearSupersededMessage,
    activeStoreId,
    setActiveStoreId,
    createRadioStore,
    updateRadioStore,
    deleteRadioStore,
  } = useRadio();

  const isGratuito = user?.plan === 'gratuito';
  const isProVarejo = user?.plan === 'pro_varejo';
  const isRedesAtacarejo = user?.plan === 'redes_atacarejo' || user?.role === 'admin';

  const [restrictedModal, setRestrictedModal] = useState<{ title: string; message: string } | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isStoreManagerOpen, setIsStoreManagerOpen] = useState<boolean>(false);
  const [newStoreName, setNewStoreName] = useState<string>('');
  const [newStoreCity, setNewStoreCity] = useState<string>('');
  const [newStoreSlogan, setNewStoreSlogan] = useState<string>('');
  const [isCreatingStore, setIsCreatingStore] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<
    'flash_studio' | 'announcements' | 'vinhetas' | 'queue' | 'music' | 'library_import'
  >('flash_studio');
  const [voices, setVoices] = useState<VoicePreset[]>([]);
  const [soundtracks, setSoundtracks] = useState<SoundtrackOption[]>([]);
  const [isStoreMonitorMode, setIsStoreMonitorMode] = useState<boolean>(false);

  // Announcements & Soundboard State
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState<string>('todas');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [micVuLevel, setMicVuLevel] = useState<number>(0);
  const liveMicRef = useRef<LiveMicrophoneBroadcaster | null>(null);
  const [soundboardActiveEffect, setSoundboardActiveEffect] = useState<string | null>(null);
  const [isGeneratingAnnouncement, setIsGeneratingAnnouncement] = useState<boolean>(false);
  const [announcementFeedback, setAnnouncementFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [customizingAnnouncement, setCustomizingAnnouncement] = useState<QuickAnnouncementItem | null>(null);
  const [customModalTitle, setCustomModalTitle] = useState<string>('');
  const [customModalScript, setCustomModalScript] = useState<string>('');
  const [customModalSoundtrack, setCustomModalSoundtrack] = useState<SoundtrackId>('institucional_gourmet');
  const [customModalPriority, setCustomModalPriority] = useState<RadioQueueItem['priority']>('alta');
  const [announcementAddToQueueMap, setAnnouncementAddToQueueMap] = useState<Record<string, boolean>>({});
  const [modalAddToQueue, setModalAddToQueue] = useState<boolean>(false);

  // Vinhetas State
  const [vinhetaCategoryFilter, setVinhetaCategoryFilter] = useState<string>('todas');
  const [isGeneratingVinheta, setIsGeneratingVinheta] = useState<boolean>(false);
  const [vinhetaFeedback, setVinhetaFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [customizingVinheta, setCustomizingVinheta] = useState<RadioVinhetaItem | null>(null);
  const [customVinhetaTitle, setCustomVinhetaTitle] = useState<string>('');
  const [customVinhetaScript, setCustomVinhetaScript] = useState<string>('');
  const [customVinhetaSoundtrack, setCustomVinhetaSoundtrack] = useState<SoundtrackId>('varejo_alegre');
  const [customVinhetaPriority, setCustomVinhetaPriority] = useState<RadioQueueItem['priority']>('alta');
  const [vinhetaAddToQueueMap, setVinhetaAddToQueueMap] = useState<Record<string, boolean>>({});
  const [vinhetaModalAddToQueue, setVinhetaModalAddToQueue] = useState<boolean>(false);
  const uploadVinhetaInputRef = useRef<HTMLInputElement | null>(null);

  // Flash Spot Generator State
  const [flashTitle, setFlashTitle] = useState<string>('Oferta Relâmpago — Rádio do Supermercado');
  const [flashScript, setFlashScript] = useState<string>(
    'Atenção clientes! Oferta relâmpago acabando de entrar no ar: Café Torrado e Moído quinhentos gramas por apenas quatorze reais e noventa centavos a unidade! Aproveite agora nos nossos corredores!'
  );
  const [flashQuickProducts, setFlashQuickProducts] = useState<string>('');
  const [flashType, setFlashType] = useState<RadioQueueItem['type']>('relampago');
  const [flashPriority, setFlashPriority] = useState<RadioQueueItem['priority']>('alta');
  const { favorites, toggleFavorite, isFavorite } = useFavoriteVoices();
  const [radioVoiceFilter, setRadioVoiceFilter] = useState<'todas' | 'favoritas'>('todas');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('daniel-varejo');
  const [selectedSoundtrackId, setSelectedSoundtrackId] = useState<SoundtrackId>('varejo_alegre');
  const [soundtrackVolume, setSoundtrackVolume] = useState<number>(0.22);
  const [playImmediatelyOnCreate, setPlayImmediatelyOnCreate] = useState<boolean>(true);
  const [generatingFlash, setGeneratingFlash] = useState<boolean>(false);
  const [generatingAiScript, setGeneratingAiScript] = useState<boolean>(false);
  const [flashFeedback, setFlashFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Upload Custom Spot Audio from Computer State
  const uploadSpotInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingSpot, setIsUploadingSpot] = useState<boolean>(false);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [uploadModalTitle, setUploadModalTitle] = useState<string>('');
  const [uploadModalType, setUploadModalType] = useState<RadioQueueItem['type']>('oferta');
  const [uploadModalPriority, setUploadModalPriority] = useState<RadioQueueItem['priority']>('normal');
  const [uploadModalAudioUrl, setUploadModalAudioUrl] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete Confirmation Modal State
  const [queueItemToDelete, setQueueItemToDelete] = useState<RadioQueueItem | null>(null);
  const [isDeletingQueueItem, setIsDeletingQueueItem] = useState<boolean>(false);

  const handleConfirmDeleteQueueItem = async () => {
    if (!queueItemToDelete) return;
    try {
      setIsDeletingQueueItem(true);
      await removeQueueItem(queueItemToDelete.id);
      setQueueItemToDelete(null);
    } catch (err: any) {
      console.error('Erro ao remover locução da grade:', err);
    } finally {
      setIsDeletingQueueItem(false);
    }
  };

  // -------------------------------------------------------------
  // Grade por Dia da Semana (Programação Semanal da Rádio Web)
  // -------------------------------------------------------------
  const [gradeDayFilter, setGradeDayFilter] = useState<number | 'all' | 'today'>('all');
  const todayDayOfWeek = new Date().getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb

  const DAYS_OF_WEEK_CONFIG = [
    { id: 1, name: 'Segunda', fullName: 'Segunda-feira', short: 'S', tag: 'seg' },
    { id: 2, name: 'Terça', fullName: 'Terça-feira', short: 'T', tag: 'ter' },
    { id: 3, name: 'Quarta', fullName: 'Quarta-feira', short: 'Q', tag: 'qua' },
    { id: 4, name: 'Quinta', fullName: 'Quinta-feira', short: 'Q', tag: 'qui' },
    { id: 5, name: 'Sexta', fullName: 'Sexta-feira', short: 'S', tag: 'sex' },
    { id: 6, name: 'Sábado', fullName: 'Sábado', short: 'S', tag: 'sab' },
    { id: 0, name: 'Domingo', fullName: 'Domingo', short: 'D', tag: 'dom' },
  ];

  const isItemScheduledForDay = (daysOfWeek?: number[], day: number = todayDayOfWeek) => {
    if (!daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) return true;
    return daysOfWeek.includes(day);
  };

  const getDaysSummary = (daysOfWeek?: number[]) => {
    if (!daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0 || daysOfWeek.length === 7) {
      return 'Todos os Dias';
    }
    const sorted = [...daysOfWeek].sort((a, b) => a - b);
    if (sorted.length === 5 && [1, 2, 3, 4, 5].every(d => sorted.includes(d))) {
      return 'Segunda a Sexta';
    }
    if (sorted.length === 2 && sorted.includes(0) && sorted.includes(6)) {
      return 'Fim de Semana (Sáb/Dom)';
    }
    const dayNames: Record<number, string> = {
      1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb', 0: 'Dom'
    };
    return sorted.map(d => dayNames[d]).join(', ');
  };

  const getDaysPresetValue = (daysOfWeek?: number[]) => {
    if (!daysOfWeek || daysOfWeek.length === 0 || daysOfWeek.length === 7) return 'all';
    const sorted = [...daysOfWeek].sort((a, b) => a - b);
    if (sorted.length === 5 && [1, 2, 3, 4, 5].every(d => sorted.includes(d))) return 'weekdays';
    if (sorted.length === 2 && sorted.includes(0) && sorted.includes(6)) return 'weekend';
    if (sorted.length === 1) {
      if (sorted[0] === 1) return 'seg';
      if (sorted[0] === 2) return 'ter';
      if (sorted[0] === 3) return 'qua';
      if (sorted[0] === 4) return 'qui';
      if (sorted[0] === 5) return 'sex';
      if (sorted[0] === 6) return 'sab';
      if (sorted[0] === 0) return 'dom';
    }
    return 'custom';
  };

  const handleDayPresetChange = (itemId: string, preset: string) => {
    let days: number[] | undefined;
    switch (preset) {
      case 'all':
        days = undefined;
        break;
      case 'weekdays':
        days = [1, 2, 3, 4, 5];
        break;
      case 'weekend':
        days = [0, 6];
        break;
      case 'seg':
        days = [1];
        break;
      case 'ter':
        days = [2];
        break;
      case 'qua':
        days = [3];
        break;
      case 'qui':
        days = [4];
        break;
      case 'sex':
        days = [5];
        break;
      case 'sab':
        days = [6];
        break;
      case 'dom':
        days = [0];
        break;
      default:
        return;
    }
    updateQueueItem(itemId, { daysOfWeek: days });
  };

  const toggleItemDay = (itemId: string, currentDays: number[] | undefined, dayToToggle: number) => {
    const currentList = (!currentDays || currentDays.length === 0)
      ? [0, 1, 2, 3, 4, 5, 6]
      : [...currentDays];

    let nextList: number[];
    if (currentList.includes(dayToToggle)) {
      if (currentList.length === 1) {
        return;
      }
      nextList = currentList.filter(d => d !== dayToToggle);
    } else {
      nextList = [...currentList, dayToToggle].sort((a, b) => a - b);
    }
    updateQueueItem(itemId, { daysOfWeek: nextList.length === 7 ? undefined : nextList });
  };

  // -------------------------------------------------------------
  // Ambient Music & Playlists State
  // -------------------------------------------------------------
  const [selectedPlaylistFilter, setSelectedPlaylistFilter] = useState<string>('todas');
  const uploadMusicFileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingUploadMusicFile, setPendingUploadMusicFile] = useState<File | null>(null);
  const [uploadMusicTitle, setUploadMusicTitle] = useState<string>('');
  const [uploadMusicArtist, setUploadMusicArtist] = useState<string>('MP3 Próprio da Loja');
  const [uploadMusicPlaylistId, setUploadMusicPlaylistId] = useState<string>('pop_varejo');
  const [uploadMusicAudioUrl, setUploadMusicAudioUrl] = useState<string | null>(null);
  const [isUploadingMusic, setIsUploadingMusic] = useState<boolean>(false);
  const [uploadMusicFeedback, setUploadMusicFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreatePlaylistInline, setShowCreatePlaylistInline] = useState<boolean>(false);
  const [inlineNewPlaylistName, setInlineNewPlaylistName] = useState<string>('');

  // Create Playlist Modal State
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState<string>('');
  const [newPlaylistIcon, setNewPlaylistIcon] = useState<string>('🛒');
  const [newPlaylistColor, setNewPlaylistColor] = useState<string>('orange');
  const [isSubmittingPlaylist, setIsSubmittingPlaylist] = useState<boolean>(false);

  // Delete Music Track State
  const [musicTrackToDelete, setMusicTrackToDelete] = useState<RadioMusicTrack | null>(null);
  const [isDeletingMusicTrack, setIsDeletingMusicTrack] = useState<boolean>(false);

  const handleMusicFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGratuito) {
      if (uploadMusicFileInputRef.current) uploadMusicFileInputRef.current.value = '';
      setRestrictedModal({
        title: 'Upload de Músicas MP3 da Loja',
        message: 'O envio de músicas MP3 próprias do computador para a Rádio Web é exclusivo dos planos Pro Varejo e Redes Atacarejo. No plano gratuito você tem à disposição mais de 6 playlists temáticas com dezenas de músicas comerciais prontas!'
      });
      return;
    }
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setPendingUploadMusicFile(file);
    setUploadMusicTitle(file.name.replace(/\.(mp3|wav|ogg|m4a|aac)$/i, ''));
    setUploadMusicArtist('MP3 Próprio da Loja');
    setUploadMusicPlaylistId(
      selectedPlaylistFilter !== 'todas'
        ? selectedPlaylistFilter
        : (config.playlists && config.playlists.length > 0 ? config.playlists[0].id : 'pop_varejo')
    );
    setUploadMusicAudioUrl(URL.createObjectURL(file));
    setShowCreatePlaylistInline(false);
    setInlineNewPlaylistName('');
  };

  const handleConfirmMusicUpload = async () => {
    if (!pendingUploadMusicFile) return;
    try {
      setIsUploadingMusic(true);
      let targetPlaylistId = uploadMusicPlaylistId;

      // If user typed a new inline playlist name
      if (showCreatePlaylistInline && inlineNewPlaylistName.trim()) {
        const newPl = await createCustomPlaylist({
          name: inlineNewPlaylistName.trim(),
          description: 'Playlist temática criada na loja',
          icon: '🎵',
          color: 'orange',
        });
        targetPlaylistId = newPl.id;
      }

      await uploadCustomMusic(pendingUploadMusicFile, {
        title: uploadMusicTitle.trim() || pendingUploadMusicFile.name,
        artist: uploadMusicArtist.trim() || 'MP3 Próprio da Loja',
        playlistId: targetPlaylistId,
      });

      setSelectedPlaylistFilter(targetPlaylistId);
      setPendingUploadMusicFile(null);
      setUploadMusicAudioUrl(null);
      setUploadMusicFeedback({
        type: 'success',
        message: `Música "${uploadMusicTitle}" adicionada com sucesso à playlist!`,
      });
      setTimeout(() => setUploadMusicFeedback(null), 4000);
    } catch (err: any) {
      setUploadMusicFeedback({
        type: 'error',
        message: err.message || 'Erro ao carregar música',
      });
    } finally {
      setIsUploadingMusic(false);
      if (uploadMusicFileInputRef.current) uploadMusicFileInputRef.current.value = '';
    }
  };

  const handleCreateNewPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      setIsSubmittingPlaylist(true);
      const created = await createCustomPlaylist({
        name: newPlaylistName.trim(),
        description: newPlaylistDesc.trim(),
        icon: newPlaylistIcon,
        color: newPlaylistColor,
      });
      setSelectedPlaylistFilter(created.id);
      setIsCreatePlaylistModalOpen(false);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setUploadMusicFeedback({
        type: 'success',
        message: `Playlist "${created.name}" criada com sucesso!`,
      });
      setTimeout(() => setUploadMusicFeedback(null), 4000);
    } catch (err: any) {
      console.error('Erro ao criar playlist:', err);
    } finally {
      setIsSubmittingPlaylist(false);
    }
  };

  const handleConfirmDeleteMusicTrack = async () => {
    if (!musicTrackToDelete) return;
    try {
      setIsDeletingMusicTrack(true);
      await deleteMusicTrack(musicTrackToDelete.id);
      setMusicTrackToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir música:', err);
    } finally {
      setIsDeletingMusicTrack(false);
    }
  };

  const handleSpotFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGratuito) {
      if (uploadSpotInputRef.current) uploadSpotInputRef.current.value = '';
      setRestrictedModal({
        title: 'Upload de Áudio do Computador',
        message: 'O envio de arquivos de áudio externos do computador para a Rádio Web é exclusivo dos planos Pro Varejo e Redes Atacarejo. No plano gratuito você gera e transmite locuções de ofertas comerciais direto com as vozes de IA!'
      });
      return;
    }
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      const file = files[0];
      setPendingUploadFile(file);
      setUploadModalTitle(file.name.replace(/\.(mp3|wav|ogg|m4a|aac)$/i, ''));
      setUploadModalType('oferta');
      setUploadModalPriority('normal');
      setUploadModalAudioUrl(URL.createObjectURL(file));
      setUploadFeedback(null);
    } else {
      setIsUploadingSpot(true);
      try {
        for (let i = 0; i < files.length; i++) {
          await uploadSpotAudioFile(files[i]);
        }
        setUploadFeedback({
          type: 'success',
          message: `${files.length} áudios do seu computador foram adicionados à grade da rádio!`,
        });
        setTimeout(() => setUploadFeedback(null), 4000);
      } catch (err: any) {
        setUploadFeedback({
          type: 'error',
          message: err.message || 'Erro ao carregar arquivos de áudio',
        });
      } finally {
        setIsUploadingSpot(false);
        if (uploadSpotInputRef.current) uploadSpotInputRef.current.value = '';
      }
    }
  };

  const handleConfirmSpotUpload = async () => {
    if (!pendingUploadFile) return;
    setIsUploadingSpot(true);
    try {
      await uploadSpotAudioFile(pendingUploadFile, {
        title: uploadModalTitle.trim() || pendingUploadFile.name,
        type: uploadModalType,
        priority: uploadModalPriority,
      });
      setUploadFeedback({
        type: 'success',
        message: `Áudio "${uploadModalTitle}" adicionado com sucesso à grade da rádio!`,
      });
      setTimeout(() => setUploadFeedback(null), 4000);
      setPendingUploadFile(null);
      setUploadModalAudioUrl(null);
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: err.message || 'Erro ao enviar áudio do computador',
      });
    } finally {
      setIsUploadingSpot(false);
      if (uploadSpotInputRef.current) uploadSpotInputRef.current.value = '';
    }
  };

  // Station Header Edit State
  const [editingStationInfo, setEditingStationInfo] = useState<boolean>(false);
  const [stationNameInput, setStationNameInput] = useState<string>('');
  const [storeNameInput, setStoreNameInput] = useState<string>('');
  const [sloganInput, setSloganInput] = useState<string>('');

  // Cleanup Live Mic on unmount
  useEffect(() => {
    return () => {
      liveMicRef.current?.stop();
      setLiveMicActive(false);
    };
  }, [setLiveMicActive]);

  // Trigger Soundboard Effect
  const handleTriggerSoundEffect = (effect: 'chime' | 'siren' | 'attention' | 'cash') => {
    setSoundboardActiveEffect(effect);
    triggerManualDucking(true);

    if (effect === 'chime') playSupermarketChime(0.75);
    else if (effect === 'siren') playFlashSiren(0.7);
    else if (effect === 'attention') playAttentionAlert(0.75);
    else if (effect === 'cash') playCashRegister(0.75);

    setTimeout(() => {
      setSoundboardActiveEffect(null);
      triggerManualDucking(false);
    }, 1500);
  };

  // Toggle Live Microphone Broadcaster
  const handleToggleLiveMic = async () => {
    if (isMicActive || isLiveMicActive) {
      liveMicRef.current?.stop();
      setIsMicActive(false);
      setMicVuLevel(0);
      setLiveMicActive(false);
    } else {
      // Se houver qualquer locução no ar, encerra ela imediatamente para não atrapalhar o microfone
      if (currentSpot) {
        stopCurrentSpot();
      }
      setLiveMicActive(true);
      playSupermarketChime(0.7);
      setTimeout(async () => {
        if (!liveMicRef.current) {
          liveMicRef.current = new LiveMicrophoneBroadcaster();
        }
        const ok = await liveMicRef.current.start((vu) => setMicVuLevel(vu));
        if (ok) {
          setIsMicActive(true);
        } else {
          setLiveMicActive(false);
          alert('Não foi possível acessar o microfone. Verifique as permissões de áudio do seu navegador.');
        }
      }, 400);
    }
  };

  // Broadcast Quick Announcement (Respects user's option: only added to queue if checked)
  const handleBroadcastAnnouncement = async (
    ann: QuickAnnouncementItem,
    customText?: string,
    customTitleText?: string,
    explicitAddToQueue?: boolean
  ) => {
    setIsGeneratingAnnouncement(true);
    setAnnouncementFeedback(null);
    const textToSpeak = customText || ann.script;
    const titleToUse = customTitleText || ann.title;
    const shouldQueue = explicitAddToQueue !== undefined
      ? Boolean(explicitAddToQueue)
      : Boolean(announcementAddToQueueMap[ann.id]);

    try {
      playSupermarketChime(0.5);

      const res = await api.createRadioFlashSpot({
        title: titleToUse,
        scriptText: textToSpeak,
        storeName: config?.storeName || 'Supermercado',
        voiceId: selectedVoiceId,
        soundtrackId: ann.soundtrackId,
        soundtrackVolume: 0.15,
        type: 'comunicado',
        priority: 'alta',
        addToQueue: shouldQueue,
      });

      if (res && res.audio) {
        onCreditsChanged(res.creditsBalance);
        if (shouldQueue) {
          await refreshRadioData();
        }

        // Spot temporário avulso: toca agora no ar com Auto-Ducking
        const oneOffSpot: RadioQueueItem = {
          id: `announcement-oneoff-${Date.now()}`,
          audioId: res.audio.id,
          title: titleToUse,
          audioUrl: res.audio.audioUrl,
          downloadUrl: res.audio.downloadUrl,
          durationSeconds: res.audio.durationSeconds || 15,
          voiceName: res.audio.voiceName || 'Locutor',
          storeName: config?.storeName || 'Supermercado',
          type: 'comunicado',
          active: true,
          priority: 'alta',
          playCount: 1,
          addedAt: new Date().toISOString(),
        };

        playSpotNow(oneOffSpot);

        setAnnouncementFeedback({
          type: 'success',
          message: shouldQueue
            ? `Aviso "${titleToUse}" transmitido agora e adicionado à grade da rádio!`
            : `Aviso "${titleToUse}" transmitido no som da loja! (Não incluído na grade automática)`,
        });
        setTimeout(() => setAnnouncementFeedback(null), 5000);
        setCustomizingAnnouncement(null);
      }
    } catch (err: any) {
      setAnnouncementFeedback({
        type: 'error',
        message: err.message || 'Erro ao gerar e transmitir aviso no ar',
      });
    } finally {
      setIsGeneratingAnnouncement(false);
    }
  };

  // Add Quick Announcement to Queue
  const handleAddAnnouncementToQueue = async (
    ann: QuickAnnouncementItem,
    customText?: string,
    customTitleText?: string
  ) => {
    setIsGeneratingAnnouncement(true);
    setAnnouncementFeedback(null);
    const textToSpeak = customText || ann.script;
    const titleToUse = customTitleText || ann.title;

    try {
      const res = await api.createRadioFlashSpot({
        title: titleToUse,
        scriptText: textToSpeak,
        storeName: config?.storeName || 'Supermercado',
        voiceId: selectedVoiceId,
        soundtrackId: ann.soundtrackId,
        soundtrackVolume: 0.15,
        type: 'comunicado',
        priority: ann.defaultPriority,
        addToQueue: true, // Adiciona na grade de programação automática
      });

      if (res && res.queueItem) {
        onCreditsChanged(res.creditsBalance);
        await refreshRadioData();
        setAnnouncementFeedback({
          type: 'success',
          message: `Aviso "${titleToUse}" adicionado à grade de programação da rádio!`,
        });
        setTimeout(() => setAnnouncementFeedback(null), 4000);
        setCustomizingAnnouncement(null);
      }
    } catch (err: any) {
      setAnnouncementFeedback({
        type: 'error',
        message: err.message || 'Erro ao adicionar aviso à grade',
      });
    } finally {
      setIsGeneratingAnnouncement(false);
    }
  };

  const handleOpenCustomizeModal = (ann: QuickAnnouncementItem) => {
    setCustomizingAnnouncement(ann);
    setCustomModalTitle(ann.title);
    setCustomModalScript(ann.script);
    setCustomModalSoundtrack(ann.soundtrackId);
    setCustomModalPriority(ann.defaultPriority);
    setModalAddToQueue(Boolean(announcementAddToQueueMap[ann.id]));
    setAnnouncementFeedback(null);
  };

  // Nome resolvido da rádio / loja para as vinhetas
  const resolvedVinhetaStoreName = (config?.storeName && config.storeName !== 'Supermercado')
    ? config.storeName
    : (config?.stationName ? config.stationName.replace(/^rádio\s+/i, '').trim() : (config?.storeName || 'Supermercado'));

  // Atualizar todas as vinhetas com o nome que está no título da rádio
  const handleSyncVinhetasWithRadioName = async () => {
    const radioTitle = (config.stationName || '').trim();
    const rawClean = radioTitle.replace(/^rádio\s+/i, '').trim();
    const targetName = rawClean || radioTitle || config.storeName || 'Supermercado';

    try {
      const updatedQueue = (config.queue || []).map(item => {
        if (item.type === 'vinheta') {
          return {
            ...item,
            storeName: targetName,
          };
        }
        return item;
      });

      await updateConfig({
        storeName: targetName,
        queue: updatedQueue,
      });

      setVinhetaFeedback({
        type: 'success',
        message: `Todas as vinhetas foram atualizadas com o nome da rádio: "${targetName}"!`,
      });
      setTimeout(() => setVinhetaFeedback(null), 5000);
    } catch (err: any) {
      setVinhetaFeedback({
        type: 'error',
        message: err.message || 'Erro ao sincronizar nome da rádio nas vinhetas',
      });
      setTimeout(() => setVinhetaFeedback(null), 5000);
    }
  };

  // Broadcast Vinheta Ao Vivo com Auto-Ducking
  const handleBroadcastVinheta = async (
    vinheta: RadioVinhetaItem,
    customText?: string,
    customTitleText?: string,
    explicitAddToQueue?: boolean
  ) => {
    setIsGeneratingVinheta(true);
    setVinhetaFeedback(null);
    const store = resolvedVinhetaStoreName;
    const rawScript = customText || vinheta.scriptTemplate;
    const textToSpeak = rawScript.replace(/\{loja\}/gi, store);
    const titleToUse = (customTitleText || vinheta.title).replace(/\{loja\}/gi, store);
    const shouldQueue = explicitAddToQueue !== undefined
      ? Boolean(explicitAddToQueue)
      : Boolean(vinhetaAddToQueueMap[vinheta.id]);

    try {
      playSupermarketChime(0.5);

      const res = await api.createRadioFlashSpot({
        title: titleToUse,
        scriptText: textToSpeak,
        storeName: store,
        voiceId: selectedVoiceId,
        soundtrackId: vinheta.soundtrackId,
        soundtrackVolume: 0.18,
        type: 'vinheta',
        priority: vinheta.defaultPriority,
        addToQueue: shouldQueue,
      });

      if (res && res.audio) {
        onCreditsChanged(res.creditsBalance);
        if (shouldQueue) {
          await refreshRadioData();
        }

        // Spot avulso de vinheta: reproduz imediatamente no ar com Auto-Ducking na música ambiente
        const oneOffVinheta: RadioQueueItem = {
          id: `vinheta-oneoff-${Date.now()}`,
          audioId: res.audio.id,
          title: titleToUse,
          audioUrl: res.audio.audioUrl,
          downloadUrl: res.audio.downloadUrl,
          durationSeconds: res.audio.durationSeconds || 12,
          voiceName: res.audio.voiceName || 'Locutor',
          storeName: store,
          type: 'vinheta',
          active: true,
          priority: vinheta.defaultPriority,
          playCount: 1,
          addedAt: new Date().toISOString(),
        };

        playSpotNow(oneOffVinheta);

        setVinhetaFeedback({
          type: 'success',
          message: shouldQueue
            ? `Vinheta "${titleToUse}" transmitida agora e adicionada à grade da rádio!`
            : `Vinheta "${titleToUse}" transmitida no som da loja! (Não incluída na grade automática)`,
        });
        setTimeout(() => setVinhetaFeedback(null), 5000);
        setCustomizingVinheta(null);
      }
    } catch (err: any) {
      setVinhetaFeedback({
        type: 'error',
        message: err.message || 'Erro ao gerar e transmitir vinheta no ar',
      });
      setTimeout(() => setVinhetaFeedback(null), 6000);
    } finally {
      setIsGeneratingVinheta(false);
    }
  };

  // Adicionar Vinheta diretamente à grade automática da Rádio
  const handleAddVinhetaToQueue = async (
    vinheta: RadioVinhetaItem,
    customText?: string,
    customTitleText?: string
  ) => {
    setIsGeneratingVinheta(true);
    setVinhetaFeedback(null);
    const store = resolvedVinhetaStoreName;
    const rawScript = customText || vinheta.scriptTemplate;
    const textToSpeak = rawScript.replace(/\{loja\}/gi, store);
    const titleToUse = (customTitleText || vinheta.title).replace(/\{loja\}/gi, store);

    try {
      const res = await api.createRadioFlashSpot({
        title: titleToUse,
        scriptText: textToSpeak,
        storeName: store,
        voiceId: selectedVoiceId,
        soundtrackId: vinheta.soundtrackId,
        soundtrackVolume: 0.18,
        type: 'vinheta',
        priority: vinheta.defaultPriority,
        addToQueue: true,
      });

      if (res && res.queueItem) {
        onCreditsChanged(res.creditsBalance);
        await refreshRadioData();
        setVinhetaFeedback({
          type: 'success',
          message: `Vinheta "${titleToUse}" adicionada com sucesso à grade no ar!`,
        });
        setTimeout(() => setVinhetaFeedback(null), 5000);
        setCustomizingVinheta(null);
      }
    } catch (err: any) {
      setVinhetaFeedback({
        type: 'error',
        message: err.message || 'Erro ao adicionar vinheta à grade',
      });
      setTimeout(() => setVinhetaFeedback(null), 6000);
    } finally {
      setIsGeneratingVinheta(false);
    }
  };

  const handleOpenCustomizeVinhetaModal = (vinheta: RadioVinhetaItem) => {
    const store = resolvedVinhetaStoreName;
    setCustomizingVinheta(vinheta);
    setCustomVinhetaTitle(vinheta.title.replace(/\{loja\}/gi, store));
    setCustomVinhetaScript(vinheta.scriptTemplate.replace(/\{loja\}/gi, store));
    setCustomVinhetaSoundtrack(vinheta.soundtrackId);
    setCustomVinhetaPriority(vinheta.defaultPriority);
    setVinhetaModalAddToQueue(Boolean(vinhetaAddToQueueMap[vinheta.id]));
    setVinhetaFeedback(null);
  };

  // Local CUE / Preview Player State (plays only in preview, without broadcasting live on the radio)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState<number>(0);
  const [previewDuration, setPreviewDuration] = useState<number>(0);
  const [previewBoostDb, setPreviewBoostDb] = useState<number>(0);
  const previewNormalizerCleanupRef = useRef<BroadcastVoiceProcessor | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      previewNormalizerCleanupRef.current = null;
    };
  }, []);

  const handleTogglePreview = (id: string, audioUrl: string) => {
    const el = previewAudioRef.current;
    if (!el) return;

    if (previewItemId === id) {
      if (isPreviewPlaying) {
        el.pause();
        setIsPreviewPlaying(false);
      } else {
        el.play().catch(console.error);
        setIsPreviewPlaying(true);
      }
      return;
    }

    el.pause();
    setPreviewItemId(id);
    setPreviewCurrentTime(0);
    setPreviewDuration(0);
    el.src = audioUrl;
    el.volume = 1.0;

    const proc = attachVoiceNormalizer(el, {
      enabled: true,
      initialUserVolume: 1.0,
      onGainChange: (gain) => setPreviewBoostDb(gain),
    });
    proc?.resetAgcForNewTrack();
    previewNormalizerCleanupRef.current = proc;

    el.play()
      .then(() => setIsPreviewPlaying(true))
      .catch(err => {
        console.error('Erro ao reproduzir prévia:', err);
        setIsPreviewPlaying(false);
      });
  };

  const handleSeekPreview = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = previewAudioRef.current;
    if (!el || !previewDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * previewDuration;
    setPreviewCurrentTime(el.currentTime);
  };

  useEffect(() => {
    Promise.all([api.getVoices(), api.getSoundtracks()])
      .then(([vRes, sRes]) => {
        setVoices(vRes.voices || []);
        if (vRes.voices?.length > 0) {
          setSelectedVoiceId(vRes.voices[0].id);
        }
        setSoundtracks(sRes.soundtracks || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (config) {
      setStationNameInput(config.stationName);
      setStoreNameInput(config.storeName || 'Supermercado');
      setSloganInput(config.slogan);
    }
  }, [config?.stationName, config?.storeName, config?.slogan]);

  const handleSaveStationIdentity = async () => {
    await updateConfig({
      stationName: stationNameInput.trim() || 'Rádio Supermercado Ao Vivo',
      storeName: storeNameInput.trim() || 'Supermercado',
      slogan: sloganInput.trim() || 'Ofertas imbatíveis e economia todo dia para sua família!',
    });
    setEditingStationInfo(false);
  };

  const handleApplyTemplate = (tpl: QuickRadioTemplate) => {
    if (isGratuito && (tpl.type === 'comunicado' || tpl.type === 'vinheta')) {
      setRestrictedModal({
        title: tpl.type === 'vinheta' ? 'Vinhetas da Loja' : 'Avisos Informativos',
        message: `A utilização de ${tpl.type === 'vinheta' ? 'vinhetas' : 'avisos informativos'} na Rádio Web é exclusiva dos planos Pro Varejo e Redes Atacarejo. No plano gratuito você tem à disposição as opções de Ofertas Relâmpago e Feirinha do Hortifrúti para testar com 50 créditos!`
      });
      return;
    }
    setFlashTitle(tpl.title);
    setFlashScript(tpl.script);
    setFlashType(tpl.type);
    setSelectedSoundtrackId(tpl.soundtrackId);
    setFlashPriority(tpl.type === 'relampago' ? 'alta' : 'normal');
    setFlashFeedback(null);
  };

  const handleGenerateAiQuickScript = async () => {
    if (!flashQuickProducts.trim()) {
      setFlashFeedback({
        type: 'error',
        message: 'Digite os produtos e preços (ex: Picanha 59,90 kg, Cerveja lata 3,49) para a IA criar a chamada.',
      });
      return;
    }

    setGeneratingAiScript(true);
    setFlashFeedback(null);
    try {
      const parsed = await api.parseProducts(flashQuickProducts, 'supermercado');
      const generated = await api.generateScript({
        niche: 'supermercado',
        storeName: config?.storeName || 'nosso Supermercado',
        campaignType: flashType === 'relampago' ? 'relampago' : 'ofertas_dia',
        style: flashType === 'relampago' ? 'urgente_relampago' : 'energetica_supermercado',
        desiredDuration: '30s',
        tone: 'entusiasmado',
        presentationFormat: 'abertura_sequencia_encerramento',
        products: parsed.products,
        freeInstructions: 'Chamada curta e impactante para tocar ao vivo na rádio interna do supermercado.',
      });
      setFlashScript(generated.text);
      if (parsed.products.length > 0) {
        setFlashTitle(
          `Oferta Rádio — ${parsed.products
            .slice(0, 2)
            .map(p => p.name)
            .join(' + ')}`
        );
      }
      setFlashFeedback({
        type: 'success',
        message: 'Roteiro de oferta criado pela IA! Revise abaixo ou clique em Gerar Locução & Divulgar.',
      });
    } catch (err: any) {
      setFlashFeedback({
        type: 'error',
        message: err.message || 'Erro ao criar roteiro com IA.',
      });
    } finally {
      setGeneratingAiScript(false);
    }
  };

  const handleGenerateAndBroadcastFlash = async () => {
    if (!flashScript.trim()) {
      setFlashFeedback({ type: 'error', message: 'O texto da locução não pode estar vazio.' });
      return;
    }

    setGeneratingFlash(true);
    setFlashFeedback(null);
    try {
      let createdQueueItem: RadioQueueItem | null = null;

      const res = await api.createRadioFlashSpot({
        title: flashTitle.trim() || 'Oferta Relâmpago — Rádio Web',
        scriptText: flashScript,
        storeName: config?.storeName || 'Supermercado',
        voiceId: selectedVoiceId,
        soundtrackId: selectedSoundtrackId,
        soundtrackVolume,
        type: flashType,
        priority: flashPriority,
        addToQueue: true,
      });

      if (res && (res.queueItem || res.audio)) {
        onCreditsChanged(res.creditsBalance);
        await refreshRadioData();
        createdQueueItem = res.queueItem || null;
      }

      if (playImmediatelyOnCreate && createdQueueItem) {
        playSpotNow(createdQueueItem);
      }

      setFlashFeedback({
        type: 'success',
        message: playImmediatelyOnCreate
          ? `Locução "${createdQueueItem?.title || flashTitle}" gerada e transmitindo AO VIVO na Rádio Web!`
          : `Locução "${createdQueueItem?.title || flashTitle}" gerada e adicionada na grade de programação da Rádio!`,
      });
    } catch (err: any) {
      setFlashFeedback({
        type: 'error',
        message: err.message || 'Falha ao gerar locução para a Rádio Web.',
      });
    } finally {
      setGeneratingFlash(false);
    }
  };

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!config) {
    return null;
  }

  const activeOffersCount = config.queue.filter(q => q.active).length;
  const activeMusicCount = config.musicTracks.filter(m => m.active).length;

  return (
    <div
      className={`mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 transition-all ${
        isStoreMonitorMode ? 'max-w-6xl' : 'max-w-7xl'
      }`}
    >
      {/* Hidden Audio Element exclusively for CUE / Local Preview (does NOT go to live broadcast) */}
      <audio
        ref={previewAudioRef}
        crossOrigin="anonymous"
        onTimeUpdate={() => setPreviewCurrentTime(previewAudioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setPreviewDuration(previewAudioRef.current?.duration || 0)}
        onEnded={() => {
          setIsPreviewPlaying(false);
          setPreviewCurrentTime(0);
        }}
        preload="none"
      />
      {/* ===================================================================== */}
      {/* TOP BROADCAST CONSOLE HEADER (ON AIR / DUAL-DECK MONITOR)             */}
      {/* ===================================================================== */}
      {supersededMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{supersededMessage}</span>
          </div>
          <button
            onClick={clearSupersededMessage}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold cursor-pointer transition shrink-0"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Banner de Desbloqueio de Autoplay do Navegador após Atualização de Página */}
      {autoplayBlocked && (
        <div
          onClick={resumeAutoplay}
          className="mb-4 p-3.5 sm:p-4 bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-amber-600/90 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl border border-amber-400/40 shadow-xl shadow-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer animate-pulse transition"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-amber-200" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-black flex items-center gap-2">
                <span>A Rádio Web está NO AR!</span>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-black uppercase tracking-wider">Clique para ouvir</span>
              </p>
              <p className="text-[11px] text-amber-100/90 mt-0.5">
                O navegador pausou a saída de áudio após a atualização da página. Toque aqui para continuar ouvindo sem interromper a transmissão.
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              resumeAutoplay();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-orange-800 font-extrabold text-xs shrink-0 shadow-md hover:bg-orange-50 cursor-pointer"
          >
            Liberar Áudio Agora
          </button>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl bg-[#181b24] border border-zinc-700/80 shadow-2xl">
        {/* Ambient Glow when ON AIR */}
        {isOnAir && (
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        )}
        {currentSpot && (
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* Top Bar: Station Identity + Master ON AIR Control */}
        <div className="p-5 sm:p-8 border-b border-zinc-700/70 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-5 w-full lg:w-auto">
            {/* Top row on mobile: Icon + Live status badges */}
            <div className="flex items-center gap-3">
              <div
                className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isOnAir
                    ? 'bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 text-white shadow-xl shadow-red-600/30'
                    : 'bg-[#1f2330] border border-zinc-700 text-zinc-400'
                }`}
              >
                <Radio className={`w-6 h-6 sm:w-8 sm:h-8 ${isOnAir ? 'animate-pulse' : ''}`} />
                {isOnAir && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-zinc-950" />
                  </span>
                )}
              </div>

              {/* Status pills beside icon on mobile */}
              <div className="flex flex-wrap items-center gap-1.5 sm:hidden">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                    isOnAir
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm shadow-red-500/20'
                      : 'bg-zinc-800/80 text-zinc-400 border-zinc-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnAir ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'
                    }`}
                  />
                  {isOnAir ? 'NO AR AO VIVO' : 'ESTÚDIO OFF AIR'}
                </span>

                {isRedesAtacarejo ? (
                  <button
                    onClick={() => setIsStoreManagerOpen(true)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Building2 className="w-3 h-3 text-orange-400" />
                    <span>Filiais ({config.stores?.length || 1})</span>
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    🏪 {config.storeName}
                  </span>
                )}
              </div>
            </div>

            {/* Station Identity & Info - full width & beautifully spaced on mobile */}
            <div className="space-y-1.5 w-full min-w-0">
              {/* Badges on desktop/tablet */}
              <div className="hidden sm:flex flex-wrap items-center gap-2.5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                    isOnAir
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm shadow-red-500/20'
                      : 'bg-[#1f2330] text-zinc-300 border border-zinc-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnAir ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'
                    }`}
                  />
                  {isOnAir ? 'NO AR • TRANSMITINDO AO VIVO' : 'ESTÚDIO EM ESPERA (OFF AIR)'}
                </span>

                {isRedesAtacarejo ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="font-bold">Filial da Rede:</span>
                    <select
                      value={activeStoreId}
                      onChange={e => setActiveStoreId(e.target.value)}
                      className="bg-transparent text-white font-bold focus:outline-none cursor-pointer max-w-[170px] truncate"
                    >
                      {(config.stores || []).map(st => (
                        <option key={st.id} value={st.id} className="bg-[#181b24] text-white">
                          {st.name} {st.city ? `(${st.city})` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsStoreManagerOpen(true)}
                      className="ml-1 px-2 py-0.5 rounded-full bg-orange-500/20 hover:bg-orange-500/30 text-[10px] text-orange-200 font-black cursor-pointer transition"
                      title="Gerenciar Filiais da Rede"
                    >
                      Gerenciar ({config.stores?.length || 1})
                    </button>
                  </div>
                ) : isProVarejo ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30 flex items-center gap-1.5">
                    <span>🏪 {config.storeName}</span>
                    <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700">1 Computador por vez</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800/80 text-zinc-300 border border-zinc-700 flex items-center gap-1.5">
                    <span>🎁 Degustação: {config.storeName}</span>
                  </span>
                )}

                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#141620] text-zinc-300 border border-zinc-700/80">
                  {activeOffersCount} ofertas ativas • {activeMusicCount} trilhas musicais
                </span>
              </div>

              {/* Mobile count badge */}
              <div className="sm:hidden">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#141620] text-zinc-300 border border-zinc-700/80">
                  {activeOffersCount} ofertas ativas • {activeMusicCount} trilhas musicais
                </span>
              </div>

              {editingStationInfo ? (
                <div className="pt-2 p-3.5 sm:p-4 rounded-2xl bg-[#12141c] border border-orange-500/40 shadow-xl space-y-3 w-full max-w-md sm:max-w-lg animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Personalizar Identidade da Rádio
                    </span>
                    <button
                      onClick={() => setEditingStationInfo(false)}
                      className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                      title="Fechar edição"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Nome da Rádio
                      </label>
                      <input
                        type="text"
                        value={stationNameInput}
                        onChange={e => setStationNameInput(e.target.value)}
                        placeholder="Ex: Rádio Alvorada FM"
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Nome do Supermercado
                      </label>
                      <input
                        type="text"
                        value={storeNameInput}
                        onChange={e => setStoreNameInput(e.target.value)}
                        placeholder="Ex: Supermercado Alvorada"
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Slogan / Frase de Impacto
                    </label>
                    <input
                      type="text"
                      value={sloganInput}
                      onChange={e => setSloganInput(e.target.value)}
                      placeholder="Ex: A rádio da economia e das melhores ofertas para a sua família!"
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleSaveStationIdentity}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvar</span>
                    </button>
                    <button
                      onClick={() => setEditingStationInfo(false)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                      {config.stationName}
                    </h1>
                    <button
                      onClick={() => setEditingStationInfo(true)}
                      className="text-xs text-orange-400/90 hover:text-orange-300 underline cursor-pointer"
                    >
                      Personalizar nome
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{config.slogan}</p>
                </div>
              )}
            </div>
          </div>

          {/* Master Broadcast Action Buttons — Em 2 Linhas no Computador para Máxima Organização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full lg:w-auto lg:min-w-[430px]">
            {/* Linha 1, Coluna 1: Modo Som de Loja */}
            <button
              onClick={() => setIsStoreMonitorMode(!isStoreMonitorMode)}
              className="h-11 sm:h-12 px-3.5 rounded-2xl bg-[#1f2330] hover:bg-[#272c3d] text-zinc-200 border border-zinc-700/80 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm whitespace-nowrap"
              title="Modo Som de Loja simplifica a tela para deixar aberta no computador da loja"
            >
              {isStoreMonitorMode ? <Minimize2 className="w-4 h-4 text-zinc-400 shrink-0" /> : <Maximize2 className="w-4 h-4 text-zinc-400 shrink-0" />}
              <span>{isStoreMonitorMode ? 'Painel Completo' : 'Modo Som de Loja'}</span>
            </button>

            {/* Linha 1, Coluna 2: Disparar Oferta Agora */}
            <button
              onClick={() => playSpotNow()}
              disabled={activeOffersCount === 0}
              className="h-11 sm:h-12 px-3.5 rounded-2xl bg-orange-500/15 hover:bg-orange-500/25 disabled:opacity-40 text-orange-300 border border-orange-500/40 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm whitespace-nowrap"
            >
              <Zap className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Disparar Oferta Agora</span>
            </button>

            {/* Linha 2: Se ON AIR -> [Reiniciar Rádio] e [PAUSAR RÁDIO WEB] lado a lado */}
            {/* Se OFF AIR -> [LIGAR RÁDIO AO VIVO] ocupando as 2 colunas */}
            {isOnAir && (
              <button
                onClick={restartRadio}
                title="Reiniciar a rádio do início da programação"
                className="h-11 sm:h-12 px-3.5 rounded-2xl bg-[#1f2330] hover:bg-[#282d3e] text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/60 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Reiniciar Rádio</span>
              </button>
            )}

            <button
              onClick={toggleOnAir}
              className={`h-11 sm:h-12 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95 cursor-pointer whitespace-nowrap ${
                isOnAir
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                  : 'col-span-1 sm:col-span-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 shadow-orange-500/25'
              }`}
            >
              {isOnAir ? (
                <>
                  <Pause className="w-4 h-4 fill-current shrink-0" />
                  <span>PAUSAR RÁDIO WEB</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current shrink-0" />
                  <span>LIGAR RÁDIO AO VIVO</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* DUAL-DECK LIVE MONITORS (DECK 1: MÚSICA + DECK 2: LOCUÇÃO OFERTAS) */}
        {/* ================================================================= */}
        <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* DECK 1: AMBIENT MUSIC DECK */}
          <div className="lg:col-span-5 rounded-2xl bg-[#1e222e] border border-zinc-700/80 shadow-lg p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                    Deck 1 • Música Ambiente da Loja
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {config.mode === 'somente_ofertas'
                      ? 'Desativado (Modo Somente Ofertas)'
                      : isDucking
                      ? `🔉 Auto-Ducking Ativo (Volume reduzido para ${Math.round(config.duckingLevel * 100)}%)`
                      : isOnAir
                      ? '🎵 Tocando em Som Ambiente Normal'
                      : 'Pronto para tocar'}
                  </span>
                </div>
              </div>

              <button
                onClick={skipMusicTrack}
                disabled={!isOnAir || config.mode === 'somente_ofertas'}
                className="px-2.5 py-1.5 rounded-lg bg-[#272d3d] hover:bg-[#31384c] border border-zinc-700/80 disabled:opacity-40 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Próxima Música
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#141620] border border-zinc-700/70 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {currentMusic ? currentMusic.title : 'Programação Musical Supermercado'}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    {currentMusic ? currentMusic.style : 'Trilhas instrumentais licenciadas para varejo'}
                  </p>
                </div>
                {isOnAir && config.mode !== 'somente_ofertas' && (
                  <div className="flex items-end gap-0.5 h-5 shrink-0">
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-3" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-5" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-2.5" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${
                        musicDuration > 0 ? Math.min(100, (musicCurrentTime / musicDuration) * 100) : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                  <span>{formatTime(musicCurrentTime)}</span>
                  <span>{formatTime(musicDuration)}</span>
                </div>
              </div>
            </div>

            {/* Intelligent Music Leveler Control & Dynamic Gain Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isMusicLevelerEnabled
                      ? 'bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse'
                      : 'bg-zinc-600'
                  }`}
                />
                <span className="font-bold text-zinc-200">
                  Nivelador Inteligente de Música:
                </span>
                <span
                  className={`font-semibold ${
                    isMusicLevelerEnabled ? 'text-emerald-400' : 'text-zinc-500'
                  }`}
                >
                  {isMusicLevelerEnabled ? 'Ativo (Volume contínuo e equalizado)' : 'Desativado'}
                </span>
                {isMusicLevelerEnabled && Math.abs(musicBoostDb) > 0.2 && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
                    Ganho Automático: {musicBoostDb > 0 ? `+${musicBoostDb.toFixed(1)}` : musicBoostDb.toFixed(1)} dB
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 hidden sm:inline">
                  Ajusta músicas altas e baixas para manter o mesmo volume padrão
                </span>
                <button
                  type="button"
                  onClick={toggleMusicLeveler}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                    isMusicLevelerEnabled
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-[#272d3d] border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  {isMusicLevelerEnabled ? 'Desativar Nivelador' : 'Ativar Nivelador'}
                </button>
              </div>
            </div>

            {/* Music & Ducking Volume Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#141620] border border-zinc-700/70 rounded-xl p-3 shadow-sm">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400 font-medium">Volume da Música</span>
                  <span className="text-emerald-400 font-bold">{Math.round(config.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={config.musicVolume}
                  onChange={e => updateConfig({ musicVolume: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="bg-[#141620] border border-zinc-700/70 rounded-xl p-3 shadow-sm">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400 font-medium" title="Volume da música enquanto o locutor anuncia a oferta">
                    Volume no Auto-Ducking
                  </span>
                  <span className="text-amber-400 font-bold">{Math.round(config.duckingLevel * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={0.4}
                  step={0.02}
                  value={config.duckingLevel}
                  onChange={e => updateConfig({ duckingLevel: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* DECK 2: VOICEOVER OFFER SPOT DECK */}
          <div className="lg:col-span-7 rounded-2xl bg-[#1e222e] border border-orange-500/40 shadow-lg p-5 flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    currentSpot
                      ? 'bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/30 animate-pulse'
                      : 'bg-orange-500/15 border border-orange-500/30 text-orange-400'
                  }`}
                >
                  <Megaphone className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-300/80 block">
                    Deck 2 • Locutor de Ofertas & Comunicados
                  </span>
                  <span className="text-xs font-bold text-white">
                    {isMicActive || isLiveMicActive
                      ? '🎙 MICROFONE AO VIVO NO AR (Locuções pausadas)'
                      : currentSpot
                      ? '🔊 LOCUÇÃO DE OFERTA NO AR AGORA!'
                      : isOnAir
                      ? `⏱️ Próxima oferta entra no ar em ${countdownSeconds} segundos`
                      : 'Aguardando início da transmissão'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentSpot ? (
                  <button
                    onClick={stopCurrentSpot}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    Encerrar Locução Atual
                  </button>
                ) : (
                  <button
                    onClick={() => playSpotNow()}
                    disabled={activeOffersCount === 0 || isMicActive || isLiveMicActive}
                    className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-zinc-950 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Tocar Próxima Oferta Agora
                  </button>
                )}
              </div>
            </div>

            {/* Active or Next Offer Monitor Box */}
            <div
              className={`p-4 rounded-xl border transition-all shadow-sm ${
                currentSpot
                  ? 'bg-orange-500/10 border-orange-500/50 shadow-inner'
                  : 'bg-[#141620] border border-zinc-700/70'
              }`}
            >
              {currentSpot ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-orange-500 text-zinc-950 mb-1">
                        FALANDO AGORA NA LOJA
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white">{currentSpot.title}</h3>
                      <p className="text-xs text-orange-200/80">
                        Locutor(a): <strong>{currentSpot.voiceName}</strong> • Loja:{' '}
                        <strong>{currentSpot.storeName || config.storeName}</strong>
                      </p>
                    </div>
                    <div className="flex items-end gap-1 h-7 shrink-0">
                      <span className="w-1.5 bg-orange-400 rounded-full animate-bounce h-6" />
                      <span className="w-1.5 bg-amber-400 rounded-full animate-pulse h-4" />
                      <span className="w-1.5 bg-red-400 rounded-full animate-bounce h-7" />
                      <span className="w-1.5 bg-orange-400 rounded-full animate-pulse h-5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-200"
                        style={{
                          width: `${
                            spotDuration > 0 ? Math.min(100, (spotCurrentTime / spotDuration) * 100) : 50
                          }%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-orange-300 font-mono">
                      <span>{formatTime(spotCurrentTime)}</span>
                      <span>{formatTime(spotDuration || currentSpot.durationSeconds)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Próxima Locução Programada na Fila:
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {nextSpot ? nextSpot.title : 'Nenhuma oferta ativa na fila'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {nextSpot
                        ? `Voz: ${nextSpot.voiceName} • Duração: ${nextSpot.durationSeconds}s • Já tocou ${nextSpot.playCount ?? 0}x`
                        : 'Adicione ou gere uma locução abaixo para divulgar na rádio'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 bg-[#1e222e] border border-zinc-700/80 rounded-2xl px-4 py-2.5 shadow-sm">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <div>
                      <div className="text-[10px] font-bold uppercase text-zinc-400">Disparo Automático</div>
                      <div className="text-xl font-black text-orange-400 font-mono">{countdownSeconds}s</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scheduling Interval & Voice Volume Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#141620] border border-zinc-700/70 rounded-xl p-3 shadow-sm">
                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                  Modo de Programação
                </label>
                <select
                  value={config.mode}
                  onChange={e => updateConfig({ mode: e.target.value as any })}
                  className="w-full bg-[#1e222e] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                >
                  <option value="intervalo_tempo">Música + Oferta por Tempo</option>
                  <option value="intercalado_musicas">Música + Oferta a cada X Músicas</option>
                  <option value="somente_ofertas">Somente Ofertas Contínuas</option>
                </select>
              </div>

              <div className="bg-[#141620] border border-zinc-700/70 rounded-xl p-3 shadow-sm">
                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                  Intervalo entre Ofertas
                </label>
                <select
                  value={config.offerIntervalSeconds || config.spotsIntervalSeconds || 45}
                  onChange={e =>
                    updateConfig({
                      offerIntervalSeconds: Number(e.target.value),
                      spotsIntervalSeconds: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#1e222e] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                >
                  <option value={20}>A cada 20 segundos (Intenso)</option>
                  <option value={30}>A cada 30 segundos</option>
                  <option value={45}>A cada 45 segundos (Ideal Varejo)</option>
                  <option value={60}>A cada 1 minuto</option>
                  <option value={90}>A cada 1 min e 30 seg</option>
                  <option value={120}>A cada 2 minutos</option>
                  <option value={180}>A cada 3 minutos</option>
                </select>
              </div>

              <div className="bg-[#141620] border border-zinc-700/70 rounded-xl p-3 shadow-sm">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400 font-medium">Volume do Locutor</span>
                  <span className="text-orange-400 font-bold">
                    {Math.round((config.voiceVolume ?? config.spotVolume ?? 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={1}
                  step={0.05}
                  value={config.voiceVolume ?? config.spotVolume ?? 1}
                  onChange={e =>
                    updateConfig({
                      voiceVolume: parseFloat(e.target.value),
                      spotVolume: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Intelligent Voice Leveler Control & Broadcast Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-orange-950/40 border border-orange-500/30 text-xs">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isVocalLevelerEnabled
                      ? 'bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse'
                      : 'bg-zinc-600'
                  }`}
                />
                <span className="font-bold text-zinc-200">
                  Nivelador Inteligente de Volume:
                </span>
                <span
                  className={`font-semibold ${
                    isVocalLevelerEnabled ? 'text-emerald-400' : 'text-zinc-500'
                  }`}
                >
                  {isVocalLevelerEnabled ? 'Ativo (Vozes equalizadas e no mesmo volume)' : 'Desativado'}
                </span>
                {isVocalLevelerEnabled && vocalBoostDb > 0.4 && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
                    Ganho Automático: +{vocalBoostDb.toFixed(1)} dB
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 hidden sm:inline">
                  Ajusta automaticamente gravações baixas para ficarem altas e nítidas
                </span>
                <button
                  type="button"
                  onClick={toggleVocalLeveler}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                    isVocalLevelerEnabled
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-[#272d3d] border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  {isVocalLevelerEnabled ? 'Desativar Nivelador' : 'Ativar Nivelador'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* If NOT in compact Store Monitor Mode, show the full Studio + Queue + Music Manager */}
      {!isStoreMonitorMode && (
        <>
          {/* ================================================================= */}
          {/* NAVIGATION TABS FOR RADIO MANAGEMENT                              */}
          {/* ================================================================= */}
          <div className="sticky top-14 sm:top-16 z-30 bg-[#111318]/95 backdrop-blur-md pt-2 pb-3 border-b border-zinc-700/80 grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('flash_studio')}
              className={`px-1.5 sm:px-3 lg:px-3.5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs lg:text-sm flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 transition cursor-pointer text-center whitespace-nowrap shadow-sm ${
                activeTab === 'flash_studio'
                  ? 'bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/20'
                  : 'bg-[#1c202d] hover:bg-[#252a3b] text-zinc-200 border border-zinc-700/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="sm:hidden">Criar Oferta</span>
              <span className="hidden sm:inline">Criar Locução</span>
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-1.5 sm:px-3 lg:px-3.5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs lg:text-sm flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 transition cursor-pointer text-center whitespace-nowrap shadow-sm ${
                activeTab === 'announcements'
                  ? 'bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/20'
                  : 'bg-[#1c202d] hover:bg-[#252a3b] text-zinc-200 border border-zinc-700/80'
              }`}
            >
              <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-amber-400" />
              <span className="sm:hidden">Avisos</span>
              <span className="hidden sm:inline">Avisos & Informativos</span>
              {isGratuito && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> PRO
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('vinhetas')}
              className={`px-1.5 sm:px-3 lg:px-3.5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs lg:text-sm flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 transition cursor-pointer text-center whitespace-nowrap shadow-sm ${
                activeTab === 'vinhetas'
                  ? 'bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/20'
                  : 'bg-[#1c202d] hover:bg-[#252a3b] text-zinc-200 border border-zinc-700/80'
              }`}
            >
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-purple-400" />
              <span className="sm:hidden">Vinhetas</span>
              <span className="hidden sm:inline">Vinhetas da Loja</span>
              {isGratuito && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> PRO
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`px-1.5 sm:px-3 lg:px-3.5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs lg:text-sm flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 transition cursor-pointer text-center whitespace-nowrap shadow-sm ${
                activeTab === 'queue'
                  ? 'bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/20'
                  : 'bg-[#1c202d] hover:bg-[#252a3b] text-zinc-200 border border-zinc-700/80'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="sm:hidden">Grade ({config.queue.length})</span>
              <span className="hidden sm:inline">Grade no Ar ({config.queue.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('library_import')}
              className={`px-1.5 sm:px-3 lg:px-3.5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs lg:text-sm flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 transition cursor-pointer text-center whitespace-nowrap shadow-sm ${
                activeTab === 'library_import'
                  ? 'bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/20'
                  : 'bg-[#1c202d] hover:bg-[#252a3b] text-zinc-200 border border-zinc-700/80'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="sm:hidden">Importar ({availableAudios.length})</span>
              <span className="hidden sm:inline">Importar Locuções ({availableAudios.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`px-1.5 sm:px-3 lg:px-3.5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs lg:text-sm flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 transition cursor-pointer text-center whitespace-nowrap shadow-sm ${
                activeTab === 'music'
                  ? 'bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/20'
                  : 'bg-[#1c202d] hover:bg-[#252a3b] text-zinc-200 border border-zinc-700/80'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="sm:hidden">Músicas</span>
              <span className="hidden sm:inline">Músicas Ambiente</span>
            </button>
          </div>

          {/* ================================================================= */}
          {/* TAB 1: ESTÚDIO RELÂMPAGO DA RÁDIO (GERAR & DIVULGAR DIRETO)       */}
          {/* ================================================================= */}
          {activeTab === 'flash_studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Quick Offer & Announcement Creator */}
              <div className="lg:col-span-7 rounded-2xl bg-[#181b24] border border-zinc-700/80 shadow-md p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Estúdio Ao Vivo Integrado à Rádio Web
                    </span>
                    <h2 className="text-xl font-black text-white mt-0.5">
                      Gerar Nova Locução de Oferta e Colocar no Ar
                    </h2>
                  </div>
                  <button
                    onClick={onOpenStudio}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                  >
                    Abrir Estúdio Completo em Lote
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1-Click Supermarket Live Templates */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    1. Atalhos Rápidos de Supermercado (Clique para preencher):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {SUPERMARKET_LIVE_TEMPLATES.map(tpl => (
                      <button
                        key={tpl.id}
                        onClick={() => handleApplyTemplate(tpl)}
                        className="text-left p-2.5 rounded-xl bg-[#141620] hover:bg-zinc-800/80 border border-zinc-800 hover:border-orange-500/40 transition group cursor-pointer"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-orange-400 truncate">
                          {tpl.label}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{tpl.badge}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional AI Quick Product-to-Script Generator */}
                <div className="p-4 rounded-xl bg-[#141620] border border-zinc-700/80 space-y-2.5">
                  <label className="block text-xs font-bold text-orange-300 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-orange-400" />
                    Ou digite produtos e preços rápidos para a IA montar a chamada:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={flashQuickProducts}
                      onChange={e => setFlashQuickProducts(e.target.value)}
                      placeholder="Ex: Arroz 5kg 21,90, Frango Inteiro 9,99 kg, Leite 1L 3,89..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white placeholder-zinc-500"
                    />
                    <button
                      onClick={handleGenerateAiQuickScript}
                      disabled={generatingAiScript}
                      className="px-4 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {generatingAiScript ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Criar Texto com IA
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Title, Type & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Tipo de Áudio</label>
                    <select
                      value={flashType}
                      onChange={e => setFlashType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white"
                    >
                      <option value="relampago">⚡ Oferta Relâmpago</option>
                      <option value="oferta">🛒 Oferta do Dia / Setor</option>
                      <option value="comunicado">📢 Comunicado / Aviso Loja</option>
                      <option value="vinheta">🎵 Vinheta do Supermercado</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-400 mb-1">
                      Título de Identificação na Grade
                    </label>
                    <input
                      type="text"
                      value={flashTitle}
                      onChange={e => setFlashTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white"
                    />
                  </div>
                </div>

                {/* Script Textarea */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-zinc-400">
                      Texto da Locução (Será narrado e divulgado na Rádio Web)
                    </label>
                    <span className="text-[11px] text-zinc-500">
                      Duração estimada: ~{Math.max(5, Math.round(flashScript.split(/\s+/).length / 2.4))}s
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={flashScript}
                    onChange={e => setFlashScript(e.target.value)}
                    placeholder="Digite o texto da oferta ou aviso para os clientes na loja..."
                    className="w-full p-3.5 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white leading-relaxed focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Voice Selection */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-zinc-300">
                      Voz Profissional do Locutor(a)
                    </label>
                    <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setRadioVoiceFilter('todas')}
                        className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                          radioVoiceFilter === 'todas'
                            ? 'bg-orange-500 text-zinc-950'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Todas ({voices.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRadioVoiceFilter('favoritas');
                          const favs = voices.filter(v => isFavorite(v.id));
                          if (favs.length > 0 && !favs.some(v => v.id === selectedVoiceId)) {
                            setSelectedVoiceId(favs[0].id);
                          }
                        }}
                        className={`px-2.5 py-1 rounded font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          radioVoiceFilter === 'favoritas'
                            ? 'bg-amber-500 text-zinc-950'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${radioVoiceFilter === 'favoritas' ? 'fill-zinc-950' : 'text-amber-400'}`} />
                        <span>Favoritas ({voices.filter(v => isFavorite(v.id)).length})</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedVoiceId}
                      onChange={e => setSelectedVoiceId(e.target.value)}
                      className="flex-1 min-w-0 w-full px-3.5 py-2.5 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white focus:border-orange-500 focus:outline-none truncate"
                    >
                      {(() => {
                        const displayVoices = radioVoiceFilter === 'favoritas'
                          ? voices.filter(v => isFavorite(v.id))
                          : voices;

                        if (displayVoices.length === 0) {
                          return (
                            <option disabled value="">
                              Nenhuma voz favoritada ainda (clique em 'Todas' ou favorite no Painel)
                            </option>
                          );
                        }

                        return displayVoices.map(v => (
                          <option key={v.id} value={v.id}>
                            {isFavorite(v.id) ? '⭐ ' : ''}{v.name} ({v.gender === 'feminino' ? 'Feminina' : 'Masculina'} • {v.styleTag || v.tone || 'Varejo'})
                          </option>
                        ));
                      })()}
                    </select>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(selectedVoiceId)}
                      title={isFavorite(selectedVoiceId) ? "Remover dos favoritos" : "Favoritar este locutor"}
                      className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 ${
                        isFavorite(selectedVoiceId)
                          ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-xs'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border-zinc-800'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isFavorite(selectedVoiceId) ? 'fill-zinc-950' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Background Soundtrack Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-300">
                    Trilha de Fundo da Locução
                  </label>
                  <select
                    value={selectedSoundtrackId}
                    onChange={e => setSelectedSoundtrackId(e.target.value as SoundtrackId)}
                    className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white focus:border-orange-500 focus:outline-none truncate"
                  >
                    {soundtracks.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Immediate Broadcast Options */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-700/70">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-orange-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={playImmediatelyOnCreate}
                        onChange={e => setPlayImmediatelyOnCreate(e.target.checked)}
                        className="accent-orange-500 rounded w-4 h-4"
                      />
                      Tocar IMEDIATAMENTE no ar assim que gerar
                    </label>

                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flashPriority === 'alta'}
                        onChange={e => setFlashPriority(e.target.checked ? 'alta' : 'normal')}
                        className="accent-orange-500 rounded w-4 h-4"
                      />
                      Prioridade Alta na Rotação
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                    <button
                      onClick={handleGenerateAndBroadcastFlash}
                      disabled={generatingFlash}
                      className="w-full sm:w-auto px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 transition cursor-pointer"
                    >
                      {generatingFlash ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                          <span>Sintetizando e Publicando na Rádio...</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-4 h-4 shrink-0" />
                          <span className="text-center">Gerar Locução & Divulgar na Rádio Web</span>
                          <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px] sm:text-[11px] font-black text-zinc-950 shrink-0 whitespace-nowrap border border-black/10">
                            10 créditos
                          </span>
                        </>
                      )}
                    </button>

                    <label
                      title="Divulgar automaticamente novas locuções do Estúdio direto na grade da Rádio"
                      className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 text-xs text-zinc-300 bg-[#141620] hover:bg-zinc-800/80 border border-zinc-800 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={config.autoPublishNewAudios}
                        onChange={e => updateConfig({ autoPublishNewAudios: e.target.checked })}
                        className="accent-orange-500 rounded w-4 h-4 cursor-pointer shrink-0"
                      />
                      <span>Auto-divulgar novas locuções</span>
                    </label>
                  </div>
                </div>

                {flashFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                      flashFeedback.type === 'success'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-red-500/15 text-red-300 border-red-500/30'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{flashFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Right 5 Cols: Active Rotation Preview & Quick Trigger */}
              <div className="lg:col-span-5 rounded-2xl bg-[#181b24] border border-zinc-700/80 shadow-md p-4 sm:p-6 flex flex-col justify-between space-y-4 h-full">
                <div className="flex-1 flex flex-col min-h-0 space-y-3">
                  <div className="flex items-center justify-between shrink-0">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Fila de Disparo Ao Vivo
                      </span>
                      <h3 className="text-lg font-black text-white">
                        Ofertas em Rotação na Rádio ({activeOffersCount})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="text-xs text-orange-400 hover:underline font-bold cursor-pointer"
                    >
                      Gerenciar todas
                    </button>
                  </div>

                  <div className="space-y-2.5 flex-1 min-h-[380px] max-h-[640px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {config.queue.map(item => {
                      const isPlayingNow = currentSpot?.id === item.id;
                      const isPreviewingThis = previewItemId === item.id && isPreviewPlaying;
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                            isPlayingNow
                              ? 'bg-orange-500/15 border-orange-500/50'
                              : isPreviewingThis
                              ? 'bg-sky-500/10 border-sky-500/40'
                              : item.active
                              ? 'bg-[#141620] border-zinc-700/80 hover:border-zinc-700'
                              : 'bg-zinc-950/40 border-zinc-900 opacity-50'
                          }`}
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  item.type === 'relampago'
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : item.type === 'comunicado'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                }`}
                              >
                                {item.type === 'relampago'
                                  ? '⚡ Relâmpago'
                                  : item.type === 'comunicado'
                                  ? '📢 Comunicado'
                                  : item.type === 'vinheta'
                                  ? '🎵 Vinheta'
                                  : '🛒 Oferta'}
                              </span>
                              {item.priority === 'alta' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                                  ★ Prioridade
                                </span>
                              )}
                              {isPlayingNow && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-orange-500 text-zinc-950">
                                  NO AR
                                </span>
                              )}
                              {isPreviewingThis && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                  🎧 Ouvindo Prévia
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-white truncate">{item.title}</p>
                            <p className="text-[11px] text-zinc-400">
                              Voz: {item.voiceName} • {item.durationSeconds}s • Tocou {item.playCount ?? 0}x
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleTogglePreview(item.id, item.audioUrl)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition cursor-pointer ${
                                isPreviewingThis
                                  ? 'bg-sky-500 text-zinc-950 border-sky-400'
                                  : 'bg-[#1c202d] hover:bg-[#252a3b] text-sky-300 border-zinc-700'
                              }`}
                              title="Ouvir apenas na prévia (não sai no ao vivo da rádio)"
                            >
                              {isPreviewingThis ? (
                                <>
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                  Pausar
                                </>
                              ) : (
                                <>
                                  <Headphones className="w-3.5 h-3.5" />
                                  Prévia
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => playSpotNow(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs flex items-center gap-1 transition cursor-pointer"
                              title="Transmitir esta oferta agora no AO VIVO da Rádio Web"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              No Ar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-200/90 flex items-start gap-2.5">
                  <BellRing className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Dica de Operação na Loja:</strong> Conecte a saída de áudio do computador ao amplificador de
                    som ambiente do supermercado. A Rádio Web reduz a música sozinha toda vez que uma oferta entra no ar!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: CENTRAL DE AVISOS RÁPIDOS, INFORMATIVOS & SOUNDBOARD       */}
          {/* ================================================================= */}
          {activeTab === 'announcements' && isGratuito ? (
            <div className="rounded-3xl bg-[#181b24] border border-amber-500/30 p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-5 shadow-2xl my-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-3xl">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-block">
                  Recurso Exclusivo Pro Varejo & Redes
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Avisos Informativos & Utilidade Pública
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
                  Avisos de fornada de pão quente, comunicados de estacionamento, avisos de fechamento de loja, chamadas de clientes e avisos operacionais são exclusivos a partir do plano <strong>Pro Varejo</strong>.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#141620] border border-zinc-800 text-xs text-zinc-300 max-w-lg mx-auto">
                🎁 No seu <strong>Plano Degustação</strong> você tem 50 créditos para testar a geração e transmissão de locuções de ofertas comerciais ao vivo no som da sua loja!
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('flash_studio')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-400 transition cursor-pointer"
                >
                  Voltar para Locuções de Ofertas
                </button>
              </div>
            </div>
          ) : activeTab === 'announcements' && (
            <div className="space-y-6">
              {/* Feedback Alert */}
              {announcementFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border animate-in fade-in ${
                    announcementFeedback.type === 'success'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/15 text-red-300 border-red-500/30'
                  }`}
                >
                  {announcementFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{announcementFeedback.message}</span>
                </div>
              )}

              {/* 1. TOP INTERACTIVE DECK: SOUNDBOARD DE EFEITOS & MICROFONE AO VIVO */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left (7 cols): Soundboard / Vinhetas Instantâneas com Auto-Ducking */}
                <div className="lg:col-span-7 rounded-2xl bg-[#181b24] border border-zinc-700/80 shadow-md p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center border border-orange-500/30">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          Mesa de Efeitos & Vinhetas Rápidas
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            Auto-Ducking
                          </span>
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                          Dispare efeitos sonoros clássicos diretamente nas caixas de som da loja
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {/* Gongo Ding-Dong */}
                    <button
                      type="button"
                      onClick={() => handleTriggerSoundEffect('chime')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition cursor-pointer ${
                        soundboardActiveEffect === 'chime'
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/30 scale-95'
                          : 'bg-[#141620] hover:bg-zinc-800/80 text-white border-zinc-800 hover:border-amber-500/40'
                      }`}
                      title="Disparar gongo clássico de supermercado / aeroporto (Ding-Dong)"
                    >
                      <span className="text-xl">🔔</span>
                      <span className="text-xs font-bold">Gongo Ding-Dong</span>
                      <span className="text-[10px] text-zinc-400">Chamada de Loja</span>
                    </button>

                    {/* Sirene Relâmpago */}
                    <button
                      type="button"
                      onClick={() => handleTriggerSoundEffect('siren')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition cursor-pointer ${
                        soundboardActiveEffect === 'siren'
                          ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/30 scale-95'
                          : 'bg-[#141620] hover:bg-zinc-800/80 text-white border-zinc-800 hover:border-red-500/40'
                      }`}
                      title="Disparar sirene de oferta relâmpago"
                    >
                      <span className="text-xl">🚨</span>
                      <span className="text-xs font-bold">Sirene Oferta</span>
                      <span className="text-[10px] text-zinc-400">Preço Baixo</span>
                    </button>

                    {/* Alerta de Atenção */}
                    <button
                      type="button"
                      onClick={() => handleTriggerSoundEffect('attention')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition cursor-pointer ${
                        soundboardActiveEffect === 'attention'
                          ? 'bg-sky-500 text-zinc-950 border-sky-400 shadow-md shadow-sky-500/30 scale-95'
                          : 'bg-[#141620] hover:bg-zinc-800/80 text-white border-zinc-800 hover:border-sky-500/40'
                      }`}
                      title="Alerta triplo de atenção"
                    >
                      <span className="text-xl">📣</span>
                      <span className="text-xs font-bold">Alerta Atenção</span>
                      <span className="text-[10px] text-zinc-400">Toque Triplo</span>
                    </button>

                    {/* Caixa Registradora */}
                    <button
                      type="button"
                      onClick={() => handleTriggerSoundEffect('cash')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition cursor-pointer ${
                        soundboardActiveEffect === 'cash'
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/30 scale-95'
                          : 'bg-[#141620] hover:bg-zinc-800/80 text-white border-zinc-800 hover:border-emerald-500/40'
                      }`}
                      title="Som de caixa registradora / cha-ching"
                    >
                      <span className="text-xl">🛒</span>
                      <span className="text-xs font-bold">Cha-Ching</span>
                      <span className="text-[10px] text-zinc-400">Desconto & Venda</span>
                    </button>
                  </div>
                </div>

                {/* Right (5 cols): Microfone Ao Vivo no Som da Loja (Live Mic Paging) */}
                <div className="lg:col-span-5 rounded-2xl bg-[#181b24] border border-zinc-700/80 shadow-md p-4 sm:p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${
                            isMicActive
                              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            Microfone Ao Vivo
                            {isMicActive && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black uppercase bg-red-500 text-white animate-ping">
                                NO AR
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] text-zinc-400">
                            Fale diretamente nas caixas de som da loja com Auto-Ducking
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VU Meter Bar */}
                  <div className="space-y-1.5 bg-[#141620] p-2.5 rounded-xl border border-zinc-700/70">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>Nível de Voz (VU):</span>
                      <span className={isMicActive ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                        {isMicActive ? `${micVuLevel}%` : 'Mudo (Desligado)'}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-75 ${
                          micVuLevel > 80
                            ? 'bg-red-500'
                            : micVuLevel > 40
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${isMicActive ? micVuLevel : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Live Mic Push Button */}
                  <button
                    type="button"
                    onClick={handleToggleLiveMic}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                      isMicActive
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 animate-pulse'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>
                      {isMicActive ? '⏹ Desligar Microfone (Finalizar)' : '🎙 Falar no Som da Loja (Ao Vivo)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. CATÁLOGO DE AVISOS RÁPIDOS & INFORMATIVOS */}
              <div className="rounded-2xl bg-[#181b24] border border-zinc-700/80 shadow-md p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <span>📢</span>
                      Avisos Rápidos & Informativos de Loja
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Sem Custo de Créditos
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Selecione um aviso pronto para disparar no ar em segundos com locução neural e auto-ducking.
                    </p>
                  </div>

                  {/* Voz Selecionada Indicator */}
                  <div className="flex items-center gap-2 bg-[#141620] border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
                    <span className="text-zinc-500 font-medium">Voz Ativa:</span>
                    <select
                      value={selectedVoiceId}
                      onChange={e => setSelectedVoiceId(e.target.value)}
                      className="bg-transparent text-orange-400 font-bold focus:outline-none cursor-pointer max-w-[150px] truncate"
                    >
                      {voices.map(v => (
                        <option key={v.id} value={v.id} className="bg-zinc-900 text-white">
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filtros por Categoria */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-zinc-800 pb-3">
                  {[
                    {
                      id: 'todas',
                      label: 'Todos os Avisos',
                      icon: '📢',
                      count: SUPERMARKET_ANNOUNCEMENTS.length,
                    },
                    {
                      id: 'estacionamento',
                      label: 'Estacionamento',
                      icon: '🚗',
                      count: SUPERMARKET_ANNOUNCEMENTS.filter(a => a.category === 'estacionamento').length,
                    },
                    {
                      id: 'fechamento',
                      label: 'Fechamento',
                      icon: '⏰',
                      count: SUPERMARKET_ANNOUNCEMENTS.filter(a => a.category === 'fechamento').length,
                    },
                    {
                      id: 'caixa',
                      label: 'Caixas & Filas',
                      icon: '💳',
                      count: SUPERMARKET_ANNOUNCEMENTS.filter(a => a.category === 'caixa').length,
                    },
                    {
                      id: 'seguranca',
                      label: 'Segurança & Apoio',
                      icon: '👶',
                      count: SUPERMARKET_ANNOUNCEMENTS.filter(
                        a => a.category === 'seguranca' || a.category === 'operacional'
                      ).length,
                    },
                    {
                      id: 'informativo',
                      label: 'Informativos',
                      icon: '📱',
                      count: SUPERMARKET_ANNOUNCEMENTS.filter(a => a.category === 'informativo').length,
                    },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setAnnouncementCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                        announcementCategoryFilter === cat.id
                          ? 'bg-orange-500 text-zinc-950 border-orange-400 shadow-sm shadow-orange-500/20'
                          : 'bg-[#141620] text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          announcementCategoryFilter === cat.id
                            ? 'bg-zinc-950/30 text-zinc-950 font-black'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Lista de Cards de Avisos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {SUPERMARKET_ANNOUNCEMENTS.filter(ann => {
                    if (announcementCategoryFilter === 'todas') return true;
                    if (announcementCategoryFilter === 'seguranca') {
                      return ann.category === 'seguranca' || ann.category === 'operacional';
                    }
                    return ann.category === announcementCategoryFilter;
                  }).map(ann => {
                    const isCheckedForQueue = Boolean(announcementAddToQueueMap[ann.id]);
                    const itemInQueue = (config?.queue || []).find(
                      q => q.title.toLowerCase() === ann.title.toLowerCase() && q.active
                    );

                    return (
                      <div
                        key={ann.id}
                        className="p-4 rounded-xl bg-[#141620] border border-zinc-700/80 hover:border-zinc-700/80 transition flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#141620] border border-zinc-700/80 text-zinc-400 flex items-center gap-1">
                              <span>{ann.icon}</span>
                              {ann.categoryLabel}
                            </span>
                            <span className="text-[10px] font-bold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                              {ann.badge}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white tracking-tight">{ann.title}</h4>

                          <p className="text-xs text-zinc-400 mt-2 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-900/80 italic leading-relaxed">
                            "{ann.script}"
                          </p>
                        </div>

                        {/* Opção explícita no Card: Adicionar ou não na grade da rádio */}
                        <div className="pt-2 border-t border-zinc-900/80 flex flex-col gap-2.5">
                          <div className="p-2 rounded-lg bg-[#181b24] border border-zinc-700/80/80 flex items-center justify-between gap-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-200 hover:text-white">
                              <input
                                type="checkbox"
                                checked={isCheckedForQueue}
                                onChange={(e) =>
                                  setAnnouncementAddToQueueMap(prev => ({
                                    ...prev,
                                    [ann.id]: e.target.checked,
                                  }))
                                }
                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                              />
                              <span className="font-semibold">Adicionar à Grade da Rádio</span>
                            </label>

                            {isCheckedForQueue ? (
                              <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                                Entrará na Grade
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                                Tocar somente agora
                              </span>
                            )}
                          </div>

                          {/* Barra de Ações do Card */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleOpenCustomizeModal(ann)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#1c202d] hover:bg-[#252a3b] text-zinc-200 border border-zinc-700/80 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              title="Editar placa, modelo ou texto antes de falar"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                              <span>Personalizar</span>
                            </button>

                            <div className="flex items-center gap-1.5 ml-auto">
                              {itemInQueue ? (
                                <button
                                  type="button"
                                  onClick={() => toggleQueueItemActive(itemInQueue.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition cursor-pointer"
                                  title="Este aviso está ativo na grade. Clique para desativar/pausar."
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Na Grade</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddAnnouncementToQueue(ann)}
                                  disabled={isGeneratingAnnouncement}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#1c202d] hover:bg-[#252a3b] text-zinc-200 border border-zinc-700/80 text-xs font-bold transition cursor-pointer"
                                  title="Adicionar à grade de programação automática da rádio para tocar em rotação contínua"
                                >
                                  + Na Grade
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleBroadcastAnnouncement(ann, undefined, undefined, isCheckedForQueue)}
                                disabled={isGeneratingAnnouncement}
                                className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs flex items-center gap-1 transition cursor-pointer shadow-sm shadow-orange-500/20"
                                title={
                                  isCheckedForQueue
                                    ? 'Falar agora no som da loja E adicionar à grade automática da rádio'
                                    : 'Tocar este aviso imediatamente no som da loja (executa somente agora e NÃO entra na grade)'
                                }
                              >
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                <span>Falar no Ar Agora</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: CENTRAL DE VINHETAS DA LOJA (IDENTIDADE & SWEEPERS)        */}
          {/* ================================================================= */}
          {activeTab === 'vinhetas' && isGratuito ? (
            <div className="rounded-3xl bg-[#181b24] border border-purple-500/30 p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-5 shadow-2xl my-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto text-3xl">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30 inline-block">
                  Recurso Exclusivo Pro Varejo & Redes
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Vinhetas Institucionais da Rádio
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
                  A criação de vinhetas personalizadas com o nome da sua loja, carimbos sweepers de rádio e mensagens de boas-vindas institucionais são exclusivas dos planos <strong>Pro Varejo</strong> e <strong>Redes & Atacarejo</strong>.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#141620] border border-zinc-800 text-xs text-zinc-300 max-w-lg mx-auto">
                🎁 No seu <strong>Plano Degustação</strong> você pode gerar e colocar no ar locuções completas de ofertas com nossos locutores de IA!
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('flash_studio')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-400 transition cursor-pointer"
                >
                  Voltar para Locuções de Ofertas
                </button>
              </div>
            </div>
          ) : activeTab === 'vinhetas' && (
            <div className="space-y-6">
              {/* Feedback Alert */}
              {vinhetaFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border animate-in fade-in ${
                    vinhetaFeedback.type === 'success'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/15 text-red-300 border-red-500/30'
                  }`}
                >
                  {vinhetaFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{vinhetaFeedback.message}</span>
                </div>
              )}

              {/* Input oculto para envio de vinhetas próprias do computador */}
              <input
                ref={uploadVinhetaInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setPendingUploadFile(file);
                  setUploadModalTitle(file.name.replace(/\.(mp3|wav|ogg|m4a|aac)$/i, ''));
                  setUploadModalType('vinheta');
                  setUploadModalPriority('alta');
                  setUploadModalAudioUrl(URL.createObjectURL(file));
                  setUploadFeedback(null);
                  e.target.value = '';
                }}
                className="hidden"
              />

              {/* 1. TOP BANNER: IDENTIDADE DA LOJA & AÇÕES RÁPIDAS */}
              <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900/90 to-zinc-900 border border-purple-500/30 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Radio className="w-5 h-5" />
                      </span>
                      <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                          Central de Vinhetas da Loja
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Identidade Sonora
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Sem Custo de Créditos
                          </span>
                        </h2>
                        <p className="text-xs text-zinc-400">
                          Carimbos sonoros, identificação da rádio e chamadas curtas dos setores da loja com Auto-Ducking.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSyncVinhetasWithRadioName}
                      className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 border border-purple-500/50 shadow-md shadow-purple-600/20 transition cursor-pointer"
                      title="Atualiza todas as 15 vinhetas com o nome que está no título da sua rádio"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Atualizar Vinhetas com o Nome da Rádio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => uploadVinhetaInputRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-2 border border-zinc-700 hover:border-purple-500/50 transition cursor-pointer shadow-sm"
                      title="Enviar arquivo de vinheta gravada do seu estúdio (MP3/WAV)"
                    >
                      <Upload className="w-3.5 h-3.5 text-purple-400" />
                      <span>+ Enviar Vinheta Própria (MP3)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-700/70 text-xs">
                  <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-700/70 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">🏪</span>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Nome da Loja nas Vinhetas</span>
                        <strong className="text-white truncate block">{resolvedVinhetaStoreName}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSyncVinhetasWithRadioName}
                      className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                      title="Sincronizar vinhetas com o título da rádio"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sincronizar</span>
                    </button>
                  </div>
                  <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-700/70 flex items-center gap-2.5">
                    <span className="text-lg">🎙️</span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Voz Selecionada</span>
                      <strong className="text-white truncate block">
                        {voices.find(v => v.id === selectedVoiceId)?.name || 'Daniel (Varejo Enérgico)'}
                      </strong>
                    </div>
                  </div>
                  <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-700/70 flex items-center gap-2.5">
                    <span className="text-lg">🎵</span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Vinhetas na Grade</span>
                      <strong className="text-purple-300 font-mono">
                        {(config.queue || []).filter(q => q.type === 'vinheta' && q.active).length} ativas na programação
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CATEGORY PILLS FILTER (1 LINHA SEM CORTAR) */}
              <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full">
                {[
                  { id: 'todas', label: 'Todas', icon: '📻', count: SUPERMARKET_VINHETAS.length },
                  {
                    id: 'identificacao',
                    label: 'Identificação',
                    icon: '🎙️',
                    count: SUPERMARKET_VINHETAS.filter(v => v.category === 'identificacao').length,
                  },
                  {
                    id: 'institucional',
                    label: 'Institucional',
                    icon: '🛒',
                    count: SUPERMARKET_VINHETAS.filter(v => v.category === 'institucional').length,
                  },
                  {
                    id: 'setores',
                    label: 'Setores',
                    icon: '🥩',
                    count: SUPERMARKET_VINHETAS.filter(v => v.category === 'setores').length,
                  },
                  {
                    id: 'clube',
                    label: 'Clube',
                    icon: '💳',
                    count: SUPERMARKET_VINHETAS.filter(v => v.category === 'clube').length,
                  },
                  {
                    id: 'sweepers',
                    label: 'Carimbos (5s)',
                    icon: '⚡',
                    count: SUPERMARKET_VINHETAS.filter(v => v.category === 'sweepers').length,
                  },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setVinhetaCategoryFilter(cat.id)}
                    className={`w-full px-1.5 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 border whitespace-nowrap ${
                      vinhetaCategoryFilter === cat.id
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-600/30'
                        : 'bg-[#141620] text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="shrink-0 text-xs">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                    <span
                      className={`px-1 sm:px-1.5 py-0.2 rounded-full text-[10px] shrink-0 ${
                        vinhetaCategoryFilter === cat.id
                          ? 'bg-purple-950 text-purple-200 font-black'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* 3. VINHETAS CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUPERMARKET_VINHETAS.filter(vinheta => {
                  if (vinhetaCategoryFilter === 'todas') return true;
                  return vinheta.category === vinhetaCategoryFilter;
                }).map(vinheta => {
                  const storeName = resolvedVinhetaStoreName;
                  const localizedTitle = vinheta.title.replace(/\{loja\}/gi, storeName);
                  const localizedScript = vinheta.scriptTemplate.replace(/\{loja\}/gi, storeName);
                  const isCheckedForQueue = Boolean(vinhetaAddToQueueMap[vinheta.id]);
                  const itemInQueue = (config?.queue || []).find(
                    q => q.title.toLowerCase() === localizedTitle.toLowerCase() && q.active
                  );

                  return (
                    <div
                      key={vinheta.id}
                      className="p-4 rounded-xl bg-[#141620] border border-zinc-700/80 hover:border-purple-500/40 transition flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                            <span>{vinheta.icon}</span>
                            <span>{vinheta.categoryLabel}</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {vinheta.badge}
                            </span>
                            {itemInQueue && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                ✓ Na Grade
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-white mb-1.5 tracking-tight">
                          {localizedTitle}
                        </h4>

                        <div className="p-3 rounded-lg bg-[#141620] border border-zinc-700/80 text-xs text-zinc-300 italic leading-relaxed">
                          "{localizedScript}"
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenCustomizeVinhetaModal(vinheta)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#1c202d] hover:bg-[#252a3b] text-zinc-400 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                          <span>Personalizar</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = !isCheckedForQueue;
                              setVinhetaAddToQueueMap(prev => ({
                                ...prev,
                                [vinheta.id]: nextVal,
                              }));
                              if (nextVal) {
                                handleAddVinhetaToQueue(vinheta);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                              isCheckedForQueue || itemInQueue
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-[#1c202d] hover:bg-[#252a3b] text-zinc-400 hover:text-white border-zinc-800'
                            }`}
                            title={
                              isCheckedForQueue || itemInQueue
                                ? 'Esta vinheta está incluída na grade automática da rádio'
                                : 'Clique para adicionar esta vinheta à grade de rotação automática'
                            }
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isCheckedForQueue || itemInQueue ? '✓ Na Grade' : '+ Na Grade'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleBroadcastVinheta(vinheta)}
                            disabled={isGeneratingVinheta}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-600/20"
                            title="Tocar esta vinheta imediatamente no som da loja com Auto-Ducking (executa agora e NÃO vai para a grade automática)"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Falar no Ar Agora</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: GRADE COMPLETA DE OFERTAS NO AR                            */}
          {/* ================================================================= */}
          {activeTab === 'queue' && (
            <div className="rounded-2xl bg-[#181b24] border border-zinc-700/80 shadow-md p-4 sm:p-6 space-y-4">
              <input
                ref={uploadSpotInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                multiple
                onChange={handleSpotFileSelected}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Grade de Ofertas & Comunicados da Rádio Web</h2>
                  <p className="text-xs text-zinc-400">
                    Gerencie quais locuções estão ativas na rotação automática, defina prioridade ou dispare ao vivo.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => uploadSpotInputRef.current?.click()}
                    disabled={isUploadingSpot}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 border border-zinc-700 hover:border-orange-500/50 shadow-sm transition cursor-pointer"
                    title="Adicionar arquivo MP3 ou WAV do computador direto na programação da rádio"
                  >
                    {isUploadingSpot ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                        <span>Enviando Áudio...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-orange-400" />
                        <span>Adicionar Áudio do Computador</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('flash_studio')}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Locução Ao Vivo
                  </button>
                </div>
              </div>

              {uploadFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    uploadFeedback.type === 'success'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/15 text-red-300 border-red-500/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{uploadFeedback.message}</span>
                </div>
              )}

              {/* Programação por Dia da Semana: Filtro e Contadores */}
              {(() => {
                const filteredQueue = config.queue.filter(item => {
                  if (gradeDayFilter === 'all') return true;
                  if (gradeDayFilter === 'today') return isItemScheduledForDay(item.daysOfWeek, todayDayOfWeek);
                  return isItemScheduledForDay(item.daysOfWeek, gradeDayFilter);
                });

                const todayCount = config.queue.filter(item => isItemScheduledForDay(item.daysOfWeek, todayDayOfWeek)).length;

                return (
                  <>
                    {/* BARRA DE NAVEGAÇÃO DOS DIAS DA SEMANA */}
                    <div className="bg-[#141620] border border-zinc-700/80 rounded-2xl p-3.5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4" />
                          </span>
                          <div>
                            <h3 className="text-sm font-black text-white flex items-center gap-2">
                              <span>Grade por Dia da Semana</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {gradeDayFilter === 'all'
                                  ? 'Exibindo Toda a Semana'
                                  : gradeDayFilter === 'today'
                                  ? `Exibindo Hoje (${DAYS_OF_WEEK_CONFIG.find(d => d.id === todayDayOfWeek)?.fullName})`
                                  : `Exibindo ${DAYS_OF_WEEK_CONFIG.find(d => d.id === gradeDayFilter)?.fullName}`}
                              </span>
                            </h3>
                            <p className="text-[11px] text-zinc-400">
                              Monte a programação da rádio para cada dia da semana. As locuções tocam automaticamente no dia programado.
                            </p>
                          </div>
                        </div>

                        {/* Status de Hoje */}
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Hoje é {DAYS_OF_WEEK_CONFIG.find(d => d.id === todayDayOfWeek)?.fullName} ({todayCount} no ar)
                          </span>
                        </div>
                      </div>

                      {/* Botões dos Dias da Semana */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {/* Todos os Dias */}
                        <button
                          type="button"
                          onClick={() => setGradeDayFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                            gradeDayFilter === 'all'
                              ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20 font-black'
                              : 'bg-[#1c202d] hover:bg-[#252a3b] text-zinc-200 border border-zinc-700/80'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Todos os Dias</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            gradeDayFilter === 'all' ? 'bg-black/20 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {config.queue.length}
                          </span>
                        </button>

                        {/* Hoje */}
                        <button
                          type="button"
                          onClick={() => setGradeDayFilter('today')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                            gradeDayFilter === 'today'
                              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-black'
                              : 'bg-[#1c202d] hover:bg-[#252a3b] text-zinc-200 border border-zinc-700/80'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>No Ar Hoje</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            gradeDayFilter === 'today' ? 'bg-black/20 text-zinc-950 font-black' : 'bg-zinc-800 text-emerald-400 font-bold'
                          }`}>
                            {todayCount}
                          </span>
                        </button>

                        <div className="h-5 w-px bg-zinc-800 shrink-0 mx-1" />

                        {/* Segunda a Domingo */}
                        {DAYS_OF_WEEK_CONFIG.map(day => {
                          const count = config.queue.filter(item => isItemScheduledForDay(item.daysOfWeek, day.id)).length;
                          const isToday = day.id === todayDayOfWeek;
                          const isSelected = gradeDayFilter === day.id;

                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => setGradeDayFilter(day.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20 font-black'
                                  : isToday
                                  ? 'bg-[#1c202d] hover:bg-[#252a3b] text-white border border-emerald-500/50 ring-1 ring-emerald-500/30'
                                  : 'bg-[#1c202d] hover:bg-[#252a3b] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                              }`}
                              title={`Ver grade de ${day.fullName} (${count} locuções programadas)`}
                            >
                              {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                              <span>{day.name}</span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                isSelected
                                  ? 'bg-black/20 text-zinc-950 font-black'
                                  : isToday
                                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* LISTA DE LOCUÇÕES DA GRADE */}
                    <div className="space-y-3">
                      {filteredQueue.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/20">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <h3 className="text-sm font-bold text-white">
                            Nenhuma locução programada para{' '}
                            {gradeDayFilter === 'today'
                              ? `Hoje (${DAYS_OF_WEEK_CONFIG.find(d => d.id === todayDayOfWeek)?.fullName})`
                              : DAYS_OF_WEEK_CONFIG.find(d => d.id === gradeDayFilter)?.fullName || 'este dia'}
                          </h3>
                          <p className="text-xs text-zinc-400 max-w-md mx-auto">
                            Você pode ver todas as locuções e definir quais dias da semana elas tocam, ou criar uma nova locução para entrar no ar.
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setGradeDayFilter('all')}
                              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 cursor-pointer"
                            >
                              Ver Todas as Locuções ({config.queue.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab('flash_studio')}
                              className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs cursor-pointer shadow-md shadow-orange-500/20"
                            >
                              Nova Locução Ao Vivo
                            </button>
                          </div>
                        </div>
                      ) : (
                        filteredQueue.map((item) => {
                          const globalIdx = config.queue.findIndex(q => q.id === item.id);
                          const isPlayingNow = currentSpot?.id === item.id;
                          const isPreviewingThis = previewItemId === item.id;
                          const isActivelyPreviewing = isPreviewingThis && isPreviewPlaying;
                          const effectiveDuration = isPreviewingThis && previewDuration > 0 ? previewDuration : item.durationSeconds || 20;
                          const progressPct = isPreviewingThis && effectiveDuration > 0
                            ? Math.min(100, (previewCurrentTime / effectiveDuration) * 100)
                            : 0;
                          const isScheduledToday = isItemScheduledForDay(item.daysOfWeek, todayDayOfWeek);

                          return (
                            <div
                              key={item.id}
                              className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col gap-2 transition ${
                                isPlayingNow
                                  ? 'bg-orange-500/15 border-orange-500/50'
                                  : isActivelyPreviewing
                                  ? 'bg-sky-500/10 border-sky-500/40 shadow-lg shadow-sky-950/30'
                                  : item.active
                                  ? 'bg-[#141620] border-zinc-800'
                                  : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                              }`}
                            >
                              <div className="flex items-start sm:items-center gap-3">
                                {/* Stepper de Posição na Grade (Mudar Ordem ▲ / ▼) */}
                                <div className="flex flex-col items-center justify-center gap-0.5 shrink-0 bg-[#141620] border border-zinc-700/80 rounded-xl p-1 shadow-sm">
                                  <button
                                    type="button"
                                    disabled={globalIdx <= 0}
                                    onClick={() => moveQueueItem(item.id, 'up')}
                                    className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                                    title="Subir posição na grade de programação"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-[10px] font-mono font-black text-orange-400 select-none px-1">
                                    #{globalIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={globalIdx >= config.queue.length - 1}
                                    onClick={() => moveQueueItem(item.id, 'down')}
                                    className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                                    title="Descer posição na grade de programação"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Conteúdo Completo que Ocupa Todo o Espaço Horizontal */}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                  {/* LINHA 1: Título e Badges à Esquerda + Programação de Dias à Direita (Onde estava a marcação verde) */}
                                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                                        item.type === 'vinheta'
                                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                          : item.type === 'comunicado'
                                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                          : item.type === 'relampago'
                                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                          : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                      }`}>
                                        {item.type === 'vinheta'
                                          ? '🎵 Vinheta'
                                          : item.type === 'comunicado'
                                          ? '📢 Comunicado'
                                          : item.type === 'relampago'
                                          ? '⚡ Relâmpago'
                                          : '🛒 Oferta'}
                                      </span>
                                      <span className="text-sm font-bold text-white tracking-tight" title={item.title}>
                                        {item.title}
                                      </span>

                                      {/* Badge de Programação Semanal / No Ar Hoje */}
                                      {isScheduledToday ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                          No ar hoje
                                        </span>
                                      ) : (
                                        <span
                                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800/90 text-zinc-400 border border-zinc-700/60 flex items-center gap-1 shrink-0"
                                          title={`Esta locução toca apenas em: ${getDaysSummary(item.daysOfWeek)}`}
                                        >
                                          <Calendar className="w-3 h-3 text-zinc-500" />
                                          {getDaysSummary(item.daysOfWeek)} (Fora do ar hoje)
                                        </span>
                                      )}

                                      {item.priority === 'alta' && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                          ★ Prioridade Alta
                                        </span>
                                      )}
                                      {item.repeatIntervalMinutes && item.repeatIntervalMinutes > 0 ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                                          <Clock className="w-3 h-3 text-amber-400" />
                                          A cada {item.repeatIntervalMinutes} min
                                        </span>
                                      ) : null}
                                      {isActivelyPreviewing && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1 shrink-0">
                                          <Headphones className="w-3 h-3 animate-bounce" />
                                          Prévia (Fora do Ar)
                                        </span>
                                      )}
                                      {isPlayingNow && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500 text-white shrink-0">
                                          🔊 Tocando no Ao Vivo
                                        </span>
                                      )}
                                    </div>

                                    {/* À DIREITA NA LINHA 1 (ONDE ESTAVA A MARCAÇÃO EM VERDE): Seletor de Programação Semanal por Dias */}
                                    <div
                                      className="flex items-center gap-1.5 bg-[#141620] border border-zinc-700/80 rounded-xl px-2.5 py-1 text-xs shadow-sm hover:border-zinc-700 transition shrink-0 self-start lg:self-auto"
                                      title="Defina quais dias da semana esta locução deve tocar na rádio"
                                    >
                                      <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                      <span className="text-zinc-400 text-[11px] font-medium shrink-0">Dias:</span>
                                      <select
                                        value={getDaysPresetValue(item.daysOfWeek)}
                                        onChange={(e) => handleDayPresetChange(item.id, e.target.value)}
                                        className="bg-transparent text-zinc-200 hover:text-white text-xs font-bold border-none outline-none focus:ring-0 cursor-pointer"
                                      >
                                        <option value="all" className="bg-zinc-900 text-zinc-300">📅 Todos os Dias (Diário)</option>
                                        <option value="weekdays" className="bg-zinc-900 text-zinc-300">🏢 Seg a Sex (Dias Úteis)</option>
                                        <option value="weekend" className="bg-zinc-900 text-zinc-300">🎉 Fim de Semana (Sáb/Dom)</option>
                                        <option value="seg" className="bg-zinc-900 text-zinc-300">Apenas Segunda-feira</option>
                                        <option value="ter" className="bg-zinc-900 text-zinc-300">Apenas Terça-feira</option>
                                        <option value="qua" className="bg-zinc-900 text-zinc-300">Apenas Quarta-feira</option>
                                        <option value="qui" className="bg-zinc-900 text-zinc-300">Apenas Quinta-feira</option>
                                        <option value="sex" className="bg-zinc-900 text-zinc-300">Apenas Sexta-feira</option>
                                        <option value="sab" className="bg-zinc-900 text-zinc-300">Apenas Sábado</option>
                                        <option value="dom" className="bg-zinc-900 text-zinc-300">Apenas Domingo</option>
                                        {getDaysPresetValue(item.daysOfWeek) === 'custom' && (
                                          <option value="custom" className="bg-zinc-900 text-amber-300 font-bold">
                                            ⚙️ Personalizado ({item.daysOfWeek?.length} dias)
                                          </option>
                                        )}
                                      </select>

                                      {/* Botões rápidos individuais para alternar cada dia: S T Q Q S S D */}
                                      <div className="flex items-center gap-0.5 ml-1 border-l border-zinc-800 pl-1.5" title="Clique no dia para ativar ou desativar">
                                        {DAYS_OF_WEEK_CONFIG.map(day => {
                                          const isScheduled = isItemScheduledForDay(item.daysOfWeek, day.id);
                                          const isToday = day.id === todayDayOfWeek;
                                          return (
                                            <button
                                              key={day.id}
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleItemDay(item.id, item.daysOfWeek, day.id);
                                              }}
                                              className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center transition cursor-pointer ${
                                                isScheduled
                                                  ? isToday
                                                    ? 'bg-emerald-500 text-zinc-950 font-black ring-1 ring-emerald-300 shadow-sm'
                                                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700'
                                                  : 'bg-zinc-950 text-zinc-600 hover:text-zinc-400 opacity-40 line-through'
                                              }`}
                                              title={`${day.fullName}: ${isScheduled ? 'ATIVA' : 'DESATIVADA'} (Clique para alternar)${isToday ? ' • [HOJE]' : ''}`}
                                            >
                                              {day.short}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* LINHA 2: Metadados à Esquerda + Todas as Ações à Direita */}
                                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 pt-1 border-t border-zinc-900/60">
                                    <p className="text-xs text-zinc-400 truncate">
                                      Locutor: <strong className="text-zinc-300">{item.voiceName}</strong> • Loja:{' '}
                                      <strong className="text-zinc-300">{item.storeName || config.storeName || 'Supermercado'}</strong> • Duração:{' '}
                                      {item.durationSeconds}s • Reproduções: <strong className="text-zinc-300">{item.playCount ?? 0}x</strong>
                                      {item.repeatIntervalMinutes ? (
                                        <span className="text-amber-300/80 font-medium ml-1">
                                          {item.lastPlayedAt ? (
                                            (() => {
                                              const elapsed = Math.floor((Date.now() - new Date(item.lastPlayedAt).getTime()) / 60000);
                                              const remaining = Math.max(0, item.repeatIntervalMinutes! - elapsed);
                                              return remaining === 0
                                                ? ' • 🔔 Intervalo atingido'
                                                : ` • ⏱️ Próxima em ~${remaining} min`;
                                            })()
                                          ) : (
                                            ' • ⏱️ Pendente'
                                          )}
                                        </span>
                                      ) : null}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 xl:ml-auto">
                                      {/* Seletor de Intervalo Opcional de Execução */}
                                      <div
                                        className="flex items-center gap-1.5 bg-[#141620] border border-zinc-700/80 rounded-xl px-2.5 py-1 text-xs shadow-sm hover:border-zinc-700 transition"
                                        title="De quanto em quanto tempo esta locução deve tocar automaticamente na rádio"
                                      >
                                        <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                        <span className="text-zinc-400 text-[11px] font-medium shrink-0">Intervalo:</span>
                                        <select
                                          value={item.repeatIntervalMinutes || 0}
                                          onChange={(e) =>
                                            updateQueueItem(item.id, {
                                              repeatIntervalMinutes: Number(e.target.value) || undefined,
                                            })
                                          }
                                          className="bg-transparent text-zinc-200 hover:text-white text-xs font-bold border-none outline-none focus:ring-0 cursor-pointer"
                                        >
                                          <option value={0} className="bg-zinc-900 text-zinc-300">🔁 Rotação Padrão</option>
                                          <option value={5} className="bg-zinc-900 text-zinc-300">⏱️ A cada 5 min</option>
                                          <option value={10} className="bg-zinc-900 text-zinc-300">⏱️ A cada 10 min</option>
                                          <option value={15} className="bg-zinc-900 text-zinc-300">⏱️ A cada 15 min</option>
                                          <option value={20} className="bg-zinc-900 text-zinc-300">⏱️ A cada 20 min</option>
                                          <option value={30} className="bg-zinc-900 text-zinc-300">⏱️ A cada 30 min</option>
                                          <option value={45} className="bg-zinc-900 text-zinc-300">⏱️ A cada 45 min</option>
                                          <option value={60} className="bg-zinc-900 text-zinc-300">⏱️ A cada 60 min (1h)</option>
                                          <option value={90} className="bg-zinc-900 text-zinc-300">⏱️ A cada 90 min (1h30)</option>
                                          <option value={120} className="bg-zinc-900 text-zinc-300">⏱️ A cada 120 min (2h)</option>
                                        </select>
                                      </div>

                                      {/* Botão de Pré-escuta */}
                                      <button
                                        onClick={() => handleTogglePreview(item.id, item.audioUrl)}
                                        className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition cursor-pointer ${
                                          isActivelyPreviewing
                                            ? 'bg-sky-500 hover:bg-sky-400 text-zinc-950 border-sky-400 shadow-md shadow-sky-500/20'
                                            : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/30'
                                        }`}
                                        title="Ouvir locução apenas na prévia (não interrompe nem sai no ao vivo da rádio)"
                                      >
                                        {isActivelyPreviewing ? (
                                          <>
                                            <Pause className="w-3.5 h-3.5 fill-current" />
                                            Pausar Prévia
                                          </>
                                        ) : (
                                          <>
                                            <Headphones className="w-3.5 h-3.5" />
                                            Ouvir Prévia
                                          </>
                                        )}
                                      </button>

                                      {/* Botão de Transmissão Ao Vivo na Rádio */}
                                      <button
                                        onClick={() => {
                                          if (isActivelyPreviewing && previewAudioRef.current) {
                                            previewAudioRef.current.pause();
                                            setIsPreviewPlaying(false);
                                          }
                                          playSpotNow(item);
                                        }}
                                        className="px-3 py-1 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/20"
                                        title="Transmitir agora no AO VIVO da Rádio Web com Auto-Ducking"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        Tocar no Ao Vivo
                                      </button>

                                      <button
                                        onClick={() => toggleQueueItemPriority(item.id)}
                                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                          item.priority === 'alta'
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                                        }`}
                                      >
                                        <Star className="w-3.5 h-3.5 inline mr-1" />
                                        {item.priority === 'alta' ? 'Prioridade Alta' : 'Normal'}
                                      </button>

                                      <button
                                        onClick={() => toggleQueueItemActive(item.id)}
                                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                          item.active
                                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                                        }`}
                                      >
                                        {item.active ? 'Ativa na Grade' : 'Pausada'}
                                      </button>

                                      <a
                                        href={`${item.audioUrl}?download=1`}
                                        download
                                        className="p-1.5 rounded-xl bg-[#1c202d] hover:bg-[#252a3b] text-zinc-200 border border-zinc-700/80 transition"
                                        title="Baixar MP3"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>

                                      <button
                                        onClick={() => setQueueItemToDelete(item)}
                                        className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                                        title="Remover da grade da rádio"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Barra de Progresso Interativa da Prévia (Aparece quando o usuário clica em Ouvir Prévia) */}
                              {isPreviewingThis && (
                                <div className="pt-2 border-t border-zinc-700/70 flex items-center gap-3">
                                  <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1 shrink-0">
                                    <Headphones className="w-3.5 h-3.5" />
                                    Pré-escuta (Fora do Ar):
                                  </span>
                                  <div
                                    onClick={handleSeekPreview}
                                    className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer relative"
                                    title="Clique para avançar ou voltar na prévia"
                                  >
                                    <div
                                      className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-150"
                                      style={{ width: `${progressPct}%` }}
                                    />
                                  </div>
                                  {previewBoostDb > 0.4 && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                                      Voz Nivelada +{previewBoostDb.toFixed(1)}dB
                                    </span>
                                  )}
                                  <span className="text-[11px] font-mono text-sky-300 shrink-0">
                                    {formatTime(previewCurrentTime)} / {formatTime(effectiveDuration)}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: IMPORTAR LOCUÇÕES PRONTAS DO ESTÚDIO / BIBLIOTECA          */}
          {/* ================================================================= */}
          {activeTab === 'library_import' && (
            <div className="rounded-2xl bg-[#181b24] border border-zinc-700/80 shadow-md p-6 space-y-4">
              <div>
                <h2 className="text-xl font-black text-white">
                  Importar Locuções das Campanhas do Supermercado para a Rádio Web
                </h2>
                <p className="text-xs text-zinc-400">
                  Qualquer locução gerada no Estúdio pode ser adicionada à rotação da Rádio Web ou tocada ao vivo com 1
                  clique.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableAudios.map(audio => {
                  const inQueue = config.queue.some(q => q.audioId === audio.id);
                  return (
                    <div
                      key={audio.id}
                      className="p-4 rounded-2xl bg-[#141620] border border-zinc-700/80 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-orange-400 block">
                          {audio.projectTitle || 'Campanha do Supermercado'}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate">{audio.title}</h4>
                        <p className="text-xs text-zinc-400">
                          Voz: {audio.voiceName} • {audio.durationSeconds}s
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleTogglePreview(`import-${audio.id}`, audio.audioUrl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition cursor-pointer ${
                            previewItemId === `import-${audio.id}` && isPreviewPlaying
                              ? 'bg-sky-500 text-zinc-950 border-sky-400'
                              : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/30'
                          }`}
                          title="Ouvir locução apenas na prévia (fora do ar)"
                        >
                          {previewItemId === `import-${audio.id}` && isPreviewPlaying ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              Pausar Prévia
                            </>
                          ) : (
                            <>
                              <Headphones className="w-3.5 h-3.5" />
                              Ouvir Prévia
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            publishAudioToRadio(audio, {
                              storeName: audio.storeName || config.storeName,
                              type: 'oferta',
                              priority: 'alta',
                              playImmediately: true,
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Tocar no Ar
                        </button>

                        <button
                          onClick={() =>
                            publishAudioToRadio(audio, {
                              storeName: audio.storeName || config.storeName,
                              type: 'oferta',
                              priority: 'normal',
                              playImmediately: false,
                            })
                          }
                          disabled={inQueue}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            inQueue
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-[#1c202d] hover:bg-[#252a3b] text-white border-zinc-700'
                          }`}
                        >
                          {inQueue ? '✓ Na Grade' : '+ Adicionar à Grade'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: PROGRAMAÇÃO MUSICAL AMBIENTE & PLAYLISTS POR TEMAS         */}
          {/* ================================================================= */}
          {activeTab === 'music' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 rounded-2xl bg-[#181b24] border border-zinc-700/80 shadow-md p-4 sm:p-6 space-y-4">
                <input
                  ref={uploadMusicFileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                  className="hidden"
                  onChange={handleMusicFileSelected}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-white">Programação Musical & Playlists por Tema</h2>
                    <p className="text-xs text-zinc-400">
                      Músicas organizadas por estilo comercial. Crie playlists temáticas ou suba faixas MP3 do computador.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setIsCreatePlaylistModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-orange-400" />
                      Nova Playlist
                    </button>

                    <button
                      onClick={() => uploadMusicFileInputRef.current?.click()}
                      disabled={isUploadingMusic}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      {isUploadingMusic ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                          <span>Carregando...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Carregar MP3 do Computador</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {uploadMusicFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                      uploadMusicFeedback.type === 'success'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-red-500/15 text-red-300 border-red-500/30'
                    }`}
                  >
                    {uploadMusicFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{uploadMusicFeedback.message}</span>
                  </div>
                )}

                {/* Playlist Selection / Theme Filter Bar */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
                    <span>Playlists & Temas Musicais:</span>
                    {config.activePlaylistId && config.activePlaylistId !== 'todas' && (
                      <button
                        onClick={() => setActivePlaylist('todas')}
                        className="text-orange-400 hover:text-orange-300 underline font-bold cursor-pointer"
                      >
                        Resetar: Tocar todas as faixas
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedPlaylistFilter('todas')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                        selectedPlaylistFilter === 'todas'
                          ? 'bg-orange-500 text-zinc-950 border-orange-400 shadow-sm shadow-orange-500/20'
                          : 'bg-[#141620] text-zinc-400 hover:text-white border-zinc-800'
                      }`}
                    >
                      <span>🎵</span>
                      <span>Todas as Músicas</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          selectedPlaylistFilter === 'todas' ? 'bg-zinc-950/30 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {config.musicTracks.length}
                      </span>
                    </button>

                    {(config.playlists || []).map(pl => {
                      const isSelected = selectedPlaylistFilter === pl.id;
                      const count = config.musicTracks.filter(
                        t => (t.playlistId || t.category) === pl.id
                      ).length;
                      const isActiveOnAir = config.activePlaylistId === pl.id;

                      return (
                        <button
                          key={pl.id}
                          onClick={() => setSelectedPlaylistFilter(pl.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-orange-500 text-zinc-950 border-orange-400 shadow-sm shadow-orange-500/20'
                              : 'bg-[#141620] text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <span>{pl.icon || '🎵'}</span>
                          <span>{pl.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                              isSelected ? 'bg-zinc-950/30 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {count}
                          </span>
                          {isActiveOnAir && (
                            <span
                              className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"
                              title="Playlist ativa no ar da rádio"
                            />
                          )}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setIsCreatePlaylistModalOpen(true)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 flex items-center gap-1 transition cursor-pointer"
                      title="Criar uma nova playlist temática"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nova Playlist</span>
                    </button>
                  </div>
                </div>

                {/* Playlist Active Control Card */}
                {selectedPlaylistFilter !== 'todas' && (() => {
                  const currentPl = (config.playlists || []).find(p => p.id === selectedPlaylistFilter);
                  if (!currentPl) return null;
                  const isActiveOnAir = config.activePlaylistId === currentPl.id;
                  const plTracksCount = config.musicTracks.filter(
                    t => (t.playlistId || t.category) === currentPl.id
                  ).length;

                  return (
                    <div className="p-3.5 rounded-2xl bg-[#141620] border border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{currentPl.icon || '🎵'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-white">{currentPl.name}</h3>
                            {isActiveOnAir ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-zinc-950 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-ping" />
                                NO AR DA LOJA
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400">
                                {plTracksCount} faixa{plTracksCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {currentPl.description && (
                            <p className="text-xs text-zinc-400 line-clamp-1">{currentPl.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActiveOnAir ? (
                          <button
                            onClick={() => setActivePlaylist('todas')}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs border border-zinc-700 transition cursor-pointer"
                          >
                            Voltar para Todas
                          </button>
                        ) : (
                          <button
                            onClick={() => setActivePlaylist(currentPl.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-emerald-500/20"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Definir Playlist no Ar
                          </button>
                        )}

                        {currentPl.isCustom && (
                          <button
                            onClick={() => deleteCustomPlaylist(currentPl.id)}
                            className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                            title="Excluir esta playlist personalizada"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Music Tracks List */}
                <div className="space-y-2.5 pt-1">
                  {(() => {
                    const displayedTracks =
                      selectedPlaylistFilter === 'todas'
                        ? config.musicTracks
                        : config.musicTracks.filter(
                            t => (t.playlistId || t.category) === selectedPlaylistFilter
                          );

                    if (displayedTracks.length === 0) {
                      return (
                        <div className="text-center py-10 bg-zinc-950/40 rounded-2xl border border-zinc-700/70 p-6 space-y-3">
                          <p className="text-sm font-bold text-zinc-400">
                            Nenhuma música encontrada nesta playlist.
                          </p>
                          <p className="text-xs text-zinc-500">
                            Carregue arquivos MP3 do seu computador para adicionar faixas a este tema!
                          </p>
                          <button
                            onClick={() => uploadMusicFileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Adicionar MP3 Aqui
                          </button>
                        </div>
                      );
                    }

                    return displayedTracks.map(track => {
                      const isCurrent = currentMusic?.id === track.id;
                      const isPreviewingThis = previewItemId === track.id;
                      const isActivelyPreviewing = isPreviewingThis && isPreviewPlaying;
                      const effectiveDuration =
                        isPreviewingThis && previewDuration > 0 ? previewDuration : track.durationSeconds || 180;
                      const progressPct =
                        isPreviewingThis && effectiveDuration > 0
                          ? Math.min(100, Math.max(0, (previewCurrentTime / effectiveDuration) * 100))
                          : 0;
                      const trackPl = (config.playlists || []).find(
                        p => p.id === (track.playlistId || track.category)
                      );

                      return (
                        <div
                          key={track.id}
                          className={`p-3 sm:px-4 sm:py-2.5 rounded-xl border transition space-y-2.5 ${
                            isCurrent
                              ? 'bg-emerald-500/15 border-emerald-500/40 shadow-sm shadow-emerald-500/15'
                              : isActivelyPreviewing
                              ? 'bg-sky-500/10 border-sky-500/30 shadow-sm shadow-sky-500/10'
                              : track.active
                              ? 'bg-[#141620] border-zinc-700/80 hover:border-zinc-700/80'
                              : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                          }`}
                        >
                          {/* Row 1: Título da Música SOZINHO na primeira linha (sempre 100% visível) */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition ${
                                isCurrent
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : isActivelyPreviewing
                                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                              }`}
                            >
                              {isCurrent ? (
                                <div className="flex items-end gap-0.5 h-3.5">
                                  <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms] h-3.5" />
                                  <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms] h-2" />
                                  <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms] h-3" />
                                </div>
                              ) : (
                                <Music className="w-3.5 h-3.5" />
                              )}
                            </div>

                            <h4
                              className="text-sm font-bold text-white tracking-tight truncate flex-1"
                              title={track.title}
                            >
                              {track.title}
                            </h4>

                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-zinc-950 flex items-center gap-1 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-ping" />
                                NO AR
                              </span>
                            )}

                            {isActivelyPreviewing && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1 shrink-0">
                                <Headphones className="w-3 h-3 animate-pulse" />
                                Prévia
                              </span>
                            )}
                          </div>

                          {/* Row 2: Playlist Selector on left, Action buttons on right */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 flex-wrap sm:flex-nowrap">
                            {/* Playlist / Theme Selector + Duração */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs">
                                <span className="text-zinc-400 text-[11px] font-semibold">Tema:</span>
                                <select
                                  value={track.playlistId || track.category}
                                  onChange={e => {
                                    updateMusicTrack(track.id, {
                                      playlistId: e.target.value,
                                      category: e.target.value,
                                    });
                                  }}
                                  className="bg-transparent text-zinc-200 text-xs font-bold focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[200px] truncate"
                                  title="Alterar tema desta música"
                                >
                                  {(config.playlists || []).map(p => (
                                    <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                                      {p.icon || '🎵'} {p.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <span className="text-[11px] text-zinc-500 font-mono">
                                {track.durationSeconds
                                  ? `${Math.floor(track.durationSeconds / 60)}:${String(
                                      track.durationSeconds % 60
                                    ).padStart(2, '0')}`
                                  : '3:00'}
                              </span>
                            </div>

                            {/* Actions Toolbar */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Prévia Button */}
                              <button
                                onClick={() => handleTogglePreview(track.id, track.audioUrl)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 border transition cursor-pointer ${
                                  isActivelyPreviewing
                                    ? 'bg-sky-500 hover:bg-sky-400 text-zinc-950 border-sky-400 shadow-sm shadow-sky-500/20'
                                    : 'bg-[#1c202d] hover:bg-[#252a3b] text-sky-300 border-zinc-700'
                                }`}
                                title="Ouvir apenas para você (fora do ar)"
                              >
                                {isActivelyPreviewing ? (
                                  <>
                                    <Pause className="w-3 h-3 fill-current" />
                                    <span>Pausar</span>
                                  </>
                                ) : (
                                  <>
                                    <Headphones className="w-3 h-3" />
                                    <span>Prévia</span>
                                  </>
                                )}
                              </button>

                              {/* Tocar no Ar */}
                              <button
                                onClick={() => playMusicTrackNow(track)}
                                className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs flex items-center gap-1 transition cursor-pointer shadow-sm shadow-orange-500/20"
                                title="Colocar esta faixa para tocar imediatamente no ar da loja"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Tocar no Ar</span>
                              </button>

                              {/* Ativa / Pausada Switch Pill */}
                              <button
                                onClick={() => updateMusicTrack(track.id, { active: !track.active })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                  track.active
                                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                                    : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                                }`}
                              >
                                {track.active ? 'Ativa' : 'Pausada'}
                              </button>

                              {/* Delete (if custom track) */}
                              {track.isCustom && (
                                <button
                                  onClick={() => setMusicTrackToDelete(track)}
                                  className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                                  title="Remover esta faixa própria"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Interactive Preview Progress Bar */}
                          {isActivelyPreviewing && (
                            <div className="pt-2 border-t border-zinc-700/70 flex items-center gap-3">
                              <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1 shrink-0">
                                <Headphones className="w-3.5 h-3.5" />
                                Pré-escuta (Fora do Ar):
                              </span>
                              <div
                                onClick={handleSeekPreview}
                                className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer relative"
                                title="Clique para avançar ou voltar na prévia"
                              >
                                <div
                                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-150"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                                {Math.floor(previewCurrentTime / 60)}:
                                {String(Math.floor(previewCurrentTime % 60)).padStart(2, '0')} /{' '}
                                {Math.floor(effectiveDuration / 60)}:
                                {String(Math.floor(effectiveDuration % 60)).padStart(2, '0')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Broadcast History Log */}
              <div className="lg:col-span-5 rounded-2xl bg-[#181b24] border border-zinc-700/80 shadow-md p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-orange-400" />
                  <div>
                    <h3 className="text-lg font-black text-white">Log de Transmissão Ao Vivo</h3>
                    <p className="text-xs text-zinc-400">Histórico em tempo real do AutoDJ da loja</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {broadcastLogs.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-8 text-center">
                      Clique em "Ligar Rádio Ao Vivo" para iniciar o registro de transmissão.
                    </p>
                  ) : (
                    broadcastLogs.map(log => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-[#141620] border border-zinc-700/80/80 flex items-start gap-2.5 text-xs"
                      >
                        <span className="font-mono text-zinc-500 shrink-0">{log.time}</span>
                        <div className="min-w-0">
                          <p
                            className={`font-bold truncate ${
                              log.category === 'oferta'
                                ? 'text-orange-400'
                                : log.category === 'musica'
                                ? 'text-emerald-400'
                                : 'text-zinc-300'
                            }`}
                          >
                            {log.title}
                          </p>
                          {log.detail && <p className="text-[11px] text-zinc-500 truncate">{log.detail}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Modal: Adicionar Áudio do Computador */}
      {pendingUploadFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#181b24] border border-zinc-700/80 rounded-3xl shadow-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Adicionar Áudio do Computador</h3>
                  <p className="text-xs text-zinc-400">Configure como o áudio rodará na programação da rádio</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPendingUploadFile(null);
                  setUploadModalAudioUrl(null);
                  if (uploadSpotInputRef.current) uploadSpotInputRef.current.value = '';
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audio Preview Player */}
            {uploadModalAudioUrl && (
              <div className="bg-[#141620] border border-zinc-700/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-300 truncate max-w-[280px]">
                    {pendingUploadFile.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {(pendingUploadFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <audio controls src={uploadModalAudioUrl} className="w-full h-8" />
              </div>
            )}

            {/* Title Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-300">
                Título de Identificação na Grade
              </label>
              <input
                type="text"
                value={uploadModalTitle}
                onChange={e => setUploadModalTitle(e.target.value)}
                placeholder="Ex: Oferta Relâmpago Gravada, Vinheta da Loja..."
                className="w-full px-3.5 py-2.5 bg-[#141620] border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Type & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Tipo de Conteúdo
                </label>
                <select
                  value={uploadModalType}
                  onChange={e => setUploadModalType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#141620] border border-zinc-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="oferta">🛒 Oferta de Produto</option>
                  <option value="comunicado">📢 Comunicado / Aviso</option>
                  <option value="vinheta">🎵 Vinheta da Loja</option>
                  <option value="relampago">⚡ Oferta Relâmpago</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Prioridade na Fila
                </label>
                <select
                  value={uploadModalPriority}
                  onChange={e => setUploadModalPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#141620] border border-zinc-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="normal">Normal (Rotação Padrão)</option>
                  <option value="alta">★ Prioridade Alta (Mais Frequente)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setPendingUploadFile(null);
                  setUploadModalAudioUrl(null);
                  if (uploadSpotInputRef.current) uploadSpotInputRef.current.value = '';
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmSpotUpload}
                disabled={isUploadingSpot}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {isUploadingSpot ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Adicionando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Adicionar à Grade da Rádio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Carregar MP3 do Computador para a Playlist */}
      {pendingUploadMusicFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#181b24] border border-zinc-700/80 rounded-3xl shadow-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Carregar MP3 do Computador</h3>
                  <p className="text-xs text-zinc-400">Escolha em qual tema ou playlist a faixa tocará</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPendingUploadMusicFile(null);
                  setUploadMusicAudioUrl(null);
                  if (uploadMusicFileInputRef.current) uploadMusicFileInputRef.current.value = '';
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audio Preview Player */}
            {uploadMusicAudioUrl && (
              <div className="bg-[#141620] border border-zinc-700/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-300 truncate max-w-[280px]">
                    {pendingUploadMusicFile.name}
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    {(pendingUploadMusicFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <audio controls src={uploadMusicAudioUrl} className="w-full h-8" />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Nome / Título da Música na Rádio:
                </label>
                <input
                  type="text"
                  value={uploadMusicTitle}
                  onChange={e => setUploadMusicTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: Pop Comercial da Tarde"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Artista / Intérprete ou Identificação:
                </label>
                <input
                  type="text"
                  value={uploadMusicArtist}
                  onChange={e => setUploadMusicArtist(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: Trilha Oficial da Loja"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Tema / Playlist onde a música tocará:
                </label>
                <select
                  value={showCreatePlaylistInline ? '__new__' : uploadMusicPlaylistId}
                  onChange={e => {
                    if (e.target.value === '__new__') {
                      setShowCreatePlaylistInline(true);
                    } else {
                      setShowCreatePlaylistInline(false);
                      setUploadMusicPlaylistId(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {(config.playlists || []).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.icon || '🎵'} {p.name}
                    </option>
                  ))}
                  <option value="__new__">+ Criar Nova Playlist para esta música...</option>
                </select>
              </div>

              {/* Inline Create Playlist input if user selected __new__ */}
              {showCreatePlaylistInline && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5 animate-in fade-in">
                  <label className="block text-xs font-bold text-emerald-300">
                    Digite o nome da nova playlist:
                  </label>
                  <input
                    type="text"
                    value={inlineNewPlaylistName}
                    onChange={e => setInlineNewPlaylistName(e.target.value)}
                    placeholder="Ex: Domingão do Churrasco"
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-emerald-400"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setPendingUploadMusicFile(null);
                  setUploadMusicAudioUrl(null);
                  if (uploadMusicFileInputRef.current) uploadMusicFileInputRef.current.value = '';
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmMusicUpload}
                disabled={isUploadingMusic}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isUploadingMusic ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Adicionando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Adicionar à Playlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Criar Nova Playlist / Tema */}
      {isCreatePlaylistModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateNewPlaylist}
            className="bg-[#181b24] border border-zinc-700/80 rounded-3xl shadow-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                  <ListMusic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Criar Nova Playlist</h3>
                  <p className="text-xs text-zinc-400">Monte um tema musical exclusivo para a sua loja</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatePlaylistModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Nome da Playlist:
                </label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  placeholder="Ex: Domingão da Família / Festival da Carne"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Descrição ou Horário Recomendado (Opcional):
                </label>
                <input
                  type="text"
                  value={newPlaylistDesc}
                  onChange={e => setNewPlaylistDesc(e.target.value)}
                  placeholder="Ex: Trilhas animadas para o pico de vendas"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Ícone / Emoji do Tema:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {['🛒', '🥖', '⚡', '🍷', '🤠', '☕', '🎉', '🎸', '🎵', '🥩', '🧀', '🛍️'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewPlaylistIcon(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition cursor-pointer ${
                        newPlaylistIcon === emoji
                          ? 'bg-orange-500/20 border-orange-500 text-white scale-105'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreatePlaylistModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmittingPlaylist || !newPlaylistName.trim()}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {isSubmittingPlaylist ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Criar Playlist</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Confirmação de Exclusão de Locução da Grade */}
      {queueItemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#181b24] border border-zinc-700/80 rounded-3xl shadow-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-extrabold text-white text-lg">Remover locução da grade?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tem certeza que deseja excluir <strong>"{queueItemToDelete.title}"</strong> da grade de programação da rádio? Ela não será mais reproduzida na rotação automática.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setQueueItemToDelete(null)}
                disabled={isDeletingQueueItem}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQueueItem}
                disabled={isDeletingQueueItem}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isDeletingQueueItem ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sim, Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Exclusão de Música Personalizada */}
      {musicTrackToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#181b24] border border-zinc-700/80 rounded-3xl shadow-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-extrabold text-white text-lg">Remover música da rádio?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tem certeza que deseja apagar a música <strong>"{musicTrackToDelete.title}"</strong> da programação?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setMusicTrackToDelete(null)}
                disabled={isDeletingMusicTrack}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMusicTrack}
                disabled={isDeletingMusicTrack}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isDeletingMusicTrack ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sim, Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Personalizar & Transmitir Aviso Rápido */}
      {customizingAnnouncement && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#181b24] border border-zinc-700/80 rounded-3xl shadow-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{customizingAnnouncement.icon}</span>
                <div>
                  <h3 className="font-bold text-white text-base">Personalizar Aviso</h3>
                  <p className="text-xs text-zinc-400">{customizingAnnouncement.categoryLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingAnnouncement(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Auto-Fill Chips according to category */}
            {customizingAnnouncement.category === 'estacionamento' && (
              <div className="space-y-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-700/70">
                <span className="text-[11px] font-bold text-orange-400 block">
                  Atalhos Rápidos de Estacionamento (Clique para inserir no texto):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Gol Branco',
                    'Corolla Prata',
                    'Onix Preto',
                    'HB20 Cinza',
                    'Placa ABC-1234',
                    'Faróis Acesos',
                    'Bloqueando Saída',
                  ].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setCustomModalScript(prev => `${prev} [${chip}]`)}
                      className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {customizingAnnouncement.category === 'fechamento' && (
              <div className="space-y-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-700/70">
                <span className="text-[11px] font-bold text-orange-400 block">
                  Tempo Restante (Clique para alterar o texto):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '15 Minutos', text: 'Informamos que a nossa loja encerrará o atendimento dentro de quinze minutos. Aproveite para finalizar suas compras e se dirigir a um de nossos caixas abertos. Agradecemos a preferência!' },
                    { label: '10 Minutos', text: 'Atenção clientes: faltam dez minutos para o encerramento das nossas atividades. Por gentileza, dirijam-se aos caixas para registrar seus produtos.' },
                    { label: '5 Minutos', text: 'Atenção senhores clientes: faltam apenas cinco minutos para o encerramento do expediente. Por gentileza, dirijam-se imediatamente aos caixas para registrar seus produtos. Boa noite!' },
                  ].map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setCustomModalScript(item.text)}
                      className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Título do Aviso</label>
              <input
                type="text"
                value={customModalTitle}
                onChange={e => setCustomModalTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Script Text */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-zinc-400">Texto que o Locutor irá Falar</label>
                <span className="text-[11px] text-zinc-500">
                  ~{Math.max(4, Math.round(customModalScript.split(/\s+/).length / 2.4))}s de fala
                </span>
              </div>
              <textarea
                rows={4}
                value={customModalScript}
                onChange={e => setCustomModalScript(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#141620] border border-zinc-700/80 text-sm text-white leading-relaxed focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Voice & Soundtrack */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Voz do Locutor</label>
                <select
                  value={selectedVoiceId}
                  onChange={e => setSelectedVoiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141620] border border-zinc-700/80 text-xs text-white"
                >
                  {voices.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Prioridade</label>
                <select
                  value={customModalPriority}
                  onChange={e => setCustomModalPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141620] border border-zinc-700/80 text-xs text-white"
                >
                  <option value="alta">★ Alta (Toca Primeiro)</option>
                  <option value="normal">Normal (Na Rotação)</option>
                </select>
              </div>
            </div>

            {/* Opção explícita no Modal: Adicionar ou não na grade da rádio */}
            <div className="p-3 rounded-xl bg-[#141620] border border-zinc-700/80 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-zinc-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={modalAddToQueue}
                  onChange={(e) => setModalAddToQueue(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                />
                <div>
                  <span className="font-bold text-white block">Adicionar à Grade da Rádio</span>
                  <span className="text-[11px] text-zinc-400">
                    {modalAddToQueue
                      ? 'O comunicado entrará na fila da rádio e ficará repetindo automaticamente entre as músicas.'
                      : 'Desmarcado: O aviso tocará apenas agora e NÃO entrará na grade de repetição.'}
                  </span>
                </div>
              </label>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                  modalAddToQueue
                    ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                    : 'text-zinc-400 bg-zinc-900 border-zinc-800'
                }`}
              >
                {modalAddToQueue ? 'Entrará na Grade' : 'Apenas Agora'}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCustomizingAnnouncement(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddAnnouncementToQueue(
                    customizingAnnouncement,
                    customModalScript,
                    customModalTitle
                  )
                }
                disabled={isGeneratingAnnouncement}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-bold transition cursor-pointer"
                title="Adicionar aviso à grade de rotação automática contínua"
              >
                + Adicionar à Grade
              </button>

              <button
                type="button"
                onClick={() =>
                  handleBroadcastAnnouncement(
                    customizingAnnouncement,
                    customModalScript,
                    customModalTitle,
                    modalAddToQueue
                  )
                }
                disabled={isGeneratingAnnouncement}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-orange-500/20"
                title={
                  modalAddToQueue
                    ? 'Tocar agora no som da loja E adicionar à grade automática da rádio'
                    : 'Tocar este aviso imediatamente no som da loja (executa somente agora e NÃO entra na grade automática)'
                }
              >
                {isGeneratingAnnouncement ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{modalAddToQueue ? 'Falar no Ar & Salvar na Grade' : 'Falar no Ar Agora'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Personalizar & Transmitir Vinheta da Loja */}
      {customizingVinheta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#181b24] border border-zinc-700/80 rounded-3xl shadow-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{customizingVinheta.icon}</span>
                <div>
                  <h3 className="font-bold text-white text-base">Personalizar Vinheta da Loja</h3>
                  <p className="text-xs text-zinc-400">{customizingVinheta.categoryLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingVinheta(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Replacement chips for store name or slogan */}
            <div className="space-y-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-700/70">
              <span className="text-[11px] font-bold text-purple-400 block">
                Atalhos Rápidos (Clique para inserir no texto da vinheta):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  config.storeName || 'Supermercado Alvorada',
                  'Economia de verdade',
                  'Qualidade garantida',
                  'Preço baixo todo dia',
                  'Ofertas imperdíveis',
                ].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setCustomVinhetaScript(prev => `${prev} ${chip}`)}
                    className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Título da Vinheta:</label>
              <input
                type="text"
                value={customVinhetaTitle}
                onChange={e => setCustomVinhetaTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#141620] border border-zinc-700/80 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Script Text */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Texto / Locução da Vinheta:
              </label>
              <textarea
                value={customVinhetaScript}
                onChange={e => setCustomVinhetaScript(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[#141620] border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                placeholder="Digite o texto que a inteligência artificial vai falar..."
              />
            </div>

            {/* Trilha Sonora & Prioridade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Trilha de Fundo:</label>
                <select
                  value={customVinhetaSoundtrack}
                  onChange={e => setCustomVinhetaSoundtrack(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#141620] border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="varejo_alegre">Varejo Alegre (Pop)</option>
                  <option value="institucional_gourmet">Institucional Gourmet</option>
                  <option value="supermercado_ofertas">Supermercado Ofertas</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Prioridade:</label>
                <select
                  value={customVinhetaPriority}
                  onChange={e => setCustomVinhetaPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#141620] border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="alta">★ Alta Prioridade</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>

            {/* Checkbox para adicionar à grade ou tocar apenas avulso */}
            <div className="p-3 rounded-xl bg-[#141620] border border-zinc-700/80">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vinhetaModalAddToQueue}
                  onChange={e => setVinhetaModalAddToQueue(e.target.checked)}
                  className="accent-purple-500 rounded mt-0.5 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Adicionar à grade de rotação automática contínua</span>
                  <span className="text-zinc-400 text-[11px]">
                    Se desmarcado, a vinheta tocará apenas no momento atual e não ficará se repetindo na programação da rádio.
                  </span>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCustomizingVinheta(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddVinhetaToQueue(
                    customizingVinheta,
                    customVinhetaScript,
                    customVinhetaTitle
                  )
                }
                disabled={isGeneratingVinheta}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-bold transition cursor-pointer"
                title="Adicionar vinheta à grade de rotação automática contínua"
              >
                + Adicionar à Grade
              </button>

              <button
                type="button"
                onClick={() =>
                  handleBroadcastVinheta(
                    customizingVinheta,
                    customVinhetaScript,
                    customVinhetaTitle,
                    vinhetaModalAddToQueue
                  )
                }
                disabled={isGeneratingVinheta}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-purple-600/20"
                title={
                  vinhetaModalAddToQueue
                    ? 'Tocar agora no som da loja E adicionar à grade automática da rádio'
                    : 'Tocar esta vinheta imediatamente no som da loja (executa somente agora e NÃO entra na grade automática)'
                }
              >
                {isGeneratingVinheta ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{vinhetaModalAddToQueue ? 'Falar no Ar & Salvar na Grade' : 'Falar no Ar Agora'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: CONFLITO DE SESSÃO ÚNICA (PLANO PRO VAREJO - 1 COMPUTADOR)  */}
      {/* ===================================================================== */}
      {sessionConflict && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b24] border border-orange-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center text-3xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30 inline-block">
                Regra de Transmissão Simultânea (Pro Varejo)
              </span>
              <h3 className="text-xl font-black text-white">
                Rádio Web em Reprodução em Outro Computador
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {sessionConflict.message}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141620] border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-300">
                💡 Como funciona a regra do plano Pro Varejo:
              </p>
              <p>
                O plano <strong>Pro Varejo</strong> é licenciado para 1 computador ou ponto de áudio transmitindo por vez. Para transmitir em <strong>mais de uma loja ou em múltiplos computadores ao mesmo tempo</strong>, conheça o plano <strong>Redes & Atacarejo</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={takeoverRadioSession}
                className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20 transition"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Transferir para este Computador</span>
              </button>

              <button
                type="button"
                onClick={clearSessionConflict}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: RECURSO RESTRITO (PLANO GRÁTIS - VINHETAS / AVISOS / UPLOAD)  */}
      {/* ===================================================================== */}
      {restrictedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b24] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-3xl">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-block">
                Recurso Exclusivo Pro Varejo & Redes
              </span>
              <h3 className="text-xl font-black text-white">
                {restrictedModal.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {restrictedModal.message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRestrictedModal(null);
                  setIsUpgradeModalOpen(true);
                }}
                className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/25 transition"
              >
                <Crown className="w-4 h-4 fill-zinc-950" />
                <span>Fazer Upgrade para o Pro</span>
              </button>
              <button
                type="button"
                onClick={() => setRestrictedModal(null)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center transition cursor-pointer"
              >
                <span>Fechar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: GERENCIADOR DE FILIAIS E MULTI-LOJAS (REDES & ATACAREJO)     */}
      {/* ===================================================================== */}
      {isStoreManagerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b24] border border-zinc-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Filiais & Lojas da Rede
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      Redes & Atacarejo
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Transmita a Rádio Web simultaneamente em cada loja da sua rede, em computadores diferentes e com nomes personalizados.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsStoreManagerOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Registered Stores */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Lojas e Filiais Cadastradas na sua Rede:
              </label>

              <div className="space-y-2">
                {(config.stores || []).map((st) => {
                  const isCurrent = activeStoreId === st.id;
                  return (
                    <div
                      key={st.id}
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-orange-500/10 border-orange-500/40 shadow-sm'
                          : 'bg-[#141620] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {st.name}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500 text-zinc-950">
                              Loja deste Computador
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-2">
                          {st.city && <span>📍 {st.city}</span>}
                          {st.slogan && <span>• "{st.slogan}"</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveStoreId(st.id);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs cursor-pointer transition shadow-sm"
                          >
                            Tocar Esta Loja Aqui
                          </button>
                        )}
                        {(config.stores || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja remover a filial "${st.name}"?`)) {
                                deleteRadioStore(st.id);
                              }
                            }}
                            className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                            title="Remover Filial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add New Branch Form */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141620] border border-zinc-800 space-y-3.5">
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-orange-400" />
                <span>Adicionar Nova Filial à Rede</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Nome da Filial *
                  </label>
                  <input
                    type="text"
                    value={newStoreName}
                    onChange={e => setNewStoreName(e.target.value)}
                    placeholder="Ex: Loja 02 - Filial Norte"
                    className="w-full px-3 py-2 bg-[#181b24] border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Cidade / Bairro
                  </label>
                  <input
                    type="text"
                    value={newStoreCity}
                    onChange={e => setNewStoreCity(e.target.value)}
                    placeholder="Ex: Joinville - SC"
                    className="w-full px-3 py-2 bg-[#181b24] border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Slogan da Loja
                  </label>
                  <input
                    type="text"
                    value={newStoreSlogan}
                    onChange={e => setNewStoreSlogan(e.target.value)}
                    placeholder="Ex: O barateiro da cidade"
                    className="w-full px-3 py-2 bg-[#181b24] border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    if (!newStoreName.trim()) {
                      alert('Digite o nome da nova filial.');
                      return;
                    }
                    try {
                      setIsCreatingStore(true);
                      await createRadioStore({
                        name: newStoreName.trim(),
                        city: newStoreCity.trim(),
                        slogan: newStoreSlogan.trim(),
                      });
                      setNewStoreName('');
                      setNewStoreCity('');
                      setNewStoreSlogan('');
                    } catch (err: any) {
                      alert(err.message || 'Erro ao criar filial.');
                    } finally {
                      setIsCreatingStore(false);
                    }
                  }}
                  disabled={isCreatingStore || !newStoreName.trim()}
                  className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-zinc-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/20 transition"
                >
                  {isCreatingStore ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cadastrando Filial...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Cadastrar Filial na Rede</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsStoreManagerOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer transition"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAN UPGRADE MODAL */}
      <PlanUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        user={user || null}
        onPlanUpgraded={(_newPlan, _credits) => {
          refreshRadioData();
        }}
      />
    </div>
  );
};
