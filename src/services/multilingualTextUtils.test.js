import { describe, expect, it } from 'vitest';
import {
  detectTextLanguage,
  normalizeArabicDigits,
  normalizeBilingualText,
  pickFirstGroupMatch,
  resolvePreferredBilingualValue,
  stripArabicDiacritics,
} from './multilingualTextUtils';

describe('multilingualTextUtils', () => {
  it('converts Arabic digits to Latin digits', () => {
    expect(normalizeArabicDigits('٧٨٤-١٢٣')).toBe('784-123');
  });

  it('removes Arabic diacritics while preserving base letters', () => {
    expect(stripArabicDiacritics('مُحَمَّد')).toBe('محمد');
  });

  it('detects mixed Arabic and English text', () => {
    const info = detectTextLanguage('Name: محمد Ali');
    expect(info.language).toBe('mixed');
  });

  it('extracts first matching bilingual group from text variants', () => {
    const value = pickFirstGroupMatch(
      ['Name: Ahmed', 'الاسم: أحمد'],
      [/(?:الاسم)\s*[:-]?\s*([^\n\r]+)/i, /(?:Name)\s*[:-]?\s*([^\n\r]+)/i],
    );

    expect(value).toBeTruthy();
  });

  it('normalizes Arabic punctuation and whitespace', () => {
    expect(normalizeBilingualText('الاسم،   محمد')).toBe('الاسم, محمد');
  });

  it('resolves English value when preference is en and both variants exist', () => {
    const result = resolvePreferredBilingualValue({
      english: 'Ahmed Ali',
      arabic: 'أحمد علي',
      preference: 'en',
    });

    expect(result.value).toBe('Ahmed Ali');
    expect(result.selectedLanguage).toBe('en');
    expect(result.hasBoth).toBe(true);
  });

  it('falls back to Arabic when preference is ar and English is missing', () => {
    const result = resolvePreferredBilingualValue({
      primary: 'محمد علي',
      arabic: 'محمد علي',
      english: '',
      preference: 'ar',
    });

    expect(result.value).toBe('محمد علي');
    expect(result.selectedLanguage).toBe('ar');
  });
});
