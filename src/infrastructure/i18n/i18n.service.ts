import { translations } from './translations';

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function translate(key: string, lang: 'en' | 'bn' = 'en', fallback?: string): string {
  const dict = translations[lang] || translations.en;
  if (dict && dict[key]) {
    return dict[key];
  }
  // Fallback to English if missing in Bengali
  if (translations.en[key]) {
    return translations.en[key];
  }
  return fallback !== undefined ? fallback : key;
}

export function toBengaliDigits(input: any): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)]);
}

export function formatNumberWithLang(val: any, lang: 'en' | 'bn' = 'en'): string {
  if (val === null || val === undefined || val === '') return '0';
  const numStr = String(val);
  if (lang === 'bn') {
    return toBengaliDigits(numStr);
  }
  return numStr;
}

export function formatDateWithLang(date: any, lang: 'en' | 'bn' = 'en'): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    const isoDate = d.toISOString().split('T')[0]; // YYYY-MM-DD
    if (lang === 'bn') {
      return toBengaliDigits(isoDate);
    }
    return isoDate;
  } catch {
    return String(date);
  }
}

export function formatTimeWithLang(date: any, lang: 'en' | 'bn' = 'en'): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    if (lang === 'bn') {
      return toBengaliDigits(timeStr);
    }
    return timeStr;
  } catch {
    return '';
  }
}
