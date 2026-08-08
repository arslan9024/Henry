import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeFirebaseUser, signInWithFirebasePassword } from './firebaseAuthService';

const tokenFor = (claims) => {
  const encoded = btoa(JSON.stringify(claims)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${encoded}.signature`;
};

describe('firebaseAuthService', () => {
  afterEach(() => vi.restoreAllMocks());

  it('normalizes custom role claims and defaults unknown roles to operator', () => {
    const manager = normalizeFirebaseUser({
      localId: '1',
      email: 'm@h.test',
      idToken: tokenFor({ role: 'manager' }),
    });
    expect(manager.role).toBe('manager');
    expect(manager).not.toHaveProperty('idToken');
    expect(normalizeFirebaseUser({ localId: '2', idToken: tokenFor({ role: 'owner' }) }).role).toBe(
      'operator',
    );
  });

  it('signs in through Firebase Identity Toolkit without storing credentials', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ localId: '1', email: 'a@b.test', idToken: tokenFor({ role: 'admin' }) }),
    });
    const user = await signInWithFirebasePassword({
      email: 'a@b.test',
      password: 'runtime-secret',
      apiKey: 'public-api-key',
    });
    expect(user.role).toBe('admin');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('identitytoolkit.googleapis.com'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
