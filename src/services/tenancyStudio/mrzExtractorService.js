/**
 * [Category 5: Processing Engine]
 * Machine Readable Zone (MRZ) Algorithmic Parser
 * Supports:
 *   - TD1: 3 lines of 30 characters (Emirates ID / National ID back)
 *   - TD3: 2 lines of 44 characters (Passports)
 * Converts 2-digit YYMMDD dates to ISO YYYY-MM-DD with century heuristics.
 */

export function formatMrzDate(yymmdd, isExpiry = false) {
  if (!yymmdd || String(yymmdd).length < 6) return '';
  const s = String(yymmdd);
  const yy = parseInt(s.substring(0, 2), 10);
  const mm = s.substring(2, 4);
  const dd = s.substring(4, 6);

  const currentYear = new Date().getFullYear();
  const currentYY = currentYear % 100;

  let fullYear;
  if (isExpiry) {
    // Expiry date is usually in the 2000s
    fullYear = 2000 + yy;
  } else {
    // Birthdate century heuristic: if YY > currentYY, 1900s, else 2000s
    fullYear = yy > currentYY + 5 ? 1900 + yy : 2000 + yy;
  }

  return `${fullYear}-${mm}-${dd}`;
}

export function extractMrzLines(rawLines) {
  if (!Array.isArray(rawLines)) return null;

  const candidateLines = rawLines
    .map((l) =>
      String(l || '')
        .replace(/\s+/g, '')
        .toUpperCase(),
    )
    .filter((l) => l.includes('<') && l.length >= 26);

  // Check for 3-line TD1 MRZ (ID cards: ~30 characters)
  if (candidateLines.length >= 3) {
    const last3 = candidateLines.slice(-3);
    if (last3.every((l) => l.length >= 27 && l.length <= 32)) {
      return {
        type: 'TD1',
        lines: last3.map((l) => l.padEnd(30, '<').substring(0, 30)),
      };
    }
  }

  // Check for 2-line TD3 MRZ (Passports: ~44 characters)
  if (candidateLines.length >= 2) {
    const last2 = candidateLines.slice(-2);
    if (last2.every((l) => l.length >= 38 && l.length <= 46)) {
      return {
        type: 'TD3',
        lines: last2.map((l) => l.padEnd(44, '<').substring(0, 44)),
      };
    }
  }

  return null;
}

export function parseMrzBlock(mrzBlock) {
  if (!mrzBlock || !mrzBlock.lines) return null;
  const { type, lines } = mrzBlock;

  try {
    if (type === 'TD3' && lines.length >= 2) {
      // Passport format:
      // Line 1: P<ISSUER SURNAME<<GIVEN_NAMES<<<<<<<<<<<<<<<<<<
      // Line 2: DOC_NO<CHECK NATIONALITY DOB<CHECK SEX EXPIRY<CHECK OPTIONAL
      const line1 = lines[0];
      const line2 = lines[1];

      const documentCode = line1.substring(0, 2).replace(/</g, '');
      const issuingState = line1.substring(2, 5).replace(/</g, '');
      const nameSection = line1.substring(5);
      const nameParts = nameSection
        .split('<<')
        .map((part) => (part || '').replace(/</g, ' ').trim())
        .filter(Boolean);
      const surname = nameParts[0] || '';
      const givenNames = nameParts.slice(1).join(' ');

      const documentNumber = line2.substring(0, 9).replace(/</g, '');
      const nationality = line2.substring(10, 13).replace(/</g, '');
      const birthDateRaw = line2.substring(13, 19);
      const sex = line2.substring(20, 21).replace(/</g, 'U');
      const expiryDateRaw = line2.substring(21, 27);

      return {
        type: 'TD3_PASSPORT',
        documentCode,
        issuingState,
        surname,
        givenNames,
        fullName: [givenNames, surname].filter(Boolean).join(' '),
        documentNumber,
        nationality,
        birthDate: formatMrzDate(birthDateRaw, false),
        sex,
        expiryDate: formatMrzDate(expiryDateRaw, true),
      };
    }

    if (type === 'TD1' && lines.length >= 3) {
      // ID Card format (e.g. Emirates ID Back):
      // Line 1: I<ISSUER DOC_NO<<<<<<<<<<<<<<<<
      // Line 2: DOB<CHECK SEX EXPIRY<CHECK NATIONALITY OPTIONAL
      // Line 3: SURNAME<<GIVEN_NAMES<<<<<<<<<<<<<<<<<<<<<<
      const line1 = lines[0];
      const line2 = lines[1];
      const line3 = lines[2];

      const documentCode = line1.substring(0, 2).replace(/</g, '');
      const issuingState = line1.substring(2, 5).replace(/</g, '');
      const documentNumber = line1.substring(5, 14).replace(/</g, '');

      const birthDateRaw = line2.substring(0, 6);
      const sex = line2.substring(7, 8).replace(/</g, 'U');
      const expiryDateRaw = line2.substring(8, 14);
      const nationality = line2.substring(15, 18).replace(/</g, '');

      const td1Parts = line3
        .split('<<')
        .map((part) => (part || '').replace(/</g, ' ').trim())
        .filter(Boolean);
      const surname = td1Parts[0] || '';
      const givenNames = td1Parts.slice(1).join(' ');

      return {
        type: 'TD1_ID_CARD',
        documentCode,
        issuingState,
        surname,
        givenNames,
        fullName: [givenNames, surname].filter(Boolean).join(' '),
        documentNumber,
        nationality,
        birthDate: formatMrzDate(birthDateRaw, false),
        sex,
        expiryDate: formatMrzDate(expiryDateRaw, true),
      };
    }
  } catch (err) {
    console.error('Failed to parse MRZ block:', err);
  }

  return null;
}
