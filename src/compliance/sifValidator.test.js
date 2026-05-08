/**
 * sifValidator.test.js
 * Unit tests for all WPS SIF validation functions.
 * All expectations are derived directly from the function implementations.
 */
import { describe, it, expect } from 'vitest';
import {
  validateIBAN,
  validateRoutingCode,
  validateAEDAmount,
  validatePayDates,
  validateEmployeeRecord,
  validateSIFFile,
} from './sifValidator';

// ─── Known-valid UAE IBAN (mod-97 checksum = 1 verified) ─────────────────────
// AE030359356491705358002 → rearranged numeric mod 97 = 1
const VALID_IBAN = 'AE030359356491705358002';
const VALID_ROUTING = '033123456';

// ─── validateIBAN ────────────────────────────────────────────────────────────

describe('validateIBAN', () => {
  it('returns invalid when IBAN is empty', () => {
    const result = validateIBAN('');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('IBAN_EMPTY');
  });

  it('returns invalid when IBAN is null/undefined', () => {
    expect(validateIBAN(null).isValid).toBe(false);
    expect(validateIBAN(undefined).isValid).toBe(false);
  });

  it('returns invalid for wrong format (too short)', () => {
    const result = validateIBAN('AE0703312345');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('IBAN_INVALID_FORMAT');
  });

  it('returns invalid for wrong format (too long)', () => {
    const result = validateIBAN('AE070331234567890123456789');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('IBAN_INVALID_FORMAT');
  });

  it('returns invalid for non-AE prefix', () => {
    // GB IBAN passed with default AE country → wrong format
    const result = validateIBAN('GB29NWBK60161331926819');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('IBAN_INVALID_FORMAT');
  });

  it('returns invalid for AE IBAN with bad checksum', () => {
    // Correct length but wrong check digits → checksum fails
    const result = validateIBAN('AE990331234567890123456');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('IBAN_INVALID_CHECKSUM');
  });

  it('returns invalid for IBAN with letters in digit positions', () => {
    const result = validateIBAN('AEXX0331234567890123456');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('IBAN_INVALID_FORMAT');
  });

  it('accepts valid UAE IBAN (known good checksum)', () => {
    const result = validateIBAN(VALID_IBAN);
    expect(result.isValid).toBe(true);
    expect(result.code).toBe('IBAN_VALID');
  });

  it('is case-insensitive (lowercase input)', () => {
    const result = validateIBAN(VALID_IBAN.toLowerCase());
    expect(result.isValid).toBe(true);
    expect(result.code).toBe('IBAN_VALID');
  });
});

// ─── validateRoutingCode ─────────────────────────────────────────────────────

describe('validateRoutingCode', () => {
  it('returns invalid when routing code is empty', () => {
    const result = validateRoutingCode('');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('ROUTING_EMPTY');
  });

  it('returns invalid when routing code is null', () => {
    expect(validateRoutingCode(null).isValid).toBe(false);
    expect(validateRoutingCode(null).code).toBe('ROUTING_EMPTY');
  });

  it('returns invalid for fewer than 9 digits', () => {
    const result = validateRoutingCode('12345678');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('ROUTING_INVALID_FORMAT');
  });

  it('returns invalid for more than 9 digits', () => {
    const result = validateRoutingCode('1234567890');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('ROUTING_INVALID_FORMAT');
  });

  it('returns invalid for non-digit characters', () => {
    const result = validateRoutingCode('12345678A');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('ROUTING_INVALID_FORMAT');
  });

  it('accepts valid 9-digit routing code', () => {
    const result = validateRoutingCode(VALID_ROUTING);
    expect(result.isValid).toBe(true);
    expect(result.code).toBe('ROUTING_VALID');
  });

  it('accepts routing code passed as number', () => {
    const result = validateRoutingCode(33123456);
    // 8 digits as number → invalid format
    expect(result.isValid).toBe(false);
  });

  it('trims whitespace before validating', () => {
    const result = validateRoutingCode('  033123456  ');
    expect(result.isValid).toBe(true);
  });
});

// ─── validateAEDAmount ───────────────────────────────────────────────────────

describe('validateAEDAmount', () => {
  it('returns invalid when amount is empty string', () => {
    const result = validateAEDAmount('');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('AMOUNT_EMPTY');
  });

  it('returns invalid when amount is null', () => {
    const result = validateAEDAmount(null);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('AMOUNT_EMPTY');
  });

  it('returns invalid when amount is undefined', () => {
    const result = validateAEDAmount(undefined);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('AMOUNT_EMPTY');
  });

  it('returns invalid for non-numeric string', () => {
    const result = validateAEDAmount('abc');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('AMOUNT_NOT_NUMBER');
  });

  it('returns invalid for negative amount', () => {
    const result = validateAEDAmount(-100);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('AMOUNT_NEGATIVE');
  });

  it('returns invalid for more than 2 decimal places', () => {
    const result = validateAEDAmount('1000.123');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('AMOUNT_DECIMALS');
  });

  it('accepts zero amount (boundary)', () => {
    const result = validateAEDAmount(0);
    expect(result.isValid).toBe(true);
    expect(result.code).toBe('AMOUNT_VALID');
  });

  it('accepts integer amount', () => {
    const result = validateAEDAmount(5000);
    expect(result.isValid).toBe(true);
    expect(result.code).toBe('AMOUNT_VALID');
  });

  it('accepts amount with 1 decimal place', () => {
    const result = validateAEDAmount('5000.5');
    expect(result.isValid).toBe(true);
    expect(result.code).toBe('AMOUNT_VALID');
  });

  it('accepts amount with exactly 2 decimal places', () => {
    const result = validateAEDAmount('5000.50');
    expect(result.isValid).toBe(true);
    expect(result.code).toBe('AMOUNT_VALID');
  });

  it('includes fieldName in error message when provided', () => {
    const result = validateAEDAmount(-1, 'Salary');
    expect(result.message).toContain('Salary');
  });

  it('uses default "Amount" when fieldName omitted', () => {
    const result = validateAEDAmount(-1);
    expect(result.message).toContain('Amount');
  });
});

// ─── validatePayDates ────────────────────────────────────────────────────────

describe('validatePayDates', () => {
  const today = new Date();
  const fmtDate = (d) => d.toISOString().split('T')[0];

  const startDate = fmtDate(today);
  const endDate = fmtDate(new Date(today.getTime() + 30 * 86400000)); // +30 days

  it('returns invalid when start date is missing', () => {
    const result = validatePayDates('', endDate);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('START_DATE_EMPTY');
  });

  it('returns invalid when end date is missing', () => {
    const result = validatePayDates(startDate, '');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('END_DATE_EMPTY');
  });

  it('returns invalid for invalid start date format', () => {
    const result = validatePayDates('not-a-date', endDate);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('START_DATE_INVALID');
  });

  it('returns invalid for invalid end date format', () => {
    const result = validatePayDates(startDate, 'not-a-date');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('END_DATE_INVALID');
  });

  it('returns invalid when start date is after end date', () => {
    const result = validatePayDates(endDate, startDate); // reversed
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('DATE_ORDER_INVALID');
  });

  it('returns invalid for dates outside ±1 year range', () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const result = validatePayDates(fmtDate(twoYearsAgo), startDate);
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('DATE_RANGE_EXCEEDED');
  });

  it('accepts valid dates within ±1 year', () => {
    const result = validatePayDates(startDate, endDate);
    expect(result.isValid).toBe(true);
    expect(result.code).toBe('DATES_VALID');
  });

  it('accepts same start and end date', () => {
    const result = validatePayDates(startDate, startDate);
    expect(result.isValid).toBe(true);
  });
});

// ─── validateEmployeeRecord ──────────────────────────────────────────────────

describe('validateEmployeeRecord', () => {
  const validEmployee = {
    emiratesId: '784199012345678',
    fullName: 'Ahmed Al Mansouri',
    accountNumber: 'AE030359356491705358002',
    salary: 5000,
    allowance: 500,
  };

  it('accepts a fully valid employee record', () => {
    const result = validateEmployeeRecord(validEmployee);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('requires emiratesId', () => {
    const result = validateEmployeeRecord({ ...validEmployee, emiratesId: '' });
    expect(result.isValid).toBe(false);
    const field = result.errors.find((e) => e.field === 'emiratesId');
    expect(field).toBeDefined();
    expect(field.code).toBe('EMIRATEID_REQUIRED');
  });

  it('validates emiratesId is exactly 15 digits', () => {
    const result = validateEmployeeRecord({ ...validEmployee, emiratesId: '78419901234' }); // short
    expect(result.isValid).toBe(false);
    const field = result.errors.find((e) => e.field === 'emiratesId');
    expect(field.code).toBe('EMIRATEID_INVALID');
  });

  it('requires fullName', () => {
    const result = validateEmployeeRecord({ ...validEmployee, fullName: '' });
    expect(result.isValid).toBe(false);
    const field = result.errors.find((e) => e.field === 'fullName');
    expect(field).toBeDefined();
    expect(field.code).toBe('NAME_REQUIRED');
  });

  it('rejects fullName with only whitespace', () => {
    const result = validateEmployeeRecord({ ...validEmployee, fullName: '   ' });
    expect(result.isValid).toBe(false);
  });

  it('requires accountNumber', () => {
    const result = validateEmployeeRecord({ ...validEmployee, accountNumber: '' });
    expect(result.isValid).toBe(false);
    const field = result.errors.find((e) => e.field === 'accountNumber');
    expect(field.code).toBe('ACCOUNT_REQUIRED');
  });

  it('requires salary', () => {
    const result = validateEmployeeRecord({ ...validEmployee, salary: undefined });
    expect(result.isValid).toBe(false);
    const field = result.errors.find((e) => e.field === 'salary');
    expect(field.code).toBe('SALARY_REQUIRED');
  });

  it('accepts salary of 0', () => {
    // salary=0 is treated as provided (falsy but !== undefined/null/'')
    const result = validateEmployeeRecord({ ...validEmployee, salary: 0 });
    expect(result.isValid).toBe(true);
  });

  it('rejects negative salary', () => {
    const result = validateEmployeeRecord({ ...validEmployee, salary: -100 });
    expect(result.isValid).toBe(false);
    const field = result.errors.find((e) => e.field === 'salary');
    expect(field).toBeDefined();
  });

  it('validates allowance when provided', () => {
    const result = validateEmployeeRecord({ ...validEmployee, allowance: -50 });
    expect(result.isValid).toBe(false);
    const field = result.errors.find((e) => e.field === 'allowance');
    expect(field).toBeDefined();
  });

  it('does not require allowance (undefined is allowed)', () => {
    const { allowance: _, ...noAllowance } = validEmployee;
    const result = validateEmployeeRecord(noAllowance);
    expect(result.isValid).toBe(true);
  });

  it('collects multiple errors at once', () => {
    const result = validateEmployeeRecord({ emiratesId: '', fullName: '', accountNumber: '' });
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

// ─── validateSIFFile ─────────────────────────────────────────────────────────

describe('validateSIFFile', () => {
  const validCompany = {
    employerOrgNo: '1234567890123',
    organizationName: 'White Caves Real Estate LLC',
    iban: VALID_IBAN,
    routingCode: VALID_ROUTING,
  };

  const validEmployee = {
    emiratesId: '784199012345678',
    fullName: 'Ahmed Al Mansouri',
    accountNumber: 'AE030359356491705358002',
    salary: 5000,
    allowance: 500,
  };

  it('returns valid for a correct company + employee setup', () => {
    const result = validateSIFFile([validEmployee], validCompany);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.summary.totalErrors).toBe(0);
  });

  it('requires at least one employee', () => {
    const result = validateSIFFile([], validCompany);
    expect(result.isValid).toBe(false);
    const err = result.errors.find((e) => e.code === 'NO_EMPLOYEES');
    expect(err).toBeDefined();
    expect(result.summary.totalErrors).toBeGreaterThan(0);
  });

  it('requires employerOrgNo', () => {
    const result = validateSIFFile([validEmployee], { ...validCompany, employerOrgNo: '' });
    expect(result.isValid).toBe(false);
    const err = result.errors.find((e) => e.code === 'EMPLOYER_ORG_REQUIRED');
    expect(err).toBeDefined();
    expect(err.type).toBe('company');
  });

  it('requires organizationName', () => {
    const result = validateSIFFile([validEmployee], { ...validCompany, organizationName: '' });
    expect(result.isValid).toBe(false);
    const err = result.errors.find((e) => e.code === 'ORG_NAME_REQUIRED');
    expect(err).toBeDefined();
  });

  it('validates company IBAN', () => {
    const result = validateSIFFile([validEmployee], { ...validCompany, iban: 'BAD_IBAN' });
    expect(result.isValid).toBe(false);
    const err = result.errors.find((e) => e.field === 'iban');
    expect(err).toBeDefined();
    expect(err.type).toBe('company');
  });

  it('validates company routing code', () => {
    const result = validateSIFFile([validEmployee], { ...validCompany, routingCode: '123' });
    expect(result.isValid).toBe(false);
    const err = result.errors.find((e) => e.field === 'routingCode');
    expect(err).toBeDefined();
  });

  it('collects employee errors with employeeIndex', () => {
    const badEmployee = { ...validEmployee, emiratesId: '', fullName: '' };
    const result = validateSIFFile([badEmployee], validCompany);
    expect(result.isValid).toBe(false);
    const empErrors = result.errors.filter((e) => e.type === 'employee');
    expect(empErrors.length).toBeGreaterThan(0);
    expect(empErrors[0].employeeIndex).toBe(0);
  });

  it('summary.companyErrors counts only company-type errors', () => {
    const result = validateSIFFile([validEmployee], {
      ...validCompany,
      employerOrgNo: '',
      organizationName: '',
    });
    expect(result.summary.companyErrors).toBeGreaterThanOrEqual(2);
  });

  it('summary.employeeErrors counts only employee-type errors', () => {
    const badEmp = { emiratesId: '', fullName: '', accountNumber: '', salary: undefined };
    const result = validateSIFFile([badEmp], validCompany);
    expect(result.summary.employeeErrors).toBeGreaterThan(0);
    expect(result.summary.companyErrors).toBe(0);
  });

  it('handles null employees gracefully', () => {
    const result = validateSIFFile(null, validCompany);
    expect(result.isValid).toBe(false);
    const err = result.errors.find((e) => e.code === 'NO_EMPLOYEES');
    expect(err).toBeDefined();
  });
});
