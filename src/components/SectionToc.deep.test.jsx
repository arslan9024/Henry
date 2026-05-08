/**
 * SectionToc.deep.test.jsx
 *
 * Deep coverage for SectionToc: filtering/cleaning logic, custom props,
 * hash deduplication, icon rendering, and multiple-section state management.
 */
import React from 'react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import SectionToc from './SectionToc';

afterEach(cleanup);

const secA = { id: 'sec-a', label: 'Overview', icon: '📋' };
const secB = { id: 'sec-b', label: 'Details', icon: '📝' };
const secC = { id: 'sec-c', label: 'Summary' }; // no icon

// ── Null / empty guards ───────────────────────────────────────────────────────

describe('SectionToc — empty/null guards', () => {
  it('renders null for undefined sections prop', () => {
    const { container } = render(<SectionToc />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null for null sections prop', () => {
    const { container } = render(<SectionToc sections={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null for empty array', () => {
    const { container } = render(<SectionToc sections={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('filters out sections with missing id', () => {
    const { container } = render(<SectionToc sections={[{ label: 'No ID' }, secA]} />);
    expect(screen.queryByRole('button', { name: /No ID/i })).toBeNull();
    expect(screen.getByRole('button', { name: /Overview/i })).toBeInTheDocument();
  });

  it('filters out sections with empty id string', () => {
    render(<SectionToc sections={[{ id: '  ', label: 'Blank ID' }, secA]} />);
    expect(screen.queryByRole('button', { name: /Blank ID/i })).toBeNull();
  });

  it('filters out sections with missing label', () => {
    render(<SectionToc sections={[{ id: 'x' }, secA]} />);
    // Only secA should render
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('filters out sections with empty label string', () => {
    render(<SectionToc sections={[{ id: 'y', label: '   ' }, secA]} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('filters out null entries in the array', () => {
    render(<SectionToc sections={[null, secA, undefined, secB]} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('renders null when all sections are filtered out', () => {
    const { container } = render(
      <SectionToc sections={[{ label: 'No ID' }, null, { id: '', label: 'X' }]} />,
    );
    expect(container.firstChild).toBeNull();
  });
});

// ── Custom props ──────────────────────────────────────────────────────────────

describe('SectionToc — custom props', () => {
  it('custom className is applied to the nav', () => {
    render(<SectionToc sections={[secA]} className="my-custom" />);
    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('my-custom');
    expect(nav.className).toContain('section-toc');
  });

  it('custom title prop sets aria-label on the nav', () => {
    render(<SectionToc sections={[secA]} title="Page outline" />);
    expect(screen.getByRole('navigation', { name: /page outline/i })).toBeInTheDocument();
  });

  it('custom title is rendered as visible label text', () => {
    render(<SectionToc sections={[secA]} title="Jump to" />);
    expect(screen.getByText('Jump to')).toBeInTheDocument();
  });

  it('default title is "Quick sections"', () => {
    render(<SectionToc sections={[secA]} />);
    expect(screen.getByRole('navigation', { name: /quick sections/i })).toBeInTheDocument();
  });
});

// ── Icon rendering ────────────────────────────────────────────────────────────

describe('SectionToc — icon rendering', () => {
  it('renders icon span with aria-hidden="true" when icon provided', () => {
    render(<SectionToc sections={[secA]} />);
    const btn = screen.getByRole('button', { name: /Overview/i });
    const iconSpan = btn.querySelector('[aria-hidden="true"]');
    expect(iconSpan).not.toBeNull();
    expect(iconSpan.textContent).toContain('📋');
  });

  it('does NOT render icon span when no icon prop', () => {
    render(<SectionToc sections={[secC]} />);
    const btn = screen.getByRole('button', { name: /Summary/i });
    const iconSpan = btn.querySelector('[aria-hidden="true"]');
    expect(iconSpan).toBeNull();
  });
});

// ── Active state management ───────────────────────────────────────────────────

describe('SectionToc — active state', () => {
  it('first item has aria-current="true" by default', () => {
    render(<SectionToc sections={[secA, secB, secC]} />);
    expect(screen.getByRole('button', { name: /Overview/i })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: /Details/i })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: /Summary/i })).not.toHaveAttribute('aria-current');
  });

  it('clicking a different section makes it active', () => {
    const target = document.createElement('section');
    target.id = 'sec-b';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(<SectionToc sections={[secA, secB]} />);
    fireEvent.click(screen.getByRole('button', { name: /Details/i }));

    expect(screen.getByRole('button', { name: /Details/i })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: /Overview/i })).not.toHaveAttribute('aria-current');
    target.remove();
  });

  it('only ONE item has aria-current="true" at any time', () => {
    const target = document.createElement('section');
    target.id = 'sec-c';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(<SectionToc sections={[secA, secB, secC]} />);
    fireEvent.click(screen.getByRole('button', { name: /Summary/i }));

    const active = screen.getAllByRole('button').filter((b) => b.getAttribute('aria-current') === 'true');
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveAccessibleName(/Summary/i);
    target.remove();
  });

  it('clicking a section with no matching DOM element is a no-op (no crash, no active change)', () => {
    render(<SectionToc sections={[secA, secB]} />);
    // sec-b does NOT exist in DOM — click should not throw and active stays on secA
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: /Details/i }));
    }).not.toThrow();
    // active should NOT switch since the element wasn't found (early return)
    expect(screen.getByRole('button', { name: /Overview/i })).toHaveAttribute('aria-current', 'true');
  });
});

// ── scrollIntoView called ─────────────────────────────────────────────────────

describe('SectionToc — scroll behaviour', () => {
  it('calls scrollIntoView on jump', () => {
    const target = document.createElement('section');
    target.id = 'sec-a';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(<SectionToc sections={[secA, secB]} />);
    fireEvent.click(screen.getByRole('button', { name: /Overview/i }));

    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    target.remove();
  });

  it('replaceState is NOT called again when hash already matches', () => {
    const target = document.createElement('section');
    target.id = 'sec-a';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    // Pre-set the hash so it already equals #sec-a
    window.history.replaceState(null, '', '#sec-a');
    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    render(<SectionToc sections={[secA, secB]} />);
    fireEvent.click(screen.getByRole('button', { name: /Overview/i }));

    // replaceState should NOT be called because hash already matches
    expect(replaceSpy).not.toHaveBeenCalled();
    replaceSpy.mockRestore();
    window.history.replaceState(null, '', '/');
    target.remove();
  });
});
