/**
 * Spinner.test.jsx
 * Tests for the src/components/ui/Spinner component.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner', () => {
  it('renders with role="status"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('renders default "Loading" label for screen readers', () => {
    render(<Spinner />);
    // The sr span is inside the status element
    expect(screen.getByText('Loading')).toBeDefined();
  });

  it('accepts a custom label', () => {
    render(<Spinner label="Processing file" />);
    expect(screen.getByText('Processing file')).toBeDefined();
  });

  it('default size is "md"', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.ui-spinner').dataset.size).toBe('md');
  });

  it('applies sm size', () => {
    const { container } = render(<Spinner size="sm" />);
    expect(container.querySelector('.ui-spinner').dataset.size).toBe('sm');
  });

  it('applies lg size', () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.querySelector('.ui-spinner').dataset.size).toBe('lg');
  });

  it('renders the ring element (aria-hidden)', () => {
    const { container } = render(<Spinner />);
    const ring = container.querySelector('.ui-spinner__ring');
    expect(ring).toBeDefined();
    expect(ring.getAttribute('aria-hidden')).toBe('true');
  });

  it('has aria-live="polite"', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.ui-spinner').getAttribute('aria-live')).toBe('polite');
  });

  it('passes extra className', () => {
    const { container } = render(<Spinner className="my-spin" />);
    expect(container.querySelector('.ui-spinner').className).toContain('my-spin');
  });

  it('passes extra props (data-testid)', () => {
    render(<Spinner data-testid="test-spin" />);
    expect(screen.getByTestId('test-spin')).toBeDefined();
  });
});
