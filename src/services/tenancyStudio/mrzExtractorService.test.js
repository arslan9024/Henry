import { describe, it, expect } from 'vitest';
import { formatMrzDate, extractMrzLines, parseMrzBlock } from './mrzExtractorService';

describe('mrzExtractorService', () => {
  it('formats MRZ dates correctly with century heuristics', () => {
    // 920515 -> 1992-05-15 (birth date)
    expect(formatMrzDate('920515', false)).toBe('1992-05-15');
    // 281030 -> 2028-10-30 (expiry date)
    expect(formatMrzDate('281030', true)).toBe('2028-10-30');
  });

  it('extracts candidate TD3 2-line passport MRZ lines', () => {
    const rawLines = [
      'Some header line',
      'P<D<<DOE<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      '1234567890D<<9001015M2801015<<<<<<<<<<<<<<02',
    ];

    const block = extractMrzLines(rawLines);
    expect(block).not.toBeNull();
    expect(block?.type).toBe('TD3');
    expect(block?.lines).toHaveLength(2);
  });

  it('parses TD3 Passport block into structured fields', () => {
    const block = {
      type: 'TD3',
      lines: ['P<UAEAL<<MANSOORI<<MOHAMMED<<<<<<<<<<<<<<<<<', 'N1234567<0ARE9205151M2805154<<<<<<<<<<<<<<06'],
    };

    const parsed = parseMrzBlock(block);
    expect(parsed).not.toBeNull();
    expect(parsed?.documentNumber).toBe('N1234567');
    expect(parsed?.fullName).toContain('MOHAMMED');
    expect(parsed?.birthDate).toBe('1992-05-15');
    expect(parsed?.expiryDate).toBe('2028-05-15');
  });

  it('parses TD1 3-line ID card block', () => {
    const block = {
      type: 'TD1',
      lines: [
        'I<ARE784199276543219<<<<<<<<<<',
        '9205151M2805154ARE<<<<<<<<<<<6',
        'AL<<MANSOORI<<MOHAMMED<<<<<<<<',
      ],
    };

    const parsed = parseMrzBlock(block);
    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe('TD1_ID_CARD');
    expect(parsed?.documentNumber).toBe('784199276');
    expect(parsed?.birthDate).toBe('1992-05-15');
  });
});
