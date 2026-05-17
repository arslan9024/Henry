/**
 * Card.test.jsx
 * Tests for the src/components/ui/Card component and its sub-components:
 *   Card, Card.Header, Card.Body, Card.Footer
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from './Card';

// ── base Card ─────────────────────────────────────────────────────────────────

describe('Card — base', () => {
  it('renders children', () => {
    render(<Card>Hello Card</Card>);
    expect(screen.getByText('Hello Card')).toBeDefined();
  });

  it('has the ui-card class', () => {
    const { container } = render(<Card>X</Card>);
    expect(container.querySelector('.ui-card')).toBeDefined();
  });

  it('default variant is "surface"', () => {
    const { container } = render(<Card>X</Card>);
    expect(container.querySelector('.ui-card').dataset.variant).toBe('surface');
  });

  it('default padding is "md"', () => {
    const { container } = render(<Card>X</Card>);
    expect(container.querySelector('.ui-card').dataset.padding).toBe('md');
  });

  it('interactive prop sets data-interactive attribute', () => {
    const { container } = render(<Card interactive>X</Card>);
    expect(container.querySelector('.ui-card').dataset.interactive).toBeDefined();
  });

  it('data-interactive is absent when interactive=false', () => {
    const { container } = render(<Card>X</Card>);
    expect(container.querySelector('.ui-card').dataset.interactive).toBeUndefined();
  });

  it('applies a custom variant', () => {
    const { container } = render(<Card variant="elevated">X</Card>);
    expect(container.querySelector('.ui-card').dataset.variant).toBe('elevated');
  });

  it('applies outlined variant', () => {
    const { container } = render(<Card variant="outlined">X</Card>);
    expect(container.querySelector('.ui-card').dataset.variant).toBe('outlined');
  });

  it('renders as <div> by default', () => {
    const { container } = render(<Card>X</Card>);
    expect(container.querySelector('.ui-card').tagName).toBe('DIV');
  });

  it('renders as <section> when as="section"', () => {
    const { container } = render(<Card as="section">X</Card>);
    expect(container.querySelector('.ui-card').tagName).toBe('SECTION');
  });

  it('passes extra className', () => {
    const { container } = render(<Card className="my-card">X</Card>);
    expect(container.querySelector('.ui-card').className).toContain('my-card');
  });

  it('passes extra props (e.g. data-testid)', () => {
    render(<Card data-testid="test-card">X</Card>);
    expect(screen.getByTestId('test-card')).toBeDefined();
  });
});

// ── sub-components ────────────────────────────────────────────────────────────

describe('Card.Header', () => {
  it('renders children', () => {
    render(<Card.Header>Header Text</Card.Header>);
    expect(screen.getByText('Header Text')).toBeDefined();
  });

  it('has ui-card__header class', () => {
    const { container } = render(<Card.Header>H</Card.Header>);
    expect(container.querySelector('.ui-card__header')).toBeDefined();
  });

  it('passes extra className', () => {
    const { container } = render(<Card.Header className="hdr">H</Card.Header>);
    expect(container.querySelector('.ui-card__header').className).toContain('hdr');
  });
});

describe('Card.Body', () => {
  it('renders children', () => {
    render(<Card.Body>Body content</Card.Body>);
    expect(screen.getByText('Body content')).toBeDefined();
  });

  it('has ui-card__body class', () => {
    const { container } = render(<Card.Body>B</Card.Body>);
    expect(container.querySelector('.ui-card__body')).toBeDefined();
  });
});

describe('Card.Footer', () => {
  it('renders children', () => {
    render(<Card.Footer>Footer content</Card.Footer>);
    expect(screen.getByText('Footer content')).toBeDefined();
  });

  it('has ui-card__footer class', () => {
    const { container } = render(<Card.Footer>F</Card.Footer>);
    expect(container.querySelector('.ui-card__footer')).toBeDefined();
  });
});

describe('Card — composed usage', () => {
  it('renders Header + Body + Footer together', () => {
    render(
      <Card>
        <Card.Header>Title</Card.Header>
        <Card.Body>Content</Card.Body>
        <Card.Footer>Actions</Card.Footer>
      </Card>,
    );
    expect(screen.getByText('Title')).toBeDefined();
    expect(screen.getByText('Content')).toBeDefined();
    expect(screen.getByText('Actions')).toBeDefined();
  });
});
