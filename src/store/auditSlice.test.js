import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import auditReducer, { addAuditLog, clearAuditLogs, restoreAuditLogs } from './auditSlice';

const STORAGE_KEY = 'henry.audit.logs';

const makeStore = () => configureStore({ reducer: { audit: auditReducer } });

const sampleEntry = (overrides = {}) => ({
  type: 'PRINT',
  template: 'viewing',
  timestamp: new Date('2026-04-23T10:00:00Z').toISOString(),
  ...overrides,
});

describe('auditSlice — basic reducers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts empty when localStorage has no prior log', () => {
    const store = makeStore();
    expect(store.getState().audit.logs).toEqual([]);
  });

  it('addAuditLog unshifts (newest first)', () => {
    const store = makeStore();
    store.dispatch(addAuditLog(sampleEntry({ template: 'A' })));
    store.dispatch(addAuditLog(sampleEntry({ template: 'B' })));
    const logs = store.getState().audit.logs;
    expect(logs[0].template).toBe('B');
    expect(logs[1].template).toBe('A');
  });

  it('caps the log at 100 entries (drops oldest)', () => {
    const store = makeStore();
    for (let i = 0; i < 105; i += 1) {
      store.dispatch(addAuditLog(sampleEntry({ template: `T-${i}` })));
    }
    const logs = store.getState().audit.logs;
    expect(logs).toHaveLength(100);
    // Newest is the most recent dispatch (T-104), oldest kept is T-5.
    expect(logs[0].template).toBe('T-104');
    expect(logs[99].template).toBe('T-5');
  });

  it('clearAuditLogs empties the slice', () => {
    const store = makeStore();
    store.dispatch(addAuditLog(sampleEntry()));
    store.dispatch(clearAuditLogs());
    expect(store.getState().audit.logs).toEqual([]);
  });

  it('restoreAuditLogs replaces the slice with the snapshot (and re-caps)', () => {
    const store = makeStore();
    store.dispatch(addAuditLog(sampleEntry({ template: 'current' })));
    const snapshot = Array.from({ length: 110 }, (_, i) => sampleEntry({ template: `S-${i}` }));
    store.dispatch(restoreAuditLogs(snapshot));
    const logs = store.getState().audit.logs;
    expect(logs).toHaveLength(100); // cap respected
    expect(logs[0].template).toBe('S-0');
  });

  it('restoreAuditLogs gracefully handles non-array payloads', () => {
    const store = makeStore();
    store.dispatch(addAuditLog(sampleEntry()));
    store.dispatch(restoreAuditLogs(null));
    expect(store.getState().audit.logs).toEqual([]);
  });
});

describe('auditSlice — localStorage persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('mirrors writes to localStorage on every add', () => {
    const store = makeStore();
    store.dispatch(addAuditLog(sampleEntry({ template: 'persisted' })));
    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed[0].template).toBe('persisted');
  });

  it('writes [] on clear', () => {
    const store = makeStore();
    store.dispatch(addAuditLog(sampleEntry()));
    store.dispatch(clearAuditLogs());
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toEqual([]);
  });

  it('hydrates from localStorage on store creation', async () => {
    // Seed BEFORE importing the slice fresh.
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([sampleEntry({ template: 'seeded-1' }), sampleEntry({ template: 'seeded-2' })]),
    );
    vi.resetModules();
    const fresh = await import('./auditSlice.js');
    const store = configureStore({ reducer: { audit: fresh.default } });
    expect(store.getState().audit.logs).toHaveLength(2);
    expect(store.getState().audit.logs[0].template).toBe('seeded-1');
  });

  it('survives corrupted JSON in localStorage (returns [] instead of throwing)', async () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    vi.resetModules();
    const fresh = await import('./auditSlice.js');
    const store = configureStore({ reducer: { audit: fresh.default } });
    expect(store.getState().audit.logs).toEqual([]);
  });

  it('silently drops persistence when localStorage.setItem throws (quota exceeded)', async () => {
    vi.resetModules();
    const fresh = await import('./auditSlice.js');
    const store = configureStore({ reducer: { audit: fresh.default } });

    // Simulate storage quota exceeded by replacing setItem with a throwing function.
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
    Object.defineProperty(window.localStorage, 'setItem', {
      configurable: true,
      writable: true,
      value: () => {
        throw new DOMException('QuotaExceededError');
      },
    });

    try {
      // Should not throw — error is silently swallowed inside persist().
      expect(() => {
        store.dispatch(
          fresh.addAuditLog({ type: 'PRINT', template: 'viewing', timestamp: new Date().toISOString() }),
        );
      }).not.toThrow();
    } finally {
      // Restore original setItem.
      Object.defineProperty(window.localStorage, 'setItem', {
        configurable: true,
        writable: true,
        value: originalSetItem,
      });
    }
  });
});
