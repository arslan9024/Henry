import React from 'react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { renderHook, act } from '@testing-library/react';
import { store } from '../store';
import { useActiveTemplate } from './useActiveTemplate';
import { useDocumentData } from './useDocumentData';
import { useSidebarContent } from './useSidebarContent';
import { useComplianceCheck } from './useComplianceCheck';

/**
 * These wrapper hooks are thin bridges between react-redux selectors and
 * the components that consume them. We use the *real* root store here so
 * we exercise the full selector chain — much higher signal than mocking
 * react-redux.
 */

const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

describe('useActiveTemplate', () => {
  it('exposes the current activeTemplate + label and lets us swap it', () => {
    const { result } = renderHook(() => useActiveTemplate(), { wrapper });
    const initialTemplate = result.current.activeTemplate;
    expect(typeof initialTemplate).toBe('string');
    expect(typeof result.current.activeTemplateLabel).toBe('string');

    act(() => result.current.onChangeTemplate('viewing'));
    expect(result.current.activeTemplate).toBe('viewing');
    expect(result.current.activeTemplateLabel).toMatch(/viewing/i);

    act(() => result.current.onChangeTemplate('booking'));
    expect(result.current.activeTemplate).toBe('booking');
  });

  it('onChangeTemplate is a stable callback across renders', () => {
    const { result, rerender } = renderHook(() => useActiveTemplate(), { wrapper });
    const first = result.current.onChangeTemplate;
    rerender();
    expect(result.current.onChangeTemplate).toBe(first);
  });
});

describe('useDocumentData', () => {
  it('returns the live document state object with all top-level sections', () => {
    const { result } = renderHook(() => useDocumentData(), { wrapper });
    expect(result.current).toMatchObject({
      company: expect.any(Object),
      property: expect.any(Object),
      tenant: expect.any(Object),
      landlord: expect.any(Object),
      payments: expect.any(Object),
    });
    // Canonical landlord guard reaches all the way through (real protected name)
    expect(result.current.landlord.name).toBe('MUHAMMAD NAEEM MUHAMMAD H K KHAN');
  });
});

describe('useSidebarContent', () => {
  it('returns label + highlights + articles + lastUpdated', () => {
    const { result } = renderHook(() => useSidebarContent(), { wrapper });
    expect(result.current).toMatchObject({
      activeTemplateLabel: expect.any(String),
      highlights: expect.any(Array),
      articles: expect.any(Array),
      lastUpdated: expect.any(String),
    });
  });
});

describe('useComplianceCheck', () => {
  it('returns activeTemplate, warnings array, summary buckets, and hasWarnings flag', () => {
    const { result } = renderHook(() => useComplianceCheck(), { wrapper });
    expect(result.current).toMatchObject({
      activeTemplate: expect.any(String),
      warnings: expect.any(Array),
      summary: expect.objectContaining({
        critical: expect.any(Number),
        important: expect.any(Number),
        info: expect.any(Number),
      }),
      hasWarnings: expect.any(Boolean),
    });
    // hasWarnings must mirror warnings.length
    expect(result.current.hasWarnings).toBe(result.current.warnings.length > 0);
  });
});
