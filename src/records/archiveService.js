// Henry archive persistence service.
//
// Strategy (privacy-first, dev-friendly):
//   - Always write to localStorage as fast cache + offline fallback.
//   - When backend (`/api/records/archive`) is reachable, also persist to disk
//     under <repoRoot>/records/{YEAR}/{MONTH}/{PROPERTY}/ via the Henry dev plugin.
//   - PDF binaries are uploaded via persistRecordFile().

const STORAGE_KEY = 'henry.archive.records.v1';
const ARCHIVE_API = '/api/records/archive';
const FILE_API = '/api/records/file';

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  const storage = window.localStorage;
  if (!storage) return null;
  const hasRead = typeof storage.getItem === 'function';
  const hasWrite = typeof storage.setItem === 'function';
  return hasRead && hasWrite ? storage : null;
};

export const loadArchiveEntries = () => {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 100);
  } catch (error) {
    console.error('Failed to load archive entries', error);
    return [];
  }
};

export const persistArchiveEntries = (entries) => {
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to persist archive entries to localStorage', error);
    }
  }

  try {
    fetch(ARCHIVE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entries),
    }).catch(() => {
      // Silent: dev backend may be down or production runtime without API
    });
  } catch {
    // ignore: backend not available
  }
};

export const persistRecordFile = async ({ recordPath, fileName, blob }) => {
  if (typeof window === 'undefined') return { ok: false, reason: 'no-window' };
  if (!recordPath || !fileName || !blob) {
    return { ok: false, reason: 'missing-args' };
  }

  try {
    const response = await fetch(FILE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-record-path': recordPath,
        'x-file-name': fileName,
      },
      body: blob,
    });

    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status}` };
    }

    const data = await response.json().catch(() => ({}));
    const path = typeof data?.path === 'string' ? data.path : null;
    return { ok: true, path };
  } catch (error) {
    return { ok: false, reason: error.message || 'fetch-failed' };
  }
};

export const fetchArchiveFromBackend = async () => {
  if (typeof window === 'undefined') return null;
  try {
    const response = await fetch(ARCHIVE_API);
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
};
