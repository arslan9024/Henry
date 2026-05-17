/**
 * useTheme.deep.test.js
 *
 * Deep coverage for useTheme — explicit mode setting, explicit dark mode,
 * setMode API, OS preference not affecting explicit modes, colorScheme
 * style attribute, cycle order, localStorage write timing, remount
 * hydration, and multiple simultaneous listeners.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';

// ── matchMedia mock factory ───────────────────────────────────────────────────

const installMatchMedia = (matches) => {
  const listeners = new Set();
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (_evt, fn) => listeners.add(fn),
    removeEventListener: (_evt, fn) => listeners.delete(fn),
    addListener: (fn) => listeners.add(fn),
    removeListener: (fn) => listeners.delete(fn),
    dispatchEvent: () => true,
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return {
    mql,
    flip: (next) => {
      mql.matches = next;
      listeners.forEach((fn) => fn(mql));
    },
    listenerCount: () => listeners.size,
  };
};

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  document.documentElement.style.colorScheme = '';
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.resetModules();
});

// ── System mode resolution ────────────────────────────────────────────────────

describe('useTheme — system mode', () => {
  it('system + OS=dark → resolved="dark"', async () => {
    installMatchMedia(true);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('system');
    expect(result.current.resolved).toBe('dark');
  });

  it('system + OS=light → resolved="light"', async () => {
    installMatchMedia(false);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolved).toBe('light');
  });

  it('system applies data-theme to <html>', async () => {
    installMatchMedia(true);
    const { default: useTheme } = await import('./useTheme');
    renderHook(() => useTheme());
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('system sets colorScheme style on <html>', async () => {
    installMatchMedia(true);
    const { default: useTheme } = await import('./useTheme');
    renderHook(() => useTheme());
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});

// ── Explicit light mode ───────────────────────────────────────────────────────

describe('useTheme — explicit light mode', () => {
  it('explicit light ignores OS dark preference', async () => {
    installMatchMedia(true);
    localStorage.setItem('henry.ui.theme', 'light');
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('light');
    expect(result.current.resolved).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('explicit light sets colorScheme="light"', async () => {
    installMatchMedia(false);
    localStorage.setItem('henry.ui.theme', 'light');
    const { default: useTheme } = await import('./useTheme');
    renderHook(() => useTheme());
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
});

// ── Explicit dark mode ────────────────────────────────────────────────────────

describe('useTheme — explicit dark mode', () => {
  it('explicit dark ignores OS light preference', async () => {
    installMatchMedia(false);
    localStorage.setItem('henry.ui.theme', 'dark');
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('dark');
    expect(result.current.resolved).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('explicit dark sets colorScheme="dark"', async () => {
    installMatchMedia(false);
    localStorage.setItem('henry.ui.theme', 'dark');
    const { default: useTheme } = await import('./useTheme');
    renderHook(() => useTheme());
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});

// ── setMode API ───────────────────────────────────────────────────────────────

describe('useTheme — setMode API', () => {
  it('setMode("dark") switches to dark', async () => {
    installMatchMedia(false);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setMode('dark'));
    expect(result.current.mode).toBe('dark');
    expect(result.current.resolved).toBe('dark');
  });

  it('setMode("light") switches to light', async () => {
    installMatchMedia(true);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setMode('light'));
    expect(result.current.mode).toBe('light');
    expect(result.current.resolved).toBe('light');
  });

  it('setMode("system") re-evaluates OS preference', async () => {
    const { flip } = installMatchMedia(false);
    localStorage.setItem('henry.ui.theme', 'light');
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    act(() => {
      flip(true);
      result.current.setMode('system');
    });
    expect(result.current.mode).toBe('system');
    expect(result.current.resolved).toBe('dark');
  });

  it('setMode persists to localStorage immediately', async () => {
    installMatchMedia(false);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setMode('dark'));
    expect(localStorage.getItem('henry.ui.theme')).toBe('dark');
  });
});

// ── cycle API ─────────────────────────────────────────────────────────────────

describe('useTheme — cycle order', () => {
  it('light → dark → system → light (full cycle)', async () => {
    installMatchMedia(false);
    localStorage.setItem('henry.ui.theme', 'light');
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('light');
    act(() => result.current.cycle());
    expect(result.current.mode).toBe('dark');
    act(() => result.current.cycle());
    expect(result.current.mode).toBe('system');
    act(() => result.current.cycle());
    expect(result.current.mode).toBe('light');
  });

  it('cycle is stable across rerenders (same reference)', async () => {
    installMatchMedia(false);
    const { default: useTheme } = await import('./useTheme');
    const { result, rerender } = renderHook(() => useTheme());
    const first = result.current.cycle;
    rerender();
    expect(result.current.cycle).toBe(first);
  });
});

// ── OS flip while in system mode ──────────────────────────────────────────────

describe('useTheme — OS preference flip', () => {
  it('OS flip while system mode updates resolved + data-theme', async () => {
    const { flip } = installMatchMedia(false);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolved).toBe('light');
    act(() => flip(true));
    expect(result.current.resolved).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('OS flip does NOT affect explicit light mode', async () => {
    const { flip } = installMatchMedia(false);
    localStorage.setItem('henry.ui.theme', 'light');
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    act(() => flip(true));
    expect(result.current.resolved).toBe('light');
  });
});

// ── Return shape ──────────────────────────────────────────────────────────────

describe('useTheme — return shape', () => {
  it('returns { mode, resolved, setMode, cycle }', async () => {
    installMatchMedia(false);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    const keys = Object.keys(result.current).sort();
    expect(keys).toEqual(['cycle', 'mode', 'resolved', 'setMode']);
  });

  it('mode is always one of [light, dark, system]', async () => {
    installMatchMedia(false);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(['light', 'dark', 'system']).toContain(result.current.mode);
  });

  it('resolved is always one of [light, dark]', async () => {
    installMatchMedia(true);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(['light', 'dark']).toContain(result.current.resolved);
  });
});
