import {
  ProjectNiche,
  RadioVinhetaItem,
  QuickRadioTemplate,
  QuickAnnouncementItem,
  RadioQueueItem,
  Project,
  ProductItem,
  SoundtrackOption,
  RadioPlaylist,
  RadioMusicTrack,
  SoundtrackId,
} from '../types/index.ts';

export function getNicheSlogan(niche: ProjectNiche = 'supermercado'): string {
  switch (niche) {
    case 'moda':
      return 'A rádio da moda, estilo e das melhores tendências para você!';
    case 'farmacia':
      return 'A sua rádio em saúde, cuidado e bem-estar todos os dias!';
    case 'petshop':
      return 'A rádio do seu melhor amigo! Amor, nutrição e carinho para o seu pet.';
    case 'construcao':
      return 'A rádio da sua obra! Do alicerce ao acabamento com a maior economia.';
    case 'beleza':
      return 'A rádio da sua beleza, perfumes e autocuidado diário!';
    case 'restaurante':
      return 'A rádio do melhor sabor, música boa e momentos deliciosos!';
    case 'autopecas':
      return 'A rádio do seu carro! Peças com procedência e segurança na estrada.';
    case 'otica':
      return 'A rádio do seu olhar! Saúde visual e armações modernas para você.';
    case 'geral':
      return 'A rádio das melhores ofertas, variedade e qualidade para você!';
    case 'supermercado':
    default:
      return 'A rádio da economia e das melhores ofertas para a sua família!';
  }
}

export function getVinhetasByNiche(niche: ProjectNiche = 'supermercado'): RadioVinhetaItem[] {
  // Setores específicos de cada ramo de atividade
  const sectorsByNiche: Record<ProjectNiche, RadioVinhetaItem[]> = {
    supermercado: [
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
    ],
    moda: [
      {
        id: 'vinheta-setor-moda-fem',
        category: 'setores',
        categoryLabel: 'Departamentos da Loja',
        icon: '👗',
        title: 'Moda Feminina — Vestidos, Saias & Blusas Elegantes',
        badge: 'Moda Feminina',
        description: 'Destaque para looks femininos modernos e elegantes.',
        scriptTemplate:
          'Vestidos, blusas, saias e as maiores tendências da estação para valorizar o seu estilo. Venha conferir o setor de moda feminina da {loja}!',
        soundtrackId: 'institucional_gourmet',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-moda-masc',
        category: 'setores',
        categoryLabel: 'Departamentos da Loja',
        icon: '👔',
        title: 'Moda Masculina & Calçados — Estilo & Conforto',
        badge: 'Moda Masculina',
        description: 'Destaque para camisas, calças e calçados masculinos.',
        scriptTemplate:
          'Camisas, calças jeans, bermudas e calçados com caimento impecável e muito conforto para o homem moderno. Venha conferir na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-provadores',
        category: 'setores',
        categoryLabel: 'Departamentos da Loja',
        icon: '🛍️',
        title: 'Provadores Confortáveis & Atendimento Especial',
        badge: 'Provadores',
        description: 'Convida os clientes a experimentarem peças no provador.',
        scriptTemplate:
          'Nossos provadores são amplos, confortáveis e com espelhos perfeitos. Experimente o seu novo look favorito aqui na {loja}!',
        soundtrackId: 'institucional_gourmet',
        defaultPriority: 'normal',
      },
      {
        id: 'vinheta-setor-acessorios',
        category: 'setores',
        categoryLabel: 'Departamentos da Loja',
        icon: '✨',
        title: 'Acessórios, Bolsas & Tendências da Estação',
        badge: 'Acessórios',
        description: 'Divulga bolsas, cintos e peças para compor looks.',
        scriptTemplate:
          'Dê o toque final no seu visual! Bolsas, cintos e acessórios modernos com condições imperdíveis para você brilhar na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
    ],
    farmacia: [
      {
        id: 'vinheta-setor-medicamentos',
        category: 'setores',
        categoryLabel: 'Setores da Drogaria',
        icon: '💊',
        title: 'Balcão Farmacêutico — Genéricos & Medicamentos',
        badge: 'Farmácia',
        description: 'Destaca a confiança e orientação farmacêutica.',
        scriptTemplate:
          'Medicamentos de procedência com os maiores descontos em genéricos e atendimento farmacêutico de confiança na {loja}!',
        soundtrackId: 'institucional_gourmet',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-dermocosmeticos',
        category: 'setores',
        categoryLabel: 'Setores da Drogaria',
        icon: '✨',
        title: 'Dermocosméticos, Skincare & Proteção Solar',
        badge: 'Dermo & Beleza',
        description: 'Linha completa para cuidados com a pele.',
        scriptTemplate:
          'Protetores solares, hidratantes, séruns e cuidados especiais para a sua pele com as marcas mais recomendadas na {loja}!',
        soundtrackId: 'institucional_gourmet',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-higiene-bebe',
        category: 'setores',
        categoryLabel: 'Setores da Drogaria',
        icon: '👶',
        title: 'Higiene Diária & Linha Infantil para seu Bebê',
        badge: 'Linha Bebê',
        description: 'Fraldas, sabonetes e linha infantil com preço baixo.',
        scriptTemplate:
          'Fraldas descartáveis, lenços umedecidos e produtos suaves para o seu bebê com a maior economia na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
      {
        id: 'vinheta-setor-suplementos',
        category: 'setores',
        categoryLabel: 'Setores da Drogaria',
        icon: '🌿',
        title: 'Suplementos, Vitaminas & Saúde da Família',
        badge: 'Vida Saudável',
        description: 'Mais imunidade e disposição para a rotina.',
        scriptTemplate:
          'Mais energia, disposição e imunidade para o seu dia a dia! Venha conferir as vitaminas e suplementos da {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
    ],
    petshop: [
      {
        id: 'vinheta-setor-racoes',
        category: 'setores',
        categoryLabel: 'Setores do Pet Shop',
        icon: '🐕',
        title: 'Nutrição Animal — Rações Premium & Especiais',
        badge: 'Rações',
        description: 'Rações de alta qualidade para cães e gatos.',
        scriptTemplate:
          'As melhores marcas de ração, nutrição balanceada e sabor que o seu melhor amigo merece estão no {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-petiscos',
        category: 'setores',
        categoryLabel: 'Setores do Pet Shop',
        icon: '🦴',
        title: 'Petiscos, Bifinhos & Brinquedos Divertidos',
        badge: 'Petiscos & Mimos',
        description: 'Mimos saborosos e brinquedos para alegrar o pet.',
        scriptTemplate:
          'Mime quem você ama com brinquedos divertidos, arranhadores e petiscos crocantes no {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-banhotosa',
        category: 'setores',
        categoryLabel: 'Setores do Pet Shop',
        icon: '✂️',
        title: 'Banho, Tosa & Estética Animal com Carinho',
        badge: 'Banho e Tosa',
        description: 'Serviço especializado de higiene e cuidados animais.',
        scriptTemplate:
          'Deixe seu pet limpinho, cheiroso e com pelos macios e brilhantes com a equipe de banho e tosa do {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
      {
        id: 'vinheta-setor-farmacia-pet',
        category: 'setores',
        categoryLabel: 'Setores do Pet Shop',
        icon: '🩺',
        title: 'Farmácia Veterinária & Antipulgas',
        badge: 'Saúde Animal',
        description: 'Medicamentos, vermífugos e coleiras antipulgas.',
        scriptTemplate:
          'Coleiras, vermífugos, remédios e cuidados com a saúde e higiene do seu pet no balcão veterinário do {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
    ],
    construcao: [
      {
        id: 'vinheta-setor-basico',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '🧱',
        title: 'Do Básico ao Alicerce — Cimento & Argamassa',
        badge: 'Obra Bruta',
        description: 'Cimento, tijolos e agregados com preço direto de fábrica.',
        scriptTemplate:
          'Cimento, argamassa, ferro, tijolos e impermeabilizantes com os menores preços da cidade na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-tintas',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '🎨',
        title: 'Tintas, Cores & Acabamentos Decorativos',
        badge: 'Tintas & Cores',
        description: 'Tintas acrílicas e acabamentos para sua casa.',
        scriptTemplate:
          'Tintas acrílicas, vernizes, texturas e pincéis para transformar seus ambientes na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-eletrica-hidraulica',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '⚡',
        title: 'Elétrica, Iluminação & Hidráulica Segura',
        badge: 'Elétrica & Tubos',
        description: 'Fios, lâmpadas LED, tubos e conexões.',
        scriptTemplate:
          'Tubos, conexões, fios, lâmpadas de LED e disjuntores com segurança e procedência na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
      {
        id: 'vinheta-setor-ferramentas',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '🔨',
        title: 'Ferramentas Profissionais & Entrega na Obra',
        badge: 'Ferramentas',
        description: 'Ferramentas elétricas e entrega rápida no canteiro.',
        scriptTemplate:
          'Ferramentas manuais e elétricas de alta durabilidade para profissionais e quem ama construir na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
    ],
    beleza: [
      {
        id: 'vinheta-setor-make',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '💄',
        title: 'Maquiagem & Make dos Sonhos',
        badge: 'Maquiagem',
        description: 'Bases, batons e corretivos de alta performance.',
        scriptTemplate:
          'Bases, batons, corretivos e pincéis de alta performance para realçar a sua beleza na {loja}!',
        soundtrackId: 'institucional_gourmet',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-cabelos',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '💇‍♀️',
        title: 'Tratamento Capilar & Cronograma Capilar',
        badge: 'Cabelos Radiantes',
        description: 'Máscaras e xampus profissionais para cabelos.',
        scriptTemplate:
          'Máscaras reconstrutoras, óleos nutritivos e xampus profissionais para deixar seus fios radiantes na {loja}!',
        soundtrackId: 'institucional_gourmet',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-perfumaria',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '🌺',
        title: 'Perfumaria Fina & Fragrâncias Importadas',
        badge: 'Perfumaria',
        description: 'Fragrâncias inesquecíveis e importadas.',
        scriptTemplate:
          'Perfumes importados e fragrâncias marcantes e inesquecíveis com condições imperdíveis na {loja}!',
        soundtrackId: 'institucional_gourmet',
        defaultPriority: 'normal',
      },
      {
        id: 'vinheta-setor-skincare',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '✨',
        title: 'Skincare, Hidratação & Cuidados com a Pele',
        badge: 'Skincare',
        description: 'Hidratação profunda e rotina de beleza.',
        scriptTemplate:
          'Água micelar, tônicos, ácidos e hidratação profunda para você se cuidar todos os dias na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
    ],
    restaurante: [
      {
        id: 'vinheta-setor-pizzas',
        category: 'setores',
        categoryLabel: 'Especialidades',
        icon: '🍕',
        title: 'Pizzas Artesanais & Forno a Lenha',
        badge: 'Pizzas',
        description: 'Massas crocantes e queijo derretido no capricho.',
        scriptTemplate:
          'Massas crocantes, recheios generosos e queijo derretido no capricho esperando por você no {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-burgers',
        category: 'setores',
        categoryLabel: 'Especialidades',
        icon: '🍔',
        title: 'Hambúrgueres Artesanais & Batata Crocante',
        badge: 'Burgers & Fritas',
        description: 'Blend suculento feito na hora.',
        scriptTemplate:
          'Aquele blend suculento com bacon crocante e batata frita quentinha esperando por você no balcão e no delivery do {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-delivery',
        category: 'setores',
        categoryLabel: 'Especialidades',
        icon: '🛵',
        title: 'Delivery Rápido — Peça pelo WhatsApp',
        badge: 'Delivery',
        description: 'Receba pratos quentinhos em casa.',
        scriptTemplate:
          'Peça agora pelo WhatsApp ou aplicativo e saboreie o melhor da gastronomia no conforto do seu lar com o {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
      {
        id: 'vinheta-setor-sobremesas',
        category: 'setores',
        categoryLabel: 'Especialidades',
        icon: '🍰',
        title: 'Sobremesas Irresistíveis & Cafeteria',
        badge: 'Sobremesas',
        description: 'Doces artesanais e cafés especiais.',
        scriptTemplate:
          'Finalize a sua refeição com doces irresistíveis, petit gâteau e cafés especiais no {loja}!',
        soundtrackId: 'institucional_gourmet',
        defaultPriority: 'normal',
      },
    ],
    autopecas: [
      {
        id: 'vinheta-setor-baterias',
        category: 'setores',
        categoryLabel: 'Setores Automotivos',
        icon: '🔋',
        title: 'Baterias com Garantia & Linha Elétrica',
        badge: 'Baterias',
        description: 'Baterias com instalação e teste gratuitos.',
        scriptTemplate:
          'Baterias das melhores marcas com instalação e teste gratuitos na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-oleo',
        category: 'setores',
        categoryLabel: 'Setores Automotivos',
        icon: '🛢️',
        title: 'Troca de Óleo, Filtros & Lubrificantes',
        badge: 'Troca de Óleo',
        description: 'Lubrificantes de alta performance para o motor.',
        scriptTemplate:
          'Óleos lubrificantes de alta performance e filtros de motor das melhores marcas com preço especial na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-freios',
        category: 'setores',
        categoryLabel: 'Setores Automotivos',
        icon: '🛞',
        title: 'Pneus, Freios & Suspensão Segura',
        badge: 'Freios & Pneus',
        description: 'Pastilhas de freio e pneus para rodar com segurança.',
        scriptTemplate:
          'Viaje com tranquilidade com pastilhas de freio e amortecedores novos instalados com garantia total na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
      {
        id: 'vinheta-setor-moto',
        category: 'setores',
        categoryLabel: 'Setores Automotivos',
        icon: '🏍️',
        title: 'Acessórios Automotivos & Linha Moto',
        badge: 'Linha Moto',
        description: 'Capacetes, travas e acessórios para veículos.',
        scriptTemplate:
          'Capacetes, capas, travas e peças mecânicas completas para motociclistas na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
    ],
    otica: [
      {
        id: 'vinheta-setor-armacoes',
        category: 'setores',
        categoryLabel: 'Setores da Ótica',
        icon: '👓',
        title: 'Armações de Grau — Leves & Design Moderno',
        badge: 'Armações de Grau',
        description: 'Modelos leves e resistentes com design atual.',
        scriptTemplate:
          'Modelos leves, confortáveis e elegantes que combinam perfeitamente com o seu rosto na {loja}!',
        soundtrackId: 'institucional_gourmet',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-oculos-sol',
        category: 'setores',
        categoryLabel: 'Setores da Ótica',
        icon: '🕶️',
        title: 'Óculos de Sol com Proteção UV Completa',
        badge: 'Óculos Solares',
        description: 'Estilo e proteção contra raios UV.',
        scriptTemplate:
          'Estilo e proteção máxima contra os raios solares para você curtir os dias com muito charme na {loja}!',
        soundtrackId: 'institucional_gourmet',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-lentes',
        category: 'setores',
        categoryLabel: 'Setores da Ótica',
        icon: '🔍',
        title: 'Lentes Digitais Antirreflexo & Filtro Azul',
        badge: 'Lentes Digitais',
        description: 'Descanso visual para uso de computadores e telas.',
        scriptTemplate:
          'Mais conforto e descanso para seus olhos ao trabalhar no celular e no computador com as lentes digitais da {loja}!',
        soundtrackId: 'institucional_gourmet',
        defaultPriority: 'normal',
      },
      {
        id: 'vinheta-setor-exames',
        category: 'setores',
        categoryLabel: 'Setores da Ótica',
        icon: '🩺',
        title: 'Exames de Vista & Assistência Técnica',
        badge: 'Assistência Técnica',
        description: 'Ajuste de armações e apoio técnico para a visão.',
        scriptTemplate:
          'Traga sua receita oftálmica e monte seus óculos com garantia e assistência técnica na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
    ],
    geral: [
      {
        id: 'vinheta-setor-destaques',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '🌟',
        title: 'Destaques da Semana com Preços Imperdíveis',
        badge: 'Destaques',
        description: 'Os itens mais vendidos com preços baixos.',
        scriptTemplate:
          'Os produtos mais procurados com descontos imperdíveis esperando por você na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-variedade',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '🛍️',
        title: 'Variedade Completa para o seu Dia a Dia',
        badge: 'Variedade',
        description: 'Ampla gama de produtos com atendimento atencioso.',
        scriptTemplate:
          'Tudo o que você precisa no mesmo lugar com preço justo e atendimento atencioso na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'alta',
      },
      {
        id: 'vinheta-setor-parcelamento',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '💳',
        title: 'Cartão da Loja & Condições de Parcelamento',
        badge: 'Parcelamento',
        description: 'Facilidade de pagamento no cartão.',
        scriptTemplate:
          'Aproveite para parcelar suas compras no cartão com condições que cabem no seu bolso na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
      {
        id: 'vinheta-setor-lancamentos',
        category: 'setores',
        categoryLabel: 'Setores da Loja',
        icon: '📦',
        title: 'Lançamentos & Novidades em Nossos Corredores',
        badge: 'Novidades',
        description: 'Itens que acabam de chegar à loja.',
        scriptTemplate:
          'Confira as novidades que acabam de chegar em nossos corredores aqui na {loja}!',
        soundtrackId: 'varejo_alegre',
        defaultPriority: 'normal',
      },
    ],
  };

  const sectors = sectorsByNiche[niche] || sectorsByNiche.supermercado;
  const slogan = getNicheSlogan(niche);

  const isFemArticle = niche === 'farmacia' || niche === 'moda' || niche === 'construcao' || niche === 'otica';
  const article = isFemArticle ? 'à' : 'ao';

  return [
    // 📻 Identificação da Rádio (3 itens)
    {
      id: 'vinheta-radio-principal',
      category: 'identificacao',
      categoryLabel: 'Identificação da Rádio',
      icon: '📻',
      title: 'Identificação Oficial da Rádio da Loja',
      badge: 'Rádio Oficial',
      description: 'Apresenta a rádio interna da loja para os clientes em compras.',
      scriptTemplate:
        `Você está sintonizado na Rádio {loja}! ${slogan}`,
      soundtrackId: 'varejo_alegre',
      defaultPriority: 'alta',
    },
    {
      id: 'vinheta-radio-slogan',
      category: 'identificacao',
      categoryLabel: 'Identificação da Rádio',
      icon: '✨',
      title: 'Slogan & Vantagens Exclusivas',
      badge: 'Slogan da Loja',
      description: 'Reforça a marca e as vantagens para os clientes.',
      scriptTemplate:
        `Rádio {loja}! ${slogan} Aqui você compra com qualidade e atendimento de primeira!`,
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
        'No ar, a Rádio {loja}! A seleção musical perfeita para embalar o seu dia com ofertas imperdíveis em todos os setores.',
      soundtrackId: 'varejo_alegre',
      defaultPriority: 'normal',
    },

    // 🏪 Institucional & Boas-Vindas (3 itens)
    {
      id: 'vinheta-boas-vindas',
      category: 'institucional',
      categoryLabel: 'Institucional',
      icon: '🛒',
      title: 'Boas-Vindas com Carinho ao Cliente',
      badge: 'Boas-Vindas',
      description: 'Dá as boas-vindas e deseja uma excelente experiência de compras.',
      scriptTemplate:
        `Seja muito bem-vindo ${article} {loja}! É um prazer imenso ter você aqui com a gente. Aproveite nossas promoções e tenha uma excelente experiência!`,
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
        'Obrigado pela sua preferência em comprar na {loja}! Nossa equipe trabalha diariamente com muito carinho para levar sempre o melhor até você.',
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
        '{loja}: aqui a qualidade máxima anda de mãos dadas com o preço justo! Obrigado por escolher a nossa casa.',
      soundtrackId: 'institucional_gourmet',
      defaultPriority: 'normal',
    },

    // 🏷️ Setores Especializados do Ramo (4 itens)
    ...sectors,

    // 💳 Clube & Vantagens (2 itens)
    {
      id: 'vinheta-clube-cpf',
      category: 'clube',
      categoryLabel: 'Clube & Vantagens',
      icon: '💳',
      title: 'Clube de Vantagens & Atendimento no Caixa',
      badge: 'Clube da Loja',
      description: 'Lembra os clientes de consultar os descontos e vantagens especiais.',
      scriptTemplate:
        'Você já garantiu seus descontos exclusivos hoje? Ao passar no caixa, consulte os benefícios e as vantagens preparadas para você na {loja}!',
      soundtrackId: 'varejo_alegre',
      defaultPriority: 'alta',
    },
    {
      id: 'vinheta-delivery-whatsapp',
      category: 'clube',
      categoryLabel: 'Clube & Vantagens',
      icon: '📱',
      title: 'Atendimento & Pedidos pelo WhatsApp',
      badge: 'Atendimento Rápido',
      description: 'Informa sobre o canal de compras práticas sem sair de casa.',
      scriptTemplate:
        'Sabia que você pode fazer suas compras pelo WhatsApp? Mande sua mensagem para o nosso número oficial e receba atendimento exclusivo com a {loja}!',
      soundtrackId: 'varejo_alegre',
      defaultPriority: 'normal',
    },

    // ⚡ Sweepers / Carimbos Rápidos (3 itens)
    {
      id: 'vinheta-sweeper-oferta',
      category: 'sweepers',
      categoryLabel: 'Carimbos Rápidos (Sweepers)',
      icon: '⚡',
      title: 'Carimbo Curto — Economia Garantida',
      badge: 'Carimbo 5s',
      description: 'Passagem ultracurta para carimbar o nome da loja entre músicas.',
      scriptTemplate:
        '{loja}! Lugar de comprar bem e com total satisfação.',
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
        'Fique ligado! As melhores oportunidades estão aqui na {loja}!',
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
        'Você está ouvindo a Rádio {loja}! Música de qualidade e ofertas o dia todo.',
      soundtrackId: 'varejo_alegre',
      defaultPriority: 'normal',
    },
  ];
}

export function getLiveTemplatesByNiche(niche: ProjectNiche = 'supermercado'): QuickRadioTemplate[] {
  const commonUniversal: QuickRadioTemplate[] = [
    {
      id: 'chamada-estacionamento',
      label: '🚗 Chamada de Estacionamento',
      badge: 'Comunicado',
      type: 'comunicado',
      title: 'Comunicado — Solicitação de Comparecimento ao Estacionamento',
      script:
        'Atenção senhor cliente proprietário do veículo estacionado no pátio da loja, solicitamos por gentileza o seu comparecimento imediato ao balcão de atendimento na entrada. Obrigado!',
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

  switch (niche) {
    case 'moda':
      return [
        {
          id: 'desfile-moda',
          label: '👗 Desfile de Ofertas',
          badge: 'Nova Coleção',
          type: 'oferta',
          title: 'Destaque — Peças Selecionadas no Provador',
          script:
            'Atenção clientes! Peças selecionadas com até quarenta por cento de desconto na nossa arara de novidades! Aproveite para renovar seu guarda-roupa com o melhor da moda aqui na nossa loja!',
          soundtrackId: 'institucional_gourmet',
        },
        {
          id: 'relampago-calcados',
          label: '👠 Oferta Relâmpago Calçados & Roupas',
          badge: 'Oferta Relâmpago',
          type: 'relampago',
          title: 'Oferta Relâmpago — Desconto na Arara de Tendências',
          script:
            'Atenção clientes da loja! Só pelos próximos trinta minutos: toda a linha de calçados e calças selecionadas com desconto exclusivo no caixa! Corra e garanta o seu look completo agora mesmo!',
          soundtrackId: 'black_friday_urgente',
        },
        {
          id: 'provador-estilo',
          label: '✨ Atendimento no Provador',
          badge: 'Provadores',
          type: 'comunicado',
          title: 'Aviso — Consultoria e Conforto no Provador',
          script:
            'Nossa equipe de consultores de moda está à sua disposição nos provadores para ajudar você a encontrar o tamanho e o caimento perfeito. Sinta-se em casa e boas compras!',
          soundtrackId: 'varejo_alegre',
        },
        ...commonUniversal,
      ];

    case 'farmacia':
      return [
        {
          id: 'dermocosmeticos',
          label: '✨ Destaque Dermocosméticos',
          badge: 'Dermo & Beleza',
          type: 'oferta',
          title: 'Destaque — Cuidados da Pele & Protetores Solares',
          script:
            'Atenção clientes! Na compra do seu protetor solar favorito hoje, ganhe desconto especial na linha de hidratação facial e cuidados com a pele! Venha conferir no balcão de dermocosméticos!',
          soundtrackId: 'institucional_gourmet',
        },
        {
          id: 'relampago-vitaminas',
          label: '💊 Oferta Relâmpago Vitaminas',
          badge: 'Saúde & Imunidade',
          type: 'relampago',
          title: 'Oferta Relâmpago — Vitaminas & Suplementos',
          script:
            'Atenção para a oferta relâmpago na nossa farmácia! Pelos próximos trinta minutos: linha de vitaminas e suplementos com preço imperdível para cuidar da sua saúde e disposição!',
          soundtrackId: 'black_friday_urgente',
        },
        {
          id: 'fraldas-bebe',
          label: '👶 Linha Infantil & Fraldas',
          badge: 'Linha Bebê',
          type: 'oferta',
          title: 'Oferta Especial — Fraldas Descartáveis e Cuidados Infantis',
          script:
            'Super oportunidade no setor infantil! Fraldas descartáveis mega e lenços umedecidos com economia garantida para o seu bebê. Aproveite agora mesmo!',
          soundtrackId: 'varejo_alegre',
        },
        ...commonUniversal,
      ];

    case 'petshop':
      return [
        {
          id: 'racoes-premium',
          label: '🐕 Festival de Rações Premium',
          badge: 'Nutrição Animal',
          type: 'oferta',
          title: 'Oferta Especial — Rações Selecionadas para Cães e Gatos',
          script:
            'Atenção tutores de cães e gatos! Rações selecionadas de quinze quilos com super desconto e petiscos especiais para o seu parceiro de quatro patas! Venha conferir!',
          soundtrackId: 'varejo_alegre',
        },
        {
          id: 'relampago-petiscos',
          label: '🦴 Oferta Relâmpago Petiscos',
          badge: 'Mimos Pet',
          type: 'relampago',
          title: 'Oferta Relâmpago — Bifinhos, Sachês & Brinquedos',
          script:
            'Pelos próximos trinta minutos: festival de petiscos com leve três e pague dois no nosso balcão de guloseimas pet! Seu amigo vai amar!',
          soundtrackId: 'black_friday_urgente',
        },
        {
          id: 'banho-tosa',
          label: '✂️ Centro de Estética & Banho',
          badge: 'Banho e Tosa',
          type: 'comunicado',
          title: 'Aviso — Agendamento de Banho e Tosa',
          script:
            'Seu pet merece aquele banho quentinho e tosa com muito carinho! Agende agora mesmo o horário do seu melhor amigo com a nossa equipe de estética animal!',
          soundtrackId: 'varejo_alegre',
        },
        ...commonUniversal,
      ];

    case 'construcao':
      return [
        {
          id: 'cimento-argamassa',
          label: '🧱 Oferta Cimento & Argamassa',
          badge: 'Do Alicerce',
          type: 'relampago',
          title: 'Oferta Relâmpago — Cimento e Argamassa Direto da Fábrica',
          script:
            'Atenção construtores e mestres de obras! Cimento cinquenta quilos e argamassa com preço imbatível de fábrica para retirar hoje mesmo na nossa loja! Aproveite!',
          soundtrackId: 'black_friday_urgente',
        },
        {
          id: 'tintas-cores',
          label: '🎨 Festival de Tintas & Cores',
          badge: 'Tintas & Pintura',
          type: 'oferta',
          title: 'Destaque — Linha de Tintas Acrílicas & Acessórios',
          script:
            'Renove a sua casa gastando muito menos! Tintas acrílicas laváveis e acessórios para pintura com super descontos para transformar seu ambiente!',
          soundtrackId: 'varejo_alegre',
        },
        {
          id: 'ferramentas-obra',
          label: '🔨 Feirão de Ferramentas',
          badge: 'Ferramentas',
          type: 'oferta',
          title: 'Destaque — Ferramentas Elétricas com Garantia',
          script:
            'Furadeiras, serras, lixadeiras e ferramentas profissionais com garantia estendida e condições facilitadas no cartão. Passe no setor de ferramentas!',
          soundtrackId: 'varejo_alegre',
        },
        ...commonUniversal,
      ];

    case 'beleza':
      return [
        {
          id: 'perfumes-importados',
          label: '🌺 Perfumes & Fragrâncias',
          badge: 'Perfumaria',
          type: 'oferta',
          title: 'Destaque — Fragrâncias Marcantes & Perfumes Importados',
          script:
            'Atenção apaixonados por beleza! Perfumes importados e fragrâncias exclusivas com condições imperdíveis de lançamento. Venha experimentar no nosso balcão!',
          soundtrackId: 'institucional_gourmet',
        },
        {
          id: 'make-batons',
          label: '💄 Oferta Relâmpago Maquiagem',
          badge: 'Make dos Sonhos',
          type: 'relampago',
          title: 'Oferta Relâmpago — Bases, Batons & Pincéis',
          script:
            'Só pelos próximos trinta minutos: bases de alta cobertura e batons matte com desconto especial no balcão de maquiagem! Venha realçar o seu brilho!',
          soundtrackId: 'black_friday_urgente',
        },
        {
          id: 'cronograma-capilar',
          label: '💇‍♀️ Linha Capilar & Máscaras',
          badge: 'Cabelos Radiantes',
          type: 'oferta',
          title: 'Destaque — Cronograma Capilar Profissional',
          script:
            'Seus cabelos merecem brilho e hidratação profunda! Venha conferir as máscaras de tratamento e óleos capilares com preços especiais!',
          soundtrackId: 'varejo_alegre',
        },
        ...commonUniversal,
      ];

    case 'restaurante':
      return [
        {
          id: 'prato-chefe',
          label: '🍕 Fornada de Pizzas Especiais',
          badge: 'Pizzas Artesanais',
          type: 'oferta',
          title: 'Destaque — Massas Crocantes & Queijo Derretido',
          script:
            'Atenção apreciadores de uma boa mesa! Acabou de sair mais uma rodada de pizzas com massa artesanal e queijo derretido no forno a lenha! Peça a sua!',
          soundtrackId: 'varejo_alegre',
        },
        {
          id: 'combo-artesanal',
          label: '🍔 Combo Burger & Fritas',
          badge: 'Burgers',
          type: 'relampago',
          title: 'Oferta Relâmpago — Hambúrguer Artesanal com Fritas',
          script:
            'Aquele blend suculento com bacon crocante e batata frita quentinha esperando por você no balcão e no delivery! Peça agora!',
          soundtrackId: 'black_friday_urgente',
        },
        {
          id: 'sobremesa-doce',
          label: '🍰 Sobremesas & Cafés',
          badge: 'Sobremesas',
          type: 'oferta',
          title: 'Destaque — Sobremesas Artesanais do Chefe',
          script:
            'Para fechar a sua refeição com chave de ouro, experimente as sobremesas artesanais preparadas com carinho pelo chefe da casa!',
          soundtrackId: 'institucional_gourmet',
        },
        ...commonUniversal,
      ];

    case 'autopecas':
      return [
        {
          id: 'baterias-eletrica',
          label: '🔋 Teste Gratuito de Bateria',
          badge: 'Baterias',
          type: 'comunicado',
          title: 'Aviso — Teste Gratuito e Instalação de Bateria',
          script:
            'Atenção motoristas! Não fique na mão na rodovia: passe no nosso setor automotivo e faça o teste gratuito da sua bateria com a nossa equipe especializada!',
          soundtrackId: 'varejo_alegre',
        },
        {
          id: 'troca-oleo',
          label: '🛢️ Troca de Óleo & Lubrificantes',
          badge: 'Troca de Óleo',
          type: 'oferta',
          title: 'Destaque — Lubrificantes de Motor & Filtros',
          script:
            'Óleos lubrificantes de alta performance e filtros de motor das melhores marcas com preço especial de troca hoje! Venha conferir!',
          soundtrackId: 'varejo_alegre',
        },
        {
          id: 'pneus-freios',
          label: '🛞 Pastilhas de Freio & Segurança',
          badge: 'Freios & Pneus',
          type: 'relampago',
          title: 'Oferta Relâmpago — Pastilhas de Freio e Amortecedores',
          script:
            'Viaje com tranquilidade! Pastilhas de freio e amortecedores novos instalados com garantia total e condições imperdíveis de pagamento!',
          soundtrackId: 'black_friday_urgente',
        },
        ...commonUniversal,
      ];

    case 'otica':
      return [
        {
          id: 'armacoes-estilo',
          label: '👓 Festival de Armações',
          badge: 'Armações de Grau',
          type: 'oferta',
          title: 'Destaque — Armações Leves & Design Moderno',
          script:
            'Atenção clientes! Armações leves em acetato e metal com design moderno para você renovar o seu olhar com muito estilo! Venha experimentar!',
          soundtrackId: 'institucional_gourmet',
        },
        {
          id: 'lentes-filtroazul',
          label: '🔍 Lentes Digitais & Filtro Azul',
          badge: 'Lentes Antirreflexo',
          type: 'oferta',
          title: 'Destaque — Conforto Visual para Celular e Telas',
          script:
            'Mais conforto e descanso para seus olhos ao trabalhar no celular e no computador com as lentes digitais antirreflexo da nossa ótica!',
          soundtrackId: 'institucional_gourmet',
        },
        {
          id: 'oculos-sol',
          label: '🕶️ Óculos de Sol com Proteção UV',
          badge: 'Óculos Solares',
          type: 'relampago',
          title: 'Oferta Relâmpago — Linha Solar com Desconto Especial',
          script:
            'Proteja a sua visão com elegância! Grande seleção de óculos solares com garantia de proteção contra raios solares em oferta relâmpago hoje!',
          soundtrackId: 'black_friday_urgente',
        },
        ...commonUniversal,
      ];

    case 'geral':
      return [
        {
          id: 'destaque-dia',
          label: '🌟 Oferta Relâmpago do Dia',
          badge: 'Oferta do Dia',
          type: 'relampago',
          title: 'Oferta Relâmpago — Oportunidade Exclusiva da Loja',
          script:
            'Atenção clientes! Oferta imperdível preparada exclusivamente para você hoje! Aproveite os descontos especiais em nossos corredores antes que acabe!',
          soundtrackId: 'black_friday_urgente',
        },
        {
          id: 'parcelamento-facil',
          label: '💳 Condições Especiais no Cartão',
          badge: 'Facilidade',
          type: 'comunicado',
          title: 'Comunicado — Parcelamento Facilitado no Caixa',
          script:
            'Compre com tranquilidade e parcele suas compras em parcelas que cabem no seu bolso! Consulte nossos operadores de caixa!',
          soundtrackId: 'varejo_alegre',
        },
        {
          id: 'variedade-geral',
          label: '🛍️ Qualidade & Economia',
          badge: 'Variedade',
          type: 'oferta',
          title: 'Destaque — Produtos Selecionados com Preço Baixo',
          script:
            'Aqui você encontra variedade, bom atendimento e economia real em todos os setores da nossa loja. Boas compras e aproveite as oportunidades!',
          soundtrackId: 'varejo_alegre',
        },
        ...commonUniversal,
      ];

    case 'supermercado':
    default:
      return [
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
        ...commonUniversal,
      ];
  }
}

export function getInitialQueueForNiche(niche: ProjectNiche = 'supermercado', storeName: string = 'Minha Loja'): RadioQueueItem[] {
  switch (niche) {
    case 'moda':
      return [
        {
          id: `rq-moda-1`,
          audioId: `aud-moda-1`,
          projectId: `proj-moda-demo`,
          title: 'Nova Coleção — Looks & Tendências da Estação',
          audioUrl: '/api/audio/aud-demo-1.mp3',
          downloadUrl: '/api/audio/aud-demo-1.mp3?download=1',
          durationSeconds: 28,
          voiceName: 'Carolina (Elegante & Estilo)',
          campaignType: 'ofertas_dia',
          storeName,
          type: 'oferta',
          active: true,
          priority: 'alta',
          playCount: 0,
          addedAt: new Date().toISOString(),
        },
        {
          id: `rq-moda-2`,
          audioId: `aud-moda-2`,
          projectId: `proj-moda-demo`,
          title: 'Destaques do Provador — Vestuário & Calçados',
          audioUrl: '/api/audio/aud-demo-2.mp3',
          downloadUrl: '/api/audio/aud-demo-2.mp3?download=1',
          durationSeconds: 26,
          voiceName: 'Daniel (Varejo Comercial)',
          campaignType: 'superofertas',
          storeName,
          type: 'oferta',
          active: true,
          priority: 'normal',
          playCount: 0,
          addedAt: new Date().toISOString(),
        },
      ];

    case 'farmacia':
      return [
        {
          id: `rq-farm-1`,
          audioId: `aud-farm-1`,
          projectId: `proj-farm-demo`,
          title: 'Semana da Saúde & Bem-Estar — Dermocosméticos e Vitaminas',
          audioUrl: '/api/audio/aud-demo-1.mp3',
          downloadUrl: '/api/audio/aud-demo-1.mp3?download=1',
          durationSeconds: 28,
          voiceName: 'Carolina (Simpática & Natural)',
          campaignType: 'ofertas_dia',
          storeName,
          type: 'oferta',
          active: true,
          priority: 'alta',
          playCount: 0,
          addedAt: new Date().toISOString(),
        },
        {
          id: `rq-farm-2`,
          audioId: `aud-farm-2`,
          projectId: `proj-farm-demo`,
          title: 'Cuidados com a Família — Higiene & Linha Bebê',
          audioUrl: '/api/audio/aud-demo-2.mp3',
          downloadUrl: '/api/audio/aud-demo-2.mp3?download=1',
          durationSeconds: 26,
          voiceName: 'Daniel (Varejo Enérgico)',
          campaignType: 'ofertas_semana',
          storeName,
          type: 'oferta',
          active: true,
          priority: 'normal',
          playCount: 0,
          addedAt: new Date().toISOString(),
        },
      ];

    case 'petshop':
      return [
        {
          id: `rq-pet-1`,
          audioId: `aud-pet-1`,
          projectId: `proj-pet-demo`,
          title: 'Festival do Pet — Rações Premium & Bifinhos',
          audioUrl: '/api/audio/aud-demo-1.mp3',
          downloadUrl: '/api/audio/aud-demo-1.mp3?download=1',
          durationSeconds: 28,
          voiceName: 'Rodrigo (Voz Amigável)',
          campaignType: 'ofertas_dia',
          storeName,
          type: 'oferta',
          active: true,
          priority: 'alta',
          playCount: 0,
          addedAt: new Date().toISOString(),
        },
      ];

    case 'construcao':
      return [
        {
          id: `rq-const-1`,
          audioId: `aud-const-1`,
          projectId: `proj-const-demo`,
          title: 'Semana da Construção & Reforma — Cimento, Tintas e Pisos',
          audioUrl: '/api/audio/aud-demo-1.mp3',
          downloadUrl: '/api/audio/aud-demo-1.mp3?download=1',
          durationSeconds: 28,
          voiceName: 'Daniel (Impacto Varejo)',
          campaignType: 'ofertas_dia',
          storeName,
          type: 'oferta',
          active: true,
          priority: 'alta',
          playCount: 0,
          addedAt: new Date().toISOString(),
        },
      ];

    case 'supermercado':
    default:
      return [
        {
          id: 'rq-default-1',
          audioId: 'aud-demo-1',
          projectId: 'proj-demo-1',
          title: 'Quarta da Carne — Ofertas Campeãs no Açougue',
          audioUrl: '/api/audio/aud-demo-1.mp3',
          downloadUrl: '/api/audio/aud-demo-1.mp3?download=1',
          durationSeconds: 28,
          voiceName: 'Daniel (Varejo Enérgico)',
          campaignType: 'quarta_carne',
          storeName,
          type: 'oferta',
          active: true,
          priority: 'alta',
          playCount: 0,
          addedAt: new Date().toISOString(),
        },
        {
          id: 'rq-default-2',
          audioId: 'aud-demo-2',
          projectId: 'proj-demo-2',
          title: 'Festival de Hortifrúti — Direto da Roça',
          audioUrl: '/api/audio/aud-demo-2.mp3',
          downloadUrl: '/api/audio/aud-demo-2.mp3?download=1',
          durationSeconds: 26,
          voiceName: 'Carolina (Simpática & Natural)',
          campaignType: 'festival_hortifruti',
          storeName,
          type: 'oferta',
          active: true,
          priority: 'normal',
          playCount: 0,
          addedAt: new Date().toISOString(),
        },
      ];
  }
}

export function createInitialProjectForNiche(
  userId: string,
  niche: ProjectNiche = 'supermercado',
  companyName: string = 'Minha Loja'
): Project {
  let title = 'Nova Campanha de Ofertas';
  let objective = 'Divulgar as ofertas e aumentar as vendas';
  let products: ProductItem[] = [];

  switch (niche) {
    case 'moda':
      title = 'Lançamento da Coleção & Tendências da Estação';
      objective = 'Apresentar os novos looks da coleção com estilo e atrair clientes ao provador';
      products = [
        {
          id: 'p-moda-1',
          name: 'Vestido Floral Elegance',
          brand: 'Coleção Primavera',
          packaging: 'tamanhos P M G',
          promotionalPrice: 89.90,
          previousPrice: 119.90,
          unit: 'unidade',
          spokenPrice: 'oitenta e nove reais e noventa centavos',
        },
        {
          id: 'p-moda-2',
          name: 'Calça Jeans Skinny Confort',
          brand: 'Denim Premium',
          packaging: 'várias lavagens',
          promotionalPrice: 119.90,
          previousPrice: 159.90,
          unit: 'unidade',
          spokenPrice: 'cento e dezenove reais e noventa centavos',
        },
        {
          id: 'p-moda-3',
          name: 'Camiseta Básica de Algodão',
          brand: 'Cotton Soft',
          packaging: 'cores variadas',
          promotionalPrice: 39.90,
          previousPrice: 49.90,
          unit: 'unidade',
          spokenPrice: 'trinta e nove reais e noventa centavos',
        },
      ];
      break;

    case 'farmacia':
      title = 'Semana da Saúde & Cuidados da Família';
      objective = 'Divulgar dermocosméticos, protetores e vitaminas com preços especiais';
      products = [
        {
          id: 'p-farm-1',
          name: 'Protetor Solar FPS 50 Toque Seco',
          brand: 'Dermo Sun',
          packaging: 'frasco 200ml',
          promotionalPrice: 49.90,
          previousPrice: 69.90,
          unit: 'unidade',
          spokenPrice: 'quarenta e nove reais e noventa centavos',
        },
        {
          id: 'p-farm-2',
          name: 'Vitamina C Imunidade Efervescente',
          brand: 'Vita Life',
          packaging: 'tubo com 10 comprimidos',
          promotionalPrice: 19.90,
          previousPrice: 29.90,
          unit: 'unidade',
          spokenPrice: 'dezenove reais e noventa centavos',
        },
        {
          id: 'p-farm-3',
          name: 'Fralda Descartável Mega Confort',
          brand: 'Baby Care',
          packaging: 'pacote jumbo',
          promotionalPrice: 59.90,
          previousPrice: 74.90,
          unit: 'pacote',
          spokenPrice: 'cinquenta e nove reais e noventa centavos o pacote',
        },
      ];
      break;

    case 'petshop':
      title = 'Festival do Pet & Nutrição Premium';
      objective = 'Divulgar rações premium e mimos para cães e gatos';
      products = [
        {
          id: 'p-pet-1',
          name: 'Ração Premium Cães Adultos Frango e Arroz',
          brand: 'NutriPet',
          packaging: 'saco 15kg',
          promotionalPrice: 139.90,
          previousPrice: 169.90,
          unit: 'unidade',
          spokenPrice: 'cento e trinta e nove reais e noventa centavos',
        },
        {
          id: 'p-pet-2',
          name: 'Bifinho de Carne Macio para Cães',
          brand: 'PetSnack',
          packaging: 'pacote 500g',
          promotionalPrice: 14.90,
          previousPrice: 19.90,
          unit: 'pacote',
          spokenPrice: 'quatorze reais e noventa centavos o pacote',
        },
      ];
      break;

    case 'construcao':
      title = 'Semana da Reforma & Construção';
      objective = 'Oferecer cimento, tintas e pisos com desconto para obras';
      products = [
        {
          id: 'p-const-1',
          name: 'Cimento CP 2 Todas as Obras',
          brand: 'Votoran',
          packaging: 'saco 50kg',
          promotionalPrice: 34.90,
          previousPrice: 39.90,
          unit: 'unidade',
          spokenPrice: 'trinta e quatro reais e noventa centavos',
        },
        {
          id: 'p-const-2',
          name: 'Tinta Acrílica Fosca Lavável Branca',
          brand: 'Suvinil',
          packaging: 'lata 18 litros',
          promotionalPrice: 189.90,
          previousPrice: 229.90,
          unit: 'unidade',
          spokenPrice: 'cento e oitenta e nove reais e noventa centavos',
        },
      ];
      break;

    case 'supermercado':
    default:
      title = 'Quarta e Quinta da Carne & Hortifrúti';
      objective = 'Atrair clientes para o açougue e setor de hortifrúti';
      products = [
        {
          id: 'p-sup-1',
          name: 'Alcatra com Maminha Bovina',
          brand: 'Friboi',
          packaging: 'peça a vácuo',
          promotionalPrice: 36.90,
          previousPrice: 44.90,
          unit: 'kg',
          spokenPrice: 'trinta e seis reais e noventa centavos o quilo',
        },
        {
          id: 'p-sup-2',
          name: 'Tomate Italiano Selecionado',
          packaging: 'fresco da feira',
          promotionalPrice: 4.49,
          previousPrice: 6.99,
          unit: 'kg',
          spokenPrice: 'quatro reais e quarenta e nove centavos o quilo',
        },
      ];
      break;
  }

  return {
    id: `proj-${Date.now()}`,
    userId,
    niche,
    title,
    storeName: companyName || 'Minha Loja',
    storeCity: 'São Paulo - SP',
    objective,
    campaignType: 'ofertas_dia',
    style: niche === 'farmacia' ? 'natural_amigavel' : (niche === 'moda' || niche === 'beleza' || niche === 'otica') ? 'elegante_institucional' : 'energetica_supermercado',
    desiredDuration: '30s',
    tone: 'alegre',
    presentationFormat: 'abertura_sequencia_encerramento',
    products,
    scripts: [],
    currentScriptIndex: 0,
    audios: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getAnnouncementsByNiche(niche: ProjectNiche = 'supermercado'): QuickAnnouncementItem[] {
  const isSuper = niche === 'supermercado';

  return [
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
      script: isSuper
        ? 'Informamos que encerramos o nosso expediente de hoje. Agradecemos a todos os nossos clientes pela presença e preferência. Amanhã estaremos de volta a partir das sete da manhã com produtos fresquinhos e muitas promoções para você. Tenham todos uma ótima noite!'
        : 'Informamos que encerramos o nosso expediente de hoje. Agradecemos a todos os nossos clientes pela presença e preferência. Amanhã estaremos de volta com muitas novidades e ofertas especiais preparadas para você. Tenham todos uma ótima noite!',
      soundtrackId: 'institucional_gourmet',
      defaultPriority: 'normal',
    },

    // 💳 Frente de Caixa e Atendimento
    {
      id: 'caixa-rapido-10itens',
      category: 'caixa',
      categoryLabel: 'Frente de Caixa',
      icon: '⚡',
      title: isSuper ? 'Abertura de Caixa Rápido (Até 10 Volumes)' : 'Abertura de Caixa Rápido',
      badge: 'Agilidade',
      description: 'Convida clientes com poucas compras para atendimento expresso.',
      script:
        'Atenção clientes com compras rápidas: temos caixa ágil aberto para atendimento imediato e sem fila! Passe suas compras com total agilidade e economia de tempo.',
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
      title: isSuper ? 'Formas de Pagamento, PIX e Vales-Alimentação' : 'Formas de Pagamento, PIX e Parcelamento',
      badge: 'Facilidade',
      description: isSuper ? 'Informa todas as opções de pagamento aceitas pelo supermercado.' : 'Informa todas as opções de pagamento aceitas pela loja.',
      script: isSuper
        ? 'Facilidade e comodidade para você economizar: aceitamos pagamentos via PIX, cartões de crédito e débito das principais bandeiras e todos os vales-alimentação e refeição. Venha encher o carrinho com total tranquilidade!'
        : 'Facilidade e comodidade para você comprar: aceitamos pagamentos via PIX, cartões de crédito e débito das principais bandeiras com parcelamento facilitado. Venha fazer suas compras com total tranquilidade!',
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
      script: isSuper
        ? 'Sabia que você pode fazer suas compras sem sair de casa? Envie sua lista de compras agora mesmo para o nosso WhatsApp oficial e receba tudo fresquinho com entrega rápida no conforto do seu lar! Consulte nosso número nos cartazes da loja.'
        : 'Sabia que você pode fazer suas compras sem sair de casa? Envie sua mensagem agora mesmo para o nosso WhatsApp oficial e receba seus produtos com entrega rápida no conforto da sua casa! Fale com a nossa equipe.',
      soundtrackId: 'varejo_alegre',
      defaultPriority: 'normal',
    },
  ];
}


// =========================================================================
// SOUNDTRACKS POR NICHO (Trilhas Sonoras Comerciais Adaptadas)
// =========================================================================
export function getSoundtracksByNiche(niche: ProjectNiche = 'supermercado'): SoundtrackOption[] {
  switch (niche) {
    case 'moda':
      return [
        {
          id: 'sem_trilha',
          name: 'Sem Trilha (Voz Pura)',
          category: 'Voz Pura',
          bpm: 0,
          description: 'Apenas a locução do locutor, sem fundo musical. Ideal para sistemas de som que já tocam rádio ao fundo.',
          previewUrl: '/api/soundtracks/sem_trilha/preview.mp3',
        },
        {
          id: 'varejo_alegre',
          name: 'Pop Comercial & Vitrine',
          category: 'Moda & Vestuário',
          bpm: 124,
          description: 'Upbeat moderno e contagiante. Perfeito para lançamentos, novas coleções, vestidos e promoções da loja.',
          previewUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          isPopular: true,
        },
        {
          id: 'batida_comercial',
          name: 'Runway Pop & Desfile',
          category: 'Tendências & Estilo',
          bpm: 120,
          description: 'Batida pop contemporânea estilo passarela e boutique. Alto apelo para provadores e área de vendas.',
          previewUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          isPopular: true,
        },
        {
          id: 'black_friday_urgente',
          name: 'Liquidação & Queima Total',
          category: 'Bazar & Saldão',
          bpm: 128,
          description: 'Percussão enérgica e dinâmica de grande impacto. Ideal para troca de coleção, Black Friday e Bazar de Roupas.',
          previewUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
        },
        {
          id: 'acustico_hortifruti',
          name: 'Acoustic Boutique & Lo-Fi',
          category: 'Boutique & Conforto',
          bpm: 105,
          description: 'Violão suave e atmosfera relaxante. Indicado para compras com calma e atendimento personalizado.',
          previewUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
        },
        {
          id: 'institucional_gourmet',
          name: 'Elegante & Alta Moda',
          category: 'Exclusivo & Grifes',
          bpm: 96,
          description: 'Harmonia sofisticada e refinada. Perfeito para linhas premium, alfaiataria e clube de benefícios.',
          previewUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
        },
        {
          id: 'natal_fim_de_ano',
          name: 'Natal & Fim de Ano Fashion',
          category: 'Natal & Festas',
          bpm: 120,
          description: 'Clássicos natalinos e arranjos festivos elegantes para compras de presentes de fim de ano e looks de Réveillon.',
          previewUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          isPopular: true,
        },
      ];

    case 'farmacia':
      return [
        {
          id: 'sem_trilha',
          name: 'Sem Trilha (Voz Pura)',
          category: 'Voz Pura',
          bpm: 0,
          description: 'Apenas a locução do locutor, sem fundo musical. Ideal para sistemas de som que já tocam rádio ao fundo.',
          previewUrl: '/api/soundtracks/sem_trilha/preview.mp3',
        },
        {
          id: 'varejo_alegre',
          name: 'Comercial Alegre & Saúde',
          category: 'Farmácia & Drogaria',
          bpm: 124,
          description: 'Ritmo alegre e acolhedor. Perfeito para divulgar ofertas de higiene, dermocosméticos, vitaminas e cuidados.',
          previewUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          isPopular: true,
        },
        {
          id: 'batida_comercial',
          name: 'Pop Dinâmico de Drogaria',
          category: 'Campanhas & Cuidados',
          bpm: 120,
          description: 'Batida moderna para grandes campanhas de saúde, festivais de perfumaria e linha mamãe e bebê.',
          previewUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          isPopular: true,
        },
        {
          id: 'black_friday_urgente',
          name: 'Oferta Urgente & Plantão',
          category: 'Urgência & Descontos',
          bpm: 128,
          description: 'Ritmo dinâmico para queimas de estoque e oportunidades pontuais no balcão e perfumaria.',
          previewUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
        },
        {
          id: 'acustico_hortifruti',
          name: 'Acústico Serenidade & Cuidado',
          category: 'Saúde & Aconchego',
          bpm: 105,
          description: 'Violão suave e atmosfera tranquila. Indicado para atendimento humanizado no balcão e farmácia clínica.',
          previewUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
        },
        {
          id: 'institucional_gourmet',
          name: 'Harmonia & Confiança Médica',
          category: 'Fidelidade & Cuidado',
          bpm: 96,
          description: 'Piano sereno e seguro. Ideal para programas de benefícios, campanhas preventivas e comunicados.',
          previewUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
        },
        {
          id: 'natal_fim_de_ano',
          name: 'Natal de Saúde, Paz & Esperança',
          category: 'Natal & Celebração',
          bpm: 120,
          description: 'Arranjos delicados e acolhedores para desejar boas festas e muita saúde a todos os clientes.',
          previewUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          isPopular: true,
        },
      ];

    case 'petshop':
      return [
        {
          id: 'sem_trilha',
          name: 'Sem Trilha (Voz Pura)',
          category: 'Voz Pura',
          bpm: 0,
          description: 'Apenas a locução do locutor, sem fundo musical.',
          previewUrl: '/api/soundtracks/sem_trilha/preview.mp3',
        },
        {
          id: 'varejo_alegre',
          name: 'Alegria Pet & Família',
          category: 'Pet Shop & Cuidado',
          bpm: 124,
          description: 'Upbeat animado e alegre. Perfeito para ofertas de rações premium, petiscos e brinquedos para pets.',
          previewUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          isPopular: true,
        },
        {
          id: 'batida_comercial',
          name: 'Pop Comercial Animal',
          category: 'Grandes Promoções',
          bpm: 120,
          description: 'Batida moderna para festivais de ração, feirões de acessórios e campanhas de banho e tosa.',
          previewUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          isPopular: true,
        },
        {
          id: 'black_friday_urgente',
          name: 'Mega Desconto Pet',
          category: 'Promoção Relâmpago',
          bpm: 128,
          description: 'Ritmo enérgico para queima de estoque de caminhas, coleiras e rações.',
          previewUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
        },
        {
          id: 'acustico_hortifruti',
          name: 'Acústico Zen para Pets',
          category: 'Calma & Relax Animal',
          bpm: 105,
          description: 'Violão acústico relaxante para deixar cães e gatos confortáveis durante a permanência na loja.',
          previewUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
        },
        {
          id: 'institucional_gourmet',
          name: 'Clube Pet & Linha Premium',
          category: 'Clube & Nutrição',
          bpm: 96,
          description: 'Harmonia refinada para rações super premium, farmácia veterinária e planos de banho e tosa.',
          previewUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
        },
        {
          id: 'natal_fim_de_ano',
          name: 'Natal Mágico dos Pets',
          category: 'Natal dos Bichinhos',
          bpm: 120,
          description: 'Clássicos natalinos alegres para presentear cães, gatos e a família toda no fim de ano.',
          previewUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          isPopular: true,
        },
      ];

    case 'construcao':
      return [
        {
          id: 'sem_trilha',
          name: 'Sem Trilha (Voz Pura)',
          category: 'Voz Pura',
          bpm: 0,
          description: 'Apenas a locução do locutor, sem fundo musical.',
          previewUrl: '/api/soundtracks/sem_trilha/preview.mp3',
        },
        {
          id: 'varejo_alegre',
          name: 'Comercial Enérgico & Obra',
          category: 'Materiais & Construção',
          bpm: 124,
          description: 'Ritmo dinâmico e motivador. Perfeito para feirões de reforma, pisos, tintas e ferramentas.',
          previewUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          isPopular: true,
        },
        {
          id: 'batida_comercial',
          name: 'Pop Rock Comercial & Balcão',
          category: 'Obras & Reformas',
          bpm: 120,
          description: 'Batida forte e marcante para movimentar a loja de materiais, área de cimento e acabamentos.',
          previewUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          isPopular: true,
        },
        {
          id: 'black_friday_urgente',
          name: 'Feirão da Reforma & Urgência',
          category: 'Queima de Estoque',
          bpm: 128,
          description: 'Percussão potente para grandes queimas de pisos, porcelanatos, telhas e iluminação.',
          previewUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
        },
        {
          id: 'acustico_hortifruti',
          name: 'Acústico Tranquilo & Atendimento',
          category: 'Projetos & Casa',
          bpm: 105,
          description: 'Violão suave para clientes que estão projetando suas casas e escolhendo acabamentos com calma.',
          previewUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
        },
        {
          id: 'institucional_gourmet',
          name: 'Elegante Arquitetura & Design',
          category: 'Acabamentos Nobres',
          bpm: 96,
          description: 'Harmonia contemporânea para metais nobres, louças sanitárias e revestimentos finos.',
          previewUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
        },
        {
          id: 'natal_fim_de_ano',
          name: 'Natal da Casa Nova & Reforma',
          category: 'Festas & Conquistas',
          bpm: 120,
          description: 'Trilhas festivas e inspiradoras para quem está reformando e preparando o lar para o fim de ano.',
          previewUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          isPopular: true,
        },
      ];

    case 'beleza':
      return [
        {
          id: 'sem_trilha',
          name: 'Sem Trilha (Voz Pura)',
          category: 'Voz Pura',
          bpm: 0,
          description: 'Apenas a locução do locutor, sem fundo musical.',
          previewUrl: '/api/soundtracks/sem_trilha/preview.mp3',
        },
        {
          id: 'varejo_alegre',
          name: 'Pop Beleza & Cosméticos',
          category: 'Beleza & Estilo',
          bpm: 124,
          description: 'Ritmo vibrante e encantador para maquiagens, perfumaria e cuidados diários.',
          previewUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          isPopular: true,
        },
        {
          id: 'batida_comercial',
          name: 'Glamour Pop Comercial',
          category: 'Tendências & Glamour',
          bpm: 120,
          description: 'Batida moderna pop comercial para festivais de beleza e lançamentos capilares.',
          previewUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          isPopular: true,
        },
        {
          id: 'black_friday_urgente',
          name: 'Black Friday da Beleza',
          category: 'Queima de Perfumes',
          bpm: 128,
          description: 'Percussão vibrante para queima de estoque de fragrâncias e kits de presentes.',
          previewUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
        },
        {
          id: 'acustico_hortifruti',
          name: 'Spa Acústico & Bem-Estar',
          category: 'Spa & Cuidado',
          bpm: 105,
          description: 'Violão suave e atmosfera relaxante para compras calmas de autocuidado e skincare.',
          previewUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
        },
        {
          id: 'institucional_gourmet',
          name: 'Lounge Glamour & Elegância',
          category: 'Premium & Importados',
          bpm: 96,
          description: 'Harmonia sofisticada para perfumes importados, cosméticos nobres e clube exclusivo.',
          previewUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
        },
        {
          id: 'natal_fim_de_ano',
          name: 'Natal Radiante & Presentes',
          category: 'Natal & Festas',
          bpm: 120,
          description: 'Clássicos natalinos em arranjos sofisticados para presentes e kits de beleza.',
          previewUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          isPopular: true,
        },
      ];

    case 'restaurante':
      return [
        {
          id: 'sem_trilha',
          name: 'Sem Trilha (Voz Pura)',
          category: 'Voz Pura',
          bpm: 0,
          description: 'Apenas a locução do locutor, sem fundo musical.',
          previewUrl: '/api/soundtracks/sem_trilha/preview.mp3',
        },
        {
          id: 'varejo_alegre',
          name: 'Comercial Alegre & Sabores',
          category: 'Gastronomia & Sabor',
          bpm: 124,
          description: 'Ritmo contagiante para divulgar pratos do dia, combos e promoções do cardápio.',
          previewUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          isPopular: true,
        },
        {
          id: 'batida_comercial',
          name: 'Pop Dinâmico de Lanchonete',
          category: 'Combos & Delivery',
          bpm: 120,
          description: 'Batida animada para festivais de hambúrguer, pizzas e promoções do delivery.',
          previewUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          isPopular: true,
        },
        {
          id: 'black_friday_urgente',
          name: 'Oferta Relâmpago do Chef',
          category: 'Hora do Almoço',
          bpm: 128,
          description: 'Ritmo acelerado para pratos executivos e promoções relâmpago de happy hour.',
          previewUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
        },
        {
          id: 'acustico_hortifruti',
          name: 'Acústico Café & Almoço',
          category: 'Aconchego & Sabor',
          bpm: 105,
          description: 'Violão suave e relaxante para um ambiente agradável durante a refeição.',
          previewUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
        },
        {
          id: 'institucional_gourmet',
          name: 'Bossa & Jazz Gastronômico',
          category: 'Alta Gastronomia',
          bpm: 96,
          description: 'Piano contemporâneo e jazz elegante para cartas de vinhos e pratos refinados.',
          previewUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
        },
        {
          id: 'natal_fim_de_ano',
          name: 'Natal Saboroso & Confraternização',
          category: 'Natal & Ceias',
          bpm: 120,
          description: 'Músicas natalinas acolhedoras para ceias, confraternizações e encomendas de fim de ano.',
          previewUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          isPopular: true,
        },
      ];

    case 'autopecas':
      return [
        {
          id: 'sem_trilha',
          name: 'Sem Trilha (Voz Pura)',
          category: 'Voz Pura',
          bpm: 0,
          description: 'Apenas a locução do locutor, sem fundo musical.',
          previewUrl: '/api/soundtracks/sem_trilha/preview.mp3',
        },
        {
          id: 'varejo_alegre',
          name: 'Rock Comercial & Rodovia',
          category: 'Auto Peças & Oficina',
          bpm: 124,
          description: 'Upbeat enérgico para promoções de pneus, troca de óleo e baterias.',
          previewUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          isPopular: true,
        },
        {
          id: 'batida_comercial',
          name: 'Pop Rock Dinâmico & Garagem',
          category: 'Centro Automotivo',
          bpm: 120,
          description: 'Batida potente para movimentar o balcão de peças e oficina mecânica.',
          previewUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          isPopular: true,
        },
        {
          id: 'black_friday_urgente',
          name: 'Feirão de Pneus & Queima',
          category: 'Queima de Estoque',
          bpm: 128,
          description: 'Percussão forte de grande impacto para queima de estoque e revisões rápidas.',
          previewUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
        },
        {
          id: 'acustico_hortifruti',
          name: 'Acústico Estrada & Revisão',
          category: 'Atendimento Técnico',
          bpm: 105,
          description: 'Violão agradável para clientes aguardando serviços na sala de espera.',
          previewUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
        },
        {
          id: 'institucional_gourmet',
          name: 'Institucional Segurança & Garantia',
          category: 'Procedência & Peças',
          bpm: 96,
          description: 'Harmonia firme e sofisticada reforçando peças originais com nota e procedência.',
          previewUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
        },
        {
          id: 'natal_fim_de_ano',
          name: 'Natal & Revisão para Viagem',
          category: 'Fim de Ano Seguro',
          bpm: 120,
          description: 'Trilha festiva para lembrar os clientes de revisar o carro antes de pegar a estrada.',
          previewUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          isPopular: true,
        },
      ];

    case 'otica':
      return [
        {
          id: 'sem_trilha',
          name: 'Sem Trilha (Voz Pura)',
          category: 'Voz Pura',
          bpm: 0,
          description: 'Apenas a locução do locutor, sem fundo musical.',
          previewUrl: '/api/soundtracks/sem_trilha/preview.mp3',
        },
        {
          id: 'varejo_alegre',
          name: 'Pop Suave & Saúde Visual',
          category: 'Ótica & Visão',
          bpm: 124,
          description: 'Ritmo agradável e iluminado. Perfeito para destacar lançamentos de armações e exames.',
          previewUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          isPopular: true,
        },
        {
          id: 'batida_comercial',
          name: 'Pop Elegante & Lentes Modernas',
          category: 'Tecnologia & Lentes',
          bpm: 120,
          description: 'Batida contemporânea para divulgar tratamentos antirreflexo e lentes de precisão.',
          previewUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          isPopular: true,
        },
        {
          id: 'black_friday_urgente',
          name: 'Festival de Armações & Urgência',
          category: 'Queima de Armações',
          bpm: 128,
          description: 'Percussão dinâmica para liquidação anual de marcas famosas e solares.',
          previewUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
        },
        {
          id: 'acustico_hortifruti',
          name: 'Acústico Calma & Conforto',
          category: 'Atendimento & Cuidado',
          bpm: 105,
          description: 'Violão suave e relaxante para consulta e escolha de óculos com calma.',
          previewUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
        },
        {
          id: 'institucional_gourmet',
          name: 'Lounge Grifes & Relojoaria',
          category: 'Grifes & Joias',
          bpm: 96,
          description: 'Piano contemporâneo requintado para relógios finos, joias e armações de luxo.',
          previewUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
        },
        {
          id: 'natal_fim_de_ano',
          name: 'Natal de Brilho & Novo Olhar',
          category: 'Natal & Festas',
          bpm: 120,
          description: 'Arranjos natalinos sofisticados para presentear quem você ama com óculos e joias.',
          previewUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          isPopular: true,
        },
      ];

    case 'geral':
    default:
      if (niche === 'geral') {
        return [
          {
            id: 'sem_trilha',
            name: 'Sem Trilha (Voz Pura)',
            category: 'Voz Pura',
            bpm: 0,
            description: 'Apenas a locução do locutor, sem fundo musical.',
            previewUrl: '/api/soundtracks/sem_trilha/preview.mp3',
          },
          {
            id: 'varejo_alegre',
            name: 'Varejo Comercial & Variedades',
            category: 'Comércio & Variedades',
            bpm: 124,
            description: 'Upbeat alegre e ritmo contagiante. Perfeito para ofertas do dia e promoções em destaque.',
            previewUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
            isPopular: true,
          },
          {
            id: 'batida_comercial',
            name: 'Pop Comercial Dinâmico',
            category: 'Grandes Promoções',
            bpm: 120,
            description: 'Batida moderna estilo rádio de loja. Alto apelo para queimas e corredor central.',
            previewUrl: '/api/soundtracks/batida_comercial/preview.mp3',
            isPopular: true,
          },
          {
            id: 'black_friday_urgente',
            name: 'Impacto & Urgência',
            category: 'Promoção Relâmpago',
            bpm: 128,
            description: 'Percussão enérgica e dinâmica de grande impacto. Ideal para saldões e liquidações.',
            previewUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
          },
          {
            id: 'acustico_hortifruti',
            name: 'Acústico Suave & Tranquilo',
            category: 'Compras em Família',
            bpm: 105,
            description: 'Violão suave e frescor aconchegante para compras calmas no dia a dia.',
            previewUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
          },
          {
            id: 'institucional_gourmet',
            name: 'Elegante & Institucional',
            category: 'Clube & Confiança',
            bpm: 96,
            description: 'Piano sofisticado e harmonia envolvente. Ideal para clube de fidelidade e comunicados.',
            previewUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
          },
          {
            id: 'natal_fim_de_ano',
            name: 'Natal Festivo em Família',
            category: 'Natal & Festas',
            bpm: 120,
            description: 'Clássicos natalinos e sinos alegres para compras de presentes e celebrações.',
            previewUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
            isPopular: true,
          },
        ];
      }

      // Default supermercado
      return [
        {
          id: 'sem_trilha',
          name: 'Sem Trilha (Voz Pura)',
          category: 'Voz Pura',
          bpm: 0,
          description: 'Apenas a locução do locutor, sem fundo musical. Ideal para sistemas de som que já tocam rádio ao fundo.',
          previewUrl: '/api/soundtracks/sem_trilha/preview.mp3',
        },
        {
          id: 'varejo_alegre',
          name: 'Varejo Alegre & Enérgico',
          category: 'Supermercado & Feira',
          bpm: 124,
          description: 'Upbeat acústico e ritmo alegre contagiante. Perfeito para ofertas do dia, feirinha e hortifrúti.',
          previewUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          isPopular: true,
        },
        {
          id: 'batida_comercial',
          name: 'Pop Comercial Dinâmico',
          category: 'Grandes Redes',
          bpm: 120,
          description: 'Batida moderna pop comercial estilo rádio de loja. Alto apelo para grandes promoções e corredor central.',
          previewUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          isPopular: true,
        },
        {
          id: 'black_friday_urgente',
          name: 'Impacto & Urgência',
          category: 'Promoção Relâmpago',
          bpm: 128,
          description: 'Percussão enérgica e dinâmica de grande impacto. Ideal para Black Friday, Queima de Estoque e Aniversário.',
          previewUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
        },
        {
          id: 'acustico_hortifruti',
          name: 'Acústico Leve & Fresco',
          category: 'Hortifrúti & Padaria',
          bpm: 105,
          description: 'Violão suave e frescor aconchegante. Indicado para compras matinais, café da manhã, padaria e flores.',
          previewUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
        },
        {
          id: 'institucional_gourmet',
          name: 'Elegante & Institucional',
          category: 'Clube & Vinhos',
          bpm: 96,
          description: 'Piano contemporâneo sofisticado e harmonia envolvente. Ideal para Clube de Vantagens, adega, frios nobres e comunicados.',
          previewUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
        },
        {
          id: 'natal_fim_de_ano',
          name: 'Natal & Final de Ano Mágico',
          category: 'Natal & Fim de Ano',
          bpm: 120,
          description: 'Clássicos natalinos, sinos festivos e arranjos de fim de ano para compras de Natal e celebrações de Réveillon no supermercado.',
          previewUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          isPopular: true,
        },
      ];
  }
}

// =========================================================================
// PLAYLISTS DA RÁDIO POR NICHO (Música Ambiente Segmentada)
// =========================================================================
export function getPlaylistsByNiche(niche: ProjectNiche = 'supermercado'): RadioPlaylist[] {
  switch (niche) {
    case 'moda':
      return [
        {
          id: 'moda_pop_chic',
          name: 'Pop Chic & Vitrine Moderna',
          description: 'Músicas pop elegantes e sofisticadas para provadores, espelhos e vitrines',
          icon: '👗',
          color: 'purple',
        },
        {
          id: 'moda_indie_lounge',
          name: 'Indie Pop & R&B Estiloso',
          description: 'Clima contemporâneo, jovem e descolado com as últimas tendências musicais',
          icon: '🎧',
          color: 'sky',
        },
        {
          id: 'moda_acoustic_boutique',
          name: 'Acoustic Boutique & Lo-Fi',
          description: 'Harmonias aconchegantes para o cliente experimentar e escolher suas roupas com calma',
          icon: '✨',
          color: 'emerald',
        },
        {
          id: 'moda_dance_fashion',
          name: 'Electro Fashion & Desfile',
          description: 'Batidas contagiantes de passarela para fins de semana e grandes liquidações',
          icon: '👠',
          color: 'red',
        },
        {
          id: 'moda_brasil_groove',
          name: 'Brasil Groove & MPB Chic',
          description: 'Bossa pop, groove brasileiro e elegância descontraída para a loja',
          icon: '🌴',
          color: 'amber',
        },
        {
          id: 'natal_final_de_ano',
          name: 'Natal & Fim de Ano Fashion',
          description: 'Clássicos festivos em versões elegantes e luminosas para compras de fim de ano',
          icon: '🎄',
          color: 'orange',
        },
      ];

    case 'farmacia':
      return [
        {
          id: 'farmacia_bem_estar',
          name: 'Harmonia & Bem-Estar',
          description: 'Instrumental suave, piano e frequências serenas transmitindo saúde, calma e cuidado',
          icon: '🌿',
          color: 'emerald',
        },
        {
          id: 'farmacia_acustico_suave',
          name: 'Acústico Suave & Tranquilo',
          description: 'Violão delicado e acolhedor para atendimento atencioso no balcão e dermocosméticos',
          icon: '💊',
          color: 'sky',
        },
        {
          id: 'farmacia_piano_relax',
          name: 'Piano & Soft Ambient',
          description: 'Melodias relaxantes que acolhem o cliente e transmitem total tranquilidade',
          icon: '🌸',
          color: 'purple',
        },
        {
          id: 'farmacia_pop_leve',
          name: 'Pop Leve & Otimista',
          description: 'Músicas positivas, leves e ensolaradas para um dia a dia saudável e agradável',
          icon: '☀️',
          color: 'amber',
        },
        {
          id: 'natal_final_de_ano',
          name: 'Natal de Paz, Saúde & Esperança',
          description: 'Canções natalinas delicadas e serenas para momentos de acolhimento',
          icon: '🎄',
          color: 'red',
        },
      ];

    case 'petshop':
      return [
        {
          id: 'pet_alegria',
          name: 'Pop Alegre & Família Pet',
          description: 'Músicas animadas, contagiantes e alto astral para passear com os pets na loja',
          icon: '🐾',
          color: 'orange',
        },
        {
          id: 'pet_acustico_zen',
          name: 'Acústico Relaxante para Pets',
          description: 'Violão suave desenvolvido para tranquilizar cães e gatos e agradar os tutores',
          icon: '🐕',
          color: 'emerald',
        },
        {
          id: 'pet_country_agro',
          name: 'Country & Sertanejo Raiz',
          description: 'Sucessos campestres e sertanejo acústico com clima acolhedor de agropecuária',
          icon: '🤠',
          color: 'amber',
        },
        {
          id: 'pet_pop_festa',
          name: 'Festa Animal & Ritmo Divertido',
          description: 'Batidas leves e descontraídas para banho, tosa e compras de mimos',
          icon: '🎾',
          color: 'purple',
        },
        {
          id: 'natal_final_de_ano',
          name: 'Natal Mágico dos Pets',
          description: 'Celebração natalina alegre para presentear cães, gatos e a família toda no fim de ano',
          icon: '🎄',
          color: 'red',
        },
      ];

    case 'construcao':
      return [
        {
          id: 'construcao_classic_rock',
          name: 'Classic Rock & Pop Rock',
          description: 'Guitarras marcantes e hinos clássicos para mestres de obras, construtores e clientes',
          icon: '🔨',
          color: 'red',
        },
        {
          id: 'construcao_sertanejo',
          name: 'Sertanejo & Ritmos da Construção',
          description: 'Grandes sucessos nacionais com alta energia para movimentar as vendas',
          icon: '🤠',
          color: 'amber',
        },
        {
          id: 'construcao_pop_dinamico',
          name: 'Pop Dinâmico & Balcão Forte',
          description: 'Ritmo enérgico para acelerar o atendimento de balcão e carregamento de materiais',
          icon: '⚡',
          color: 'orange',
        },
        {
          id: 'construcao_flashback',
          name: 'Flashback & Clássicos de Ouro',
          description: 'Músicas inesquecíveis das rádios para acompanhar o dia todo na loja',
          icon: '📻',
          color: 'purple',
        },
        {
          id: 'natal_final_de_ano',
          name: 'Natal & Ano Novo na Reforma',
          description: 'Trilhas festivas e inspiradoras para quem está reformando e preparando o lar para o fim de ano',
          icon: '🎄',
          color: 'emerald',
        },
      ];

    case 'beleza':
      return [
        {
          id: 'beleza_glamour_lounge',
          name: 'Lounge Glamour & Chillout',
          description: 'Eletrônico refinado, deep house suave e lounge para maquiagem, skincare e perfumes',
          icon: '💄',
          color: 'purple',
        },
        {
          id: 'beleza_pop_divas',
          name: 'Pop Divas & Estilo Marcante',
          description: 'Grandes vozes femininas e hits envolventes para inspirar beleza e autoestima',
          icon: '✨',
          color: 'pink',
        },
        {
          id: 'beleza_spa_relax',
          name: 'Spa & Autocuidado Profundo',
          description: 'Sons relaxantes, piano e notas suaves para uma experiência sensorial de bem-estar',
          icon: '🌸',
          color: 'emerald',
        },
        {
          id: 'natal_final_de_ano',
          name: 'Natal Radiante & Glamour',
          description: 'Clássicos natalinos em arranjos sofisticados para presentes e festas',
          icon: '🎄',
          color: 'red',
        },
      ];

    case 'restaurante':
      return [
        {
          id: 'rest_bossa_jazz',
          name: 'Bossa Nova & Jazz Clássico',
          description: 'Violão brasileiro, saxofone e jazz elegante para harmonizar com boa gastronomia',
          icon: '🍽️',
          color: 'amber',
        },
        {
          id: 'rest_mpb_acustica',
          name: 'MPB & Voz e Violão',
          description: 'Clássicos da música brasileira acolhedora para almoços, jantares e encontros',
          icon: '🎸',
          color: 'emerald',
        },
        {
          id: 'rest_pop_gourmet',
          name: 'Pop Acústico & Café Lounge',
          description: 'Música agradável no volume ideal para saborear conversas e momentos deliciosos',
          icon: '☕',
          color: 'purple',
        },
        {
          id: 'natal_final_de_ano',
          name: 'Natal Festivo & Ceia em Família',
          description: 'Melodias acolhedoras para comemorações e confraternizações',
          icon: '🎄',
          color: 'red',
        },
      ];

    case 'autopecas':
      return [
        {
          id: 'auto_rock_estrada',
          name: 'Classic Rock & Rádio Rodovia',
          description: 'Guitarras de estrada, rock clássico e energia para apaixonados por motores e carros',
          icon: '🚗',
          color: 'red',
        },
        {
          id: 'auto_pop_rock',
          name: 'Pop Rock Comercial & Oficina',
          description: 'Batida potente e dinâmica para balcão de peças e área de serviços automotivos',
          icon: '🔧',
          color: 'orange',
        },
        {
          id: 'auto_flashback',
          name: 'Flashback Anos 80 & 90',
          description: 'Sucessos memoráveis para acompanhar a jornada de trabalho e atendimento',
          icon: '⚡',
          color: 'purple',
        },
        {
          id: 'natal_final_de_ano',
          name: 'Natal & Estrada de Fim de Ano',
          description: 'Hits festivos em ritmo dinâmico para quem vai pegar a estrada',
          icon: '🎄',
          color: 'emerald',
        },
      ];

    case 'otica':
      return [
        {
          id: 'otica_jazz_refinado',
          name: 'Jazz Suave & Lounge Ótico',
          description: 'Harmonias limpas e refinadas para um atendimento exclusivo e personalizado',
          icon: '👓',
          color: 'purple',
        },
        {
          id: 'otica_piano_moderno',
          name: 'Piano Moderno & Neo-Clássico',
          description: 'Requinte sonoro ideal para prova de armações de grife e joias finas',
          icon: '💎',
          color: 'sky',
        },
        {
          id: 'otica_acustico_calmo',
          name: 'Acústico Delicado & Calma',
          description: 'Ambiente sereno para consultas visuais e escolha dos melhores óculos',
          icon: '✨',
          color: 'emerald',
        },
        {
          id: 'natal_final_de_ano',
          name: 'Natal Nobre & Noite de Brilho',
          description: 'Arranjos natalinos sofisticados e encantadores',
          icon: '🎄',
          color: 'amber',
        },
      ];

    case 'geral':
    default:
      if (niche === 'geral') {
        return [
          {
            id: 'geral_pop_comercial',
            name: 'Top Hits das Rádios & Pop',
            description: 'Os maiores sucessos comerciais das rádios para animar os corredores e lojas',
            icon: '🛍️',
            color: 'orange',
          },
          {
            id: 'geral_brasil_sucessos',
            name: 'Brasilidades & Sertanejo Pop',
            description: 'Alegria, ritmo e descontração para o comércio de variedades e utilidades',
            icon: '☀️',
            color: 'amber',
          },
          {
            id: 'geral_acustico',
            name: 'Acústico Leve para Família',
            description: 'Harmonias suaves para compras agradáveis sem pressa',
            icon: '☕',
            color: 'sky',
          },
          {
            id: 'natal_final_de_ano',
            name: 'Natal Festivo em Família',
            description: 'Clássicos alegres de fim de ano para compras e presentes',
            icon: '🎄',
            color: 'red',
          },
        ];
      }

      // Default supermercado
      return [
        {
          id: 'pop_varejo',
          name: 'Pop & Varejo Comercial',
          description: 'Hits animados e ritmo comercial moderno para compras do dia a dia no supermercado',
          icon: '🛒',
          color: 'orange',
        },
        {
          id: 'acustico_manha',
          name: 'Manhã, Padaria & Hortifrúti',
          description: 'Violão acústico suave, frescor matinal e compras aconchegantes',
          icon: '🥖',
          color: 'emerald',
        },
        {
          id: 'energetico_ofertas',
          name: 'Super Ofertas & Batidão de Preço',
          description: 'Batida acelerada para promoções relâmpago, queima de estoque e hora do rush',
          icon: '⚡',
          color: 'red',
        },
        {
          id: 'lounge_gourmet',
          name: 'Lounge Empório & Adega Gourmet',
          description: 'Smooth lounge e harmonia sofisticada para vinhos, queijos nobres e empório',
          icon: '🍷',
          color: 'purple',
        },
        {
          id: 'brasil_sucessos',
          name: 'Brasilidades & Sertanejo Suave',
          description: 'Ritmos populares brasileiros, clima acolhedor de feira e fim de semana',
          icon: '🤠',
          color: 'amber',
        },
        {
          id: 'tarde_calma',
          name: 'Tarde Tranquila & Clássicos de Loja',
          description: 'Músicas suaves e relaxantes para compras calmas sem pressa',
          icon: '☕',
          color: 'sky',
        },
        {
          id: 'natal_final_de_ano',
          name: 'Natal & Final de Ano Mágico',
          description: 'Clássicos natalinos, sinos festivos e celebração para compras de Natal e Réveillon no supermercado',
          icon: '🎄',
          color: 'red',
        },
      ];
  }
}

// =========================================================================
// MÚSICAS AMBIENTE DA RÁDIO POR NICHO (Tracks da Programação Musical)
// =========================================================================
export function getMusicTracksByNiche(niche: ProjectNiche = 'supermercado'): RadioMusicTrack[] {
  switch (niche) {
    case 'moda':
      return [
        {
          id: 'music-moda-runway-pop',
          title: 'Runway Pop & Vitrine Moderna',
          artist: 'Fashion Hits Club',
          style: 'Pop Chic & Batida Moderna (122 BPM)',
          category: 'moda_pop_chic',
          playlistId: 'moda_pop_chic',
          audioUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          durationSeconds: 210,
          bpm: 122,
          active: true,
        },
        {
          id: 'music-moda-boutique-vibes',
          title: 'Boutique Vibes & Sunset',
          artist: 'Atelier Sound Project',
          style: 'Deep House & Pop Elegante (120 BPM)',
          category: 'moda_pop_chic',
          playlistId: 'moda_pop_chic',
          audioUrl: '/api/soundtracks/radio_sucesso/preview.mp3',
          durationSeconds: 195,
          bpm: 120,
          active: true,
        },
        {
          id: 'music-moda-indie-chic',
          title: 'Indie Mood & Roupas Lindas',
          artist: 'Urban Trends Ensemble',
          style: 'Indie Pop & R&B Descontraído (116 BPM)',
          category: 'moda_indie_lounge',
          playlistId: 'moda_indie_lounge',
          audioUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          durationSeconds: 190,
          bpm: 116,
          active: true,
        },
        {
          id: 'music-moda-acoustic-fitting',
          title: 'Provador Confortável & Lo-Fi',
          artist: 'Boutique Acústica',
          style: 'Violão Suave & Lo-Fi Aconchegante (102 BPM)',
          category: 'moda_acoustic_boutique',
          playlistId: 'moda_acoustic_boutique',
          audioUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
          durationSeconds: 185,
          bpm: 102,
          active: true,
        },
        {
          id: 'music-moda-passarela-beat',
          title: 'Passarela & Coleção Nova',
          artist: 'Electro Fashion Groove',
          style: 'Electro Fashion & Passarela (126 BPM)',
          category: 'moda_dance_fashion',
          playlistId: 'moda_dance_fashion',
          audioUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
          durationSeconds: 180,
          bpm: 126,
          active: true,
        },
        {
          id: 'music-moda-bossa-groove',
          title: 'Bossa Chic & Estilo Brasileiro',
          artist: 'Rio Fashion Trio',
          style: 'Bossa Pop & Harmonia Sofisticada (110 BPM)',
          category: 'moda_brasil_groove',
          playlistId: 'moda_brasil_groove',
          audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
          durationSeconds: 220,
          bpm: 110,
          active: true,
        },
        {
          id: 'music-moda-natal-chic',
          title: 'Natal Fashion & Luzes da Cidade',
          artist: 'Orquestra Glamour Holiday',
          style: 'Clássico Festivo & Arranjo Pop Sofisticado (118 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          durationSeconds: 200,
          bpm: 118,
          active: true,
        },
      ];

    case 'farmacia':
      return [
        {
          id: 'music-farmacia-harmonia',
          title: 'Harmonia & Bem-Estar Diário',
          artist: 'Saúde & Serenidade Ensemble',
          style: 'Instrumental Suave & Cuidado (98 BPM)',
          category: 'farmacia_bem_estar',
          playlistId: 'farmacia_bem_estar',
          audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
          durationSeconds: 225,
          bpm: 98,
          active: true,
        },
        {
          id: 'music-farmacia-acustico-paz',
          title: 'Acústico Calmo de Farmácia',
          artist: 'Violão da Saúde',
          style: 'Violão Delicado & Clima de Paz (104 BPM)',
          category: 'farmacia_acustico_suave',
          playlistId: 'farmacia_acustico_suave',
          audioUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
          durationSeconds: 195,
          bpm: 104,
          active: true,
        },
        {
          id: 'music-farmacia-piano-zen',
          title: 'Piano Relax & Dermocosméticos',
          artist: 'Clínica & Spa Sound',
          style: 'Piano Suave & Frequências Tranquilas (92 BPM)',
          category: 'farmacia_piano_relax',
          playlistId: 'farmacia_piano_relax',
          audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
          durationSeconds: 230,
          bpm: 92,
          active: true,
        },
        {
          id: 'music-farmacia-pop-otimista',
          title: 'Dia Lindo & Vida Saudável',
          artist: 'Viva Bem Acoustic',
          style: 'Pop Acústico Alegre & Ensolarado (115 BPM)',
          category: 'farmacia_pop_leve',
          playlistId: 'farmacia_pop_leve',
          audioUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          durationSeconds: 190,
          bpm: 115,
          active: true,
        },
        {
          id: 'music-farmacia-natal-paz',
          title: 'Natal de Paz & Esperança',
          artist: 'Harmonia de Fim de Ano',
          style: 'Arranjo Delicado com Sinos e Cordas (90 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_noite_feliz/preview.mp3',
          durationSeconds: 215,
          bpm: 90,
          active: true,
        },
      ];

    case 'petshop':
      return [
        {
          id: 'music-pet-alegria-total',
          title: 'Passeio com o Pet & Muita Festa',
          artist: 'Turma Animal Sound',
          style: 'Pop Alegre & Contagiante (122 BPM)',
          category: 'pet_alegria',
          playlistId: 'pet_alegria',
          audioUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          durationSeconds: 200,
          bpm: 122,
          active: true,
        },
        {
          id: 'music-pet-zen-calmante',
          title: 'Acústico Tranquilo para Pets',
          artist: 'Violão & Ronrom',
          style: 'Melodias Calmantes Anti-Estresse (96 BPM)',
          category: 'pet_acustico_zen',
          playlistId: 'pet_acustico_zen',
          audioUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
          durationSeconds: 210,
          bpm: 96,
          active: true,
        },
        {
          id: 'music-pet-country-amigo',
          title: 'Clima Caipira & Agro Amigo',
          artist: 'Violas da Fazenda',
          style: 'Sertanejo Acústico & Ritmo Raiz (112 BPM)',
          category: 'pet_country_agro',
          playlistId: 'pet_country_agro',
          audioUrl: '/api/soundtracks/gospel_inspiracional/preview.mp3',
          durationSeconds: 195,
          bpm: 112,
          active: true,
        },
        {
          id: 'music-pet-banho-tosa-pop',
          title: 'Banho, Tosa & Brincadeira',
          artist: 'Bichinhos & Cia',
          style: 'Pop Animado & Leve (118 BPM)',
          category: 'pet_pop_festa',
          playlistId: 'pet_pop_festa',
          audioUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          durationSeconds: 185,
          bpm: 118,
          active: true,
        },
        {
          id: 'music-pet-natal-feliz',
          title: 'Jingle Bells dos Pets',
          artist: 'Patas & Sinos de Natal',
          style: 'Clássico Natalino Divertido & Alegre (120 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_jingle_bells/preview.mp3',
          durationSeconds: 190,
          bpm: 120,
          active: true,
        },
      ];

    case 'construcao':
      return [
        {
          id: 'music-construcao-classic-rock',
          title: 'Rock de Obra & Energia Máxima',
          artist: 'Guitarras do Brasil',
          style: 'Classic Rock Marcante (126 BPM)',
          category: 'construcao_classic_rock',
          playlistId: 'construcao_classic_rock',
          audioUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
          durationSeconds: 205,
          bpm: 126,
          active: true,
        },
        {
          id: 'music-construcao-sertanejo-forca',
          title: 'Sertanejo Forte & Produtividade',
          artist: 'Bate Palma na Obra',
          style: 'Sertanejo Animado de Trabalho (118 BPM)',
          category: 'construcao_sertanejo',
          playlistId: 'construcao_sertanejo',
          audioUrl: '/api/soundtracks/gospel_inspiracional/preview.mp3',
          durationSeconds: 190,
          bpm: 118,
          active: true,
        },
        {
          id: 'music-construcao-pop-balcao',
          title: 'Balcão Cheio & Vendas em Alta',
          artist: 'Ritmo da Construção',
          style: 'Pop Comercial Firme (120 BPM)',
          category: 'construcao_pop_dinamico',
          playlistId: 'construcao_pop_dinamico',
          audioUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          durationSeconds: 195,
          bpm: 120,
          active: true,
        },
        {
          id: 'music-construcao-flashback',
          title: 'Grandes Clássicos de Ouro',
          artist: 'Rádio Memória Hits',
          style: 'Pop Rock & Flashback Nostálgico (115 BPM)',
          category: 'construcao_flashback',
          playlistId: 'construcao_flashback',
          audioUrl: '/api/soundtracks/radio_sucesso/preview.mp3',
          durationSeconds: 215,
          bpm: 115,
          active: true,
        },
        {
          id: 'music-construcao-natal',
          title: 'Boas Festas na Casa Nova',
          artist: 'Família & Reforma Natal',
          style: 'Harmonia Festiva & Esperança (114 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_boas_festas/preview.mp3',
          durationSeconds: 195,
          bpm: 114,
          active: true,
        },
      ];

    case 'beleza':
      return [
        {
          id: 'music-beleza-glamour',
          title: 'Glamour Lounge & Estilo Chic',
          artist: 'Perfumaria Sound Club',
          style: 'Deep Lounge & Sofisticação (118 BPM)',
          category: 'beleza_glamour_lounge',
          playlistId: 'beleza_glamour_lounge',
          audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
          durationSeconds: 220,
          bpm: 118,
          active: true,
        },
        {
          id: 'music-beleza-divas-pop',
          title: 'Pop Divas & Autoestima',
          artist: 'Beauty Hits Studio',
          style: 'Pop Envolvente & Vibrante (122 BPM)',
          category: 'beleza_pop_divas',
          playlistId: 'beleza_pop_divas',
          audioUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          durationSeconds: 200,
          bpm: 122,
          active: true,
        },
        {
          id: 'music-beleza-spa-relax',
          title: 'Spa & Aroma Terapia Suave',
          artist: 'Zen Beauty Ensemble',
          style: 'Sons Relaxantes & Delicadeza (95 BPM)',
          category: 'beleza_spa_relax',
          playlistId: 'beleza_spa_relax',
          audioUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
          durationSeconds: 235,
          bpm: 95,
          active: true,
        },
        {
          id: 'music-beleza-natal',
          title: 'Natal Radiante & Brilho Dourado',
          artist: 'Holiday Glamour Strings',
          style: 'Arranjo Natalino Sofisticado (116 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          durationSeconds: 205,
          bpm: 116,
          active: true,
        },
      ];

    case 'restaurante':
      return [
        {
          id: 'music-rest-bossa-jazz',
          title: 'Bossa & Sabor Brasileiro',
          artist: 'Trio Bossa Gourmet',
          style: 'Bossa Nova & Violão Suave (106 BPM)',
          category: 'rest_bossa_jazz',
          playlistId: 'rest_bossa_jazz',
          audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
          durationSeconds: 220,
          bpm: 106,
          active: true,
        },
        {
          id: 'music-rest-mpb-acustica',
          title: 'Voz & Violão no Almoço',
          artist: 'MPB no Prato',
          style: 'MPB Aconchegante (102 BPM)',
          category: 'rest_mpb_acustica',
          playlistId: 'rest_mpb_acustica',
          audioUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
          durationSeconds: 210,
          bpm: 102,
          active: true,
        },
        {
          id: 'music-rest-cafe-lounge',
          title: 'Café Lounge & Boa Conversa',
          artist: 'Bistrô Acoustic',
          style: 'Pop Acústico Confortável (114 BPM)',
          category: 'rest_pop_gourmet',
          playlistId: 'rest_pop_gourmet',
          audioUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          durationSeconds: 195,
          bpm: 114,
          active: true,
        },
        {
          id: 'music-rest-natal',
          title: 'Ceia Especial de Natal & Família',
          artist: 'Orquestra Sabores de Fim de Ano',
          style: 'Melodia Festiva & Acolhedora (112 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_boas_festas/preview.mp3',
          durationSeconds: 200,
          bpm: 112,
          active: true,
        },
      ];

    case 'autopecas':
      return [
        {
          id: 'music-auto-classic-rock',
          title: 'Estrada Aberta & Rock Clássico',
          artist: 'Rodovia Rockers',
          style: 'Classic Rock Automotivo (125 BPM)',
          category: 'auto_rock_estrada',
          playlistId: 'auto_rock_estrada',
          audioUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
          durationSeconds: 215,
          bpm: 125,
          active: true,
        },
        {
          id: 'music-auto-pop-rock',
          title: 'Motor Ligado & Peças Novas',
          artist: 'Garagem Hits',
          style: 'Pop Rock Firme & Moderno (120 BPM)',
          category: 'auto_pop_rock',
          playlistId: 'auto_pop_rock',
          audioUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          durationSeconds: 195,
          bpm: 120,
          active: true,
        },
        {
          id: 'music-auto-flashback',
          title: 'Flashback dos Anos de Ouro',
          artist: 'Vintage Highway Band',
          style: 'Hits Clássicos 80 & 90 (116 BPM)',
          category: 'auto_flashback',
          playlistId: 'auto_flashback',
          audioUrl: '/api/soundtracks/radio_sucesso/preview.mp3',
          durationSeconds: 205,
          bpm: 116,
          active: true,
        },
        {
          id: 'music-auto-natal',
          title: 'Fim de Ano & Estrada Segura',
          artist: 'Caravana Holiday',
          style: 'Arranjo Dinâmico Festivo (118 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_fim_de_ano/preview.mp3',
          durationSeconds: 190,
          bpm: 118,
          active: true,
        },
      ];

    case 'otica':
      return [
        {
          id: 'music-otica-jazz-refinado',
          title: 'Jazz Suave & Precisão Visual',
          artist: 'Lounge Nobre Ensemble',
          style: 'Jazz Contemporâneo Limpo (96 BPM)',
          category: 'otica_jazz_refinado',
          playlistId: 'otica_jazz_refinado',
          audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
          durationSeconds: 230,
          bpm: 96,
          active: true,
        },
        {
          id: 'music-otica-piano-moderno',
          title: 'Piano Moderno & Armações de Grife',
          artist: 'Atelier Visual Clássico',
          style: 'Piano Sofisticado & Límpido (92 BPM)',
          category: 'otica_piano_moderno',
          playlistId: 'otica_piano_moderno',
          audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
          durationSeconds: 220,
          bpm: 92,
          active: true,
        },
        {
          id: 'music-otica-acustico-calmo',
          title: 'Conforto & Escolha com Calma',
          artist: 'Visão & Serenidade',
          style: 'Acústico Delicado e Relaxante (102 BPM)',
          category: 'otica_acustico_calmo',
          playlistId: 'otica_acustico_calmo',
          audioUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
          durationSeconds: 195,
          bpm: 102,
          active: true,
        },
        {
          id: 'music-otica-natal',
          title: 'Natal Nobre & Noite Iluminada',
          artist: 'Orquestra Luz de Natal',
          style: 'Arranjo Elegante com Harpa e Sinos (110 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_noite_feliz/preview.mp3',
          durationSeconds: 210,
          bpm: 110,
          active: true,
        },
      ];

    case 'geral':
    default:
      if (niche === 'geral') {
        return [
          {
            id: 'music-geral-pop-top',
            title: 'Top Hits Comerciais do Rádio',
            artist: 'Mega Varejo Brasil',
            style: 'Pop Hit Contagiante (122 BPM)',
            category: 'geral_pop_comercial',
            playlistId: 'geral_pop_comercial',
            audioUrl: '/api/soundtracks/batida_comercial/preview.mp3',
            durationSeconds: 200,
            bpm: 122,
            active: true,
          },
          {
            id: 'music-geral-brasil-alegria',
            title: 'Brasilidades & Festa no Comércio',
            artist: 'Samba & Sertanejo Mix',
            style: 'Ritmo Brasileiro Comercial (116 BPM)',
            category: 'geral_brasil_sucessos',
            playlistId: 'geral_brasil_sucessos',
            audioUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
            durationSeconds: 190,
            bpm: 116,
            active: true,
          },
          {
            id: 'music-geral-acustico-familia',
            title: 'Compras em Família com Calma',
            artist: 'Acústico Amigo',
            style: 'Violão Agradável & Suave (105 BPM)',
            category: 'geral_acustico',
            playlistId: 'geral_acustico',
            audioUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
            durationSeconds: 195,
            bpm: 105,
            active: true,
          },
          {
            id: 'music-geral-natal-festa',
            title: 'Natal das Famílias & Celebração',
            artist: 'Coral Festivo do Comércio',
            style: 'Clássicos de Natal com Alegria (120 BPM)',
            category: 'natal_final_de_ano',
            playlistId: 'natal_final_de_ano',
            audioUrl: '/api/soundtracks/natal_boas_festas/preview.mp3',
            durationSeconds: 195,
            bpm: 120,
            active: true,
          },
        ];
      }

      // Default supermercado
      return [
        {
          id: 'music-varejo-alegre',
          title: 'Manhã de Compras & Ofertas',
          artist: 'Rádio Supermercado Instrumental',
          style: 'Pop Varejo Alegre & Família (124 BPM)',
          category: 'pop_varejo',
          playlistId: 'pop_varejo',
          audioUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          durationSeconds: 185,
          bpm: 124,
          active: true,
        },
        {
          id: 'music-batida-comercial',
          title: 'Pop Comercial Varejo Hit',
          artist: 'Estúdio Som de Loja',
          style: 'Batida Pop Comercial Moderna (120 BPM)',
          category: 'pop_varejo',
          playlistId: 'pop_varejo',
          audioUrl: '/api/soundtracks/batida_comercial/preview.mp3',
          durationSeconds: 210,
          bpm: 120,
          active: true,
        },
        {
          id: 'music-radio-sucesso',
          title: 'Rádio Sucesso do Varejo',
          artist: 'Varejo FM Mix',
          style: 'Hit Comercial Contagiante de Loja (122 BPM)',
          category: 'pop_varejo',
          playlistId: 'pop_varejo',
          audioUrl: '/api/soundtracks/radio_sucesso/preview.mp3',
          durationSeconds: 195,
          bpm: 122,
          active: true,
        },
        {
          id: 'music-acustico-hortifruti',
          title: 'Feirinha & Padaria Acústica',
          artist: 'Violão & Café',
          style: 'Violão Acústico Suave & Pão Quentinho (105 BPM)',
          category: 'acustico_manha',
          playlistId: 'acustico_manha',
          audioUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
          durationSeconds: 195,
          bpm: 105,
          active: true,
        },
        {
          id: 'music-manha-tropical',
          title: 'Manhã Tropical & Frutas Frescas',
          artist: 'Acústico & MPB Instrumental',
          style: 'Frescor Matinal para Hortifrúti e Padaria (108 BPM)',
          category: 'acustico_manha',
          playlistId: 'acustico_manha',
          audioUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
          durationSeconds: 180,
          bpm: 108,
          active: true,
        },
        {
          id: 'music-black-friday',
          title: 'Ritmo Quente de Superofertas',
          artist: 'Groove Atacarejo',
          style: 'Batidão Promocional & Hora do Rush (128 BPM)',
          category: 'energetico_ofertas',
          playlistId: 'energetico_ofertas',
          audioUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
          durationSeconds: 175,
          bpm: 128,
          active: true,
        },
        {
          id: 'music-liquidacao-geral',
          title: 'Liquidação Imbatível & Queima Geral',
          artist: 'Super Ofertas Bass',
          style: 'Ritmo Dinâmico de Grande Urgência (130 BPM)',
          category: 'energetico_ofertas',
          playlistId: 'energetico_ofertas',
          audioUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
          durationSeconds: 190,
          bpm: 130,
          active: true,
        },
        {
          id: 'music-institucional-gourmet',
          title: 'Lounge Empório & Adega',
          artist: 'Supermercado Premium',
          style: 'Smooth Piano & Adega de Vinhos Nobres (96 BPM)',
          category: 'lounge_gourmet',
          playlistId: 'lounge_gourmet',
          audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
          durationSeconds: 240,
          bpm: 96,
          active: true,
        },
        {
          id: 'music-bossa-emporio',
          title: 'Bossa & Jazz no Empório Nobre',
          artist: 'Jazz Café Trio',
          style: 'Lounge Acústico Sofisticado para Queijos e Vinhos (100 BPM)',
          category: 'lounge_gourmet',
          playlistId: 'lounge_gourmet',
          audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
          durationSeconds: 215,
          bpm: 100,
          active: true,
        },
        {
          id: 'music-sertanejo-feira',
          title: 'Sertanejo Acústico de Supermercado',
          artist: 'Violas do Brasil',
          style: 'Viola Suave Instrumental & Clima de Feira (112 BPM)',
          category: 'brasil_sucessos',
          playlistId: 'brasil_sucessos',
          audioUrl: '/api/soundtracks/gospel_inspiracional/preview.mp3',
          durationSeconds: 200,
          bpm: 112,
          active: true,
        },
        {
          id: 'music-brasilidades-feira',
          title: 'Brasilidades & MPB de Feira Fresca',
          artist: 'Ritmos do Brasil',
          style: 'Percussão Suave & Harmonia Brasileira (110 BPM)',
          category: 'brasil_sucessos',
          playlistId: 'brasil_sucessos',
          audioUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
          durationSeconds: 190,
          bpm: 110,
          active: true,
        },
        {
          id: 'music-tarde-serena',
          title: 'Tarde Serena de Compras Tranquilas',
          artist: 'Loja Conforto Ensemble',
          style: 'Ambiente Calmo para Compras sem Pressa (98 BPM)',
          category: 'tarde_calma',
          playlistId: 'tarde_calma',
          audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
          durationSeconds: 220,
          bpm: 98,
          active: true,
        },
        {
          id: 'music-jingle-bells-varejo',
          title: 'Jingle Bells & Clássico de Natal',
          artist: 'Orquestra de Natal Supermercado',
          style: 'Sinos Festivos, Harmonia de Natal & Ritmo Alegre (120 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_jingle_bells/preview.mp3',
          durationSeconds: 195,
          bpm: 120,
          active: true,
        },
        {
          id: 'music-noite-feliz-acustico',
          title: 'Noite Feliz & Paz nas Compras',
          artist: 'Piano & Carrilhão Natalino',
          style: 'Arranjo Suave Acústico & Harpa de Natal (88 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_noite_feliz/preview.mp3',
          durationSeconds: 210,
          bpm: 88,
          active: true,
        },
        {
          id: 'music-boas-festas-ano-novo',
          title: 'Boas Festas & Celebração em Família',
          artist: 'Coral & Metais de Fim de Ano',
          style: 'Arranjo Festivo & Espírito de Celebração (116 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_boas_festas/preview.mp3',
          durationSeconds: 190,
          bpm: 116,
          active: true,
        },
        {
          id: 'music-magia-ceia-natal',
          title: 'Magia do Natal & Ceia Especial',
          artist: 'Sinfonia do Varejo Natalino',
          style: 'Sinos de Trenó, Cordas & Clima de Ceia (114 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/natal_magia_ceia/preview.mp3',
          durationSeconds: 205,
          bpm: 114,
          active: true,
        },
        {
          id: 'music-reveillon-sucesso',
          title: 'Ano Novo & Boas Energias no Varejo',
          artist: 'Banda Celebração de Réveillon',
          style: 'Metais, Bateria Vibrante & Contagem Regressiva (122 BPM)',
          category: 'natal_final_de_ano',
          playlistId: 'natal_final_de_ano',
          audioUrl: '/api/soundtracks/reveillon_sucesso/preview.mp3',
          durationSeconds: 185,
          bpm: 122,
          active: true,
        },
      ];
  }
}

// =========================================================================
// TEXTOS DE AMOSTRA DE ESTILO DE LOCUÇÃO POR NICHO ("Ouvir Estilo")
// =========================================================================
export function getStyleDemoTextForNiche(styleId: string, niche: ProjectNiche = 'supermercado'): string {
  if (niche === 'supermercado') {
    switch (styleId) {
      case 'energetica_supermercado':
        return 'Atenção clientes! É mega oferta relâmpago acontecendo agora no corredor central! Aproveite preços baixos em todo o supermercado!';
      case 'animada_promocional':
        return 'O festival de ofertas da semana começou! Venha economizar de verdade e encher o carrinho com as melhores promoções para toda a família!';
      case 'natural_amigavel':
        return 'Bom dia vizinhança! Frutas, verduras e legumes colhidos com todo carinho e frescor, direto para a mesa da sua família.';
      case 'urgente_oportunidade':
        return 'Urgente! Últimas unidades com preço de custo! É queima de estoque exclusiva, corra e garanta o seu antes que acabe tudo!';
      case 'elegante_institucional':
        return 'Tradição e excelência em cada detalhe. Conheça as vantagens exclusivas do nosso clube e seleções especiais de cortes nobres e vinhos.';
      case 'popular_descontraida':
      default:
        return 'Olha o precinho que você gosta! Aqui você leva muito mais por muito menos. Chega mais e confira as ofertas de hoje!';
    }
  }

  switch (niche) {
    case 'moda':
      switch (styleId) {
        case 'energetica_supermercado':
          return 'Atenção clientes! É mega oferta relâmpago acontecendo agora em toda a loja! Aproveite descontos exclusivos nas melhores peças e renove o seu visual!';
        case 'animada_promocional':
          return 'O festival de novidades da semana começou! Venha conferir as tendências da moda e garantir peças incríveis com as melhores promoções!';
        case 'natural_amigavel':
          return 'Olá, seja muito bem-vindo! Peças selecionadas com carinho, tecidos confortáveis e muito estilo para você se sentir bem todos os dias.';
        case 'urgente_oportunidade':
          return 'Urgente! Últimas peças a preço de custo! É queima de estoque exclusiva da coleção, garanta o seu antes que acabe!';
        case 'elegante_institucional':
          return 'Tradição, sofisticação e estilo em cada detalhe. Conheça as vantagens exclusivas do nosso clube e lançamentos da nova coleção.';
        case 'popular_descontraida':
        default:
          return 'Olha o precinho que você gosta! Aqui você leva muito mais estilo por muito menos. Chega mais e confira as novidades!';
      }

    case 'farmacia':
      switch (styleId) {
        case 'energetica_supermercado':
          return 'Atenção clientes! Oferta relâmpago acontecendo agora no nosso balcão! As melhores marcas de saúde, vitaminas e cuidados com descontos especiais!';
        case 'animada_promocional':
          return 'A semana da saúde e do bem-estar começou! Venha conferir ofertas exclusivas em higiene, dermocosméticos e cuidados para toda a família!';
        case 'natural_amigavel':
          return 'Olá, seja muito bem-vindo! A nossa equipe está sempre pronta para cuidar de você e da sua família com toda a atenção e carinho.';
        case 'urgente_oportunidade':
          return 'Urgente! Últimas unidades com preço especial de fábrica! Aproveite as promoções exclusivas e garanta antes que termine!';
        case 'elegante_institucional':
          return 'Cuidado, confiança e excelência em saúde. Conheça os benefícios do nosso programa de fidelidade e linhas selecionadas para seu bem-estar.';
        case 'popular_descontraida':
        default:
          return 'Olha o precinho que você gosta! Economia de verdade em saúde e cuidados pessoais. Venha conferir as ofertas de hoje!';
      }

    case 'petshop':
      switch (styleId) {
        case 'energetica_supermercado':
          return 'Atenção tutores! Oferta relâmpago para o seu pet! Rações premium, petiscos e brinquedos com preços imperdíveis. Aproveite!';
        case 'animada_promocional':
          return 'A semana do pet começou cheia de alegria! Venha economizar e levar muito carinho, nutrição e mimos para o seu melhor amigo!';
        case 'natural_amigavel':
          return 'Olá apaixonados por pets! Cuidado, nutrição de qualidade e muito amor para garantir a saúde e felicidade do seu companheiro.';
        case 'urgente_oportunidade':
          return 'Urgente! Últimos pacotes com preço promocional! É queima de estoque de rações e acessórios, garanta o seu antes que acabe!';
        case 'elegante_institucional':
          return 'Dedicação e carinho para quem é parte da sua família. Conheça as vantagens exclusivas do nosso clube e linhas premium para seu pet.';
        case 'popular_descontraida':
        default:
          return 'Olha o precinho que você gosta! Muito mais mimos para o seu bichinho por muito menos. Chega mais e confira as ofertas!';
      }

    case 'construcao':
      switch (styleId) {
        case 'energetica_supermercado':
          return 'Atenção clientes! Mega oferta relâmpago em materiais básicos e acabamentos! Preço baixo do alicerce ao telhado para a sua obra!';
        case 'animada_promocional':
          return 'O feirão da construção da semana começou! Venha economizar de verdade e levar tudo para a sua reforma com as melhores condições!';
        case 'natural_amigavel':
          return 'Bom dia! Tudo o que você precisa para construir ou reformar com a confiança e o atendimento amigo que você merece.';
        case 'urgente_oportunidade':
          return 'Urgente! Últimos lotes a preço de fábrica! É queima de estoque de pisos, tintas e ferramentas, garanta o seu antes que acabe!';
        case 'elegante_institucional':
          return 'Qualidade comprovada e excelência para o seu projeto. Conheça os benefícios especiais e condições exclusivas da nossa loja.';
        case 'popular_descontraida':
        default:
          return 'Olha o precinho da obra que você gosta! Aqui você constrói e reforma gastando muito menos. Chega mais e confira as ofertas!';
      }

    case 'beleza':
      switch (styleId) {
        case 'energetica_supermercado':
          return 'Atenção clientes! Ofertas especiais em maquiagens, perfumaria e cuidados pessoais. Venha realçar a sua beleza com descontos exclusivos!';
        case 'animada_promocional':
          return 'O festival da beleza começou! Venha conferir lançamentos em cosméticos, produtos capilares e perfumes com preços imperdíveis!';
        case 'natural_amigavel':
          return 'Olá, seja muito bem-vinda! Produtos selecionados com carinho para realçar o seu brilho natural e cuidar de você todos os dias.';
        case 'urgente_oportunidade':
          return 'Urgente! Últimos frascos com desconto exclusivo! É liquidação de fragrâncias e maquiagens, garanta o seu antes que acabe!';
        case 'elegante_institucional':
          return 'Sofisticação e encanto em cada detalhe. Conheça nossa seleção de perfumes importados e marcas consagradas para o seu estilo.';
        case 'popular_descontraida':
        default:
          return 'Olha o precinho que você gosta! Muito mais beleza e perfume por muito menos. Chega mais e aproveite!';
      }

    case 'restaurante':
      switch (styleId) {
        case 'energetica_supermercado':
          return 'Atenção clientes! Pratos especiais e sobremesas deliciosas saindo agora da nossa cozinha! Venha saborear com preços promocionais!';
        case 'animada_promocional':
          return 'O festival gastronômico da semana começou! Reúna os amigos e a família para saborear combos especiais e deliciosos!';
        case 'natural_amigavel':
          return 'Olá, seja bem-vindo! Ingredientes selecionados e receitas preparadas com todo carinho para fazer da sua refeição um momento especial.';
        case 'urgente_oportunidade':
          return 'Urgente! Oferta relâmpago do chef pelos próximos trinta minutos! Peça seu prato favorito com desconto especial da casa!';
        case 'elegante_institucional':
          return 'Alta gastronomia, momentos inesquecíveis e atendimento impecável. Desfrute da melhor experiência gastronômica com a gente.';
        case 'popular_descontraida':
        default:
          return 'Olha o sabor e o precinho que você adora! Comida boa, quentinha e com economia. Bom apetite e aproveite!';
      }

    case 'autopecas':
      switch (styleId) {
        case 'energetica_supermercado':
          return 'Atenção motoristas! Oferta relâmpago em filtros, óleos e peças automotivas! Segurança e economia garantida para o seu veículo!';
        case 'animada_promocional':
          return 'O mês da manutenção começou! Venha conferir descontos especiais em baterias, pneus e pastilhas com as melhores condições!';
        case 'natural_amigavel':
          return 'Olá amigo motorista! Peças com garantia, procedência comprovada e atendimento especializado para deixar seu carro sempre novo.';
        case 'urgente_oportunidade':
          return 'Urgente! Últimos jogos de pastilhas e filtros com preço de custo! Garanta a manutenção do seu veículo antes que acabe!';
        case 'elegante_institucional':
          return 'Tecnologia, segurança e compromisso na estrada. Conheça as marcas líderes mundiais e atendimento técnico de confiança.';
        case 'popular_descontraida':
        default:
          return 'Olha o precinho da manutenção que você gosta! Seu carro revisado e seu bolso no verde. Chega mais e confira!';
      }

    case 'otica':
      switch (styleId) {
        case 'energetica_supermercado':
          return 'Atenção clientes! Festival de armações e óculos solares com descontos imperdíveis! Venha renovar o seu olhar agora mesmo!';
        case 'animada_promocional':
          return 'A semana da saúde visual começou! Venha escolher a sua nova armação com lentes de alta tecnologia e condições facilitadas!';
        case 'natural_amigavel':
          return 'Olá, seja muito bem-vindo! Cuidado com a sua visão, lentes confortáveis e armações leves para você enxergar o mundo com clareza.';
        case 'urgente_oportunidade':
          return 'Urgente! Últimos modelos de grifes selecionadas com descontos de fábrica! Aproveite a oportunidade antes que acabe!';
        case 'elegante_institucional':
          return 'Design exclusivo, precisão óptica e sofisticação. Conheça nossas coleções de marcas consagradas e sinta a diferença no seu olhar.';
        case 'popular_descontraida':
        default:
          return 'Olha o precinho e a elegância que você gosta! Armações modernas por um valor que cabe no seu bolso. Venha conferir!';
      }

    case 'geral':
    default:
      switch (styleId) {
        case 'energetica_supermercado':
          return 'Atenção clientes! É mega oferta relâmpago acontecendo agora em toda a loja! Aproveite descontos exclusivos e preços arrasadores!';
        case 'animada_promocional':
          return 'O festival de ofertas da semana começou! Venha economizar de verdade e aproveitar as melhores promoções preparadas para você!';
        case 'natural_amigavel':
          return 'Olá, seja muito bem-vindo! Produtos selecionados com todo carinho e atendimento dedicado para você e sua família.';
        case 'urgente_oportunidade':
          return 'Urgente! Últimas unidades com preço de custo! É queima de estoque exclusiva, corra e garanta o seu antes que acabe tudo!';
        case 'elegante_institucional':
          return 'Tradição e excelência em cada detalhe. Conheça as vantagens exclusivas do nosso clube e produtos selecionados para você.';
        case 'popular_descontraida':
        default:
          return 'Olha o precinho que você gosta! Aqui você leva muito mais por muito menos. Chega mais e confira as ofertas de hoje!';
      }
  }
}

export function getStyleDemoSoundtrack(styleId: string): SoundtrackId {
  switch (styleId) {
    case 'energetica_supermercado':
      return 'varejo_alegre';
    case 'animada_promocional':
      return 'batida_comercial';
    case 'natural_amigavel':
      return 'acustico_hortifruti';
    case 'urgente_oportunidade':
      return 'black_friday_urgente';
    case 'elegante_institucional':
      return 'institucional_gourmet';
    case 'popular_descontraida':
    default:
      return 'varejo_alegre';
  }
}
