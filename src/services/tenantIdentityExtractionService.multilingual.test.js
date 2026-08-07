import { describe, expect, it } from 'vitest';
import { parseTenantIdentityText } from './tenantIdentityExtractionService';

describe('parseTenantIdentityText multilingual', () => {
  it('extracts Arabic passport labels', () => {
    const text = `
      الاسم الكامل: احمد عبدالله
      رقم جواز السفر: A1234567
      الجنسية: إماراتي
      تاريخ الميلاد: ١٢/٠٣/١٩٩٠
      تاريخ الانتهاء: ١٢/٠٣/٢٠٣٠
    `;

    const parsed = parseTenantIdentityText(text, 'passport');
    expect(parsed.fullName).toContain('احمد');
    expect(parsed.passportNo).toBe('A1234567');
    expect(parsed.dateOfBirth).toBe('12/03/1990');
    expect(parsed.expiryDate).toBe('12/03/2030');
  });

  it('extracts Arabic residence permit labels', () => {
    const text = `
      الاسم: Mahmoud Ali
      رقم الإقامة: ٢٠٢٤٥٦٧٨
      الجنسية: سوداني
      تاريخ الإصدار: ٠١/٠١/٢٠٢٤
      تاريخ الانتهاء: ٠١/٠١/٢٠٢٦
      الكفيل: White Caves
    `;

    const parsed = parseTenantIdentityText(text, 'residence-permit');
    expect(parsed.permitNo).toBe('20245678');
    expect(parsed.issueDate).toBe('01/01/2024');
    expect(parsed.expiryDate).toBe('01/01/2026');
    expect(parsed.sponsor).toContain('White Caves');
  });
});
