import { CampaignType, LocutionStyle, LocutionTone, SoundtrackId, ProjectNiche } from './index.ts';

export interface NicheOption {
  id: ProjectNiche;
  label: string;
  badge: string;
  subtitle: string;
  description: string;
  iconName: string;
  defaultCampaign: CampaignType;
  defaultStyle: LocutionStyle;
  defaultTone: LocutionTone;
  defaultSoundtrack: SoundtrackId;
  entityNameLabel: string;
  entityNamePlaceholder: string;
  entityLocationLabel: string;
  entityLocationPlaceholder: string;
  itemsSectionTitle: string;
  itemsSectionSubtitle: string;
  itemNameLabel: string;
  itemNamePlaceholder: string;
  itemDetailLabel: string;
  itemDetailPlaceholder: string;
  itemExtraLabel: string;
  itemExtraPlaceholder: string;
  itemValueLabel?: string;
  itemValuePlaceholder?: string;
  allowEmptyItems: boolean;
  pasteListPlaceholder: string;
  emptyListMessage: string;
}

export const NICHE_OPTIONS: NicheOption[] = [
  {
    id: 'supermercado',
    label: 'Supermercado & Varejo',
    badge: 'Alimentício & Ofertas',
    subtitle: 'Supermercados, hortifrútis, açougues, atacarejos e padarias',
    description: 'Chamadas comerciais enérgicas focadas em ofertas do dia, preços baixos, queima de gôndola e encarte semanal.',
    iconName: 'ShoppingCart',
    defaultCampaign: 'ofertas_dia',
    defaultStyle: 'energetica_supermercado',
    defaultTone: 'persuasivo',
    defaultSoundtrack: 'varejo_alegre',
    entityNameLabel: 'Nome do Supermercado / Loja',
    entityNamePlaceholder: 'ex: Supermercado Alvorada',
    entityLocationLabel: 'Cidade / Bairro',
    entityLocationPlaceholder: 'ex: São Paulo - SP',
    itemsSectionTitle: 'Produtos & Preços em Oferta',
    itemsSectionSubtitle: 'Adicione os produtos em promoção com preços para o locutor anunciar.',
    itemNameLabel: 'Nome do Produto *',
    itemNamePlaceholder: 'Ex: Alcatra com Maminha',
    itemDetailLabel: 'Marca (Opcional)',
    itemDetailPlaceholder: 'Ex: Friboi',
    itemExtraLabel: 'Embalagem / Peso',
    itemExtraPlaceholder: 'Ex: pacote 5kg, 1L',
    itemValueLabel: 'Preço Oferta (R$) *',
    itemValuePlaceholder: '24,99',
    allowEmptyItems: false,
    pasteListPlaceholder: 'Exemplo:\nArroz Primavera 5kg — R$ 24,99\nLeite Italac 1L — R$ 4,49\nBanana-caturra — R$ 3,99/kg\nSabão em pó Omo 1.6kg — De R$ 22,90 por R$ 17,99',
    emptyListMessage: 'Nenhum produto cadastrado ainda. Use o formulário acima ou cole sua lista do WhatsApp.',
  },
];

export interface CampaignPreset {
  id: CampaignType;
  niche: ProjectNiche;
  label: string;
  desc: string;
  badge: string;
  suggestedStyle: LocutionStyle;
  suggestedTone: LocutionTone;
  suggestedSoundtrack: SoundtrackId;
  themeGuidelines: string;
  vocabulary: string[];
  sampleHooks: string[];
  sampleClosings: string[];
}

export interface StylePreset {
  id: LocutionStyle;
  niche: ProjectNiche | 'geral';
  label: string;
  tag: string;
  desc: string;
  speechGuidelines: string;
  cadence: string;
}

export const CAMPAIGN_PRESETS: Record<CampaignType, CampaignPreset> = {
  ofertas_dia: {
    id: 'ofertas_dia',
    niche: 'supermercado',
    label: 'Ofertas do Dia',
    desc: 'Preços especiais e imperdíveis válidos exclusivamente para o dia de hoje.',
    badge: 'Urgência Diária',
    suggestedStyle: 'energetica_supermercado',
    suggestedTone: 'persuasivo',
    suggestedSoundtrack: 'varejo_alegre',
    themeGuidelines:
      'Locução dinâmica focada na oportunidade imediata de hoje. Destaque que as ofertas são válidas apenas hoje e enquanto durarem os estoques nas gôndolas. Use chamadas enérgicas como "Só hoje!", "Oferta exclusiva do dia!", "Aproveite agora mesmo!".',
    vocabulary: ['só hoje', 'oferta do dia', 'preço exclusivo de hoje', 'apenas nesta data', 'enquanto durar o estoque de hoje'],
    sampleHooks: [
      'Atenção clientes! Chegaram as Ofertas do Dia no [Supermercado]!',
      'Só hoje! Ofertas imperdíveis preparadas especialmente para o seu dia no [Supermercado]!',
      'Alô clientes do [Supermercado]! O dia começou com preços arrasadores pra você!',
    ],
    sampleClosings: [
      'Mas atenção: ofertas válidas somente hoje ou até durarem os estoques! Corra e garanta o seu!',
      'Preço baixo no seu dia a dia é no [Supermercado]! Aproveite agora mesmo!',
    ],
  },
  ofertas_semana: {
    id: 'ofertas_semana',
    niche: 'supermercado',
    label: 'Ofertas da Semana',
    desc: 'Campanha de encarte e tabloide semanal com economia para o lar e a família.',
    badge: 'Encarte & Família',
    suggestedStyle: 'animada_promocional',
    suggestedTone: 'familiar',
    suggestedSoundtrack: 'varejo_alegre',
    themeGuidelines:
      'Show de ofertas semanais para abastecer a despensa, a geladeira e cuidar de toda a família com máxima economia. Destaque o encarte semanal da loja, variedade de setores (hortifrúti, açougue, padaria e limpeza). Tom acolhedor, vibrante e confiável.',
    vocabulary: ['show de ofertas da semana', 'encarte da semana', 'economia pra família', 'abasteça sua despensa', 'semana inteira de economia'],
    sampleHooks: [
      'Começou a Semana da Economia no [Supermercado]!',
      'Encarte novo na área! Confira as grandes ofertas da semana preparadas para a sua família no [Supermercado]!',
      'A semana começou recheada de ofertas imperdíveis para você no [Supermercado]!',
    ],
    sampleClosings: [
      'Economia de verdade a semana toda é no [Supermercado]! Encha o carrinho pagando muito menos!',
      'Venha economizar a semana inteira com a gente no [Supermercado]!',
    ],
  },
  superofertas: {
    id: 'superofertas',
    niche: 'supermercado',
    label: 'Superofertas de Fim de Semana',
    desc: 'Promoções arrasadoras para sexta, sábado e domingo, churrasco e família.',
    badge: 'Fim de Semana',
    suggestedStyle: 'energetica_supermercado',
    suggestedTone: 'alegre',
    suggestedSoundtrack: 'batida_comercial',
    themeGuidelines:
      'Foco total no fim de semana: churrasco com amigos, almoço de domingo em família, bebidas geladas, carnes nobres e guloseimas. Clima contagiante de celebração e carrinho cheio para o descanso do fim de semana.',
    vocabulary: ['super fim de semana', 'churrasco garantido', 'almoço de domingo', 'sexta, sábado e domingo', 'preços arrasadores'],
    sampleHooks: [
      'O fim de semana chegou com um festival de preços baixos no [Supermercado]!',
      'Super Fim de Semana de Ofertas no [Supermercado]! O seu churrasco e almoço de domingo com preço que cabe no bolso!',
      'Prepare o carrinho! As superofertas de fim de semana invadiram o [Supermercado]!',
    ],
    sampleClosings: [
      'Aproveite neste sábado e domingo! O melhor fim de semana para o seu bolso é no [Supermercado]!',
      'Corra e garanta o seu fim de semana com carrinho cheio e muita economia!',
    ],
  },
  quarta_carne: {
    id: 'quarta_carne',
    niche: 'supermercado',
    label: 'Quarta / Quinta da Carne & Açougue',
    desc: 'Cortes nobres, carnes selecionadas e frango com procedência e preço baixo.',
    badge: 'Carnes & Açougue',
    suggestedStyle: 'energetica_supermercado',
    suggestedTone: 'persuasivo',
    suggestedSoundtrack: 'varejo_alegre',
    themeGuidelines:
      'O tradicional festival de carnes! Destaque cortes bovinos, suínos e aves com frescor diário, inspeção de qualidade e preço imbatível de açougue.',
    vocabulary: ['quarta da carne', 'cortes selecionados', 'açougue com procedência', 'friboi', 'picanha', 'alcatra'],
    sampleHooks: [
      'Atenção apreciadores de uma boa carne! Começou a Quarta da Carne no [Supermercado]!',
      'O melhor do açougue com preço de arrasar! É o Festival da Carne no [Supermercado]!',
    ],
    sampleClosings: [
      'Carnes frescas e inspecionadas com economia de verdade é no açougue do [Supermercado]!',
    ],
  },
  festival_hortifruti: {
    id: 'festival_hortifruti',
    niche: 'supermercado',
    label: 'Festival de Hortifrúti & Feirinha',
    desc: 'Frutas, legumes e verduras fresquinhas direto do produtor rural.',
    badge: 'Hortifrúti Fresco',
    suggestedStyle: 'natural_amigavel',
    suggestedTone: 'familiar',
    suggestedSoundtrack: 'acustico_hortifruti',
    themeGuidelines:
      'Clima de feira limpa e saudável! Destaque o frescor dos produtos colhidos do campo, saúde para a família, cor e sabor nas refeições com preços leves.',
    vocabulary: ['feirinha do hortifrúti', 'direto do produtor', 'frutas selecionadas', 'saúde para sua mesa', 'fresquinho todo dia'],
    sampleHooks: [
      'Tem feira fresca hoje no [Supermercado]! Chegou o Festival de Hortifrúti!',
      'Leve saúde e muito sabor para a mesa da sua família com a Terça e Quarta Verde do [Supermercado]!',
    ],
    sampleClosings: [
      'Frutas e legumes colhidos com carinho para você economizar com saúde no [Supermercado]!',
    ],
  },
  queima_estoque: {
    id: 'queima_estoque',
    niche: 'supermercado',
    label: 'Queima de Estoque / Limpa Loja',
    desc: 'Liquidação agressiva, preços de custo e urgência máxima para zerar as gôndolas.',
    badge: 'Liquidação Extrema',
    suggestedStyle: 'urgente_oportunidade',
    suggestedTone: 'direto',
    suggestedSoundtrack: 'black_friday_urgente',
    themeGuidelines:
      'Liquidação agressiva, queima de gôndola, preços a preço de custo e urgência extrema! A sensação deve ser de oportunidade única e imediata que vai acabar em minutos.',
    vocabulary: ['queima de estoque', 'preço de custo', 'liquidação total', 'pra zerar tudo', 'últimas unidades', 'pegou levou'],
    sampleHooks: [
      'Parou tudo! Começou a Mega Queima de Estoque no [Supermercado]!',
      'Atenção clientes: É pra zerar tudo! Queima de Estoque com preços de custo no [Supermercado]!',
    ],
    sampleClosings: [
      'São as últimas unidades com desconto de fábrica! Corra antes que acabe tudo no [Supermercado]!',
    ],
  },
  aniversario: {
    id: 'aniversario',
    niche: 'supermercado',
    label: 'Aniversário do Supermercado',
    desc: 'Festa de aniversário da loja com grandes marcas, prêmios e show de ofertas.',
    badge: 'Festa & Prêmios',
    suggestedStyle: 'animada_promocional',
    suggestedTone: 'festivo',
    suggestedSoundtrack: 'varejo_alegre',
    themeGuidelines:
      'Clima de festa de aniversário! A festa é da loja, mas quem ganha o presentão de economia no carrinho é o cliente.',
    vocabulary: ['aniversário premiado', 'a festa é nossa o presente é seu', 'mês de aniversário', 'show de ofertas comemorativas'],
    sampleHooks: [
      'É mês de festa no [Supermercado]! O aniversário é nosso, mas o presentão de economia é todo seu!',
    ],
    sampleClosings: [
      'Venha comemorar com a gente e encher o carrinho com os maiores descontos do ano no [Supermercado]!',
    ],
  },
  inauguracao: {
    id: 'inauguracao',
    niche: 'supermercado',
    label: 'Inauguração & Reinauguração',
    desc: 'Apresentação de nova loja, ampliação ou reforma moderna para a cidade.',
    badge: 'Nova Loja',
    suggestedStyle: 'energetica_supermercado',
    suggestedTone: 'festivo',
    suggestedSoundtrack: 'batida_comercial',
    themeGuidelines:
      'Grande celebração de nova loja! Destaque a estrutura moderna, corredores amplos, estacionamento, variedade de produtos e preços especiais de boas-vindas.',
    vocabulary: ['grande inauguração', 'nova loja', 'estrutura moderna', 'você é nosso convidado de honra', 'portas abertas'],
    sampleHooks: [
      'A cidade comemora! É a Grande Inauguração da nova loja do [Supermercado]!',
    ],
    sampleClosings: [
      'Venha conhecer a loja mais moderna da região! Estamos esperando por você no [Supermercado]!',
    ],
  },
  black_friday: {
    id: 'black_friday',
    niche: 'supermercado',
    label: 'Black Friday / Varejo Black',
    desc: 'Descontos agressivos cortados pela metade e loucura de compras na loja.',
    badge: 'Black Friday',
    suggestedStyle: 'urgente_oportunidade',
    suggestedTone: 'direto',
    suggestedSoundtrack: 'black_friday_urgente',
    themeGuidelines:
      'Black Friday de supermercado com descontos agressivos! Ritmo veloz, urgência pulsante e economia histórica.',
    vocabulary: ['black friday de verdade', 'preços cortados pela metade', 'loucura de ofertas', 'desconto arrasador'],
    sampleHooks: [
      'Atenção clientes: Chegou a Black Friday no [Supermercado]! Os preços despencaram!',
    ],
    sampleClosings: [
      'É Black Friday de verdade! Corra para o [Supermercado] antes que o estoque esgote!',
    ],
  },
  datas_comemorativas: {
    id: 'datas_comemorativas',
    niche: 'supermercado',
    label: 'Datas Comemorativas (Páscoa, Mães, Natal)',
    desc: 'Campanhas temáticas para datas especiais do calendário de varejo.',
    badge: 'Calendário Festivo',
    suggestedStyle: 'animada_promocional',
    suggestedTone: 'festivo',
    suggestedSoundtrack: 'varejo_alegre',
    themeGuidelines:
      'Celebre datas marcantes com produtos temáticos (Páscoa, Dia das Mães, Festa Junina, Dia dos Pais, Natal e Ano Novo).',
    vocabulary: ['mesa farta', 'celebre com amor', 'presenteie quem você ama', 'ceia inesquecível'],
    sampleHooks: [
      'A data mais especial do ano merece a maior economia! Confira as ofertas especiais do [Supermercado]!',
    ],
    sampleClosings: [
      'Tudo para a sua comemoração inesquecível está aqui no [Supermercado]!',
    ],
  },
  divulgacao_produtos: {
    id: 'divulgacao_produtos',
    niche: 'supermercado',
    label: 'Divulgação de Produtos & Marcas',
    desc: 'Apresentação comercial detalhada de marcas parceiras e lançamentos.',
    badge: 'Lançamentos',
    suggestedStyle: 'popular_descontraida',
    suggestedTone: 'persuasivo',
    suggestedSoundtrack: 'varejo_alegre',
    themeGuidelines:
      'Destaque marcas conceituadas parceiras da loja, ressaltando procedência, qualidade e custo-benefício.',
    vocabulary: ['grandes marcas', 'qualidade comprovada', 'experimente e comprove', 'sua melhor escolha'],
    sampleHooks: [
      'Destaque especial nas gôndolas do [Supermercado]! Conheça as melhores opções com qualidade garantida!',
    ],
    sampleClosings: [
      'Qualidade e preço baixo andam juntos no [Supermercado]! Leve para casa!',
    ],
  },
  institucional: {
    id: 'institucional',
    niche: 'supermercado',
    label: 'Institucional & Clube de Benefícios',
    desc: 'Cartão da loja, clube de fidelidade, horário de funcionamento e WhatsApp.',
    badge: 'Institucional',
    suggestedStyle: 'elegante_institucional',
    suggestedTone: 'confiante',
    suggestedSoundtrack: 'institucional_gourmet',
    themeGuidelines:
      'Comunicação oficial da empresa para estreitar o relacionamento com os clientes: vantagens do clube, aplicativo, cartão da loja e serviços.',
    vocabulary: ['clube de vantagens', 'descontos exclusivos', 'facilidade no cartão', 'tradição e confiança'],
    sampleHooks: [
      'Você já faz parte do nosso Clube de Vantagens no [Supermercado]? Descontos exclusivos esperando por você!',
    ],
    sampleClosings: [
      'Supermercado [Supermercado], sempre perto de você com carinho e tradição!',
    ],
  },
  personalizada: {
    id: 'personalizada',
    niche: 'supermercado',
    label: 'Campanha Personalizada',
    desc: 'Configure livremente o seu objetivo sob medida.',
    badge: 'Sob Medida',
    suggestedStyle: 'energetica_supermercado',
    suggestedTone: 'persuasivo',
    suggestedSoundtrack: 'varejo_alegre',
    themeGuidelines:
      'Adapte a linguagem estritamente aos objetivos e instruções personalizadas fornecidas pelo anunciante.',
    vocabulary: ['ofertas imperdíveis', 'preço baixo', 'economia garantida', 'aproveite agora'],
    sampleHooks: [
      'Atenção clientes! Confira os destaques especiais preparados para você no [Supermercado]!',
    ],
    sampleClosings: [
      'Aproveite agora mesmo no [Supermercado]! Economia garantida para você!',
    ],
  },
};

export const STYLE_PRESETS: Record<LocutionStyle, StylePreset> = {
  energetica_supermercado: {
    id: 'energetica_supermercado',
    niche: 'supermercado',
    label: 'Energética Supermercado',
    tag: 'Clássico Varejo',
    desc: 'Locução vibrante e clássica de rádio de ofertas com alta energia comercial.',
    speechGuidelines:
      'Locutor de rádio comercial de varejo clássico: tom entusiasmado, projeção vocal marcante, ritmo dinâmico com ênfase nas marcas e preços reduzidos.',
    cadence: 'Rápida e vibrante (2.8 a 3.0 palavras por segundo)',
  },
  animada_promocional: {
    id: 'animada_promocional',
    niche: 'supermercado',
    label: 'Animada e Promocional',
    tag: 'Alegre & Dinâmico',
    desc: 'Tom alegre, dinâmico e convidativo para compras em família.',
    speechGuidelines:
      'Voz calorosa, simpática, alto astral e convidativa. Foco em compras em família e ambiente alegre.',
    cadence: 'Moderada e ritmada (2.5 a 2.7 palavras por segundo)',
  },
  natural_amigavel: {
    id: 'natural_amigavel',
    niche: 'supermercado',
    label: 'Natural e Amigável',
    tag: 'Acolhedor',
    desc: 'Voz acolhedora e próxima, tom familiar de atendimento de vizinhança.',
    speechGuidelines:
      'Conversa próxima e amigável, como um atendente gentil ou vizinho de confiança. Foco em carinho e proximidade.',
    cadence: 'Suave e natural (2.3 a 2.5 palavras por segundo)',
  },
  urgente_oportunidade: {
    id: 'urgente_oportunidade',
    niche: 'supermercado',
    label: 'Urgente / Oportunidade',
    tag: 'Oferta Relâmpago',
    desc: 'Foco em ofertas relâmpago imperdíveis que vão acabar a qualquer momento.',
    speechGuidelines:
      'Voz de alerta, ritmo rápido, senso urgente de oportunidade imediata. Frases curtas e diretas.',
    cadence: 'Acelerada e incisiva (3.0 a 3.2 palavras por segundo)',
  },
  elegante_institucional: {
    id: 'elegante_institucional',
    niche: 'supermercado',
    label: 'Elegante e Institucional',
    tag: 'Premium / Clube',
    desc: 'Voz sóbria e refinada para marcas gourmet, vinhos, cortes nobres e clube de benefícios.',
    speechGuidelines:
      'Dicção perfeita, tom aveludado, refinado e sóbrio. Ideal para fidelização, adega, empório gourmet e comunicados da loja.',
    cadence: 'Calma e pausada (2.2 a 2.4 palavras por segundo)',
  },
  popular_descontraida: {
    id: 'popular_descontraida',
    niche: 'supermercado',
    label: 'Popular e Descontraída',
    tag: 'Popular & Direto',
    desc: 'Linguagem solta, muito próxima e direta, excelente para feirões e atacarejos.',
    speechGuidelines:
      'Linguagem direta e coloquial do povo. Energia contagiante de feira livre e atacarejo com preços arrasadores.',
    cadence: 'Descontraída e fluida (2.6 a 2.8 palavras por segundo)',
  },
};

export function getCampaignsByNiche(_niche: ProjectNiche = 'supermercado'): CampaignPreset[] {
  return Object.values(CAMPAIGN_PRESETS);
}

export function getStylesByNiche(_niche: ProjectNiche = 'supermercado'): StylePreset[] {
  return Object.values(STYLE_PRESETS);
}

export function getNicheInfo(_niche: ProjectNiche = 'supermercado'): NicheOption {
  return NICHE_OPTIONS[0];
}
