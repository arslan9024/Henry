// FILE: addendum_engine.js
/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - 2-Page Official RERA Addendum Canvas & PDF Compiler (addendum_engine.js)
 * High-fidelity rendering engine for the official White Caves 2-Page Addendum:
 * Page 1: Sections 1–3 statutory clauses.
 * Page 2: Section 4 statutory clauses, Section 5 parameter table & execution block.
 * Pure functional worker: does not touch external DOM nodes directly.
 */

window.AddendumEngine = {
    get params() {
        return window.AddendumData ? window.AddendumData.params : {};
    },

    syncFromStep1Payload: function (p1) {
        if (window.AddendumData) window.AddendumData.syncFromStep1Payload(p1);
    },

    renderAddendumForm: function (id) {
        if (window.AddendumData) window.AddendumData.renderAddendumForm(id);
    },

    // Word wrap helper
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

    /**
     * Renders Page 1 (Sections 1–3) or Page 2 (Section 4 + Table + Signatures) to HTML Canvas.
     */
    renderAddendumPageToCanvas: function (canvas, pageIdx) {
        if (!canvas) return;
        const dpr = Math.max(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(595 * dpr);
        canvas.height = Math.round(842 * dpr);
        canvas.style.width = "595px";
        canvas.style.height = "842px";

        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 595, 842);

        const p = this.params;
        const cfg = window.AddendumContentConfig || {};

        if (pageIdx === 0) {
            this._drawCanvasPage1(ctx, cfg, p);
        } else if (pageIdx === 1) {
            this._drawCanvasPage2(ctx, cfg, p);
        }

        ctx.restore();
    },

    _drawCanvasPage1: function (ctx, cfg, p) {
        const leftX = 45;
        const rightX = 550;
        const contentW = rightX - leftX; // 505

        // Title
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 15px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ADDENDUM TO TENANCY CONTRACT", 297.5, 58);
        ctx.textAlign = "left";

        // Preamble
        ctx.font = "8.4px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#334155";
        let curY = 78;
        const preambleLines = this.wrapTextLines(cfg.preambleText || "", 108);
        preambleLines.forEach(ln => {
            ctx.fillText(ln, leftX, curY);
            curY += 12;
        });

        curY += 12;

        // Sections 1, 2, 3
        const sections = cfg.page1Clauses || [];
        sections.forEach(sec => {
            ctx.font = "bold 9.8px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#0f172a";
            ctx.fillText(sec.title, leftX, curY);
            curY += 14;

            sec.clauses.forEach(cl => {
                // Number + Title in bold
                ctx.font = "bold 8.4px 'Segoe UI', Arial, sans-serif";
                ctx.fillStyle = "#0f172a";
                const numW = ctx.measureText(cl.num + " ").width;
                ctx.fillText(cl.num, leftX, curY);

                // Body in regular font
                ctx.font = "8.4px 'Segoe UI', Arial, sans-serif";
                ctx.fillStyle = "#334155";

                const fullText = cl.num + " " + cl.body;
                const wrapped = this.wrapTextLines(fullText, 108);
                wrapped.forEach((line, idx) => {
                    if (idx === 0) {
                        const rest = line.substring(cl.num.length).trim();
                        ctx.fillText(rest, leftX + numW, curY);
                    } else {
                        ctx.fillText(line, leftX, curY);
                    }
                    curY += 12.2;
                });
                curY += 3.5;
            });
            curY += 8;
        });

        // Page 1 Footer
        this._drawCanvasFooter(ctx, 1, 2);
    },

    _drawCanvasPage2: function (ctx, cfg, p) {
        const leftX = 45;
        const rightX = 550;
        const contentW = rightX - leftX; // 505

        let curY = 54;

        // Section 4
        const sections = cfg.page2Clauses || [];
        sections.forEach(sec => {
            ctx.font = "bold 9.8px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#0f172a";
            ctx.fillText(sec.title, leftX, curY);
            curY += 14;

            sec.clauses.forEach(cl => {
                ctx.font = "bold 8.4px 'Segoe UI', Arial, sans-serif";
                ctx.fillStyle = "#0f172a";
                const numW = ctx.measureText(cl.num + " ").width;
                ctx.fillText(cl.num, leftX, curY);

                ctx.font = "8.4px 'Segoe UI', Arial, sans-serif";
                ctx.fillStyle = "#334155";

                const fullText = cl.num + " " + cl.body;
                const wrapped = this.wrapTextLines(fullText, 108);
                wrapped.forEach((line, idx) => {
                    if (idx === 0) {
                        const rest = line.substring(cl.num.length).trim();
                        ctx.fillText(rest, leftX + numW, curY);
                    } else {
                        ctx.fillText(line, leftX, curY);
                    }
                    curY += 12.0;
                });
                curY += 3.2;
            });
            curY += 6;
        });

        curY += 8;

        // SECTION 5: SPECIFIC LEASE PARAMETERS & VARIABLE DATA
        ctx.font = "bold 9.8px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.fillText("SECTION 5: SPECIFIC LEASE PARAMETERS & VARIABLE DATA", leftX, curY);
        curY += 12;

        // Draw Table Grid
        const tableY = curY;
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

        let rY = tableY;
        rows.forEach((r, rIdx) => {
            const h = (rIdx === 0 && (r[0].value.length > 28 || r[1].value.length > 28)) ? 28 : rowHeight;

            // Col 1 Label Box
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(leftX, rY, col1LabelW, h);
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 0.6;
            ctx.strokeRect(leftX, rY, col1LabelW, h);

            ctx.font = "bold 7.8px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#0f172a";
            const l1Lines = this.wrapTextLines(r[0].label, 20);
            if (l1Lines.length > 1) {
                ctx.fillText(l1Lines[0], leftX + 6, rY + 11);
                ctx.fillText(l1Lines[1], leftX + 6, rY + 21);
            } else {
                ctx.fillText(r[0].label, leftX + 6, rY + (h / 2) + 2.5);
            }

            // Col 1 Value Box
            const val1X = leftX + col1LabelW;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(val1X, rY, col1ValW, h);
            ctx.strokeRect(val1X, rY, col1ValW, h);

            ctx.font = "8.0px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#1e293b";
            const v1Lines = this.wrapTextLines(r[0].value, 26);
            if (v1Lines.length > 1) {
                ctx.fillText(v1Lines[0], val1X + 6, rY + 11);
                ctx.fillText(v1Lines[1], val1X + 6, rY + 21);
            } else {
                ctx.fillText(r[0].value, val1X + 6, rY + (h / 2) + 2.5);
            }

            // Col 2 Label Box
            const col2LabelX = val1X + col1ValW;
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(col2LabelX, rY, col2LabelW, h);
            ctx.strokeRect(col2LabelX, rY, col2LabelW, h);

            ctx.font = "bold 7.8px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#0f172a";
            const l2Lines = this.wrapTextLines(r[1].label, 20);
            if (l2Lines.length > 1) {
                ctx.fillText(l2Lines[0], col2LabelX + 6, rY + 11);
                ctx.fillText(l2Lines[1], col2LabelX + 6, rY + 21);
            } else {
                ctx.fillText(r[1].label, col2LabelX + 6, rY + (h / 2) + 2.5);
            }

            // Col 2 Value Box
            const val2X = col2LabelX + col2LabelW;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(val2X, rY, col2ValW, h);
            ctx.strokeRect(val2X, rY, col2ValW, h);

            ctx.font = "8.0px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = "#1e293b";
            const v2Lines = this.wrapTextLines(r[1].value, 26);
            if (v2Lines.length > 1) {
                ctx.fillText(v2Lines[0], val2X + 6, rY + 11);
                ctx.fillText(v2Lines[1], val2X + 6, rY + 21);
            } else {
                ctx.fillText(r[1].value, val2X + 6, rY + (h / 2) + 2.5);
            }

            rY += h;
        });

        curY = rY + 12;

        // CONTRACT ACCEPTANCE & EXECUTION
        ctx.font = "bold 8.8px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#0f172a";
        const accHeader = "CONTRACT ACCEPTANCE & EXECUTION: ";
        const accHeaderW = ctx.measureText(accHeader).width;
        ctx.fillText(accHeader, leftX, curY);

        ctx.font = "8.0px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#334155";
        const accText = cfg.acceptanceText || "";
        const accLines = this.wrapTextLines(accText, 108);
        accLines.forEach((ln, idx) => {
            if (idx === 0) {
                ctx.fillText(ln, leftX + accHeaderW, curY);
            } else {
                ctx.fillText(ln, leftX, curY);
            }
            curY += 11.5;
        });

        curY += 10;

        // Execution & Signatures Boxes (Tenant / Landlord)
        const boxW = 246;
        const boxH = 76;
        const box1X = leftX;
        const box2X = leftX + boxW + 13;

        // Header bars (Dark Navy)
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(box1X, curY, boxW, 20);
        ctx.fillRect(box2X, curY, boxW, 20);

        ctx.font = "bold 8.8px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("THE TENANT", box1X + (boxW / 2), curY + 13.5);
        ctx.fillText("THE LANDLORD", box2X + (boxW / 2), curY + 13.5);
        ctx.textAlign = "left";

        // Box outlines
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(box1X, curY + 20, boxW, boxH);
        ctx.strokeRect(box2X, curY + 20, boxW, boxH);

        // Tenant Box Content
        ctx.font = "bold 8.0px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.fillText("Name: " + (p.tenant_name || ""), box1X + 8, curY + 35);

        ctx.font = "italic 7.4px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Signature & Date: Client must sign using UAE PASS Application", box1X + 8, curY + 51);

        ctx.font = "8.0px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.fillText("Signature: ____________________________________", box1X + 8, curY + 76);

        // Landlord Box Content
        ctx.font = "bold 8.0px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.fillText("Name: " + (p.landlord_name || ""), box2X + 8, curY + 35);

        ctx.font = "italic 7.4px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Signature & Date: Client must sign using UAE PASS Application", box2X + 8, curY + 51);

        ctx.font = "8.0px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.fillText("Signature: ____________________________________", box2X + 8, curY + 76);

        // Page 2 Footer
        this._drawCanvasFooter(ctx, 2, 2);
    },

    _drawCanvasFooter: function (ctx, pageNum, totalPages) {
        const leftX = 45;
        const rightX = 550;
        const footY = 800;

        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(leftX, footY);
        ctx.lineTo(rightX, footY);
        ctx.stroke();

        ctx.font = "7.8px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Addendum to Tenancy Contract | Subject to Dubai Law No. (26) of 2007", leftX, footY + 12);

        ctx.textAlign = "right";
        ctx.fillText(`Page ${pageNum} of ${totalPages}`, rightX, footY + 12);
        ctx.textAlign = "left";

        ctx.fillText("Landlord Initial: _________________                  Tenant Initial: _________________", leftX + 80, footY + 28);
    },

    /**
     * Appends the 2 Addendum pages directly into the target pdf-lib PDFDocument instance.
     */
    appendAddendumPagesToPdfDoc: function (pdfDoc) {
        const cfg = window.AddendumContentConfig || {};
        const p = this.params;
        let drawnCount = 0;

        // --- PAGE 1 ---
        const page1 = pdfDoc.addPage([595, 842]);
        drawnCount += this._drawPdfPage1(page1, cfg, p);

        // --- PAGE 2 ---
        const page2 = pdfDoc.addPage([595, 842]);
        drawnCount += this._drawPdfPage2(page2, cfg, p);

        return drawnCount;
    },

    _drawPdfPage1: function (page, cfg, p) {
        let count = 0;
        const leftX = 45;
        const rightX = 550;
        let curTopY = 58;

        // Title
        page.drawText("ADDENDUM TO TENANCY CONTRACT", {
            x: 180,
            y: 842 - curTopY,
            size: 15,
            color: { r: 0.06, g: 0.09, b: 0.16 }
        });
        count++;

        curTopY += 22;

        // Preamble
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

        // Sections 1, 2, 3
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

        // Page 1 Footer
        count += this._drawPdfFooter(page, 1, 2);
        return count;
    },

    _drawPdfPage2: function (page, cfg, p) {
        let count = 0;
        const leftX = 45;
        const rightX = 550;
        let curTopY = 54;

        // Section 4
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

        // SECTION 5 Header
        page.drawText("SECTION 5: SPECIFIC LEASE PARAMETERS & VARIABLE DATA", {
            x: leftX,
            y: 842 - curTopY,
            size: 9.8,
            color: { r: 0.06, g: 0.09, b: 0.16 }
        });
        curTopY += 12;
        count++;

        // Table Grid
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

        // Acceptance Text
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

        // Signatures Boxes
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

        // Page 2 Footer
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
