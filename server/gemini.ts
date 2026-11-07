import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import {
  ProductItem, CampaignType, LocutionStyle, LocutionTone,
  DesiredDuration, PresentationFormat, ProjectNiche, CAMPAIGN_PRESETS, STYLE_PRESETS
} from '../src/types/index.ts';
import { expandUnitsAndMeasuresToWords, spokenCurrency, numberToWordsPT } from '../src/utils/textNormalizer.ts';

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'YOUR_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
}

/**
 * Robust caller with timeout and fallback across active Google Gemini models
 */
async function callGeminiWithFallback(params: any): Promise<any> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY não configurada no .env');
  }

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      return await Promise.race([
        client.models.generateContent({
          ...params,
          model,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_15S')), 15000))
      ]);
    } catch (err: any) {
      console.warn(`[Gemini] Model ${model} failed with ${err?.message || err}. Trying next fallback...`);
      lastError = err;
    }
  }

  throw lastError;
}

/**
 * Utility to convert Brazilian currency and units to spoken text
 */
export function formatSpokenPriceBR(price: number, unit?: string): string {
  if (isNaN(price)) return '';
  const reais = Math.floor(price);
  const centavos = Math.round((price - reais) * 100);

  let text = spokenCurrency(reais, centavos);

  if (unit) {
    const u = unit.toLowerCase().trim();
    if (u === 'kg' || u === 'quilo' || u === 'quilos') text += ' o quilo';
    else if (u === 'g' || u === 'grama' || u === 'gramas' || u === '100g' || u === 'gr') text += ' a cada cem gramas';
    else if (u === 'litro' || u === 'litros' || u === 'l' || u === 'lt') text += ' o litro';
    else if (u === 'unidade' || u === 'unidades' || u === 'un' || u === 'und' || u === 'unid') text += ' a unidade';
    else if (u === 'pacote' || u === 'pacotes' || u === 'pct' || u === 'pcte') text += ' o pacote';
    else if (u === 'caixa' || u === 'caixas' || u === 'cx' || u === 'cxa') text += ' a caixa';
    else if (u === 'bandeja' || u === 'bandejas' || u === 'bdj') text += ' a bandeja';
    else if (u === 'duzia' || u === 'dúzia' || u === 'duzias' || u === 'dúzias' || u === 'dz') text += ' a dúzia';
    else if (u === 'fardo' || u === 'fardos' || u === 'fd') text += ' o fardo';
    else if (u === 'garrafa' || u === 'garrafas' || u === 'gf') text += ' a garrafa';
    else if (u === 'lata' || u === 'latas') text += ' a lata';
    else if (u === 'peça' || u === 'peca' || u === 'pç' || u === 'pc') text += ' a peça';
    else text += ` ${u}`;
  }

  return expandUnitsAndMeasuresToWords(text);
}

/**
 * Intelligent parser: Converts messy pasted list/sheet text into structured supermarket items
 */
export async function parseProductsWithGemini(rawText: string, _niche: ProjectNiche = 'supermercado'): Promise<ProductItem[]> {
  try {
    const systemInstruction = 'Você é um assistente especialista em varejo e supermercados brasileiros. Extraia a lista de produtos, marcas, embalagens e preços do texto a seguir.';

    const response = await callGeminiWithFallback({
      contents: `${systemInstruction}
Nunca invente informações que não estejam no texto.

Texto fornecido:
"""
${rawText}
"""`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'Produtos de supermercado em oferta extraídos',
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Nome do produto' },
              brand: { type: Type.STRING, description: 'Marca do produto' },
              packaging: { type: Type.STRING, description: 'Embalagem ou peso (ex: pacote 5kg, 1L)' },
              promotionalPrice: { type: Type.NUMBER, description: 'Preço promocional em Reais' },
              previousPrice: { type: Type.NUMBER, description: 'Preço anterior numérico se houver, ou 0' },
              unit: { type: Type.STRING, description: 'Unidade de medida (kg, unidade, litro, pacote, caixa, bandeja, duzia)' },
              notes: { type: Type.STRING, description: 'Observações adicionais' },
            },
            required: ['name', 'promotionalPrice'],
          },
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '[]');
    return parsedJson.map((item: any, idx: number) => {
      const price = Number(item.promotionalPrice) || 0;
      return {
        id: `prod-${Date.now()}-${idx + 1}`,
        name: item.name ? expandUnitsAndMeasuresToWords(item.name) : 'Produto em oferta',
        brand: item.brand || undefined,
        packaging: item.packaging ? expandUnitsAndMeasuresToWords(item.packaging) : undefined,
        promotionalPrice: price,
        previousPrice: Number(item.previousPrice) > 0 ? Number(item.previousPrice) : undefined,
        unit: item.unit || 'unidade',
        notes: item.notes || undefined,
        spokenPrice: price > 0 ? formatSpokenPriceBR(price, item.unit) : undefined
      };
    });
  } catch (error: any) {
    if (error?.message?.includes('GEMINI_API_KEY')) {
      console.log('[AI] Modo local ativo: analisando lista de produtos de supermercado.');
    } else {
      console.error('Error in parseProductsWithGemini:', error);
    }
    return fallbackParseProducts(rawText);
  }
}

function fallbackParseProducts(rawText: string): ProductItem[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const items: ProductItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const priceMatch = line.match(/(?:R\$\s*)?(\d{1,4}[.,]\d{2})/i);
    let price = 0;
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(',', '.'));
    }

    let unit = 'unidade';
    if (/(\/|\b)(kg|quilo)s?\b/i.test(line)) unit = 'kg';
    else if (/(\/|\b)(litro|l)s?\b/i.test(line)) unit = 'litro';
    else if (/(\/|\b)(pct|pacote)s?\b/i.test(line)) unit = 'pacote';
    else if (/(\/|\b)(cx|caixa)s?\b/i.test(line)) unit = 'caixa';
    else if (/(\/|\b)(bandeja)s?\b/i.test(line)) unit = 'bandeja';
    else if (/(\/|\b)(duzia|dúzia)s?\b/i.test(line)) unit = 'duzia';

    let cleanName = line
      .replace(/(?:R\$\s*)?\d{1,4}[.,]\d{2}/i, '')
      .replace(/[-–—/]\s*(kg|litro|l|un|unidade|pct|cx|bandeja|duzia)/i, '')
      .replace(/[-–—]\s*$/g, '')
      .trim();

    if (!cleanName) cleanName = `Produto ${i + 1}`;

    items.push({
      id: `prod-${Date.now()}-${i + 1}`,
      name: expandUnitsAndMeasuresToWords(cleanName),
      promotionalPrice: price,
      unit,
      spokenPrice: price > 0 ? formatSpokenPriceBR(price, unit) : undefined
    });
  }

  return items;
}

export interface GenerateScriptParams {
  niche?: ProjectNiche;
  storeName?: string;
  storeCity?: string;
  campaignType: CampaignType;
  style: LocutionStyle;
  desiredDuration: DesiredDuration;
  tone: LocutionTone;
  presentationFormat: PresentationFormat;
  customOpening?: string;
  customClosing?: string;
  freeInstructions?: string;
  products: ProductItem[];
}

export async function generateSupermarketScript(params: GenerateScriptParams): Promise<{
  text: string;
  spokenPhoneticText: string;
  estimatedDurationSeconds: number;
  wordCount: number;
}> {
  const campaignInfo = CAMPAIGN_PRESETS[params.campaignType] || CAMPAIGN_PRESETS['ofertas_dia'];
  const styleInfo = STYLE_PRESETS[params.style] || STYLE_PRESETS['energetica_supermercado'];

  let entityName = params.storeName?.trim();
  const defaultNames = ['Meu Supermercado', 'Supermercado Alvorada', 'Locução Super IA Matriz', 'Nossa Loja'];
  if (!entityName || defaultNames.includes(entityName)) {
    entityName = 'nosso supermercado';
  }

  const replaceEntity = (str: string) => {
    return str
      .replace(/\[Supermercado\]/gi, entityName)
      .replace(/\[Loja\]/gi, entityName)
      .replace(/\[Empresa\]/gi, entityName)
      .replace(/\[Entidade\]/gi, entityName);
  };

  const productsSummary = params.products.map(p => {
    if (p.promotionalPrice && p.promotionalPrice > 0) {
      const prev = p.previousPrice ? `(De R$ ${p.previousPrice.toFixed(2).replace('.', ',')})` : '';
      const spoken = formatSpokenPriceBR(p.promotionalPrice, p.unit);
      return `- ${p.name} ${p.brand ? `[Marca: ${p.brand}]` : ''} ${p.packaging ? `[Emb: ${p.packaging}]` : ''}: R$ ${p.promotionalPrice.toFixed(2).replace('.', ',')} por ${p.unit} ${prev} | Pronúncia falada obrigatória: "${spoken}"`;
    }
    return `- ${p.name} ${p.brand ? `[Marca: ${p.brand}]` : ''} ${p.notes ? `[Obs: ${p.notes}]` : ''}`;
  }).join('\n');

  const systemPrompt = `Você é o mais premiado roteirista de locuções e spots comerciais de rádio interna de supermercados, atacarejos, açougues, hortifrútis e mercearias do Brasil.
Sua missão primordial é criar o roteiro comercial de supermercado perfeito, encarnado na campanha "${campaignInfo.label.toUpperCase()}".

REGRA FUNDAMENTAL E ABSOLUTA — TEXTO 100% POR EXTENSO PARA LOCUÇÃO:
É TERMINANTEMENTE PROIBIDO UTILIZAR ALGARISMOS ARÁBICOS (0 a 9) OU SIGLAS NO TEXTO DO ROTEIRO.
Tudo deve ser escrito integralmente por extenso em português para facilitar e garantir a pronúncia perfeita em todos os modelos de vozes:
- Preços: escreva SEMPRE por extenso (ex: "trinta e seis reais e noventa centavos", "quatro reais e cinquenta centavos", "noventa e nove centavos", "um real"). NUNCA use "R$", "36,90" ou "36.90".
- Pesos e Volumes: escreva SEMPRE por extenso (ex: "cinco quilos", "um quilo e meio", "quinhentos gramas", "trezentos e cinquenta mililitros", "um litro", "dois litros"). NUNCA use "kg", "g", "ml", "L".
- Unidades e Embalagens: escreva SEMPRE por extenso (ex: "a unidade", "o pacote", "a caixa", "a lata", "a bandeja", "o fardo", "a dúzia"). NUNCA use "un", "pct", "cx", "dz", "bdj".
- Números e Parcelas: escreva SEMPRE por extenso (ex: "em até três vezes sem juros", "dez ofertas imperdíveis", "vinte por cento de desconto"). NUNCA use "3x" ou "20%".

REGRAS DE VAREJO E SUPERMERCADO:
1. NÚMEROS, PREÇOS E UNIDADES 100% POR EXTENSO (sem números, sem abreviações).
2. FIDELIDADE AOS PRODUTOS: Apresente todos os produtos fornecidos de forma comercial e convidativa.
3. CAMPANHA E ESTILO:
   - Campanha: "${campaignInfo.label.toUpperCase()}" (${campaignInfo.badge})
   - Diretrizes: ${campaignInfo.themeGuidelines}
   - Expressões: ${campaignInfo.vocabulary.map(v => `• "${v}"`).join(', ')}
   - Ganchos:
${campaignInfo.sampleHooks.map(h => `     • ${replaceEntity(h)}`).join('\n')}
   - Fechamento:
${campaignInfo.sampleClosings.map(c => `     • ${replaceEntity(c)}`).join('\n')}
   - Estilo: "${styleInfo.label}" | Cadência: ${styleInfo.cadence} | Tom: ${params.tone}
4. DURAÇÃO (${params.desiredDuration}):
   - 15s: ~35 a 45 palavras | 30s: ~70 a 85 palavras | 45s: ~105 a 125 palavras | 60s: ~140 a 160 palavras`;

  const userPrompt = `
DADOS DA CAMPANHA DE SUPERMERCADO:
- Tipo de Campanha: ${campaignInfo.label} (${params.campaignType})
- Supermercado: ${entityName} ${params.storeCity ? `em ${params.storeCity}` : ''}
- Estilo: ${styleInfo.label} | Tom: ${params.tone} | Duração: ${params.desiredDuration}
${params.customOpening ? `- Abertura personalizada: "${params.customOpening}"` : ''}
${params.customClosing ? `- Encerramento personalizado: "${params.customClosing}"` : ''}
${params.freeInstructions ? `- Instruções adicionais do lojista: "${params.freeInstructions}"` : ''}

PRODUTOS EM OFERTA:
${productsSummary}

LEMBRE-SE: Preços, números e unidades 100% POR EXTENSO (zero algarismos e zero abreviações no texto gerado)! Retorne um JSON com "text", "spokenPhoneticText", "estimatedDurationSeconds", "wordCount".`;

  try {
    const response = await callGeminiWithFallback({
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: 'Roteiro de locução comercial de supermercado' },
            spokenPhoneticText: { type: Type.STRING, description: 'Texto otimizado com pontuação respiratória' },
            estimatedDurationSeconds: { type: Type.INTEGER, description: 'Duração estimada em segundos' },
            wordCount: { type: Type.INTEGER, description: 'Total de palavras' },
          },
          required: ['text', 'estimatedDurationSeconds', 'wordCount'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (parsed.text && parsed.text.trim().length > 10) {
      const cleanText = expandUnitsAndMeasuresToWords(parsed.text);
      const cleanPhonetic = expandUnitsAndMeasuresToWords(parsed.spokenPhoneticText || parsed.text);
      const words = cleanText.split(/\s+/).length;
      return {
        text: cleanText,
        spokenPhoneticText: cleanPhonetic,
        estimatedDurationSeconds: parsed.estimatedDurationSeconds || Math.max(15, Math.round(words / 2.7)),
        wordCount: words,
      };
    }
    throw new Error('Retorno vazio da IA');
  } catch (error: any) {
    if (error?.message?.includes('GEMINI_API_KEY')) {
      console.log('[AI] Modo local ativo: gerando roteiro temático dinâmico para supermercado.');
    } else {
      console.error('Error generating script with Gemini, using intelligent campaign fallback:', error);
    }
    return generateDynamicCampaignFallback(params);
  }
}

let scriptVariationCounter = 0;

/**
 * Intelligent dynamic generator that crafts distinct, rich supermarket commercial scripts.
 */
function generateDynamicCampaignFallback(
  params: GenerateScriptParams
): {
  text: string;
  spokenPhoneticText: string;
  estimatedDurationSeconds: number;
  wordCount: number;
} {
  let store = params.storeName?.trim();
  const defaultStoreNames = ['Meu Supermercado', 'Supermercado Alvorada', 'Locução Super IA Matriz', 'Nossa Loja'];
  if (!store || defaultStoreNames.includes(store)) {
    store = 'nosso supermercado';
  }
  const varIdx = (scriptVariationCounter++) % 4;

  const openingsByCampaign: Record<string, string[]> = {
    ofertas_dia: [
      `Atenção clientes do ${store}! Só hoje, preparamos as melhores Ofertas do Dia com preços exclusivos pra você economizar de verdade!`,
      `Hoje é dia de economizar no ${store}! Seleção especial de Ofertas do Dia com preços arrasadores nas nossas gôndolas!`,
      `Aproveite o seu dia no ${store}! Ofertas do Dia preparadas especialmente para você fazer render o seu dinheiro!`,
      `Destaque especial do dia no ${store}! Grandes marcas com os menores preços para o seu dia a dia!`,
    ],
    ofertas_semana: [
      `Começou o grande Show de Ofertas da Semana no ${store}! Confira as promoções do nosso encarte para abastecer a sua casa!`,
      `A semana inteira de economia no ${store}! Encarte de ofertas recheado de preços baixos para você e sua família!`,
      `Para quem quer comprar bem e gastar pouco, confira o Tabloide de Ofertas da Semana no ${store}!`,
      `Mais economia para a sua despensa a semana toda! Olha só as ofertas imperdíveis do ${store}:`,
    ],
    superofertas: [
      `O fim de semana chegou com um festival de preços baixos no ${store}! Superofertas imperdíveis para o seu churrasco e almoço de domingo!`,
      `Fim de semana é no ${store}! Preparamos um show de superofertas para fazer o seu dinheiro render de verdade!`,
      `Atenção você que quer economizar neste fim de semana! O ${store} derrubou os preços em todos os setores da loja!`,
      `Final de semana recheado de economia no ${store}! Venha conferir as melhores carnes, bebidas e mantimentos com preço de arrasar!`,
    ],
    quarta_carne: [
      `Atenção apreciadores de uma boa carne! Começou o tradicional Festival de Carnes no ${store}!`,
      `Carnes selecionadas com procedência, cortes nobres e o menor preço da cidade! É a Quarta e Quinta da Carne no ${store}!`,
      `O melhor açougue da região está em festa! Confira as carnes frescas e inspecionadas preparadas para você no ${store}!`,
      `Economia no churrasco e no almoço da família! Festival do Açougue e Carnes Nobres no ${store}!`,
    ],
    festival_hortifruti: [
      `Tem feirinha fresca hoje no ${store}! Chegou o Festival de Hortifrúti com frutas, legumes e verduras direto do campo!`,
      `Leve saúde, frescor e muita cor para a mesa da sua família! É a Terça e Quarta Verde no ${store}!`,
      `O melhor da horta com preço de feira limpa! Venha conferir o festival de hortifrúti do ${store}!`,
      `Frutas selecionadas e verduras crocantes com preços que cabem no seu bolso! Só hoje no ${store}!`,
    ],
    queima_estoque: [
      `Parou tudo! É Mega Queima de Estoque no ${store}! Preços a preço de custo pra zerar tudo nas gôndolas!`,
      `Atenção: É Queima de Estoque total no ${store}! Preços despencando para liberar espaço na loja!`,
      `Últimas unidades com desconto arrasador! Começou o Feirão de Queima de Estoque do ${store}!`,
      `Loucura de preços no ${store}! Queima de estoque com produtos selecionados a preço de fábrica!`,
    ],
    aniversario: [
      `É mês de festa! O ${store} está comemorando aniversário, a festa é nossa, mas o presentão de economia no carrinho é todo seu!`,
      `Parabéns pra você que compra no ${store}! No nosso aniversário, o presente é preço baixo e ofertas exclusivas na sua mão!`,
      `O ${store} faz aniversário e quem ganha o show de descontos é você! Venha comemorar com o carrinho cheio!`,
      `Aniversário premiado no ${store}! Grandes marcas com descontos de festa para celebrar com a sua família!`,
    ],
    inauguracao: [
      `Sejam muito bem-vindos à grande inauguração do ${store}! Uma nova loja moderna, confortável e com ofertas especiais de estreia preparadas pra você!`,
      `Portas abertas com festa e economia no ${store}! Venha conhecer nossa nova estrutura e aproveitar preços imbatíveis!`,
      `Chegamos com tudo para cuidar bem de você! Grande inauguração do ${store} com ofertas especiais de boas-vindas!`,
      `A sua nova casa de compras chegou! O ${store} inaugura com os melhores preços e atendimento de primeira para a sua família!`,
    ],
    black_friday: [
      `Atenção clientes: É Black Friday no ${store}! Os preços despencaram e a maior loucura de ofertas do ano começou agora mesmo!`,
      `Alerta de economia máxima no ${store}! Começou o Festival Black Friday, com descontos arrasadores direto na gôndola pra você!`,
      `Parou tudo! É Black Friday de verdade no ${store}! Preparamos preços nunca vistos para você encher o carrinho pagando muito pouco!`,
      `A oportunidade que você esperava o ano inteiro chegou no ${store}! É Black Friday com preços cortados pela metade e ofertas imbatíveis!`,
    ],
    datas_comemorativas: [
      `O clima de celebração chegou com tudo ao ${store}! Tudo para a sua comemoração em família com a mesa farta e a maior economia da cidade!`,
      `Comemore com quem você ama economizando de verdade no ${store}! Ofertas festivas preparadas com carinho pra você!`,
      `Datas especiais pedem mesa farta e preços baixos! Confira os grandes destaques do ${store}:`,
      `Celebre com alegria e economia no bolso! O ${store} preparou uma seleção imperdível para a sua comemoração!`,
    ],
    divulgacao_produtos: [
      `Destaque especial nas gôndolas do ${store}! Conheça as melhores marcas parceiras com qualidade comprovada e economia real!`,
      `Para quem valoriza sabor, rendimento e procedência: confira as marcas consagradas selecionadas para você no ${store}!`,
      `Grandes marcas com preços que você só encontra aqui! Confira a seleção especial do ${store}:`,
      `Qualidade garantida na sua despensa! Conheça as novidades e lançamentos que acabam de chegar ao ${store}!`,
    ],
    institucional: [
      `No ${store}, a sua confiança, o carinho no atendimento e o bem-estar da sua família vêm sempre em primeiro lugar.`,
      `Tradição em cuidar bem de você e da sua família! Comprar no ${store} é garantia de qualidade e procedência todos os dias.`,
      `Mais que um supermercado, um parceiro do seu dia a dia! No ${store}, você encontra variedade, frescor e economia real.`,
      `Qualidade selecionada, atendimento amigo e respeito a você cliente! Essa é a marca registrada do ${store}.`,
    ],
    personalizada: [
      `Atenção clientes amigos do ${store}! Confira os destaques especiais de economia preparados para você hoje!`,
      `Preço baixo e qualidade garantida é no ${store}! Confira agora as melhores oportunidades da loja:`,
      `Para quem quer economizar no carrinho, confira as seleções imperdíveis preparadas pelo ${store}:`,
      `Oportunidade especial nas gôndolas do ${store}! Seleção de produtos com preços imperdíveis:`,
    ],
  };

  const closingsByCampaign: Record<string, string[]> = {
    ofertas_dia: [
      `Mas atenção: ofertas válidas somente hoje ou enquanto durarem os nossos estoques! ${store}, economia garantida no seu dia a dia!`,
      `Preços válidos só hoje! Não deixe para amanhã, corra e aproveite no ${store}!`,
      `Economia de verdade é no ${store}! Passe no caixa e confira o desconto na hora!`,
      `São ofertas exclusivas para hoje! Venha conferir e economizar no ${store}!`,
    ],
    ofertas_semana: [
      `Economia de verdade a semana toda para a sua família é no ${store}! Encha o carrinho pagando muito menos!`,
      `Aproveite a semana inteira de preços baixos no ${store}! Qualidade e procedência no seu carrinho!`,
      `Corra e confira todas as ofertas da semana no ${store}! Aqui o seu dinheiro vale muito mais!`,
      `Venha para o ${store} abastecer a sua despensa com os menores preços da cidade!`,
    ],
    superofertas: [
      `Aproveite neste sábado e domingo! O melhor fim de semana para o seu bolso é aqui no ${store}!`,
      `Vem pro ${store}! Seu fim de semana com carrinho cheio e economia garantida!`,
      `Ofertas válidas para este sábado e domingo enquanto durarem os estoques. Vem correndo pro ${store}!`,
      `Não deixe para depois! Corra para o ${store} e garanta já o churrasco e as compras da família!`,
    ],
    quarta_carne: [
      `Carnes frescas, inspecionadas e com economia de verdade é no açougue do ${store}! Aproveite hoje mesmo!`,
      `Venha garantir o churrasco e as melhores carnes para a sua mesa! Açougue nota dez é no ${store}!`,
      `Qualidade garantida e preços imbatíveis no balcão! Venha economizar na Quarta da Carne do ${store}!`,
      `Passe no açougue do ${store} e comprove a qualidade dos nossos cortes especiais!`,
    ],
    festival_hortifruti: [
      `Frutas, verduras e legumes colhidos com carinho para você economizar com saúde no ${store}!`,
      `Leve mais saúde para a sua mesa gastando muito menos! Festival de Hortifrúti é no ${store}!`,
      `Feirinha completa e fresquinha esperando por você! Venha conferir no ${store}!`,
      `Economia com saúde e qualidade garantida é no hortifrúti do ${store}! Aproveite hoje!`,
    ],
    queima_estoque: [
      `São as últimas unidades na gôndola, não vai sobrar nada! Corra e aproveite a Queima de Estoque do ${store}!`,
      `Pegou, levou! Corra para o ${store} antes que acabem todas as unidades da gôndola!`,
      `Preços válidos até o encerramento dos lotes! Venha garantir o seu no ${store}!`,
      `Queima de estoque de verdade é no ${store}! Quem chega primeiro economiza muito mais!`,
    ],
    aniversario: [
      `Venha comemorar com a gente e encher o carrinho! Aniversário do ${store}, há anos fazendo parte da sua história com economia de verdade!`,
      `Vem festejar a economia no ${store}! É aniversário com presente de verdade para o seu bolso!`,
      `A festa é nossa e a economia é toda sua! Corra para o ${store} e aproveite!`,
      `Aniversário do ${store}: o melhor presente para a sua família comprar bem pagando pouco!`,
    ],
    inauguracao: [
      `Estamos muito felizes em receber você na nossa nova casa! ${store}, feito com muito carinho para você e sua família!`,
      `Venha conhecer nossa nova loja e viver uma experiência completa de compras no ${store}!`,
      `A casa é sua! Venha celebrar nossa grande inauguração no ${store} e aproveite!`,
      `Obrigado pela sua presença! ${store}, perto de você com as melhores marcas e preços!`,
    ],
    black_friday: [
      `Não perca nem mais um segundo! As ofertas da Black Friday do ${store} vão sumir das gôndolas! Corra e garanta o seu agora mesmo!`,
      `Corra para o ${store} e aproveite agora mesmo! Estoque limitado e preços baixos de verdade é só aqui na Black Friday!`,
      `São as maiores ofertas do ano no ${store}! Aproveite hoje mesmo enquanto durarem os nossos estoques!`,
      `Vem pro ${store} aproveitar a Black Friday! Encha o carrinho pagando muito pouco!`,
    ],
    datas_comemorativas: [
      `Aproveite os preços especiais e faça a sua comemoração inesquecível no ${store}!`,
      `O ${store} deseja a você e sua família momentos inesquecíveis com a mesa farta e economia!`,
      `Venha festejar com a gente! Ofertas válidas enquanto durarem os estoques no ${store}!`,
      `Celebre a vida com o carrinho cheio e o bolso feliz aqui no ${store}!`,
    ],
    divulgacao_produtos: [
      `Grandes marcas com o melhor custo-benefício você só encontra no ${store}! Passe e comprove!`,
      `Qualidade comprovada para o seu dia a dia! Leve os melhores produtos pelo menor preço no ${store}!`,
      `Experimente e sinta a diferença! Marcas consagradas com preços especiais no ${store}!`,
      `Tudo para o seu lar com qualidade e garantia de economia real no ${store}!`,
    ],
    institucional: [
      `Baixe nosso aplicativo, faça parte do nosso clube de vantagens e sinta a diferença de comprar no ${store}: tradição em cuidar bem de você.`,
      `Passe no ${store} e comprove o padrão de atendimento que você e sua família merecem. Sempre perto de você.`,
      `Economia, procedência e respeito ao cliente. ${store}, o supermercado da sua família.`,
      `Faça suas compras com tranquilidade no ${store}: qualidade em primeiro lugar todos os dias!`,
    ],
    personalizada: [
      `Aproveite agora mesmo enquanto durarem os nossos estoques. ${store}, economia que você vê no seu carrinho!`,
      `Passe no ${store} e comprove a diferença no caixa! Qualidade e economia para você!`,
      `Ofertas válidas enquanto durarem os estoques! ${store}, sempre perto de você!`,
      `Venha conferir e encher o seu carrinho no ${store}! Aqui o seu dinheiro rende mais!`,
    ],
  };

  const campaignKey = params.campaignType in openingsByCampaign ? params.campaignType : 'ofertas_dia';
  const openingList = openingsByCampaign[campaignKey] || openingsByCampaign['ofertas_dia'];
  const closingList = closingsByCampaign[campaignKey] || closingsByCampaign['ofertas_dia'];

  const opening = params.customOpening || openingList[varIdx % openingList.length];
  const closing = params.customClosing || closingList[varIdx % closingList.length];

  let middleContent = '';

  if (params.products && params.products.length > 0) {
    const connectorSets = [
      ['Preço especial em:', 'E olha só essa oportunidade:', 'Tem também:', 'E não para por aí:', 'No setor de ofertas:'],
      ['Destaque imperdível:', 'Outra grande oportunidade:', 'Preço arrasador em:', 'Confira também:', 'Sensacional:'],
      ['Para o seu carrinho:', 'Preço baixo garantido em:', 'Economia garantida em:', 'Aproveite também:', 'Mais uma ofertaça:'],
      ['Grande oportunidade de hoje:', 'Preço cortado em:', 'Super oferta em:', 'Leve também:', 'Olha só o precinho de:'],
    ];
    const connectors = connectorSets[varIdx % connectorSets.length];

    const productSentences = params.products.map((p, index) => {
      const spoken = formatSpokenPriceBR(p.promotionalPrice, p.unit);
      const packaging = p.packaging ? ` ${expandUnitsAndMeasuresToWords(p.packaging)}` : '';
      const brand = p.brand ? ` ${p.brand}` : '';
      const name = expandUnitsAndMeasuresToWords(p.name);
      const conn = connectors[index % connectors.length];

      if (params.campaignType === 'black_friday') {
        const blackPrefixes = ['Preço esmagado na Black Friday:', 'Desconto Black arrasador em:', 'Oportunidade Black Friday:', 'Direto na gôndola Black:'];
        const pfx = blackPrefixes[(varIdx + index) % blackPrefixes.length];
        return `${pfx} ${name}${brand}${packaging}, por apenas ${spoken}!`;
      }
      if (params.campaignType === 'queima_estoque') {
        const queimaPrefixes = ['Pra zerar o estoque:', 'Pegou levou na queima:', 'Últimas unidades de:', 'Preço de fábrica em:'];
        const pfx = queimaPrefixes[(varIdx + index) % queimaPrefixes.length];
        return `${pfx} ${name}${brand}${packaging}, por apenas ${spoken}!`;
      }
      if (params.campaignType === 'aniversario') {
        const niverPrefixes = ['Presente de aniversário pra você:', 'Oferta de festa em:', 'No show de aniversário:', 'Super desconto comemorativo em:'];
        const pfx = niverPrefixes[(varIdx + index) % niverPrefixes.length];
        return `${pfx} ${name}${brand}${packaging}, por apenas ${spoken}!`;
      }

      if (p.promotionalPrice && p.promotionalPrice > 0) {
        return `${conn} ${name}${brand}${packaging}, por apenas ${spoken}!`;
      }
      const detail = p.brand ? ` com ${p.brand}` : '';
      const extra = p.packaging ? `, ${p.packaging}` : '';
      return `${conn} ${name}${detail}${extra}!`;
    });
    middleContent = productSentences.filter(Boolean).join(' ');
  }

  if (!middleContent) {
    const retailMiddles = [
      `Aqui você encontra economia de verdade em todos os corredores, carnes inspecionadas, hortifrúti fresco e as melhores marcas para abastecer a sua casa.`,
      `Preços baixos garantidos direto na gôndola, variedade completa e o atendimento atencioso que a sua família merece no dia a dia.`,
      `Economia garantida para o seu bolso! Passe no nosso supermercado, encha o carrinho com qualidade e comprove o desconto no caixa.`,
    ];
    middleContent = retailMiddles[varIdx % retailMiddles.length];
  }

  const rawFullText = `${opening} ${middleContent} ${closing}`.replace(/\s+/g, ' ').trim();
  const fullText = expandUnitsAndMeasuresToWords(rawFullText);
  const words = fullText.split(/\s+/).length;

  return {
    text: fullText,
    spokenPhoneticText: fullText,
    estimatedDurationSeconds: Math.max(15, Math.round(words / 2.7)),
    wordCount: words,
  };
}

/**
 * Intelligent local refinement engine for supermarket commercial scripts
 */
export function refineLocally(
  currentText: string,
  action: 'improve' | 'shorten' | 'energize' | 'natural' | 'verify_prices' | 'custom',
  _instruction?: string,
  products?: ProductItem[],
  _niche?: ProjectNiche
): string {
  const text = expandUnitsAndMeasuresToWords(currentText);

  if (products && products.length > 0) {
    if (action === 'energize') {
      const items = products.map((p, i) => {
        const spoken = formatSpokenPriceBR(p.promotionalPrice, p.unit);
        const pkg = p.packaging ? ` ${expandUnitsAndMeasuresToWords(p.packaging)}` : '';
        const brand = p.brand ? ` ${p.brand}` : '';
        const name = expandUnitsAndMeasuresToWords(p.name);
        const calls = [
          'Preço esmagado em:',
          'Sensacional!',
          'Olha essa loucura:',
          'Para zerar tudo:',
          'Ofertaça arrasadora em:'
        ];
        return `${calls[i % calls.length]} ${name}${brand}${pkg}, por apenas ${spoken}!`;
      }).join(' ');
      return expandUnitsAndMeasuresToWords(
        `Atenção para essa explosão de ofertas! Preços no chão e economia máxima no nosso supermercado! ${items} Corra agora mesmo e garanta o seu antes que acabe tudo! Os estoques estão voando!`
      );
    }

    if (action === 'shorten') {
      const items = products.map((p) => {
        const spoken = formatSpokenPriceBR(p.promotionalPrice, p.unit);
        const pkg = p.packaging ? ` ${expandUnitsAndMeasuresToWords(p.packaging)}` : '';
        const name = expandUnitsAndMeasuresToWords(p.name);
        return `${name}${pkg}: só ${spoken}.`;
      }).join(' ');
      return expandUnitsAndMeasuresToWords(
        `Confira os preços baixos de hoje! ${items} Aproveite enquanto durarem os estoques. Vem economizar!`
      );
    }

    if (action === 'natural') {
      const items = products.map((p, i) => {
        const spoken = formatSpokenPriceBR(p.promotionalPrice, p.unit);
        const pkg = p.packaging ? ` ${expandUnitsAndMeasuresToWords(p.packaging)}` : '';
        const name = expandUnitsAndMeasuresToWords(p.name);
        const intros = ['Você encontra', 'tem também', 'além de', 'e para completar'];
        return `${intros[i % intros.length]} ${name}${pkg} por apenas ${spoken}`;
      }).join(', ') + '.';
      return expandUnitsAndMeasuresToWords(
        `Olá cliente amigo! Para deixar o seu dia e a sua semana ainda mais especiais, separamos com muito carinho para você e sua família: ${items} Passe no nosso supermercado, aproveite com tranquilidade e sinta-se em casa. Estamos sempre prontos para atender você!`
      );
    }

    if (action === 'improve') {
      const items = products.map((p, i) => {
        const spoken = formatSpokenPriceBR(p.promotionalPrice, p.unit);
        const pkg = p.packaging ? ` ${expandUnitsAndMeasuresToWords(p.packaging)}` : '';
        const brand = p.brand ? ` ${p.brand}` : '';
        const name = expandUnitsAndMeasuresToWords(p.name);
        const hooks = [
          'Destaque imperdível:',
          'Qualidade garantida em:',
          'Preço especial para o seu carrinho em:',
          'Excelente oportunidade em:'
        ];
        return `${hooks[i % hooks.length]} ${name}${brand}${pkg}, por apenas ${spoken}!`;
      }).join(' ');
      return expandUnitsAndMeasuresToWords(
        `Atenção clientes! Economia de verdade com procedência e qualidade selecionada é aqui no nosso supermercado. Confira agora os grandes destaques comerciais de hoje: ${items} Qualidade, procedência e o melhor preço para abastecer a sua casa. Aproveite hoje mesmo!`
      );
    }
  }

  switch (action) {
    case 'energize': {
      let res = text;
      res = res.replace(/^(?:Atenção clientes(?::|!)?|Olá clientes amigo[s]?(?::|!)?)/i, 'Atenção para essa loucura de ofertas!');
      res = res.replace(/(?:por apenas|por só)/gi, 'com preço esmagado por só');
      res = res.replace(/\.\s+/g, '! ');
      if (!res.includes('Corre') && !res.includes('voando')) {
        res += ' Corre agora mesmo antes que acabe tudo! Estoque voando!';
      }
      return expandUnitsAndMeasuresToWords(res);
    }
    case 'shorten': {
      let res = text;
      res = res.replace(/Atenção clientes:?/gi, '');
      res = res.replace(/cliente amigo/gi, '');
      res = res.replace(/de dar água na boca,/gi, '');
      res = res.replace(/preparados? para você e sua família/gi, '');
      res = res.replace(/com qualidade selecionada/gi, '');
      res = res.replace(/E olha só essa oportunidade:?/gi, '');
      res = res.replace(/E não para por aí:?/gi, '');
      res = res.replace(/\s{2,}/g, ' ').trim();
      return expandUnitsAndMeasuresToWords(res);
    }
    case 'natural': {
      let res = text;
      res = res.replace(/^(?:Atenção clientes:?|Parou tudo!|Alerta de|É Black Friday)/i, 'Olá, tudo bem? Para deixar o seu dia ainda mais especial, preparamos com carinho grandes ofertas:');
      res = res.replace(/Preço esmagado[^:]*:/gi, 'Você também encontra:');
      return expandUnitsAndMeasuresToWords(res);
    }
    case 'improve': {
      let res = text.replace(/por apenas/gi, 'por incríveis');
      res = res.replace(/\.\s+/g, '! ');
      return expandUnitsAndMeasuresToWords(res);
    }
    case 'verify_prices':
    default:
      return expandUnitsAndMeasuresToWords(text);
  }
}

export async function refineSupermarketScript(
  currentText: string,
  action: 'improve' | 'shorten' | 'energize' | 'natural' | 'verify_prices' | 'custom',
  instruction?: string,
  products?: ProductItem[],
  niche?: ProjectNiche
): Promise<string> {
  const instructionsMap: Record<string, string> = {
    improve: 'Aprimore o ritmo, o vocabulário de vendas e a cadência de locutor de rádio de supermercado mantendo todos os produtos, preços e unidades por extenso.',
    shorten: 'Encurte o texto para torná-lo mais dinâmico e direto mantendo as informações essenciais.',
    energize: 'Deixe a locução muito mais animada, vibrante e comercial!',
    natural: 'Torne o texto mais acolhedor, familiar e amigável.',
    verify_prices: 'Revise minuciosamente os preços, unidades e nomes comparando com a lista oficial para garantir que todos os valores e unidades estejam 100% por extenso.',
    custom: instruction || 'Ajuste o texto conforme orientado.'
  };

  const prompt = `Você é um editor sênior de locuções de supermercado.
Texto atual da locução:
"""
${currentText}
"""

${products && products.length > 0 ? `Lista original de referência:
${products.map(p => `- ${p.name}${p.brand ? ` (${p.brand})` : ''}${p.promotionalPrice && p.promotionalPrice > 0 ? `: R$ ${p.promotionalPrice}` : ''}`).join('\n')}
` : ''}

Ação solicitada: ${instructionsMap[action] || action}
${instruction ? `Instrução adicional: ${instruction}` : ''}

REGRA FUNDAMENTAL: Reescreva mantendo preços e unidades de medidas 100% por extenso sem nenhuma abreviação.
Retorne APENAS o texto da nova locução sem introdução, explicações ou aspas.`;

  try {
    const response = await callGeminiWithFallback({
      contents: prompt,
    });
    const result = response.text?.trim();
    if (result && result.length > 20) {
      return expandUnitsAndMeasuresToWords(result);
    }
    return refineLocally(currentText, action, instruction, products, niche);
  } catch (e: any) {
    console.log(`[AI] Refinando localmente com estilo "${action}" para supermercado...`);
    return refineLocally(currentText, action, instruction, products, niche);
  }
}

/**
 * Generates high quality speech using Gemini TTS (gemini-3.8-flash-lite-tts)
 * Returns WAV buffer (24kHz mono 16-bit RIFF)
 */
export async function generateGeminiSpeech(text: string, voiceName: string = 'Fenrir'): Promise<Buffer> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY não configurada no .env');
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: 'Entusiasta, locutor profissional de varejo e ofertas de supermercado em português do Brasil',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return Buffer.from(base64Audio, 'base64');
    }
    throw new Error('No audio data in Gemini TTS response');
  } catch (error) {
    console.error('Error in generateGeminiSpeech:', error);
    throw error;
  }
}

export function saveGeminiApiKeyToEnv(newKey: string): boolean {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

    if (content.includes('GEMINI_API_KEY=')) {
      content = content.replace(/GEMINI_API_KEY="[^"]*"/, `GEMINI_API_KEY="${newKey}"`);
      content = content.replace(/GEMINI_API_KEY=[^\r\n]*/, `GEMINI_API_KEY="${newKey}"`);
    } else {
      content += `\nGEMINI_API_KEY="${newKey}"\n`;
    }

    fs.writeFileSync(envPath, content, 'utf-8');
    process.env.GEMINI_API_KEY = newKey;
    return true;
  } catch (err) {
    console.error('Failed to save Gemini API key to .env:', err);
    return false;
  }
}

export async function fetchGeminiAccountInfo(): Promise<{
  configured: boolean;
  apiKeyMasked: string;
  apiKey: string;
  model: string;
}> {
  const key = process.env.GEMINI_API_KEY?.trim() || '';
  const isConfigured = Boolean(key && key.length > 10 && key !== 'YOUR_GEMINI_API_KEY');

  let masked = '';
  if (key) {
    masked = key.length > 8 ? `${key.slice(0, 7)}...${key.slice(-4)}` : '••••••••';
  }

  return {
    configured: isConfigured,
    apiKeyMasked: masked,
    apiKey: key,
    model: 'gemini-3.8-flash (e fallback 2.5-flash)'
  };
}
