import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import SectionToc from './SectionToc';

afterEach(cleanup);

describe('SectionToc (T-44)', () => {
  const sections = [
    { id: 'sec-a', label: 'Agreement', icon: '📝' },
    { id: 'sec-b', label: 'Broker', icon: '🧑‍💼' },
    { id: 'sec-c', label: 'Tenant', icon: '👤' },
  ];

  it('renders nothing for empty sections', () => {
    const { container } = render(<SectionToc sections={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nav and all section items', () => {
    render(<SectionToc sections={sections} />);
    expect(screen.getByRole('navigation', { name: /quick sections/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agreement/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /broker/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tenant/i })).toBeInTheDocument();
  });

  it('marks first item active by default', () => {
    render(<SectionToc sections={sections} />);
    expect(screen.getByRole('button', { name: /agreement/i })).toHaveAttribute('aria-current', 'true');
  });

  it('scrolls to target and marks clicked item active', () => {
    const target = document.createElement('section');
    target.id = 'sec-b';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(<SectionToc sections={sections} />);
    fireEvent.click(screen.getByRole('button', { name: /broker/i }));

    expect(target.scrollIntoView).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /broker/i })).toHaveAttribute('aria-current', 'true');

    target.remove();
  });

  it('updates URL hash through replaceState when jumping', () => {
    const target = document.createElement('section');
    target.id = 'sec-c';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    render(<SectionToc sections={sections} />);
    fireEvent.click(screen.getByRole('button', { name: /tenant/i }));

    expect(replaceSpy).toHaveBeenCalled();

    replaceSpy.mockRestore();
    target.remove();
  });
});
