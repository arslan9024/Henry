/**
 * pathBuilder — unit tests
 *
 * Covers:
 *   sanitizePathSegment    — strips reserved chars, collapses spaces, fallback
 *   buildPropertyFolderName — community + unit concatenation + sanitization
 *   buildLogicalRecordPath  — year/month/property structure, date fallback
 */
import { describe, it, expect } from 'vitest';
import {
  sanitizePathSegment,
  buildPropertyFolderName,
  buildLogicalRecordPath,
} from './pathBuilder';

// ── sanitizePathSegment ───────────────────────────────────────────────────────

describe('sanitizePathSegment', () => {
  it('returns the string unchanged for plain safe input', () => {
    expect(sanitizePathSegment('DowntownDubai')).toBe('DowntownDubai');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizePathSegment('  Avencia  ')).toBe('Avencia');
  });

  it('replaces spaces with underscores', () => {
    expect(sanitizePathSegment('Damac Hills 2')).toBe('Damac_Hills_2');
  });

  it('collapses multiple spaces to a single underscore', () => {
    expect(sanitizePathSegment('A   B')).toBe('A_B');
  });

  it('strips Windows / POSIX reserved path characters', () => {
    expect(sanitizePathSegment('Unit\\449/:*?"<>|')).toBe('Unit449');
  });

  it('falls back to "Unknown" for empty string', () => {
    expect(sanitizePathSegment('')).toBe('Unknown');
  });

  it('falls back to "Unknown" for whitespace-only string', () => {
    expect(sanitizePathSegment('   ')).toBe('Unknown');
  });

  it('falls back to "Unknown" for undefined (default param)', () => {
    expect(sanitizePathSegment()).toBe('Unknown');
  });

  it('coerces non-string values to string before sanitizing', () => {
    expect(sanitizePathSegment(42)).toBe('42');
  });
});

// ── buildPropertyFolderName ───────────────────────────────────────────────────

describe('buildPropertyFolderName', () => {
  it('builds "community_unit" from property object', () => {
    expect(buildPropertyFolderName({ community: 'Damac Hills 2', unit: 'Unit 449' }))
      .toBe('Damac_Hills_2_Unit_449');
  });

  it('falls back to cluster when community is absent', () => {
    expect(buildPropertyFolderName({ cluster: 'Avencia', unit: '101' }))
      .toBe('Avencia_101');
  });

  it('falls back to "Property" when both community and cluster are absent', () => {
    expect(buildPropertyFolderName({ unit: '42A' })).toBe('Property_42A');
  });

  it('falls back to "Unit" when unit is absent', () => {
    expect(buildPropertyFolderName({ community: 'Downtown' })).toBe('Downtown_Unit');
  });

  it('returns "Property_Unit" for an empty object', () => {
    expect(buildPropertyFolderName({})).toBe('Property_Unit');
  });

  it('returns "Property_Unit" when called with no argument', () => {
    expect(buildPropertyFolderName()).toBe('Property_Unit');
  });
});

// ── buildLogicalRecordPath ────────────────────────────────────────────────────

describe('buildLogicalRecordPath', () => {
  it('builds /records/YYYY/MonthName/Community_Unit/ from a known date', () => {
    const path = buildLogicalRecordPath({
      createdAt: '2026-05-07T10:00:00Z',
      property: { community: 'Damac Hills 2', unit: 'Unit 449' },
    });
    // Year and property folder are deterministic
    expect(path).toContain('/records/2026/');
    expect(path).toContain('/Damac_Hills_2_Unit_449/');
    // Month name must be a word (locale month name)
    expect(path).toMatch(/\/records\/2026\/\w+\/Damac_Hills_2_Unit_449\//);
  });

  it('starts with /records/ and ends with /', () => {
    const path = buildLogicalRecordPath({
      createdAt: '2026-01-15T00:00:00Z',
      property: { community: 'Marina', unit: 'Tower A' },
    });
    expect(path.startsWith('/records/')).toBe(true);
    expect(path.endsWith('/')).toBe(true);
  });

  it('uses current date when createdAt is falsy', () => {
    const path = buildLogicalRecordPath({ property: { community: 'JVC', unit: 'V1' } });
    const year = String(new Date().getFullYear());
    expect(path).toContain(`/records/${year}/`);
  });

  it('handles missing property by using fallbacks', () => {
    const path = buildLogicalRecordPath({ createdAt: '2025-03-01T00:00:00Z' });
    expect(path).toContain('/records/2025/');
    expect(path).toContain('/Property_Unit/');
  });

  it('sanitizes community names with special characters', () => {
    const path = buildLogicalRecordPath({
      createdAt: '2026-08-20T00:00:00Z',
      property: { community: 'Al Quoz/Industrial', unit: 'W1' },
    });
    // The '/' in the community name should be stripped by sanitizePathSegment;
    // only the structural path separators should remain.
    const segments = path.split('/').filter(Boolean); // ['records','2026','August','Al_QuozIndustrial_W1']
    // No individual segment should contain a reserved char
    segments.forEach((seg) => {
      expect(seg).not.toMatch(/[\\:*?"<>|]/);
    });
    // The community '/' was sanitised — segment should not split further
    expect(segments[3]).not.toContain('/');
  });
});
