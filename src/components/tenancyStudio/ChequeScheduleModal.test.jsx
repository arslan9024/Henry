/**
 * [Category 1: View Test]
 * Tests for ChequeScheduleModal & ChequeScheduleTable
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChequeScheduleModal } from './ChequeScheduleModal';

describe('ChequeScheduleModal Component', () => {
  const dummySchedule = [
    { index: 1, date: '01-10-2026', amountFormatted: '25,000 AED', memo: '1st Installment' },
    { index: 2, date: '01-01-2027', amountFormatted: '25,000 AED', memo: '2nd Installment' },
  ];

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ChequeScheduleModal
        isOpen={false}
        onClose={vi.fn()}
        schedule={dummySchedule}
        chequeCount={2}
        annualRent="50,000 AED"
        startDate="01-10-2026"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders table rows and handles close', () => {
    const onClose = vi.fn();
    render(
      <ChequeScheduleModal
        isOpen={true}
        onClose={onClose}
        schedule={dummySchedule}
        chequeCount={2}
        annualRent="50,000 AED"
        startDate="01-10-2026"
      />,
    );

    expect(screen.getByText(/Dubai Cheque Installment Schedule \(2 Cheques\)/i)).toBeInTheDocument();
    expect(screen.getAllByText('01-10-2026').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('01-01-2027')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /^Close Schedule$/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
