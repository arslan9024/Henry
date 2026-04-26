import { describe, it, expect } from 'vitest';
import {
  defineSchema,
  required,
  minLen,
  maxLen,
  pattern,
  email,
  phone,
  number,
  min,
  max,
  oneOf,
  custom,
} from './validation';

describe('rule factories', () => {
  describe('required', () => {
    it('flags empty string, null, undefined, whitespace', () => {
      const r = required();
      expect(r('')).toBe('Required');
      expect(r(null)).toBe('Required');
      expect(r(undefined)).toBe('Required');
      expect(r('   ')).toBe('Required');
    });
    it('passes non-empty values including 0 and false', () => {
      const r = required();
      expect(r('x')).toBeNull();
      expect(r(0)).toBeNull();
      expect(r(false)).toBeNull();
    });
    it('uses custom message', () => {
      expect(required('Tell us your name')('')).toBe('Tell us your name');
    });
  });

  describe('minLen / maxLen', () => {
    it('skips empty (pair with required)', () => {
      expect(minLen(3)('')).toBeNull();
      expect(maxLen(3)('')).toBeNull();
    });
    it('enforces bounds', () => {
      expect(minLen(3)('ab')).toBe('Must be at least 3 characters');
      expect(minLen(3)('abc')).toBeNull();
      expect(maxLen(3)('abcd')).toBe('Must be at most 3 characters');
      expect(maxLen(3)('abc')).toBeNull();
    });
  });

  describe('pattern', () => {
    it('runs regex test', () => {
      const r = pattern(/^[A-Z]+$/, 'Caps only');
      expect(r('ABC')).toBeNull();
      expect(r('abc')).toBe('Caps only');
      expect(r('')).toBeNull();
    });
  });

  describe('email', () => {
    it.each([
      ['ok@example.com', null],
      ['a@b.co', null],
      ['ok+tag@example.co.uk', null],
      ['no-at-sign', 'Enter a valid email'],
      ['no@dot', 'Enter a valid email'],
      ['spaces in@email.com', 'Enter a valid email'],
    ])('email(%s) → %s', (input, expected) => {
      expect(email()(input)).toBe(expected);
    });
  });

  describe('phone', () => {
    it('accepts ≥7 digits across formatting', () => {
      expect(phone()('+971 50 123 4567')).toBeNull();
      expect(phone()('(050) 123-4567')).toBeNull();
      expect(phone()('1234567')).toBeNull();
    });
    it('rejects fewer than 7 digits', () => {
      expect(phone()('123')).toBe('Enter a valid phone number');
      expect(phone()('abc')).toBe('Enter a valid phone number');
    });
  });

  describe('number / min / max', () => {
    it('number flags non-numeric', () => {
      expect(number()('abc')).toBe('Must be a number');
      expect(number()('42')).toBeNull();
      expect(number()(42)).toBeNull();
    });
    it('min / max bound numerics', () => {
      expect(min(10)(5)).toBe('Must be at least 10');
      expect(min(10)(10)).toBeNull();
      expect(max(10)(11)).toBe('Must be at most 10');
      expect(max(10)(10)).toBeNull();
    });
    it('min/max skip non-numerics (delegated to number())', () => {
      expect(min(10)('abc')).toBeNull();
      expect(max(10)('abc')).toBeNull();
    });
  });

  describe('oneOf', () => {
    it('passes when in set, fails otherwise', () => {
      const r = oneOf(['a', 'b', 'c']);
      expect(r('a')).toBeNull();
      expect(r('z')).toBe('Must be one of: a, b, c');
      expect(r('')).toBeNull();
    });
  });

  describe('custom', () => {
    it('returns null on pass, string on fail', () => {
      const r = custom((v) => (v === 'bad' ? 'nope' : null));
      expect(r('good')).toBeNull();
      expect(r('bad')).toBe('nope');
    });
    it('treats `true` as fail using fallback message', () => {
      const r = custom((v) => v === 'x', 'fallback');
      expect(r('x')).toBe('fallback');
      expect(r('y')).toBeNull();
    });
    it('receives allValues for cross-field rules', () => {
      const r = custom((v, all) => (v < all.start ? 'after start' : null));
      expect(r(5, { start: 10 })).toBe('after start');
      expect(r(15, { start: 10 })).toBeNull();
    });
  });
});

describe('defineSchema', () => {
  const schema = defineSchema({
    name: [required(), minLen(2)],
    email: [required(), email()],
    age: [number(), min(18)],
  });

  it('validateField returns first failing rule', () => {
    expect(schema.validateField('name', '')).toBe('Required');
    expect(schema.validateField('name', 'a')).toBe('Must be at least 2 characters');
    expect(schema.validateField('name', 'ab')).toBeNull();
  });

  it('validateField returns null for unknown field', () => {
    expect(schema.validateField('unknown', 'x')).toBeNull();
  });

  it('validate returns error map keyed by field', () => {
    const { errors, isValid } = schema.validate({ name: '', email: 'bad', age: 10 });
    expect(isValid).toBe(false);
    expect(errors).toEqual({
      name: 'Required',
      email: 'Enter a valid email',
      age: 'Must be at least 18',
    });
  });

  it('validate is happy when every field passes', () => {
    const { errors, isValid } = schema.validate({
      name: 'Henry',
      email: 'h@x.io',
      age: 30,
    });
    expect(isValid).toBe(true);
    expect(errors).toEqual({});
  });

  it('omits passing fields from errors map (so length = error count)', () => {
    const { errors } = schema.validate({ name: 'Henry', email: 'bad', age: 99 });
    expect(Object.keys(errors)).toEqual(['email']);
  });

  it('cross-field rules work via custom(allValues)', () => {
    const range = defineSchema({
      end: [custom((v, all) => (v < all.start ? 'End must be after start' : null))],
    });
    expect(range.validate({ start: 10, end: 5 }).errors.end).toBe('End must be after start');
    expect(range.validate({ start: 10, end: 15 }).isValid).toBe(true);
  });
});
