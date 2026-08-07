const STORAGE_KEY = 'henry.title-deed.references.v1';

const safeParse = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const loadTitleDeedReferences = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return safeParse(raw);
};

export const persistTitleDeedReferences = (entries) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(entries) ? entries : []));
};

export const saveTitleDeedReference = ({
  fileName,
  sourcePath,
  parsed,
  numberedItems,
  extractedText,
}) => {
  const entry = {
    id: `title_deed_${Date.now()}`,
    fileName,
    sourcePath,
    createdAt: new Date().toISOString(),
    parsed,
    numberedItems,
    extractedText,
  };

  const current = loadTitleDeedReferences();
  const next = [entry, ...current].slice(0, 80);
  persistTitleDeedReferences(next);
  return entry;
};
