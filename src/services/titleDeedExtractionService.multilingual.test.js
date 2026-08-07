import { describe, expect, it } from 'vitest';
import { parseTitleDeedText } from './titleDeedExtractionService';

describe('parseTitleDeedText multilingual', () => {
  it('extracts Arabic title deed labels and normalizes mortgage status', () => {
    const text = `
      سند الملكية
      تاريخ الإصدار: ٠٥/٠٦/٢٠٢٥
      حالة الرهن: غير مرهونة
      نوع العقار: شقة
      المجتمع: دبي مارينا
      رقم القطعة: ١٢٣
      المساحة بالمتر المربع: ١٢٠.٥
      اسم المالك: Ahmed Khalid
    `;

    const parsed = parseTitleDeedText(text);
    expect(parsed.documentType).toBe('Title Deed');
    expect(parsed.issueDate).toBe('05/06/2025');
    expect(parsed.mortgageStatus).toBe('Not mortgaged');
    expect(parsed.plotNo).toBe('123');
    expect(parsed.areaSqMeter).toBe(120.5);
    expect(parsed.ownerName).toContain('Ahmed');
  });
});
