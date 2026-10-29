/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - Persistent In-Browser Document Vault (IndexedDB)
 * Stores compiled PDFs, KYC documents, Title Deeds, and deal payloads offline (< 140 lines).
 */

const DB_NAME = 'white_caves_henry_vault';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

const openVaultDb = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('documentType', 'documentType', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('tenantName', 'tenantName', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveDocumentToVault = async (doc) => {
  const db = await openVaultDb();
  if (!db) return null;

  const record = {
    id: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: doc.title || 'Untitled Document',
    documentType: doc.documentType || 'general',
    tenantName: doc.tenantName || '',
    propertyNo: doc.propertyNo || '',
    buildingName: doc.buildingName || '',
    annualRent: doc.annualRent || '',
    pdfBlob: doc.pdfBlob || null,
    blobUrl: doc.blobUrl || null,
    metadata: doc.metadata || {},
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);

    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
};

export const listVaultDocuments = async () => {
  const db = await openVaultDb();
  if (!db) return [];

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const results = req.result || [];
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
};

export const getVaultDocument = async (id) => {
  const db = await openVaultDb();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
};

export const deleteVaultDocument = async (id) => {
  const db = await openVaultDb();
  if (!db) return false;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
};

export const searchVaultDocuments = async (query = '') => {
  const all = await listVaultDocuments();
  if (!query.trim()) return all;

  const q = query.toLowerCase();
  return all.filter(
    (d) =>
      (d.title && d.title.toLowerCase().includes(q)) ||
      (d.tenantName && d.tenantName.toLowerCase().includes(q)) ||
      (d.propertyNo && d.propertyNo.toLowerCase().includes(q)) ||
      (d.buildingName && d.buildingName.toLowerCase().includes(q)) ||
      (d.documentType && d.documentType.toLowerCase().includes(q)),
  );
};
