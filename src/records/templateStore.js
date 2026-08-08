import { persistRecordFile } from './archiveService';

const TEMPLATE_STORAGE_KEY = 'henry.tenancy-builder.templates.v1';
const MASTER_TEMPLATE_FOLDER = 'templates/tenancy/master';
const WORKING_COPY_FOLDER = 'templates/tenancy/working-copies';

const safeParse = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const loadTenancyTemplates = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
  if (!raw) return [];
  return safeParse(raw);
};

export const persistTenancyTemplates = (templates) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(Array.isArray(templates) ? templates : []));
};

export const getTenancyTemplateFolders = () => ({
  master: MASTER_TEMPLATE_FOLDER,
  workingCopies: WORKING_COPY_FOLDER,
});

const classifyTemplate = (file) => {
  const fileName = String(file?.name || '').toLowerCase();
  // Conservative default for phase 1: static mapping unless caller selects fillable.
  if (fileName.includes('acroform') || fileName.includes('fillable')) return 'fillable';
  return 'static';
};

export const saveTenancyTemplate = async ({ file, mode, createdBy = 'Henry User' }) => {
  if (!file) {
    return { ok: false, reason: 'missing-file' };
  }

  const id = `tpl_${Date.now()}`;
  const savedAt = new Date().toISOString();
  const templateMode = mode || classifyTemplate(file);
  const recordPath = `${MASTER_TEMPLATE_FOLDER}/${id}`;

  const persistResult = await persistRecordFile({
    recordPath,
    fileName: file.name,
    blob: file,
  });

  if (!persistResult.ok) {
    return { ok: false, reason: persistResult.reason || 'persist-failed' };
  }

  const entry = {
    id,
    name: file.name,
    savedAt,
    mode: templateMode,
    fileSize: file.size,
    kind: 'master',
    recordPath,
    persistedPath: persistResult.path,
    createdBy,
    version: '1.0.0',
  };

  const current = loadTenancyTemplates();
  const next = [entry, ...current].slice(0, 40);
  persistTenancyTemplates(next);

  return { ok: true, entry };
};

export const createEditableTemplateCopy = ({ templateId, createdBy = 'Henry User' }) => {
  const templates = loadTenancyTemplates();
  const source = templates.find((item) => item.id === templateId);
  if (!source) return { ok: false, reason: 'template-not-found' };

  const copyId = `tpl_copy_${Date.now()}`;
  const copy = {
    ...source,
    id: copyId,
    kind: 'working-copy',
    parentTemplateId: source.id,
    createdBy,
    savedAt: new Date().toISOString(),
    recordPath: `${WORKING_COPY_FOLDER}/${copyId}`,
    // We keep persistedPath reference to the master binary for phase 2.
    // A true physical binary clone endpoint can be added later if needed.
    sourcePersistedPath: source.persistedPath || null,
  };

  const next = [copy, ...templates].slice(0, 80);
  persistTenancyTemplates(next);

  return { ok: true, entry: copy, source };
};

export const updateTenancyTemplateProfile = ({ templateId, profile }) => {
  const templates = loadTenancyTemplates();
  const index = templates.findIndex((item) => item.id === templateId);
  if (index < 0) return { ok: false, reason: 'template-not-found' };
  if (templates[index].kind !== 'working-copy') return { ok: false, reason: 'master-read-only' };

  const updated = {
    ...templates[index],
    mappingProfile: profile,
    updatedAt: new Date().toISOString(),
  };
  const next = templates.map((item, itemIndex) => (itemIndex === index ? updated : item));
  persistTenancyTemplates(next);
  return { ok: true, entry: updated };
};
