import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  fetchArchiveFromBackend,
  loadArchiveEntries,
  persistArchiveEntries,
  persistRecordFile,
} from './archiveService';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('archiveService localStorage guards (T-45)', () => {
  it('loadArchiveEntries returns [] when localStorage API is incomplete', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {},
    });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(loadArchiveEntries()).toEqual([]);
    expect(errSpy).not.toHaveBeenCalled();
  });

  it('persistArchiveEntries no-ops when localStorage API is incomplete', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: { getItem: () => null },
    });
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => [] });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => persistArchiveEntries([{ id: 'x' }])).not.toThrow();
    expect(errSpy).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('loadArchiveEntries parses valid stored JSON', () => {
    window.localStorage.setItem('henry.archive.records.v1', JSON.stringify([{ id: 'a' }]));
    expect(loadArchiveEntries()).toEqual([{ id: 'a' }]);
  });

  it('loadArchiveEntries returns [] when stored JSON is not an array', () => {
    window.localStorage.setItem('henry.archive.records.v1', JSON.stringify({ entries: [{ id: 'a' }] }));
    expect(loadArchiveEntries()).toEqual([]);
  });

  it('loadArchiveEntries caps restored entries to 100', () => {
    const many = Array.from({ length: 105 }, (_, i) => ({ id: `e${i}` }));
    window.localStorage.setItem('henry.archive.records.v1', JSON.stringify(many));
    const restored = loadArchiveEntries();
    expect(restored).toHaveLength(100);
    expect(restored[0].id).toBe('e0');
    expect(restored[99].id).toBe('e99');
  });

  it('loadArchiveEntries returns [] and logs on invalid JSON', () => {
    window.localStorage.setItem('henry.archive.records.v1', '{bad-json');
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(loadArchiveEntries()).toEqual([]);
    expect(errSpy).toHaveBeenCalled();
  });

  it('persistArchiveEntries writes to storage when API is available', () => {
    persistArchiveEntries([{ id: 'ok' }]);
    expect(window.localStorage.getItem('henry.archive.records.v1')).toContain('ok');
  });
});

describe('archiveService backend API paths (T-46)', () => {
  it('persistArchiveEntries posts JSON payload with expected request shape', () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => [] });

    persistArchiveEntries([{ id: 'p1', unit: 'U-101' }]);

    expect(fetchSpy).toHaveBeenCalledWith('/api/records/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id: 'p1', unit: 'U-101' }]),
    });
  });

  it('persistArchiveEntries does not throw when fetch throws synchronously', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      throw new Error('fetch-not-available');
    });

    expect(() => persistArchiveEntries([{ id: 'p2' }])).not.toThrow();
  });

  it('persistArchiveEntries does not throw when fetch returns a rejected promise', () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('backend-down'));

    expect(() => persistArchiveEntries([{ id: 'p3' }])).not.toThrow();
  });

  it('persistArchiveEntries still attempts backend POST when localStorage.setItem throws', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => null,
        setItem: () => {
          throw new Error('quota-exceeded');
        },
      },
    });

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => [] });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => persistArchiveEntries([{ id: 'p4' }])).not.toThrow();
    expect(errSpy).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('persistArchiveEntries does not throw on circular payload serialization', () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => [] });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const entry = { id: 'circular' };
    entry.self = entry;

    expect(() => persistArchiveEntries([entry])).not.toThrow();
    expect(errSpy).toHaveBeenCalled();
    // JSON.stringify throws before request body is built, so fetch is skipped.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetchArchiveFromBackend returns parsed array when backend responds with array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => [{ id: 'one' }],
      })),
    );

    await expect(fetchArchiveFromBackend()).resolves.toEqual([{ id: 'one' }]);
  });

  it('fetchArchiveFromBackend returns null on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 500,
      })),
    );

    await expect(fetchArchiveFromBackend()).resolves.toBeNull();
  });

  it('fetchArchiveFromBackend returns null when backend payload is not an array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ entries: [] }),
      })),
    );

    await expect(fetchArchiveFromBackend()).resolves.toBeNull();
  });

  it('fetchArchiveFromBackend returns null when fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network-down');
      }),
    );

    await expect(fetchArchiveFromBackend()).resolves.toBeNull();
  });

  it('persistRecordFile returns missing-args when required values are absent', async () => {
    await expect(persistRecordFile({})).resolves.toEqual({ ok: false, reason: 'missing-args' });
  });

  it('persistRecordFile returns HTTP status when backend responds non-ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 413,
      })),
    );

    const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
    await expect(
      persistRecordFile({ recordPath: 'records/2026/April/U1', fileName: 'x.pdf', blob }),
    ).resolves.toEqual({ ok: false, reason: 'HTTP 413' });
  });

  it('persistRecordFile returns ok + path on successful upload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ path: '/records/2026/April/U1/x.pdf' }),
      })),
    );

    const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
    await expect(
      persistRecordFile({ recordPath: 'records/2026/April/U1', fileName: 'x.pdf', blob }),
    ).resolves.toEqual({ ok: true, path: '/records/2026/April/U1/x.pdf' });
  });

  it('persistRecordFile returns ok with null path when response JSON parse fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => {
          throw new Error('bad-json');
        },
      })),
    );

    const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
    await expect(
      persistRecordFile({ recordPath: 'records/2026/April/U1', fileName: 'x.pdf', blob }),
    ).resolves.toEqual({ ok: true, path: null });
  });

  it('persistRecordFile returns ok with null path when response path is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ ok: true }),
      })),
    );

    const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
    await expect(
      persistRecordFile({ recordPath: 'records/2026/April/U1', fileName: 'x.pdf', blob }),
    ).resolves.toEqual({ ok: true, path: null });
  });

  it('persistRecordFile returns ok with null path when response path is not a string', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ path: 12345 }),
      })),
    );

    const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
    await expect(
      persistRecordFile({ recordPath: 'records/2026/April/U1', fileName: 'x.pdf', blob }),
    ).resolves.toEqual({ ok: true, path: null });
  });

  it('persistRecordFile returns fetch error reason when upload throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('upload-failed');
      }),
    );

    const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
    await expect(
      persistRecordFile({ recordPath: 'records/2026/April/U1', fileName: 'x.pdf', blob }),
    ).resolves.toEqual({ ok: false, reason: 'upload-failed' });
  });
});
