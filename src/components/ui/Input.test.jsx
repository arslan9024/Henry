/**
 * Input.test.jsx
 * Tests for src/components/ui/Input — styled native <input> with optional
 * prefix/suffix slots and FormField context wiring.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';
import FormField from './FormField';

// ── basic render ──────────────────────────────────────────────────────────────

describe('Input — basic render', () => {
  it('renders a native text input', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('has the ui-input class', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('.ui-input')).toBeDefined();
  });

  it('default type is "text"', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('input').type).toBe('text');
  });

  it('accepts a custom type', () => {
    const { container } = render(<Input type="email" />);
    expect(container.querySelector('input').type).toBe('email');
  });

  it('default size is "md"', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('.ui-input').dataset.size).toBe('md');
  });

  it('applies sm size', () => {
    const { container } = render(<Input size="sm" />);
    expect(container.querySelector('.ui-input').dataset.size).toBe('sm');
  });

  it('forwards ref to the native input', () => {
    const ref = React.createRef();
    render(<Input ref={ref} />);
    expect(ref.current).toBeDefined();
    expect(ref.current.tagName).toBe('INPUT');
  });

  it('fires onChange', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('applies placeholder', () => {
    render(<Input placeholder="Search…" />);
    expect(screen.getByPlaceholderText('Search…')).toBeDefined();
  });

  it('applies custom className (no prefix/suffix)', () => {
    const { container } = render(<Input className="my-input" />);
    expect(container.querySelector('.ui-input').className).toContain('my-input');
  });
});

// ── invalid state ─────────────────────────────────────────────────────────────

describe('Input — invalid state', () => {
  it('sets data-invalid when aria-invalid prop passed', () => {
    const { container } = render(<Input aria-invalid />);
    expect(container.querySelector('.ui-input').dataset.invalid).toBe('true');
  });

  it('data-invalid absent when not invalid', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('.ui-input').dataset.invalid).toBeUndefined();
  });
});

// ── prefix / suffix ───────────────────────────────────────────────────────────

describe('Input — prefix and suffix', () => {
  it('renders prefix inside a wrapper when provided', () => {
    const { container } = render(<Input prefix="@" />);
    expect(container.querySelector('.ui-input-wrap')).toBeDefined();
    expect(container.querySelector('.ui-input-wrap__affix')).toBeDefined();
  });

  it('prefix affix content is visible', () => {
    render(<Input prefix="AED" />);
    expect(screen.getByText('AED')).toBeDefined();
  });

  it('prefix affix is aria-hidden', () => {
    const { container } = render(<Input prefix="@" />);
    expect(container.querySelector('.ui-input-wrap__affix').getAttribute('aria-hidden')).toBe('true');
  });

  it('renders suffix inside a wrapper when provided', () => {
    const { container } = render(<Input suffix=".com" />);
    expect(container.querySelector('.ui-input-wrap')).toBeDefined();
  });

  it('suffix content is visible', () => {
    render(<Input suffix=".com" />);
    expect(screen.getByText('.com')).toBeDefined();
  });

  it('no wrapper div when no prefix or suffix', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('.ui-input-wrap')).toBeNull();
  });

  it('wrapper applies className when prefix present', () => {
    const { container } = render(<Input prefix="@" className="wrap-cls" />);
    expect(container.querySelector('.ui-input-wrap').className).toContain('wrap-cls');
  });
});

// ── FormField context wiring ──────────────────────────────────────────────────

describe('Input — FormField context', () => {
  it('inherits id from FormField so label is linked', () => {
    render(
      <FormField label="Email">
        <Input />
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    expect(input.id).toBeTruthy();
    expect(document.querySelector(`label[for="${input.id}"]`)).toBeDefined();
  });

  it('reflects aria-invalid=true from FormField error', () => {
    const { container } = render(
      <FormField error="Required">
        <Input />
      </FormField>,
    );
    expect(container.querySelector('.ui-input').dataset.invalid).toBe('true');
  });

  it('aria-describedby is wired when FormField has hint', () => {
    render(
      <FormField hint="Helper text">
        <Input />
      </FormField>,
    );
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
  });
});
