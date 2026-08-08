import { clearCloudAuthToken, setCloudAuthToken } from './cloudPersistenceService';

const decodeTokenPayload = (token) => {
  try {
    const encoded = String(token || '').split('.')[1];
    if (!encoded) return {};
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch {
    return {};
  }
};

export const normalizeFirebaseUser = (response) => {
  const claims = decodeTokenPayload(response?.idToken);
  const role = ['operator', 'manager', 'admin'].includes(claims.role) ? claims.role : 'operator';
  return {
    id: response?.localId || claims.user_id || '',
    email: response?.email || claims.email || '',
    displayName: response?.displayName || claims.name || response?.email || 'Henry User',
    role,
    provider: 'firebase',
  };
};

export const signOutFirebaseSession = () => clearCloudAuthToken();

export const signInWithFirebasePassword = async ({ email, password, apiKey }) => {
  if (!apiKey) throw new Error('VITE_FIREBASE_API_KEY is required for Firebase Auth.');
  if (!email || !password) throw new Error('Email and password are required.');
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const data = await response.json();
  if (!response.ok) {
    clearCloudAuthToken();
    throw new Error(data?.error?.message || `Firebase Auth failed (HTTP ${response.status}).`);
  }
  setCloudAuthToken(data.idToken || '');
  return normalizeFirebaseUser(data);
};
