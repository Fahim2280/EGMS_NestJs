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

const KNOWN_MESSAGE_MAP: Record<string, string> = {
  'customer registered successfully': 'msg.customerCreated',
  'customer profile updated successfully': 'msg.customerUpdated',
  'customer updated successfully': 'msg.customerUpdated',
  'customer removed successfully': 'msg.customerDeleted',
  'customer deleted successfully': 'msg.customerDeleted',
  'guarantor added successfully': 'msg.guarantorAdded',
  'guarantor updated successfully': 'msg.guarantorUpdated',
  'guarantor removed successfully': 'msg.guarantorDeleted',
  'garage registered successfully': 'msg.garageCreated',
  'garage updated successfully': 'msg.garageUpdated',
  'garage deleted successfully': 'msg.garageDeleted',
  'employee added successfully': 'msg.employeeCreated',
  'employee registered successfully': 'msg.employeeCreated',
  'employee updated successfully': 'msg.employeeUpdated',
  'employee removed': 'msg.employeeDeleted',
  'employee deleted successfully': 'msg.employeeDeleted',
  'permissions updated successfully': 'msg.permissionsUpdated',
  'permissions updated': 'msg.permissionsUpdated',
  'electric bill generated successfully': 'msg.billCreated',
  'electric bill updated successfully': 'msg.billUpdated',
  'electric bill deleted successfully': 'msg.billDeleted',
  'documents uploaded successfully': 'msg.documentsUploaded',
  'document deleted successfully': 'msg.documentDeleted',
  'document removed successfully': 'msg.documentDeleted',
  'invalid credentials': 'msg.loginInvalid',
  'signed in successfully': 'msg.loginSuccess',
  'logged out successfully': 'msg.logoutSuccess',
  'you do not have permission to view this bill': 'msg.permissionDenied',
  'you do not have permission to delete this bill': 'msg.permissionDenied',
  'you do not have permission to generate bills for customers in this garage.': 'msg.permissionDenied',
};

export function resolveMessage(msgOrKey: string, lang: 'en' | 'bn' = 'en'): string {
  if (!msgOrKey || typeof msgOrKey !== 'string') return '';
  const clean = msgOrKey.trim().replace(/\+/g, ' ');
  if (!clean) return '';

  // Check if direct translation key exists
  if (translations[lang] && translations[lang][clean]) {
    return translations[lang][clean];
  }
  if (translations.en && translations.en[clean]) {
    return translate(clean, lang);
  }

  // Check known map
  const normalized = clean.toLowerCase();
  const mappedKey = KNOWN_MESSAGE_MAP[normalized];
  if (mappedKey) {
    return translate(mappedKey, lang);
  }

  return clean;
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
