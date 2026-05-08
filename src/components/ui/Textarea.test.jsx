/**
 * Textarea.test.jsx
 * Tests for src/components/ui/Textarea — styled native <textarea> with
 * FormField context wiring, size, and invalid state.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Textarea from './Textarea';
import FormField from './FormField';

// ── basic render ──────────────────────────────────────────────────────────────

describe('Textarea — basic render', () => {
  it('renders a native textarea element', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeDefined();
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
  });

  it('has the ui-textarea class', () => {
    const { container } = render(<Textarea />);
    expect(container.querySelector('.ui-textarea')).toBeDefined();
  });

  it('default rows is 4', () => {
    const { container } = render(<Textarea />);
    expect(Number(container.querySelector('.ui-textarea').rows)).toBe(4);
  });

  it('accepts a custom rows value', () => {
    const { container } = render(<Textarea rows={8} />);
    expect(Number(container.querySelector('.ui-textarea').rows)).toBe(8);
  });

  it('default size is "md"', () => {
    const { container } = render(<Textarea />);
    expect(container.querySelector('.ui-textarea').dataset.size).toBe('md');
  });

  it('applies lg size', () => {
    const { container } = render(<Textarea size="lg" />);
    expect(container.querySelector('.ui-textarea').dataset.size).toBe('lg');
  });

  it('applies custom className', () => {
    const { container } = render(<Textarea className="notes-field" />);
    expect(container.querySelector('.ui-textarea').className).toContain('notes-field');
  });

  it('forwards ref to the native textarea', () => {
    const ref = React.createRef();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeDefined();
    expect(ref.current.tagName).toBe('TEXTAREA');
  });

  it('fires onChange', () => {
    const onChange = vi.fn();
    render(<Textarea onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('applies placeholder', () => {
    render(<Textarea placeholder="Enter notes…" />);
    expect(screen.getByPlaceholderText('Enter notes…')).toBeDefined();
  });
});

// ── invalid state ─────────────────────────────────────────────────────────────

describe('Textarea — invalid state', () => {
  it('sets data-invalid when aria-invalid passed', () => {
    const { container } = render(<Textarea aria-invalid />);
    expect(container.querySelector('.ui-textarea').dataset.invalid).toBe('true');
  });

  it('data-invalid absent when not invalid', () => {
    const { container } = render(<Textarea />);
    expect(container.querySelector('.ui-textarea').dataset.invalid).toBeUndefined();
  });

  it('propagates aria-invalid attribute to DOM', () => {
    render(<Textarea aria-invalid />);
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
  });
});

// ── disabled / required ───────────────────────────────────────────────────────

describe('Textarea — disabled and required', () => {
  it('passes disabled prop through', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox').disabled).toBe(true);
  });

  it('passes required prop through', () => {
    const { container } = render(<Textarea required />);
    expect(container.querySelector('.ui-textarea').required).toBe(true);
  });
});

// ── FormField context wiring ──────────────────────────────────────────────────

describe('Textarea — FormField context', () => {
  it('inherits id from FormField so label is linked', () => {
    render(
      <FormField label="Notes">
        <Textarea />
      </FormField>,
    );
    const ta = screen.getByRole('textbox');
    expect(ta.id).toBeTruthy();
    expect(document.querySelector(`label[for="${ta.id}"]`)).toBeDefined();
  });

  it('reflects aria-invalid from FormField error', () => {
    const { container } = render(
      <FormField error="Required">
        <Textarea />
      </FormField>,
    );
    expect(container.querySelector('.ui-textarea').dataset.invalid).toBe('true');
  });

  it('aria-describedby is wired when FormField has hint', () => {
    render(
      <FormField hint="Max 500 characters">
        <Textarea />
      </FormField>,
    );
    expect(screen.getByRole('textbox').getAttribute('aria-describedby')).toBeTruthy();
  });

  it('reflects required from FormField', () => {
    const { container } = render(
      <FormField required label="Notes">
        <Textarea />
      </FormField>,
    );
    expect(container.querySelector('.ui-textarea').required).toBe(true);
  });
});
