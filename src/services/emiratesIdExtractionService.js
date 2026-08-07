import { normalizeBilingualTextPreserveLines, pickFirstGroupMatch } from './multilingualTextUtils';

const clean = (v) =>
  String(v || '')
    .replace(/\s+/g, ' ')
    .trim();

const find = (text, regex) => {
  const m = text.match(regex);
  return m?.[1] ? clean(m[1]) : '';
};

const normalizeNameFromMrz = (rawMrzName) => {
  const v = clean(rawMrzName).replace(/<+/g, ' ').trim();
  if (!v) return '';
  return v
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const parseEmiratesIdText = (rawText) => {
  const textRaw = String(rawText || '');
  const textNormalized = normalizeBilingualTextPreserveLines(textRaw);
  const textVariants = [textNormalized, textRaw];

  const mrzLine1 = find(textNormalized, /(I[A-Z0-9<]{20,})/i);
  const mrzLine2 = find(textNormalized, /([0-9]{6}[A-Z][0-9]{6}[A-Z]{3}[<A-Z0-9]+)/i);
  const mrzLine3Raw = find(textNormalized, /([A-Z]+<<[A-Z<]{4,})/i);

  const idValue = pickFirstGroupMatch(textVariants, [
    /ID\s*Number\s*[:-]?\s*([0-9]{3}[-\s]?[0-9]{4}[-\s]?[0-9]{7}[-\s]?[0-9])/i,
    /(?:رقم\s*الهوية|الهوية\s*الإماراتية)\s*[:-]?\s*([0-9]{3}[-\s]?[0-9]{4}[-\s]?[0-9]{7}[-\s]?[0-9])/i,
  ]);

  const fullNameEn = pickFirstGroupMatch(textVariants, [
    /(?:Name|Full\s*Name)\s*[:-]?\s*([^\n\r]+)/i,
    /Cardholder\s*Name\s*[:-]?\s*([^\n\r]+)/i,
  ]);

  const fullNameAr = pickFirstGroupMatch(textVariants, [/(?:الاسم\s*الكامل|الاسم)\s*[:-]?\s*([^\n\r]+)/i]);

  const nationalityEn = pickFirstGroupMatch(textVariants, [/(?:Nationality)\s*[:-]?\s*([^\n\r]+)/i]);
  const nationalityAr = pickFirstGroupMatch(textVariants, [/(?:الجنسية)\s*[:-]?\s*([^\n\r]+)/i]);

  const parsed = {
    documentType:
      textRaw.toLowerCase().includes('resident identity card') || textRaw.includes('بطاقة الهوية الإماراتية')
        ? 'Emirates ID'
        : 'Emirates ID',
    idNumber: idValue.replace(/\s+/g, '').replace(/(784)(\d{4})(\d{7})(\d)/, '$1-$2-$3-$4'),
    fullName: fullNameEn || fullNameAr,
    fullNameEn,
    fullNameAr,
    dateOfBirth: pickFirstGroupMatch(textVariants, [
      /(?:Date\s*of\s*Birth|DOB)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i,
      /(?:تاريخ\s*الميلاد)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i,
    ]),
    nationality: nationalityEn || nationalityAr,
    nationalityEn,
    nationalityAr,
    issuingDate: pickFirstGroupMatch(textVariants, [
      /(?:Issuing\s*Date|Issue\s*Date)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i,
      /(?:تاريخ\s*الإصدار)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i,
    ]),
    expiryDate: pickFirstGroupMatch(textVariants, [
      /(?:Expiry\s*Date|Expires|Exp)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i,
      /(?:تاريخ\s*الانتهاء|انتهاء\s*الصلاحية)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i,
    ]),
    sex: pickFirstGroupMatch(
      textVariants,
      [/(?:Sex|Gender)\s*[:-]?\s*([MF])/i, /(?:الجنس)\s*[:-]?\s*([ذكرانثىمf])/i],
      {
        normalize: false,
      },
    ),
    cardNumber: pickFirstGroupMatch(textVariants, [
      /Card\s*Number\s*[:-]?\s*([0-9]{6,})/i,
      /(?:رقم\s*البطاقة)\s*[:-]?\s*([0-9]{6,})/i,
    ]),
    occupation: pickFirstGroupMatch(textVariants, [
      /Occupation\s*[:-]?\s*([^\n\r]+)/i,
      /(?:المهنة)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    employer: pickFirstGroupMatch(textVariants, [
      /Employer\s*[:-]?\s*([^\n\r]+)/i,
      /(?:جهة\s*العمل|صاحب\s*العمل)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    issuingPlace: pickFirstGroupMatch(textVariants, [
      /Issuing\s*Place\s*[:-]?\s*([^\n\r]+)/i,
      /(?:مكان\s*الإصدار)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    mrzLine1,
    mrzLine2,
    mrzLine3: mrzLine3Raw,
    mrzNameNormalized: normalizeNameFromMrz(mrzLine3Raw),
  };

  if (!parsed.fullName && parsed.mrzNameNormalized) {
    parsed.fullName = parsed.mrzNameNormalized;
  }

  return parsed;
};

export const buildEmiratesIdNumberedItems = (parsed, ownerTag) => {
  const rows = [
    ['Document Type', parsed.documentType],
    ['Owner Tag', ownerTag],
    ['ID Number', parsed.idNumber],
    ['Full Name', parsed.fullName],
    ['Date of Birth', parsed.dateOfBirth],
    ['Nationality', parsed.nationality],
    ['Sex', parsed.sex],
    ['Issuing Date', parsed.issuingDate],
    ['Expiry Date', parsed.expiryDate],
    ['Card Number', parsed.cardNumber],
    ['Occupation', parsed.occupation],
    ['Employer', parsed.employer],
    ['Issuing Place', parsed.issuingPlace],
    ['MRZ Line 1', parsed.mrzLine1],
    ['MRZ Line 2', parsed.mrzLine2],
    ['MRZ Line 3', parsed.mrzLine3],
  ];

  return rows
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .map(([label, value], idx) => ({ no: idx + 1, label, value }));
};

export const evaluateEmiratesIdReadiness = (parsed) => {
  const requiredFields = ['idNumber', 'fullName', 'dateOfBirth', 'nationality', 'issuingDate', 'expiryDate'];

  const missing = requiredFields.filter((field) => {
    const value = parsed?.[field];
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    return false;
  });

  return {
    requiredCount: requiredFields.length,
    completedCount: requiredFields.length - missing.length,
    missing,
    ready: missing.length === 0,
  };
};
