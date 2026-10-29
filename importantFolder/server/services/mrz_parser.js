// FILE: server/services/mrz_parser.js
/**
 * White Caves Real Estate - Algorithmic MRZ Parsing Layer (Passport & Emirates ID Back)
 * Uses the 'mrz' library to isolate, clean, and parse 2-line (TD3) and 3-line (TD1) MRZ blocks,
 * with standard date conversion from YYMMDD to YYYY-MM-DD.
 */

let mrz;
try {
    mrz = require('mrz');
} catch (e) {
    console.warn('[MrzParser] mrz package not yet loaded.');
}

const MrzParser = {
    /**
     * Converts MRZ 2-digit date (YYMMDD) into standard ISO YYYY-MM-DD.
     */
    formatMrzDate: function (yymmdd, isExpiry = false) {
        if (!yymmdd || String(yymmdd).length < 6) return '';
        const s = String(yymmdd);
        const yy = parseInt(s.substring(0, 2), 10);
        const mm = s.substring(2, 4);
        const dd = s.substring(4, 6);

        const currentYear = new Date().getFullYear();
        const currentYY = currentYear % 100;

        let fullYear;
        if (isExpiry) {
            fullYear = 2000 + yy;
        } else {
            // Birthdate century heuristic: if YY > currentYY, 1900s, else 2000s
            fullYear = (yy > currentYY + 5) ? (1900 + yy) : (2000 + yy);
        }

        return `${fullYear}-${mm}-${dd}`;
    },

    /**
     * Detects and extracts candidate MRZ lines from raw OCR lines.
     */
    extractMrzLines: function (ocrLines) {
        const candidateLines = (ocrLines || [])
            .map(l => l.replace(/\s+/g, '').toUpperCase())
            .filter(l => l.includes('<') && l.length >= 28);

        // Check for 3-line MRZ (TD1 - ID card back: typically 30 chars each)
        if (candidateLines.length >= 3) {
            const last3 = candidateLines.slice(-3);
            if (last3.every(l => l.length >= 28 && l.length <= 32)) {
                return { type: 'TD1', lines: last3.map(l => l.padEnd(30, '<').substring(0, 30)) };
            }
        }

        // Check for 2-line MRZ (TD3 - Passport data page: typically 44 chars each)
        if (candidateLines.length >= 2) {
            const last2 = candidateLines.slice(-2);
            if (last2.every(l => l.length >= 40 && l.length <= 46)) {
                return { type: 'TD3', lines: last2.map(l => l.padEnd(44, '<').substring(0, 44)) };
            }
        }

        return null;
    },

    /**
     * Parses candidate MRZ lines into structured JSON.
     */
    parse: function (ocrLines) {
        const detected = this.extractMrzLines(ocrLines);
        if (!detected) return null;

        try {
            if (mrz && typeof mrz.parse === 'function') {
                const parsed = mrz.parse(detected.lines);
                if (parsed && parsed.fields) {
                    const f = parsed.fields;
                    return {
                        isValid: parsed.valid || false,
                        mrzFormat: detected.type,
                        documentNumber: f.documentNumber || '',
                        documentCode: f.documentCode || '',
                        nationality: f.nationality || '',
                        issuingState: f.issuingState || '',
                        firstName: f.firstName || '',
                        lastName: f.lastName || '',
                        fullName: [f.firstName, f.lastName].filter(Boolean).join(' '),
                        birthDate: this.formatMrzDate(f.birthDate, false),
                        expiryDate: this.formatMrzDate(f.expirationDate, true),
                        sex: f.sex || '',
                        rawLines: detected.lines
                    };
                }
            }
        } catch (err) {
            console.warn('[MrzParser] Formal mrz.parse failed, running regex fallback:', err.message);
        }

        // Lightweight regex fallback for 2-line passport MRZ
        if (detected.type === 'TD3' && detected.lines.length === 2) {
            const line1 = detected.lines[0];
            const line2 = detected.lines[1];
            const docNum = line2.substring(0, 9).replace(/</g, '').trim();
            const nat = line2.substring(10, 13).replace(/</g, '').trim();
            const dob = this.formatMrzDate(line2.substring(13, 19), false);
            const sex = line2.substring(20, 21);
            const exp = this.formatMrzDate(line2.substring(21, 27), true);
            const nameParts = line1.substring(5).split('<<');
            const lastName = nameParts[0] ? nameParts[0].replace(/</g, ' ').trim() : '';
            const firstName = nameParts[1] ? nameParts[1].replace(/</g, ' ').trim() : '';

            return {
                isValid: true,
                mrzFormat: 'TD3',
                documentNumber: docNum,
                nationality: nat,
                firstName: firstName,
                lastName: lastName,
                fullName: [firstName, lastName].filter(Boolean).join(' '),
                birthDate: dob,
                expiryDate: exp,
                sex: sex,
                rawLines: detected.lines
            };
        }

        return null;
    }
};

module.exports = MrzParser;

