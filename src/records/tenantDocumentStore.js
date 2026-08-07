const STORAGE_KEY = 'henry.tenant-document.references.v1';

const safeParse = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const loadTenantDocumentReferences = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return safeParse(raw);
};

export const persistTenantDocumentReferences = (entries) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(entries) ? entries : []));
};

export const saveTenantDocumentReference = ({
  type,
  fileName,
  sourcePath,
  parsed = null,
  numberedItems = [],
  extractedText = '',
  readiness = null,
  createdFrom = 'tenancy-builder-inline',
  documentLabel = null,
  ownerTag = null,
  fileKind = null,
} = {}) => {
  const entry = {
    id: `tenant_doc_${Date.now()}`,
    type,
    documentType: type,
    fileName,
    sourcePath,
    createdAt: new Date().toISOString(),
    createdFrom,
    documentLabel: documentLabel || (type === 'passport' ? 'Passport' : type === 'visa' || type === 'residence-permit' ? 'Residence Permit' : type),
    ownerTag,
    parsed,
    numberedItems: Array.isArray(numberedItems) ? numberedItems : [],
    extractedText,
    readiness,
    fileKind,
  };

  const current = loadTenantDocumentReferences();
  const next = [entry, ...current].slice(0, 120);
  persistTenantDocumentReferences(next);
  return entry;
};
