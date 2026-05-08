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

// ─── Groq helpers ─────────────────────────────────────────────────────────────

import {
  checkGroqAvailability,
  fetchGroqSuggestion,
  fetchGroqExtraction,
  getStoredProvider,
  storeProvider,
  getStoredGroqApiKey,
  storeGroqApiKey,
  GROQ_API_BASE,
  GROQ_DEFAULT_MODEL,
} from './llmService';

describe('getStoredProvider / storeProvider', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns "ollama" by default when nothing is stored', () => {
    expect(getStoredProvider()).toBe('ollama');
  });

  it('returns "groq" after storing "groq"', () => {
    storeProvider('groq');
    expect(getStoredProvider()).toBe('groq');
  });

  it('returns "ollama" for an unrecognised stored value', () => {
    localStorage.setItem('henry.llm.provider', 'unknown');
    expect(getStoredProvider()).toBe('ollama');
  });
});

describe('getStoredGroqApiKey / storeGroqApiKey', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns empty string when nothing is stored', () => {
    expect(getStoredGroqApiKey()).toBe('');
  });

  it('stores and retrieves a key', () => {
    storeGroqApiKey('gsk_test_key');
    expect(getStoredGroqApiKey()).toBe('gsk_test_key');
  });

  it('removes the key when empty string is passed', () => {
    storeGroqApiKey('gsk_test_key');
    storeGroqApiKey('');
    expect(getStoredGroqApiKey()).toBe('');
  });
});

describe('checkGroqAvailability', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns true when Groq responds with 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const result = await checkGroqAvailability('gsk_test_key', 500);
    expect(result).toBe(true);
  });

  it('returns false when Groq responds with 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    const result = await checkGroqAvailability('gsk_bad_key', 500);
    expect(result).toBe(false);
  });

  it('returns false when no API key is provided and none is stored', async () => {
    const result = await checkGroqAvailability('', 500);
    expect(result).toBe(false);
  });

  it('returns false when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
    const result = await checkGroqAvailability('gsk_key', 500);
    expect(result).toBe(false);
  });

  it('uses stored API key when none is passed', async () => {
    storeGroqApiKey('gsk_stored_key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const result = await checkGroqAvailability();
    expect(result).toBe(true);
    // Verify the stored key was used in the Authorization header
    const calls = vi.mocked(fetch).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [_url, init] = calls[0];
    expect(init?.headers?.Authorization).toBe('Bearer gsk_stored_key');
  });
});

describe('fetchGroqSuggestion', () => {
  const validSuggestion = {
    section: 'tenant',
    field: 'fullName',
    value: 'Ahmad Al Rashid',
    rationale: 'extracted from prompt',
  };

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const makeGroqResponse = (content) => ({
    ok: true,
    json: () => Promise.resolve({ choices: [{ message: { content } }] }),
  });

  it('returns ok:false when no API key is configured', async () => {
    const result = await fetchGroqSuggestion({ userPrompt: 'test', documentData: {} });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/api key/i);
  });

  it('returns ok:true with suggestion on valid response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeGroqResponse(JSON.stringify(validSuggestion))));
    const result = await fetchGroqSuggestion({
      userPrompt: 'Set tenant name to Ahmad',
      documentData: {},
      apiKey: 'gsk_key',
    });
    expect(result.ok).toBe(true);
    expect(result.suggestion).toMatchObject({ section: 'tenant', field: 'fullName' });
    expect(result.provider).toBe('groq');
  });

  it('returns ok:false when model returns non-JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeGroqResponse('Sorry, I cannot help.')));
    const result = await fetchGroqSuggestion({ userPrompt: 'test', documentData: {}, apiKey: 'gsk_key' });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/parseable JSON/i);
  });

  it('returns ok:false when model targets a disallowed field', async () => {
    const bad = { section: 'hackers', field: 'payload', value: 'x', rationale: '' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeGroqResponse(JSON.stringify(bad))));
    const result = await fetchGroqSuggestion({ userPrompt: 'test', documentData: {}, apiKey: 'gsk_key' });
    expect(result.ok).toBe(false);
  });

  it('returns ok:false with 401 error message for bad key', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, text: () => Promise.resolve('Unauthorized') }),
    );
    const result = await fetchGroqSuggestion({ userPrompt: 'test', documentData: {}, apiKey: 'gsk_bad' });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/invalid or expired/i);
  });

  it('returns ok:false with rate limit message on 429', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 429, text: () => Promise.resolve('') }),
    );
    const result = await fetchGroqSuggestion({ userPrompt: 'test', documentData: {}, apiKey: 'gsk_key' });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/rate limit/i);
  });

  it('returns ok:false on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));
    const result = await fetchGroqSuggestion({ userPrompt: 'test', documentData: {}, apiKey: 'gsk_key' });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/unreachable/i);
  });
});

describe('fetchGroqExtraction', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const makeGroqResponse = (content) => ({
    ok: true,
    json: () => Promise.resolve({ choices: [{ message: { content } }] }),
  });

  it('returns ok:false when extractedText is empty', async () => {
    const result = await fetchGroqExtraction({
      extractedText: '',
      fileName: 'x.pdf',
      fileKind: 'pdf',
      documentData: {},
      apiKey: 'gsk_key',
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/no text/i);
  });

  it('returns ok:false when no API key is configured', async () => {
    const result = await fetchGroqExtraction({
      extractedText: 'some text',
      fileName: 'x.pdf',
      fileKind: 'pdf',
      documentData: {},
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/api key/i);
  });

  it('returns ok:true with valid filtered suggestions', async () => {
    const payload = {
      suggestions: [
        { section: 'tenant', field: 'fullName', value: 'Sara Lee', confidence: 0.95, rationale: '' },
        { section: 'unknown', field: 'x', value: 'y', confidence: 0.99, rationale: '' }, // disallowed
        { section: 'property', field: 'unit', value: '', confidence: 0.9, rationale: '' }, // empty value
      ],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeGroqResponse(JSON.stringify(payload))));
    const result = await fetchGroqExtraction({
      extractedText: 'Lease doc text',
      fileName: 'lease.pdf',
      fileKind: 'pdf',
      documentData: {},
      apiKey: 'gsk_key',
    });
    expect(result.ok).toBe(true);
    expect(result.provider).toBe('groq');
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0]).toMatchObject({ section: 'tenant', field: 'fullName' });
    expect(result.droppedCount).toBe(2);
  });

  it('returns ok:false when model returns no suggestions array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeGroqResponse('{"section":"tenant"}')));
    const result = await fetchGroqExtraction({
      extractedText: 'text',
      fileName: 'x.pdf',
      fileKind: 'pdf',
      documentData: {},
      apiKey: 'gsk_key',
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/parseable/i);
  });

  it('returns ok:false on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const result = await fetchGroqExtraction({
      extractedText: 'text',
      fileName: 'x.pdf',
      fileKind: 'pdf',
      documentData: {},
      apiKey: 'gsk_key',
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/unreachable/i);
  });
});
