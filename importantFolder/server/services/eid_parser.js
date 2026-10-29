// FILE: server/services/eid_parser.js
/**
 * White Caves Real Estate - Emirates ID Front Parser Layer
 * Extracts unique Card ID using precise regex: 784-YYYY-NNNNNNN-X, Full Name, and Nationality.
 */

const EidParser = {
    /**
     * Parses OCR text lines for Emirates ID Front properties.
     */
    parse: function (rawText, ocrLines) {
        const text = String(rawText || '');
        const lines = ocrLines || text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        const result = {
            idNumber: '',
            fullName: '',
            nationality: '',
            expiryDate: '',
            cardType: 'EMIRATES_ID_FRONT'
        };

        // 1. Precise Emirates ID Regex: 784-YYYY-NNNNNNN-X (allowing optional hyphens or spaces)
        const idMatch = text.match(/\b(784)[-\s]?(\d{4})[-\s]?(\d{7})[-\s]?(\d{1})\b/);
        if (idMatch) {
            result.idNumber = `784-${idMatch[2]}-${idMatch[3]}-${idMatch[4]}`;
        }

        // 2. Full Name Extraction (Lines following "Name:" or English capital text lines)
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const nameIdx = line.search(/\bName[:\s]/i);
            if (nameIdx !== -1) {
                const afterName = line.substring(nameIdx).replace(/^Name[:\s]*/i, '').trim();
                if (afterName.length > 2) {
                    result.fullName = afterName;
                    break;
                } else if (i + 1 < lines.length) {
                    result.fullName = lines[i + 1].trim();
                    break;
                }
            }
        }

        // If Name label not explicitly found, search for prominent all-caps name line
        if (!result.fullName) {
            const candidateName = lines.find(l => 
                /^[A-Z\s]{4,45}$/.test(l) && 
                !l.includes('UNITED ARAB EMIRATES') && 
                !l.includes('FEDERAL AUTHORITY') && 
                !l.includes('RESIDENT IDENTITY CARD')
            );
            if (candidateName) result.fullName = candidateName.trim();
        }

        // 3. Nationality Extraction
        const natMatch = text.match(/(?:Nationality|Nation)[:\s]+([A-Za-z\s]{3,25})/i);
        if (natMatch) {
            result.nationality = natMatch[1].trim();
        }

        // 4. Expiry Date (DD/MM/YYYY or DD-MM-YYYY)
        const expMatch = text.match(/(?:Expiry|Expiry Date)[:\s]+(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i)
            || text.match(/\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/);
        if (expMatch) {
            result.expiryDate = expMatch[1].replace(/\//g, '-');
        }

        return result;
    }
};

module.exports = EidParser;
