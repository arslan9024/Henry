const STORAGE_KEY = 'henry.emirates-id.references.v1';

const safeParse = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const loadEmiratesIdReferences = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return safeParse(raw);
};

export const persistEmiratesIdReferences = (entries) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(entries) ? entries : []));
};

export const saveEmiratesIdReference = ({
  fileName,
  ownerTag,
  sourcePath,
  parsed,
  numberedItems,
  extractedText,
}) => {
  const entry = {
    id: `emirates_id_${Date.now()}`,
    fileName,
    ownerTag,
    sourcePath,
    createdAt: new Date().toISOString(),
    parsed,
    numberedItems,
    extractedText,
  };

  const current = loadEmiratesIdReferences();
  const next = [entry, ...current].slice(0, 120);
  persistEmiratesIdReferences(next);
  return entry;
};
