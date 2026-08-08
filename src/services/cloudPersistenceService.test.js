import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCloudAuthToken, createPersistenceAdapter, setCloudAuthToken } from './cloudPersistenceService';

describe('cloudPersistenceService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearCloudAuthToken();
  });

  it('uses the local records API by default', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => ({ ok: true, path: '/records/a.pdf' }) });
    const result = await createPersistenceAdapter({ provider: 'local' }).persist({
      path: 'cases/a.pdf',
      blob: new Blob(['a']),
    });
    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith('/api/records/file', expect.objectContaining({ method: 'POST' }));
  });

  it('requires Firebase runtime configuration and sends authenticated uploads', async () => {
    await expect(
      createPersistenceAdapter({ provider: 'firebase' }).persist({ path: 'a.pdf', blob: new Blob(['a']) }),
    ).rejects.toThrow(/requires/i);
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => ({ name: 'a.pdf' }) });
    const result = await createPersistenceAdapter({
      provider: 'firebase',
      firebaseBucket: 'bucket',
      authToken: 'token',
    }).persist({ path: 'cases/a.pdf', blob: new Blob(['a'], { type: 'application/pdf' }) });
    expect(result.path).toBe('firebase://bucket/cases/a.pdf');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('firebasestorage.googleapis.com'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token' }) }),
    );
  });

  it('uses only a short-lived runtime session token when no token is passed to the adapter', async () => {
    setCloudAuthToken('session-token');
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => ({ name: 'a.pdf' }) });
    await createPersistenceAdapter({ provider: 'firebase', firebaseBucket: 'bucket' }).persist({
      path: 'cases/a.pdf',
      blob: new Blob(['a']),
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer session-token' }),
      }),
    );
  });
});
