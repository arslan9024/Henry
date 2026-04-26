import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Lightweight matchMedia stub installed before each test so useTheme can read it.
const installMatchMedia = (matches) => {
  const listeners = new Set();
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (_evt, fn) => listeners.add(fn),
    removeEventListener: (_evt, fn) => listeners.delete(fn),
    addListener: (fn) => listeners.add(fn), // legacy
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
  };
};

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to system mode and resolves against prefers-color-scheme', async () => {
    installMatchMedia(true);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('system');
    expect(result.current.resolved).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('honors explicit light mode regardless of OS preference', async () => {
    installMatchMedia(true); // OS prefers dark, but user picked light
    localStorage.setItem('henry.ui.theme', 'light');
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('light');
    expect(result.current.resolved).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('cycles light → dark → system → light', async () => {
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

  it('persists mode changes to localStorage', async () => {
    installMatchMedia(false);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setMode('dark'));
    expect(localStorage.getItem('henry.ui.theme')).toBe('dark');
  });

  it('re-resolves when system preference flips while in system mode', async () => {
    const mm = installMatchMedia(false);
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolved).toBe('light');
    act(() => mm.flip(true));
    expect(result.current.resolved).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('ignores corrupted stored values and falls back to system', async () => {
    installMatchMedia(false);
    localStorage.setItem('henry.ui.theme', 'not-a-mode');
    const { default: useTheme } = await import('./useTheme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('system');
  });
});
