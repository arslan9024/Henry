/**
 * src/forms/validation.js
 *
 * Pure, dependency-free schema validator. Designed for Henry's document
 * editor pattern: a flat object of field values → an object of error strings.
 *
 * Why hand-rolled (not Zod):
 *   - We have ~30 validation needs across 8 templates, all simple.
 *   - Zod adds ~15KB gz; we want to keep the bundle lean.
 *   - This file is ~120 LOC and has zero runtime deps.
 *
 * Public API:
 *   - Rules: required, minLen, maxLen, pattern, email, phone, number, min, max, oneOf, custom
 *   - defineSchema(spec)   → Schema instance
 *   - schema.validateField(field, value, allValues?)  → string | null
 *   - schema.validate(values)  → { errors: {field: msg}, isValid: bool }
 *
 * Each rule is a thunk that returns a `(value, allValues) => string | null`
 * validator. `null` means "this rule passed". The first non-null wins per
 * field so errors are deterministic and the order in the schema array
 * controls priority.
 *
 * `custom(fn, message?)` is the escape hatch — gives consumers a way to
 * express cross-field rules (e.g. "endDate must be after startDate") by
 * reading the `allValues` second argument.
 */

const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

// ───────────────────────────── Rule factories ─────────────────────────────

export const required =
  (message = 'Required') =>
  (value) =>
    isEmpty(value) ? message : null;

export const minLen = (n, message) => (value) => {
  if (isEmpty(value)) return null; // pair with required() if you want both
  return String(value).length < n ? (message ?? `Must be at least ${n} characters`) : null;
};

export const maxLen = (n, message) => (value) => {
  if (isEmpty(value)) return null;
  return String(value).length > n ? (message ?? `Must be at most ${n} characters`) : null;
};

export const pattern =
  (regex, message = 'Invalid format') =>
  (value) => {
    if (isEmpty(value)) return null;
    return regex.test(String(value)) ? null : message;
  };

// Pragmatic email pattern — RFC-perfect regex is famously useless; this
// catches typos without over-rejecting real-world addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const email =
  (message = 'Enter a valid email') =>
  (value) => {
    if (isEmpty(value)) return null;
    return EMAIL_RE.test(String(value).trim()) ? null : message;
  };

// UAE-friendly: accepts +, digits, spaces, dashes, parens; min 7 digits.
const PHONE_DIGITS_RE = /\d/g;
export const phone =
  (message = 'Enter a valid phone number') =>
  (value) => {
    if (isEmpty(value)) return null;
    const digits = String(value).match(PHONE_DIGITS_RE) ?? [];
    return digits.length >= 7 ? null : message;
  };

export const number =
  (message = 'Must be a number') =>
  (value) => {
    if (isEmpty(value)) return null;
    return Number.isFinite(Number(value)) ? null : message;
  };

export const min = (n, message) => (value) => {
  if (isEmpty(value)) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null; // delegated to number()
  return num < n ? (message ?? `Must be at least ${n}`) : null;
};

export const max = (n, message) => (value) => {
  if (isEmpty(value)) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num > n ? (message ?? `Must be at most ${n}`) : null;
};

export const oneOf = (allowed, message) => (value) => {
  if (isEmpty(value)) return null;
  return allowed.includes(value) ? null : (message ?? `Must be one of: ${allowed.join(', ')}`);
};

/**
 * Escape hatch for cross-field rules. `fn` receives (value, allValues) and
 * may return a string (error) or null (pass).
 *
 *   custom((v, all) => v < all.startDate ? 'Must be after start' : null)
 */
export const custom =
  (fn, fallbackMessage = 'Invalid') =>
  (value, allValues) => {
    const result = fn(value, allValues);
    if (result === null || result === undefined || result === false) return null;
    if (result === true) return fallbackMessage;
    return String(result);
  };

// ───────────────────────────── Schema ─────────────────────────────

class Schema {
  constructor(spec) {
    this.spec = spec; // { fieldName: [rule, rule, ...] }
  }

  /**
   * Run all rules for one field. Returns the FIRST error message, or null
   * if every rule passes. Order in the rules array = priority.
   */
  validateField(field, value, allValues = {}) {
    const rules = this.spec[field];
    if (!rules) return null;
    for (const rule of rules) {
      const result = rule(value, allValues);
      if (result) return result;
    }
    return null;
  }

  /**
   * Validate every field in the schema. Returns:
   *   { errors: { field: 'message', ... }, isValid: boolean }
   * Fields without errors are omitted from `errors` so consumers can do
   * `Object.keys(errors).length` for the error count.
   */
  validate(values = {}) {
    const errors = {};
    for (const field of Object.keys(this.spec)) {
      const err = this.validateField(field, values[field], values);
      if (err) errors[field] = err;
    }
    return { errors, isValid: Object.keys(errors).length === 0 };
  }
}

export const defineSchema = (spec) => new Schema(spec);
