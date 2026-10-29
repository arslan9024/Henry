// FILE: js/engine/addendum_pdf_builder.js
/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - 2-Page Official RERA Addendum PDF Binary Vector Builder
 * Dedicated exclusively to appending Addendum Pages 4 & 5 directly into a pdf-lib PDFDocument instance.
 * Single-responsibility: Zero Canvas API calls, zero DOM structure manipulation.
 */

window.AddendumPdfBuilder = {
    wrapTextLines: function (text, maxChars = 100) {
        const words = String(text || "").split(/\s+/);
        const lines = [];
        let cur = "";
        for (const w of words) {
            if (!cur) cur = w;
            else if ((cur + " " + w).length <= maxChars) cur += " " + w;
            else { lines.push(cur); cur = w; }
        }
        if (cur) lines.push(cur);
        return lines;
    },

    appendPagesToPdfDoc: function (pdfDoc, params) {
        const cfg = window.AddendumContentConfig || {};
        const p = params || (window.AddendumData ? window.AddendumData.params : {});
        let drawnCount = 0;

        // Page 1 (Statutory Clauses 1-3)
        const page1 = pdfDoc.addPage([595, 842]);
        drawnCount += this._drawPdfPage1(page1, cfg, p);

        // Page 2 (Statutory Clause 4 + Section 5 Parameters Grid + Execution)
        const page2 = pdfDoc.addPage([595, 842]);
        drawnCount += this._drawPdfPage2(page2, cfg, p);

        return drawnCount;
    },

    _drawPdfPage1: function (page, cfg, p) {
        let count = 0;
        const leftX = 45;
        let curTopY = 58;

        page.drawText("ADDENDUM TO TENANCY CONTRACT", {
            x: 180,
            y: 842 - curTopY,
            size: 15,
            color: { r: 0.06, g: 0.09, b: 0.16 }
        });
        count++;

        curTopY += 22;

        const preambleLines = this.wrapTextLines(cfg.preambleText || "", 108);
        preambleLines.forEach(ln => {
            page.drawText(ln, {
                x: leftX,
                y: 842 - curTopY,
                size: 8.4,
                color: { r: 0.2, g: 0.25, b: 0.33 }
            });
            curTopY += 12;
            count++;
        });

        curTopY += 12;

        const sections = cfg.page1Clauses || [];
        sections.forEach(sec => {
            page.drawText(sec.title, {
                x: leftX,
                y: 842 - curTopY,
                size: 9.8,
                color: { r: 0.06, g: 0.09, b: 0.16 }
            });
            curTopY += 14;
            count++;

            sec.clauses.forEach(cl => {
                const fullText = cl.num + " " + cl.body;
                const wrapped = this.wrapTextLines(fullText, 108);
                wrapped.forEach(line => {
                    page.drawText(line, {
                        x: leftX,
                        y: 842 - curTopY,
                        size: 8.4,
                        color: { r: 0.12, g: 0.16, b: 0.23 }
                    });
                    curTopY += 12.2;
                    count++;
                });
                curTopY += 3.5;
            });
            curTopY += 8;
        });

        count += this._drawPdfFooter(page, 1, 2);
        return count;
    },

    _drawPdfPage2: function (page, cfg, p) {
        let count = 0;
        const leftX = 45;
        let curTopY = 54;

        const sections = cfg.page2Clauses || [];
        sections.forEach(sec => {
            page.drawText(sec.title, {
                x: leftX,
                y: 842 - curTopY,
                size: 9.8,
                color: { r: 0.06, g: 0.09, b: 0.16 }
            });
            curTopY += 14;
            count++;

            sec.clauses.forEach(cl => {
                const fullText = cl.num + " " + cl.body;
                const wrapped = this.wrapTextLines(fullText, 108);
                wrapped.forEach(line => {
                    page.drawText(line, {
                        x: leftX,
                        y: 842 - curTopY,
                        size: 8.4,
                        color: { r: 0.12, g: 0.16, b: 0.23 }
                    });
                    curTopY += 12.0;
                    count++;
                });
                curTopY += 3.2;
            });
            curTopY += 6;
        });

        curTopY += 8;

        page.drawText("SECTION 5: SPECIFIC LEASE PARAMETERS & VARIABLE DATA", {
            x: leftX,
            y: 842 - curTopY,
            size: 9.8,
            color: { r: 0.06, g: 0.09, b: 0.16 }
        });
        curTopY += 12;
        count++;

        const tableTopY = curTopY;
        const rowHeight = 24;
        const col1LabelW = 108;
        const col1ValW = 144.5;
        const col2LabelW = 108;
        const col2ValW = 144.5;

        const rows = [
            [
                { label: "Property Address", value: p.property_address || "" },
                { label: "Property Fit-Out Status", value: p.property_fitout_status || "" }
            ],
            [
                { label: "Tenancy Commencement", value: p.tenancy_commencement || "" },
                { label: "Tenancy Expiration", value: p.tenancy_expiration || "" }
            ],
            [
                { label: "Gross Annual Rent", value: p.gross_annual_rent || "" },
                { label: "Payment Frequency", value: p.payment_frequency || "" }
            ],
            [
                { label: "Refundable Security Deposit", value: p.refundable_security_deposit || "" },
                { label: "Returned Cheque Penalty", value: p.returned_cheque_penalty || "" }
            ],
            [
                { label: "Minor Maintenance Threshold", value: p.minor_maintenance_threshold || "" },
                { label: "Major Maintenance Threshold", value: p.major_maintenance_threshold || "" }
            ],
            [
                { label: "DED / DEWA Premises No.", value: p.dewa_premises_no || "" },
                { label: "Authorized Agency & Fee", value: p.authorized_agency_fee || "" }
            ]
        ];

        let rY = tableTopY;
        rows.forEach((r, rIdx) => {
            const h = (rIdx === 0 && (r[0].value.length > 28 || r[1].value.length > 28)) ? 28 : rowHeight;
            const pdfBoxY = 842 - rY - h;

            // Col 1 Label Box
            page.drawRectangle({
                x: leftX,
                y: pdfBoxY,
                width: col1LabelW,
                height: h,
                color: { r: 0.97, g: 0.98, b: 0.99 },
                borderColor: { r: 0.8, g: 0.84, b: 0.88 },
                borderWidth: 0.6
            });
            const l1Lines = this.wrapTextLines(r[0].label, 20);
            if (l1Lines.length > 1) {
                page.drawText(l1Lines[0], { x: leftX + 6, y: pdfBoxY + h - 11, size: 7.8, color: { r: 0.06, g: 0.09, b: 0.16 } });
                page.drawText(l1Lines[1], { x: leftX + 6, y: pdfBoxY + h - 21, size: 7.8, color: { r: 0.06, g: 0.09, b: 0.16 } });
            } else {
                page.drawText(r[0].label, { x: leftX + 6, y: pdfBoxY + (h / 2) - 2.5, size: 7.8, color: { r: 0.06, g: 0.09, b: 0.16 } });
            }

            // Col 1 Value Box
            const val1X = leftX + col1LabelW;
            page.drawRectangle({
                x: val1X,
                y: pdfBoxY,
                width: col1ValW,
                height: h,
                color: { r: 1, g: 1, b: 1 },
                borderColor: { r: 0.8, g: 0.84, b: 0.88 },
                borderWidth: 0.6
            });
            const v1Lines = this.wrapTextLines(r[0].value, 26);
            if (v1Lines.length > 1) {
                page.drawText(v1Lines[0], { x: val1X + 6, y: pdfBoxY + h - 11, size: 8.0, color: { r: 0.12, g: 0.16, b: 0.23 } });
                page.drawText(v1Lines[1], { x: val1X + 6, y: pdfBoxY + h - 21, size: 8.0, color: { r: 0.12, g: 0.16, b: 0.23 } });
            } else {
                page.drawText(r[0].value, { x: val1X + 6, y: pdfBoxY + (h / 2) - 2.5, size: 8.0, color: { r: 0.12, g: 0.16, b: 0.23 } });
            }

            // Col 2 Label Box
            const col2LabelX = val1X + col1ValW;
            page.drawRectangle({
                x: col2LabelX,
                y: pdfBoxY,
                width: col2LabelW,
                height: h,
                color: { r: 0.97, g: 0.98, b: 0.99 },
                borderColor: { r: 0.8, g: 0.84, b: 0.88 },
                borderWidth: 0.6
            });
            const l2Lines = this.wrapTextLines(r[1].label, 20);
            if (l2Lines.length > 1) {
                page.drawText(l2Lines[0], { x: col2LabelX + 6, y: pdfBoxY + h - 11, size: 7.8, color: { r: 0.06, g: 0.09, b: 0.16 } });
                page.drawText(l2Lines[1], { x: col2LabelX + 6, y: pdfBoxY + h - 21, size: 7.8, color: { r: 0.06, g: 0.09, b: 0.16 } });
            } else {
                page.drawText(r[1].label, { x: col2LabelX + 6, y: pdfBoxY + (h / 2) - 2.5, size: 7.8, color: { r: 0.06, g: 0.09, b: 0.16 } });
            }

            // Col 2 Value Box
            const val2X = col2LabelX + col2LabelW;
            page.drawRectangle({
                x: val2X,
                y: pdfBoxY,
                width: col2ValW,
                height: h,
                color: { r: 1, g: 1, b: 1 },
                borderColor: { r: 0.8, g: 0.84, b: 0.88 },
                borderWidth: 0.6
            });
            const v2Lines = this.wrapTextLines(r[1].value, 26);
            if (v2Lines.length > 1) {
                page.drawText(v2Lines[0], { x: val2X + 6, y: pdfBoxY + h - 11, size: 8.0, color: { r: 0.12, g: 0.16, b: 0.23 } });
                page.drawText(v2Lines[1], { x: val2X + 6, y: pdfBoxY + h - 21, size: 8.0, color: { r: 0.12, g: 0.16, b: 0.23 } });
            } else {
                page.drawText(r[1].value, { x: val2X + 6, y: pdfBoxY + (h / 2) - 2.5, size: 8.0, color: { r: 0.12, g: 0.16, b: 0.23 } });
            }

            count += 4;
            rY += h;
        });

        curTopY = rY + 12;

        const accFull = "CONTRACT ACCEPTANCE & EXECUTION: " + (cfg.acceptanceText || "");
        const accLines = this.wrapTextLines(accFull, 108);
        accLines.forEach(ln => {
            page.drawText(ln, {
                x: leftX,
                y: 842 - curTopY,
                size: 8.0,
                color: { r: 0.12, g: 0.16, b: 0.23 }
            });
            curTopY += 11.5;
            count++;
        });

        curTopY += 10;

        const boxW = 246;
        const boxH = 76;
        const box1X = leftX;
        const box2X = leftX + boxW + 13;
        const pdfBoxY = 842 - curTopY - boxH - 20;

        // Tenant Box Header
        page.drawRectangle({
            x: box1X,
            y: pdfBoxY + boxH,
            width: boxW,
            height: 20,
            color: { r: 0.12, g: 0.16, b: 0.23 }
        });
        page.drawText("THE TENANT", { x: box1X + 90, y: pdfBoxY + boxH + 6, size: 8.8, color: { r: 1, g: 1, b: 1 } });

        // Tenant Box Body
        page.drawRectangle({
            x: box1X,
            y: pdfBoxY,
            width: boxW,
            height: boxH,
            color: { r: 1, g: 1, b: 1 },
            borderColor: { r: 0.8, g: 0.84, b: 0.88 },
            borderWidth: 0.8
        });
        page.drawText("Name: " + (p.tenant_name || ""), { x: box1X + 8, y: pdfBoxY + boxH - 15, size: 8.0, color: { r: 0.06, g: 0.09, b: 0.16 } });
        page.drawText("Signature & Date: Client must sign using UAE PASS Application", { x: box1X + 8, y: pdfBoxY + boxH - 31, size: 7.2, color: { r: 0.28, g: 0.33, b: 0.41 } });
        page.drawText("Signature: ____________________________________", { x: box1X + 8, y: pdfBoxY + 12, size: 8.0, color: { r: 0.06, g: 0.09, b: 0.16 } });

        // Landlord Box Header
        page.drawRectangle({
            x: box2X,
            y: pdfBoxY + boxH,
            width: boxW,
            height: 20,
            color: { r: 0.12, g: 0.16, b: 0.23 }
        });
        page.drawText("THE LANDLORD", { x: box2X + 85, y: pdfBoxY + boxH + 6, size: 8.8, color: { r: 1, g: 1, b: 1 } });

        // Landlord Box Body
        page.drawRectangle({
            x: box2X,
            y: pdfBoxY,
            width: boxW,
            height: boxH,
            color: { r: 1, g: 1, b: 1 },
            borderColor: { r: 0.8, g: 0.84, b: 0.88 },
            borderWidth: 0.8
        });
        page.drawText("Name: " + (p.landlord_name || ""), { x: box2X + 8, y: pdfBoxY + boxH - 15, size: 8.0, color: { r: 0.06, g: 0.09, b: 0.16 } });
        page.drawText("Signature & Date: Client must sign using UAE PASS Application", { x: box2X + 8, y: pdfBoxY + boxH - 31, size: 7.2, color: { r: 0.28, g: 0.33, b: 0.41 } });
        page.drawText("Signature: ____________________________________", { x: box2X + 8, y: pdfBoxY + 12, size: 8.0, color: { r: 0.06, g: 0.09, b: 0.16 } });

        count += 10;

        count += this._drawPdfFooter(page, 2, 2);
        return count;
    },

    _drawPdfFooter: function (page, pageNum, totalPages) {
        const leftX = 45;
        const rightX = 550;
        const footPdfY = 42;

        page.drawLine({
            start: { x: leftX, y: footPdfY },
            end: { x: rightX, y: footPdfY },
            thickness: 0.5,
            color: { r: 0.8, g: 0.84, b: 0.88 }
        });

        page.drawText("Addendum to Tenancy Contract | Subject to Dubai Law No. (26) of 2007", {
            x: leftX,
            y: footPdfY - 12,
            size: 7.8,
            color: { r: 0.39, g: 0.45, b: 0.55 }
        });

        page.drawText(`Page ${pageNum} of ${totalPages}`, {
            x: rightX - 50,
            y: footPdfY - 12,
            size: 7.8,
            color: { r: 0.39, g: 0.45, b: 0.55 }
        });

        page.drawText("Landlord Initial: _________________                  Tenant Initial: _________________", {
            x: leftX + 80,
            y: footPdfY - 26,
            size: 7.8,
            color: { r: 0.39, g: 0.45, b: 0.55 }
        });

        return 4;
    }
};

