const FIREBASE_REQUIREMENTS = [
  ['VITE_FIREBASE_API_KEY', 'Firebase web API key'],
  ['VITE_FIREBASE_AUTH_DOMAIN', 'Firebase authorized auth domain'],
  ['VITE_FIREBASE_PROJECT_ID', 'Firebase project ID'],
  ['VITE_FIREBASE_STORAGE_BUCKET', 'Firebase Storage bucket'],
];

const present = (value) => typeof value === 'string' && value.trim().length > 0;

export const evaluateDeploymentReadiness = (env = {}) => {
  const provider = String(env.VITE_HENRY_STORAGE_PROVIDER || 'local')
    .trim()
    .toLowerCase();
  const checks = [];
  const errors = [];
  const warnings = [];

  if (!['local', 'firebase'].includes(provider)) {
    errors.push(`Unsupported storage provider: ${provider || '(empty)'}. Use local or firebase.`);
  } else {
    checks.push({ key: 'storage-provider', label: `Storage provider: ${provider}`, status: 'pass' });
  }

  if (present(env.VITE_FIREBASE_STORAGE_TOKEN)) {
    errors.push('VITE_FIREBASE_STORAGE_TOKEN is forbidden because Vite embeds it in the client bundle.');
  } else {
    checks.push({ key: 'no-build-token', label: 'No build-time Firebase bearer token', status: 'pass' });
  }

  if (provider === 'firebase') {
    FIREBASE_REQUIREMENTS.forEach(([key, label]) => {
      if (present(env[key])) checks.push({ key, label, status: 'pass' });
      else {
        checks.push({ key, label, status: 'fail' });
        errors.push(`${key} is required for Firebase deployment.`);
      }
    });
    warnings.push('Firebase rules, custom claims, and authorized domains require staging verification.');
  }

  if (provider === 'local') {
    warnings.push('Local records mode must run behind TLS and an authenticated reverse proxy in production.');
  }

  return {
    provider,
    ready: errors.length === 0,
    checks,
    errors,
    warnings,
  };
};
