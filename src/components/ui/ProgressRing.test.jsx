import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ProgressRing from './ProgressRing';

afterEach(cleanup);

describe('ProgressRing', () => {
  it('renders role=progressbar with aria-valuenow as percent (0..100)', () => {
    render(<ProgressRing value={3} max={6} label="Tenant progress" />);
    const ring = screen.getByRole('progressbar', { name: 'Tenant progress' });
    expect(ring).toHaveAttribute('aria-valuenow', '50');
    expect(ring).toHaveAttribute('aria-valuemin', '0');
    expect(ring).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows Y/X label when max != 100 (typical Henry section count)', () => {
    render(<ProgressRing value={2} max={5} />);
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  it('shows percent label when max == 100', () => {
    render(<ProgressRing value={42} max={100} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('respects showLabel=false', () => {
    const { container } = render(<ProgressRing value={1} max={2} showLabel={false} />);
    expect(container.querySelector('.ui-progress-ring__text')).toBeNull();
  });

  it('clamps over-range values', () => {
    render(<ProgressRing value={20} max={10} label="x" />);
    expect(screen.getByRole('progressbar', { name: 'x' })).toHaveAttribute('aria-valuenow', '100');
  });

  it('handles zero/missing value safely', () => {
    render(<ProgressRing value={undefined} max={5} label="empty" />);
    expect(screen.getByRole('progressbar', { name: 'empty' })).toHaveAttribute('aria-valuenow', '0');
  });

  it('auto tone resolves to success at 100%, warning when partial, neutral when empty', () => {
    const { container, rerender } = render(<ProgressRing value={0} max={5} label="z" />);
    expect(container.querySelector('.ui-progress-ring')).toHaveAttribute('data-tone', 'neutral');
    rerender(<ProgressRing value={3} max={5} label="z" />);
    expect(container.querySelector('.ui-progress-ring')).toHaveAttribute('data-tone', 'warning');
    rerender(<ProgressRing value={5} max={5} label="z" />);
    expect(container.querySelector('.ui-progress-ring')).toHaveAttribute('data-tone', 'success');
  });

  it('explicit tone overrides auto', () => {
    const { container } = render(<ProgressRing value={5} max={5} tone="danger" label="z" />);
    expect(container.querySelector('.ui-progress-ring')).toHaveAttribute('data-tone', 'danger');
  });

  it('size data-attr applied for CSS hooks', () => {
    const { container } = render(<ProgressRing value={1} max={2} size="lg" label="z" />);
    expect(container.querySelector('.ui-progress-ring')).toHaveAttribute('data-size', 'lg');
  });
});
