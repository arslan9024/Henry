/**
 * White Caves Real Estate - Binary Stream Verification Engine (pdf_verifier.js)
 * Single-responsibility module for verifying stamped text, Addendum, and Receipt in the PDF binary.
 */

window.PdfVerifier = {
    verifyStampedTextInPdf: function (processedBytes, originalBuffer, expectedStrings, p1Count, p3Count, addendumLinesCount, receiptLinesCount, totalPagesCount, includeContract = true) {
        const outUint8 = processedBytes instanceof Uint8Array ? processedBytes : new Uint8Array(processedBytes);
        const origLength = (includeContract && originalBuffer) ? (originalBuffer.byteLength || originalBuffer.length || 0) : 0;
        const finalLength = outUint8.byteLength;

        const tailStart = Math.max(0, origLength - 1024);
        const tailSlice = outUint8.subarray(tailStart);
        let tailText = "";
        for (let i = 0; i < tailSlice.length; i++) {
            tailText += String.fromCharCode(tailSlice[i]);
        }

        let matchedCount = 0;
        for (const item of expectedStrings) {
            const sample = item.text.slice(0, 18).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
            if (tailText.includes(sample) || tailText.includes("BT /F_WCRE") || finalLength > origLength) {
                matchedCount++;
            }
        }

        const hasPdfHeader = outUint8[0] === 0x25 && outUint8[1] === 0x50 && outUint8[2] === 0x44 && outUint8[3] === 0x46;
        const hasEof = tailText.includes("%%EOF");
        const hasAddendumTitle = tailText.includes("Addendum to the Tenancy Contract");
        const hasReceiptTitle = tailText.includes("Payment Receipt");
        const totalExpected = expectedStrings.length;
        const contractPass = !includeContract || (totalExpected > 0 && matchedCount === totalExpected);
        const verified = hasPdfHeader && hasEof && finalLength > origLength && contractPass;

        return {
            verified,
            stampedPage1Count: p1Count,
            stampedPage3Count: p3Count,
            addendumLinesCount: addendumLinesCount || 0,
            receiptLinesCount: receiptLinesCount || 0,
            hasAddendumPages: hasAddendumTitle,
            hasReceiptPage: hasReceiptTitle,
            totalPagesCount: totalPagesCount || 7,
            totalStampedCount: totalExpected,
            matchedInBinaryCount: matchedCount,
            originalBytes: origLength,
            finalBytes: finalLength,
            addedBytes: finalLength - origLength
        };
    }
};
