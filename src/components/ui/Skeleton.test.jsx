/**
 * Skeleton.test.jsx
 * Tests for src/components/ui/Skeleton — shimmering loading placeholder.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton from './Skeleton';

// ── single-item render ────────────────────────────────────────────────────────

describe('Skeleton — single item', () => {
  it('renders with role="status"', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('has aria-label="Loading"', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Loading');
  });

  it('default variant is "text"', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.ui-skeleton').dataset.variant).toBe('text');
  });

  it('applies rect variant', () => {
    const { container } = render(<Skeleton variant="rect" />);
    expect(container.querySelector('.ui-skeleton').dataset.variant).toBe('rect');
  });

  it('applies circle variant', () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.querySelector('.ui-skeleton').dataset.variant).toBe('circle');
  });

  it('applies width style', () => {
    const { container } = render(<Skeleton width="200px" />);
    expect(container.querySelector('.ui-skeleton').style.width).toBe('200px');
  });

  it('applies height style', () => {
    const { container } = render(<Skeleton height="48px" />);
    expect(container.querySelector('.ui-skeleton').style.height).toBe('48px');
  });

  it('passes extra className', () => {
    const { container } = render(<Skeleton className="my-sk" />);
    expect(container.querySelector('.ui-skeleton').className).toContain('my-sk');
  });
});

// ── multi-line (text + lines > 1) ─────────────────────────────────────────────

describe('Skeleton — multi-line', () => {
  it('renders a group wrapper with role="status"', () => {
    render(<Skeleton lines={3} />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('group wrapper has aria-label="Loading"', () => {
    render(<Skeleton lines={3} />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Loading');
  });

  it('renders N skeleton spans for N lines', () => {
    const { container } = render(<Skeleton lines={4} />);
    const items = container.querySelectorAll('.ui-skeleton');
    expect(items.length).toBe(4);
  });

  it('renders 2 skeleton spans for lines=2', () => {
    const { container } = render(<Skeleton lines={2} />);
    expect(container.querySelectorAll('.ui-skeleton').length).toBe(2);
  });

  it('all multi-line items are aria-hidden', () => {
    const { container } = render(<Skeleton lines={3} />);
    const items = container.querySelectorAll('.ui-skeleton');
    items.forEach((item) => {
      expect(item.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('last line has 60% width (natural prose look)', () => {
    const { container } = render(<Skeleton lines={3} />);
    const items = container.querySelectorAll('.ui-skeleton');
    const last = items[items.length - 1];
    expect(last.style.width).toBe('60%');
  });

  it('non-last lines have 100% width', () => {
    const { container } = render(<Skeleton lines={3} />);
    const items = container.querySelectorAll('.ui-skeleton');
    expect(items[0].style.width).toBe('100%');
    expect(items[1].style.width).toBe('100%');
  });

  it('single line (lines=1) does NOT render the group wrapper', () => {
    const { container } = render(<Skeleton lines={1} />);
    expect(container.querySelector('.ui-skeleton-group')).toBeNull();
  });
});
