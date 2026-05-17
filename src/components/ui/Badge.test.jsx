/**
 * Badge.test.jsx
 * Tests for the src/components/ui/Badge component.
 *
 * Badge renders either a pill span (<span data-tone data-size>) or
 * a dot variant (aria-hidden span) depending on the `dot` prop.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

// ── default pill rendering ────────────────────────────────────────────────────

describe('Badge — default pill', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('uses "neutral" tone by default', () => {
    const { container } = render(<Badge>X</Badge>);
    const el = container.querySelector('.ui-badge');
    expect(el.dataset.tone).toBe('neutral');
  });

  it('uses "md" size by default', () => {
    const { container } = render(<Badge>X</Badge>);
    const el = container.querySelector('.ui-badge');
    expect(el.dataset.size).toBe('md');
  });

  it('applies a custom tone via prop', () => {
    const { container } = render(<Badge tone="critical">!</Badge>);
    const el = container.querySelector('.ui-badge');
    expect(el.dataset.tone).toBe('critical');
  });

  it('applies sm size', () => {
    const { container } = render(<Badge size="sm">x</Badge>);
    expect(container.querySelector('.ui-badge').dataset.size).toBe('sm');
  });

  it('spreads additional className', () => {
    const { container } = render(<Badge className="my-class">x</Badge>);
    expect(container.querySelector('.ui-badge').className).toContain('my-class');
  });

  it('passes extra props to the span (e.g. data-testid)', () => {
    render(<Badge data-testid="my-badge">X</Badge>);
    expect(screen.getByTestId('my-badge')).toBeDefined();
  });

  it('renders as a <span> element', () => {
    const { container } = render(<Badge>X</Badge>);
    expect(container.querySelector('span.ui-badge').tagName).toBe('SPAN');
  });

  it('supports all documented tones', () => {
    const tones = ['neutral', 'info', 'success', 'warning', 'critical', 'accent'];
    tones.forEach((tone) => {
      const { container } = render(<Badge tone={tone}>{tone}</Badge>);
      expect(container.querySelector('.ui-badge').dataset.tone).toBe(tone);
    });
  });
});

// ── dot variant ───────────────────────────────────────────────────────────────

describe('Badge — dot variant', () => {
  it('renders a ui-badge-dot span instead of ui-badge', () => {
    const { container } = render(<Badge dot />);
    expect(container.querySelector('.ui-badge-dot')).toBeDefined();
    expect(container.querySelector('.ui-badge')).toBeNull();
  });

  it('dot span has aria-hidden="true"', () => {
    const { container } = render(<Badge dot />);
    expect(container.querySelector('.ui-badge-dot').getAttribute('aria-hidden')).toBe('true');
  });

  it('dot inherits tone prop', () => {
    const { container } = render(<Badge dot tone="success" />);
    expect(container.querySelector('.ui-badge-dot').dataset.tone).toBe('success');
  });

  it('dot inherits size prop', () => {
    const { container } = render(<Badge dot size="sm" />);
    expect(container.querySelector('.ui-badge-dot').dataset.size).toBe('sm');
  });
});
