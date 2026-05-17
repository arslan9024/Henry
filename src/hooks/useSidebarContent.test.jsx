/**
 * useSidebarContent.test.jsx
 * Tests for src/hooks/useSidebarContent — merges common + template-specific
 * guidance; returns { activeTemplateLabel, highlights, articles, lastUpdated }.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { useSidebarContent } from '../hooks/useSidebarContent';
import templateReducer, { setActiveTemplate } from '../store/templateSlice';
import sidebarReducer, { refreshSidebarTimestamp } from '../store/sidebarSlice';

// ── factory ───────────────────────────────────────────────────────────────────

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      template: templateReducer,
      sidebar: sidebarReducer,
    },
    preloadedState,
  });

const makeWrapper = (store) =>
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };

// A minimal guidance structure to inject via preloadedState
const MOCK_GUIDANCE = {
  common: {
    highlights: [{ id: 'h1', text: 'Common tip' }],
    articles: [{ id: 'a1', title: 'Common article' }],
  },
  byTemplate: {
    booking: {
      highlights: [{ id: 'h2', text: 'Booking tip' }],
      articles: [{ id: 'a2', title: 'Booking article' }],
    },
    viewing: {
      highlights: [{ id: 'h3', text: 'Viewing tip' }],
      articles: [],
    },
  },
};

// ── return shape ──────────────────────────────────────────────────────────────

describe('useSidebarContent — return shape', () => {
  it('returns an object with required keys', () => {
    const store = makeStore();
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });
    expect(result.current).toHaveProperty('activeTemplateLabel');
    expect(result.current).toHaveProperty('highlights');
    expect(result.current).toHaveProperty('articles');
    expect(result.current).toHaveProperty('lastUpdated');
  });

  it('highlights is an array', () => {
    const store = makeStore();
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });
    expect(Array.isArray(result.current.highlights)).toBe(true);
  });

  it('articles is an array', () => {
    const store = makeStore();
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });
    expect(Array.isArray(result.current.articles)).toBe(true);
  });

  it('activeTemplateLabel is a non-empty string', () => {
    const store = makeStore();
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });
    expect(typeof result.current.activeTemplateLabel).toBe('string');
    expect(result.current.activeTemplateLabel.length).toBeGreaterThan(0);
  });

  it('lastUpdated is a string', () => {
    const store = makeStore();
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });
    expect(typeof result.current.lastUpdated).toBe('string');
  });
});

// ── guidance merging ──────────────────────────────────────────────────────────

describe('useSidebarContent — guidance merging', () => {
  it('merges common highlights with template-specific highlights', () => {
    const store = makeStore({
      template: { activeTemplate: 'booking' },
      sidebar: { guidance: MOCK_GUIDANCE, lastUpdated: '2026-04-23' },
    });
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });
    expect(result.current.highlights).toHaveLength(2); // common + booking
  });

  it('merged highlights contain both common and specific', () => {
    const store = makeStore({
      template: { activeTemplate: 'booking' },
      sidebar: { guidance: MOCK_GUIDANCE, lastUpdated: '2026-04-23' },
    });
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });
    const texts = result.current.highlights.map((h) => h.text);
    expect(texts).toContain('Common tip');
    expect(texts).toContain('Booking tip');
  });

  it('merges common articles with template-specific articles', () => {
    const store = makeStore({
      template: { activeTemplate: 'booking' },
      sidebar: { guidance: MOCK_GUIDANCE, lastUpdated: '2026-04-23' },
    });
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });
    expect(result.current.articles).toHaveLength(2);
  });

  it('when template has no specific guidance, only common is returned', () => {
    const store = makeStore({
      template: { activeTemplate: 'invoice' }, // not in byTemplate
      sidebar: { guidance: MOCK_GUIDANCE, lastUpdated: '2026-04-23' },
    });
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });
    expect(result.current.highlights).toHaveLength(1); // only common
  });

  it('lastUpdated comes from the sidebar slice', () => {
    const store = makeStore({
      template: { activeTemplate: 'booking' },
      sidebar: { guidance: MOCK_GUIDANCE, lastUpdated: '2025-01-15' },
    });
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });
    expect(result.current.lastUpdated).toBe('2025-01-15');
  });
});

// ── reactivity ────────────────────────────────────────────────────────────────

describe('useSidebarContent — reactivity', () => {
  it('activeTemplateLabel updates when template changes', () => {
    const store = makeStore({ template: { activeTemplate: 'booking' } });
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });

    const bookingLabel = result.current.activeTemplateLabel;

    act(() => {
      store.dispatch(setActiveTemplate('viewing'));
    });

    expect(result.current.activeTemplateLabel).not.toBe(bookingLabel);
    expect(result.current.activeTemplateLabel).toContain('Viewing');
  });

  it('lastUpdated updates when timestamp is refreshed', () => {
    const store = makeStore({
      template: { activeTemplate: 'booking' },
      sidebar: { guidance: MOCK_GUIDANCE, lastUpdated: '2026-01-01' },
    });
    const { result } = renderHook(() => useSidebarContent(), { wrapper: makeWrapper(store) });

    act(() => {
      store.dispatch(refreshSidebarTimestamp('2026-05-07'));
    });

    expect(result.current.lastUpdated).toBe('2026-05-07');
  });
});
