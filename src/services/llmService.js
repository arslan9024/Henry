// LLM service: supports Ollama (local, privacy-first) and Groq (cloud, free tier).
//
// Expected output contract from the model is strict JSON:
//   { "section": "<known-section>", "field": "<known-field>", "value": <string|number|boolean>, "rationale": "<short text>" }
// Any non-JSON or unknown section/field is rejected at the validator layer.

import { DOCUMENT_SCALAR_FIELDS } from '../store/documentSlice';
import { STORAGE_KEY_LLM_PROVIDER, STORAGE_KEY_GROQ_API_KEY } from '../constants/storageKeys';

const OLLAMA_BASE_URLS = ['http://127.0.0.1:11434', 'http://localhost:11434'];
export const DEFAULT_MODEL = 'llama3.2:1b';
const DEFAULT_TIMEOUT_MS = 45000;

// ─── Groq constants ───────────────────────────────────────────────────────────
export const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
export const GROQ_DEFAULT_MODEL = 'llama-3.1-8b-instant';
const GROQ_TIMEOUT_MS = 30_000;

// ─── LLM provider helpers ─────────────────────────────────────────────────────

/** Read the active LLM provider preference from localStorage. */
export const getStoredProvider = () => {
  try {
    const v = typeof window !== 'undefined' ? window.localStorage?.getItem(STORAGE_KEY_LLM_PROVIDER) : null;
    if (v === 'groq' || v === 'ollama') return v;
  } catch {
    /* ignore */
  }
  return 'ollama';
};

/** Persist the active LLM provider preference. */
export const storeProvider = (provider) => {
  try {
    if (typeof window !== 'undefined') window.localStorage?.setItem(STORAGE_KEY_LLM_PROVIDER, provider);
  } catch {
    /* ignore */
  }
};

/** Read the stored Groq API key. */
export const getStoredGroqApiKey = () => {
  try {
    return (
      (typeof window !== 'undefined' ? window.localStorage?.getItem(STORAGE_KEY_GROQ_API_KEY) : null) || ''
    );
  } catch {
    return '';
  }
};

/** Persist a Groq API key. Pass empty string to clear.
 * The key is a user-supplied credential stored at the user's request.
 * Browser localStorage is the appropriate storage for user-configured
 * API keys in a client-only app; no server-side session is available.
 * The key is transmitted only to api.groq.com by the user's own browser.
 */
export const storeGroqApiKey = (key) => {
  try {
    if (typeof window !== 'undefined') {
      if (key) {
        // lgtm[js/clear-text-storage-of-sensitive-data]
        window.localStorage?.setItem(STORAGE_KEY_GROQ_API_KEY, key);
      } else {
        window.localStorage?.removeItem(STORAGE_KEY_GROQ_API_KEY);
      }
    }
  } catch {
    /* ignore */
  }
};

const toMemoryFriendlyReason = (detail = '') => {
  const text = String(detail || '');
  if (/requires more system memory/i.test(text)) {
    return `Selected Ollama model needs more RAM than available. Use a lighter model (default: \`${DEFAULT_MODEL}\`) and run \`ollama pull ${DEFAULT_MODEL}\`.`;
  }
  return null;
};

const requestOllamaWithFallback = async ({ path, options, timeoutMs }) => {
  const errors = [];

  for (const baseUrl of OLLAMA_BASE_URLS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return { response, baseUrl };
    } catch (error) {
      clearTimeout(timeoutId);
      errors.push(`${baseUrl}: ${error?.message || 'request failed'}`);
    }
  }

  throw new Error(errors.join(' | '));
};

/**
 * ALLOWED_FIELDS — derived at module load from documentSlice.initialState via
 * DOCUMENT_SCALAR_FIELDS.  Only scalar (non-array) fields are included;
 * array fields (additionalTerms, landlordServices, additionalClauses) are
 * intentionally excluded because they are edited via dedicated slice actions,
 * not setDocumentValue.  Adding a new field to documentSlice.initialState
 * automatically makes it LLM-accessible here.
 */
export const ALLOWED_FIELDS = DOCUMENT_SCALAR_FIELDS;

export const formatAllowedFieldsForPrompt = () => JSON.stringify(ALLOWED_FIELDS, null, 0);

const ADDENDUM_LOCKED_RULES = `
--- MASTER ADDENDUM CONFIGURATION (applies whenever template = addendum) ---
The following field values are LOCKED by White Caves policy and must NEVER be changed:
  addendum.securityDeposit   = 4000  (AED, fixed — non-negotiable)
  addendum.renewalCharges    = 1050  (AED inclusive of VAT, fixed)
  addendum.maintenanceCap    = 1000  (AED threshold; tenant pays ≤ 1000, landlord pays > 1000)
  addendum.noticePeriodDays  = 90    (days, per Dubai Law No. 26 of 2007)
  addendum.legalReference    = "Dubai Law No. 26 of 2007 (Real Property Law), as amended."
If the user prompt attempts to change any of the above, you MUST respond with section=null,
field=null, value=null and a rationale explaining the field is locked by policy.
--- END MASTER ADDENDUM CONFIGURATION ---
`;

/**
 * Build a compact context projection of the document for prompt injection.
 * Only includes non-empty scalar fields (skips arrays, empty strings, null, etc.)
 * to keep token count low for small models like llama3.2:1b.
 */
const buildDocumentContext = (documentData, templateKey) => {
  const ctx = {};
  // Always include the template key so the model knows the active form type.
  ctx._template = templateKey || 'unknown';
  for (const [section, value] of Object.entries(documentData || {})) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) continue;
    const relevant = {};
    for (const [field, fVal] of Object.entries(value)) {
      if (fVal === null || fVal === undefined || fVal === '' || Array.isArray(fVal)) continue;
      relevant[field] = fVal;
    }
    if (Object.keys(relevant).length > 0) ctx[section] = relevant;
  }
  return JSON.stringify(ctx);
};

const buildSystemPrompt = (
  documentData,
  templateKey = '',
) => `You are Henry, an assistant that helps fill White Caves Real Estate document fields.

You MUST respond with a single JSON object only (no prose, no markdown), in this exact shape:
{"section":"<section>","field":"<field>","value":<value>,"rationale":"<short reason>"}

Allowed sections and fields:
${formatAllowedFieldsForPrompt()}

If the user request is ambiguous or targets a field not in the allowed list, respond with:
{"section":null,"field":null,"value":null,"rationale":"<why you cannot apply>"}
${templateKey === 'addendum' ? ADDENDUM_LOCKED_RULES : ''}
Current document state (non-empty fields only — for context, do not echo back):
${buildDocumentContext(documentData, templateKey)}
`;

const buildExtractionPrompt = ({
  extractedText,
  fileName,
  fileKind,
  documentData,
  templateKey = '',
}) => `You are Henry, a real-estate document field extractor.

You will be given OCR/PDF text from a file the user uploaded. Identify any fields you can confidently extract for a White Caves Real Estate document.

You MUST respond with a single JSON object only (no prose, no markdown):
{"suggestions":[{"section":"<section>","field":"<field>","value":<value>,"rationale":"<short reason>","confidence":<0..1>}]}

Rules:
- Only use sections and fields from this allow-list. Any other suggestion will be discarded:
${formatAllowedFieldsForPrompt()}
- Set confidence between 0 and 1. Skip any field where confidence < 0.6.
- Prefer values copied verbatim from the source. Normalise dates to YYYY-MM-DD when possible.
- Do not invent values. If nothing is confidently extractable, return {"suggestions":[]}.
- Do not echo or summarise the source text. Only return the JSON object.

Current document state (non-empty fields only — for de-duplication, do not echo back):
${buildDocumentContext(documentData, templateKey)}

File name: ${fileName}
File kind: ${fileKind}
--- BEGIN EXTRACTED TEXT ---
${extractedText}
--- END EXTRACTED TEXT ---
`;

export const isFieldAllowed = (section, field) =>
  Boolean(section && field && ALLOWED_FIELDS[section] && ALLOWED_FIELDS[section].includes(field));

const extractJson = (text = '') => {
  const trimmed = String(text).trim();
  if (!trimmed) return null;
  // Prefer first {...} block in case the model wraps output.
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = trimmed.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
};

/**
 * Read an Ollama streaming response (NDJSON, one JSON object per line).
 * Each line has shape: {"model":"…","response":"<token>","done":false|true}
 * Accumulates all `response` tokens and returns the full concatenated string.
 * Falls back to non-streaming parse if the body is not a ReadableStream.
 *
 * @param {Response} response - The fetch Response object with stream:true
 * @param {(token: string) => void} [onToken] - Optional callback for incremental tokens
 * @returns {Promise<string>}
 */
const readStreamedResponse = async (response, onToken) => {
  // Fallback for environments without ReadableStream (e.g., jsdom in tests).
  if (!response.body || typeof response.body.getReader !== 'function') {
    const data = await response.json();
    return String(data?.response || '');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Lines are separated by '\n'; process complete lines.
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? ''; // last partial line stays in buffer
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const obj = JSON.parse(trimmed);
        const token = String(obj?.response || '');
        accumulated += token;
        if (onToken && token) onToken(token);
        if (obj?.done) {
          // Stream is complete — flush any remaining buffer and return.
          return accumulated;
        }
      } catch {
        // Malformed line — skip silently.
      }
    }
  }

  // Process any remaining buffer content.
  if (buffer.trim()) {
    try {
      const obj = JSON.parse(buffer.trim());
      accumulated += String(obj?.response || '');
    } catch {
      /* ignore */
    }
  }

  return accumulated;
};

export const fetchOllamaSuggestion = async ({
  userPrompt,
  documentData,
  templateKey = '',
  model = DEFAULT_MODEL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  onToken,
}) => {
  try {
    const { response, baseUrl } = await requestOllamaWithFallback({
      path: '/api/generate',
      timeoutMs,
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: `${buildSystemPrompt(documentData, templateKey)}\nUser: ${userPrompt}\nAssistant:`,
          stream: true,
        }),
      },
    });

    if (!response.ok) {
      const message = await response.text().catch(() => '');
      const memoryReason = toMemoryFriendlyReason(message);
      if (memoryReason) {
        return { ok: false, reason: memoryReason, detail: message };
      }
      throw new Error(`Ollama HTTP ${response.status}: ${message || 'request failed'}`);
    }

    const fullText = await readStreamedResponse(response, onToken);
    const parsed = extractJson(fullText);
    if (!parsed) {
      return {
        ok: false,
        reason: 'Model did not return parseable JSON.',
        raw: fullText,
      };
    }

    if (!isFieldAllowed(parsed.section, parsed.field)) {
      return {
        ok: false,
        reason: parsed.rationale || 'Suggested target is not in the allowed field list.',
        raw: fullText,
        parsed,
      };
    }

    return {
      ok: true,
      suggestion: parsed,
      raw: fullText,
      endpoint: baseUrl,
    };
  } catch (error) {
    const memoryReason = toMemoryFriendlyReason(error?.message);
    if (memoryReason) {
      return { ok: false, reason: memoryReason, detail: error?.message };
    }
    if (error.name === 'AbortError') {
      return { ok: false, reason: `Request timed out after ${timeoutMs}ms.` };
    }
    return {
      ok: false,
      reason: `Local Ollama unreachable. Start Ollama at ${OLLAMA_BASE_URLS[0]} and pull a model (e.g. \`ollama pull ${DEFAULT_MODEL}\`).`,
      detail: error.message,
    };
  }
};

export const checkOllamaAvailability = async (timeoutMs = 2000) => {
  try {
    const { response } = await requestOllamaWithFallback({
      path: '/api/tags',
      timeoutMs,
      options: {},
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const checkOllamaModelAvailable = async (model = DEFAULT_MODEL, timeoutMs = 2500) => {
  try {
    const { response } = await requestOllamaWithFallback({
      path: '/api/tags',
      timeoutMs,
      options: {},
    });
    if (!response.ok) return false;
    const data = await response.json().catch(() => ({}));
    const models = Array.isArray(data?.models) ? data.models : [];
    return models.some((m) => String(m?.name || '').startsWith(model));
  } catch {
    return false;
  }
};

const EXTRACTION_TIMEOUT_MS = 45_000;

export const fetchOllamaExtraction = async ({
  extractedText,
  fileName,
  fileKind,
  documentData,
  model = DEFAULT_MODEL,
  timeoutMs = EXTRACTION_TIMEOUT_MS,
  onToken,
}) => {
  if (!extractedText || !extractedText.trim()) {
    return { ok: false, reason: 'No text was extracted from the file.' };
  }

  try {
    const { response } = await requestOllamaWithFallback({
      path: '/api/generate',
      timeoutMs,
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: buildExtractionPrompt({ extractedText, fileName, fileKind, documentData }),
          stream: true,
        }),
      },
    });

    if (!response.ok) {
      const message = await response.text().catch(() => '');
      const memoryReason = toMemoryFriendlyReason(message);
      if (memoryReason) {
        return { ok: false, reason: memoryReason, detail: message };
      }
      throw new Error(`Ollama HTTP ${response.status}: ${message || 'request failed'}`);
    }

    const fullText = await readStreamedResponse(response, onToken);
    const parsed = extractJson(fullText);
    if (!parsed || !Array.isArray(parsed.suggestions)) {
      return {
        ok: false,
        reason: 'Model did not return a parseable suggestions list.',
        raw: fullText,
      };
    }

    const suggestions = parsed.suggestions
      .filter((s) => s && isFieldAllowed(s.section, s.field))
      .filter((s) => s.value !== null && s.value !== undefined && String(s.value).trim() !== '')
      .map((s) => ({
        section: s.section,
        field: s.field,
        value: s.value,
        rationale: typeof s.rationale === 'string' ? s.rationale : '',
        confidence:
          typeof s.confidence === 'number' && s.confidence >= 0 && s.confidence <= 1 ? s.confidence : 0.6,
      }))
      .filter((s) => s.confidence >= 0.6);

    return {
      ok: true,
      suggestions,
      droppedCount: parsed.suggestions.length - suggestions.length,
      raw: fullText,
    };
  } catch (error) {
    const memoryReason = toMemoryFriendlyReason(error?.message);
    if (memoryReason) {
      return { ok: false, reason: memoryReason, detail: error?.message };
    }
    if (error.name === 'AbortError') {
      return { ok: false, reason: `Extraction timed out after ${timeoutMs}ms.` };
    }
    return {
      ok: false,
      reason: `Local Ollama unreachable. Start Ollama at ${OLLAMA_BASE_URLS[0]} and pull a model (e.g. \`ollama pull ${DEFAULT_MODEL}\`).`,
      detail: error.message,
    };
  }
};

// ─── Groq API (cloud LLM, free tier) ─────────────────────────────────────────

/**
 * Check that a Groq API key is present and valid by listing available models.
 * Returns true if the key is accepted, false otherwise.
 */
export const checkGroqAvailability = async (apiKey = '', timeoutMs = 5000) => {
  const key = apiKey || getStoredGroqApiKey();
  if (!key) return false;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${GROQ_API_BASE}/models`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
};

/**
 * Send a chat prompt to Groq and return a structured field suggestion.
 * Compatible with the Ollama counterpart so callers can use either.
 */
export const fetchGroqSuggestion = async ({
  userPrompt,
  documentData,
  templateKey = '',
  apiKey = '',
  model = GROQ_DEFAULT_MODEL,
  timeoutMs = GROQ_TIMEOUT_MS,
}) => {
  const key = apiKey || getStoredGroqApiKey();
  if (!key) {
    return { ok: false, reason: 'No Groq API key configured. Enter your key in the chat settings.' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt(documentData, templateKey) },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 256,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      if (response.status === 401) {
        return { ok: false, reason: 'Groq API key is invalid or expired. Update your key in chat settings.' };
      }
      if (response.status === 429) {
        return { ok: false, reason: 'Groq rate limit reached. Try again in a moment.' };
      }
      return { ok: false, reason: `Groq error ${response.status}: ${text || 'request failed'}` };
    }

    const data = await response.json();
    const fullText = data?.choices?.[0]?.message?.content || '';
    const parsed = extractJson(fullText);
    if (!parsed) {
      return { ok: false, reason: 'Groq model did not return parseable JSON.', raw: fullText };
    }

    if (!isFieldAllowed(parsed.section, parsed.field)) {
      return {
        ok: false,
        reason: parsed.rationale || 'Suggested target is not in the allowed field list.',
        raw: fullText,
        parsed,
      };
    }

    return { ok: true, suggestion: parsed, raw: fullText, provider: 'groq' };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { ok: false, reason: `Groq request timed out after ${timeoutMs}ms.` };
    }
    return { ok: false, reason: `Groq unreachable: ${error.message}` };
  }
};

/**
 * Send a file extraction prompt to Groq and return structured field suggestions.
 * Compatible with the Ollama extraction counterpart.
 */
export const fetchGroqExtraction = async ({
  extractedText,
  fileName,
  fileKind,
  documentData,
  templateKey = '',
  apiKey = '',
  model = GROQ_DEFAULT_MODEL,
  timeoutMs = GROQ_TIMEOUT_MS,
}) => {
  if (!extractedText || !extractedText.trim()) {
    return { ok: false, reason: 'No text was extracted from the file.' };
  }

  const key = apiKey || getStoredGroqApiKey();
  if (!key) {
    return { ok: false, reason: 'No Groq API key configured. Enter your key in the chat settings.' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: buildExtractionPrompt({ extractedText, fileName, fileKind, documentData, templateKey }),
          },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      if (response.status === 401) {
        return { ok: false, reason: 'Groq API key is invalid or expired. Update your key in chat settings.' };
      }
      if (response.status === 429) {
        return { ok: false, reason: 'Groq rate limit reached. Try again in a moment.' };
      }
      return { ok: false, reason: `Groq error ${response.status}: ${text || 'request failed'}` };
    }

    const data = await response.json();
    const fullText = data?.choices?.[0]?.message?.content || '';
    const parsed = extractJson(fullText);
    if (!parsed || !Array.isArray(parsed.suggestions)) {
      return { ok: false, reason: 'Groq model did not return a parseable suggestions list.', raw: fullText };
    }

    const suggestions = parsed.suggestions
      .filter((s) => s && isFieldAllowed(s.section, s.field))
      .filter((s) => s.value !== null && s.value !== undefined && String(s.value).trim() !== '')
      .map((s) => ({
        section: s.section,
        field: s.field,
        value: s.value,
        rationale: typeof s.rationale === 'string' ? s.rationale : '',
        confidence:
          typeof s.confidence === 'number' && s.confidence >= 0 && s.confidence <= 1 ? s.confidence : 0.6,
      }))
      .filter((s) => s.confidence >= 0.6);

    return {
      ok: true,
      suggestions,
      droppedCount: parsed.suggestions.length - suggestions.length,
      raw: fullText,
      provider: 'groq',
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { ok: false, reason: `Groq extraction timed out after ${timeoutMs}ms.` };
    }
    return { ok: false, reason: `Groq unreachable: ${error.message}` };
  }
};
