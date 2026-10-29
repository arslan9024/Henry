/**
 * White Caves Real Estate - Payment Receipt Canvas & PDF Renderer (Page 7) (receipt_engine.js)
 * Replicates the official White Caves Real Estate LLC Agency Fee Payment Receipt layout
 * with mountain logo, bordered tables, Arslan Malik signature, and circular company stamp.
 */

window.ReceiptEngine = {
    get params() {
        return window.ReceiptData ? window.ReceiptData.params : {};
    },

    syncFromStep1Payload: function (p1) {
        if (window.ReceiptData) window.ReceiptData.syncFromStep1Payload(p1);
    },

    renderReceiptForm: function (id) {
        if (window.ReceiptData) window.ReceiptData.renderReceiptForm(id);
    },

    renderReceiptPageToCanvas: function (canvas) {
        if (!canvas) return;
        const dpr = Math.max(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(595 * dpr);
        canvas.height = Math.round(842 * dpr);
        canvas.style.width = "595px";
        canvas.style.height = "842px";

        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.scale(dpr, dpr);
        const p = this.params;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 595, 842);

        // 1. Top-Right White Caves Real Estate LLC Mountain Logo
        ctx.fillStyle = "#dc2626";
        ctx.beginPath(); ctx.moveTo(390, 115); ctx.lineTo(415, 72); ctx.lineTo(435, 115); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#475569";
        ctx.beginPath(); ctx.moveTo(418, 115); ctx.lineTo(445, 65); ctx.lineTo(472, 115); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#dc2626";
        ctx.beginPath(); ctx.moveTo(455, 115); ctx.lineTo(475, 78); ctx.lineTo(495, 115); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.moveTo(433, 115); ctx.lineTo(445, 86); ctx.lineTo(457, 115); ctx.closePath(); ctx.fill();

        ctx.fillStyle = "#b91c1c";
        ctx.font = "bold 7.2px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("WHITE CAVES REAL ESTATE LLC", 442, 125);
        ctx.fillStyle = "#64748b";
        ctx.font = "italic 5.5px 'Segoe UI', Arial, sans-serif";
        ctx.fillText('"Future Real Estate Buy And Sell With Confidence"', 442, 132);
        ctx.textAlign = "left";

        // 2. Title: Payment Receipt
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
        ctx.fillText("Payment Receipt", 88, 156);
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(88, 161); ctx.lineTo(272, 161); ctx.stroke();

        // 3. Top Boxed Table (Bill From | To: Tenant Name)
        const boxX = 45, boxTop = 182, boxW = 505, boxH = 110, midX = 245;
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1.0;
        ctx.strokeRect(boxX, boxTop, boxW, boxH);
        ctx.beginPath(); ctx.moveTo(midX, boxTop); ctx.lineTo(midX, boxTop + boxH); ctx.stroke();

        ctx.fillStyle = "#0f172a";
        ctx.font = "10.5px 'Segoe UI', Arial, sans-serif";
        ctx.fillText("Bill From:", boxX + 6, boxTop + 16);
        ctx.font = "11px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(p.bill_from, boxX + 6, boxTop + 31);

        ctx.font = "10.5px 'Segoe UI', Arial, sans-serif";
        ctx.fillText("To:", midX + 6, boxTop + 16);
        ctx.fillText("Tenant Name:", midX + 6, boxTop + 42);
        ctx.font = "9.5px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(p.tenant_name, midX + 6, boxTop + 57);

        // 4. 4-Row Payment Details Table
        const tblTop = 324, rowH = 25, colSplitX = 174;
        const rows = [
            ["Payment Details:", p.property_summary],
            ["Rent", p.rent_display],
            ["Agency Fee", p.agency_fee_display],
            ["Total", p.total_display]
        ];
        ctx.strokeRect(boxX, tblTop, boxW, rowH * rows.length);
        ctx.beginPath(); ctx.moveTo(colSplitX, tblTop); ctx.lineTo(colSplitX, tblTop + rowH * rows.length); ctx.stroke();

        rows.forEach((r, idx) => {
            const ry = tblTop + idx * rowH;
            if (idx > 0) {
                ctx.beginPath(); ctx.moveTo(boxX, ry); ctx.lineTo(boxX + boxW, ry); ctx.stroke();
            }
            ctx.fillStyle = "#0f172a";
            ctx.font = "10.5px 'Segoe UI', Arial, sans-serif";
            ctx.fillText(r[0], boxX + 6, ry + 16.5);
            ctx.fillText(r[1], colSplitX + 6, ry + 16.5);
        });

        // 5. Acknowledgment Line & Signature / Stamp
        ctx.fillStyle = "#0f172a";
        ctx.font = "10px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(p.acknowledgment_text, boxX + 12, tblTop + rowH * rows.length + 22);

        if (p.signatory_name) {
            ctx.save();
            ctx.fillStyle = "#1e293b";
            ctx.font = "italic 16px 'Segoe Script', 'Brush Script MT', cursive, sans-serif";
            ctx.translate(330, 480);
            ctx.rotate(-0.18);
            ctx.fillText(p.signatory_name, 0, 0);
            ctx.restore();
        }

        ctx.save();
        const stampX = 485, stampY = 482;
        ctx.strokeStyle = "rgba(37, 99, 235, 0.75)";
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(stampX, stampY, 36, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(stampX, stampY, 24, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "rgba(29, 78, 216, 0.8)";
        ctx.textAlign = "center";
        ctx.font = "bold 6px 'Segoe UI', Arial, sans-serif";
        ctx.fillText("WHITE CAVES REAL ESTATE L.L.C", stampX, stampY - 27);
        ctx.fillText("DUBAI - U.A.E", stampX, stampY + 2);
        ctx.fillText("وايت كيفز للعقارات ش.ذ.م.م", stampX, stampY + 31);
        ctx.restore();

        // 7. Bottom Contact Footer
        ctx.fillStyle = "#0f172a";
        ctx.font = "10px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(`Contact US: Mobile: ${p.contact_mobile} Email: `, 36, 764);
        const prefixW = ctx.measureText(`Contact US: Mobile: ${p.contact_mobile} Email: `).width;
        ctx.fillStyle = "#2563eb";
        ctx.fillText(p.contact_email, 36 + prefixW, 764);
        ctx.restore();
    },

    appendReceiptPageToPdfDoc: function (pdfDoc) {
        if (!this.params.include_receipt) return 0;
        const page = pdfDoc.addPage();
        const p = this.params;

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

        const boxX = 45, boxTop = 182, boxW = 505, boxH = 110, midX = 245;
        if (typeof page.drawRectangle === "function") {
            page.drawRectangle({ x: boxX, y: 842 - (boxTop + boxH), width: boxW, height: boxH, borderWidth: 0.9, borderColor: { r: 0.12, g: 0.16, b: 0.23 } });
        }
        page.drawLine({ start: { x: midX, y: 842 - boxTop }, end: { x: midX, y: 842 - (boxTop + boxH) }, thickness: 0.9, color: { r: 0.12, g: 0.16, b: 0.23 } });

        page.drawText("Bill From:", { x: boxX + 6, y: 842 - (boxTop + 16), size: 10, bold: false });
        page.drawText(p.bill_from, { x: boxX + 6, y: 842 - (boxTop + 31), size: 10.5, bold: false });
        page.drawText("To:", { x: midX + 6, y: 842 - (boxTop + 16), size: 10, bold: false });
        page.drawText("Tenant Name:", { x: midX + 6, y: 842 - (boxTop + 42), size: 10, bold: false });
        page.drawText(p.tenant_name, { x: midX + 6, y: 842 - (boxTop + 57), size: 9.5, bold: false });

        const tblTop = 324, rowH = 25, colSplitX = 174;
        const rows = [["Payment Details:", p.property_summary], ["Rent", p.rent_display], ["Agency Fee", p.agency_fee_display], ["Total", p.total_display]];
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

        page.drawText(p.acknowledgment_text, { x: boxX + 12, y: 842 - (tblTop + tblH + 22), size: 9.8, bold: false });
        if (p.signatory_name) {
            page.drawText(`Signed: ${p.signatory_name}`, { x: 325, y: 842 - 480, size: 10, bold: true, color: { r: 0.12, g: 0.22, b: 0.45 } });
        }
        page.drawText("WHITE CAVES REAL ESTATE L.L.C - DUBAI, U.A.E", { x: 385, y: 842 - 498, size: 7.5, bold: true, color: { r: 0.15, g: 0.38, b: 0.85 } });
        page.drawText(`Contact US: Mobile: ${p.contact_mobile} Email: ${p.contact_email}`, { x: 36, y: 842 - 764, size: 9.5, bold: false, color: { r: 0.06, g: 0.09, b: 0.16 } });
        return 12;
    }
};
