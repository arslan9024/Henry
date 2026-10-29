// FILE: js/engine/receipt_pdf_builder.js
/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - Agency Fee Payment Receipt PDF Binary Vector Builder
 * Dedicated exclusively to appending the Payment Receipt (Page 6) directly into a pdf-lib PDFDocument instance.
 * Single-responsibility: Zero Canvas API calls, zero DOM structure manipulation.
 */

window.ReceiptPdfBuilder = {
    appendPageToPdfDoc: function (pdfDoc, params) {
        const p = params || (window.ReceiptData ? window.ReceiptData.params : {});
        if (!p.include_receipt) return 0;

        const page = pdfDoc.addPage([595, 842]);

        // 1. Mountain Logo
        if (typeof page.drawPolygon === "function") {
            page.drawPolygon({ points: [{ x: 390, y: 842 - 115 }, { x: 415, y: 842 - 72 }, { x: 435, y: 842 - 115 }], color: { r: 0.86, g: 0.15, b: 0.15 } });
            page.drawPolygon({ points: [{ x: 418, y: 842 - 115 }, { x: 445, y: 842 - 65 }, { x: 472, y: 842 - 115 }], color: { r: 0.28, g: 0.33, b: 0.41 } });
            page.drawPolygon({ points: [{ x: 455, y: 842 - 115 }, { x: 475, y: 842 - 78 }, { x: 495, y: 842 - 115 }], color: { r: 0.86, g: 0.15, b: 0.15 } });
            page.drawPolygon({ points: [{ x: 433, y: 842 - 115 }, { x: 445, y: 842 - 86 }, { x: 457, y: 842 - 115 }], color: { r: 1, g: 1, b: 1 } });
        }

        page.drawText("WHITE CAVES REAL ESTATE LLC", { x: 390, y: 842 - 125, size: 7.0, bold: true, color: { r: 0.72, g: 0.11, b: 0.11 } });
        page.drawText('"Future Real Estate Buy And Sell With Confidence"', { x: 382, y: 842 - 133, size: 5.5, bold: false, color: { r: 0.4, g: 0.45, b: 0.52 } });
        page.drawText("Payment Receipt", { x: 88, y: 842 - 156, size: 20, bold: true, color: { r: 0.06, g: 0.09, b: 0.16 } });
        page.drawLine({ start: { x: 88, y: 842 - 161 }, end: { x: 262, y: 842 - 161 }, thickness: 1.6, color: { r: 0.06, g: 0.09, b: 0.16 } });

        // 2. Bill From / To Box
        const boxX = 45, boxTop = 182, boxW = 505, boxH = 110, midX = 245;
        if (typeof page.drawRectangle === "function") {
            page.drawRectangle({ x: boxX, y: 842 - (boxTop + boxH), width: boxW, height: boxH, borderWidth: 0.9, borderColor: { r: 0.12, g: 0.16, b: 0.23 } });
        }
        page.drawLine({ start: { x: midX, y: 842 - boxTop }, end: { x: midX, y: 842 - (boxTop + boxH) }, thickness: 0.9, color: { r: 0.12, g: 0.16, b: 0.23 } });

        page.drawText("Bill From:", { x: boxX + 6, y: 842 - (boxTop + 16), size: 10, bold: false });
        page.drawText(p.bill_from || "", { x: boxX + 6, y: 842 - (boxTop + 31), size: 10.5, bold: false });
        page.drawText("To:", { x: midX + 6, y: 842 - (boxTop + 16), size: 10, bold: false });
        page.drawText("Tenant Name:", { x: midX + 6, y: 842 - (boxTop + 42), size: 10, bold: false });
        page.drawText(p.tenant_name || "", { x: midX + 6, y: 842 - (boxTop + 57), size: 9.5, bold: false });

        // 3. Payment Rows Table
        const tblTop = 324, rowH = 25, colSplitX = 174;
        const rows = [
            ["Payment Details:", p.property_summary || ""],
            ["Rent", p.rent_display || ""],
            ["Agency Fee", p.agency_fee_display || ""],
            ["Total", p.total_display || ""]
        ];
        const tblH = rowH * rows.length;
        if (typeof page.drawRectangle === "function") {
            page.drawRectangle({ x: boxX, y: 842 - (tblTop + tblH), width: boxW, height: tblH, borderWidth: 0.9, borderColor: { r: 0.12, g: 0.16, b: 0.23 } });
        }
        page.drawLine({ start: { x: colSplitX, y: 842 - tblTop }, end: { x: colSplitX, y: 842 - (tblTop + tblH) }, thickness: 0.9, color: { r: 0.12, g: 0.16, b: 0.23 } });

        rows.forEach((r, idx) => {
            const ry = tblTop + idx * rowH;
            if (idx > 0) page.drawLine({ start: { x: boxX, y: 842 - ry }, end: { x: boxX + boxW, y: 842 - ry }, thickness: 0.9, color: { r: 0.12, g: 0.16, b: 0.23 } });
            page.drawText(r[0], { x: boxX + 6, y: 842 - (ry + 16.5), size: 10, bold: false });
            page.drawText(r[1], { x: colSplitX + 6, y: 842 - (ry + 16.5), size: 10, bold: false });
        });

        page.drawText(p.acknowledgment_text || "", { x: boxX + 12, y: 842 - (tblTop + tblH + 22), size: 9.8, bold: false });
        if (p.signatory_name) {
            page.drawText(`Signed: ${p.signatory_name}`, { x: 325, y: 842 - 480, size: 10, bold: true, color: { r: 0.12, g: 0.22, b: 0.45 } });
        }
        page.drawText("WHITE CAVES REAL ESTATE L.L.C - DUBAI, U.A.E", { x: 385, y: 842 - 498, size: 7.5, bold: true, color: { r: 0.15, g: 0.38, b: 0.85 } });
        page.drawText(`Contact US: Mobile: ${p.contact_mobile || ''} Email: ${p.contact_email || ''}`, { x: 36, y: 842 - 764, size: 9.5, bold: false, color: { r: 0.06, g: 0.09, b: 0.16 } });

        return 12;
    }
};

