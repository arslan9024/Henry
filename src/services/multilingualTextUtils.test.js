import { describe, expect, it } from 'vitest';
import {
  detectTextLanguage,
  normalizeArabicDigits,
  normalizeBilingualText,
  pickFirstGroupMatch,
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
});
