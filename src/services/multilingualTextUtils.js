const ARABIC_DIGIT_MAP = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

const ARABIC_DIGITS_REGEX = /[٠-٩]/g;
const ARABIC_CHARS_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
const LATIN_CHARS_REGEX = /[A-Za-z]/g;
const ARABIC_DIACRITICS_REGEX = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

export const normalizeArabicDigits = (value = '') =>
  String(value).replace(ARABIC_DIGITS_REGEX, (digit) => ARABIC_DIGIT_MAP[digit] || digit);

export const stripArabicDiacritics = (value = '') => String(value).replace(ARABIC_DIACRITICS_REGEX, '');

export const normalizeBilingualText = (value = '') =>
  normalizeArabicDigits(stripArabicDiacritics(String(value)))
    .replace(/[،]/g, ',')
    .replace(/[؛]/g, ';')
    .replace(/[ـ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const normalizeBilingualTextPreserveLines = (value = '') =>
  String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => normalizeBilingualText(line))
    .join('\n');

export const detectTextLanguage = (value = '') => {
  const text = String(value || '');
  const arabicCount = (text.match(ARABIC_CHARS_REGEX) || []).length;
  const latinCount = (text.match(LATIN_CHARS_REGEX) || []).length;
  const total = arabicCount + latinCount;

  if (!total) {
    return {
      language: 'unknown',
      arabicCount,
      latinCount,
      arabicRatio: 0,
      latinRatio: 0,
    };
  }

  const arabicRatio = arabicCount / total;
  const latinRatio = latinCount / total;

  if (arabicRatio > 0.7) {
    return { language: 'ar', arabicCount, latinCount, arabicRatio, latinRatio };
  }

  if (latinRatio > 0.7) {
    return { language: 'en', arabicCount, latinCount, arabicRatio, latinRatio };
  }

  return { language: 'mixed', arabicCount, latinCount, arabicRatio, latinRatio };
};

export const pickFirstGroupMatch = (textVariants = [], regexes = [], { normalize = true } = {}) => {
  for (const text of textVariants) {
    for (const regex of regexes) {
      const match = String(text || '').match(regex);
      if (!match?.[1]) continue;
      const value = normalize ? normalizeBilingualText(match[1]) : String(match[1]).trim();
      if (value) return value;
    }
  }

  return '';
};
