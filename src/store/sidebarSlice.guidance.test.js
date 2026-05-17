/**
 * sidebarSlice.guidance.test.js
 *
 * Validates the structure and content of the realEstateGuidance.json data
 * loaded into the sidebar slice.
 *
 * These tests act as a data-contract suite — if someone accidentally
 * corrupts or incompletely edits the guidance JSON, these tests will
 * catch the regression before it reaches production.
 */
import { describe, it, expect } from 'vitest';
import reducer from './sidebarSlice';
import guidance from '../data/realEstateGuidance.json';

const state = reducer(undefined, { type: '@@INIT' });
const g = state.guidance;

const EXPECTED_TEMPLATE_KEYS = [
  'addendum',
  'booking',
  'bookingGov',
  'invoice',
  'keyHandover',
  'offer',
  'tenancy',
  'viewing',
];

// ── Top-level structure ───────────────────────────────────────────────────────

describe('sidebarSlice.guidance — top-level structure', () => {
  it('has a "common" key at the root', () => {
    expect(g).toHaveProperty('common');
  });

  it('has a "byTemplate" key at the root', () => {
    expect(g).toHaveProperty('byTemplate');
  });

  it('contains exactly the expected top-level keys', () => {
    const keys = Object.keys(g).sort();
    expect(keys).toEqual(['byTemplate', 'common'].sort());
  });

  it('loaded guidance matches the raw JSON import', () => {
    expect(g).toEqual(guidance);
  });
});

// ── common section ────────────────────────────────────────────────────────────

describe('sidebarSlice.guidance — common section', () => {
  it('common.highlights is an array', () => {
    expect(Array.isArray(g.common.highlights)).toBe(true);
  });

  it('common.highlights has at least one entry', () => {
    expect(g.common.highlights.length).toBeGreaterThan(0);
  });

  it('every common.highlights entry is a non-empty string', () => {
    for (const h of g.common.highlights) {
      expect(typeof h).toBe('string');
      expect(h.trim().length).toBeGreaterThan(0);
    }
  });

  it('common.articles is an array', () => {
    expect(Array.isArray(g.common.articles)).toBe(true);
  });

  it('common.articles has at least one entry', () => {
    expect(g.common.articles.length).toBeGreaterThan(0);
  });

  it('every common.articles entry has a "title" string', () => {
    for (const a of g.common.articles) {
      expect(typeof a.title).toBe('string');
      expect(a.title.trim().length).toBeGreaterThan(0);
    }
  });

  it('every common.articles entry has a "text" string', () => {
    for (const a of g.common.articles) {
      expect(typeof a.text).toBe('string');
      expect(a.text.trim().length).toBeGreaterThan(0);
    }
  });

  it('common.articles includes an article about Henry', () => {
    const aboutHenry = g.common.articles.find((a) => a.title.includes('Henry'));
    expect(aboutHenry).toBeDefined();
  });

  it('common.articles include DLD/RERA reference', () => {
    const dldArticle = g.common.articles.find((a) => a.text.includes('DLD') || a.title.includes('DLD'));
    expect(dldArticle).toBeDefined();
  });
});

// ── byTemplate — all expected keys present ────────────────────────────────────

describe('sidebarSlice.guidance — byTemplate keys', () => {
  it.each(EXPECTED_TEMPLATE_KEYS)('byTemplate has "%s" key', (key) => {
    expect(g.byTemplate).toHaveProperty(key);
  });

  it('byTemplate has exactly 8 template keys', () => {
    expect(Object.keys(g.byTemplate)).toHaveLength(EXPECTED_TEMPLATE_KEYS.length);
  });
});

// ── byTemplate — highlights structure per template ────────────────────────────

describe('sidebarSlice.guidance — byTemplate[*].highlights', () => {
  it.each(EXPECTED_TEMPLATE_KEYS)('%s has a highlights array', (key) => {
    expect(Array.isArray(g.byTemplate[key].highlights)).toBe(true);
  });

  it.each(EXPECTED_TEMPLATE_KEYS)('%s.highlights has at least one item', (key) => {
    expect(g.byTemplate[key].highlights.length).toBeGreaterThan(0);
  });

  it.each(EXPECTED_TEMPLATE_KEYS)('%s.highlights entries are non-empty strings', (key) => {
    for (const h of g.byTemplate[key].highlights) {
      expect(typeof h).toBe('string');
      expect(h.trim().length).toBeGreaterThan(0);
    }
  });
});

// ── byTemplate — articles structure per template ──────────────────────────────

describe('sidebarSlice.guidance — byTemplate[*].articles', () => {
  it.each(EXPECTED_TEMPLATE_KEYS)('%s has an articles array', (key) => {
    expect(Array.isArray(g.byTemplate[key].articles)).toBe(true);
  });

  it.each(EXPECTED_TEMPLATE_KEYS)('%s.articles has at least one item', (key) => {
    expect(g.byTemplate[key].articles.length).toBeGreaterThan(0);
  });

  it.each(EXPECTED_TEMPLATE_KEYS)('%s.articles entries have title+text', (key) => {
    for (const a of g.byTemplate[key].articles) {
      expect(typeof a.title).toBe('string');
      expect(a.title.trim().length).toBeGreaterThan(0);
      expect(typeof a.text).toBe('string');
      expect(a.text.trim().length).toBeGreaterThan(0);
    }
  });
});

// ── viewing-specific content ──────────────────────────────────────────────────

describe('sidebarSlice.guidance — viewing highlights content', () => {
  it('viewing.highlights mention access or viewing', () => {
    const combined = g.byTemplate.viewing.highlights.join(' ').toLowerCase();
    expect(combined.length).toBeGreaterThan(0);
    // At least one of these relevant terms should appear
    const hasRelevantTerm = ['view', 'access', 'slot', 'prospect', 'client'].some((t) =>
      combined.includes(t),
    );
    expect(hasRelevantTerm).toBe(true);
  });
});

// ── tenancy-specific content ─────────────────────────────────────────────────

describe('sidebarSlice.guidance — tenancy highlights content', () => {
  it('tenancy highlights are non-trivial (each > 20 chars)', () => {
    for (const h of g.byTemplate.tenancy.highlights) {
      expect(h.length).toBeGreaterThan(20);
    }
  });
});

// ── data freshness: lastUpdated ───────────────────────────────────────────────

describe('sidebarSlice.guidance — lastUpdated baseline', () => {
  it('initial lastUpdated matches YYYY-MM-DD format', () => {
    expect(state.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('initial lastUpdated is a plausible recent date (after 2025-01-01)', () => {
    const d = new Date(state.lastUpdated);
    expect(d.getTime()).toBeGreaterThan(new Date('2025-01-01').getTime());
  });
});
