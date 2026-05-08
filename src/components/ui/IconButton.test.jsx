/**
 * IconButton.test.jsx
 * Tests for src/components/ui/IconButton — a square, aria-label-required button
 * for icon-only affordances.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IconButton from './IconButton';

// ── defaults ──────────────────────────────────────────────────────────────────

describe('IconButton — defaults', () => {
  it('renders as a native button', () => {
    const { container } = render(<IconButton aria-label="Close">✕</IconButton>);
    expect(container.querySelector('button')).toBeDefined();
  });

  it('default variant is "ghost"', () => {
    const { container } = render(<IconButton aria-label="x">✕</IconButton>);
    expect(container.querySelector('button').dataset.variant).toBe('ghost');
  });

  it('default size is "md"', () => {
    const { container } = render(<IconButton aria-label="x">✕</IconButton>);
    expect(container.querySelector('button').dataset.size).toBe('md');
  });

  it('default type is "button"', () => {
    const { container } = render(<IconButton aria-label="x">✕</IconButton>);
    expect(container.querySelector('button').type).toBe('button');
  });

  it('has the ui-icon-btn class', () => {
    const { container } = render(<IconButton aria-label="x">✕</IconButton>);
    expect(container.querySelector('button').className).toContain('ui-icon-btn');
  });

  it('wraps children in an aria-hidden span', () => {
    const { container } = render(<IconButton aria-label="Print">🖨</IconButton>);
    const inner = container.querySelector('span[aria-hidden="true"]');
    expect(inner).toBeDefined();
    expect(inner.textContent).toBe('🖨');
  });
});

// ── variants + sizes ──────────────────────────────────────────────────────────

describe('IconButton — variants', () => {
  it('applies solid variant', () => {
    const { container } = render(
      <IconButton aria-label="x" variant="solid">
        ✕
      </IconButton>,
    );
    expect(container.querySelector('button').dataset.variant).toBe('solid');
  });
});

describe('IconButton — sizes', () => {
  it('applies sm size', () => {
    const { container } = render(
      <IconButton aria-label="x" size="sm">
        ✕
      </IconButton>,
    );
    expect(container.querySelector('button').dataset.size).toBe('sm');
  });

  it('applies lg size', () => {
    const { container } = render(
      <IconButton aria-label="x" size="lg">
        ✕
      </IconButton>,
    );
    expect(container.querySelector('button').dataset.size).toBe('lg');
  });
});

// ── disabled + interaction ────────────────────────────────────────────────────

describe('IconButton — disabled', () => {
  it('disabled prop disables the button', () => {
    const { container } = render(
      <IconButton aria-label="x" disabled>
        ✕
      </IconButton>,
    );
    expect(container.querySelector('button').disabled).toBe(true);
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    const { container } = render(
      <IconButton aria-label="x" disabled onClick={onClick}>
        ✕
      </IconButton>,
    );
    fireEvent.click(container.querySelector('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('IconButton — interaction', () => {
  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Close" onClick={onClick}>
        ✕
      </IconButton>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is accessible via aria-label', () => {
    render(<IconButton aria-label="Delete item">🗑</IconButton>);
    expect(screen.getByRole('button', { name: 'Delete item' })).toBeDefined();
  });

  it('forwards ref to the button element', () => {
    const ref = React.createRef();
    render(
      <IconButton aria-label="x" ref={ref}>
        ✕
      </IconButton>,
    );
    expect(ref.current).toBeDefined();
    expect(ref.current.tagName).toBe('BUTTON');
  });

  it('passes extra className', () => {
    const { container } = render(
      <IconButton aria-label="x" className="my-icon">
        ✕
      </IconButton>,
    );
    expect(container.querySelector('button').className).toContain('my-icon');
  });

  it('passes extra props (data-testid)', () => {
    render(
      <IconButton aria-label="x" data-testid="ib">
        ✕
      </IconButton>,
    );
    expect(screen.getByTestId('ib')).toBeDefined();
  });
});
