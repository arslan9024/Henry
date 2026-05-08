/**
 * documentPersistence.test.js
 *
 * Tests for loadPersistedDocumentState — the helper that restores the document
 * slice from localStorage when the Redux store boots.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { STORAGE_KEY_DOCUMENT } from '../constants/storageKeys';

// We import after configuring localStorage so the module reads the current value.
// Use dynamic import to re-evaluate the module under different conditions.

const setRaw = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY_DOCUMENT, value);
  } catch {
    /* ignore */
  }
};

// We test loadPersistedDocumentState directly via the exported store/index.js helper.
// To avoid running the full store setup on every test, we import the helper in isolation.
// The easiest approach: spy on localStorage and test the function in a fresh module context.

describe('loadPersistedDocumentState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns undefined when nothing is stored', async () => {
    const { loadPersistedDocumentState } = await import('./index.js');
    expect(loadPersistedDocumentState()).toBeUndefined();
  });

  it('returns the stored object when it has a valid property section', async () => {
    const snapshot = { property: { unit: 'U-100', community: 'Marina' }, tenant: { fullName: 'Sara' } };
    setRaw(JSON.stringify(snapshot));
    const { loadPersistedDocumentState } = await import('./index.js');
    const result = loadPersistedDocumentState();
    expect(result).not.toBeUndefined();
    expect(result.property.unit).toBe('U-100');
    expect(result.tenant.fullName).toBe('Sara');
  });

  it('returns undefined when the stored value is not a valid object', async () => {
    setRaw('"just a string"');
    const { loadPersistedDocumentState } = await import('./index.js');
    expect(loadPersistedDocumentState()).toBeUndefined();
  });

  it('returns undefined when the stored value is an array', async () => {
    setRaw('[1, 2, 3]');
    const { loadPersistedDocumentState } = await import('./index.js');
    expect(loadPersistedDocumentState()).toBeUndefined();
  });

  it('returns undefined when JSON is malformed', async () => {
    setRaw('{invalid json');
    const { loadPersistedDocumentState } = await import('./index.js');
    expect(loadPersistedDocumentState()).toBeUndefined();
  });

  it('returns undefined when the stored object has no property key', async () => {
    setRaw(JSON.stringify({ something: 'else' }));
    const { loadPersistedDocumentState } = await import('./index.js');
    expect(loadPersistedDocumentState()).toBeUndefined();
  });
});
