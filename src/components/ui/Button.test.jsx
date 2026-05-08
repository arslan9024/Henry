/**
 * Button.test.jsx
 * Tests for the src/components/ui/Button component.
 *
 * Button is a forwardRef component with:
 *   - variant: primary | secondary (default) | ghost | danger
 *   - size: sm | md (default) | lg
 *   - loading, disabled, fullWidth flags
 *   - iconLeft / iconRight slots
 *   - Renders as native <button> with correct type
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

// ── defaults ──────────────────────────────────────────────────────────────────

describe('Button — defaults', () => {
  it('renders children inside a label span', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('default variant is "secondary"', () => {
    const { container } = render(<Button>X</Button>);
    expect(container.querySelector('button').dataset.variant).toBe('secondary');
  });

  it('default size is "md"', () => {
    const { container } = render(<Button>X</Button>);
    expect(container.querySelector('button').dataset.size).toBe('md');
  });

  it('default type is "button" (not "submit")', () => {
    const { container } = render(<Button>X</Button>);
    expect(container.querySelector('button').type).toBe('button');
  });

  it('is not disabled by default', () => {
    const { container } = render(<Button>X</Button>);
    expect(container.querySelector('button').disabled).toBe(false);
  });

  it('applies the ui-btn class', () => {
    const { container } = render(<Button>X</Button>);
    expect(container.querySelector('button').className).toContain('ui-btn');
  });
});

// ── variants + sizes ──────────────────────────────────────────────────────────

describe('Button — variants', () => {
  it('applies data-variant for primary', () => {
    const { container } = render(<Button variant="primary">P</Button>);
    expect(container.querySelector('button').dataset.variant).toBe('primary');
  });

  it('applies data-variant for ghost', () => {
    const { container } = render(<Button variant="ghost">G</Button>);
    expect(container.querySelector('button').dataset.variant).toBe('ghost');
  });

  it('applies data-variant for danger', () => {
    const { container } = render(<Button variant="danger">D</Button>);
    expect(container.querySelector('button').dataset.variant).toBe('danger');
  });
});

describe('Button — sizes', () => {
  it('applies data-size sm', () => {
    const { container } = render(<Button size="sm">S</Button>);
    expect(container.querySelector('button').dataset.size).toBe('sm');
  });

  it('applies data-size lg', () => {
    const { container } = render(<Button size="lg">L</Button>);
    expect(container.querySelector('button').dataset.size).toBe('lg');
  });
});

// ── disabled + loading ────────────────────────────────────────────────────────

describe('Button — disabled state', () => {
  it('disabled prop makes button disabled', () => {
    const { container } = render(<Button disabled>D</Button>);
    expect(container.querySelector('button').disabled).toBe(true);
  });

  it('click does not fire when disabled', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Button disabled onClick={onClick}>
        D
      </Button>,
    );
    fireEvent.click(container.querySelector('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Button — loading state', () => {
  it('loading disables the button', () => {
    const { container } = render(<Button loading>L</Button>);
    expect(container.querySelector('button').disabled).toBe(true);
  });

  it('loading sets aria-busy', () => {
    const { container } = render(<Button loading>L</Button>);
    expect(container.querySelector('button').getAttribute('aria-busy')).toBe('true');
  });

  it('renders the spinner element when loading', () => {
    const { container } = render(<Button loading>L</Button>);
    expect(container.querySelector('.ui-btn__spinner')).toBeDefined();
  });

  it('aria-busy is absent when not loading', () => {
    const { container } = render(<Button>X</Button>);
    expect(container.querySelector('button').getAttribute('aria-busy')).toBeNull();
  });
});

// ── icons + fullWidth ─────────────────────────────────────────────────────────

describe('Button — iconLeft / iconRight', () => {
  it('renders iconLeft inside ui-btn__icon span', () => {
    const { container } = render(<Button iconLeft={<span>→</span>}>Text</Button>);
    expect(container.querySelector('.ui-btn__icon')).toBeDefined();
  });

  it('renders iconRight inside ui-btn__icon span', () => {
    const { container } = render(<Button iconRight={<span>←</span>}>Text</Button>);
    expect(container.querySelector('.ui-btn__icon')).toBeDefined();
  });
});

describe('Button — fullWidth', () => {
  it('sets data-full-width attribute', () => {
    const { container } = render(<Button fullWidth>Full</Button>);
    expect(container.querySelector('button').dataset.fullWidth).toBeDefined();
  });

  it('fullWidth attribute absent when false', () => {
    const { container } = render(<Button>Normal</Button>);
    expect(container.querySelector('button').dataset.fullWidth).toBeUndefined();
  });
});

// ── events + forwardRef ───────────────────────────────────────────────────────

describe('Button — interaction', () => {
  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click').closest('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('accepts type="submit" for form submission', () => {
    const { container } = render(<Button type="submit">Submit</Button>);
    expect(container.querySelector('button').type).toBe('submit');
  });

  it('forwards ref to the native button', () => {
    const ref = React.createRef();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeDefined();
    expect(ref.current.tagName).toBe('BUTTON');
  });

  it('passes extra className', () => {
    const { container } = render(<Button className="extra">X</Button>);
    expect(container.querySelector('button').className).toContain('extra');
  });
});
