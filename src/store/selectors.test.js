import { describe, it, expect } from 'vitest';
import {
  selectActiveTemplateMeta,
  selectActiveTemplateLabel,
  selectCanGeneratePdf,
  selectRequiredFieldsForActiveTemplate,
  selectBlockingMissingRequiredFields,
  selectDocumentReadiness,
  selectSidebarContent,
  selectActiveTemplateWarnings,
  selectComplianceSummary,
  selectArchiveEntries,
  selectArchiveEntriesForCurrentUnit,
} from './selectors';

/**
 * Build a minimal `state` shape that satisfies every selector under test.
 * Each describe block overrides only the slice it cares about.
 */
const makeState = (overrides = {}) => ({
  template: { activeTemplate: 'viewing' },
  document: { property: { unit: 'A-1', community: 'Downtown' } },
  policyMeta: {},
  sidebar: { guidance: { common: { highlights: [], articles: [] }, byTemplate: {} } },
  compliance: { warningsByTemplate: {} },
  henry: {},
  archive: { entries: [] },
  ocr: { lastApproved: null },
  ...overrides,
});

describe('selectActiveTemplateMeta + label + canGeneratePdf', () => {
  it('returns a fallback meta for unknown templates', () => {
    const meta = selectActiveTemplateMeta(makeState({ template: { activeTemplate: 'nope' } }));
    expect(meta).toMatchObject({ key: 'nope', label: 'nope' });
  });

  it('returns the registry entry for known templates', () => {
    const meta = selectActiveTemplateMeta(makeState({ template: { activeTemplate: 'viewing' } }));
    expect(meta.key).toBe('viewing');
    expect(typeof meta.label).toBe('string');
  });

  it('selectActiveTemplateLabel mirrors meta.label', () => {
    const state = makeState({ template: { activeTemplate: 'viewing' } });
    expect(selectActiveTemplateLabel(state)).toBe(selectActiveTemplateMeta(state).label);
  });

  it('selectCanGeneratePdf returns boolean', () => {
    const state = makeState({ template: { activeTemplate: 'viewing' } });
    expect(typeof selectCanGeneratePdf(state)).toBe('boolean');
  });

  it('selectCanGeneratePdf is true for keyHandover (PDF enabled)', () => {
    const state = makeState({ template: { activeTemplate: 'keyHandover' } });
    expect(selectCanGeneratePdf(state)).toBe(true);
  });

  it('selectCanGeneratePdf is false for offer template (PDF disabled)', () => {
    const state = makeState({ template: { activeTemplate: 'offer' } });
    expect(selectCanGeneratePdf(state)).toBe(false);
  });
});

describe('selectSidebarContent', () => {
  it('merges common + per-template highlights and articles', () => {
    const state = makeState({
      template: { activeTemplate: 'viewing' },
      sidebar: {
        guidance: {
          common: { highlights: ['c1'], articles: ['a1'] },
          byTemplate: { viewing: { highlights: ['v1'], articles: ['va1'] } },
        },
      },
    });
    expect(selectSidebarContent(state)).toEqual({
      highlights: ['c1', 'v1'],
      articles: ['a1', 'va1'],
    });
  });

  it('falls back to empty arrays when nothing is configured', () => {
    const state = makeState({ sidebar: { guidance: {} } });
    expect(selectSidebarContent(state)).toEqual({ highlights: [], articles: [] });
  });
});

describe('compliance selectors', () => {
  const warnings = [
    { id: 'A', severity: 'critical' },
    { id: 'B', severity: 'critical' },
    { id: 'C', severity: 'important' },
    { id: 'D', severity: 'info' },
    { id: 'E', severity: 'whatever' }, // bucketed as info by the reduce
  ];

  it('selectActiveTemplateWarnings reads the active template bucket', () => {
    const state = makeState({
      compliance: { warningsByTemplate: { viewing: warnings } },
    });
    expect(selectActiveTemplateWarnings(state)).toBe(warnings);
  });

  it('returns [] when the template has no warnings yet', () => {
    expect(selectActiveTemplateWarnings(makeState())).toEqual([]);
  });

  it('selectComplianceSummary counts by severity (unknown → info)', () => {
    const state = makeState({
      compliance: { warningsByTemplate: { viewing: warnings } },
    });
    expect(selectComplianceSummary(state)).toEqual({ critical: 2, important: 1, info: 2 });
  });
});

describe('archive selectors', () => {
  const entries = [
    { unit: 'A-1', community: 'Downtown', file: 'a.pdf' },
    { unit: 'A-1', community: 'Downtown', file: 'b.pdf' },
    { unit: 'B-2', community: 'Marina', file: 'c.pdf' },
  ];

  it('selectArchiveEntries returns the array (or [] when missing)', () => {
    expect(selectArchiveEntries(makeState({ archive: { entries } }))).toBe(entries);
    expect(selectArchiveEntries(makeState({ archive: {} }))).toEqual([]);
  });

  it('selectArchiveEntriesForCurrentUnit filters by current unit + community', () => {
    const state = makeState({
      document: { property: { unit: 'A-1', community: 'Downtown' } },
      archive: { entries },
    });
    const filtered = selectArchiveEntriesForCurrentUnit(state);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((e) => e.file)).toEqual(['a.pdf', 'b.pdf']);
  });
});

describe('required fields + readiness selectors', () => {
  it('returns tenancy required fields as an ordered numbered list', () => {
    const state = makeState({ template: { activeTemplate: 'tenancy' } });
    const fields = selectRequiredFieldsForActiveTemplate(state);
    expect(Array.isArray(fields)).toBe(true);
    expect(fields.length).toBeGreaterThan(0);
    expect(fields[0]).toMatchObject({ order: 1, path: 'tenant.fullName' });
  });

  it('returns [] for templates without phase-1 registry entries', () => {
    const state = makeState({ template: { activeTemplate: 'booking' } });
    expect(selectRequiredFieldsForActiveTemplate(state)).toEqual([]);
  });

  it('detects missing blocking fields for tenancy', () => {
    const state = makeState({
      template: { activeTemplate: 'tenancy' },
      document: {
        property: { unit: 'A-1', community: 'Downtown' },
        tenant: { fullName: '' },
        landlord: { name: 'Owner Name' },
        payments: { contractStartDate: '', contractEndDate: '', annualRent: 0 },
      },
    });
    const missing = selectBlockingMissingRequiredFields(state);
    expect(missing.some((f) => f.path === 'tenant.fullName')).toBe(true);
    expect(missing.some((f) => f.path === 'payments.contractStartDate')).toBe(true);
  });

  it('marks readiness as true when no blocking fields are missing', () => {
    const state = makeState({
      template: { activeTemplate: 'tenancy' },
      document: {
        property: { unit: 'A-1', community: 'Downtown' },
        tenant: { fullName: 'Ahmed Ali' },
        landlord: { name: 'Owner Name' },
        payments: {
          contractStartDate: '2026-05-01',
          contractEndDate: '2027-04-30',
          annualRent: 85000,
        },
      },
    });
    const readiness = selectDocumentReadiness(state);
    expect(readiness.isReadyForGeneration).toBe(true);
    expect(readiness.missingBlockingFields).toEqual([]);
  });
});
