import { CampaignType, LocutionStyle, LocutionTone, SoundtrackId, ProjectNiche } from './index.ts';

export interface NicheOption {
  id: ProjectNiche;
  label: string;
  name?: string;
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
    label: 'Supermercado & Varejo Alimentício',
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
    entityLocationPlaceholder: 'ex: Campinas - SP',
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
    pasteListPlaceholder: 'Exemplo:\nArroz Primavera 5kg — R$ 24,99\nLeite Italac 1L — R$ 4,49\nBanana-prata — R$ 3,99/kg\nSabão em pó Omo 1.6kg — De R$ 22,90 por R$ 17,99',
    emptyListMessage: 'Nenhum produto cadastrado ainda. Use o formulário acima ou cole sua lista do WhatsApp.',
  },
  {
    id: 'farmacia',
    label: 'Farmácia & Drogaria',
    badge: 'Saúde, Higiene & Bem-Estar',
    subtitle: 'Farmácias, drogarias, perfumarias e lojas de produtos naturais',
    description: 'Locuções com tom de acolhimento, cuidado com a família e credibilidade para medicamentos, vitaminas, fraldas e dermocosméticos.',
    iconName: 'Pill',
    defaultCampaign: 'ofertas_dia',
    defaultStyle: 'natural_amigavel',
    defaultTone: 'confiante',
    defaultSoundtrack: 'acustico_hortifruti',
    entityNameLabel: 'Nome da Farmácia / Drogaria',
    entityNamePlaceholder: 'ex: Drogaria Popular Farma',
    entityLocationLabel: 'Cidade / Bairro',
    entityLocationPlaceholder: 'ex: Centro - SP',
    itemsSectionTitle: 'Medicamentos & Produtos em Destaque',
    itemsSectionSubtitle: 'Adicione itens de higiene, vitaminas, dermocosméticos ou fraldas.',
    itemNameLabel: 'Nome do Medicamento / Item *',
    itemNamePlaceholder: 'Ex: Fralda Pampers Confort Sec',
    itemDetailLabel: 'Laboratório / Marca',
    itemDetailPlaceholder: 'Ex: Procter & Gamble',
    itemExtraLabel: 'Apresentação / Tamanho',
    itemExtraPlaceholder: 'Ex: Tam M com 60 tiras',
    itemValueLabel: 'Preço Especial (R$) *',
    itemValuePlaceholder: '49,90',
    allowEmptyItems: false,
    pasteListPlaceholder: 'Exemplo:\nFralda Pampers M c/60 — R$ 49,90\nProtetor Solar Sundown FPS 50 — R$ 39,90\nVitamina C Efervescente — R$ 12,90\nShampoo Dove 400ml — De R$ 24,90 por R$ 18,90',
    emptyListMessage: 'Nenhum item cadastrado ainda. Use o formulário ou cole suas ofertas de farmácia.',
  },
  {
    id: 'moda',
    label: 'Loja de Roupas, Calçados & Moda',
    badge: 'Estilo & Tendências',
    subtitle: 'Lojas de roupas, calçados, bolsas, confecções e acessórios',
    description: 'Chamadas comerciais modernas, descontraídas e sofisticadas com foco em coleções, novidades, estilo e facilidade no crediário.',
    iconName: 'Shirt',
    defaultCampaign: 'ofertas_dia',
    defaultStyle: 'elegante_institucional',
    defaultTone: 'alegre',
    defaultSoundtrack: 'batida_comercial',
    entityNameLabel: 'Nome da Loja de Moda',
    entityNamePlaceholder: 'ex: Bella Donna Moda & Estilo',
    entityLocationLabel: 'Cidade / Bairro',
    entityLocationPlaceholder: 'ex: Shopping ou Centro',
    itemsSectionTitle: 'Looks & Peças em Destaque',
    itemsSectionSubtitle: 'Adicione roupas, calçados e acessórios da coleção.',
    itemNameLabel: 'Nome da Peça / Look *',
    itemNamePlaceholder: 'Ex: Vestido Midi Estampado',
    itemDetailLabel: 'Coleção / Estilo',
    itemDetailPlaceholder: 'Ex: Alto Verão 2026',
    itemExtraLabel: 'Tamanho / Tecido',
    itemExtraPlaceholder: 'Ex: Linho P ao GG',
    itemValueLabel: 'Preço Especial (R$) *',
    itemValuePlaceholder: '89,90',
    allowEmptyItems: false,
    pasteListPlaceholder: 'Exemplo:\nVestido Floral em Linho — R$ 89,90\nCalça Jeans Feminina Modeladora — R$ 119,90\nCamisa Polo Masculina Piquet — R$ 59,90\nTênis Casual Confort — De R$ 189,90 por R$ 129,90',
    emptyListMessage: 'Nenhum look cadastrado ainda. Adicione as peças da sua vitrine.',
  },
  {
    id: 'petshop',
    label: 'Pet Shop & Agropecuária',
    badge: 'Cuidados & Amor Animal',
    subtitle: 'Pet shops, clínicas veterinárias, banho & tosa e agropecuárias',
    description: 'Tom afetuoso, alegre e dedicado ao cuidado dos animais de estimação, nutrição de qualidade e serviços especializados.',
    iconName: 'HeartHandshake',
    defaultCampaign: 'ofertas_dia',
    defaultStyle: 'popular_descontraida',
    defaultTone: 'familiar',
    defaultSoundtrack: 'varejo_alegre',
    entityNameLabel: 'Nome do Pet Shop / Agropecuária',
    entityNamePlaceholder: 'ex: Amigo Fiel Pet & Agro',
    entityLocationLabel: 'Cidade / Bairro',
    entityLocationPlaceholder: 'ex: Bairro Jardim das Flores',
    itemsSectionTitle: 'Rações, Acessórios & Serviços',
    itemsSectionSubtitle: 'Adicione rações, petiscos, antipulgas ou serviços de banho e tosa.',
    itemNameLabel: 'Produto ou Serviço Pet *',
    itemNamePlaceholder: 'Ex: Ração Premier Cães Adultos 15kg',
    itemDetailLabel: 'Marca / Espécie',
    itemDetailPlaceholder: 'Ex: Premier Pet',
    itemExtraLabel: 'Porte / Peso',
    itemExtraPlaceholder: 'Ex: Raças Médias e Grandes',
    itemValueLabel: 'Preço Oferta (R$) *',
    itemValuePlaceholder: '199,90',
    allowEmptyItems: false,
    pasteListPlaceholder: 'Exemplo:\nRação Golden Formula Cães 15kg — R$ 149,90\nAntipulgas Bravecto cães até 10kg — R$ 189,90\nAreia Sanitária Gatos 4kg — R$ 14,99\nBanho e Tosa Completo — Apenas R$ 60,00',
    emptyListMessage: 'Nenhum produto pet cadastrado ainda. Use o formulário acima.',
  },
  {
    id: 'construcao',
    label: 'Materiais de Construção & Home Center',
    badge: 'Obra, Tintas & Reforma',
    subtitle: 'Lojas de materiais elétricos, hidráulicos, tintas, ferramentas e pisos',
    description: 'Tom firme, confiável e comercial com foco em economia na obra, variedade de marcas e facilidades de pagamento para construtores e famílias.',
    iconName: 'Hammer',
    defaultCampaign: 'ofertas_dia',
    defaultStyle: 'urgente_oportunidade',
    defaultTone: 'confiante',
    defaultSoundtrack: 'batida_comercial',
    entityNameLabel: 'Nome da Loja de Construção',
    entityNamePlaceholder: 'ex: Constrular Materiais de Construção',
    entityLocationLabel: 'Cidade / Região',
    entityLocationPlaceholder: 'ex: Avenida Principal',
    itemsSectionTitle: 'Materiais & Ferramentas em Oferta',
    itemsSectionSubtitle: 'Adicione cimento, tintas, pisos, ferramentas ou metais sanitários.',
    itemNameLabel: 'Material / Ferramenta *',
    itemNamePlaceholder: 'Ex: Tinta Acrílica Fosca 18L',
    itemDetailLabel: 'Marca',
    itemDetailPlaceholder: 'Ex: Suvinil ou Coral',
    itemExtraLabel: 'Rendimento / Embalagem',
    itemExtraPlaceholder: 'Ex: Balde 18 Litros Rende Muito',
    itemValueLabel: 'Preço Obra (R$) *',
    itemValuePlaceholder: '289,90',
    allowEmptyItems: false,
    pasteListPlaceholder: 'Exemplo:\nCimento Votoran CP-II 50kg — R$ 34,90\nTinta Acrílica Coral Rende Muito 18L — R$ 269,90\nTorneira para Pia de Cozinha Flexível — R$ 79,90\nPiso Porcelanato Polido 60x60 — R$ 49,90/m²',
    emptyListMessage: 'Nenhum material cadastrado ainda. Adicione itens para a obra.',
  },
  {
    id: 'beleza',
    label: 'Cosméticos, Beleza & Barbearia',
    badge: 'Perfumaria & Estética',
    subtitle: 'Lojas de cosméticos, perfumarias, produtos para salão e barbearias',
    description: 'Comunicação envolvente, elegante e inspiradora com foco em beleza, maquiagem, perfumes e cuidados com a pele e cabelo.',
    iconName: 'Sparkles',
    defaultCampaign: 'ofertas_dia',
    defaultStyle: 'elegante_institucional',
    defaultTone: 'alegre',
    defaultSoundtrack: 'batida_comercial',
    entityNameLabel: 'Nome da Perfumaria / Loja de Beleza',
    entityNamePlaceholder: 'ex: Glamour Cosméticos & Perfumaria',
    entityLocationLabel: 'Cidade / Bairro',
    entityLocationPlaceholder: 'ex: Galeria Central',
    itemsSectionTitle: 'Cosméticos & Fragrâncias em Destaque',
    itemsSectionSubtitle: 'Adicione maquiagens, perfumes, linhas capilares e kits de presente.',
    itemNameLabel: 'Nome do Cosmético / Perfume *',
    itemNamePlaceholder: 'Ex: Kit Cronograma Capilar Profissional',
    itemDetailLabel: 'Linha / Marca',
    itemDetailPlaceholder: 'Ex: L\'Oréal ou Haskell',
    itemExtraLabel: 'Volume / Tipo',
    itemExtraPlaceholder: 'Ex: 3 Máscaras de 250g',
    itemValueLabel: 'Preço Promocional (R$) *',
    itemValuePlaceholder: '79,90',
    allowEmptyItems: false,
    pasteListPlaceholder: 'Exemplo:\nKit Cronograma Capilar Haskell — R$ 79,90\nBatom Matte Longa Duração — R$ 29,90\nPerfume Importado Eau de Parfum 100ml — R$ 199,90\nSecador Profissional 2000W — De R$ 220,00 por R$ 159,90',
    emptyListMessage: 'Nenhum cosmético cadastrado ainda. Adicione seus destaques.',
  },
  {
    id: 'restaurante',
    label: 'Restaurante, Lanchonete & Delivery',
    badge: 'Gastronomia & Sabor',
    subtitle: 'Restaurantes, hamburguerias, pizzarias, lanchonetes e cafeterias',
    description: 'Locuções convidativas que despertam o apetite, destacando pratos especiais, combos promocionais, chopp gelado e pedidos de delivery.',
    iconName: 'Utensils',
    defaultCampaign: 'ofertas_dia',
    defaultStyle: 'popular_descontraida',
    defaultTone: 'alegre',
    defaultSoundtrack: 'varejo_alegre',
    entityNameLabel: 'Nome do Restaurante / Lanchonete',
    entityNamePlaceholder: 'ex: Sabor da Praça Grill & Burger',
    entityLocationLabel: 'Cidade / Localização',
    entityLocationPlaceholder: 'ex: Delivery ou Salão',
    itemsSectionTitle: 'Pratos, Porções & Combos',
    itemsSectionSubtitle: 'Adicione lanches, refeições, bebidas e sobremesas da casa.',
    itemNameLabel: 'Prato / Combo *',
    itemNamePlaceholder: 'Ex: Combo Smash Burger Duplo + Batata',
    itemDetailLabel: 'Acompanhamentos',
    itemDetailPlaceholder: 'Ex: Batata Frita e Molho da Casa',
    itemExtraLabel: 'Serve quantas pessoas',
    itemExtraPlaceholder: 'Ex: Combo Individual',
    itemValueLabel: 'Preço Especial (R$) *',
    itemValuePlaceholder: '34,90',
    allowEmptyItems: false,
    pasteListPlaceholder: 'Exemplo:\nCombo Burger Artesanal + Refri Lata — R$ 29,90\nPizza Grande Calabresa Especial — R$ 49,90\nPorção de Picanha na Chapa 800g — R$ 89,90\nAlmoço Executivo com Sobremesa Grátis — R$ 24,90',
    emptyListMessage: 'Nenhum prato cadastrado ainda. Adicione as delícias do seu cardápio.',
  },
  {
    id: 'autopecas',
    label: 'Auto Peças & Centro Automotivo',
    badge: 'Carros, Pneus & Manutenção',
    subtitle: 'Lojas de auto peças, pneus, baterias, troca de óleo e autocenters',
    description: 'Tom seguro, ágil e técnico com foco em procedência, garantia, segurança na direção e manutenção preventiva do veículo.',
    iconName: 'Car',
    defaultCampaign: 'ofertas_dia',
    defaultStyle: 'urgente_oportunidade',
    defaultTone: 'confiante',
    defaultSoundtrack: 'batida_comercial',
    entityNameLabel: 'Nome da Auto Peças / Autocenter',
    entityNamePlaceholder: 'ex: PitStop Auto Peças & Pneus',
    entityLocationLabel: 'Cidade / Região',
    entityLocationPlaceholder: 'ex: Via Expressa',
    itemsSectionTitle: 'Peças, Acessórios & Serviços',
    itemsSectionSubtitle: 'Adicione pneus, baterias, óleo de motor ou revisões automotivas.',
    itemNameLabel: 'Peça ou Serviço *',
    itemNamePlaceholder: 'Ex: Pneu Aro 14 175/70',
    itemDetailLabel: 'Marca',
    itemDetailPlaceholder: 'Ex: Pirelli ou Goodyear',
    itemExtraLabel: 'Aplicação / Especificação',
    itemExtraPlaceholder: 'Ex: Instalação e balanceamento inclusos',
    itemValueLabel: 'Preço à Vista (R$) *',
    itemValuePlaceholder: '269,90',
    allowEmptyItems: false,
    pasteListPlaceholder: 'Exemplo:\nPneu Pirelli Aro 14 — R$ 269,90\nBateria Moura 60Ah à base de troca — R$ 389,90\nTroca de Óleo 5W30 Sintético 4L + Filtro — R$ 149,90\nKit Pastilhas de Freio Dianteiro — R$ 89,90',
    emptyListMessage: 'Nenhuma peça cadastrada ainda. Adicione itens para veículos.',
  },
  {
    id: 'otica',
    label: 'Ótica, Relojoaria & Joalheria',
    badge: 'Visão & Acessórios',
    subtitle: 'Óticas, consultórios visuais, relojoarias e joalherias',
    description: 'Comunicação requintada, cuidadosa e acolhedora destacando exames visuais, armações de grife, lentes antirreflexo e relógios.',
    iconName: 'Glasses',
    defaultCampaign: 'ofertas_dia',
    defaultStyle: 'elegante_institucional',
    defaultTone: 'confiante',
    defaultSoundtrack: 'acustico_hortifruti',
    entityNameLabel: 'Nome da Ótica / Relojoaria',
    entityNamePlaceholder: 'ex: Óticas Visão Real',
    entityLocationLabel: 'Cidade / Bairro',
    entityLocationPlaceholder: 'ex: Rua do Comércio',
    itemsSectionTitle: 'Armações, Lentes & Relógios',
    itemsSectionSubtitle: 'Adicione armações de grau, óculos de sol ou relógios.',
    itemNameLabel: 'Armação / Produto *',
    itemNamePlaceholder: 'Ex: Armação em Titânio Leve',
    itemDetailLabel: 'Grife / Marca',
    itemDetailPlaceholder: 'Ex: Ray-Ban ou Chilli Beans',
    itemExtraLabel: 'Proteção / Lentes',
    itemExtraPlaceholder: 'Ex: Proteção UV400 e Antirreflexo',
    itemValueLabel: 'Preço em até 10x (R$) *',
    itemValuePlaceholder: '299,00',
    allowEmptyItems: false,
    pasteListPlaceholder: 'Exemplo:\nArmação Receituário Leve — R$ 199,00\nÓculos de Sol Polarizado UV400 — R$ 249,00\nLentes Antirreflexo Digitais — A partir de R$ 149,00\nRelógio Esportivo à Prova d\'Água — R$ 289,00',
    emptyListMessage: 'Nenhuma armação cadastrada ainda. Use o formulário acima.',
  },
  {
    id: 'geral',
    label: 'Comércio Geral, Bazar & Variedades',
    badge: 'Utilidades & Bazar',
    subtitle: 'Lojas de variedades, bazares, papelarias, presentes e utilidades',
    description: 'Tom popular, vibrante e atrativo para lojas de preço único, bazares, brinquedos e artigos para o lar.',
    iconName: 'Store',
    defaultCampaign: 'ofertas_dia',
    defaultStyle: 'popular_descontraida',
    defaultTone: 'alegre',
    defaultSoundtrack: 'varejo_alegre',
    entityNameLabel: 'Nome da Loja / Bazar',
    entityNamePlaceholder: 'ex: Bazar Tudo de Bom Variedades',
    entityLocationLabel: 'Cidade / Bairro',
    entityLocationPlaceholder: 'ex: Bairro Central',
    itemsSectionTitle: 'Artigos & Variedades em Oferta',
    itemsSectionSubtitle: 'Adicione utilidades para o lar, brinquedos, papelaria ou presentes.',
    itemNameLabel: 'Artigo / Produto *',
    itemNamePlaceholder: 'Ex: Conjunto de Potes Herméticos 5 peças',
    itemDetailLabel: 'Material / Marca',
    itemDetailPlaceholder: 'Ex: Vidro com Trava',
    itemExtraLabel: 'Embalagem / Modelo',
    itemExtraPlaceholder: 'Ex: Tampa hermética anti-vazamento',
    itemValueLabel: 'Preço da Oferta (R$) *',
    itemValuePlaceholder: '39,90',
    allowEmptyItems: false,
    pasteListPlaceholder: 'Exemplo:\nKit 5 Potes Herméticos para Cozinha — R$ 39,90\nVaral de Chão Dobrável em Alumínio — R$ 49,90\nGarrafa Térmica Inox 1 Litro — R$ 34,90\nJogo de Lençol Casal 100% Algodão — De R$ 89,90 por R$ 59,90',
    emptyListMessage: 'Nenhum artigo cadastrado ainda. Adicione as variedades da loja.',
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

export function getCampaignsByNiche(niche: ProjectNiche = 'supermercado'): CampaignPreset[] {
  const all = Object.values(CAMPAIGN_PRESETS);
  const filtered = niche === 'supermercado'
    ? all
    : all.filter(c => c.id !== 'quarta_carne' && c.id !== 'festival_hortifruti');

  if (niche === 'supermercado') return filtered;

  const nicheInfo = getNicheInfo(niche);

  return filtered.map(c => {
    if (c.id === 'ofertas_dia') {
      return {
        ...c,
        label: `Ofertas do Dia — ${nicheInfo.name}`,
        desc: `Preços especiais e itens selecionados de ${nicheInfo.name.toLowerCase()} válidos para hoje.`,
        badge: 'Destaques do Dia',
      };
    }
    if (c.id === 'ofertas_semana') {
      return {
        ...c,
        label: `Destaques da Semana — ${nicheInfo.name}`,
        desc: `Seleção de itens em promoção e oportunidades da semana em ${nicheInfo.name.toLowerCase()}.`,
        badge: 'Semana de Ofertas',
      };
    }
    if (c.id === 'superofertas') {
      return {
        ...c,
        label: 'Super Fim de Semana',
        desc: `Promoções exclusivas de sexta a domingo para movimentar a sua loja de ${nicheInfo.name.toLowerCase()}.`,
        badge: 'Fim de Semana',
      };
    }
    if (c.id === 'queima_estoque') {
      return {
        ...c,
        label: 'Mega Queima de Estoque & Saldão',
        desc: 'Preços cortados para liquidar itens, renovar coleções e liberar espaço.',
        badge: 'Liquidação Total',
      };
    }
    if (c.id === 'divulgacao_produtos') {
      return {
        ...c,
        label: `Novidades & Marcas — ${nicheInfo.name}`,
        desc: `Divulgação das melhores marcas, novidades e lançamentos em ${nicheInfo.name.toLowerCase()}.`,
        badge: 'Novidades & Marcas',
      };
    }
    return c;
  });
}

export function getStylesByNiche(niche: ProjectNiche = 'supermercado'): StylePreset[] {
  const styles = Object.values(STYLE_PRESETS);
  if (niche !== 'supermercado') {
    return styles.map(s => {
      if (s.id === 'energetica_supermercado') {
        return {
          ...s,
          label: 'Varejo Comercial Enérgico',
          desc: 'Tom vibrante e entusiasmado com ritmo de vendas e impacto promocional.',
        };
      }
      return s;
    });
  }
  return styles;
}

export type NicheInfo = NicheOption & { name: string };

export function getNicheInfo(niche: ProjectNiche = 'supermercado'): NicheInfo {
  const opt = NICHE_OPTIONS.find(n => n.id === niche) || NICHE_OPTIONS[0];
  const shortName = opt.label.includes('&') ? opt.label.split('&')[0].trim() : opt.label;
  return { ...opt, name: shortName };
}
