/**
 * FormField.test.jsx
 * Tests for src/components/ui/FormField — the label + control + hint + error wrapper,
 * including FormFieldContext injection read by Input/Textarea/Select children.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormField, { useFormField } from './FormField';

// ── helper: context consumer ──────────────────────────────────────────────────

function ContextProbe() {
  const ctx = useFormField();
  if (!ctx) return <span data-testid="ctx">null</span>;
  return (
    <span
      data-testid="ctx"
      data-id={ctx.id}
      data-described-by={ctx.describedBy}
      data-invalid={String(ctx.invalid)}
      data-required={String(ctx.required)}
    />
  );
}

// ── label ─────────────────────────────────────────────────────────────────────

describe('FormField — label', () => {
  it('renders the label text', () => {
    render(<FormField label="Email" />);
    expect(screen.getByText('Email')).toBeDefined();
  });

  it('renders a <label> element', () => {
    const { container } = render(<FormField label="Email" />);
    expect(container.querySelector('label')).toBeDefined();
  });

  it('does not render a label when omitted', () => {
    const { container } = render(<FormField />);
    expect(container.querySelector('label')).toBeNull();
  });

  it('shows a required asterisk when required=true', () => {
    render(<FormField label="Name" required />);
    expect(screen.getByText('*')).toBeDefined();
  });

  it('does not show asterisk when required=false', () => {
    render(<FormField label="Name" />);
    expect(screen.queryByText('*')).toBeNull();
  });
});

// ── hint ──────────────────────────────────────────────────────────────────────

describe('FormField — hint', () => {
  it('renders hint text', () => {
    render(<FormField hint="We never share your email." />);
    expect(screen.getByText('We never share your email.')).toBeDefined();
  });

  it('hint is inside a <p> element', () => {
    const { container } = render(<FormField hint="Helper text" />);
    expect(container.querySelector('.ui-field__hint')).toBeDefined();
  });

  it('does not render hint when omitted', () => {
    const { container } = render(<FormField />);
    expect(container.querySelector('.ui-field__hint')).toBeNull();
  });

  it('hides hint when error is present (error takes precedence)', () => {
    render(<FormField hint="Helper" error="Required" />);
    expect(screen.queryByText('Helper')).toBeNull();
    expect(screen.getByText('Required')).toBeDefined();
  });
});

// ── error ─────────────────────────────────────────────────────────────────────

describe('FormField — error', () => {
  it('renders error message', () => {
    render(<FormField error="This field is required." />);
    expect(screen.getByText('This field is required.')).toBeDefined();
  });

  it('error element has role="alert"', () => {
    render(<FormField error="Bad input" />);
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('sets data-invalid on wrapper when error is present', () => {
    const { container } = render(<FormField error="Error" />);
    expect(container.querySelector('.ui-field').dataset.invalid).toBe('true');
  });

  it('data-invalid is absent when no error', () => {
    const { container } = render(<FormField />);
    expect(container.querySelector('.ui-field').dataset.invalid).toBeUndefined();
  });

  it('does not render error element when no error', () => {
    const { container } = render(<FormField />);
    expect(container.querySelector('.ui-field__error')).toBeNull();
  });
});

// ── context injection ─────────────────────────────────────────────────────────

describe('FormField — context wiring', () => {
  it('injects a non-null context into children', () => {
    render(
      <FormField>
        <ContextProbe />
      </FormField>,
    );
    expect(screen.getByTestId('ctx').dataset.id).not.toBe(undefined);
  });

  it('context invalid=false when no error', () => {
    render(
      <FormField>
        <ContextProbe />
      </FormField>,
    );
    expect(screen.getByTestId('ctx').dataset.invalid).toBe('false');
  });

  it('context invalid=true when error is provided', () => {
    render(
      <FormField error="Oops">
        <ContextProbe />
      </FormField>,
    );
    expect(screen.getByTestId('ctx').dataset.invalid).toBe('true');
  });

  it('context required=true when required prop is set', () => {
    render(
      <FormField required>
        <ContextProbe />
      </FormField>,
    );
    expect(screen.getByTestId('ctx').dataset.required).toBe('true');
  });

  it('context required=false when not required', () => {
    render(
      <FormField>
        <ContextProbe />
      </FormField>,
    );
    expect(screen.getByTestId('ctx').dataset.required).toBe('false');
  });

  it('useFormField returns null outside a FormField', () => {
    render(<ContextProbe />);
    expect(screen.getByTestId('ctx').textContent).toBe('null');
  });

  it('injects describedBy with hint id when hint present', () => {
    render(
      <FormField hint="Helper">
        <ContextProbe />
      </FormField>,
    );
    const describedBy = screen.getByTestId('ctx').dataset.describedBy;
    expect(describedBy).toBeDefined();
    expect(describedBy.length).toBeGreaterThan(0);
  });

  it('injects describedBy with error id when error present', () => {
    render(
      <FormField error="Bad">
        <ContextProbe />
      </FormField>,
    );
    const describedBy = screen.getByTestId('ctx').dataset.describedBy;
    expect(describedBy).toBeDefined();
    expect(describedBy.length).toBeGreaterThan(0);
  });
});

// ── structure ─────────────────────────────────────────────────────────────────

describe('FormField — structure', () => {
  it('has ui-field class', () => {
    const { container } = render(<FormField />);
    expect(container.querySelector('.ui-field')).toBeDefined();
  });

  it('applies custom className', () => {
    const { container } = render(<FormField className="my-field" />);
    expect(container.querySelector('.ui-field').className).toContain('my-field');
  });

  it('renders children', () => {
    render(
      <FormField>
        <input data-testid="ctrl" />
      </FormField>,
    );
    expect(screen.getByTestId('ctrl')).toBeDefined();
  });
});
