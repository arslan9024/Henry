/**
 * White Caves Real Estate - Left Sidebar Progressive Verification & Deal Summary Updater (sidebar_status.js)
 * Single-responsibility module for updating the 8 verification gates and live deal snapshot.
 */

window.SidebarStatusUpdater = {
    updateSidebarUI: function (wf) {
        if (typeof document === "undefined" || !wf) return;
        const metrics = window.FormLayoutBuilder
            ? window.FormLayoutBuilder.collectCurrentFormMetrics()
            : { page1Count: 24, page3Count: 5, payload: { contractMode: "RENEWAL", page1: {} } };

        const c = wf.confirmations;
        const modeLabel = metrics.payload && metrics.payload.contractMode === "NEW" ? "New Contract" : "Renewal Contract";

        const setCard = (id, confirmed, title, meta) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.className = `checklist-item ${confirmed ? "status-confirmed" : "status-pending"}`;
            el.innerHTML = `<span class="status-icon">${confirmed ? "✔️" : "⏳"}</span><div><div class="status-title">${title}</div><div class="status-meta">${meta}</div></div>`;
        };

        const uploadSummary = window.DocumentUploadState
            ? window.DocumentUploadState.getSummary(metrics.payload.contractMode || "RENEWAL")
            : { uploadedCount: 0, totalRequired: 1 };
        const uploadMeta = `${uploadSummary.uploadedCount}/${uploadSummary.totalRequired} Docs Attached`;

        setCard("check-fields-p1", c.step1InputsConfirmed,
            c.step1InputsConfirmed ? `Page 1 Inputs Form Ready` : `Page 1 Inputs (${modeLabel})`,
            c.step1InputsConfirmed ? `(${metrics.page1Count} of 24 fields • ${uploadMeta})` : `${metrics.page1Count} of 24 filled • ${uploadMeta}`);

        setCard("check-fields-p3", c.step1InputsConfirmed,
            c.step1InputsConfirmed ? "Page 3 Additional Terms Set" : "Page 3 Additional Terms",
            c.step1InputsConfirmed ? `(${metrics.page3Count} unnumbered sentences)` : `${metrics.page3Count} of 5 lines — confirm Step 1`);

        const kb = (wf.templateBuffer && wf.templateBuffer.byteLength > 0) ? (wf.templateBuffer.byteLength / 1024).toFixed(1) : "1171.6";
        setCard("check-template", c.templateConfirmed,
            c.templateConfirmed ? "DLD Template PDF Cached" : "DLD Tenancy Template PDF",
            c.templateConfirmed ? `(${kb} KB detected)` : "Auto-loaded from root folder");

        setCard("check-engine", c.engineLoaded,
            "Core JS PDF Processing Engine",
            c.engineLoaded ? "Loaded and online" : "Initializing...");

        setCard("check-calibration", c.coordinatesConfirmed,
            c.coordinatesConfirmed ? "Coordinates Calibrated" : "Coordinate Calibration",
            c.coordinatesConfirmed ? "Pages 1–3 DLD positions locked" : "Confirm in Step 2");

        setCard("check-addendum", c.addendumConfirmed,
            c.addendumConfirmed ? "Addendum Ready (Pages 4–5)" : "Addendum (Pages 4–5)",
            c.addendumConfirmed ? "RERA Clauses & Section 5 locked" : "Confirm in Step 3");

        setCard("check-receipt", c.receiptConfirmed,
            c.receiptConfirmed ? "Payment Receipt Ready (Page 6)" : "Payment Receipt (Page 6)",
            c.receiptConfirmed ? "Agency Fee & 5% VAT confirmed" : "Confirm in Step 4");

        setCard("check-stamped-pdf", c.pdfProcessedAndVerified && wf.lastVerificationReport,
            c.pdfProcessedAndVerified ? "PDF Stamped & Verified" : "PDF Binary Verification",
            (c.pdfProcessedAndVerified && wf.lastVerificationReport)
                ? `${wf.lastVerificationReport.totalPagesCount} pages verified in binary`
                : "Click Process PDF in footer to unlock");

        const p1Data = metrics.payload.page1 || {};
        const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
        setTxt("summary-mode-val", modeLabel);
        setTxt("summary-unit-val", `${p1Data.property_no || "142"} ${p1Data.building_name || "PRIMROSE"}`);
        setTxt("summary-rent-val", p1Data.annual_rent || "115,000 AED");
        if (window.ReceiptEngine) setTxt("summary-fee-val", window.ReceiptEngine.params.total_display || "6,037.50 AED");

        const passedChecks = [
            c.engineLoaded, c.step1InputsConfirmed, c.step1InputsConfirmed,
            c.templateConfirmed, c.coordinatesConfirmed, c.addendumConfirmed,
            c.receiptConfirmed, c.pdfProcessedAndVerified
        ].filter(Boolean).length;
        const pct = Math.round((passedChecks / 8) * 100);
        const pctBar = document.getElementById("sidebar-progress-fill");
        const pctLabel = document.getElementById("sidebar-progress-text");
        if (pctBar) pctBar.style.width = `${pct}%`;
        if (pctLabel) pctLabel.innerText = `${passedChecks} of 8 Gates Confirmed (${pct}%)`;

        const setDocPill = (id, ready, text) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.className = `doc-ready-pill ${ready ? "pill-confirmed" : "pill-waiting"}`;
            el.innerText = text;
        };
        setDocPill("doc-status-badge-1", c.step1InputsConfirmed && c.coordinatesConfirmed,
            (c.step1InputsConfirmed && c.coordinatesConfirmed) ? "✔️ Ready" : "⏳ In Progress");
        setDocPill("doc-status-badge-2", c.addendumConfirmed,
            c.addendumConfirmed ? "✔️ Ready" : "⏳ In Progress");
        setDocPill("doc-status-badge-3", c.receiptConfirmed,
            c.receiptConfirmed ? "✔️ Ready" : "⏳ In Progress");
    }
};
