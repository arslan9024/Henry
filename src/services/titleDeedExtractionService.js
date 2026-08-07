const clean = (v) =>
  String(v || '')
    .replace(/\s+/g, ' ')
    .trim();

const findByRegex = (text, regex) => {
  const match = text.match(regex);
  return match?.[1] ? clean(match[1]) : '';
};

const normalizeMortgageStatus = (value) => {
  const v = clean(value).toLowerCase();
  if (!v) return '';
  if (v.includes('not mortgaged') || v.includes('غير مرهونة')) return 'Not mortgaged';
  return clean(value);
};

const toNumberOrRaw = (value) => {
  const normalized = clean(value).replace(/,/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : clean(value);
};

export const parseTitleDeedText = (rawText) => {
  const text = String(rawText || '');

  const parsed = {
    documentType: text.toLowerCase().includes('title deed') ? 'Title Deed' : '',
    issueDate: findByRegex(text, /Issue\s*Date\s*[:-]?\s*([^\n\r]+)/i),
    mortgageStatus: normalizeMortgageStatus(findByRegex(text, /Mortgage\s*Status\s*[:-]?\s*([^\n\r]+)/i)),
    propertyType: findByRegex(text, /Property\s*Type\s*[:-]?\s*([^\n\r]+)/i),
    community: findByRegex(text, /Community\s*[:-]?\s*([^\n\r]+)/i),
    plotNo: findByRegex(text, /Plot\s*No\s*[:-]?\s*([^\n\r]+)/i),
    municipalityNo: findByRegex(text, /Municipality\s*No\s*[:-]?\s*([^\n\r]+)/i),
    areaSqMeter: toNumberOrRaw(findByRegex(text, /Area\s*Sq\s*Meter\s*[:-]?\s*([^\n\r]+)/i)),
    areaSqFeet: toNumberOrRaw(findByRegex(text, /Area\s*Sq\s*Feet\s*[:-]?\s*([^\n\r]+)/i)),
    ownerName: findByRegex(text, /\(\d+\)\s*([A-Z0-9\s.&'-]{3,})\s*(?:\n|\r|\d|Purchased)/i),
    ownerNumber: findByRegex(text, /\((\d{5,})\)/),
    landRegistrationNo: findByRegex(text, /Land\s*Registration\s*No\s*[:-]?\s*([^\s\n\r]+)/i),
    purchaseDate: findByRegex(text, /Date\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})\s*for\s*the\s*amount/i),
    purchaseAmountAed: toNumberOrRaw(findByRegex(text, /amount\s*([0-9,]+)\s*Dirham/i)),
    certificateNo: findByRegex(
      text,
      /(?:Approved\s*Signature\s*)?([0-9]{4,}[/-][0-9]{4})\s*(?:DUBAI\s*LAND\s*DEPARTMENT|$)/i,
    ),
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
