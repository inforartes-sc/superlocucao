import {
  ProjectNiche,
  RadioVinhetaItem,
  QuickRadioTemplate,
  QuickAnnouncementItem,
  RadioQueueItem,
  Project,
  ProductItem,
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
