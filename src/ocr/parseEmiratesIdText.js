// Dash escapes inside the char classes below are intentional (older lint
// rules required them for portability across regex engines).
/* eslint-disable no-useless-escape */
const NAME_LABEL_REGEX = /(name|full\s*name)\s*[:\-]?\s*([A-Z][A-Z\s]{4,})/i;
const EMIRATES_ID_REGEX = /(784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d)/i;
const EXPIRY_LABEL_REGEX =
  /(expiry|expires|exp)\s*[:\-]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i;
/* eslint-enable no-useless-escape */

const cleanLine = (line) =>
  line
    .replace(/[^A-Za-z0-9\s\-/:.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const parseEmiratesIdText = (rawText = '') => {
  const cleaned = rawText.replace(/\r/g, '\n');
  const lines = cleaned.split('\n').map(cleanLine).filter(Boolean);

  const labelNameMatch = cleaned.match(NAME_LABEL_REGEX);
  const idMatch = cleaned.match(EMIRATES_ID_REGEX);
  const expiryMatch = cleaned.match(EXPIRY_LABEL_REGEX);

  let fullName = labelNameMatch?.[2]?.trim() || '';

  if (!fullName) {
    fullName = lines.find((line) => /^[A-Z][A-Z\s]{7,}$/.test(line) && !line.includes('EMIRATES')) || '';
  }

  const fallbackName =
    lines.find((line) => line.split(' ').length >= 3 && /[A-Za-z]/.test(line) && !/\d/.test(line)) || '';

  const normalizedId =
    idMatch?.[1]?.replace(/\s+/g, '').replace(/(784)(\d{4})(\d{7})(\d)/, '$1-$2-$3-$4') || '';

  return {
    fullName: (fullName || fallbackName).trim(),
    emiratesId: normalizedId,
    expiryDate: expiryMatch?.[2] || '',
    confidence: {
      fullName: fullName ? 'medium' : fallbackName ? 'low' : 'low',
      emiratesId: normalizedId ? 'high' : 'low',
      expiryDate: expiryMatch?.[2] ? 'medium' : 'low',
    },
    rawText,
    lines,
  };
};
