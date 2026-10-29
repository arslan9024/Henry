import { describe, it, expect } from 'vitest';
import {
  parseCleanAmount,
  formatAed,
  addMonthsToDate,
  calculateChequeSchedule,
  calculateSecurityDeposit,
  calculateAgencyCommissionBreakdown,
} from './chequeCalculator';

describe('chequeCalculator service', () => {
  it('parses formatted AED strings into floats', () => {
    expect(parseCleanAmount('35,000.00 AED')).toBe(35000);
    expect(parseCleanAmount('120,500.50')).toBe(120500.5);
    expect(parseCleanAmount('')).toBe(0);
    expect(parseCleanAmount(50000)).toBe(50000);
  });

  it('formats numbers into AED currency format', () => {
    expect(formatAed(35000)).toBe('35,000.00 AED');
    expect(formatAed('5500.2')).toBe('5,500.20 AED');
  });

  it('advances dates across months correctly', () => {
    expect(addMonthsToDate('01-10-2026', 3)).toBe('01-01-2027');
    expect(addMonthsToDate('15/05/2026', 6)).toBe('15-11-2026');
  });

  it('generates a 4-cheque schedule with exact total sum', () => {
    const schedule = calculateChequeSchedule({
      annualRent: '100,000.00 AED',
      chequeCount: 4,
      startDate: '01-01-2026',
    });

    expect(schedule).toHaveLength(4);
    expect(schedule[0].date).toBe('01-01-2026');
    expect(schedule[0].amount).toBe(25000);
    expect(schedule[1].date).toBe('01-04-2026');
    expect(schedule[2].date).toBe('01-07-2026');
    expect(schedule[3].date).toBe('01-10-2026');

    // Total must match exactly
    const sum = schedule.reduce((acc, c) => acc + c.amount, 0);
    expect(sum).toBe(100000);
  });

  it('handles odd amount divisions without 1-fil leakage', () => {
    const schedule = calculateChequeSchedule({
      annualRent: '35,000.00 AED',
      chequeCount: 6,
      startDate: '01-01-2026',
    });

    expect(schedule).toHaveLength(6);
    const sum = schedule.reduce((acc, c) => acc + c.amount, 0);
    expect(Math.round(sum * 100) / 100).toBe(35000);
  });

  it('calculates security deposits for furnished and unfurnished', () => {
    const unfurnished = calculateSecurityDeposit({ annualRent: 60000, isFurnished: false });
    expect(unfurnished.percentage).toBe(5);
    expect(unfurnished.amount).toBe(3000);

    const furnished = calculateSecurityDeposit({ annualRent: 60000, isFurnished: true });
    expect(furnished.percentage).toBe(10);
    expect(furnished.amount).toBe(6000);
  });

  it('calculates agency commission with 5% UAE VAT', () => {
    const res = calculateAgencyCommissionBreakdown({
      annualRent: 100000,
      commissionPct: 5,
      vatPct: 5,
    });

    expect(res.commissionAmount).toBe(5000);
    expect(res.vatAmount).toBe(250);
    expect(res.totalDue).toBe(5250);
  });
});
