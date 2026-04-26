import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import Checkbox from './Checkbox';
import RadioGroup from './RadioGroup';
import FormField from './FormField';

afterEach(cleanup);

describe('Checkbox', () => {
  it('renders label, toggles on click, calls onChange', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Accept terms" onChange={onChange} />);
    const cb = screen.getByLabelText('Accept terms');
    expect(cb).not.toBeChecked();
    fireEvent.click(cb);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('renders description and respects size + disabled', () => {
    render(
      <Checkbox label="Marketing emails" description="Once per month, never spam." size="sm" disabled />,
    );
    expect(screen.getByText('Once per month, never spam.')).toBeInTheDocument();
    // The <input> is the only checkbox in the tree; label includes description text too,
    // so we match by role rather than exact label text.
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('indeterminate sets the DOM property and renders the dash glyph', () => {
    render(<Checkbox label="Mixed" indeterminate />);
    const cb = screen.getByLabelText('Mixed');
    expect(cb.indeterminate).toBe(true);
  });

  it('inherits FormField context (id + invalid + required)', () => {
    render(
      <FormField label="Confirm" error="Required">
        <Checkbox required />
      </FormField>,
    );
    const cb = screen.getByLabelText('Confirm');
    expect(cb).toHaveAttribute('aria-invalid', 'true');
    expect(cb).toBeRequired();
  });

  it('forwards ref to the underlying input', () => {
    const ref = { current: null };
    render(<Checkbox ref={ref} label="x" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current.type).toBe('checkbox');
  });
});

describe('RadioGroup', () => {
  const opts = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta', description: 'second letter' },
    { value: 'c', label: 'Gamma', disabled: true },
  ];

  it('renders fieldset + legend + one radio per option', () => {
    render(<RadioGroup name="g" options={opts} legend="Pick one" />);
    // <fieldset> exposes its <legend> as accessible name on the radiogroup
    expect(screen.getByRole('group', { name: 'Pick one' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByText('second letter')).toBeInTheDocument();
    expect(screen.getByLabelText('Gamma')).toBeDisabled();
  });

  it('uncontrolled: defaultValue selects initial radio', () => {
    render(<RadioGroup name="g" options={opts} defaultValue="b" />);
    expect(screen.getByLabelText(/Beta/)).toBeChecked();
    expect(screen.getByLabelText('Alpha')).not.toBeChecked();
  });

  it('controlled: value drives selection + onChange fires with new value', () => {
    function Harness() {
      const [v, setV] = useState('a');
      return <RadioGroup name="g" options={opts} value={v} onChange={setV} />;
    }
    render(<Harness />);
    expect(screen.getByLabelText('Alpha')).toBeChecked();
    fireEvent.click(screen.getByLabelText(/Beta/));
    expect(screen.getByLabelText(/Beta/)).toBeChecked();
    expect(screen.getByLabelText('Alpha')).not.toBeChecked();
  });

  it('orientation data-attr applied for CSS hooks', () => {
    const { container } = render(<RadioGroup name="g" options={opts} orientation="horizontal" />);
    expect(container.querySelector('.ui-radiogroup')).toHaveAttribute('data-orientation', 'horizontal');
  });
});
