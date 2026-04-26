import { describe, it, expect } from 'vitest';
import {
  selectActiveTemplateMeta,
  selectActiveTemplateLabel,
  selectCanGeneratePdf,
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
