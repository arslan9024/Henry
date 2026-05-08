/**
 * EmptyState.test.jsx
 * Tests for the src/components/ui/EmptyState component.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState — minimal render', () => {
  it('renders without crashing with no props', () => {
    const { container } = render(<EmptyState />);
    expect(container.querySelector('.ui-empty')).toBeDefined();
  });

  it('has role="status"', () => {
    render(<EmptyState />);
    expect(screen.getByRole('status')).toBeDefined();
  });
});

describe('EmptyState — icon', () => {
  it('renders the icon when provided', () => {
    render(<EmptyState icon="📋" />);
    expect(screen.getByText('📋')).toBeDefined();
  });

  it('icon container has aria-hidden="true"', () => {
    const { container } = render(<EmptyState icon="📋" />);
    expect(container.querySelector('.ui-empty__icon').getAttribute('aria-hidden')).toBe('true');
  });

  it('does not render icon container when icon is omitted', () => {
    const { container } = render(<EmptyState />);
    expect(container.querySelector('.ui-empty__icon')).toBeNull();
  });
});

describe('EmptyState — title', () => {
  it('renders the title as h3', () => {
    render(<EmptyState title="No documents" />);
    expect(screen.getByRole('heading', { level: 3 })).toBeDefined();
    expect(screen.getByText('No documents')).toBeDefined();
  });

  it('does not render h3 when title is omitted', () => {
    const { container } = render(<EmptyState />);
    expect(container.querySelector('h3')).toBeNull();
  });
});

describe('EmptyState — description', () => {
  it('renders the description paragraph', () => {
    render(<EmptyState description="Your documents will appear here." />);
    expect(screen.getByText('Your documents will appear here.')).toBeDefined();
  });

  it('does not render description when omitted', () => {
    const { container } = render(<EmptyState />);
    expect(container.querySelector('.ui-empty__desc')).toBeNull();
  });
});

describe('EmptyState — action', () => {
  it('renders an action node when provided', () => {
    render(<EmptyState action={<button>Create</button>} />);
    expect(screen.getByRole('button', { name: 'Create' })).toBeDefined();
  });

  it('does not render action container when omitted', () => {
    const { container } = render(<EmptyState />);
    expect(container.querySelector('.ui-empty__action')).toBeNull();
  });
});

describe('EmptyState — composed', () => {
  it('renders all parts together', () => {
    render(
      <EmptyState
        icon="🗂️"
        title="Nothing here yet"
        description="Generated documents will appear here."
        action={<button>Add Document</button>}
      />,
    );
    expect(screen.getByText('🗂️')).toBeDefined();
    expect(screen.getByText('Nothing here yet')).toBeDefined();
    expect(screen.getByText('Generated documents will appear here.')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Add Document' })).toBeDefined();
  });

  it('applies a custom className', () => {
    const { container } = render(<EmptyState className="my-empty" />);
    expect(container.querySelector('.ui-empty').className).toContain('my-empty');
  });
});
