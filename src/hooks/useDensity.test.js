import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDensity from './useDensity';

const KEY = 'henry.ui.density';

describe('useDensity', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.density;
  });

  it("defaults to 'comfortable' and applies the data-density attribute", () => {
    const { result } = renderHook(() => useDensity());
    expect(result.current.density).toBe('comfortable');
    expect(document.documentElement.dataset.density).toBe('comfortable');
  });

  it('toggles between comfortable and compact', () => {
    const { result } = renderHook(() => useDensity());
    act(() => result.current.toggle());
    expect(result.current.density).toBe('compact');
    expect(document.documentElement.dataset.density).toBe('compact');
    act(() => result.current.toggle());
    expect(result.current.density).toBe('comfortable');
  });

  it('persists the chosen density to localStorage', () => {
    const { result } = renderHook(() => useDensity());
    act(() => result.current.toggle());
    expect(window.localStorage.getItem(KEY)).toBe('compact');
  });

  it('hydrates from localStorage on mount', () => {
    window.localStorage.setItem(KEY, 'compact');
    const { result } = renderHook(() => useDensity());
    expect(result.current.density).toBe('compact');
  });

  it('ignores invalid stored values and falls back to comfortable', () => {
    window.localStorage.setItem(KEY, 'bogus');
    const { result } = renderHook(() => useDensity());
    expect(result.current.density).toBe('comfortable');
  });
});
