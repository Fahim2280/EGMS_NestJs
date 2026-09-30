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
  if (val === null || val === undefined || val === '') return lang === 'bn' ? '০' : '0';
  const str = String(val).trim();
  const num = parseFloat(str);
  if (isNaN(num)) return lang === 'bn' ? '০' : '0';
  // Show 2 decimal places if the value has a fractional part OR original string contained a dot
  const hasDecimal = str.includes('.') || num !== Math.floor(num);
  const formatted = hasDecimal ? num.toFixed(2) : String(Math.round(num));
  if (lang === 'bn') {
    return toBengaliDigits(formatted);
  }
  return formatted;
}

/** Always formats with 2 decimal places – use for currency, meter readings, unit amounts. */
export function formatMoneyWithLang(val: any, lang: 'en' | 'bn' = 'en'): string {
  if (val === null || val === undefined || val === '') return lang === 'bn' ? '০.০০' : '0.00';
  const num = parseFloat(String(val));
  if (isNaN(num)) return lang === 'bn' ? '০.০০' : '0.00';
  const formatted = num.toFixed(2);
  if (lang === 'bn') {
    return toBengaliDigits(formatted);
  }
  return formatted;
}

export function formatDateWithLang(date: any, lang: 'en' | 'bn' = 'en'): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    const day = String(d.getDate()).padStart(2, '0');
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    const month = lang === 'bn' ? monthNamesBn[d.getMonth()] : monthNamesEn[d.getMonth()];
    const year = d.getFullYear();
    if (lang === 'bn') {
      return `${toBengaliDigits(day)} ${month}, ${toBengaliDigits(String(year))}`;
    }
    return `${day} ${month}, ${year}`;
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

export function translateAuditDetails(details?: string | null, lang: 'en' | 'bn' = 'en'): string {
  if (!details || typeof details !== 'string') return '';
  if (lang !== 'bn') return details;

  const text = details.trim();

  // 1. User login / logout
  const loginMatch = text.match(/^User\s+(.+?)\s+\((.+?)\)\s+signed\s+in$/i);
  if (loginMatch) {
    return `ব্যবহারকারী ${loginMatch[1]} (${loginMatch[2]}) সাইন ইন করেছেন`;
  }
  const logoutMatch = text.match(/^User\s+(.+?)\s+logged\s+out$/i);
  if (logoutMatch) {
    return `ব্যবহারকারী ${logoutMatch[1]} সাইন আউট করেছেন`;
  }

  // 2. Updated company profile details and tariff rate (৳15.05)
  const companyMatch = text.match(/^Updated\s+company\s+profile\s+details\s+and\s+tariff\s+rate\s+\(৳?([0-9.]+)\)$/i);
  if (companyMatch) {
    return `কোম্পানি প্রোফাইল বিবরণ ও ইউনিট ট্যারিফ রেট (৳${toBengaliDigits(companyMatch[1])}) আপডেট করা হয়েছে`;
  }

  // 3. Customer registration / update / deletion
  const custRegMatch = text.match(/^Registered\s+customer\s+(.+?)\s+\((.+?)\)\s+with\s+advance\s+৳?([0-9.]+)/i);
  if (custRegMatch) {
    return `নতুন গ্রাহক ${custRegMatch[1]} (${custRegMatch[2]}) অগ্রিম ৳${toBengaliDigits(custRegMatch[3])} সহ নিবন্ধিত হয়েছেন`;
  }
  const custUpdMatch = text.match(/^Updated\s+customer\s+profile\s+(.+?)\s+\((.+?)\)$/i);
  if (custUpdMatch) {
    return `গ্রাহক প্রোফাইল ${custUpdMatch[1]} (${custUpdMatch[2]}) আপডেট করা হয়েছে`;
  }
  const custDelMatch = text.match(/^Deleted\s+customer\s+record\s+(.+)$/i);
  if (custDelMatch) {
    return `গ্রাহক রেকর্ড ${custDelMatch[1]} মুছে ফেলা হয়েছে`;
  }
  const custSuspendMatch = text.match(/^Suspended\s+customer\s+account\s+(.+?)\s+\((.+?)\)$/i);
  if (custSuspendMatch) {
    return `গ্রাহক ${custSuspendMatch[1]} (${custSuspendMatch[2]}) এর অ্যাকাউন্ট স্থগিত (Blocked) করা হয়েছে`;
  }
  const custReactivateMatch = text.match(/^Reactivated\s+customer\s+account\s+(.+?)\s+\((.+?)\)$/i);
  if (custReactivateMatch) {
    return `গ্রাহক ${custReactivateMatch[1]} (${custReactivateMatch[2]}) এর অ্যাকাউন্ট পুনরায় সক্রিয় করা হয়েছে`;
  }

  // 4. Employee permissions / registration / update / deletion
  const permMatch = text.match(/^Updated\s+role\s+&\s+permissions\s+for\s+employee\s+(.+?):\s*(.*)$/i);
  if (permMatch) {
    const empName = permMatch[1];
    const permDetails = permMatch[2];
    const translatedPerms = permDetails
      .replace(/role=SUPER_ADMIN/gi, 'রোল=সুপার অ্যাডমিন')
      .replace(/role=GENERAL_STAFF/gi, 'রোল=সাধারণ কর্মী')
      .replace(/role=GENERAL/gi, 'রোল=সাধারণ কর্মী')
      .replace(/active=true/gi, 'সক্রিয়=হ্যাঁ')
      .replace(/active=false/gi, 'সক্রিয়=না')
      .replace(/canCreate=true/gi, 'তৈরি=হ্যাঁ')
      .replace(/canCreate=false/gi, 'তৈরি=না')
      .replace(/canEdit=true/gi, 'এডিট=হ্যাঁ')
      .replace(/canEdit=false/gi, 'এডিট=না')
      .replace(/canDelete=true/gi, 'ডিলিট=হ্যাঁ')
      .replace(/canDelete=false/gi, 'ডিলিট=না');
    return `কর্মী ${empName} এর রোল ও পারমিশন আপডেট করা হয়েছে: ${translatedPerms}`;
  }

  const empRegMatch = text.match(/^Registered\s+new\s+employee\s+(.+?)\s+\((.+?)\)$/i);
  if (empRegMatch) {
    return `নতুন কর্মী ${empRegMatch[1]} (${empRegMatch[2]}) নিবন্ধিত হয়েছেন`;
  }
  const empUpdMatch = text.match(/^Updated\s+profile\s+details\s+for\s+employee\s+(.+)$/i);
  if (empUpdMatch) {
    return `কর্মী ${empUpdMatch[1]} এর প্রোফাইল বিবরণ আপডেট করা হয়েছে`;
  }
  const empDelMatch = text.match(/^Deleted\s+employee\s+record\s+for\s+(.+)$/i);
  if (empDelMatch) {
    return `কর্মী ${empDelMatch[1]} এর অ্যাকাউন্ট অপসারণ করা হয়েছে`;
  }

  const billGenMatch = text.match(/^Generated\s+electric\s+bill\s+for\s+customer\s+(.+?)\s+\(meter\s+reading:\s*(.+?)\)$/i);
  if (billGenMatch) {
    const custDisplay = /^[0-9a-fA-F-]{36}$/.test(billGenMatch[1])
      ? `#${billGenMatch[1].slice(0, 8)}`
      : billGenMatch[1];
    return `গ্রাহক ${custDisplay} এর বিদ্যুৎ বিল তৈরি করা হয়েছে (মিটার রিডিং: ${toBengaliDigits(billGenMatch[2])})`;
  }
  const billUpdMatch = text.match(/^Updated\s+electric\s+bill\s+#?([0-9a-zA-Z-]+)$/i);
  if (billUpdMatch) {
    return `বিদ্যুৎ বিল #${toBengaliDigits(billUpdMatch[1])} আপডেট করা হয়েছে`;
  }
  const billDelMatch = text.match(/^Deleted\s+electric\s+bill\s+#?([0-9a-zA-Z-]+)$/i);
  if (billDelMatch) {
    return `বিদ্যুৎ বিল #${toBengaliDigits(billDelMatch[1])} মুছে ফেলা হয়েছে`;
  }
  if (/Generated monthly electric bills for all eligible customers/i.test(text)) {
    return 'সকল যোগ্য গ্রাহকদের জন্য মাসিক বিদ্যুৎ বিল একসাথে তৈরি করা হয়েছে';
  }

  // 6. Garages
  const garageRegMatch = text.match(/^Registered\s+new\s+garage\s+facility:\s*(.+?)\s+located\s+at\s*(.+)$/i);
  if (garageRegMatch) {
    return `নতুন গ্যারেজ সুবিধা নিবন্ধিত: ${garageRegMatch[1]} (অবস্থান: ${garageRegMatch[2]})`;
  }
  const garageUpdMatch = text.match(/^Updated\s+garage\s+facility:\s*(.+)$/i);
  if (garageUpdMatch) {
    return `গ্যারেজ সুবিধা ${garageUpdMatch[1]} এর তথ্য আপডেট করা হয়েছে`;
  }

  // 7. Documents / Files
  const docUploadMatch = text.match(/^Uploaded\s+([0-9]+)\s+document\(s\)\s+for\s+(customer|employee)\s+(.+)$/i);
  if (docUploadMatch) {
    const roleLabel = docUploadMatch[2].toLowerCase() === 'customer' ? 'গ্রাহক' : 'কর্মী';
    return `${roleLabel} ${docUploadMatch[3]} এর জন্য ${toBengaliDigits(docUploadMatch[1])} টি ডকুমেন্ট আপলোড করা হয়েছে`;
  }
  const docRemoveMatch = text.match(/^Removed\s+document\s+"(.+?)"\s+for\s+(customer|employee)\s+(.+)$/i);
  if (docRemoveMatch) {
    const roleLabel = docRemoveMatch[2].toLowerCase() === 'customer' ? 'গ্রাহক' : 'কর্মী';
    return `${roleLabel} ${docRemoveMatch[3]} এর "${docRemoveMatch[1]}" ডকুমেন্ট মুছে ফেলা হয়েছে`;
  }

  return text;
}
