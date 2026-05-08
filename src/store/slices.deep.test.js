/**
 * slices.deep.test.js
 *
 * Deeper coverage for four thin slice test files:
 *   - sidebarSlice  (guidance structure, multiple refreshes, timestamp edge cases)
 *   - archiveSlice  (boundary caps, persistence contracts, field preservation)
 *   - henrySlice    (all valid status strings, identity immutability, sync combos)
 *   - ocrSlice      (chain operations, null safety, idempotent clears)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';

// ── mock archiveService before any slice imports ──────────────────────────────
vi.mock('../records/archiveService', () => ({
  loadArchiveEntries: vi.fn(() => []),
  persistArchiveEntries: vi.fn(),
  persistRecordFile: vi.fn().mockResolvedValue({ ok: true, path: '/records/test' }),
}));

import sidebarReducer, { refreshSidebarTimestamp } from './sidebarSlice';
import archiveReducer, { addArchiveEntry, clearArchiveEntries } from './archiveSlice';
import { persistArchiveEntries } from '../records/archiveService';
import henryReducer, { setHenryStatus, syncHenryFromCRM } from './henrySlice';
import ocrReducer, { setOcrProcessing, setOcrDraft, clearOcrDraft, approveOcrDraft } from './ocrSlice';

// ═══════════════════════════════════════════════════════════════════════════════
// SIDEBAR SLICE — DEEP
// ═══════════════════════════════════════════════════════════════════════════════

describe('sidebarSlice — guidance data shape', () => {
  it('guidance is a plain object (not array, not null)', () => {
    const state = sidebarReducer(undefined, { type: '@@INIT' });
    expect(typeof state.guidance).toBe('object');
    expect(state.guidance).not.toBeNull();
    expect(Array.isArray(state.guidance)).toBe(false);
  });

  it('guidance has a "common" key', () => {
    const { guidance } = sidebarReducer(undefined, { type: '@@INIT' });
    expect(guidance).toHaveProperty('common');
  });

  it('guidance.common has highlights (array)', () => {
    const { guidance } = sidebarReducer(undefined, { type: '@@INIT' });
    expect(Array.isArray(guidance.common.highlights)).toBe(true);
    expect(guidance.common.highlights.length).toBeGreaterThan(0);
  });

  it('guidance.common has articles (array)', () => {
    const { guidance } = sidebarReducer(undefined, { type: '@@INIT' });
    expect(Array.isArray(guidance.common.articles)).toBe(true);
    expect(guidance.common.articles.length).toBeGreaterThan(0);
  });

  it('guidance.common.articles each have title and text', () => {
    const { guidance } = sidebarReducer(undefined, { type: '@@INIT' });
    for (const article of guidance.common.articles) {
      expect(typeof article.title).toBe('string');
      expect(article.title.length).toBeGreaterThan(0);
      expect(typeof article.text).toBe('string');
      expect(article.text.length).toBeGreaterThan(0);
    }
  });

  it('guidance has a "byTemplate" key', () => {
    const { guidance } = sidebarReducer(undefined, { type: '@@INIT' });
    expect(guidance).toHaveProperty('byTemplate');
  });

  it('guidance.byTemplate has a "viewing" entry', () => {
    const { guidance } = sidebarReducer(undefined, { type: '@@INIT' });
    expect(guidance.byTemplate).toHaveProperty('viewing');
  });

  it('each byTemplate entry has highlights (array)', () => {
    const { guidance } = sidebarReducer(undefined, { type: '@@INIT' });
    for (const [, entry] of Object.entries(guidance.byTemplate)) {
      expect(Array.isArray(entry.highlights)).toBe(true);
    }
  });
});

describe('sidebarSlice — refreshSidebarTimestamp edge cases', () => {
  it('accepts any valid YYYY-MM-DD string', () => {
    const state = sidebarReducer(undefined, refreshSidebarTimestamp('2030-12-31'));
    expect(state.lastUpdated).toBe('2030-12-31');
  });

  it('second refresh overwrites the first', () => {
    let state = sidebarReducer(undefined, refreshSidebarTimestamp('2026-01-01'));
    state = sidebarReducer(state, refreshSidebarTimestamp('2026-06-15'));
    expect(state.lastUpdated).toBe('2026-06-15');
  });

  it('guidance is unchanged after a timestamp refresh', () => {
    const base = sidebarReducer(undefined, { type: '@@INIT' });
    const after = sidebarReducer(base, refreshSidebarTimestamp('2027-01-01'));
    expect(after.guidance).toBe(base.guidance); // same reference — immutable
  });

  it('empty string payload defaults to today', () => {
    const state = sidebarReducer(undefined, refreshSidebarTimestamp(''));
    // The reducer uses `action.payload || new Date()...slice(0,10)`
    // Empty string is falsy, so it falls back to today.
    expect(state.lastUpdated).toBe(new Date().toISOString().slice(0, 10));
  });

  it('null payload defaults to today', () => {
    const state = sidebarReducer(undefined, refreshSidebarTimestamp(null));
    expect(state.lastUpdated).toBe(new Date().toISOString().slice(0, 10));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ARCHIVE SLICE — DEEP
// ═══════════════════════════════════════════════════════════════════════════════

describe('archiveSlice — boundary cap enforcement', () => {
  beforeEach(() => vi.clearAllMocks());

  it('99 entries: no truncation', () => {
    let state = { entries: [] };
    for (let i = 0; i < 99; i++) state = archiveReducer(state, addArchiveEntry({ id: `e${i}` }));
    expect(state.entries).toHaveLength(99);
    expect(state.entries[0].id).toBe('e98');
    expect(state.entries[98].id).toBe('e0');
  });

  it('exactly 100 entries: no truncation', () => {
    let state = { entries: [] };
    for (let i = 0; i < 100; i++) state = archiveReducer(state, addArchiveEntry({ id: `e${i}` }));
    expect(state.entries).toHaveLength(100);
  });

  it('101st entry triggers truncation to exactly 100', () => {
    let state = { entries: [] };
    for (let i = 0; i < 101; i++) state = archiveReducer(state, addArchiveEntry({ id: `e${i}` }));
    expect(state.entries).toHaveLength(100);
    expect(state.entries[0].id).toBe('e100'); // newest at top
    expect(state.entries.find((e) => e.id === 'e0')).toBeUndefined(); // oldest dropped
  });
});

describe('archiveSlice — entry field preservation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('preserves all fields in an entry payload', () => {
    const entry = {
      id: 'rec-001',
      templateKey: 'booking',
      unit: 'A-101',
      tenantName: 'Ahmed Al Mansouri',
      savedAt: '2026-04-23T10:00:00Z',
    };
    const state = archiveReducer({ entries: [] }, addArchiveEntry(entry));
    expect(state.entries[0]).toEqual(entry);
  });

  it('multiple entries preserve insertion order (newest first)', () => {
    let state = { entries: [] };
    state = archiveReducer(state, addArchiveEntry({ id: 'first' }));
    state = archiveReducer(state, addArchiveEntry({ id: 'second' }));
    state = archiveReducer(state, addArchiveEntry({ id: 'third' }));
    expect(state.entries.map((e) => e.id)).toEqual(['third', 'second', 'first']);
  });
});

/** Helper: Redux store with listener middleware (mirrors production store) */
const makeArchiveStore = () => {
  const lm = createListenerMiddleware();
  lm.startListening({
    actionCreator: addArchiveEntry,
    effect: (_, api) => persistArchiveEntries(api.getState().archive.entries),
  });
  lm.startListening({
    actionCreator: clearArchiveEntries,
    effect: (_, api) => persistArchiveEntries(api.getState().archive.entries),
  });
  return configureStore({
    reducer: { archive: archiveReducer },
    middleware: (gd) => gd().prepend(lm.middleware),
  });
};

describe('archiveSlice — persistence contracts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('persistArchiveEntries called once per addArchiveEntry dispatch', () => {
    const store = makeArchiveStore();
    store.dispatch(addArchiveEntry({ id: 'a' }));
    expect(persistArchiveEntries).toHaveBeenCalledTimes(1);
    store.dispatch(addArchiveEntry({ id: 'b' }));
    expect(persistArchiveEntries).toHaveBeenCalledTimes(2);
  });

  it('persistArchiveEntries called with the updated entries array after add', () => {
    const store = makeArchiveStore();
    store.dispatch(addArchiveEntry({ id: 'x' }));
    expect(persistArchiveEntries).toHaveBeenLastCalledWith([{ id: 'x' }]);
  });

  it('clearArchiveEntries calls persistArchiveEntries with empty array', () => {
    const store = makeArchiveStore();
    store.dispatch(addArchiveEntry({ id: 'x' }));
    vi.clearAllMocks();
    store.dispatch(clearArchiveEntries());
    expect(persistArchiveEntries).toHaveBeenCalledTimes(1);
    expect(persistArchiveEntries).toHaveBeenCalledWith([]);
  });

  it('clearArchiveEntries on already-empty state persists empty array', () => {
    const store = makeArchiveStore();
    store.dispatch(clearArchiveEntries());
    expect(store.getState().archive.entries).toEqual([]);
    expect(persistArchiveEntries).toHaveBeenCalledWith([]);
  });

  it('clearArchiveEntries then add starts fresh', () => {
    let state = { entries: [] };
    state = archiveReducer(state, addArchiveEntry({ id: 'old' }));
    state = archiveReducer(state, clearArchiveEntries());
    state = archiveReducer(state, addArchiveEntry({ id: 'new' }));
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].id).toBe('new');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HENRY SLICE — DEEP
// ═══════════════════════════════════════════════════════════════════════════════

describe('henrySlice — all valid operational status strings', () => {
  const validStatuses = [
    'Ready to file',
    'Filing in progress',
    'Reviewing compliance',
    'Awaiting input',
    'Offline for maintenance',
  ];

  it.each(validStatuses)('setHenryStatus accepts "%s"', (status) => {
    const state = henryReducer(undefined, setHenryStatus(status));
    expect(state.status).toBe(status);
  });
});

describe('henrySlice — identity fields are read-only (not mutated by setHenryStatus)', () => {
  it('aiId remains WC-AI-003 after status change', () => {
    const state = henryReducer(undefined, setHenryStatus('Filing in progress'));
    expect(state.aiId).toBe('WC-AI-003');
  });

  it('name remains Henry after status change', () => {
    const state = henryReducer(undefined, setHenryStatus('Awaiting input'));
    expect(state.name).toBe('Henry');
  });

  it('title remains The Record Keeper after status change', () => {
    const state = henryReducer(undefined, setHenryStatus('Reviewing compliance'));
    expect(state.title).toBe('The Record Keeper');
  });

  it('module remains Henry after status change', () => {
    const state = henryReducer(undefined, setHenryStatus('Offline for maintenance'));
    expect(state.module).toBe('Henry');
  });
});

describe('henrySlice — syncHenryFromCRM partial update scenarios', () => {
  it('syncs only status (lastSyncedAt unchanged)', () => {
    const seeded = henryReducer(
      undefined,
      syncHenryFromCRM({
        status: 'Filing in progress',
        lastSyncedAt: '2026-03-01T09:00:00Z',
      }),
    );
    const updated = henryReducer(seeded, syncHenryFromCRM({ status: 'Awaiting input' }));
    expect(updated.status).toBe('Awaiting input');
    expect(updated.lastSyncedAt).toBe('2026-03-01T09:00:00Z'); // unchanged
  });

  it('syncs only lastSyncedAt (status unchanged)', () => {
    const seeded = henryReducer(
      undefined,
      syncHenryFromCRM({
        status: 'Filing in progress',
        lastSyncedAt: '2026-03-01T09:00:00Z',
      }),
    );
    const updated = henryReducer(seeded, syncHenryFromCRM({ lastSyncedAt: '2026-04-23T10:00:00Z' }));
    expect(updated.status).toBe('Filing in progress'); // unchanged
    expect(updated.lastSyncedAt).toBe('2026-04-23T10:00:00Z');
  });

  it('syncs both status and lastSyncedAt in one call', () => {
    const state = henryReducer(
      undefined,
      syncHenryFromCRM({
        status: 'Reviewing compliance',
        lastSyncedAt: '2026-05-08T12:00:00Z',
      }),
    );
    expect(state.status).toBe('Reviewing compliance');
    expect(state.lastSyncedAt).toBe('2026-05-08T12:00:00Z');
  });

  it('undefined payload is a complete no-op', () => {
    const state = henryReducer(undefined, syncHenryFromCRM(undefined));
    expect(state.status).toBe('Ready to file');
    expect(state.lastSyncedAt).toBeNull();
  });

  it('sequentially applying syncs maintains latest values', () => {
    let state = henryReducer(undefined, { type: '@@INIT' });
    state = henryReducer(
      state,
      syncHenryFromCRM({ status: 'Filing in progress', lastSyncedAt: '2026-01-01T00:00:00Z' }),
    );
    state = henryReducer(state, syncHenryFromCRM({ status: 'Reviewing compliance' }));
    state = henryReducer(state, syncHenryFromCRM({ lastSyncedAt: '2026-05-08T12:00:00Z' }));
    expect(state.status).toBe('Reviewing compliance');
    expect(state.lastSyncedAt).toBe('2026-05-08T12:00:00Z');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// OCR SLICE — DEEP
// ═══════════════════════════════════════════════════════════════════════════════

describe('ocrSlice — setOcrProcessing edge cases', () => {
  it('setOcrProcessing(true) twice keeps processing true', () => {
    let state = ocrReducer(undefined, setOcrProcessing(true));
    state = ocrReducer(state, setOcrProcessing(true));
    expect(state.processing).toBe(true);
  });

  it('setOcrProcessing(false) twice keeps processing false', () => {
    let state = ocrReducer(undefined, setOcrProcessing(true));
    state = ocrReducer(state, setOcrProcessing(false));
    state = ocrReducer(state, setOcrProcessing(false));
    expect(state.processing).toBe(false);
  });

  it('setOcrProcessing does NOT affect draft', () => {
    let state = ocrReducer(undefined, setOcrDraft({ field: 'val' }));
    state = ocrReducer(state, setOcrProcessing(true));
    expect(state.draft).toEqual({ field: 'val' });
  });
});

describe('ocrSlice — setOcrDraft with rich payloads', () => {
  it('stores a complex nested payload', () => {
    const draft = {
      tenant: { fullName: 'Ahmed', emiratesId: '784-1990-1234567-1' },
      _meta: { source: 'emirates-id-scan', confidence: 0.97, scannedAt: '2026-04-23T10:00:00Z' },
    };
    const state = ocrReducer(undefined, setOcrDraft(draft));
    expect(state.draft).toEqual(draft);
  });

  it('second setOcrDraft replaces the first draft entirely', () => {
    let state = ocrReducer(undefined, setOcrDraft({ x: 1 }));
    state = ocrReducer(state, setOcrDraft({ y: 2 }));
    expect(state.draft).toEqual({ y: 2 });
    expect(state.draft).not.toHaveProperty('x');
  });
});

describe('ocrSlice — clearOcrDraft edge cases', () => {
  it('clearOcrDraft when processing was already false keeps it false', () => {
    const state = ocrReducer(undefined, clearOcrDraft());
    expect(state.processing).toBe(false);
  });

  it('clearOcrDraft does NOT affect lastApproved', () => {
    let state = ocrReducer(undefined, approveOcrDraft({ fullName: 'Jane' }));
    state = ocrReducer(state, setOcrDraft({ fullName: 'Bob' }));
    state = ocrReducer(state, clearOcrDraft());
    expect(state.lastApproved).toEqual({ fullName: 'Jane' });
  });

  it('double clearOcrDraft is idempotent', () => {
    let state = ocrReducer(undefined, setOcrDraft({ x: 1 }));
    state = ocrReducer(state, clearOcrDraft());
    state = ocrReducer(state, clearOcrDraft());
    expect(state.draft).toBeNull();
    expect(state.processing).toBe(false);
  });
});

describe('ocrSlice — approveOcrDraft chain operations', () => {
  it('second approve replaces previous lastApproved', () => {
    let state = ocrReducer(undefined, approveOcrDraft({ fullName: 'Jane' }));
    state = ocrReducer(state, approveOcrDraft({ fullName: 'Bob' }));
    expect(state.lastApproved).toEqual({ fullName: 'Bob' });
  });

  it('approve clears the draft that was set by setOcrDraft', () => {
    let state = ocrReducer(undefined, setOcrDraft({ fullName: 'Jane' }));
    state = ocrReducer(state, approveOcrDraft({ fullName: 'Jane' }));
    expect(state.draft).toBeNull();
    expect(state.lastApproved).toEqual({ fullName: 'Jane' });
  });

  it('full OCR workflow: processing → draft → approve → processing → draft → approve', () => {
    let state = ocrReducer(undefined, { type: '@@INIT' });
    // First scan
    state = ocrReducer(state, setOcrProcessing(true));
    state = ocrReducer(state, setOcrDraft({ fullName: 'Ahmed' }));
    state = ocrReducer(state, approveOcrDraft({ fullName: 'Ahmed' }));
    expect(state.lastApproved).toEqual({ fullName: 'Ahmed' });
    // Second scan
    state = ocrReducer(state, setOcrProcessing(true));
    state = ocrReducer(state, setOcrDraft({ fullName: 'Sara' }));
    state = ocrReducer(state, approveOcrDraft({ fullName: 'Sara' }));
    expect(state.lastApproved).toEqual({ fullName: 'Sara' });
    expect(state.draft).toBeNull();
    expect(state.processing).toBe(false);
  });
});
