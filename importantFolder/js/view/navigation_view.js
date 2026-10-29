/**
 * [Category 1: View]
 * White Caves Real Estate - Top Navbar, Step Sections & Footer View Updater (navigation_view.js)
 * Pure View module for toggling active step panels, top navigation pills, and footer button states.
 */

window.NavigationView = {
    stepElementIds: {
        1: "step-form",
        2: "step-addendum-builder",
        3: "step-receipt-builder",
        4: "step-process-export"
    },

    nextStepButtonLabels: {
        1: "Confirm Inputs & Go to 2. Addendum →",
        2: "Confirm Addendum & Go to 3. Receipt & Cheques →",
        3: "Confirm Receipt & Go to 4. Export Studio →",
        4: "Ready to Export"
    },

    updateTopAndFooterControls: function (wf) {
        if (typeof document === "undefined" || !wf) return;
        const c = wf.confirmations;
        const pills = [
            { id: "nav-step-1", step: 1, done: c.step1InputsConfirmed },
            { id: "nav-step-2", step: 2, done: c.addendumConfirmed },
            { id: "nav-step-3", step: 3, done: c.receiptConfirmed },
            { id: "nav-step-4", step: 4, done: c.pdfProcessedAndVerified }
        ];

        pills.forEach(p => {
            const el = document.getElementById(p.id);
            if (el) {
                el.className = `step-nav-pill ${wf.currentStep === p.step ? "active" : ""} ${p.done ? "completed" : ""}`;
            }
        });

        const prevBtn = document.getElementById("btn-footer-prev");
        const nextBtn = document.getElementById("btn-footer-next");
        if (prevBtn) prevBtn.disabled = wf.currentStep <= 1;
        if (nextBtn) {
            nextBtn.disabled = wf.currentStep >= 4;
            nextBtn.innerText = this.nextStepButtonLabels[wf.currentStep] || "Next →";
        }
    },

    showActiveStepSection: function (targetStep) {
        if (typeof document === "undefined") return;
        for (const num in this.stepElementIds) {
            const el = document.getElementById(this.stepElementIds[num]);
            if (el) el.style.display = Number(num) === targetStep ? "block" : "none";
        }
    },

    syncExportButtonsState: function (wf) {
        if (typeof document === "undefined" || !wf) return;
        const canDownload = wf.confirmations.pdfProcessedAndVerified && Boolean(wf.downloadBlobUrl);
        const dlBtn = document.getElementById("btn-download-final-pdf");
        const waBtn = document.getElementById("btn-share-whatsapp");

        if (dlBtn) {
            dlBtn.disabled = !canDownload;
            dlBtn.innerText = canDownload
                ? `⬇️ Download (${wf.lastVerificationReport ? wf.lastVerificationReport.totalPagesCount : 6}p PDF)`
                : "🔒 Download Locked";
        }
        if (waBtn) {
            waBtn.disabled = !canDownload;
        }
    }
};

