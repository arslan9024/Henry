// FILE: js/engine/receipt_canvas_renderer.js
/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - Agency Fee Payment Receipt HTML5 Canvas 2D Preview Renderer
 * Dedicated exclusively to rendering the Payment Receipt (Page 6) onto high-DPI HTML5 Canvases for the live PDF viewer.
 * Single-responsibility: Zero PDF-lib calls, zero DOM structure manipulation.
 */

window.ReceiptCanvasRenderer = {
    renderPageToCanvas: function (canvas, params) {
        if (!canvas) return;
        const dpr = Math.max(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(595 * dpr);
        canvas.height = Math.round(842 * dpr);
        canvas.style.width = "595px";
        canvas.style.height = "842px";

        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.scale(dpr, dpr);
        const p = params || (window.ReceiptData ? window.ReceiptData.params : {});

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 595, 842);

        // 1. Top-Right White Caves Mountain Logo
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
        ctx.fillText(p.bill_from || "", boxX + 6, boxTop + 31);

        ctx.font = "10.5px 'Segoe UI', Arial, sans-serif";
        ctx.fillText("To:", midX + 6, boxTop + 16);
        ctx.fillText("Tenant Name:", midX + 6, boxTop + 42);
        ctx.font = "9.5px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(p.tenant_name || "", midX + 6, boxTop + 57);

        // 4. 4-Row Payment Details Table
        const tblTop = 324, rowH = 25, colSplitX = 174;
        const rows = [
            ["Payment Details:", p.property_summary || ""],
            ["Rent", p.rent_display || ""],
            ["Agency Fee", p.agency_fee_display || ""],
            ["Total", p.total_display || ""]
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
        ctx.fillText(p.acknowledgment_text || "", boxX + 12, tblTop + rowH * rows.length + 22);

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

        // 6. Bottom Contact Footer
        ctx.fillStyle = "#0f172a";
        ctx.font = "10px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(`Contact US: Mobile: ${p.contact_mobile || ''} Email: `, 36, 764);
        const prefixW = ctx.measureText(`Contact US: Mobile: ${p.contact_mobile || ''} Email: `).width;
        ctx.fillStyle = "#2563eb";
        ctx.fillText(p.contact_email || "", 36 + prefixW, 764);
        ctx.restore();
    }
};

