/**
 * Retail Radio Time Announcement Utility
 * Converts current wall-clock time into natural spoken Brazilian Portuguese for radio broadcast.
 */

const NUMBERS_IN_WORDS: Record<number, string> = {
  0: 'zero',
  1: 'um',
  2: 'dois',
  3: 'três',
  4: 'quatro',
  5: 'cinco',
  6: 'seis',
  7: 'sete',
  8: 'oito',
  9: 'nove',
  10: 'dez',
  11: 'onze',
  12: 'doze',
  13: 'treze',
  14: 'quatorze',
  15: 'quinze',
  16: 'dezesseis',
  17: 'dezessete',
  18: 'dezoito',
  19: 'dezenove',
  20: 'vinte',
  21: 'vinte e um',
  22: 'vinte e dois',
  23: 'vinte e três',
  24: 'vinte e quatro',
  25: 'vinte e cinco',
  26: 'vinte e seis',
  27: 'vinte e sete',
  28: 'vinte e oito',
  29: 'vinte e nove',
  30: 'trinta',
  31: 'trinta e um',
  32: 'trinta e dois',
  33: 'trinta e três',
  34: 'trinta e quatro',
  35: 'trinta e cinco',
  36: 'trinta e seis',
  37: 'trinta e sete',
  38: 'trinta e oito',
  39: 'trinta e nove',
  40: 'quarenta',
  41: 'quarenta e um',
  42: 'quarenta e dois',
  43: 'quarenta e três',
  44: 'quarenta e quatro',
  45: 'quarenta e cinco',
  46: 'quarenta e seis',
  47: 'quarenta e sete',
  48: 'quarenta e oito',
  49: 'quarenta e nove',
  50: 'cinquenta',
  51: 'cinquenta e um',
  52: 'cinquenta e dois',
  53: 'cinquenta e três',
  54: 'cinquenta e quatro',
  55: 'cinquenta e cinco',
  56: 'cinquenta e seis',
  57: 'cinquenta e sete',
  58: 'cinquenta e oito',
  59: 'cinquenta e nove',
};

export type TimeAnnouncementStyle = 'comercial' | 'padrao' | 'curto';

export interface TimeAnnouncementOptions {
  storeName?: string;
  stationName?: string;
  style?: TimeAnnouncementStyle;
  date?: Date;
}

/**
 * Returns hours and minutes expressed in natural Brazilian spoken Portuguese
 */
export function formatTimeInSpokenWords(date = new Date()): {
  timeWords: string;
  formattedTime: string;
  hours: number;
  minutes: number;
} {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const padH = String(hours).padStart(2, '0');
  const padM = String(minutes).padStart(2, '0');
  const formattedTime = `${padH}:${padM}`;

  let hoursText = '';
  if (hours === 0 && minutes === 0) {
    return {
      timeWords: 'meia-noite em ponto',
      formattedTime,
      hours,
      minutes,
    };
  }

  if (hours === 12 && minutes === 0) {
    return {
      timeWords: 'meio-dia em ponto',
      formattedTime,
      hours,
      minutes,
    };
  }

  if (hours === 12) {
    hoursText = 'meio-dia';
  } else if (hours === 0) {
    hoursText = 'meia-noite';
  } else if (hours === 1) {
    hoursText = 'uma hora';
  } else if (hours === 2) {
    hoursText = 'duas horas';
  } else {
    hoursText = `${NUMBERS_IN_WORDS[hours] || hours} horas`;
  }

  let minutesText = '';
  if (minutes === 0) {
    minutesText = 'em ponto';
  } else if (minutes === 1) {
    minutesText = 'e um minuto';
  } else if (minutes === 30) {
    minutesText = 'e trinta minutos';
  } else {
    const minWord = NUMBERS_IN_WORDS[minutes] || String(minutes);
    minutesText = `e ${minWord} minutos`;
  }

  return {
    timeWords: `${hoursText} ${minutesText}`.trim(),
    formattedTime,
    hours,
    minutes,
  };
}

/**
 * Builds the complete broadcast script for time announcement
 */
export function buildTimeAnnouncementScript(options: TimeAnnouncementOptions = {}): {
  script: string;
  title: string;
  formattedTime: string;
  timeWords: string;
} {
  const date = options.date || new Date();
  const { timeWords, formattedTime } = formatTimeInSpokenWords(date);
  const store = options.storeName?.trim() || 'Supermercado';
  const radio = options.stationName?.trim() || `Rádio ${store}`;
  const style = options.style || 'comercial';

  let script = '';
  if (style === 'comercial') {
    script = `Atenção clientes: agora são exatamente ${timeWords} no ${store}. Aproveite as nossas ofertas especiais de hoje e tenha ótimas compras!`;
  } else if (style === 'padrao') {
    script = `Hora certa na ${radio}! Agora são exatamente ${timeWords}.`;
  } else {
    script = `${radio}, hora certa: agora são ${timeWords}!`;
  }

  return {
    script,
    title: `Hora Certa — ${formattedTime}`,
    formattedTime,
    timeWords,
  };
}
