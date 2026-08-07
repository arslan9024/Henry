import { describe, expect, it } from 'vitest';
import { parseEmiratesIdText } from './emiratesIdExtractionService';

describe('parseEmiratesIdText multilingual', () => {
  it('extracts Arabic-labeled fields with Arabic numerals', () => {
    const text = `
      الاسم الكامل: محمد علي حسن
      رقم الهوية: ٧٨٤-١٢٣٤-١٢٣٤٥٦٧-١
      تاريخ الإصدار: ٠١/٠٢/٢٠٢٠
      تاريخ الانتهاء: ٠١/٠٢/٢٠٣٠
      الجنسية: مصري
    `;

    const parsed = parseEmiratesIdText(text);
    expect(parsed.fullName).toContain('محمد');
    expect(parsed.idNumber).toBe('784-1234-1234567-1');
    expect(parsed.issuingDate).toBe('01/02/2020');
    expect(parsed.expiryDate).toBe('01/02/2030');
    expect(parsed.nationality).toBe('مصري');
  });
});
