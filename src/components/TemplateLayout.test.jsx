/**
 * TemplateLayout.test.jsx
 * Tests for src/components/TemplateLayout — minimal shell wrapper that
 * renders a <section class="doc-shell"> with an optional h2 title and children.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TemplateLayout from './TemplateLayout';

// ── structure ─────────────────────────────────────────────────────────────────

describe('TemplateLayout — structure', () => {
  it('renders a section with class doc-shell', () => {
    const { container } = render(<TemplateLayout />);
    expect(container.querySelector('section.doc-shell')).toBeDefined();
  });

  it('renders a div.doc-page inside doc-shell', () => {
    const { container } = render(<TemplateLayout />);
    expect(container.querySelector('.doc-shell .doc-page')).toBeDefined();
  });
});

// ── title prop ────────────────────────────────────────────────────────────────

describe('TemplateLayout — title prop', () => {
  it('renders an h2 when title is provided', () => {
    render(<TemplateLayout title="Booking Form" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Booking Form' })).toBeDefined();
  });

  it('h2 has class doc-title', () => {
    const { container } = render(<TemplateLayout title="Invoice" />);
    expect(container.querySelector('h2.doc-title')).toBeDefined();
  });

  it('does not render an h2 when title is not provided', () => {
    render(<TemplateLayout />);
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
  });

  it('does not render h2 when title is null', () => {
    render(<TemplateLayout title={null} />);
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
  });
});

// ── children ──────────────────────────────────────────────────────────────────

describe('TemplateLayout — children', () => {
  it('renders children inside doc-page', () => {
    const { container } = render(
      <TemplateLayout>
        <p data-testid="child">Content</p>
      </TemplateLayout>,
    );
    const child = container.querySelector('.doc-page p[data-testid="child"]');
    expect(child).toBeDefined();
    expect(child.textContent).toBe('Content');
  });

  it('renders multiple children', () => {
    const { container } = render(
      <TemplateLayout>
        <span>A</span>
        <span>B</span>
      </TemplateLayout>,
    );
    const spans = container.querySelectorAll('.doc-page span');
    expect(spans.length).toBe(2);
  });

  it('renders no children gracefully (no crash)', () => {
    const { container } = render(<TemplateLayout title="Empty" />);
    expect(container.querySelector('.doc-page')).toBeDefined();
  });
});

// ── combined ──────────────────────────────────────────────────────────────────

describe('TemplateLayout — combined title + children', () => {
  it('title appears before children in the DOM', () => {
    const { container } = render(
      <TemplateLayout title="Contract">
        <p>Body text</p>
      </TemplateLayout>,
    );
    const page = container.querySelector('.doc-page');
    const nodes = Array.from(page.childNodes).filter((n) => n.nodeType === 1); // element nodes
    expect(nodes[0].tagName).toBe('H2');
    expect(nodes[1].tagName).toBe('P');
  });
});
