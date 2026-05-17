/**
 * Tabs.test.jsx
 * Tests for src/components/ui/Tabs — accessible WAI-ARIA tabs with keyboard nav.
 *
 * Covers:
 *   - Uncontrolled: first tab active by default
 *   - Uncontrolled: defaultActive prop
 *   - Click to switch tabs and show panel content
 *   - ARIA: role=tablist, role=tab, aria-selected, role=tabpanel, aria-labelledby
 *   - Keyboard: ArrowRight, ArrowLeft, Home, End
 *   - Controlled mode: active prop + onChange callback
 *   - Disabled tab
 *   - Custom className + ariaLabel
 */
import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tabs from './Tabs';

// ── fixture ───────────────────────────────────────────────────────────────────

const items = [
  { id: 'overview', label: 'Overview', content: <div>Overview content</div> },
  { id: 'rules', label: 'Rules', content: <div>Rules content</div> },
  { id: 'history', label: 'History', content: <div>History content</div> },
];

// ── structure ─────────────────────────────────────────────────────────────────

describe('Tabs — structure', () => {
  it('renders a tablist', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tablist')).toBeDefined();
  });

  it('renders one tab button per item', () => {
    render(<Tabs items={items} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('renders tab labels', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'Rules' })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'History' })).toBeDefined();
  });

  it('renders tabpanel elements (including hidden)', () => {
    render(<Tabs items={items} />);
    expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3);
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(<Tabs items={items} className="my-tabs" />);
    expect(container.querySelector('.ui-tabs').className).toContain('my-tabs');
  });

  it('applies ariaLabel to the tablist', () => {
    render(<Tabs items={items} ariaLabel="Document tabs" />);
    expect(screen.getByRole('tablist').getAttribute('aria-label')).toBe('Document tabs');
  });
});

// ── uncontrolled default ──────────────────────────────────────────────────────

describe('Tabs — uncontrolled defaults', () => {
  it('first tab is selected by default', () => {
    render(<Tabs items={items} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
  });

  it('first tab content is visible by default', () => {
    render(<Tabs items={items} />);
    expect(screen.getByText('Overview content')).toBeDefined();
  });

  it('non-active panels are hidden', () => {
    const { container } = render(<Tabs items={items} />);
    const panels = container.querySelectorAll('[role="tabpanel"]');
    // hidden attribute present on inactive panels
    expect(panels[1].hidden).toBe(true);
    expect(panels[2].hidden).toBe(true);
  });

  it('defaultActive selects the specified tab', () => {
    render(<Tabs items={items} defaultActive="rules" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Rules content')).toBeDefined();
  });
});

// ── click interaction ─────────────────────────────────────────────────────────

describe('Tabs — click to switch', () => {
  it('clicking a tab makes it active', () => {
    render(<Tabs items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Rules' }));
    expect(screen.getByRole('tab', { name: 'Rules' }).getAttribute('aria-selected')).toBe('true');
  });

  it('clicking a tab shows its content', () => {
    render(<Tabs items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Rules' }));
    expect(screen.getByText('Rules content')).toBeDefined();
  });

  it('previously active tab becomes inactive after switch', () => {
    render(<Tabs items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Rules' }));
    expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected')).toBe('false');
  });
});

// ── keyboard navigation ───────────────────────────────────────────────────────

describe('Tabs — keyboard navigation', () => {
  it('ArrowRight moves to next tab', () => {
    render(<Tabs items={items} />);
    const first = screen.getByRole('tab', { name: 'Overview' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Rules' }).getAttribute('aria-selected')).toBe('true');
  });

  it('ArrowLeft moves to previous tab', () => {
    render(<Tabs items={items} defaultActive="rules" />);
    const second = screen.getByRole('tab', { name: 'Rules' });
    second.focus();
    fireEvent.keyDown(second, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected')).toBe('true');
  });

  it('ArrowRight wraps from last to first', () => {
    render(<Tabs items={items} defaultActive="history" />);
    const last = screen.getByRole('tab', { name: 'History' });
    last.focus();
    fireEvent.keyDown(last, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected')).toBe('true');
  });

  it('ArrowLeft wraps from first to last', () => {
    render(<Tabs items={items} />);
    const first = screen.getByRole('tab', { name: 'Overview' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'History' }).getAttribute('aria-selected')).toBe('true');
  });

  it('Home jumps to first tab', () => {
    render(<Tabs items={items} defaultActive="history" />);
    const last = screen.getByRole('tab', { name: 'History' });
    last.focus();
    fireEvent.keyDown(last, { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected')).toBe('true');
  });

  it('End jumps to last tab', () => {
    render(<Tabs items={items} />);
    const first = screen.getByRole('tab', { name: 'Overview' });
    first.focus();
    fireEvent.keyDown(first, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'History' }).getAttribute('aria-selected')).toBe('true');
  });
});

// ── controlled mode ───────────────────────────────────────────────────────────

describe('Tabs — controlled mode', () => {
  it('uses the active prop for the selected tab', () => {
    render(<Tabs items={items} active="rules" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Rules' }).getAttribute('aria-selected')).toBe('true');
  });

  it('calls onChange with the clicked tab id', () => {
    const onChange = vi.fn();
    render(<Tabs items={items} active="overview" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'History' }));
    expect(onChange).toHaveBeenCalledWith('history');
  });

  it('controlled component does not change internally without prop update', () => {
    render(<Tabs items={items} active="overview" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Rules' }));
    // still 'overview' because no state update
    expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected')).toBe('true');
  });
});

// ── ARIA wiring ───────────────────────────────────────────────────────────────

describe('Tabs — ARIA wiring', () => {
  it('each tab aria-controls the matching panel id', () => {
    render(<Tabs items={items} />);
    const tab = screen.getByRole('tab', { name: 'Overview' });
    const panelId = tab.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    expect(panel).toBeDefined();
    expect(panel.getAttribute('role')).toBe('tabpanel');
  });

  it('each panel aria-labelledby its tab id', () => {
    render(<Tabs items={items} />);
    const tab = screen.getByRole('tab', { name: 'Rules' });
    const panelId = tab.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
  });

  it('active tab has tabIndex=0', () => {
    render(<Tabs items={items} />);
    const first = screen.getByRole('tab', { name: 'Overview' });
    expect(first.getAttribute('tabIndex')).toBe('0');
  });

  it('inactive tab has tabIndex=-1', () => {
    render(<Tabs items={items} />);
    const second = screen.getByRole('tab', { name: 'Rules' });
    expect(second.getAttribute('tabIndex')).toBe('-1');
  });
});

// ── disabled tab ─────────────────────────────────────────────────────────────

describe('Tabs — disabled tab', () => {
  it('disabled tab is disabled in the DOM', () => {
    const withDisabled = [
      ...items.slice(0, 2),
      { id: 'history', label: 'History', content: <div>H</div>, disabled: true },
    ];
    render(<Tabs items={withDisabled} />);
    expect(screen.getByRole('tab', { name: 'History' }).disabled).toBe(true);
  });
});
