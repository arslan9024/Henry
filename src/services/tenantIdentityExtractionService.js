import {
  normalizeArabicDigits,
  normalizeBilingualTextPreserveLines,
  pickFirstGroupMatch,
} from './multilingualTextUtils';

const clean = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

const splitMrzLines = (text) =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => clean(line))
    .filter((line) => line.length >= 12 && line.includes('<'));

const normalizeNameFromMrz = (rawMrzName) => {
  const value = clean(rawMrzName).replace(/<+/g, ' ').trim();
  if (!value) return '';
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const TENANT_IDENTITY_TYPES = {
  PASSPORT: 'passport',
  RESIDENCE_PERMIT: 'residence-permit',
};

export const normalizeTenantIdentityType = (documentType) => {
  const type = String(documentType || '')
    .toLowerCase()
    .trim();
  if (type === TENANT_IDENTITY_TYPES.RESIDENCE_PERMIT || type === 'visa' || type === 'residence permit') {
    return TENANT_IDENTITY_TYPES.RESIDENCE_PERMIT;
  }
  return TENANT_IDENTITY_TYPES.PASSPORT;
};

export const parseTenantIdentityText = (rawText, documentType = TENANT_IDENTITY_TYPES.PASSPORT) => {
  const textRaw = String(rawText || '');
  const textNormalized = normalizeBilingualTextPreserveLines(textRaw);
  const textVariants = [textNormalized, textRaw];
  const normalizedType = normalizeTenantIdentityType(documentType);
  const mrzLines = splitMrzLines(textNormalized);
  const mrzLine1 = mrzLines[0] || '';
  const mrzLine2 = mrzLines[1] || '';
  const mrzLine3 = mrzLines[2] || '';

  const commonFields = {
    documentType: normalizedType,
    fullName: pickFirstGroupMatch(textVariants, [
      /(?:Full\s*Name|Name|Holder\s*Name|Cardholder\s*Name)\s*[:-]?\s*([^\n\r]+)/i,
      /Surname\s*[:-]?\s*([^\n\r]+)/i,
      /(?:الاسم\s*الكامل|الاسم)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    nationality: pickFirstGroupMatch(textVariants, [
      /(?:Nationality|Country\s*of\s*Nationality)\s*[:-]?\s*([^\n\r]+)/i,
      /(?:الجنسية)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    dateOfBirth: pickFirstGroupMatch(textVariants, [
      /(?:Date\s*of\s*Birth|DOB|Birth\s*Date)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{1,2}\s+[A-Z]{3,9}\s+[0-9]{2,4})/i,
      /(?:تاريخ\s*الميلاد)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i,
    ]),
    sex: pickFirstGroupMatch(textVariants, [
      /(?:Sex|Gender)\s*[:-]?\s*([MF])/i,
      /(?:الجنس)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    issueDate: pickFirstGroupMatch(textVariants, [
      /(?:Issue\s*Date|Issued\s*On|Date\s*of\s*Issue)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{1,2}\s+[A-Z]{3,9}\s+[0-9]{2,4})/i,
      /(?:تاريخ\s*الإصدار)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i,
    ]),
    expiryDate: pickFirstGroupMatch(textVariants, [
      /(?:Expiry\s*Date|Expiration\s*Date|Valid\s*Until|Expires\s*On)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{1,2}\s+[A-Z]{3,9}\s+[0-9]{2,4})/i,
      /(?:تاريخ\s*الانتهاء|انتهاء\s*الصلاحية)\s*[:-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i,
    ]),
    placeOfIssue: pickFirstGroupMatch(textVariants, [
      /(?:Place\s*of\s*Issue|Issue\s*Place|Issuing\s*Place)\s*[:-]?\s*([^\n\r]+)/i,
      /(?:مكان\s*الإصدار)\s*[:-]?\s*([^\n\r]+)/i,
    ]),
    mrzLine1,
    mrzLine2,
    mrzLine3,
  };

  if (normalizedType === TENANT_IDENTITY_TYPES.PASSPORT) {
    const passportNo = pickFirstGroupMatch(textVariants, [
      /(?:Passport\s*No|Passport\s*Number|Passport\s*#|Passport\s*ID)\s*[:-]?\s*([A-Z0-9-]{5,})/i,
      /(?:Travel\s*Document\s*No|Document\s*No)\s*[:-]?\s*([A-Z0-9-]{5,})/i,
      /(?:رقم\s*الجواز|رقم\s*جواز\s*السفر)\s*[:-]?\s*([A-Z0-9-]{5,})/i,
      /P<[A-Z]{3}([A-Z0-9<]{7,12})/i,
    ])
      .replace(/<+/g, '')
      .trim();

    const parsed = {
      ...commonFields,
      passportNo,
      permitNo: '',
      sponsor: '',
      employer: '',
      visaType: '',
      fileNo: '',
      unifiedNo: '',
    };

    if (!parsed.fullName && mrzLine2) {
      const mrzName = mrzLine2.split('<<').slice(1).join(' ');
      parsed.fullName = normalizeNameFromMrz(mrzName);
    }

    return parsed;
  }

  const permitNo = pickFirstGroupMatch(textVariants, [
    /(?:Residence\s*Permit\s*No|Residence\s*Permit\s*Number|Permit\s*No|Permit\s*Number|Visa\s*No|Visa\s*Number)\s*[:-]?\s*([A-Z0-9-]{5,})/i,
    /(?:File\s*No|File\s*Number)\s*[:-]?\s*([A-Z0-9-]{4,})/i,
    /(?:رقم\s*الإقامة|رقم\s*التأشيرة|رقم\s*الفيزا)\s*[:-]?\s*([A-Z0-9-]{4,})/i,
  ]);
  const sponsor = pickFirstGroupMatch(textVariants, [
    /(?:Sponsor|Sponsor\s*Name)\s*[:-]?\s*([^\n\r]+)/i,
    /(?:الكفيل|اسم\s*الكفيل)\s*[:-]?\s*([^\n\r]+)/i,
  ]);
  const employer = pickFirstGroupMatch(textVariants, [
    /(?:Employer|Company|Employer\s*Name)\s*[:-]?\s*([^\n\r]+)/i,
    /(?:جهة\s*العمل|صاحب\s*العمل)\s*[:-]?\s*([^\n\r]+)/i,
  ]);
  const visaType = pickFirstGroupMatch(textVariants, [
    /(?:Visa\s*Type|Permit\s*Type|Residence\s*Status)\s*[:-]?\s*([^\n\r]+)/i,
    /(?:نوع\s*التأشيرة|نوع\s*الإقامة)\s*[:-]?\s*([^\n\r]+)/i,
  ]);
  const fileNo = pickFirstGroupMatch(textVariants, [
    /(?:File\s*No|File\s*Number)\s*[:-]?\s*([A-Z0-9-]{4,})/i,
    /(?:رقم\s*الملف)\s*[:-]?\s*([A-Z0-9-]{4,})/i,
  ]);
  const unifiedNo = pickFirstGroupMatch(textVariants, [
    /(?:Unified\s*No|Unified\s*Number)\s*[:-]?\s*([A-Z0-9-]{4,})/i,
    /(?:الرقم\s*الموحد)\s*[:-]?\s*([A-Z0-9-]{4,})/i,
  ]);

  const parsed = {
    ...commonFields,
    permitNo,
    sponsor,
    employer,
    visaType,
    fileNo,
    unifiedNo,
    passportNo: pickFirstGroupMatch(textVariants, [
      /(?:Passport\s*No|Passport\s*Number)\s*[:-]?\s*([A-Z0-9-]{5,})/i,
      /(?:رقم\s*الجواز|رقم\s*جواز\s*السفر)\s*[:-]?\s*([A-Z0-9-]{5,})/i,
    ]),
  };

  parsed.permitNo = normalizeArabicDigits(parsed.permitNo || '');
  parsed.passportNo = normalizeArabicDigits(parsed.passportNo || '');

  if (!parsed.fullName && mrzLine2) {
    const mrzName = mrzLine2.split('<<').slice(1).join(' ');
    parsed.fullName = normalizeNameFromMrz(mrzName);
  }

  return parsed;
};

export const buildTenantIdentityNumberedItems = (parsed) => {
  if (!parsed) return [];

  const rows = [
    ['Document Type', parsed.documentType],
    ['Passport Number', parsed.passportNo],
    ['Permit Number', parsed.permitNo],
    ['Full Name', parsed.fullName],
    ['Nationality', parsed.nationality],
    ['Date of Birth', parsed.dateOfBirth],
    ['Sex', parsed.sex],
    ['Issue Date', parsed.issueDate],
    ['Expiry Date', parsed.expiryDate],
    ['Place of Issue', parsed.placeOfIssue],
    ['Sponsor', parsed.sponsor],
    ['Employer', parsed.employer],
    ['Visa Type', parsed.visaType],
    ['File No', parsed.fileNo],
    ['Unified No', parsed.unifiedNo],
    ['MRZ Line 1', parsed.mrzLine1],
    ['MRZ Line 2', parsed.mrzLine2],
    ['MRZ Line 3', parsed.mrzLine3],
  ];

  return rows
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .map(([label, value], idx) => ({ no: idx + 1, label, value }));
};

export const evaluateTenantIdentityReadiness = (parsed) => {
  if (!parsed) {
    return {
      requiredCount: 0,
      completedCount: 0,
      missing: [],
      ready: false,
    };
  }

  const normalizedType = normalizeTenantIdentityType(parsed.documentType);
  const requiredFields =
    normalizedType === TENANT_IDENTITY_TYPES.RESIDENCE_PERMIT
      ? ['permitNo', 'fullName', 'nationality', 'issueDate', 'expiryDate']
      : ['passportNo', 'fullName', 'nationality', 'dateOfBirth', 'expiryDate'];

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
