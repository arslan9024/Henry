/**
 * [Category 3: Values State]
 * White Caves Real Estate - Live Session RAM State & Workflow Controller (workflow_engine.js)
 * Tracks active step, form payload, cached PDF buffers, confirmation gates, and coordinates View/Processing.
 */

window.WorkflowEngine = {
    currentStep: 1,
    payload: { contractMode: "RENEWAL", page1: {}, page3: {} },
    templateBuffer: null,
    templateFileName: "Tenancy Contract Template.pdf",
    processedBytes: null,
    downloadBlobUrl: null,
    lastVerificationReport: null,
    lastOutputFileName: "White_Caves_Complete_Tenancy_Package_2026.pdf",

    confirmations: {
        engineLoaded: false,
        step1InputsConfirmed: false,
        templateConfirmed: false,
        coordinatesConfirmed: false,
        addendumConfirmed: false,
        receiptConfirmed: false,
        pdfProcessedAndVerified: false
    },

    initialize: async function () {
        this.confirmations.engineLoaded = window.PdfLibraryLoader ? window.PdfLibraryLoader.isEngineOnline() : false;

        if (window.FormLayoutBuilder) {
            this.payload = window.FormLayoutBuilder.collectCurrentFormMetrics().payload;
        }
        if (window.AddendumEngine) {
            window.AddendumEngine.renderAddendumForm("addendumFieldsRoot");
            window.AddendumEngine.syncFromStep1Payload(this.payload.page1);
        }
        if (window.ReceiptEngine) {
            window.ReceiptEngine.renderReceiptForm("receiptFieldsRoot");
            window.ReceiptEngine.syncFromStep1Payload(this.payload.page1);
        }

        if (window.TemplateAutoLoader && window.TemplateAutoLoader.detectedLocalBuffer) {
            this.templateBuffer = window.TemplateAutoLoader.detectedLocalBuffer;
            this.templateFileName = window.TemplateAutoLoader.detectedFileName;
            this.confirmations.templateConfirmed = true;
            if (window.PdfViewerEngine) {
                await window.PdfViewerEngine.initializeVisualPlayground(this.payload, this.templateBuffer);
            }
        }

        await this.goToStep(1);
        if (window.SmartFormatter) {
            window.SmartFormatter.init();
        }
        this.updateSidebarStatusUI();
    },

    onFormInputMutated: function () {
        if (window.FormLayoutBuilder) {
            this.payload = window.FormLayoutBuilder.collectCurrentFormMetrics().payload;
        }
        this.confirmations.step1InputsConfirmed = false;
        this.confirmations.pdfProcessedAndVerified = false;
        this.syncDownloadButtonLockState();
        if (window.PdfViewerEngine && [1, 2, 3, 0].includes(window.PdfViewerEngine.activeViewingPage)) {
            window.PdfViewerEngine.payload = this.payload;
            window.PdfViewerEngine.renderWorkspaceViewportFrame();
        }
        this.updateSidebarStatusUI();
    },

    onCoordinatesMutated: function () {
        this.confirmations.coordinatesConfirmed = false;
        this.confirmations.pdfProcessedAndVerified = false;
        this.syncDownloadButtonLockState();
        this.updateSidebarStatusUI();
    },

    onAddendumMutated: function () {
        this.confirmations.addendumConfirmed = false;
        this.confirmations.pdfProcessedAndVerified = false;
        this.syncDownloadButtonLockState();
        if (window.PdfViewerEngine && [4, 0].includes(window.PdfViewerEngine.activeViewingPage)) {
            window.PdfViewerEngine.renderWorkspaceViewportFrame();
        }
        this.updateSidebarStatusUI();
    },

    onReceiptMutated: function () {
        this.confirmations.receiptConfirmed = false;
        this.confirmations.pdfProcessedAndVerified = false;
        this.syncDownloadButtonLockState();
        if (window.PdfViewerEngine && [6, 7, 0].includes(window.PdfViewerEngine.activeViewingPage)) {
            window.PdfViewerEngine.renderWorkspaceViewportFrame();
        }
        this.updateSidebarStatusUI();
    },

    updateSidebarStatusUI: function () {
        if (window.SidebarStatusUpdater) window.SidebarStatusUpdater.updateSidebarUI(this);
        if (window.NavigationView) window.NavigationView.updateTopAndFooterControls(this);
    },

    goToStep: async function (targetStep) {
        this.currentStep = targetStep;
        if (window.NavigationView) window.NavigationView.showActiveStepSection(targetStep);

        if (window.PdfViewerEngine) {
            if (targetStep === 1) {
                if (![1, 2, 3].includes(window.PdfViewerEngine.activeViewingPage)) {
                    await window.PdfViewerEngine.switchPlaygroundViewPage(1);
                } else {
                    await window.PdfViewerEngine.renderWorkspaceViewportFrame();
                }
            } else if (targetStep === 2) {
                await window.PdfViewerEngine.switchPlaygroundViewPage(4);
            } else if (targetStep === 3) {
                await window.PdfViewerEngine.switchPlaygroundViewPage(6);
                if (window.ChequeScheduleView) {
                    window.ChequeScheduleView.render("chequeScheduleRoot");
                }
            } else if (targetStep === 4) {
                await window.PdfViewerEngine.switchPlaygroundViewPage(0);
                if (window.ClientHandoverView) {
                    window.ClientHandoverView.render("clientHandoverRoot");
                }
            }
        }
        this.updateSidebarStatusUI();
    },

    lockFormData: async function () {
        if (window.FormLayoutBuilder) {
            this.payload = window.FormLayoutBuilder.collectCurrentFormMetrics().payload;
        }
        this.confirmations.step1InputsConfirmed = true;
        this.confirmations.coordinatesConfirmed = true;
        if (window.AddendumEngine) window.AddendumEngine.syncFromStep1Payload(this.payload.page1);
        if (window.ReceiptEngine) window.ReceiptEngine.syncFromStep1Payload(this.payload.page1);
        if (this.templateBuffer && this.templateBuffer.byteLength > 0) this.confirmations.templateConfirmed = true;
        this.updateSidebarStatusUI();
        await this.goToStep(2);
    },

    confirmAddendumAndAdvanceToStep3: async function () {
        this.confirmations.addendumConfirmed = true;
        this.updateSidebarStatusUI();
        await this.goToStep(3);
    },

    confirmReceiptAndAdvanceToStep4: async function () {
        this.confirmations.receiptConfirmed = true;
        this.updateSidebarStatusUI();
        await this.goToStep(4);
    },

    handleFileSelection: async function (inputElement) {
        if (inputElement && inputElement.files && inputElement.files.length > 0) {
            const file = inputElement.files[0];
            const buffer = await file.arrayBuffer();
            await this.activateTemplateAndOpenViewer(buffer, file.name);
        }
    },

    activateTemplateAndOpenViewer: async function (arrayBuffer, fileName) {
        if (!arrayBuffer || arrayBuffer.byteLength === 0) return;
        this.templateBuffer = arrayBuffer;
        this.templateFileName = fileName || "Tenancy Contract Template.pdf";
        this.confirmations.templateConfirmed = true;
        this.confirmations.pdfProcessedAndVerified = false;
        this.syncDownloadButtonLockState();
        if (window.PdfRenderEngine) window.PdfRenderEngine.invalidateSessionCache();
        if (window.PdfViewerEngine) await window.PdfViewerEngine.initializeVisualPlayground(this.payload, this.templateBuffer);
        this.updateSidebarStatusUI();
    },

    processPdfAndVerifyTextInputs: async function (customSelection = null) {
        if (window.FormLayoutBuilder) {
            this.payload = window.FormLayoutBuilder.collectCurrentFormMetrics().payload;
        }
        const chkContract = typeof document !== "undefined" ? document.getElementById("chk-doc-contract") : null;
        const chkAddendum = typeof document !== "undefined" ? document.getElementById("chk-doc-addendum") : null;
        const chkReceipt = typeof document !== "undefined" ? document.getElementById("chk-doc-receipt") : null;

        const incContract = customSelection ? customSelection.contract : (chkContract ? chkContract.checked : true);
        const incAddendum = customSelection ? customSelection.addendum : (chkAddendum ? chkAddendum.checked : true);
        const incReceipt = customSelection ? customSelection.receipt : (chkReceipt ? chkReceipt.checked : true);

        if (!incContract && !incAddendum && !incReceipt) {
            alert("Please select at least 1 document in the footer (Contract, Addendum, or Receipt) to process.");
            return;
        }

        const procBtns = ["btn-process-pdf-step3", "btn-footer-process"].map(id => typeof document !== "undefined" ? document.getElementById(id) : null).filter(Boolean);
        procBtns.forEach(b => { b.disabled = true; b.innerText = "⏳ Compiling..."; });

        try {
            const result = await window.PdfProcessor.executeStampingPipeline(this.templateBuffer, this.payload, incAddendum, incReceipt, incContract);
            this.processedBytes = result.processedBytes;
            this.lastVerificationReport = result.verification;

            const parts = [];
            if (incContract) parts.push("Contract");
            if (incAddendum) parts.push("Addendum");
            if (incReceipt) parts.push("Receipt");
            this.lastOutputFileName = `White_Caves_${parts.join("_")}_2026.pdf`;

            if (typeof URL !== "undefined" && typeof Blob !== "undefined") {
                if (this.downloadBlobUrl) URL.revokeObjectURL(this.downloadBlobUrl);
                this.downloadBlobUrl = URL.createObjectURL(new Blob([this.processedBytes], { type: "application/pdf" }));
            }

            this.confirmations.pdfProcessedAndVerified = true;
            const statusBanner = typeof document !== "undefined" ? document.getElementById("finalStatusNotification") : null;
            if (statusBanner) {
                const v = result.verification;
                statusBanner.className = "alert-info success-badge-override";
                statusBanner.innerHTML = `<strong>🟢 Compiled & Verified (${v.totalPagesCount} Pages • ${(v.finalBytes / 1024).toFixed(1)} KB)!</strong> Ready to Download or Share on WhatsApp in the footer.`;
            }

            if (window.PdfViewerEngine) {
                if (incContract && !incAddendum && !incReceipt) await window.PdfViewerEngine.switchPlaygroundViewPage(1);
                else if (!incContract && incAddendum && !incReceipt) await window.PdfViewerEngine.switchPlaygroundViewPage(4);
                else if (!incContract && !incAddendum && incReceipt) await window.PdfViewerEngine.switchPlaygroundViewPage(6);
                else await window.PdfViewerEngine.switchPlaygroundViewPage(0);
            }

            this.syncDownloadButtonLockState();
            this.updateSidebarStatusUI();
        } catch (error) {
            alert("PDF Processing Error: " + error.message);
        } finally {
            procBtns.forEach(b => { b.disabled = false; b.innerText = "⚡ Process Selected PDF"; });
        }
    },

    scrollToViewerSheetPage: async function (pageNumber) {
        if (window.PdfViewerEngine && window.PdfViewerEngine.activeViewingPage !== 0) {
            await window.PdfViewerEngine.switchPlaygroundViewPage(0);
        }
        const el = document.getElementById(`viewer-sheet-page-${pageNumber}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    },

    syncDownloadButtonLockState: function () {
        if (window.NavigationView) window.NavigationView.syncExportButtonsState(this);
    }
};
