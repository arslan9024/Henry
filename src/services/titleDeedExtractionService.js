import {
  normalizeArabicDigits,
  normalizeBilingualTextPreserveLines,
  pickFirstGroupMatch,
} from './multilingualTextUtils';

const clean = (v) =>
  String(v || '')
    .replace(/\s+/g, ' ')
    .trim();

const findByPatterns = (textVariants, regexes) => pickFirstGroupMatch(textVariants, regexes);

const normalizeMortgageStatus = (value) => {
  const v = clean(value).toLowerCase();
  if (!v) return '';
  if (
    v.includes('not mortgaged') ||
    v.includes('غير مرهونة') ||
    v.includes('بدون رهن') ||
    v.includes('خالية من الرهن')
  )
    return 'Not mortgaged';
  return clean(value);
};

const toNumberOrRaw = (value) => {
  const normalized = normalizeArabicDigits(clean(value)).replace(/,/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : clean(value);
};

export const parseTitleDeedText = (rawText) => {
  const textRaw = String(rawText || '');
  const textNormalized = normalizeBilingualTextPreserveLines(textRaw);
  const textVariants = [textNormalized, textRaw];

  const parsed = {
    documentType:
      textRaw.toLowerCase().includes('title deed') || textRaw.includes('سند الملكية') ? 'Title Deed' : '',
    issueDate: findByPatterns(textVariants, [
      /Issue\s*Date\s*[:-]?\s*([^\n\r]+)/i,
      /(?:تاريخ\s*الإصدار)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    mortgageStatus: normalizeMortgageStatus(
      findByPatterns(textVariants, [
        /Mortgage\s*Status\s*[:-]?\s*([^\n\r]+)/i,
        /(?:حالة\s*الرهن|الرهن)\s*[:-]?\s*([^\n\r]+)/i,
      ]),
    ),
    propertyType: findByPatterns(textVariants, [
      /Property\s*Type\s*[:-]?\s*([^\n\r]+)/i,
      /(?:نوع\s*العقار)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    community: findByPatterns(textVariants, [
      /Community\s*[:-]?\s*([^\n\r]+)/i,
      /(?:المجتمع|المنطقة)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    plotNo: findByPatterns(textVariants, [
      /Plot\s*No\s*[:-]?\s*([^\n\r]+)/i,
      /(?:رقم\s*القطعة)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    municipalityNo: findByPatterns(textVariants, [
      /Municipality\s*No\s*[:-]?\s*([^\n\r]+)/i,
      /(?:رقم\s*البلدية)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    areaSqMeter: toNumberOrRaw(
      findByPatterns(textVariants, [
        /Area\s*Sq\s*Meter\s*[:-]?\s*([^\n\r]+)/i,
        /(?:المساحة\s*بالمتر\s*المربع|المساحة\s*م2)\s*[:-]?\s*([^\n\r]+)/i,
      ]),
    ),
    areaSqFeet: toNumberOrRaw(
      findByPatterns(textVariants, [
        /Area\s*Sq\s*Feet\s*[:-]?\s*([^\n\r]+)/i,
        /(?:المساحة\s*بالقدم\s*المربع|المساحة\s*قدم2)\s*[:-]?\s*([^\n\r]+)/i,
      ]),
    ),
    ownerName:
      findByPatterns(textVariants, [
        /(?:Owner\s*Name|Landowner)\s*[:-]?\s*([^\n\r]+)/i,
        /(?:اسم\s*المالك)\s*[:-]?\s*([^\n\r]+)/i,
      ]) || findByPatterns(textVariants, [/\(\d+\)\s*([A-Z0-9\s.&'-]{3,})\s*(?:\n|\r|\d|Purchased)/i]),
    ownerNumber: normalizeArabicDigits(
      findByPatterns(textVariants, [/\((\d{5,})\)/, /(?:رقم\s*المالك)\s*[:-]?\s*([0-9]{5,})/i]),
    ),
    landRegistrationNo: findByPatterns(textVariants, [
      /Land\s*Registration\s*No\s*[:-]?\s*([^\s\n\r]+)/i,
      /(?:رقم\s*التسجيل\s*العقاري)\s*[:-]?\s*([^\s\n\r]+)/i,
    ]),
    purchaseDate: findByPatterns(textVariants, [
      /Date\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})\s*for\s*the\s*amount/i,
      /(?:تاريخ\s*الشراء)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i,
    ]),
    purchaseAmountAed: toNumberOrRaw(
      findByPatterns(textVariants, [
        /amount\s*([0-9,]+)\s*Dirham/i,
        /(?:مبلغ\s*الشراء|القيمة)\s*[:-]?\s*([0-9,]+)/i,
      ]),
    ),
    certificateNo: findByPatterns(textVariants, [
      /(?:Approved\s*Signature\s*)?([0-9]{4,}[/-][0-9]{4})\s*(?:DUBAI\s*LAND\s*DEPARTMENT|$)/i,
      /(?:رقم\s*الشهادة)\s*[:-]?\s*([0-9]{4,}[/-][0-9]{4})/i,
    ]),
  };

  return parsed;
};

export const buildTitleDeedNumberedItems = (parsed) => {
  const items = [
    ['Document Type', parsed.documentType],
    ['Issue Date', parsed.issueDate],
    ['Mortgage Status', parsed.mortgageStatus],
    ['Property Type', parsed.propertyType],
    ['Community', parsed.community],
    ['Plot Number', parsed.plotNo],
    ['Municipality Number', parsed.municipalityNo],
    ['Area (Sq Meter)', parsed.areaSqMeter],
    ['Area (Sq Feet)', parsed.areaSqFeet],
    ['Owner Name', parsed.ownerName],
    ['Owner Number', parsed.ownerNumber],
    ['Land Registration Number', parsed.landRegistrationNo],
    ['Purchase Date', parsed.purchaseDate],
    ['Purchase Amount (AED)', parsed.purchaseAmountAed],
    ['Certificate Number', parsed.certificateNo],
  ];

  return items
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .map(([label, value], idx) => ({
      no: idx + 1,
      label,
      value,
    }));
};

export const evaluateTitleDeedReadiness = (parsed) => {
  const requiredFields = [
    'issueDate',
    'mortgageStatus',
    'propertyType',
    'community',
    'plotNo',
    'areaSqMeter',
    'ownerName',
  ];

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
