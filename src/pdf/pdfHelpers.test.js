/**
 * pdfHelpers — unit tests
 *
 * Covers every exported function:
 *   sanitizeFileNameSegment
 *   buildQuotationFileName
 *   buildViewingAgreementFileName
 *   buildEjariFileName
 *   buildAddendumFileName
 *   buildSalaryCertificateFileName
 *   buildCopySuffix
 *   buildGeneratedCopyFileName
 *   buildPdfFileName            (router — delegates to the above)
 *   getPublicAsset
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  sanitizeFileNameSegment,
  buildQuotationFileName,
  buildViewingAgreementFileName,
  buildEjariFileName,
  buildAddendumFileName,
  buildSalaryCertificateFileName,
  buildCopySuffix,
  buildGeneratedCopyFileName,
  buildPdfFileName,
  getPublicAsset,
} from './pdfHelpers';

// ── sanitizeFileNameSegment ───────────────────────────────────────────────────

describe('sanitizeFileNameSegment', () => {
  it('returns plain strings unchanged', () => {
    expect(sanitizeFileNameSegment('Filename')).toBe('Filename');
  });

  it('trims whitespace', () => {
    expect(sanitizeFileNameSegment('  hello  ')).toBe('hello');
  });

  it('replaces internal spaces with underscores', () => {
    expect(sanitizeFileNameSegment('Ahmed Ali')).toBe('Ahmed_Ali');
  });

  it('strips reserved path characters \\/:*?"<>|', () => {
    expect(sanitizeFileNameSegment('A/B:C*D?E"F<G>H|I')).toBe('ABCDEFGHI');
  });

  it('returns "Unknown" for empty string', () => {
    expect(sanitizeFileNameSegment('')).toBe('Unknown');
  });

  it('returns "Unknown" for whitespace-only string', () => {
    expect(sanitizeFileNameSegment('   ')).toBe('Unknown');
  });

  it('uses default param for undefined — returns "Unknown"', () => {
    expect(sanitizeFileNameSegment()).toBe('Unknown');
  });
});

// ── buildQuotationFileName ────────────────────────────────────────────────────

describe('buildQuotationFileName', () => {
  const docData = {
    property: { unit: 'Unit 449', documentDate: '2026-05-07' },
    tenant: { fullName: 'Ahmed Al Mansouri' },
  };

  it('contains the unit and tenant name', () => {
    const name = buildQuotationFileName(docData);
    expect(name).toContain('Unit_449');
    expect(name).toContain('Ahmed_Al_Mansouri');
    expect(name.endsWith('.pdf')).toBe(true);
  });

  it('falls back to "Unit" when property.unit is absent', () => {
    const name = buildQuotationFileName({ property: {}, tenant: { fullName: 'Test' } });
    expect(name).toContain('Unit');
  });

  it('falls back to "Tenant" when tenant.fullName is absent', () => {
    const name = buildQuotationFileName({ property: { unit: 'A1' }, tenant: {} });
    expect(name).toContain('Tenant');
  });

  it('falls back gracefully with empty docData', () => {
    const name = buildQuotationFileName({});
    expect(name.endsWith('.pdf')).toBe(true);
    expect(name).toContain('Unit');
    expect(name).toContain('Tenant');
  });
});

// ── buildViewingAgreementFileName ─────────────────────────────────────────────

describe('buildViewingAgreementFileName', () => {
  it('starts with Viewing_Agreement and contains unit', () => {
    const name = buildViewingAgreementFileName({
      property: { unit: 'A-101', documentDate: '2026-05-07' },
    });
    expect(name.startsWith('Viewing_Agreement_')).toBe(true);
    expect(name).toContain('A-101');
    expect(name.endsWith('.pdf')).toBe(true);
  });

  it('falls back to "Unit" when unit is absent', () => {
    const name = buildViewingAgreementFileName({ property: {} });
    expect(name).toContain('Unit');
  });
});

// ── buildEjariFileName ────────────────────────────────────────────────────────

describe('buildEjariFileName', () => {
  it('starts with Tenancy_Contract and contains unit + tenant', () => {
    const name = buildEjariFileName({
      property: { unit: 'Villa 12', documentDate: '2026-05-01' },
      tenant: { fullName: 'Layla Hassan' },
    });
    expect(name.startsWith('Tenancy_Contract_')).toBe(true);
    expect(name).toContain('Villa_12');
    expect(name).toContain('Layla_Hassan');
    expect(name.endsWith('.pdf')).toBe(true);
  });
});

// ── buildAddendumFileName ─────────────────────────────────────────────────────

describe('buildAddendumFileName', () => {
  it('starts with Addendum and uses effectiveDate when present', () => {
    const name = buildAddendumFileName({
      property: { unit: 'B-5', documentDate: '2026-01-01' },
      tenant: { fullName: 'Omar Khalid' },
      addendum: { effectiveDate: '2026-05-07' },
    });
    expect(name.startsWith('Addendum_')).toBe(true);
    expect(name).toContain('B-5');
    expect(name).toContain('Omar_Khalid');
    expect(name.endsWith('.pdf')).toBe(true);
  });

  it('falls back to property.documentDate when addendum.effectiveDate is absent', () => {
    const name = buildAddendumFileName({
      property: { unit: 'C1', documentDate: '2026-03-15' },
      tenant: { fullName: 'Sara' },
      addendum: {},
    });
    expect(name.startsWith('Addendum_')).toBe(true);
    expect(name.endsWith('.pdf')).toBe(true);
  });
});

// ── buildSalaryCertificateFileName ────────────────────────────────────────────

describe('buildSalaryCertificateFileName', () => {
  it('uses salaryCertificate.employeeName when present', () => {
    const name = buildSalaryCertificateFileName({
      salaryCertificate: { employeeName: 'Fatima Al Zaabi', issueDate: '2026-05-01' },
    });
    expect(name.startsWith('Salary_Certificate_')).toBe(true);
    expect(name).toContain('Fatima_Al_Zaabi');
    expect(name.endsWith('.pdf')).toBe(true);
  });

  it('falls back to tenant.fullName when salaryCertificate.employeeName is absent', () => {
    const name = buildSalaryCertificateFileName({
      salaryCertificate: {},
      tenant: { fullName: 'Backup Person' },
    });
    expect(name).toContain('Backup_Person');
  });

  it('falls back to "Employee" when both name sources are absent', () => {
    const name = buildSalaryCertificateFileName({ salaryCertificate: {}, tenant: {} });
    expect(name).toContain('Employee');
  });
});

// ── buildCopySuffix ───────────────────────────────────────────────────────────

describe('buildCopySuffix', () => {
  const fixedDate = new Date('2026-05-07T14:30:45Z');

  it('returns a timestamp string with copy tag', () => {
    const suffix = buildCopySuffix({ createdAt: fixedDate, copyNumber: 1 });
    // format: YYYYMMDD-HHMMSS_C0001
    expect(suffix).toMatch(/^\d{8}-\d{6}_C\d{4}$/);
  });

  it('left-pads copy number to 4 digits', () => {
    const suffix = buildCopySuffix({ createdAt: fixedDate, copyNumber: 7 });
    expect(suffix).toContain('_C0007');
  });

  it('pads large copy numbers without truncation', () => {
    const suffix = buildCopySuffix({ createdAt: fixedDate, copyNumber: 123 });
    expect(suffix).toContain('_C0123');
  });

  it('defaults to C0001 when copyNumber is not a finite number', () => {
    const suffix = buildCopySuffix({ createdAt: fixedDate });
    expect(suffix).toContain('_C0001');
  });

  it('defaults to C0001 when copyNumber is NaN', () => {
    const suffix = buildCopySuffix({ createdAt: fixedDate, copyNumber: NaN });
    expect(suffix).toContain('_C0001');
  });

  it('defaults to C0001 when copyNumber is a string', () => {
    const suffix = buildCopySuffix({ createdAt: fixedDate, copyNumber: '3' });
    expect(suffix).toContain('_C0001');
  });

  it('includes the year from createdAt', () => {
    const suffix = buildCopySuffix({ createdAt: new Date('2025-01-01T00:00:00Z'), copyNumber: 1 });
    expect(suffix.startsWith('2025')).toBe(true);
  });
});

// ── buildGeneratedCopyFileName ────────────────────────────────────────────────

describe('buildGeneratedCopyFileName', () => {
  it('appends __COPY_<suffix>.pdf to the base name', () => {
    const name = buildGeneratedCopyFileName('MyDocument.pdf', {
      createdAt: new Date('2026-05-07T10:00:00Z'),
      copyNumber: 1,
    });
    expect(name).toMatch(/^MyDocument__COPY_\d{8}-\d{6}_C\d{4}\.pdf$/);
  });

  it('strips .pdf from base before building name (no double extension)', () => {
    const name = buildGeneratedCopyFileName('Report.pdf', {
      createdAt: new Date('2026-05-07T10:00:00Z'),
      copyNumber: 2,
    });
    expect(name.indexOf('.pdf')).toBe(name.length - 4); // exactly one .pdf at end
  });

  it('sanitizes the base file name', () => {
    const name = buildGeneratedCopyFileName('Unit/449:Contract.pdf', {
      createdAt: new Date('2026-05-07T10:00:00Z'),
      copyNumber: 1,
    });
    expect(name).not.toContain('/');
    expect(name).not.toContain(':');
  });

  it('handles falsy baseFileName with fallback "Document.pdf"', () => {
    const name = buildGeneratedCopyFileName(null, {
      createdAt: new Date('2026-05-07T10:00:00Z'),
      copyNumber: 1,
    });
    expect(name).toContain('Document__COPY_');
  });
});

// ── buildPdfFileName (router) ─────────────────────────────────────────────────

describe('buildPdfFileName', () => {
  const docData = {
    property: { unit: 'U1', documentDate: '2026-05-07' },
    tenant: { fullName: 'Test Tenant' },
    addendum: {},
    salaryCertificate: { employeeName: 'Staff Member', issueDate: '2026-05-07' },
  };

  it('routes "viewing" to buildViewingAgreementFileName', () => {
    expect(buildPdfFileName('viewing', docData)).toMatch(/^Viewing_Agreement_/);
  });

  it('routes "tenancy" to buildEjariFileName', () => {
    expect(buildPdfFileName('tenancy', docData)).toMatch(/^Tenancy_Contract_/);
  });

  it('routes "addendum" to buildAddendumFileName', () => {
    expect(buildPdfFileName('addendum', docData)).toMatch(/^Addendum_/);
  });

  it('routes "salaryCertificate" to buildSalaryCertificateFileName', () => {
    expect(buildPdfFileName('salaryCertificate', docData)).toMatch(/^Salary_Certificate_/);
  });

  it('routes "booking" to buildQuotationFileName', () => {
    const name = buildPdfFileName('booking', docData);
    expect(name).toContain('U1');
    expect(name).toContain('Test_Tenant');
  });

  it('routes "bookingGov" to buildQuotationFileName', () => {
    const name = buildPdfFileName('bookingGov', docData);
    expect(name.endsWith('.pdf')).toBe(true);
  });

  it('routes unknown keys to buildQuotationFileName as default', () => {
    const name = buildPdfFileName('invoice', docData);
    expect(name.endsWith('.pdf')).toBe(true);
  });
});

// ── getPublicAsset ────────────────────────────────────────────────────────────

describe('getPublicAsset', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns "/<assetName>" when window is defined but origin is empty', () => {
    // In jsdom window exists, origin may or may not be set. We just check the path.
    const result = getPublicAsset('logo.png');
    expect(result).toMatch(/logo\.png$/);
  });

  it('includes origin when window.location.origin is set', () => {
    vi.stubGlobal('window', {
      location: { origin: 'https://henry.whitecaves.ae' },
    });
    const result = getPublicAsset('logo.png');
    expect(result).toBe('https://henry.whitecaves.ae/logo.png');
  });

  it('falls back to "/<assetName>" when window is undefined', () => {
    vi.stubGlobal('window', undefined);
    const result = getPublicAsset('logo.png');
    expect(result).toBe('/logo.png');
  });
});
