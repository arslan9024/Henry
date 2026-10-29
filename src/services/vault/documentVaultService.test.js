import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveDocumentToVault,
  listVaultDocuments,
  getVaultDocument,
  deleteVaultDocument,
  searchVaultDocuments,
} from './documentVaultService';

describe('documentVaultService (IndexedDB)', () => {
  it('handles fallback gracefully when indexedDB is not available or in node environment', async () => {
    const doc = {
      title: 'Marina Gate Unit 1402 Tenancy Contract',
      documentType: 'tenancy-contract',
      tenantName: 'John Doe',
      propertyNo: '1402',
      buildingName: 'Marina Gate 1',
    };
    // Should resolve without unhandled exceptions
    const res = await saveDocumentToVault(doc);
    expect(res === null || typeof res === 'object').toBe(true);

    const list = await listVaultDocuments();
    expect(Array.isArray(list)).toBe(true);

    const searched = await searchVaultDocuments('Marina');
    expect(Array.isArray(searched)).toBe(true);
  });
});
