import { persistRecordFile } from '../records/archiveService';

const STORAGE_KEY = 'henry.whatsapp.queue.v1';

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  const storage = window.localStorage;
  if (!storage) return null;
  const hasRead = typeof storage.getItem === 'function';
  const hasWrite = typeof storage.setItem === 'function';
  return hasRead && hasWrite ? storage : null;
};

export const loadWhatsAppQueue = () => {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistQueueLocally = (entries) => {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
};

export const queueWhatsAppSharePackage = async ({
  phone,
  blob,
  fileName,
  messageTemplate = '',
  caseContext = {},
}) => {
  if (typeof window === 'undefined') return { ok: false, reason: 'no-window' };
  if (!phone?.trim()) return { ok: false, reason: 'missing-phone' };
  if (!blob || !fileName) return { ok: false, reason: 'missing-artifact' };

  const queueId = `wa-${Date.now()}`;
  const queuedAt = new Date().toISOString();
  const year = new Date().getFullYear();
  const recordPath = `whatsapp-queue/${year}/${queueId}`;

  const queueEntry = {
    queueId,
    queuedAt,
    status: 'queued',
    phone: phone.trim(),
    fileName,
    messageTemplate,
    caseContext,
  };

  const localEntries = [queueEntry, ...loadWhatsAppQueue()].slice(0, 100);
  const storedLocally = persistQueueLocally(localEntries);

  const manifestBlob = new Blob([JSON.stringify(queueEntry, null, 2)], {
    type: 'application/json',
  });

  const [fileResult, manifestResult] = await Promise.all([
    persistRecordFile({ recordPath, fileName, blob }),
    persistRecordFile({ recordPath, fileName: 'queue-manifest.json', blob: manifestBlob }),
  ]);

  return {
    ok: storedLocally || fileResult.ok || manifestResult.ok,
    queueId,
    recordPath,
    storedLocally,
    fileResult,
    manifestResult,
  };
};
