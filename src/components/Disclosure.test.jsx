import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Disclosure from './Disclosure';

describe('<Disclosure />', () => {
  it('renders collapsed by default with aria-expanded=false', () => {
    render(
      <Disclosure title="Section A">
        <p>hidden</p>
      </Disclosure>,
    );
    const header = screen.getByRole('button', { name: /section a/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not mount children until first open (lazy by default)', () => {
    render(
      <Disclosure title="Section A">
        <p>secret</p>
      </Disclosure>,
    );
    expect(screen.queryByText('secret')).toBeNull();
  });

  it('clicking the header toggles open and mounts children', async () => {
    const user = userEvent.setup();
    render(
      <Disclosure title="Section A">
        <p>secret</p>
      </Disclosure>,
    );
    const header = screen.getByRole('button', { name: /section a/i });
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('keeps children mounted after closing again (preserves form state)', async () => {
    const user = userEvent.setup();
    render(
      <Disclosure title="A">
        <input data-testid="i" />
      </Disclosure>,
    );
    const header = screen.getByRole('button', { name: /^a$/i });
    await user.click(header); // open
    const input = screen.getByTestId('i');
    await user.type(input, 'hello');
    await user.click(header); // close
    await user.click(header); // open again
    // Same node, value preserved.
    expect(screen.getByTestId('i')).toHaveValue('hello');
  });

  it('defaultOpen=true mounts children immediately and starts expanded', () => {
    render(
      <Disclosure title="A" defaultOpen>
        <p>visible</p>
      </Disclosure>,
    );
    expect(screen.getByRole('button', { name: /^a$/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('visible')).toBeInTheDocument();
  });

  it('renders the badge prop when provided', () => {
    render(
      <Disclosure title="A" badge="3">
        <p />
      </Disclosure>,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('controlled mode: open prop wins, onOpenChange fires on click', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Disclosure title="A" open={false} onOpenChange={onOpenChange}>
        <p>x</p>
      </Disclosure>,
    );
    const header = screen.getByRole('button', { name: /^a$/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    await user.click(header);
    // Internal state did NOT flip (controlled); callback was called with true.
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    // Parent commits the new value.
    rerender(
      <Disclosure title="A" open onOpenChange={onOpenChange}>
        <p>x</p>
      </Disclosure>,
    );
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });

  it('aria-controls + role="region" wire header to body', () => {
    render(
      <Disclosure title="A" defaultOpen>
        <p>x</p>
      </Disclosure>,
    );
    const header = screen.getByRole('button', { name: /^a$/i });
    const region = screen.getByRole('region', { name: /^a$/i });
    expect(header.getAttribute('aria-controls')).toBe(region.id);
  });
});
