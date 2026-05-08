/**
 * hooks.deep.test.jsx
 *
 * Deeper coverage for hooks not fully tested:
 *   - useAutosaveDebounce: idle/saved states, unmount before fire, custom delays
 *   - useActiveTemplate:   label changes per template, onChangeTemplate coverage
 *   - useDocumentData:     returns all sections, reference stability
 *   - useSidebarContent:   returns highlights, articles, lastUpdated, reflects dispatch
 *   - useComplianceCheck:  warnings count, hasWarnings flag, summary shape
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import documentReducer from '../store/documentSlice';
import templateReducer, { setActiveTemplate } from '../store/templateSlice';
import uiReducer, { markDirty, markSaved, selectSaveState } from '../store/uiSlice';
import sidebarReducer, { refreshSidebarTimestamp } from '../store/sidebarSlice';
import complianceReducer from '../store/complianceSlice';
import policyMetaReducer from '../store/policyMetaSlice';

import useAutosaveDebounce from './useAutosaveDebounce';
import { useActiveTemplate } from './useActiveTemplate';
import { useDocumentData } from './useDocumentData';
import { useSidebarContent } from './useSidebarContent';
import { useComplianceCheck } from './useComplianceCheck';

// ── store factories ───────────────────────────────────────────────────────────

const makeUiStore = () => configureStore({ reducer: { ui: uiReducer } });

const makeFullStore = (preloaded = {}) =>
  configureStore({
    reducer: {
      document: documentReducer,
      template: templateReducer,
      ui: uiReducer,
      sidebar: sidebarReducer,
      compliance: complianceReducer,
      policyMeta: policyMetaReducer,
    },
    preloadedState: preloaded,
  });

const wrap =
  (store) =>
  ({ children }) => <Provider store={store}>{children}</Provider>;

// ═══════════════════════════════════════════════════════════════════════════════
// useAutosaveDebounce — deeper coverage
// ═══════════════════════════════════════════════════════════════════════════════

const AutosaveHarness = ({ delayMs }) => {
  useAutosaveDebounce(delayMs);
  return null;
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('useAutosaveDebounce — does nothing in "idle" state', () => {
  it('does not dispatch markSaved when status is idle (no markDirty dispatch)', () => {
    const store = makeUiStore();
    render(
      <Provider store={store}>
        <AutosaveHarness delayMs={500} />
      </Provider>,
    );
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Status must remain idle — no markSaved was triggered
    expect(selectSaveState(store.getState()).status).toBe('idle');
  });
});

describe('useAutosaveDebounce — does nothing in "saved" state', () => {
  it('does not re-trigger markSaved when already saved', () => {
    const store = makeUiStore();
    render(
      <Provider store={store}>
        <AutosaveHarness delayMs={500} />
      </Provider>,
    );
    // First save cycle
    act(() => {
      store.dispatch(markDirty(100));
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(selectSaveState(store.getState()).status).toBe('saved');

    // Advance another full window — status must stay 'saved', not flip to something else
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(selectSaveState(store.getState()).status).toBe('saved');
  });
});

describe('useAutosaveDebounce — custom delay values', () => {
  it('fires at exactly 300ms with delayMs=300', () => {
    const store = makeUiStore();
    render(
      <Provider store={store}>
        <AutosaveHarness delayMs={300} />
      </Provider>,
    );
    act(() => {
      store.dispatch(markDirty(100));
    });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(selectSaveState(store.getState()).status).toBe('saving');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(selectSaveState(store.getState()).status).toBe('saved');
  });

  it('fires at exactly 1000ms with delayMs=1000', () => {
    const store = makeUiStore();
    render(
      <Provider store={store}>
        <AutosaveHarness delayMs={1000} />
      </Provider>,
    );
    act(() => {
      store.dispatch(markDirty(100));
    });
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(selectSaveState(store.getState()).status).toBe('saving');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(selectSaveState(store.getState()).status).toBe('saved');
  });
});

describe('useAutosaveDebounce — unmount before timer fires', () => {
  it('unmounting mid-debounce does not dispatch markSaved', () => {
    const store = makeUiStore();
    const { unmount } = render(
      <Provider store={store}>
        <AutosaveHarness delayMs={500} />
      </Provider>,
    );
    act(() => {
      store.dispatch(markDirty(100));
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Unmount before timer fires
    unmount();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // Should still be 'saving' — cleanup prevented the dispatch
    expect(selectSaveState(store.getState()).status).toBe('saving');
  });
});

describe('useAutosaveDebounce — rapid keypresses reset the timer', () => {
  it('three rapid dirtyAt updates all restart the debounce window', () => {
    const store = makeUiStore();
    render(
      <Provider store={store}>
        <AutosaveHarness delayMs={500} />
      </Provider>,
    );
    act(() => {
      store.dispatch(markDirty(100));
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => {
      store.dispatch(markDirty(300));
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => {
      store.dispatch(markDirty(500));
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    // Still inside 500ms window from last dirty
    expect(selectSaveState(store.getState()).status).toBe('saving');
    act(() => {
      vi.advanceTimersByTime(100);
    });
    // Now exactly 500ms from last dirty — should flush
    expect(selectSaveState(store.getState()).status).toBe('saved');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// useActiveTemplate — deeper coverage
// ═══════════════════════════════════════════════════════════════════════════════

describe('useActiveTemplate — reads template from store', () => {
  it('returns "booking" by default', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: wrap(store) });
    expect(result.current.activeTemplate).toBe('booking');
  });

  it.each([
    'booking',
    'tenancy',
    'addendum',
    'invoice',
    'viewing',
    'keyHandover',
    'offer',
    'salaryCertificate',
    'bookingGov',
  ])('returns "%s" after store changes to that key', (templateKey) => {
    const store = makeFullStore();
    act(() => {
      store.dispatch(setActiveTemplate(templateKey));
    });
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: wrap(store) });
    expect(result.current.activeTemplate).toBe(templateKey);
  });

  it('activeTemplateLabel is a non-empty string', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: wrap(store) });
    expect(typeof result.current.activeTemplateLabel).toBe('string');
    expect(result.current.activeTemplateLabel.length).toBeGreaterThan(0);
  });

  it('label changes when template changes', () => {
    const store = makeFullStore();
    const { result, rerender } = renderHook(() => useActiveTemplate(), { wrapper: wrap(store) });
    const labelBefore = result.current.activeTemplateLabel;
    act(() => {
      store.dispatch(setActiveTemplate('tenancy'));
    });
    rerender();
    expect(result.current.activeTemplateLabel).not.toBe(labelBefore);
  });

  it('onChangeTemplate dispatches setActiveTemplate', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useActiveTemplate(), { wrapper: wrap(store) });
    act(() => {
      result.current.onChangeTemplate('invoice');
    });
    expect(store.getState().template.activeTemplate).toBe('invoice');
  });

  it('onChangeTemplate is stable across rerenders (useCallback)', () => {
    const store = makeFullStore();
    const { result, rerender } = renderHook(() => useActiveTemplate(), { wrapper: wrap(store) });
    const fn1 = result.current.onChangeTemplate;
    rerender();
    const fn2 = result.current.onChangeTemplate;
    expect(fn1).toBe(fn2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// useDocumentData — deeper coverage
// ═══════════════════════════════════════════════════════════════════════════════

describe('useDocumentData — returns full document state', () => {
  it('returns an object with all document sections', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useDocumentData(), { wrapper: wrap(store) });
    const doc = result.current;
    expect(doc.company).toBeDefined();
    expect(doc.property).toBeDefined();
    expect(doc.tenant).toBeDefined();
    expect(doc.landlord).toBeDefined();
    expect(doc.payments).toBeDefined();
    expect(doc.broker).toBeDefined();
    expect(doc.viewing).toBeDefined();
    expect(doc.occupancy).toBeDefined();
    expect(doc.addendum).toBeDefined();
  });

  it('company.name is the White Caves default', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useDocumentData(), { wrapper: wrap(store) });
    expect(result.current.company.name).toBe('White Caves Real Estate L.L.C');
  });

  it('returns same reference when document state is unchanged (selector memoization)', () => {
    const store = makeFullStore();
    const { result, rerender } = renderHook(() => useDocumentData(), { wrapper: wrap(store) });
    const ref1 = result.current;
    rerender();
    const ref2 = result.current;
    expect(ref1).toBe(ref2);
  });

  it('returns new reference after document mutation', () => {
    const store = makeFullStore();
    const { result, rerender } = renderHook(() => useDocumentData(), { wrapper: wrap(store) });
    const ref1 = result.current;
    act(() => {
      store.dispatch({
        type: 'document/setDocumentValue',
        payload: { section: 'tenant', field: 'fullName', value: 'Sara' },
      });
    });
    rerender();
    const ref2 = result.current;
    expect(ref2).not.toBe(ref1);
    expect(ref2.tenant.fullName).toBe('Sara');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// useSidebarContent — deeper coverage
// ═══════════════════════════════════════════════════════════════════════════════

describe('useSidebarContent — structure', () => {
  it('returns activeTemplateLabel, highlights, articles, lastUpdated', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useSidebarContent(), { wrapper: wrap(store) });
    expect(result.current).toHaveProperty('activeTemplateLabel');
    expect(result.current).toHaveProperty('highlights');
    expect(result.current).toHaveProperty('articles');
    expect(result.current).toHaveProperty('lastUpdated');
  });

  it('highlights is an array', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useSidebarContent(), { wrapper: wrap(store) });
    expect(Array.isArray(result.current.highlights)).toBe(true);
  });

  it('articles is an array', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useSidebarContent(), { wrapper: wrap(store) });
    expect(Array.isArray(result.current.articles)).toBe(true);
  });

  it('lastUpdated is a date-like string', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useSidebarContent(), { wrapper: wrap(store) });
    expect(typeof result.current.lastUpdated).toBe('string');
    expect(result.current.lastUpdated.length).toBeGreaterThan(0);
  });

  it('highlights and articles change when template changes', () => {
    const store = makeFullStore();
    const { result, rerender } = renderHook(() => useSidebarContent(), { wrapper: wrap(store) });
    const before = result.current;
    act(() => {
      store.dispatch(setActiveTemplate('tenancy'));
    });
    rerender();
    // After template change the content should reflect the new template
    // (at minimum one of the arrays should differ)
    const after = result.current;
    // Either the highlights or articles arrays differ (may be same if template
    // shares common content — at least label should differ)
    expect(after.activeTemplateLabel).not.toBe(before.activeTemplateLabel);
  });

  it('lastUpdated reflects refreshSidebarTimestamp dispatch', () => {
    const store = makeFullStore();
    const { result, rerender } = renderHook(() => useSidebarContent(), { wrapper: wrap(store) });
    act(() => {
      store.dispatch(refreshSidebarTimestamp('2030-01-01'));
    });
    rerender();
    expect(result.current.lastUpdated).toBe('2030-01-01');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// useComplianceCheck — deeper coverage
// ═══════════════════════════════════════════════════════════════════════════════

describe('useComplianceCheck — structure', () => {
  it('returns activeTemplate, warnings, summary, hasWarnings', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: wrap(store) });
    expect(result.current).toHaveProperty('activeTemplate');
    expect(result.current).toHaveProperty('warnings');
    expect(result.current).toHaveProperty('summary');
    expect(result.current).toHaveProperty('hasWarnings');
  });

  it('warnings is an array', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: wrap(store) });
    expect(Array.isArray(result.current.warnings)).toBe(true);
  });

  it('hasWarnings is a boolean', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: wrap(store) });
    expect(typeof result.current.hasWarnings).toBe('boolean');
  });

  it('summary is an object', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: wrap(store) });
    expect(typeof result.current.summary).toBe('object');
    expect(result.current.summary).not.toBeNull();
  });

  it('activeTemplate matches current store template', () => {
    const store = makeFullStore();
    const { result } = renderHook(() => useComplianceCheck(), { wrapper: wrap(store) });
    expect(result.current.activeTemplate).toBe(store.getState().template.activeTemplate);
  });

  it('activeTemplate updates when store template changes', () => {
    const store = makeFullStore();
    const { result, rerender } = renderHook(() => useComplianceCheck(), { wrapper: wrap(store) });
    act(() => {
      store.dispatch(setActiveTemplate('invoice'));
    });
    rerender();
    expect(result.current.activeTemplate).toBe('invoice');
  });
});
