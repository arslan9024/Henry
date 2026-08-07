import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useGateStatus from './useGateStatus';

const LANDLORD_STEP = {
  key: 'landlord',
  required: ['landlord.name', 'landlord.phone', 'landlord.email'],
};

const TENANT_STEP = {
  key: 'tenant',
  required: ['tenant.fullName', 'tenant.contactNo', 'tenant.email'],
};

const CONTRACT_STEP = {
  key: 'contract',
  required: ['payments.contractStartDate', 'payments.contractEndDate', 'payments.annualRent'],
};

const baseDocument = {
  landlord: {
    name: 'Landlord Name',
    phone: '+971500000001',
    email: 'landlord@example.com',
  },
  tenant: {
    fullName: 'Tenant Name',
    contactNo: '+971500000002',
    email: 'tenant@example.com',
  },
  payments: {
    contractStartDate: '2026-08-20',
    contractEndDate: '2027-08-19',
    annualRent: 90000,
  },
};

beforeEach(() => {
  localStorage.clear();
});

describe('useGateStatus', () => {
  it('reports landlord and tenant gate blockers when uploads are missing', () => {
    const { result } = renderHook(() =>
      useGateStatus({
        documentData: baseDocument,
        steps: [LANDLORD_STEP, TENANT_STEP, CONTRACT_STEP],
      }),
    );

    expect(result.current.landlordGateStatus.ready).toBe(false);
    expect(result.current.landlordGateStatus.missing).toEqual([
      'landlord.titleDeedUpload',
      'landlord.emiratesIdUpload',
    ]);

    expect(result.current.tenantGateStatus.ready).toBe(false);
    expect(result.current.tenantGateStatus.missing).toEqual([
      'tenant.emiratesIdUpload',
      'tenant.passportUpload',
      'tenant.residencePermitUpload',
    ]);
  });

  it('marks landlord and tenant steps completed when uploads and required values exist', () => {
    localStorage.setItem(
      'henry.title-deed.references.v1',
      JSON.stringify([{ id: 'td1', parsed: { plotNo: '1234' } }]),
    );
    localStorage.setItem(
      'henry.emirates-id.references.v1',
      JSON.stringify([
        { id: 'eid-landlord', ownerTag: 'landlord', parsed: { idNumber: '784-1' } },
        { id: 'eid-tenant', ownerTag: 'tenant', parsed: { idNumber: '784-2' } },
      ]),
    );
    localStorage.setItem(
      'henry.tenant-document.references.v1',
      JSON.stringify([
        { id: 'passport-1', type: 'passport' },
        { id: 'permit-1', type: 'residence-permit' },
      ]),
    );

    const { result } = renderHook(() =>
      useGateStatus({
        documentData: baseDocument,
        steps: [LANDLORD_STEP, TENANT_STEP, CONTRACT_STEP],
      }),
    );

    expect(result.current.landlordGateStatus.ready).toBe(true);
    expect(result.current.tenantGateStatus.ready).toBe(true);
    expect(result.current.completionMap.landlord.completed).toBe(true);
    expect(result.current.completionMap.tenant.completed).toBe(true);
    expect(result.current.completionMap.contract.completed).toBe(true);
  });

  it('returns step-specific blocker copy', () => {
    const incompleteDocument = {
      ...baseDocument,
      landlord: {
        ...baseDocument.landlord,
        email: '',
      },
    };

    const { result } = renderHook(() =>
      useGateStatus({
        documentData: incompleteDocument,
        steps: [LANDLORD_STEP, TENANT_STEP],
      }),
    );

    const copy = result.current.getStepBlockCopy('landlord');
    expect(copy.title).toBe('Step 1 blocked — landlord mandatory requirements');
    expect(copy.body).toContain('landlord.email');
  });
});
