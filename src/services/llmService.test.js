/**
 * llmService — unit tests
 *
 * Covers:
 *   - DEFAULT_MODEL constant
 *   - ALLOWED_FIELDS shape (all sections present, all are non-empty arrays)
 *   - formatAllowedFieldsForPrompt() produces valid JSON
 *   - isFieldAllowed() — known + unknown combinations
 *   - fetchOllamaSuggestion() — mocked fetch scenarios
 *   - checkOllamaAvailability() — mocked fetch
 *   - checkOllamaModelAvailable() — mocked fetch
 *   - fetchOllamaExtraction() — mocked fetch scenarios
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_MODEL,
  ALLOWED_FIELDS,
  formatAllowedFieldsForPrompt,
  isFieldAllowed,
  fetchOllamaSuggestion,
  checkOllamaAvailability,
  checkOllamaModelAvailable,
  fetchOllamaExtraction,
} from './llmService';

// ── helpers ───────────────────────────────────────────────────────────────────

const mockFetch = (responseBody, { ok = true, status = 200 } = {}) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      text: async () => (typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)),
      json: async () => (typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody),
    }),
  );
};

const mockFetchFail = (message = 'connection refused') => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(message)));
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

// ── constants ─────────────────────────────────────────────────────────────────

describe('DEFAULT_MODEL', () => {
  it('is the expected lightweight model identifier', () => {
    expect(DEFAULT_MODEL).toBe('llama3.2:1b');
  });
});

// ── ALLOWED_FIELDS ────────────────────────────────────────────────────────────

describe('ALLOWED_FIELDS — shape validation', () => {
  const EXPECTED_SECTIONS = [
    'company',
    'property',
    'tenant',
    'landlord',
    'broker',
    'viewing',
    'payments',
    'renewal',
    'occupancy',
    'eviction',
    'tenancy',
    'addendum',
    'salaryCertificate',
  ];

  it('exports ALLOWED_FIELDS as a plain object', () => {
    expect(typeof ALLOWED_FIELDS).toBe('object');
    expect(ALLOWED_FIELDS).not.toBeNull();
  });

  EXPECTED_SECTIONS.forEach((section) => {
    it(`section "${section}" is a non-empty array`, () => {
      expect(Array.isArray(ALLOWED_FIELDS[section])).toBe(true);
      expect(ALLOWED_FIELDS[section].length).toBeGreaterThan(0);
    });
  });

  it('all field values within every section are strings', () => {
    Object.entries(ALLOWED_FIELDS).forEach(([section, fields]) => {
      fields.forEach((f) => expect(typeof f, `${section}.${f} is not a string`).toBe('string'));
    });
  });

  it('property section includes makaniNo and dewaPremisesNo', () => {
    expect(ALLOWED_FIELDS.property).toContain('makaniNo');
    expect(ALLOWED_FIELDS.property).toContain('dewaPremisesNo');
  });

  it('tenant section includes emiratesId and passportNo', () => {
    expect(ALLOWED_FIELDS.tenant).toContain('emiratesId');
    expect(ALLOWED_FIELDS.tenant).toContain('passportNo');
  });

  it('addendum section includes locked policy fields', () => {
    ['securityDeposit', 'renewalCharges', 'maintenanceCap', 'noticePeriodDays', 'legalReference'].forEach(
      (f) => expect(ALLOWED_FIELDS.addendum).toContain(f),
    );
  });
});

// ── formatAllowedFieldsForPrompt ──────────────────────────────────────────────

describe('formatAllowedFieldsForPrompt', () => {
  it('returns a string', () => {
    expect(typeof formatAllowedFieldsForPrompt()).toBe('string');
  });

  it('produces valid JSON', () => {
    expect(() => JSON.parse(formatAllowedFieldsForPrompt())).not.toThrow();
  });

  it('parsed result includes "tenant" and "property" sections', () => {
    const parsed = JSON.parse(formatAllowedFieldsForPrompt());
    expect(parsed.tenant).toBeDefined();
    expect(parsed.property).toBeDefined();
  });
});

// ── isFieldAllowed ────────────────────────────────────────────────────────────

describe('isFieldAllowed', () => {
  it('returns true for known section + field', () => {
    expect(isFieldAllowed('tenant', 'emiratesId')).toBe(true);
    expect(isFieldAllowed('property', 'referenceNo')).toBe(true);
    expect(isFieldAllowed('payments', 'annualRent')).toBe(true);
  });

  it('returns false for unknown section', () => {
    expect(isFieldAllowed('invoice', 'amount')).toBe(false);
  });

  it('returns false for unknown field within a known section', () => {
    expect(isFieldAllowed('tenant', 'socialSecurityNo')).toBe(false);
  });

  it('returns false when section is null or empty', () => {
    expect(isFieldAllowed(null, 'emiratesId')).toBe(false);
    expect(isFieldAllowed('', 'emiratesId')).toBe(false);
  });

  it('returns false when field is null or empty', () => {
    expect(isFieldAllowed('tenant', null)).toBe(false);
    expect(isFieldAllowed('tenant', '')).toBe(false);
  });
});

// ── fetchOllamaSuggestion ─────────────────────────────────────────────────────

describe('fetchOllamaSuggestion — mocked fetch', () => {
  const baseArgs = {
    userPrompt: 'Set tenant name to Ahmed',
    documentData: {},
    templateKey: 'booking',
  };

  it('returns ok:true with suggestion when model responds with allowed field', async () => {
    mockFetch({
      response: JSON.stringify({
        section: 'tenant',
        field: 'fullName',
        value: 'Ahmed Al Mansouri',
        rationale: 'User requested',
      }),
    });
    const r = await fetchOllamaSuggestion(baseArgs);
    expect(r.ok).toBe(true);
    expect(r.suggestion.section).toBe('tenant');
    expect(r.suggestion.field).toBe('fullName');
    expect(r.suggestion.value).toBe('Ahmed Al Mansouri');
  });

  it('returns ok:false when field is not in the allow-list', async () => {
    mockFetch({
      response: JSON.stringify({
        section: 'tenant',
        field: 'bankAccountNumber',
        value: '12345',
        rationale: 'Not allowed',
      }),
    });
    const r = await fetchOllamaSuggestion(baseArgs);
    expect(r.ok).toBe(false);
  });

  it('returns ok:false when model returns non-JSON text', async () => {
    mockFetch({ response: 'Sorry, I cannot help with that.' });
    const r = await fetchOllamaSuggestion(baseArgs);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/parseable JSON/i);
  });

  it('returns ok:false with "unreachable" reason when fetch throws', async () => {
    mockFetchFail('connection refused');
    const r = await fetchOllamaSuggestion(baseArgs);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/unreachable|ollama/i);
  });

  it('returns ok:false when HTTP status is non-200', async () => {
    mockFetch('Internal Server Error', { ok: false, status: 500 });
    const r = await fetchOllamaSuggestion(baseArgs);
    expect(r.ok).toBe(false);
  });

  it('includes memory-friendly message when detail contains RAM hint', async () => {
    mockFetch('requires more system memory', { ok: false, status: 500 });
    const r = await fetchOllamaSuggestion(baseArgs);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/ram|memory|lighter model/i);
  });

  it('returns section:null / field:null null-suggestion as ok:false (unknown target)', async () => {
    mockFetch({
      response: JSON.stringify({
        section: null,
        field: null,
        value: null,
        rationale: 'Field is locked by policy.',
      }),
    });
    const r = await fetchOllamaSuggestion({ ...baseArgs, templateKey: 'addendum' });
    expect(r.ok).toBe(false);
  });
});

// ── checkOllamaAvailability ───────────────────────────────────────────────────

describe('checkOllamaAvailability', () => {
  it('returns true when /api/tags responds 200 OK', async () => {
    mockFetch({ models: [] });
    expect(await checkOllamaAvailability()).toBe(true);
  });

  it('returns false when fetch throws (Ollama not running)', async () => {
    mockFetchFail();
    expect(await checkOllamaAvailability()).toBe(false);
  });

  it('returns false when response is not ok', async () => {
    mockFetch('', { ok: false, status: 503 });
    expect(await checkOllamaAvailability()).toBe(false);
  });
});

// ── checkOllamaModelAvailable ─────────────────────────────────────────────────

describe('checkOllamaModelAvailable', () => {
  it('returns true when the model name is in the tags list', async () => {
    mockFetch({ models: [{ name: 'llama3.2:1b' }, { name: 'mistral:7b' }] });
    expect(await checkOllamaModelAvailable('llama3.2:1b')).toBe(true);
  });

  it('returns true for a prefix match (e.g. llama3.2)', async () => {
    mockFetch({ models: [{ name: 'llama3.2:1b-instruct' }] });
    expect(await checkOllamaModelAvailable('llama3.2')).toBe(true);
  });

  it('returns false when the model is not in the list', async () => {
    mockFetch({ models: [{ name: 'mistral:7b' }] });
    expect(await checkOllamaModelAvailable('llama3.2:1b')).toBe(false);
  });

  it('returns false when fetch throws', async () => {
    mockFetchFail();
    expect(await checkOllamaModelAvailable()).toBe(false);
  });

  it('returns false when models list is missing', async () => {
    mockFetch({ models: null });
    expect(await checkOllamaModelAvailable()).toBe(false);
  });
});

// ── fetchOllamaExtraction ─────────────────────────────────────────────────────

describe('fetchOllamaExtraction', () => {
  const baseExtractArgs = {
    extractedText: 'Name: SARA KHALID\nEmirates ID: 784-0012-3456789-1',
    fileName: 'emirates_id.pdf',
    fileKind: 'pdf',
    documentData: {},
  };

  it('returns ok:false immediately when extractedText is empty', async () => {
    const r = await fetchOllamaExtraction({ ...baseExtractArgs, extractedText: '' });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/no text/i);
  });

  it('returns ok:false immediately when extractedText is whitespace only', async () => {
    const r = await fetchOllamaExtraction({ ...baseExtractArgs, extractedText: '   ' });
    expect(r.ok).toBe(false);
  });

  it('returns ok:true with allowed suggestions filtered from model response', async () => {
    mockFetch({
      response: JSON.stringify({
        suggestions: [
          {
            section: 'tenant',
            field: 'fullName',
            value: 'SARA KHALID',
            rationale: 'From card',
            confidence: 0.9,
          },
          {
            section: 'tenant',
            field: 'emiratesId',
            value: '784-0012-3456789-1',
            rationale: 'Parsed',
            confidence: 0.95,
          },
        ],
      }),
    });
    const r = await fetchOllamaExtraction(baseExtractArgs);
    expect(r.ok).toBe(true);
    expect(r.suggestions).toHaveLength(2);
    expect(r.suggestions[0].section).toBe('tenant');
  });

  it('drops suggestions for disallowed fields', async () => {
    mockFetch({
      response: JSON.stringify({
        suggestions: [
          { section: 'tenant', field: 'fullName', value: 'SARA KHALID', rationale: '', confidence: 0.9 },
          { section: 'tenant', field: 'secretPin', value: '1234', rationale: '', confidence: 0.99 },
        ],
      }),
    });
    const r = await fetchOllamaExtraction(baseExtractArgs);
    expect(r.ok).toBe(true);
    expect(r.suggestions).toHaveLength(1);
    expect(r.droppedCount).toBe(1);
  });

  it('drops suggestions with confidence below 0.6', async () => {
    mockFetch({
      response: JSON.stringify({
        suggestions: [
          { section: 'tenant', field: 'fullName', value: 'Unknown', rationale: '', confidence: 0.4 },
        ],
      }),
    });
    const r = await fetchOllamaExtraction(baseExtractArgs);
    expect(r.ok).toBe(true);
    expect(r.suggestions).toHaveLength(0);
  });

  it('returns ok:false when model returns non-JSON text', async () => {
    mockFetch({ response: 'I found nothing useful.' });
    const r = await fetchOllamaExtraction(baseExtractArgs);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/parseable/i);
  });

  it('returns ok:false when fetch throws (Ollama unreachable)', async () => {
    mockFetchFail();
    const r = await fetchOllamaExtraction(baseExtractArgs);
    expect(r.ok).toBe(false);
  });
});
