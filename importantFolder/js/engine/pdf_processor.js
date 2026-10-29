// FILE: js/engine/pdf_processor.js
/**
 * [Category 5: Processing Engine - OUTBOUND STAMPING ONLY]
 * White Caves Real Estate - Isolated Positioning, 7-Page PDF Stamping & Combiner Engine (pdf_processor.js)
 * 
 * ⚠️ ARCHITECTURAL ISOLATION:
 * Consumes Outbound Stamping Coordinates strictly from DefaultContractMapper / ContractMapper (contract_mapper.js)
 * to draw text onto the NEW BLANK TEMPLATE (Tenancy Contract Template.pdf).
 * This file has ZERO involvement with reading or parsing old tenancy contracts.
 * 
 * Stamps Page 1 (24 fields + Tick Mark) & Page 3 (5 unnumbered clauses) onto Tenancy Contract Template.pdf,
 * appends the 3-page Addendum (Pages 4-6) and Payment Receipt (Page 7), and verifies the binary.
 */

window.PdfProcessor = {
    executeStampingPipeline: async function (templateBuffer, payloadData, includeAddendum = true, includeReceipt = true, includeContract = true) {
        if (includeContract && (!templateBuffer || templateBuffer.byteLength === 0)) {
            throw new Error("Target DLD template PDF buffer is empty or missing.");
        }

        const libInstance = await window.PdfLibraryLoader.resolveLibraryInstance();
        if (!libInstance || !libInstance.PDFDocument) {
            throw new Error("Core PDF compilation engine failed to initialize.");
        }

        const pdfDoc = includeContract
            ? await libInstance.PDFDocument.load(templateBuffer)
            : await libInstance.PDFDocument.create();
        const pages = pdfDoc.getPages();

        let font = null;
        try {
            if (libInstance.StandardFonts && typeof pdfDoc.embedFont === "function") {
                font = await pdfDoc.embedFont(libInstance.StandardFonts.HelveticaBold || libInstance.StandardFonts.Helvetica);
            }
        } catch (fontErr) {}

        const textColor = typeof libInstance.rgb === "function"
            ? libInstance.rgb(0.05, 0.12, 0.28)
            : { r: 0.05, g: 0.12, b: 0.28 };

        const positionCoordinates = window.ContractMapper;
        let stampedPage1Count = 0;
        let stampedPage3Count = 0;
        let addendumLinesCount = 0;
        let receiptLinesCount = 0;
        const expectedStrings = [];

        if (includeContract) {
            for (const key in positionCoordinates.page1) {
                const textValue = (payloadData.page1 && payloadData.page1[key]) ? String(payloadData.page1[key]).trim() : "";
                const position = positionCoordinates.page1[key];
                if (textValue !== "" && pages && pages[0]) {
                    pages[0].drawText(textValue, {
                        x: parseFloat(position.x),
                        y: parseFloat(position.y),
                        size: parseFloat(position.size || 8.5),
                        font: font,
                        color: textColor
                    });
                    stampedPage1Count++;
                    expectedStrings.push({ page: 1, key, text: textValue, x: position.x, y: position.y });
                }
            }

            const targetPage3Index = pages.length >= 3 ? 2 : pages.length - 1;
            for (const key in positionCoordinates.page3) {
                const rawText = (payloadData.page3 && payloadData.page3[key]) ? String(payloadData.page3[key]).trim() : "";
                const cleanText = rawText.replace(/^\s*\d+[\.\)\-]\s*/, "").trim();
                const position = positionCoordinates.page3[key];
                if (cleanText !== "" && pages && pages[targetPage3Index]) {
                    pages[targetPage3Index].drawText(cleanText, {
                        x: parseFloat(position.x),
                        y: parseFloat(position.y),
                        size: parseFloat(position.size || 7.5),
                        font: font,
                        color: textColor
                    });
                    stampedPage3Count++;
                    expectedStrings.push({ page: 3, key, text: cleanText, x: position.x, y: position.y });
                }
            }
        }

        if (includeAddendum && window.AddendumEngine && typeof pdfDoc.addPage === "function") {
            addendumLinesCount = window.AddendumEngine.appendAddendumPagesToPdfDoc(pdfDoc);
        }

        if (includeReceipt && window.ReceiptEngine && typeof pdfDoc.addPage === "function") {
            receiptLinesCount = window.ReceiptEngine.appendReceiptPageToPdfDoc(pdfDoc);
        }

        const totalPagesCount = pdfDoc.getPages().length;
        const processedBytes = await pdfDoc.save();

        const verification = window.PdfVerifier.verifyStampedTextInPdf(
            processedBytes,
            templateBuffer,
            expectedStrings,
            stampedPage1Count,
            stampedPage3Count,
            addendumLinesCount,
            receiptLinesCount,
            totalPagesCount,
            includeContract
        );

        if (!verification.verified) {
            throw new Error("PDF Stamping Verification Failed: Text streams were not detected in the output PDF binary.");
        }

        return { processedBytes, verification };
    }
};
