/**
 * useBackgroundInert.deep.test.jsx
 *
 * Deep coverage for useBackgroundInert — multiple shield elements,
 * elements without the selector, ref-count edge cases with 3 concurrent
 * overlays, no-shield environment, partial prop toggling.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useBackgroundInert from './useBackgroundInert';

const SELECTOR = '[data-overlay-shield]';

const setup = (count = 1) => {
  const els = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.setAttribute('data-overlay-shield', '');
    el.id = `shield-${i}`;
    document.body.appendChild(el);
    els.push(el);
  }
  const other = document.createElement('div');
  other.id = 'not-a-shield';
  document.body.appendChild(other);
  return { els, other };
};

beforeEach(() => {
  document.body.innerHTML = '';
});

// ── Single shield element ─────────────────────────────────────────────────────

describe('useBackgroundInert — single shield', () => {
  it('active=false: shield element has no inert or aria-hidden', () => {
    const { els } = setup();
    renderHook(() => useBackgroundInert(false));
    expect(els[0].hasAttribute('inert')).toBe(false);
    expect(els[0].getAttribute('aria-hidden')).toBeNull();
  });

  it('active=true: shield gets inert + aria-hidden="true"', () => {
    const { els } = setup();
    const { unmount } = renderHook(() => useBackgroundInert(true));
    expect(els[0].hasAttribute('inert')).toBe(true);
    expect(els[0].getAttribute('aria-hidden')).toBe('true');
    unmount();
  });

  it('non-shield sibling is NOT modified', () => {
    const { other } = setup();
    const { unmount } = renderHook(() => useBackgroundInert(true));
    expect(other.hasAttribute('inert')).toBe(false);
    unmount();
  });

  it('cleanup removes inert + aria-hidden', () => {
    const { els } = setup();
    const { unmount } = renderHook(() => useBackgroundInert(true));
    expect(els[0].hasAttribute('inert')).toBe(true);
    unmount();
    expect(els[0].hasAttribute('inert')).toBe(false);
    expect(els[0].getAttribute('aria-hidden')).toBeNull();
  });
});

// ── Multiple shield elements ──────────────────────────────────────────────────

describe('useBackgroundInert — multiple shield elements', () => {
  it('all 3 shield elements become inert when active=true', () => {
    const { els } = setup(3);
    const { unmount } = renderHook(() => useBackgroundInert(true));
    for (const el of els) {
      expect(el.hasAttribute('inert')).toBe(true);
      expect(el.getAttribute('aria-hidden')).toBe('true');
    }
    unmount();
  });

  it('all shields are released on unmount', () => {
    const { els } = setup(3);
    const { unmount } = renderHook(() => useBackgroundInert(true));
    unmount();
    for (const el of els) {
      expect(el.hasAttribute('inert')).toBe(false);
      expect(el.getAttribute('aria-hidden')).toBeNull();
    }
  });
});

// ── Ref-count: 3 concurrent overlays ─────────────────────────────────────────

describe('useBackgroundInert — ref count with 3 overlays', () => {
  it('shield stays active until all 3 are unmounted', () => {
    const { els } = setup();
    const a = renderHook(() => useBackgroundInert(true));
    const b = renderHook(() => useBackgroundInert(true));
    const c = renderHook(() => useBackgroundInert(true));

    a.unmount();
    expect(els[0].hasAttribute('inert')).toBe(true); // b and c still active

    b.unmount();
    expect(els[0].hasAttribute('inert')).toBe(true); // c still active

    c.unmount();
    expect(els[0].hasAttribute('inert')).toBe(false); // all gone
  });

  it('ref count never goes below 0 (max guard)', () => {
    const { els } = setup();
    const { unmount } = renderHook(() => useBackgroundInert(true));
    unmount();
    // Unmounting a second time (simulated by extra unmount) should not crash
    expect(() => unmount()).not.toThrow();
    expect(els[0].hasAttribute('inert')).toBe(false);
  });
});

// ── Toggling active prop ──────────────────────────────────────────────────────

describe('useBackgroundInert — toggling active prop', () => {
  it('false → true → false correctly applies then removes', () => {
    const { els } = setup();
    const { rerender, unmount } = renderHook(({ on }) => useBackgroundInert(on), {
      initialProps: { on: false },
    });
    expect(els[0].hasAttribute('inert')).toBe(false);

    rerender({ on: true });
    expect(els[0].hasAttribute('inert')).toBe(true);

    rerender({ on: false });
    expect(els[0].hasAttribute('inert')).toBe(false);

    unmount();
  });

  it('true → false releases immediately (no residual inert)', () => {
    const { els } = setup();
    const { rerender, unmount } = renderHook(({ on }) => useBackgroundInert(on), {
      initialProps: { on: true },
    });
    expect(els[0].hasAttribute('inert')).toBe(true);
    rerender({ on: false });
    expect(els[0].hasAttribute('inert')).toBe(false);
    unmount();
  });
});

// ── No shield elements in DOM ─────────────────────────────────────────────────

describe('useBackgroundInert — no shield elements', () => {
  it('does not crash when no [data-overlay-shield] elements exist', () => {
    // body is empty from beforeEach
    expect(() => {
      const { unmount } = renderHook(() => useBackgroundInert(true));
      unmount();
    }).not.toThrow();
  });

  it('inactive hook with no shields does not crash', () => {
    expect(() => {
      const { unmount } = renderHook(() => useBackgroundInert(false));
      unmount();
    }).not.toThrow();
  });
});
