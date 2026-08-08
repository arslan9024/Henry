const normalizePath = (value) =>
  String(value || '')
    .replace(/^\/+/, '')
    .replace(/\.{2,}/g, '')
    .replace(/[^a-zA-Z0-9._/-]/g, '_');

export const getCloudPersistenceConfig = (env = import.meta.env) => ({
  provider: env.VITE_HENRY_STORAGE_PROVIDER || 'local',
  firebaseBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  firebaseToken: env.VITE_FIREBASE_STORAGE_TOKEN || '',
});

const localAdapter = {
  id: 'local',
  persist: async ({ path, blob }) => {
    const parts = normalizePath(path).split('/');
    const fileName = parts.pop();
    const response = await fetch('/api/records/file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-record-path': parts.join('/'),
        'x-file-name': fileName,
      },
      body: blob,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json().catch(() => ({}));
  },
};

const createFirebaseAdapter = ({ firebaseBucket, firebaseToken }) => ({
  id: 'firebase',
  persist: async ({ path, blob }) => {
    if (!firebaseBucket || !firebaseToken) {
      throw new Error('Firebase Storage requires VITE_FIREBASE_STORAGE_BUCKET and a runtime storage token.');
    }
    const objectName = normalizePath(path);
    const endpoint = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(firebaseBucket)}/o?uploadType=media&name=${encodeURIComponent(objectName)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${firebaseToken}`,
        'Content-Type': blob.type || 'application/octet-stream',
      },
      body: blob,
    });
    if (!response.ok) throw new Error(`Firebase persistence failed (HTTP ${response.status}).`);
    const data = await response.json();
    return { ok: true, path: `firebase://${firebaseBucket}/${objectName}`, providerData: data };
  },
});

export const createPersistenceAdapter = (config = getCloudPersistenceConfig()) =>
  config.provider === 'firebase' ? createFirebaseAdapter(config) : localAdapter;

export const persistWithConfiguredProvider = ({ path, blob, config }) =>
  createPersistenceAdapter(config).persist({ path, blob });
