import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import SkipLink from './SkipLink';

afterEach(cleanup);

describe('SkipLink (T-40)', () => {
  it('renders an anchor pointing at #main with descriptive label', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveAttribute('href', '#main');
  });

  it('is the first focusable element after a fresh document tab', () => {
    render(
      <>
        <SkipLink />
        <button type="button">Other</button>
      </>,
    );
    // Sanity: links are focusable; verifying ordering here means asserting
    // the SkipLink renders BEFORE other controls in the DOM order — which
    // is what mounting it first in App.jsx guarantees.
    const link = screen.getByRole('link', { name: /skip to main content/i });
    const button = screen.getByRole('button', { name: 'Other' });
    expect(link.compareDocumentPosition(button)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('moves focus to #main on activation (and respects existing tabindex)', () => {
    const main = document.createElement('main');
    main.id = 'main';
    main.setAttribute('tabindex', '-1');
    document.body.appendChild(main);
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    fireEvent.click(link);
    expect(document.activeElement).toBe(main);
    document.body.removeChild(main);
  });

  it('lazily adds tabindex=-1 if main lacks one, so focus() is honored', () => {
    const main = document.createElement('main');
    main.id = 'main'; // intentionally no tabindex
    document.body.appendChild(main);
    render(<SkipLink />);
    fireEvent.click(screen.getByRole('link', { name: /skip to main content/i }));
    expect(main.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(main);
    document.body.removeChild(main);
  });

  it('is a no-op when no #main exists (defensive)', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    // Should not throw.
    expect(() => fireEvent.click(link)).not.toThrow();
  });

  it('updates location hash when activated', () => {
    const main = document.createElement('main');
    main.id = 'main';
    document.body.appendChild(main);
    const spy = vi.spyOn(window.history, 'replaceState');
    render(<SkipLink />);
    fireEvent.click(screen.getByRole('link', { name: /skip to main content/i }));
    expect(spy).toHaveBeenCalledWith(null, '', '#main');
    spy.mockRestore();
    document.body.removeChild(main);
  });
});
