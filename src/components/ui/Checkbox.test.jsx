/**
 * Checkbox.test.jsx
 * Tests for src/components/ui/Checkbox — styled native checkbox with label,
 * description, indeterminate support, and FormField context wiring.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Checkbox from './Checkbox';
import FormField from './FormField';

// ── basic render ──────────────────────────────────────────────────────────────

describe('Checkbox — basic render', () => {
  it('renders a checkbox input', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeDefined();
  });

  it('has the ui-checkbox class on the label wrapper', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('.ui-checkbox')).toBeDefined();
  });

  it('renders a <label> as the outer element', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('label.ui-checkbox')).toBeDefined();
  });

  it('default size is "md"', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('.ui-checkbox').dataset.size).toBe('md');
  });

  it('applies sm size', () => {
    const { container } = render(<Checkbox size="sm" />);
    expect(container.querySelector('.ui-checkbox').dataset.size).toBe('sm');
  });

  it('renders ui-checkbox__box span', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('.ui-checkbox__box')).toBeDefined();
  });

  it('box span is aria-hidden', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('.ui-checkbox__box').getAttribute('aria-hidden')).toBe('true');
  });
});

// ── label + description ───────────────────────────────────────────────────────

describe('Checkbox — label and description', () => {
  it('renders label text', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeDefined();
  });

  it('renders description text', () => {
    render(<Checkbox label="Subscribe" description="Get weekly updates" />);
    expect(screen.getByText('Get weekly updates')).toBeDefined();
  });

  it('does not render text wrapper when neither label nor description', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('.ui-checkbox__text')).toBeNull();
  });

  it('renders text wrapper when only description provided', () => {
    const { container } = render(<Checkbox description="Helper" />);
    expect(container.querySelector('.ui-checkbox__desc')).toBeDefined();
  });
});

// ── checked / onChange ────────────────────────────────────────────────────────

describe('Checkbox — interaction', () => {
  it('starts unchecked by default', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox').checked).toBe(false);
  });

  it('calls onChange when clicked (uncontrolled)', () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('reflects defaultChecked prop', () => {
    render(<Checkbox defaultChecked />);
    expect(screen.getByRole('checkbox').checked).toBe(true);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole('checkbox').disabled).toBe(true);
  });
});

// ── indeterminate ─────────────────────────────────────────────────────────────

describe('Checkbox — indeterminate', () => {
  it('renders a <line> in the SVG when indeterminate', () => {
    const { container } = render(<Checkbox indeterminate />);
    expect(container.querySelector('svg line')).toBeDefined();
    expect(container.querySelector('svg polyline')).toBeNull();
  });

  it('renders a <polyline> (check mark) when not indeterminate', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('svg polyline')).toBeDefined();
    expect(container.querySelector('svg line')).toBeNull();
  });
});

// ── invalid state ─────────────────────────────────────────────────────────────

describe('Checkbox — invalid state', () => {
  it('data-invalid is set when aria-invalid prop passed', () => {
    const { container } = render(<Checkbox aria-invalid />);
    expect(container.querySelector('.ui-checkbox').dataset.invalid).toBe('true');
  });

  it('data-invalid is absent when not invalid', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('.ui-checkbox').dataset.invalid).toBeUndefined();
  });
});

// ── FormField context wiring ──────────────────────────────────────────────────

describe('Checkbox — FormField context', () => {
  it('inherits id from FormField context', () => {
    render(
      <FormField label="Agree">
        <Checkbox />
      </FormField>,
    );
    const checkbox = screen.getByRole('checkbox');
    // FormField generates an id and label htmlFor points to it
    expect(checkbox.id).toBeTruthy();
    expect(document.querySelector(`label[for="${checkbox.id}"]`)).toBeDefined();
  });

  it('reflects invalid=true from FormField error', () => {
    const { container } = render(
      <FormField error="Required">
        <Checkbox />
      </FormField>,
    );
    expect(container.querySelector('.ui-checkbox').dataset.invalid).toBe('true');
  });
});
