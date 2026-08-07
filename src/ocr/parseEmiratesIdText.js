import {
  normalizeArabicDigits,
  normalizeBilingualText,
  pickFirstGroupMatch,
} from '../services/multilingualTextUtils';

const NAME_LABEL_REGEX = /(name|full\s*name)\s*[:-]?\s*([A-Z][A-Z\s]{4,})/i;
const EMIRATES_ID_REGEX = /(784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d)/i;
const EXPIRY_LABEL_REGEX =
  /(expiry|expires|exp)\s*[:-]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i;

const cleanLine = (line) =>
  line
    .replace(/[^A-Za-z0-9\u0600-\u06FF\s\-/:.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const parseEmiratesIdText = (rawText = '') => {
  const cleaned = String(rawText || '').replace(/\r/g, '\n');
  const normalizedForRegex = normalizeBilingualText(cleaned);
  const textVariants = [normalizedForRegex, cleaned];
  const lines = cleaned.split('\n').map(cleanLine).filter(Boolean);

  const labelNameMatch =
    normalizedForRegex.match(NAME_LABEL_REGEX) ||
    normalizedForRegex.match(/(?:الاسم\s*الكامل|الاسم)\s*[:-]?\s*([^\n\r]+)/i);
  const idMatch =
    normalizedForRegex.match(EMIRATES_ID_REGEX) ||
    normalizedForRegex.match(
      /(?:رقم\s*الهوية|الهوية\s*الإماراتية)\s*[:-]?\s*([0-9]{3}[-\s]?[0-9]{4}[-\s]?[0-9]{7}[-\s]?[0-9])/i,
    );
  const expiryMatch =
    normalizedForRegex.match(EXPIRY_LABEL_REGEX) ||
    normalizedForRegex.match(
      /(?:تاريخ\s*الانتهاء|انتهاء\s*الصلاحية)\s*[:-]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i,
    );

  let fullName = labelNameMatch?.[2]?.trim() || '';

  if (!fullName) {
    fullName = lines.find((line) => /^[A-Z][A-Z\s]{7,}$/.test(line) && !line.includes('EMIRATES')) || '';
  }

  const fallbackName =
    lines.find(
      (line) => line.split(' ').length >= 3 && /[A-Za-z\u0600-\u06FF]/.test(line) && !/\d/.test(line),
    ) || '';

  const normalizedId =
    normalizeArabicDigits(idMatch?.[1] || '')
      .replace(/\s+/g, '')
      .replace(/(784)(\d{4})(\d{7})(\d)/, '$1-$2-$3-$4') || '';

  const fullNameAr = pickFirstGroupMatch(textVariants, [/(?:الاسم\s*الكامل|الاسم)\s*[:-]?\s*([^\n\r]+)/i]);
  const fullNameEn = pickFirstGroupMatch(textVariants, [/(?:Name|Full\s*Name)\s*[:-]?\s*([^\n\r]+)/i]);

  return {
    fullName: (fullNameEn || fullNameAr || fullName || fallbackName).trim(),
    fullNameAr,
    fullNameEn,
    emiratesId: normalizedId,
    expiryDate: normalizeArabicDigits(expiryMatch?.[2] || ''),
    confidence: {
      fullName: fullNameEn || fullNameAr || fullName ? 'medium' : fallbackName ? 'low' : 'low',
      emiratesId: normalizedId ? 'high' : 'low',
      expiryDate: expiryMatch?.[2] ? 'medium' : 'low',
    },
    rawText,
    lines,
  };
};
