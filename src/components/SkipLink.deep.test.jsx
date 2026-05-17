/**
 * SkipLink.deep.test.jsx
 *
 * Deep coverage for the SkipLink component — element type, class,
 * focus management edge cases, replaceState conditions, multiple clicks,
 * and defensive guards when the DOM isn't cooperating.
 */
import React from 'react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import SkipLink from './SkipLink';

afterEach(() => {
  cleanup();
  // Remove any #main elements left from tests
  document.querySelectorAll('#main').forEach((el) => el.remove());
});

// ── Element structure ─────────────────────────────────────────────────────────

describe('SkipLink — element structure', () => {
  it('renders as an <a> element (not a <button>)', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link.tagName.toLowerCase()).toBe('a');
  });

  it('has className "skip-link"', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link.className).toBe('skip-link');
  });

  it('href attribute is "#main"', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveAttribute('href', '#main');
  });

  it('text content is "Skip to main content"', () => {
    render(<SkipLink />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });
});

// ── Focus management ──────────────────────────────────────────────────────────

describe('SkipLink — focus management', () => {
  it('sets focus on #main when clicked', () => {
    const main = document.createElement('main');
    main.id = 'main';
    main.setAttribute('tabindex', '-1');
    document.body.appendChild(main);
    render(<SkipLink />);
    fireEvent.click(screen.getByRole('link', { name: /skip to main content/i }));
    expect(document.activeElement).toBe(main);
  });

  it('adds tabindex="-1" to #main if missing', () => {
    const main = document.createElement('main');
    main.id = 'main';
    document.body.appendChild(main);
    render(<SkipLink />);
    fireEvent.click(screen.getByRole('link', { name: /skip to main content/i }));
    expect(main.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(main);
  });

  it('does NOT overwrite existing tabindex on #main', () => {
    const main = document.createElement('main');
    main.id = 'main';
    main.setAttribute('tabindex', '-1');
    document.body.appendChild(main);
    render(<SkipLink />);
    fireEvent.click(screen.getByRole('link', { name: /skip to main content/i }));
    // Should still be -1 (not changed)
    expect(main.getAttribute('tabindex')).toBe('-1');
  });

  it('clicking twice focuses #main both times', () => {
    const main = document.createElement('main');
    main.id = 'main';
    main.setAttribute('tabindex', '-1');
    document.body.appendChild(main);
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    fireEvent.click(link);
    // Move focus away
    document.body.focus();
    fireEvent.click(link);
    expect(document.activeElement).toBe(main);
  });
});

// ── replaceState ──────────────────────────────────────────────────────────────

describe('SkipLink — replaceState', () => {
  it('calls history.replaceState with "#main"', () => {
    const main = document.createElement('main');
    main.id = 'main';
    document.body.appendChild(main);
    const spy = vi.spyOn(window.history, 'replaceState');
    render(<SkipLink />);
    fireEvent.click(screen.getByRole('link', { name: /skip to main content/i }));
    expect(spy).toHaveBeenCalledWith(null, '', '#main');
    spy.mockRestore();
  });

  it('does not throw if window.history.replaceState is undefined', () => {
    const main = document.createElement('main');
    main.id = 'main';
    document.body.appendChild(main);
    const orig = window.history.replaceState;
    // @ts-ignore
    window.history.replaceState = undefined;
    render(<SkipLink />);
    expect(() => {
      fireEvent.click(screen.getByRole('link', { name: /skip to main content/i }));
    }).not.toThrow();
    window.history.replaceState = orig;
  });
});

// ── Defensive: no #main ───────────────────────────────────────────────────────

describe('SkipLink — no #main element', () => {
  it('does not throw when #main is absent', () => {
    render(<SkipLink />);
    expect(() => {
      fireEvent.click(screen.getByRole('link', { name: /skip to main content/i }));
    }).not.toThrow();
  });

  it('does NOT call replaceState when #main is absent (native href handles it)', () => {
    const spy = vi.spyOn(window.history, 'replaceState');
    render(<SkipLink />);
    fireEvent.click(screen.getByRole('link', { name: /skip to main content/i }));
    // The handler returns early (no #main) — replaceState should not be called
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
