/**
 * textNormalizer.ts
 * Utilitários para normalização e expansão de unidades de medida, pesos, volumes
 * e valores monetários para texto por extenso em português do Brasil (PT-BR).
 * Garante que sintetizadores TTS e locutores pronunciem tudo com naturalidade e perfeição.
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
  if (num < 10000) {
    const k = Math.floor(num / 1000);
    const r = num % 1000;
    const kPrefix = k === 1 ? 'mil' : `${numberToWordsPT(k, false)} mil`;
    if (r === 0) return kPrefix;
    if (r < 100 || r % 100 === 0) return `${kPrefix} e ${numberToWordsPT(r, isFeminine)}`;
    return `${kPrefix}, ${numberToWordsPT(r, isFeminine)}`;
  }
  return String(num);
}

/**
 * Converte qualquer valor monetário (R$ 24,99 ou R$ 1,50) para pronúncia falada por extenso
 */
export function formatCurrencyToSpoken(raw: string): string {
  return raw.replace(/(?:R\$\s*)?(\d+)[,\.](\d{2})\b/gi, (_, reaisStr, centavosStr) => {
    const reais = parseInt(reaisStr, 10);
    const centavos = parseInt(centavosStr, 10);

    let result = '';
    if (reais === 1) {
      result = 'um real';
    } else if (reais > 1) {
      result = `${numberToWordsPT(reais, false)} reais`;
    }

    if (centavos > 0) {
      const centText = centavos === 1 ? 'um centavo' : `${numberToWordsPT(centavos, false)} centavos`;
      result = result ? `${result} e ${centText}` : centText;
    }

    return result || 'zero real';
  });
}

/**
 * Expande integralmente todas as abreviações de unidades de medida, pesos, volumes
 * e embalagens de varejo para texto por extenso em português.
 */
export function expandUnitsAndMeasuresToWords(text: string): string {
  if (!text) return '';
  let res = text;

  // 1. Símbolos de barra com unidades (ex: /kg, /100g, /un, /pct, /cx, /l, /dz)
  res = res.replace(/\/\s*100\s*g(?:r|ram[ao]s?)?/gi, ' a cada cem gramas');
  res = res.replace(/\/\s*(?:kg|quilo)s?/gi, ' o quilo');
  res = res.replace(/\/\s*(?:l|lt|litro)s?/gi, ' o litro');
  res = res.replace(/\/\s*(?:un|und|unid|unidade)s?/gi, ' a unidade');
  res = res.replace(/\/\s*(?:pct|pcte|pacote)s?/gi, ' o pacote');
  res = res.replace(/\/\s*(?:cx|cxa|caixa)s?/gi, ' a caixa');
  res = res.replace(/\/\s*(?:dz|dzia|dúzia)s?/gi, ' a dúzia');
  res = res.replace(/\/\s*(?:bdj|bdja|bandeja)s?/gi, ' a bandeja');
  res = res.replace(/\/\s*(?:fd|fdo|fardo)s?/gi, ' o fardo');

  // 2. Preços monetários explícitos com R$ (ex: "R$ 4,99" -> "quatro reais e noventa e nove centavos")
  res = res.replace(/R\$\s*(\d+)[,\.](\d{2})\b/gi, (_, reaisStr, centavosStr) => {
    const reais = parseInt(reaisStr, 10);
    const centavos = parseInt(centavosStr, 10);
    let r = '';
    if (reais === 1) r = 'um real';
    else if (reais > 1) r = `${numberToWordsPT(reais, false)} reais`;

    if (centavos > 0) {
      const c = centavos === 1 ? 'um centavo' : `${numberToWordsPT(centavos, false)} centavos`;
      r = r ? `${r} e ${c}` : c;
    }
    return r || 'zero real';
  });

  // 3. Pesos decimais em kg (ex: 0,5kg, 1,5kg, 2,5kg, 1,2kg)
  res = res.replace(/\b(?:0[,\.]5)\s*(?:kg|quilos?)\b/gi, 'meio quilo');
  res = res.replace(/\b(?:1[,\.]5)\s*(?:kg|quilos?)\b/gi, 'um quilo e meio');
  res = res.replace(/\b(?:2[,\.]5)\s*(?:kg|quilos?)\b/gi, 'dois quilos e meio');
  res = res.replace(/\b(\d+)[,\.](\d+)\s*(?:kg|quilos?)\b/gi, (_, ent, dec) => {
    const nEnt = parseInt(ent, 10);
    const nDec = parseInt(dec, 10);
    const entStr = nEnt === 1 ? 'um quilo' : `${numberToWordsPT(nEnt, false)} quilos`;
    const gramas = dec.length === 1 ? nDec * 100 : dec.length === 2 ? nDec * 10 : nDec;
    return `${entStr} e ${numberToWordsPT(gramas, false)} gramas`;
  });

  // 4. Volumes decimais em Litros (ex: 0,5L, 1,5L, 2,5L)
  res = res.replace(/\b(?:0[,\.]5)\s*(?:l|lt|litros?)\b/gi, 'meio litro');
  res = res.replace(/\b(?:1[,\.]5)\s*(?:l|lt|litros?)\b/gi, 'um litro e meio');
  res = res.replace(/\b(?:2[,\.]5)\s*(?:l|lt|litros?)\b/gi, 'dois litros e meio');

  // 5. Pesos inteiros em kg (ex: 1kg, 5kg, 10 kg)
  res = res.replace(/\b(\d+)\s*(?:kg|kilos?|quilos?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um quilo';
    return `${numberToWordsPT(num, false)} quilos`;
  });

  // 6. Volumes em mililitros (ex: 350ml, 500 ml, 269ml, 473ml, 900ml)
  res = res.replace(/\b(\d+)\s*(?:ml|mls|mililitros?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um mililitro';
    return `${numberToWordsPT(num, false)} mililitros`;
  });

  // 7. Volumes inteiros em litros (ex: 1L, 1 l, 2L, 5l)
  res = res.replace(/\b(\d+)\s*(?:l|lt|lts|litros?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um litro';
    return `${numberToWordsPT(num, false)} litros`;
  });

  // 8. Pesos em gramas (ex: 100g, 500g, 250gr, 150g)
  // Obs: grama de peso é masculino: "quinhentos gramas", "duzentos gramas"
  res = res.replace(/\b(\d+)\s*(?:g|gr|grs|gramas?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um grama';
    return `${numberToWordsPT(num, false)} gramas`;
  });

  // 9. Pesos em miligramas (ex: 500mg, 1000mg)
  res = res.replace(/\b(\d+)\s*(?:mg|mgs|miligramas?)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    return `${numberToWordsPT(num, false)} miligramas`;
  });

  // 10. Embalagens e unidades com quantidades numéricas (ex: 1 un, 2 und, 1 pct, 1 cx, 1 dz, 1 bdj, 1 fd)
  res = res.replace(/\b(\d+)\s*(?:un|und|unid|unids)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'uma unidade';
    if (num === 2) return 'duas unidades';
    return `${numberToWordsPT(num, false)} unidades`;
  });

  res = res.replace(/\b(\d+)\s*(?:pct|pcte|pcts|pctes)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um pacote';
    return `${numberToWordsPT(num, false)} pacotes`;
  });

  res = res.replace(/\b(\d+)\s*(?:cx|cxs|cxa|cxas)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'uma caixa';
    if (num === 2) return 'duas caixas';
    return `${numberToWordsPT(num, true)} caixas`;
  });

  res = res.replace(/\b(\d+)\s*(?:dz|dzs)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'uma dúzia';
    if (num === 2) return 'duas dúzias';
    return `${numberToWordsPT(num, true)} dúzias`;
  });

  res = res.replace(/\b(\d+)\s*(?:bdj|bdja|bdjs)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'uma bandeja';
    if (num === 2) return 'duas bandejas';
    return `${numberToWordsPT(num, true)} bandejas`;
  });

  res = res.replace(/\b(\d+)\s*(?:fd|fds|fdo)\b/gi, (_, n) => {
    const num = parseInt(n, 10);
    if (num === 1) return 'um fardo';
    return `${numberToWordsPT(num, false)} fardos`;
  });

  // 11. Abreviações isoladas acompanhadas de artigo ou preposição
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

  // 12. "ml" ou "kg" isolados esquecidos após números por extenso
  // (ex: "trezentos e cinquenta ml" -> "trezentos e cinquenta mililitros")
  res = res.replace(/(\b(?:cem|duzentos|trezentos|quatrocentos|quinhentos|seiscentos|setecentos|oitocentos|novecentos|dez|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|um|dois|três|quatro|cinco|seis|sete|oito|nove))\s+ml\b/gi, '$1 mililitros');
  res = res.replace(/(\b(?:cem|duzentos|trezentos|quatrocentos|quinhentos|seiscentos|setecentos|oitocentos|novecentos|dez|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|dois|três|quatro|cinco|seis|sete|oito|nove))\s+kg\b/gi, '$1 quilos');
  res = res.replace(/\bum\s+kg\b/gi, 'um quilo');
  res = res.replace(/\bum\s+ml\b/gi, 'um mililitro');
  res = res.replace(/\bum\s+l\b/gi, 'um litro');

  // 13. Limpeza de espaços duplicados
  res = res.replace(/\s{2,}/g, ' ').trim();

  return res;
}
