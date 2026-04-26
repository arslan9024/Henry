import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import FormField from './FormField';
import Input from './Input';
import Textarea from './Textarea';
import Select from './Select';
import Modal from './Modal';
import Tooltip from './Tooltip';
import Tabs from './Tabs';
import EmptyState from './EmptyState';

// jsdom doesn't implement HTMLDialogElement; polyfill the bits Modal touches.
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  }
});

afterEach(cleanup);

describe('FormField', () => {
  it('renders label, hint, and wires htmlFor + aria-describedby on the contained Input', () => {
    render(
      <FormField label="Email" hint="We never share.">
        <Input type="email" />
      </FormField>,
    );
    const input = screen.getByLabelText('Email');
    const hint = screen.getByText('We never share.');
    expect(input).toHaveAttribute('aria-describedby', hint.id);
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('error state: renders error, hides hint, sets aria-invalid + role=alert', () => {
    render(
      <FormField label="Phone" hint="Optional" error="Required field">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText('Phone');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
    expect(screen.queryByText('Optional')).toBeNull();
  });

  it('required marker is rendered and aria-hidden', () => {
    render(
      <FormField label="Name" required>
        <Input />
      </FormField>,
    );
    const star = screen.getByText('*');
    expect(star).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByLabelText(/Name/)).toBeRequired();
  });
});

describe('Input', () => {
  it('renders with prefix and suffix slots', () => {
    render(<Input prefix="$" suffix="USD" defaultValue="100" data-testid="amt" />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByTestId('amt')).toHaveValue('100');
  });

  it('forwards ref + custom type', () => {
    const ref = { current: null };
    render(<Input ref={ref} type="email" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current.type).toBe('email');
  });
});

describe('Textarea', () => {
  it('renders rows and inherits FormField context', () => {
    render(
      <FormField label="Notes" error="too short">
        <Textarea rows={6} />
      </FormField>,
    );
    const ta = screen.getByLabelText('Notes');
    expect(ta).toHaveAttribute('rows', '6');
    expect(ta).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Select', () => {
  it('renders options array + placeholder', () => {
    render(
      <Select
        placeholder="Pick one"
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ]}
        defaultValue=""
        aria-label="Greek letter"
      />,
    );
    const sel = screen.getByLabelText('Greek letter');
    expect(sel.tagName).toBe('SELECT');
    // Placeholder option exists in the DOM (sel.options[0]) even though hidden
    expect(sel.options[0]).toHaveTextContent('Pick one');
    expect(sel.options[0]).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('renders children when no options array given', () => {
    render(
      <Select aria-label="Manual">
        <option value="x">X-ray</option>
      </Select>,
    );
    expect(screen.getByRole('option', { name: 'X-ray' })).toBeInTheDocument();
  });
});

describe('Modal', () => {
  function Harness() {
    const [open, setOpen] = useState(true);
    return (
      <Modal open={open} onClose={() => setOpen(false)} title="Confirm">
        <Modal.Body>Proceed?</Modal.Body>
        <Modal.Footer>
          <button type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

  it('renders title, body, footer when open; closes via onClose', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByText('Proceed?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('heading', { name: 'Confirm' })).toBeNull();
  });

  it('header close button fires onClose', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(screen.queryByRole('heading', { name: 'Confirm' })).toBeNull();
  });
});

describe('Tooltip', () => {
  it('shows on focus and hides on blur, wires aria-describedby', () => {
    vi.useFakeTimers();
    render(
      <Tooltip label="Print document" delay={0}>
        <button type="button">Print</button>
      </Tooltip>,
    );
    const btn = screen.getByRole('button', { name: 'Print' });
    act(() => {
      btn.focus();
      vi.runAllTimers();
    });
    const tip = screen.getByRole('tooltip');
    expect(tip).toHaveTextContent('Print document');
    expect(btn.getAttribute('aria-describedby')).toBe(tip.id);
    act(() => {
      btn.blur();
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
    vi.useRealTimers();
  });
});

describe('Tabs', () => {
  const items = [
    { id: 'a', label: 'Alpha', content: <p>panel-a</p> },
    { id: 'b', label: 'Beta', content: <p>panel-b</p> },
    { id: 'c', label: 'Gamma', content: <p>panel-c</p> },
  ];

  it('renders all tabs, only active panel is visible, ARIA wired', () => {
    render(<Tabs items={items} ariaLabel="Sections" />);
    const tablist = screen.getByRole('tablist', { name: 'Sections' });
    expect(tablist).toBeInTheDocument();
    const tabA = screen.getByRole('tab', { name: 'Alpha' });
    expect(tabA).toHaveAttribute('aria-selected', 'true');
    expect(tabA).toHaveAttribute('tabIndex', '0');
    expect(screen.getByText('panel-a')).toBeInTheDocument();
    expect(screen.queryByText('panel-b')).toBeNull();
  });

  it('click activates a tab and shows its panel', () => {
    render(<Tabs items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Beta' }));
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('panel-b')).toBeInTheDocument();
  });

  it('ArrowRight / Home / End move activation', () => {
    render(<Tabs items={items} />);
    const tabA = screen.getByRole('tab', { name: 'Alpha' });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Beta' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Gamma' }), { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });

  it('controlled mode: respects external active + calls onChange', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Tabs items={items} active="b" onChange={onChange} />);
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: 'Gamma' }));
    expect(onChange).toHaveBeenCalledWith('c');
    // External state didn't update, so Beta still active
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    rerender(<Tabs items={items} active="c" onChange={onChange} />);
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('EmptyState', () => {
  it('renders icon + title + description + action with role=status', () => {
    render(
      <EmptyState
        icon={<span data-testid="empty-icon">ICN</span>}
        title="No documents yet"
        description="Generated documents will appear here."
        action={<button type="button">Create</button>}
      />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    // The .ui-empty__icon wrapper is aria-hidden and contains the caller's icon node
    const iconWrap = screen.getByTestId('empty-icon').parentElement;
    expect(iconWrap).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('heading', { name: 'No documents yet' })).toBeInTheDocument();
    expect(screen.getByText('Generated documents will appear here.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });
});
