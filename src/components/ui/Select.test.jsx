/**
 * Select.test.jsx
 * Tests for src/components/ui/Select — styled native <select> with
 * options prop or children, placeholder, and FormField context wiring.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Select from './Select';
import FormField from './FormField';

const OPTIONS = [
  { value: 'uae', label: 'UAE' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'us', label: 'United States', disabled: true },
];

// ── basic render ──────────────────────────────────────────────────────────────

describe('Select — basic render', () => {
  it('renders a native select element', () => {
    render(<Select options={OPTIONS} />);
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('wraps in ui-select-wrap span', () => {
    const { container } = render(<Select options={OPTIONS} />);
    expect(container.querySelector('.ui-select-wrap')).toBeDefined();
    expect(container.querySelector('.ui-select-wrap').tagName).toBe('SPAN');
  });

  it('has ui-select class on the select element', () => {
    const { container } = render(<Select options={OPTIONS} />);
    expect(container.querySelector('.ui-select')).toBeDefined();
  });

  it('default size is "md"', () => {
    const { container } = render(<Select options={OPTIONS} />);
    expect(container.querySelector('.ui-select-wrap').dataset.size).toBe('md');
  });

  it('applies sm size', () => {
    const { container } = render(<Select options={OPTIONS} size="sm" />);
    expect(container.querySelector('.ui-select-wrap').dataset.size).toBe('sm');
  });

  it('applies custom className to the wrapper', () => {
    const { container } = render(<Select options={OPTIONS} className="my-sel" />);
    expect(container.querySelector('.ui-select-wrap').className).toContain('my-sel');
  });

  it('forwards ref to the native select', () => {
    const ref = React.createRef();
    render(<Select ref={ref} options={OPTIONS} />);
    expect(ref.current).toBeDefined();
    expect(ref.current.tagName).toBe('SELECT');
  });

  it('fires onChange', () => {
    const onChange = vi.fn();
    render(<Select options={OPTIONS} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'uk' } });
    expect(onChange).toHaveBeenCalledOnce();
  });
});

// ── chevron ───────────────────────────────────────────────────────────────────

describe('Select — chevron', () => {
  it('renders the chevron span', () => {
    const { container } = render(<Select options={OPTIONS} />);
    expect(container.querySelector('.ui-select-wrap__chevron')).toBeDefined();
  });

  it('chevron is aria-hidden', () => {
    const { container } = render(<Select options={OPTIONS} />);
    expect(container.querySelector('.ui-select-wrap__chevron').getAttribute('aria-hidden')).toBe('true');
  });
});

// ── options prop ──────────────────────────────────────────────────────────────

describe('Select — options prop', () => {
  it('renders an option per item', () => {
    render(<Select options={OPTIONS} />);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('option value attributes match', () => {
    render(<Select options={OPTIONS} />);
    const opts = screen.getAllByRole('option');
    expect(opts[0].value).toBe('uae');
    expect(opts[1].value).toBe('uk');
    expect(opts[2].value).toBe('us');
  });

  it('renders disabled option', () => {
    render(<Select options={OPTIONS} />);
    const opt = screen.getByRole('option', { name: 'United States' });
    expect(opt.disabled).toBe(true);
  });
});

// ── placeholder ───────────────────────────────────────────────────────────────

describe('Select — placeholder', () => {
  it('renders a placeholder option when provided', () => {
    const { container } = render(<Select options={OPTIONS} placeholder="Pick country" />);
    const placeholderOpt = container.querySelector('option[value=""]');
    expect(placeholderOpt).toBeDefined();
    expect(placeholderOpt.textContent).toBe('Pick country');
  });

  it('placeholder option value is empty string', () => {
    const { container } = render(<Select options={OPTIONS} placeholder="Pick country" />);
    const placeholderOpt = container.querySelector('option[value=""]');
    expect(placeholderOpt.value).toBe('');
  });

  it('no placeholder option when prop omitted', () => {
    render(<Select options={OPTIONS} />);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });
});

// ── children mode ─────────────────────────────────────────────────────────────

describe('Select — children mode', () => {
  it('renders children options directly', () => {
    render(
      <Select>
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </Select>,
    );
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeDefined();
  });
});

// ── invalid state ─────────────────────────────────────────────────────────────

describe('Select — invalid state', () => {
  it('sets data-invalid on wrapper when aria-invalid passed', () => {
    const { container } = render(<Select options={OPTIONS} aria-invalid />);
    expect(container.querySelector('.ui-select-wrap').dataset.invalid).toBe('true');
  });

  it('data-invalid absent when not invalid', () => {
    const { container } = render(<Select options={OPTIONS} />);
    expect(container.querySelector('.ui-select-wrap').dataset.invalid).toBeUndefined();
  });
});

// ── FormField context wiring ──────────────────────────────────────────────────

describe('Select — FormField context', () => {
  it('inherits id from FormField so label is linked', () => {
    render(
      <FormField label="Country">
        <Select options={OPTIONS} />
      </FormField>,
    );
    const sel = screen.getByRole('combobox');
    expect(sel.id).toBeTruthy();
    expect(document.querySelector(`label[for="${sel.id}"]`)).toBeDefined();
  });

  it('reflects aria-invalid from FormField error', () => {
    const { container } = render(
      <FormField error="Required">
        <Select options={OPTIONS} />
      </FormField>,
    );
    expect(container.querySelector('.ui-select-wrap').dataset.invalid).toBe('true');
  });

  it('aria-describedby wired when FormField has hint', () => {
    render(
      <FormField hint="Choose your country">
        <Select options={OPTIONS} />
      </FormField>,
    );
    expect(screen.getByRole('combobox').getAttribute('aria-describedby')).toBeTruthy();
  });
});
