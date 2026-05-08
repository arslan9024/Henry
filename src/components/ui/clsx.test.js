/**
 * clsx.test.js
 * Unit tests for the tiny classnames helper in src/components/ui/clsx.js.
 *
 * Covers: strings, falsy values, numbers, arrays, objects, mixed combos.
 */
import { describe, it, expect } from 'vitest';
import clsx from './clsx';

// ── basic types ───────────────────────────────────────────────────────────────

describe('clsx — basic types', () => {
  it('returns empty string with no arguments', () => {
    expect(clsx()).toBe('');
  });

  it('returns a single string argument unchanged', () => {
    expect(clsx('foo')).toBe('foo');
  });

  it('joins multiple strings with a space', () => {
    expect(clsx('foo', 'bar')).toBe('foo bar');
  });

  it('joins three strings', () => {
    expect(clsx('a', 'b', 'c')).toBe('a b c');
  });

  it('ignores false', () => {
    expect(clsx('a', false, 'b')).toBe('a b');
  });

  it('ignores null', () => {
    expect(clsx('a', null, 'b')).toBe('a b');
  });

  it('ignores undefined', () => {
    expect(clsx('a', undefined, 'b')).toBe('a b');
  });

  it('ignores 0 (falsy number)', () => {
    expect(clsx('a', 0, 'b')).toBe('a b');
  });

  it('ignores empty string', () => {
    // Empty string is falsy — filtered out
    expect(clsx('a', '', 'b')).toBe('a b');
  });

  it('includes truthy number (non-zero)', () => {
    expect(clsx(42)).toBe('42');
  });

  it('concatenates string and truthy number', () => {
    expect(clsx('v', 2)).toBe('v 2');
  });
});

// ── object syntax ─────────────────────────────────────────────────────────────

describe('clsx — object syntax', () => {
  it('includes key when value is true', () => {
    expect(clsx({ 'is-active': true })).toBe('is-active');
  });

  it('omits key when value is false', () => {
    expect(clsx({ 'is-active': false })).toBe('');
  });

  it('omits key when value is null', () => {
    expect(clsx({ 'is-active': null })).toBe('');
  });

  it('includes multiple true keys', () => {
    const result = clsx({ foo: true, bar: true, baz: false });
    expect(result).toBe('foo bar');
  });

  it('handles all-false object', () => {
    expect(clsx({ a: false, b: false })).toBe('');
  });

  it('handles single-key truthy object', () => {
    expect(clsx({ disabled: true })).toBe('disabled');
  });

  it('mixes strings and object', () => {
    expect(clsx('btn', { 'btn--primary': true, 'btn--large': false })).toBe('btn btn--primary');
  });

  it('mixes string, falsy, and object', () => {
    expect(clsx('btn', false, { 'btn--active': true })).toBe('btn btn--active');
  });
});

// ── array syntax ──────────────────────────────────────────────────────────────

describe('clsx — array syntax', () => {
  it('handles a simple array of strings', () => {
    expect(clsx(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles array with falsy entries', () => {
    expect(clsx(['foo', false, null, 'bar'])).toBe('foo bar');
  });

  it('handles nested array', () => {
    expect(clsx([['a', 'b'], 'c'])).toBe('a b c');
  });

  it('handles empty array', () => {
    expect(clsx([])).toBe('');
  });

  it('handles array mixed with top-level strings', () => {
    expect(clsx('x', ['y', 'z'])).toBe('x y z');
  });

  it('handles array containing an object', () => {
    expect(clsx(['btn', { 'btn--sm': true }])).toBe('btn btn--sm');
  });
});

// ── real-world-style combos ───────────────────────────────────────────────────

describe('clsx — real-world combos', () => {
  it('builds component class name from base + modifier + conditional', () => {
    const isActive = true;
    const isDisabled = false;
    const result = clsx('sif-btn', isActive && 'sif-btn--active', isDisabled && 'sif-btn--disabled');
    expect(result).toBe('sif-btn sif-btn--active');
  });

  it('all conditions false returns only base class', () => {
    const result = clsx('card', false && 'card--hover', null, undefined);
    expect(result).toBe('card');
  });

  it('object with dynamic key', () => {
    const variant = 'primary';
    const result = clsx('btn', { [`btn--${variant}`]: true });
    expect(result).toBe('btn btn--primary');
  });

  it('handles completely empty call with falsy-only args', () => {
    expect(clsx(false, null, undefined, 0, '')).toBe('');
  });
});
