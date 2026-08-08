import { describe, expect, it } from 'vitest';
import { evaluateDeploymentReadiness } from './deploymentReadinessService';

describe('evaluateDeploymentReadiness', () => {
  it('accepts local fallback with an infrastructure warning', () => {
    const result = evaluateDeploymentReadiness({ VITE_HENRY_STORAGE_PROVIDER: 'local' });
    expect(result.ready).toBe(true);
    expect(result.warnings.join(' ')).toMatch(/reverse proxy/i);
  });

  it('reports every missing Firebase setting', () => {
    const result = evaluateDeploymentReadiness({ VITE_HENRY_STORAGE_PROVIDER: 'firebase' });
    expect(result.ready).toBe(false);
    expect(result.errors).toHaveLength(4);
    expect(result.errors.join(' ')).toMatch(/VITE_FIREBASE_STORAGE_BUCKET/);
  });

  it('accepts a complete Firebase public configuration', () => {
    const result = evaluateDeploymentReadiness({
      VITE_HENRY_STORAGE_PROVIDER: 'firebase',
      VITE_FIREBASE_API_KEY: 'public-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'henry.example.test',
      VITE_FIREBASE_PROJECT_ID: 'henry-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'henry-project.appspot.com',
    });
    expect(result.ready).toBe(true);
    expect(result.checks.filter((check) => check.status === 'pass')).toHaveLength(6);
  });

  it('blocks forbidden build-time tokens and unknown providers', () => {
    const result = evaluateDeploymentReadiness({
      VITE_HENRY_STORAGE_PROVIDER: 'custom-cloud',
      VITE_FIREBASE_STORAGE_TOKEN: 'must-not-be-bundled',
    });
    expect(result.ready).toBe(false);
    expect(result.errors.join(' ')).toMatch(/unsupported storage provider/i);
    expect(result.errors.join(' ')).toMatch(/forbidden/i);
  });
});
