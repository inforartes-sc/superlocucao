/**
 * textNormalizer.ts
 * Utilitários para normalização e expansão de unidades de medida, pesos, volumes
 * e valores monetários para texto integralmente por extenso em português do Brasil (PT-BR).
 * Garante que sintetizadores TTS e todos os modelos de vozes pronunciem tudo com naturalidade e perfeição.
 */

export function numberToWordsPT(num: number, isFeminine = false): string {
  if (num === 0) return 'zero';

  const units = [
    '',
    isFeminine ? 'uma' : 'um',
    isFeminine ? 'duas' : 'dois',
    'três',
    'quatro',
    'cinco',
    'seis',
    'sete',
    'oito',
    'nove',
  ];

  const teens = [
    'dez',
    'onze',
    'doze',
    'treze',
    'quatorze',
    'quinze',
    'dezesseis',
    'dezessete',
    'dezoito',
    'dezenove',
  ];

  const tens = [
    '',
    '',
    'vinte',
    'trinta',
    'quarenta',
    'cinquenta',
    'sessenta',
    'setenta',
    'oitenta',
    'noventa',
  ];

  const hundreds = [
    '',
    'cento',
    isFeminine ? 'duzentas' : 'duzentos',
    isFeminine ? 'trezentas' : 'trezentos',
    isFeminine ? 'quatrocentas' : 'quatrocentos',
    isFeminine ? 'quinhentas' : 'quinhentos',
    isFeminine ? 'seiscentas' : 'seiscentos',
    isFeminine ? 'setecentas' : 'setecentos',
    isFeminine ? 'oitocentas' : 'oitocentos',
    isFeminine ? 'novecentas' : 'novecentos',
  ];

  if (num === 100) return 'cem';
  if (num < 10) return units[num];
  if (num >= 10 && num < 20) return teens[num - 10];
  if (num < 100) {
    const t = Math.floor(num / 10);
    const u = num % 10;
    return u === 0 ? tens[t] : `${tens[t]} e ${units[u]}`;
  }
  if (num < 1000) {
    const h = Math.floor(num / 100);
    const r = num % 100;
    if (r === 0) return num === 100 ? 'cem' : hundreds[h];
    return `${hundreds[h]} e ${numberToWordsPT(r, isFeminine)}`;
  }
  if (num < 1000000) {
    const k = Math.floor(num / 1000);
    const r = num % 1000;
    const kPrefix = k === 1 ? 'mil' : `${numberToWordsPT(k, false)} mil`;
    if (r === 0) return kPrefix;
    if (r < 100 || r % 100 === 0) return `${kPrefix} e ${numberToWordsPT(r, isFeminine)}`;
    return `${kPrefix} ${numberToWordsPT(r, isFeminine)}`;
  }
  if (num < 1000000000) {
    const m = Math.floor(num / 1000000);
    const r = num % 1000000;
    const mPrefix = m === 1 ? 'um milhão' : `${numberToWordsPT(m, false)} milhões`;
    if (r === 0) return mPrefix;
    return `${mPrefix} e ${numberToWordsPT(r, isFeminine)}`;
  }
  return String(num);
}

/**
 * Converte valor numérico em reais e centavos para pronúncia falada por extenso
 */
export function spokenCurrency(reais: number, centavos: number): string {
  let r = '';
  if (reais === 1) {
    r = 'um real';
  } else if (reais > 1) {
    r = `${numberToWordsPT(reais, false)} reais`;
  }

  if (centavos > 0) {
    const centText = centavos === 1 ? 'um centavo' : `${numberToWordsPT(centavos, false)} centavos`;
    r = r ? `${r} e ${centText}` : centText;
  }

  return r || 'zero real';
}

/**
 * Mapeia unidades de varejo para a pronúncia correta em português
 */
function resolveRetailUnit(unitRaw: string): string {
  const u = unitRaw.toLowerCase().trim();
  const map: Record<string, string> = {
    kg: 'o quilo',
    kilo: 'o quilo',
    kilos: 'o quilo',
    quilo: 'o quilo',
    quilos: 'o quilo',
    l: 'o litro',
    lt: 'o litro',
    lts: 'o litro',
    litro: 'o litro',
    litros: 'o litro',
    un: 'a unidade',
    und: 'a unidade',
    unid: 'a unidade',
    unidade: 'a unidade',
    unidades: 'a unidade',
    pct: 'o pacote',
    pcte: 'o pacote',
    pcts: 'o pacote',
    pctes: 'o pacote',
    pacote: 'o pacote',
    pacotes: 'o pacote',
    cx: 'a caixa',
    cxa: 'a caixa',
    cxs: 'a caixa',
    cxas: 'a caixa',
    caixa: 'a caixa',
    caixas: 'a caixa',
    dz: 'a dúzia',
    duzia: 'a dúzia',
    dúzia: 'a dúzia',
    dúzias: 'a dúzia',
    bdj: 'a bandeja',
    bdja: 'a bandeja',
    bdjs: 'a bandeja',
    bandeja: 'a bandeja',
    bandejas: 'a bandeja',
    fd: 'o fardo',
    fdo: 'o fardo',
    fds: 'o fardo',
    fardo: 'o fardo',
    fardos: 'o fardo',
    pc: 'a peça',
    pç: 'a peça',
    peca: 'a peça',
    peça: 'a peça',
    peças: 'a peça',
    lat: 'a lata',
    lata: 'a lata',
    latas: 'a lata',
    gar: 'a garrafa',
    garrafa: 'a garrafa',
    garrafas: 'a garrafa',
  };
  return map[u] || u;
}

/**
 * Converte qualquer valor monetário (R$ 24,99 ou R$ 1,50 ou 14,90) para pronúncia falada por extenso
 */
export function formatCurrencyToSpoken(raw: string): string {
  return raw.replace(/(?:R\$\s*)?(\d+)[,\.](\d{1,2})\b/gi, (_, reaisStr, centavosStr) => {
    const reais = parseInt(reaisStr, 10);
    const centavos = centavosStr.length === 1 ? parseInt(centavosStr, 10) * 10 : parseInt(centavosStr, 10);
    return spokenCurrency(reais, centavos);
  });
}

/**
 * Expande integralmente todas as abreviações de unidades de medida, pesos, volumes,
 * embalagens de varejo, porcentagens, parcelas e valores para texto 100% por extenso em português.
 */
export function expandUnitsAndMeasuresToWords(text: string): string {
  if (!text) return '';
  let res = text;

  // 1. Dias da semana (ex: 2ª feira, 4ª-feira)
  res = res.replace(/\b2[ªaºo]\s*[-]?\s*feira\b/gi, 'segunda-feira');
  res = res.replace(/\b3[ªaºo]\s*[-]?\s*feira\b/gi, 'terça-feira');
  res = res.replace(/\b4[ªaºo]\s*[-]?\s*feira\b/gi, 'quarta-feira');
  res = res.replace(/\b5[ªaºo]\s*[-]?\s*feira\b/gi, 'quinta-feira');
  res = res.replace(/\b6[ªaºo]\s*[-]?\s*feira\b/gi, 'sexta-feira');

  // 2. Ordinais comuns
  res = res.replace(/\b1[ºo]\b/gi, 'primeiro');
  res = res.replace(/\b1[ªa]\b/gi, 'primeira');
  res = res.replace(/\b2[ºo]\b/gi, 'segundo');
  res = res.replace(/\b2[ªa]\b/gi, 'segunda');
  res = res.replace(/\b3[ºo]\b/gi, 'terceiro');
  res = res.replace(/\b3[ªa]\b/gi, 'terceira');

  // 3. Preços combinados com unidades de varejo
  // A) Preço explícito com R$ + unidade (ex: "R$ 36,90 /kg", "R$ 4,50 a caixa")
  res = res.replace(
    /R\$\s*(\d+(?:\.\d{3})*)[,\.](\d{1,2})\s*(?:\/|\s*(?:ao|o|por|a|à|cada)\s+)?(kg|quilos?|kilos?|l|lts?|litros?|un|und|unid|unidades?|pct|pctes?|pacotes?|cx|cxa|caixas?|dz|dúzias?|duzias?|bdj|bandejas?|fd|fardos?|pc|pç|peças?|pecas?|latas?|garrafas?)\b/gi,
    (_, rStr, cStr, unitMatch) => {
      const cleanReais = parseInt(rStr.replace(/\./g, ''), 10);
      const centavos = cStr.length === 1 ? parseInt(cStr, 10) * 10 : parseInt(cStr, 10);
      return `${spokenCurrency(cleanReais, centavos)} ${resolveRetailUnit(unitMatch)}`;
    }
  );

  // B) Preço com barra + unidade (ex: "36,90 /kg", "4,50 /cx", "14,90 /un")
  res = res.replace(
    /\b(\d+)[,\.](\d{2})\s*\/\s*(kg|quilos?|kilos?|l|lts?|litros?|un|und|unid|unidades?|pct|pctes?|pacotes?|cx|cxa|caixas?|dz|dúzias?|duzias?|bdj|bandejas?|fd|fardos?|pc|pç|peças?|pecas?|latas?|garrafas?)\b/gi,
    (_, rStr, cStr, unitMatch) => {
      const reais = parseInt(rStr, 10);
      const centavos = parseInt(cStr, 10);
      return `${spokenCurrency(reais, centavos)} ${resolveRetailUnit(unitMatch)}`;
    }
  );

  // C) Preço com artigo ou preposição + unidade (ex: "36,90 o quilo", "4,50 a caixa", "14,90 cada", "3,49 a lata")
  res = res.replace(
    /\b(\d+)[,\.](\d{2})\s+(?:ao|o|por|a|à|cada)\s+(kg|quilos?|kilos?|l|lts?|litros?|un|und|unid|unidades?|pct|pctes?|pacotes?|cx|cxa|caixas?|dz|dúzias?|duzias?|bdj|bandejas?|fd|fardos?|pc|pç|peças?|pecas?|latas?|garrafas?)\b/gi,
    (_, rStr, cStr, unitMatch) => {
      const reais = parseInt(rStr, 10);
      const centavos = parseInt(cStr, 10);
      return `${spokenCurrency(reais, centavos)} ${resolveRetailUnit(unitMatch)}`;
    }
  );

  // D) Preço precedido de por/a/só/apenas + valor + unidade (ex: "por 3,99 kg", "só 4,50 cx")
  res = res.replace(
    /\b(por|a|só|apenas|de)\s+(\d+)[,\.](\d{2})\s*(kg|quilos?|kilos?|l|lts?|litros?|un|und|unid|unidades?|pct|pctes?|pacotes?|cx|cxa|caixas?|dz|dúzias?|duzias?|bdj|bandejas?|fd|fardos?|pc|pç|peças?|pecas?|latas?|garrafas?)\b/gi,
    (_, prep, rStr, cStr, unitMatch) => {
      const reais = parseInt(rStr, 10);
      const centavos = parseInt(cStr, 10);
      return `${prep} ${spokenCurrency(reais, centavos)} ${resolveRetailUnit(unitMatch)}`;
    }
  );

  // 4. Símbolos de barra isolados com unidades (ex: /kg, /100g, /un, /pct, /cx, /l, /dz, /pç, /lata)
  res = res.replace(/\/\s*100\s*g(?:r|ram[ao]s?)?/gi, ' a cada cem gramas');
  res = res.replace(/\/\s*(?:kg|quilo|kilo)s?/gi, ' o quilo');
  res = res.replace(/\/\s*(?:l|lt|litro)s?/gi, ' o litro');
  res = res.replace(/\/\s*(?:un|und|unid|unidade)s?/gi, ' a unidade');
  res = res.replace(/\/\s*(?:pct|pcte|pacote)s?/gi, ' o pacote');
  res = res.replace(/\/\s*(?:cx|cxa|caixa)s?/gi, ' a caixa');
  res = res.replace(/\/\s*(?:dz|dzia|dúzia|duzia)s?/gi, ' a dúzia');
  res = res.replace(/\/\s*(?:bdj|bdja|bandeja)s?/gi, ' a bandeja');
  res = res.replace(/\/\s*(?:fd|fdo|fardo)s?/gi, ' o fardo');
  res = res.replace(/\/\s*(?:pc|pç|peça|peca)s?/gi, ' a peça');
  res = res.replace(/\/\s*(?:lat|lata)s?/gi, ' a lata');
  res = res.replace(/\/\s*(?:gar|garrafa)s?/gi, ' a garrafa');

  // 5. Pesos decimais em kg (ex: 0,5kg, 1,5kg, 2,5kg, 1,2kg)
  res = res.replace(/\b(?:0[,\.]5)\s*(?:kg|quilos?|kilos?)\b/gi, 'meio quilo');
  res = res.replace(/\b(?:1[,\.]5)\s*(?:kg|quilos?|kilos?)\b/gi, 'um quilo e meio');
  res = res.replace(/\b(?:2[,\.]5)\s*(?:kg|quilos?|kilos?)\b/gi, 'dois quilos e meio');
  res = res.replace(/\b(\d+)[,\.](\d+)\s*(?:kg|quilos?|kilos?)\b/gi, (_, ent, dec) => {
    const nEnt = parseInt(ent, 10);
    const nDec = parseInt(dec, 10);
    const entStr = nEnt === 1 ? 'um quilo' : `${numberToWordsPT(nEnt, false)} quilos`;
    const gramas = dec.length === 1 ? nDec * 100 : dec.length === 2 ? nDec * 10 : nDec;
    return `${entStr} e ${numberToWordsPT(gramas, false)} gramas`;
  });

  // 6. Volumes decimais em Litros (ex: 0,5L, 1,5L, 2,5L)
  res = res.replace(/\b(?:0[,\.]5)\s*(?:l|lt|litros?)\b/gi, 'meio litro');
  res = res.replace(/\b(?:1[,\.]5)\s*(?:l|lt|litros?)\b/gi, 'um litro e meio');
  res = res.replace(/\b(?:2[,\.]5)\s*(?:l|lt|litros?)\b/gi, 'dois litros e meio');

  // 7. Pesos inteiros em kg (ex: 1kg, 5kg, 10 kg)
  res = res.replace(/\b(\d+)\s*(?:kg|kilos?|quilos?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um quilo';
    return `${numberToWordsPT(num, false)} quilos`;
  });

  // 8. Volumes em mililitros (ex: 350ml, 500 ml, 269ml, 473ml, 900ml)
  res = res.replace(/\b(\d+)\s*(?:ml|mls|mililitros?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um mililitro';
    return `${numberToWordsPT(num, false)} mililitros`;
  });

  // 9. Volumes inteiros em litros (ex: 1L, 1 l, 2L, 5l)
  res = res.replace(/\b(\d+)\s*(?:l|lt|lts|litros?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um litro';
    return `${numberToWordsPT(num, false)} litros`;
  });

  // 10. Pesos em gramas (ex: 100g, 500g, 250gr, 150g)
  // Grama de peso é masculino: "quinhentos gramas", "duzentos gramas"
  // Lookahead negativo (?![a-záéíóúãõç]) impede casar palavras como "grátis" ou "grande"
  res = res.replace(/\b(\d+)\s*(?:g|gr|grs|gramas?)(?![a-záéíóúãõç])\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um grama';
    return `${numberToWordsPT(num, false)} gramas`;
  });
  res = res.replace(/\bduzentas gramas\b/gi, 'duzentos gramas');
  res = res.replace(/\btrezentas gramas\b/gi, 'trezentos gramas');
  res = res.replace(/\bquatrocentas gramas\b/gi, 'quatrocentos gramas');
  res = res.replace(/\bquinhentas gramas\b/gi, 'quinhentos gramas');
  res = res.replace(/\bseiscentas gramas\b/gi, 'seiscentos gramas');
  res = res.replace(/\bsetecentas gramas\b/gi, 'setecentos gramas');
  res = res.replace(/\boitocentas gramas\b/gi, 'oitocentos gramas');
  res = res.replace(/\bnovecentas gramas\b/gi, 'novecentos gramas');

  // 11. Pesos em miligramas (ex: 500mg, 1000mg)
  res = res.replace(/\b(\d+)\s*(?:mg|mgs|miligramas?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    return `${numberToWordsPT(num, false)} miligramas`;
  });

  // 12. Embalagens e unidades com quantidades numéricas inteiras
  res = res.replace(/\b(\d+)\s*(?:un|und|unid|unids|unidades?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'uma unidade';
    if (num === 2) return 'duas unidades';
    return `${numberToWordsPT(num, true)} unidades`;
  });

  res = res.replace(/\b(\d+)\s*(?:pct|pcte|pcts|pctes|pacotes?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um pacote';
    return `${numberToWordsPT(num, false)} pacotes`;
  });

  res = res.replace(/\b(\d+)\s*(?:cx|cxs|cxa|cxas|caixas?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'uma caixa';
    if (num === 2) return 'duas caixas';
    return `${numberToWordsPT(num, true)} caixas`;
  });

  res = res.replace(/\b(\d+)\s*(?:dz|dzs|dúzias?|duzias?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'uma dúzia';
    if (num === 2) return 'duas dúzias';
    return `${numberToWordsPT(num, true)} dúzias`;
  });

  res = res.replace(/\b(\d+)\s*(?:bdj|bdja|bdjs|bandejas?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'uma bandeja';
    if (num === 2) return 'duas bandejas';
    return `${numberToWordsPT(num, true)} bandejas`;
  });

  res = res.replace(/\b(\d+)\s*(?:fd|fds|fdo|fardos?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um fardo';
    return `${numberToWordsPT(num, false)} fardos`;
  });

  res = res.replace(/\b(\d+)\s*(?:pc|pç|peças?|pecas?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'uma peça';
    if (num === 2) return 'duas peças';
    return `${numberToWordsPT(num, true)} peças`;
  });

  res = res.replace(/\b(\d+)\s*(?:lat|latas?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'uma lata';
    if (num === 2) return 'duas latas';
    return `${numberToWordsPT(num, true)} latas`;
  });

  res = res.replace(/\b(\d+)\s*(?:gar|garrafas?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'uma garrafa';
    if (num === 2) return 'duas garrafas';
    return `${numberToWordsPT(num, true)} garrafas`;
  });

  res = res.replace(/\b(\d+)\s*potes?\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um pote';
    return `${numberToWordsPT(num, false)} potes`;
  });

  res = res.replace(/\b(\d+)\s*sach[eê]s?\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um sachê';
    return `${numberToWordsPT(num, false)} sachês`;
  });

  // 13. Preços monetários explícitos com R$ (ex: "R$ 4,99", "R$ 1.250,50", "R$ 10,00", "R$ 15")
  res = res.replace(/R\$\s*(\d+(?:\.\d{3})*)[,\.](\d{1,2})\b/gi, (_, reaisStr, centStr) => {
    const cleanReais = parseInt(reaisStr.replace(/\./g, ''), 10);
    const centavos = centStr.length === 1 ? parseInt(centStr, 10) * 10 : parseInt(centStr, 10);
    return spokenCurrency(cleanReais, centavos);
  });
  res = res.replace(/R\$\s*(\d+(?:\.\d{3})*)\b/gi, (_, reaisStr) => {
    const cleanReais = parseInt(reaisStr.replace(/\./g, ''), 10);
    return cleanReais === 1 ? 'um real' : `${numberToWordsPT(cleanReais, false)} reais`;
  });

  // 14. Valores decimais soltos de varejo (ex: "por 14,90", "apenas 3,49", "0,99", "4.50")
  res = res.replace(/\b(\d+)[,\.](\d{2})\b/gi, (_, reaisStr, centStr) => {
    const reais = parseInt(reaisStr, 10);
    const centavos = parseInt(centStr, 10);
    return spokenCurrency(reais, centavos);
  });

  // 15. Números acompanhados diretamente da palavra "reais" ou "centavos"
  res = res.replace(/\b1\s+real\b/gi, 'um real');
  res = res.replace(/\b(\d+)\s+reais\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    return `${numberToWordsPT(num, false)} reais`;
  });
  res = res.replace(/\b1\s+centavo\b/gi, 'um centavo');
  res = res.replace(/\b(\d+)\s+centavos\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    return `${numberToWordsPT(num, false)} centavos`;
  });

  // 16. Porcentagens (ex: 10%, 20%, 50%)
  res = res.replace(/\b(\d+)%/gi, (_, n) => {
    return `${numberToWordsPT(parseInt(n, 10), false)} por cento`;
  });

  // 17. Parcelas e vezes (ex: 3x, 10x, 12x)
  res = res.replace(/\b(\d+)\s*[xX]\b/gi, (_, n) => {
    return `${numberToWordsPT(parseInt(n, 10), false)} vezes`;
  });
  res = res.replace(/\b[xX]\s*(\d+)\b/gi, (_, n) => {
    return `vezes ${numberToWordsPT(parseInt(n, 10), false)}`;
  });

  // 18. Horários e tempos
  res = res.replace(/\b24\s*(?:h|hrs|horas)\b/gi, 'vinte e quatro horas');
  res = res.replace(/\b(\d{1,2})\s*h(?:oras?)?\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    return num === 1 ? 'uma hora' : `${numberToWordsPT(num, true)} horas`;
  });
  res = res.replace(/\b(\d{1,2})\s*(?:min|mins|minutos)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    return num === 1 ? 'um minuto' : `${numberToWordsPT(num, false)} minutos`;
  });
  res = res.replace(/\b(\d{1,2})\s*(?:seg|segs|segundos)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    return num === 1 ? 'um segundo' : `${numberToWordsPT(num, false)} segundos`;
  });

  // 19. Abreviações de endereços e contatos
  res = res.replace(/\bav\.\s*/gi, 'Avenida ');
  res = res.replace(/\br\.\s*/gi, 'Rua ');
  res = res.replace(/\bn[º°o]?\.\s*(\d+)\b/gi, (_, n) => `número ${numberToWordsPT(parseInt(n, 10), false)}`);
  res = res.replace(/\bn[º°o]\s*(\d+)\b/gi, (_, n) => `número ${numberToWordsPT(parseInt(n, 10), false)}`);
  res = res.replace(/\bnum\.\s*(\d+)\b/gi, (_, n) => `número ${numberToWordsPT(parseInt(n, 10), false)}`);

  // 20. Abreviações de varejo
  res = res.replace(/\bc\/\s*/gi, 'com ');
  res = res.replace(/\bs\/\s*/gi, 'sem ');
  res = res.replace(/\bp\/\s*/gi, 'para ');
  res = res.replace(/\baprox\.\s*/gi, 'aproximadamente ');
  res = res.replace(/\bref\.\s*/gi, 'referência ');
  res = res.replace(/\btam\.\s*/gi, 'tamanho ');
  res = res.replace(/\bemb\.\s*/gi, 'embalagem ');
  res = res.replace(/\btrad\.\s*/gi, 'tradicional ');
  res = res.replace(/\bint\.\s*/gi, 'integral ');
  res = res.replace(/\bdesn\.\s*/gi, 'desnatado ');
  res = res.replace(/\bsemidesn\.\s*/gi, 'semidesnatado ');
  res = res.replace(/\brefrig\.\s*/gi, 'refrigerado ');
  res = res.replace(/\bcong\.\s*/gi, 'congelado ');
  res = res.replace(/\besp\.\s*/gi, 'especial ');
  res = res.replace(/\bext\.\s*/gi, 'extra ');
  res = res.replace(/\bimp\.\s*/gi, 'importado ');
  res = res.replace(/\bnac\.\s*/gi, 'nacional ');
  res = res.replace(/\bn[º°o]\.\s*/gi, 'número ');
  res = res.replace(/\bnum\.\s*/gi, 'número ');
  res = res.replace(/\btel\.\s*/gi, 'telefone ');
  res = res.replace(/\bcel\.\s*/gi, 'celular ');

  // 21. Abreviações isoladas acompanhadas de artigo ou preposição
  res = res.replace(/\b(?:o|por)\s+kg\b/gi, 'o quilo');
  res = res.replace(/\b(?:a|por|cada)\s+(?:un|und|unid)\b/gi, (match) => {
    const prefix = match.split(/\s+/)[0].toLowerCase();
    return `${prefix} unidade`;
  });
  res = res.replace(/\b(?:o|por)\s+(?:pct|pcte)\b/gi, (match) => {
    const prefix = match.split(/\s+/)[0].toLowerCase();
    return `${prefix} pacote`;
  });
  res = res.replace(/\b(?:a|por)\s+(?:cx|cxa)\b/gi, (match) => {
    const prefix = match.split(/\s+/)[0].toLowerCase();
    return `${prefix} caixa`;
  });
  res = res.replace(/\b(?:a|por)\s+dz\b/gi, (match) => {
    const prefix = match.split(/\s+/)[0].toLowerCase();
    return `${prefix} dúzia`;
  });
  res = res.replace(/\b(?:o|por)\s+(?:lt|l)\b/gi, (match) => {
    const prefix = match.split(/\s+/)[0].toLowerCase();
    return `${prefix} litro`;
  });
  res = res.replace(/\b(?:a|por)\s+(?:bdj|bdja)\b/gi, (match) => {
    const prefix = match.split(/\s+/)[0].toLowerCase();
    return `${prefix} bandeja`;
  });
  res = res.replace(/\b(?:o|por)\s+(?:fd|fdo)\b/gi, (match) => {
    const prefix = match.split(/\s+/)[0].toLowerCase();
    return `${prefix} fardo`;
  });

  // 22. "ml" ou "kg" isolados esquecidos após números por extenso
  res = res.replace(/(\b(?:cem|duzentos|trezentos|quatrocentos|quinhentos|seiscentos|setecentos|oitocentos|novecentos|dez|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|um|dois|três|quatro|cinco|seis|sete|oito|nove))\s+ml\b/gi, '$1 mililitros');
  res = res.replace(/(\b(?:cem|duzentos|trezentos|quatrocentos|quinhentos|seiscentos|setecentos|oitocentos|novecentos|dez|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|dois|três|quatro|cinco|seis|sete|oito|nove))\s+kg\b/gi, '$1 quilos');
  res = res.replace(/\bum\s+kg\b/gi, 'um quilo');
  res = res.replace(/\bum\s+ml\b/gi, 'um mililitro');
  res = res.replace(/\bum\s+l\b/gi, 'um litro');

  // 23. TODOS OS ALGARISMOS REMANESCENTES (transforma qualquer número solto em palavras)
  res = res.replace(/\b(\d+)\b/g, (match) => {
    const num = parseInt(match, 10);
    return numberToWordsPT(num, false);
  });

  // 24. Limpeza de pontuação e espaços duplicados
  res = res.replace(/\s{2,}/g, ' ');
  res = res.replace(/\s+([,\.!?:;])/g, '$1');

  return res.trim();
}
