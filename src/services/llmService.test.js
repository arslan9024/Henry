/**
 * llmService.test.js — Unit tests for the client-side LLM service layer.
 *
 * Tests cover pure logic functions and network calls (fetch mocked via vi.stubGlobal).
 * No browser environment required beyond what jsdom provides.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ALLOWED_FIELDS,
  isFieldAllowed,
  formatAllowedFieldsForPrompt,
  fetchOllamaSuggestion,
  fetchOllamaExtraction,
  checkOllamaAvailability,
  checkOllamaModelAvailable,
} from './llmService';

// ─── isFieldAllowed ───────────────────────────────────────────────────────────

describe('isFieldAllowed', () => {
  it('returns true for a known section+field pair', () => {
    expect(isFieldAllowed('tenant', 'fullName')).toBe(true);
    expect(isFieldAllowed('property', 'unit')).toBe(true);
    expect(isFieldAllowed('broker', 'orn')).toBe(true);
  });

  it('returns false for an unknown field within a valid section', () => {
    expect(isFieldAllowed('tenant', 'shoeSize')).toBe(false);
  });

  it('returns false for an unknown section', () => {
    expect(isFieldAllowed('marketing', 'campaignBudget')).toBe(false);
  });

  it('returns false when section or field is null/undefined/empty', () => {
    expect(isFieldAllowed(null, 'fullName')).toBe(false);
    expect(isFieldAllowed('tenant', null)).toBe(false);
    expect(isFieldAllowed('', 'fullName')).toBe(false);
    expect(isFieldAllowed('tenant', '')).toBe(false);
    expect(isFieldAllowed(undefined, undefined)).toBe(false);
  });

  it('covers every section listed in ALLOWED_FIELDS', () => {
    for (const [section, fields] of Object.entries(ALLOWED_FIELDS)) {
      for (const field of fields) {
        expect(isFieldAllowed(section, field), `${section}.${field}`).toBe(true);
      }
    }
  });
});

// ─── formatAllowedFieldsForPrompt ─────────────────────────────────────────────

describe('formatAllowedFieldsForPrompt', () => {
  it('returns a non-empty string', () => {
    const result = formatAllowedFieldsForPrompt();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(10);
  });

  it('contains every section key from ALLOWED_FIELDS', () => {
    const result = formatAllowedFieldsForPrompt();
    for (const section of Object.keys(ALLOWED_FIELDS)) {
      expect(result).toContain(section);
    }
  });

  it('is valid JSON', () => {
    expect(() => JSON.parse(formatAllowedFieldsForPrompt())).not.toThrow();
  });
});

// ─── checkOllamaAvailability ──────────────────────────────────────────────────

describe('checkOllamaAvailability', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns true when Ollama responds with 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const result = await checkOllamaAvailability(500);
    expect(result).toBe(true);
  });

  it('returns false when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    const result = await checkOllamaAvailability(500);
    expect(result).toBe(false);
  });

  it('returns false when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const result = await checkOllamaAvailability(500);
    expect(result).toBe(false);
  });
});

// ─── checkOllamaModelAvailable ────────────────────────────────────────────────

describe('checkOllamaModelAvailable', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns true when model name appears in models list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ models: [{ name: 'llama3.2:1b' }] }),
      }),
    );
    const result = await checkOllamaModelAvailable('llama3.2:1b', 500);
    expect(result).toBe(true);
  });

  it('returns false when model is missing from list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ models: [{ name: 'mistral:7b' }] }),
      }),
    );
    const result = await checkOllamaModelAvailable('llama3.2:1b', 500);
    expect(result).toBe(false);
  });

  it('returns false when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const result = await checkOllamaModelAvailable('llama3.2:1b', 500);
    expect(result).toBe(false);
  });

  it('returns false when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const result = await checkOllamaModelAvailable('llama3.2:1b', 500);
    expect(result).toBe(false);
  });
});

// ─── fetchOllamaSuggestion ────────────────────────────────────────────────────

describe('fetchOllamaSuggestion', () => {
  const validResponse = {
    section: 'tenant',
    field: 'fullName',
    value: 'Ahmed Al Mansouri',
    rationale: 'From user prompt',
  };

  afterEach(() => vi.restoreAllMocks());

  it('returns ok:true with suggestion when model returns valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: JSON.stringify(validResponse) }),
      }),
    );
    const result = await fetchOllamaSuggestion({
      userPrompt: 'Set tenant name to Ahmed',
      documentData: {},
    });
    expect(result.ok).toBe(true);
    expect(result.suggestion).toMatchObject({ section: 'tenant', field: 'fullName' });
  });

  it('returns ok:false when model response is not parseable JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: 'Sure, I can help with that!' }),
      }),
    );
    const result = await fetchOllamaSuggestion({ userPrompt: 'help', documentData: {} });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/parseable JSON/i);
  });

  it('returns ok:false when model targets a disallowed field', async () => {
    const badResponse = { section: 'marketing', field: 'budget', value: 5000, rationale: 'n/a' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: JSON.stringify(badResponse) }),
      }),
    );
    const result = await fetchOllamaSuggestion({ userPrompt: 'set budget', documentData: {} });
    expect(result.ok).toBe(false);
  });

  it('returns ok:false on HTTP error from Ollama', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      }),
    );
    const result = await fetchOllamaSuggestion({ userPrompt: 'test', documentData: {} });
    expect(result.ok).toBe(false);
  });

  it('returns ok:false when fetch throws (network failure)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    const result = await fetchOllamaSuggestion({ userPrompt: 'test', documentData: {} });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/unreachable/i);
  });

  it('returns memory-friendly reason when Ollama reports OOM error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('error: requires more system memory than is available'),
      }),
    );
    const result = await fetchOllamaSuggestion({ userPrompt: 'test', documentData: {} });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/RAM/i);
  });

  it('handles JSON wrapped in markdown code fences (extractJson fallback)', async () => {
    const wrapped = `Here is the answer:\n\`\`\`json\n${JSON.stringify(validResponse)}\n\`\`\``;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: wrapped }),
      }),
    );
    const result = await fetchOllamaSuggestion({ userPrompt: 'set tenant name', documentData: {} });
    // extractJson finds first { ... } block even inside markdown
    expect(result.ok).toBe(true);
  });
});

// ─── fetchOllamaExtraction ────────────────────────────────────────────────────

describe('fetchOllamaExtraction', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns ok:false immediately when extractedText is empty', async () => {
    const result = await fetchOllamaExtraction({
      extractedText: '',
      fileName: 'test.pdf',
      fileKind: 'pdf',
      documentData: {},
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/no text/i);
  });

  it('returns ok:true with filtered suggestions on success', async () => {
    const mockSuggestions = {
      suggestions: [
        { section: 'tenant', field: 'fullName', value: 'Sara Ahmed', confidence: 0.9, rationale: 'from pdf' },
        { section: 'property', field: 'unit', value: '401', confidence: 0.8, rationale: 'unit number' },
        // Low confidence — should be filtered out
        { section: 'tenant', field: 'email', value: '', confidence: 0.3, rationale: 'low' },
        // Disallowed field — should be filtered out
        { section: 'unknown', field: 'phantom', value: 'x', confidence: 0.95, rationale: 'bad' },
      ],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: JSON.stringify(mockSuggestions) }),
      }),
    );
    const result = await fetchOllamaExtraction({
      extractedText: 'Some text from a lease document.',
      fileName: 'lease.pdf',
      fileKind: 'pdf',
      documentData: {},
    });
    expect(result.ok).toBe(true);
    expect(result.suggestions.every((s) => isFieldAllowed(s.section, s.field))).toBe(true);
    // Empty value + disallowed filtered out
    const fields = result.suggestions.map((s) => `${s.section}.${s.field}`);
    expect(fields).toContain('tenant.fullName');
    expect(fields).toContain('property.unit');
    expect(fields).not.toContain('unknown.phantom');
  });

  it('returns ok:false when model returns no suggestions array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: '{"section":"tenant"}' }),
      }),
    );
    const result = await fetchOllamaExtraction({
      extractedText: 'text',
      fileName: 'file.pdf',
      fileKind: 'pdf',
      documentData: {},
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/parseable/i);
  });

  it('returns ok:false on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    const result = await fetchOllamaExtraction({
      extractedText: 'some text',
      fileName: 'file.pdf',
      fileKind: 'pdf',
      documentData: {},
    });
    expect(result.ok).toBe(false);
  });
});
