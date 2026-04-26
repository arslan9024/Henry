import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useBackgroundInert from './useBackgroundInert';

/**
 * useBackgroundInert is module-scoped (it keeps a ref-count of how many
 * overlays are currently active). Each test resets the DOM and unmounts
 * any leftover hooks so the count returns to zero.
 */

const setupShield = () => {
  document.body.innerHTML = '<div data-overlay-shield id="bg"></div><div id="other"></div>';
  return {
    bg: document.getElementById('bg'),
    other: document.getElementById('other'),
  };
};

describe('useBackgroundInert', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing when active=false', () => {
    const { bg } = setupShield();
    renderHook(() => useBackgroundInert(false));
    expect(bg.hasAttribute('inert')).toBe(false);
    expect(bg.getAttribute('aria-hidden')).toBeNull();
  });

  it('marks shielded elements inert + aria-hidden when active=true', () => {
    const { bg, other } = setupShield();
    const { unmount } = renderHook(() => useBackgroundInert(true));
    expect(bg.hasAttribute('inert')).toBe(true);
    expect(bg.getAttribute('aria-hidden')).toBe('true');
    // Non-shielded elements are untouched
    expect(other.hasAttribute('inert')).toBe(false);
    unmount();
    // Cleanup releases the shield
    expect(bg.hasAttribute('inert')).toBe(false);
    expect(bg.getAttribute('aria-hidden')).toBeNull();
  });

  it('ref-counts: shield stays active while ANY hook is mounted', () => {
    const { bg } = setupShield();
    const a = renderHook(() => useBackgroundInert(true));
    const b = renderHook(() => useBackgroundInert(true));
    expect(bg.hasAttribute('inert')).toBe(true);

    a.unmount();
    // One overlay still active → shield must remain
    expect(bg.hasAttribute('inert')).toBe(true);

    b.unmount();
    // All overlays gone → shield released
    expect(bg.hasAttribute('inert')).toBe(false);
  });

  it('toggling active false→true→false applies and then releases', () => {
    const { bg } = setupShield();
    const { rerender, unmount } = renderHook(({ on }) => useBackgroundInert(on), {
      initialProps: { on: false },
    });
    expect(bg.hasAttribute('inert')).toBe(false);
    rerender({ on: true });
    expect(bg.hasAttribute('inert')).toBe(true);
    rerender({ on: false });
    expect(bg.hasAttribute('inert')).toBe(false);
    unmount();
  });
});
