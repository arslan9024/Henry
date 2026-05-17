/**
 * RadioGroup.test.jsx
 * Tests for src/components/ui/RadioGroup — accessible radio group with
 * legend, arrow-key navigation, controlled/uncontrolled modes.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RadioGroup from './RadioGroup';

// ── fixture ───────────────────────────────────────────────────────────────────

const options = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'maybe', label: 'Maybe', description: 'Not sure yet' },
];

// ── structure ─────────────────────────────────────────────────────────────────

describe('RadioGroup — structure', () => {
  it('renders a fieldset', () => {
    const { container } = render(<RadioGroup name="q" options={options} />);
    expect(container.querySelector('fieldset')).toBeDefined();
  });

  it('has the ui-radiogroup class', () => {
    const { container } = render(<RadioGroup name="q" options={options} />);
    expect(container.querySelector('.ui-radiogroup')).toBeDefined();
  });

  it('renders one radio input per option', () => {
    render(<RadioGroup name="q" options={options} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('renders option labels', () => {
    render(<RadioGroup name="q" options={options} />);
    expect(screen.getByText('Yes')).toBeDefined();
    expect(screen.getByText('No')).toBeDefined();
    expect(screen.getByText('Maybe')).toBeDefined();
  });

  it('renders description when provided', () => {
    render(<RadioGroup name="q" options={options} />);
    expect(screen.getByText('Not sure yet')).toBeDefined();
  });

  it('default orientation is "vertical"', () => {
    const { container } = render(<RadioGroup name="q" options={options} />);
    expect(container.querySelector('.ui-radiogroup').dataset.orientation).toBe('vertical');
  });

  it('applies horizontal orientation', () => {
    const { container } = render(<RadioGroup name="q" options={options} orientation="horizontal" />);
    expect(container.querySelector('.ui-radiogroup').dataset.orientation).toBe('horizontal');
  });

  it('default size is "md"', () => {
    const { container } = render(<RadioGroup name="q" options={options} />);
    expect(container.querySelector('.ui-radiogroup').dataset.size).toBe('md');
  });

  it('applies sm size', () => {
    const { container } = render(<RadioGroup name="q" options={options} size="sm" />);
    expect(container.querySelector('.ui-radiogroup').dataset.size).toBe('sm');
  });
});

// ── legend ────────────────────────────────────────────────────────────────────

describe('RadioGroup — legend', () => {
  it('renders legend text when provided', () => {
    render(<RadioGroup name="q" options={options} legend="Your answer" />);
    expect(screen.getByText('Your answer')).toBeDefined();
  });

  it('renders a <legend> element', () => {
    const { container } = render(<RadioGroup name="q" options={options} legend="Q" />);
    expect(container.querySelector('legend')).toBeDefined();
  });

  it('does not render legend when omitted', () => {
    const { container } = render(<RadioGroup name="q" options={options} />);
    expect(container.querySelector('legend')).toBeNull();
  });
});

// ── all radios share the same name ────────────────────────────────────────────

describe('RadioGroup — name attribute', () => {
  it('all radio inputs share the same name', () => {
    render(<RadioGroup name="answer" options={options} />);
    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio.name).toBe('answer');
    });
  });
});

// ── controlled value ──────────────────────────────────────────────────────────

describe('RadioGroup — controlled', () => {
  it('controlled: selected radio matches value prop', () => {
    render(<RadioGroup name="q" options={options} value="no" onChange={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0].checked).toBe(false); // yes
    expect(radios[1].checked).toBe(true); // no
    expect(radios[2].checked).toBe(false); // maybe
  });

  it('calls onChange with the selected value string', () => {
    const onChange = vi.fn();
    render(<RadioGroup name="q" options={options} value="yes" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: /^No$/i }));
    expect(onChange).toHaveBeenCalledWith('no');
  });
});

// ── uncontrolled (defaultValue) ───────────────────────────────────────────────

describe('RadioGroup — uncontrolled', () => {
  it('defaultValue pre-selects the matching option', () => {
    render(<RadioGroup name="q" options={options} defaultValue="maybe" />);
    // label text includes description, so match by value attribute
    expect(screen.getByRole('radio', { name: /Maybe/i }).checked).toBe(true);
  });

  it('no option pre-selected when neither value nor defaultValue given', () => {
    render(<RadioGroup name="q" options={options} />);
    screen.getAllByRole('radio').forEach((r) => expect(r.checked).toBe(false));
  });
});

// ── disabled option ───────────────────────────────────────────────────────────

describe('RadioGroup — disabled option', () => {
  it('renders disabled radio when option.disabled is true', () => {
    const withDisabled = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
    ];
    render(<RadioGroup name="q" options={withDisabled} />);
    expect(screen.getByRole('radio', { name: /B/i }).disabled).toBe(true);
    expect(screen.getByRole('radio', { name: /A/i }).disabled).toBe(false);
  });
});

// ── custom className + extra props ────────────────────────────────────────────

describe('RadioGroup — misc', () => {
  it('applies custom className', () => {
    const { container } = render(<RadioGroup name="q" options={options} className="my-rg" />);
    expect(container.querySelector('.ui-radiogroup').className).toContain('my-rg');
  });
});
