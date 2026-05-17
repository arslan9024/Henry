/**
 * templateSchemas.test.js
 * Tests for the three per-template validation schemas:
 *   addendumFormSchema, viewingFormSchema, tenancyFormSchema
 *
 * Pattern: test required fields → required errors; test valid values → null;
 * test format rules (email, phone, number, min, minLen) pass and fail cases.
 */
import { describe, it, expect } from 'vitest';
import { addendumFormSchema } from './addendumFormSchema';
import { viewingFormSchema } from './viewingFormSchema';
import { tenancyFormSchema } from './tenancyFormSchema';

// ── addendumFormSchema ────────────────────────────────────────────────────────

describe('addendumFormSchema', () => {
  // Required fields
  it('rejects empty addendum.originalContractRef', () => {
    const err = addendumFormSchema.validateField('addendum.originalContractRef', '');
    expect(err).toBeTruthy();
    expect(err).toContain('required');
  });

  it('accepts non-empty addendum.originalContractRef', () => {
    expect(addendumFormSchema.validateField('addendum.originalContractRef', 'REF-001')).toBeNull();
  });

  it('rejects empty addendum.effectiveDate', () => {
    const err = addendumFormSchema.validateField('addendum.effectiveDate', '');
    expect(err).toBeTruthy();
  });

  it('accepts non-empty addendum.effectiveDate', () => {
    expect(addendumFormSchema.validateField('addendum.effectiveDate', '2026-05-01')).toBeNull();
  });

  it('rejects empty tenant.fullName (required)', () => {
    const err = addendumFormSchema.validateField('tenant.fullName', '');
    expect(err).toBeTruthy();
  });

  it('rejects tenant.fullName shorter than 2 chars', () => {
    const err = addendumFormSchema.validateField('tenant.fullName', 'A');
    expect(err).toBeTruthy();
    expect(err).toContain('2');
  });

  it('accepts tenant.fullName of 2+ chars', () => {
    expect(addendumFormSchema.validateField('tenant.fullName', 'Al')).toBeNull();
  });

  it('rejects empty landlord.name', () => {
    const err = addendumFormSchema.validateField('landlord.name', '');
    expect(err).toBeTruthy();
  });

  it('accepts non-empty landlord.name', () => {
    expect(addendumFormSchema.validateField('landlord.name', 'White Caves LLC')).toBeNull();
  });

  it('validate() returns isValid=false when all fields empty', () => {
    const { isValid, errors } = addendumFormSchema.validate({});
    expect(isValid).toBe(false);
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(4);
  });

  it('validate() returns isValid=true when all required fields present', () => {
    const { isValid } = addendumFormSchema.validate({
      'addendum.originalContractRef': 'REF-2026-001',
      'addendum.effectiveDate': '2026-05-01',
      'tenant.fullName': 'Ahmed Al Mansouri',
      'landlord.name': 'White Caves Real Estate LLC',
    });
    expect(isValid).toBe(true);
  });

  it('returns null for unknown field names', () => {
    expect(addendumFormSchema.validateField('unknown.field', '')).toBeNull();
  });
});

// ── viewingFormSchema ─────────────────────────────────────────────────────────

describe('viewingFormSchema', () => {
  // Required fields
  it('rejects empty broker.companyName', () => {
    expect(viewingFormSchema.validateField('broker.companyName', '')).toBeTruthy();
  });

  it('accepts non-empty broker.companyName', () => {
    expect(viewingFormSchema.validateField('broker.companyName', 'White Caves RE')).toBeNull();
  });

  it('rejects empty broker.brokerName', () => {
    expect(viewingFormSchema.validateField('broker.brokerName', '')).toBeTruthy();
  });

  it('accepts non-empty broker.brokerName', () => {
    expect(viewingFormSchema.validateField('broker.brokerName', 'Ali Hassan')).toBeNull();
  });

  // Email rule
  it('rejects invalid broker.email', () => {
    const err = viewingFormSchema.validateField('broker.email', 'not-an-email');
    expect(err).toBeTruthy();
    expect(err).toContain('email');
  });

  it('accepts valid broker.email', () => {
    expect(viewingFormSchema.validateField('broker.email', 'ali@whitecaves.ae')).toBeNull();
  });

  it('passes empty broker.email (optional field — email rule skips empty)', () => {
    expect(viewingFormSchema.validateField('broker.email', '')).toBeNull();
  });

  // tenant fields
  it('rejects empty tenant.fullName', () => {
    expect(viewingFormSchema.validateField('tenant.fullName', '')).toBeTruthy();
  });

  it('rejects tenant.fullName with 1 char', () => {
    expect(viewingFormSchema.validateField('tenant.fullName', 'X')).toBeTruthy();
  });

  it('accepts tenant.fullName of 2+ chars', () => {
    expect(viewingFormSchema.validateField('tenant.fullName', 'Sara')).toBeNull();
  });

  // Phone rule
  it('rejects tenant.contactNo with fewer than 7 digits', () => {
    const err = viewingFormSchema.validateField('tenant.contactNo', '123');
    expect(err).toBeTruthy();
    expect(err).toContain('phone');
  });

  it('accepts valid UAE phone for tenant.contactNo', () => {
    expect(viewingFormSchema.validateField('tenant.contactNo', '+971501234567')).toBeNull();
  });

  // Property required
  it('rejects empty property.unit', () => {
    expect(viewingFormSchema.validateField('property.unit', '')).toBeTruthy();
  });

  it('accepts non-empty property.unit', () => {
    expect(viewingFormSchema.validateField('property.unit', '101A')).toBeNull();
  });

  it('rejects empty property.community', () => {
    expect(viewingFormSchema.validateField('property.community', '')).toBeTruthy();
  });

  // number + min(0) for parkingCount
  it('rejects negative property.parkingCount', () => {
    const err = viewingFormSchema.validateField('property.parkingCount', -1);
    expect(err).toBeTruthy();
  });

  it('accepts zero property.parkingCount', () => {
    expect(viewingFormSchema.validateField('property.parkingCount', 0)).toBeNull();
  });

  it('accepts positive property.parkingCount', () => {
    expect(viewingFormSchema.validateField('property.parkingCount', 2)).toBeNull();
  });

  it('rejects non-numeric property.parkingCount', () => {
    const err = viewingFormSchema.validateField('property.parkingCount', 'two');
    expect(err).toBeTruthy();
  });

  // Viewing schedule required
  it('rejects empty viewing.viewingDate', () => {
    expect(viewingFormSchema.validateField('viewing.viewingDate', '')).toBeTruthy();
  });

  it('accepts non-empty viewing.viewingDate', () => {
    expect(viewingFormSchema.validateField('viewing.viewingDate', '2026-05-10')).toBeNull();
  });

  it('rejects empty viewing.viewingTime', () => {
    expect(viewingFormSchema.validateField('viewing.viewingTime', '')).toBeTruthy();
  });

  // Full validate
  it('validate() flags all empty required fields', () => {
    const { isValid } = viewingFormSchema.validate({});
    expect(isValid).toBe(false);
  });

  it('validate() passes when all required fields provided', () => {
    const { isValid } = viewingFormSchema.validate({
      'broker.companyName': 'White Caves RE',
      'broker.brokerName': 'Ali Hassan',
      'tenant.fullName': 'Sara Mohammed',
      'property.unit': '101A',
      'property.community': 'Downtown Dubai',
      'viewing.viewingDate': '2026-05-10',
      'viewing.viewingTime': '10:00 AM',
    });
    expect(isValid).toBe(true);
  });
});

// ── tenancyFormSchema ─────────────────────────────────────────────────────────

describe('tenancyFormSchema', () => {
  // Required
  it('rejects empty property.unit', () => {
    expect(tenancyFormSchema.validateField('property.unit', '')).toBeTruthy();
  });

  it('accepts non-empty property.unit', () => {
    expect(tenancyFormSchema.validateField('property.unit', '201B')).toBeNull();
  });

  it('rejects empty property.community', () => {
    expect(tenancyFormSchema.validateField('property.community', '')).toBeTruthy();
  });

  it('rejects empty tenant.fullName', () => {
    expect(tenancyFormSchema.validateField('tenant.fullName', '')).toBeTruthy();
  });

  it('rejects tenant.fullName shorter than 2 chars', () => {
    expect(tenancyFormSchema.validateField('tenant.fullName', 'A')).toBeTruthy();
  });

  it('accepts tenant.fullName of 2+ chars', () => {
    expect(tenancyFormSchema.validateField('tenant.fullName', 'Ahmed')).toBeNull();
  });

  // minLen on emiratesId (optional but validated when present)
  it('passes empty tenant.emiratesId (optional)', () => {
    expect(tenancyFormSchema.validateField('tenant.emiratesId', '')).toBeNull();
  });

  it('rejects tenant.emiratesId shorter than 15 chars when provided', () => {
    const err = tenancyFormSchema.validateField('tenant.emiratesId', '78419901234');
    expect(err).toBeTruthy();
  });

  it('accepts tenant.emiratesId of 15 chars', () => {
    expect(tenancyFormSchema.validateField('tenant.emiratesId', '784199012345678')).toBeNull();
  });

  it('rejects empty landlord.name', () => {
    expect(tenancyFormSchema.validateField('landlord.name', '')).toBeTruthy();
  });

  // Financial terms — number + min
  it('rejects non-numeric payments.annualRent', () => {
    const err = tenancyFormSchema.validateField('payments.annualRent', 'abc');
    expect(err).toBeTruthy();
  });

  it('rejects payments.annualRent of 0 (min=1)', () => {
    const err = tenancyFormSchema.validateField('payments.annualRent', 0);
    expect(err).toBeTruthy();
    expect(err).toContain('zero');
  });

  it('accepts positive payments.annualRent', () => {
    expect(tenancyFormSchema.validateField('payments.annualRent', 60000)).toBeNull();
  });

  it('passes empty payments.annualRent (number rule skips empty)', () => {
    expect(tenancyFormSchema.validateField('payments.annualRent', '')).toBeNull();
  });

  it('rejects negative payments.securityDeposit (min=0)', () => {
    const err = tenancyFormSchema.validateField('payments.securityDeposit', -1);
    expect(err).toBeTruthy();
  });

  it('accepts zero payments.securityDeposit', () => {
    expect(tenancyFormSchema.validateField('payments.securityDeposit', 0)).toBeNull();
  });

  // Contract dates required
  it('rejects empty payments.contractStartDate', () => {
    expect(tenancyFormSchema.validateField('payments.contractStartDate', '')).toBeTruthy();
  });

  it('accepts non-empty payments.contractStartDate', () => {
    expect(tenancyFormSchema.validateField('payments.contractStartDate', '2026-06-01')).toBeNull();
  });

  it('rejects empty payments.contractEndDate', () => {
    expect(tenancyFormSchema.validateField('payments.contractEndDate', '')).toBeTruthy();
  });

  // Email/phone rules
  it('rejects invalid tenant.email', () => {
    const err = tenancyFormSchema.validateField('tenant.email', 'bad-email');
    expect(err).toBeTruthy();
  });

  it('accepts valid tenant.email', () => {
    expect(tenancyFormSchema.validateField('tenant.email', 'ahmed@email.com')).toBeNull();
  });

  it('rejects landlord.phone with too few digits', () => {
    expect(tenancyFormSchema.validateField('landlord.phone', '123')).toBeTruthy();
  });

  it('accepts valid landlord.phone', () => {
    expect(tenancyFormSchema.validateField('landlord.phone', '+97143000000')).toBeNull();
  });

  // Full validate
  it('validate() returns isValid=false when all fields empty', () => {
    const { isValid } = tenancyFormSchema.validate({});
    expect(isValid).toBe(false);
  });

  it('validate() passes when all required fields provided', () => {
    const { isValid } = tenancyFormSchema.validate({
      'property.unit': '301C',
      'property.community': 'Business Bay',
      'tenant.fullName': 'Sara Al Rashidi',
      'landlord.name': 'White Caves Real Estate LLC',
      'payments.contractStartDate': '2026-06-01',
      'payments.contractEndDate': '2027-05-31',
    });
    expect(isValid).toBe(true);
  });
});
