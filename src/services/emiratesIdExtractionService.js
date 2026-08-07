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
  const text = String(rawText || '');

  const mrzLine1 = find(text, /(I[A-Z0-9<]{20,})/i);
  const mrzLine2 = find(text, /([0-9]{6}[A-Z][0-9]{6}[A-Z]{3}[<A-Z0-9]+)/i);
  const mrzLine3Raw = find(text, /([A-Z]+<<[A-Z<]{4,})/i);

  const parsed = {
    documentType: text.toLowerCase().includes('resident identity card') ? 'Emirates ID' : 'Emirates ID',
    idNumber: find(text, /ID\s*Number\s*[:-]?\s*([0-9]{3}-[0-9]{4}-[0-9]{7}-[0-9])/i),
    fullName: find(text, /Name\s*[:-]?\s*([^\n\r]+)/i),
    dateOfBirth: find(text, /Date\s*of\s*Birth\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i),
    nationality: find(text, /Nationality\s*[:-]?\s*([^\n\r]+)/i),
    issuingDate: find(text, /Issuing\s*Date\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i),
    expiryDate: find(text, /Expiry\s*Date\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i),
    sex: find(text, /Sex\s*[:-]?\s*([MF])/i),
    cardNumber: find(text, /Card\s*Number\s*[:-]?\s*([0-9]{6,})/i),
    occupation: find(text, /Occupation\s*[:-]?\s*([^\n\r]+)/i),
    employer: find(text, /Employer\s*[:-]?\s*([^\n\r]+)/i),
    issuingPlace: find(text, /Issuing\s*Place\s*[:-]?\s*([^\n\r]+)/i),
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
