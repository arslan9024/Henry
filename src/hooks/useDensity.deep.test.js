/**
 * useDensity.deep.test.js
 *
 * Deep coverage for useDensity — data-density attribute lifecycle,
 * multiple mounts, persist-on-mount, remount hydration, toggle
 * call-count tracking, and rapid-toggle correctness.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import useDensity from './useDensity';

const KEY = 'henry.ui.density';

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.density;
});

afterEach(cleanup);

// ── Initial data-density attribute ────────────────────────────────────────────

describe('useDensity — data-density attribute on mount', () => {
  it('applies data-density="comfortable" to <html> immediately', () => {
    renderHook(() => useDensity());
    expect(document.documentElement.dataset.density).toBe('comfortable');
  });

  it('applies data-density="compact" when localStorage says compact', () => {
    localStorage.setItem(KEY, 'compact');
    renderHook(() => useDensity());
    expect(document.documentElement.dataset.density).toBe('compact');
  });

  it('data-density is set synchronously before any user interaction', () => {
    const { result } = renderHook(() => useDensity());
    // The state and DOM should already be 'comfortable' right after mount
    expect(result.current.density).toBe('comfortable');
    expect(document.documentElement.dataset.density).toBe('comfortable');
  });
});

// ── Toggle correctness ────────────────────────────────────────────────────────

describe('useDensity — toggle correctness', () => {
  it('toggle: comfortable → compact → comfortable (3-step cycle)', () => {
    const { result } = renderHook(() => useDensity());
    expect(result.current.density).toBe('comfortable');
    act(() => result.current.toggle());
    expect(result.current.density).toBe('compact');
    act(() => result.current.toggle());
    expect(result.current.density).toBe('comfortable');
  });

  it('4 rapid toggles returns to original value', () => {
    const { result } = renderHook(() => useDensity());
    act(() => {
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
    });
    expect(result.current.density).toBe('comfortable');
  });

  it('toggle is stable across rerenders (same function reference)', () => {
    const { result, rerender } = renderHook(() => useDensity());
    const first = result.current.toggle;
    rerender();
    expect(result.current.toggle).toBe(first);
  });
});

// ── localStorage persistence ──────────────────────────────────────────────────

describe('useDensity — localStorage persistence', () => {
  it('writes comfortable to localStorage on mount', () => {
    renderHook(() => useDensity());
    expect(localStorage.getItem(KEY)).toBe('comfortable');
  });

  it('writes compact to localStorage after toggle', () => {
    const { result } = renderHook(() => useDensity());
    act(() => result.current.toggle());
    expect(localStorage.getItem(KEY)).toBe('compact');
  });

  it('remount reads the persisted compact value', () => {
    const h1 = renderHook(() => useDensity());
    act(() => h1.result.current.toggle()); // now compact
    h1.unmount();

    // New hook instance — should hydrate from localStorage
    const h2 = renderHook(() => useDensity());
    expect(h2.result.current.density).toBe('compact');
    h2.unmount();
  });
});

// ── data-density stays in sync ────────────────────────────────────────────────

describe('useDensity — data-density stays in sync', () => {
  it('data-density updates after every toggle', () => {
    const { result } = renderHook(() => useDensity());
    expect(document.documentElement.dataset.density).toBe('comfortable');
    act(() => result.current.toggle());
    expect(document.documentElement.dataset.density).toBe('compact');
    act(() => result.current.toggle());
    expect(document.documentElement.dataset.density).toBe('comfortable');
  });
});

// ── Return shape ──────────────────────────────────────────────────────────────

describe('useDensity — return shape', () => {
  it('returns exactly { density, toggle }', () => {
    const { result } = renderHook(() => useDensity());
    const keys = Object.keys(result.current).sort();
    expect(keys).toEqual(['density', 'toggle']);
  });

  it('density is always one of ["comfortable", "compact"]', () => {
    const { result } = renderHook(() => useDensity());
    expect(['comfortable', 'compact']).toContain(result.current.density);
    act(() => result.current.toggle());
    expect(['comfortable', 'compact']).toContain(result.current.density);
  });

  it('toggle is a function', () => {
    const { result } = renderHook(() => useDensity());
    expect(typeof result.current.toggle).toBe('function');
  });
});
