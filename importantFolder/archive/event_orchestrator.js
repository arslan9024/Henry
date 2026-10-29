// FILE: event_orchestrator.js
/**
 * [Category 4: Event Handler]
 * White Caves Real Estate - Central Orchestrator Switchboard (event_orchestrator.js)
 * Binds all UI events (clicks, filters, nudges, file uploads, footer actions) with zero inline HTML JS.
 */

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("DOMContentLoaded", async () => {
        // 1. Render Step 1 Form Inputs (24 Page 1 + 5 Page 3 unnumbered sentences)
        if (window.FormLayoutBuilder) {
            window.FormLayoutBuilder.renderFormFields("page1FieldsRoot", "page3ClausesRoot");
        }

        // Prevent default form submission (zero inline onsubmit in HTML)
        const contractForm = document.getElementById("contractDataForm");
        if (contractForm) {
            contractForm.addEventListener("submit", (e) => e.preventDefault());
        }

        // Bind Section Filter Chips (delegated so Step 1 & Step 3 filter bars each filter only their own step)
        document.addEventListener("click", (e) => {
            const chip = e.target.closest ? e.target.closest(".filter-chip") : null;
            if (!chip || !window.FormLayoutBuilder) return;
            window.FormLayoutBuilder.filterInputSections(chip.getAttribute("data-filter-group"), chip.closest("section"));
        });

        // Step 3 Addendum Inputs (delegated: text inputs + dropdowns) -> Values State -> Live Preview
        const onAddendumEdit = (e) => {
            const el = e.target;
            if (!el || !el.getAttribute || !el.getAttribute("data-addendum-key")) return;
            if (window.AddendumData) window.AddendumData.setParam(el.getAttribute("data-addendum-key"), el.value);
            if (window.WorkflowEngine) window.WorkflowEngine.onAddendumMutated();
        };
        document.addEventListener("input", onAddendumEdit);
        document.addEventListener("change", onAddendumEdit);

        document.querySelectorAll("input[data-focus-key]").forEach(inp => {
            inp.addEventListener("focus", () => {
                const pageScope = inp.getAttribute("data-focus-page");
                const fieldKey = inp.getAttribute("data-focus-key");
                if (window.PdfViewerEngine) {
                    const targetPage = pageScope === "page3" ? 3 : 1;
                    if (window.PdfViewerEngine.activeViewingPage !== targetPage && window.PdfViewerEngine.activeViewingPage !== 0) {
                        window.PdfViewerEngine.switchPlaygroundViewPage(targetPage).then(() => {
                            window.PdfViewerEngine.highlightFieldTag(pageScope, fieldKey);
                        });
                    } else {
                        window.PdfViewerEngine.highlightFieldTag(pageScope, fieldKey);
                    }
                }
            });
        });

        // 2. Auto-load 'Tenancy Contract Template.pdf' from root folder
        if (window.TemplateAutoLoader) {
            await window.TemplateAutoLoader.tryExecuteAutomaticLoadPipeline();
        }

        // 3. Initialize Studio Workflow State Machine
        if (window.WorkflowEngine) {
            await window.WorkflowEngine.initialize();
        }

        const bindClick = (id, handler) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener("click", handler);
        };

        // 4. Contract Mode Selection (Renewal vs New Contract) in Home Hub
        bindClick("hub-mode-renewal", () => {
            if (window.FormLayoutBuilder) window.FormLayoutBuilder.setContractMode("RENEWAL");
        });
        bindClick("hub-mode-new", () => {
            if (window.FormLayoutBuilder) window.FormLayoutBuilder.setContractMode("NEW");
        });

        // Step 1 Verification / KYC Document Uploads (Renewal: Old Contract | New: EID, Visa, Passport)
        const step1UploadRoot = document.getElementById("step1UploadRoot");
        if (step1UploadRoot) {
            step1UploadRoot.addEventListener("change", async (e) => {
                const targetKey = e.target.getAttribute("data-upload-target");
                if (targetKey && e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    if (window.DocumentUploadState) {
                        window.DocumentUploadState.setFile(targetKey, file);
                    }
                    const mode = window.FormLayoutBuilder ? window.FormLayoutBuilder.contractMode : "RENEWAL";
                    if (window.DocumentUploadView) {
                        window.DocumentUploadView.render("step1UploadRoot", mode);
                    }
                    if (window.WorkflowEngine) window.WorkflowEngine.updateSidebarStatusUI();

                    // If Old Contract was uploaded in Renewal mode, extract fields and prompt side-by-side comparison
                    if (targetKey === "old_contract" && window.ContractParserEngine) {
                        try {
                            const parsed = await window.ContractParserEngine.parseUploadedContract(file);
                            if (window.ContractDiffState && window.ContractDiffView) {
                                const currentPayload = window.FormLayoutBuilder ? window.FormLayoutBuilder.collectCurrentFormMetrics().payload : {};
                                window.ContractDiffState.setComparisonData(parsed, currentPayload, file.name);
                                window.ContractDiffView.renderModal("diffModalMountPoint");
                            }
                        } catch (err) {
                            console.warn("Contract auto-parse error:", err);
                        }
                    }
                }
            });

            step1UploadRoot.addEventListener("click", (e) => {
                const removeBtn = e.target.closest("[data-remove-target]");
                if (removeBtn) {
                    const targetKey = removeBtn.getAttribute("data-remove-target");
                    if (window.DocumentUploadState) {
                        window.DocumentUploadState.removeFile(targetKey);
                    }
                    const mode = window.FormLayoutBuilder ? window.FormLayoutBuilder.contractMode : "RENEWAL";
                    if (window.DocumentUploadView) {
                        window.DocumentUploadView.render("step1UploadRoot", mode);
                    }
                    if (window.WorkflowEngine) window.WorkflowEngine.updateSidebarStatusUI();
                }
            });
        }

        // Side-by-Side Diff Modal Delegated Event Listeners
        document.body.addEventListener("click", (e) => {
            // Close / Cancel modal
            if (e.target.closest("#btn-close-diff-modal") || e.target.closest("#btn-cancel-diff")) {
                if (window.ContractDiffView) window.ContractDiffView.closeModal("diffModalMountPoint");
                return;
            }

            // Apply selected diff changes to Step 1 form
            if (e.target.closest("#btn-apply-diff")) {
                if (window.ContractDiffState) {
                    const applied = window.ContractDiffState.applySelectedToForm();
                    if (window.ContractDiffView) window.ContractDiffView.closeModal("diffModalMountPoint");
                    alert(`✓ Successfully updated ${applied.length} field(s) in Step 1 from the uploaded contract!`);
                }
                return;
            }
        });

        document.body.addEventListener("change", (e) => {
            // Diff field individual checkbox toggle
            if (e.target.classList.contains("diff-field-checkbox")) {
                const key = e.target.getAttribute("data-diff-key");
                if (window.ContractDiffState && key) {
                    window.ContractDiffState.toggleField(key, e.target.checked);
                    if (window.ContractDiffView) window.ContractDiffView.renderModal("diffModalMountPoint");
                }
                return;
            }

            // Diff select all checkbox toggle
            if (e.target.id === "diff-select-all-chk") {
                if (window.ContractDiffState) {
                    window.ContractDiffState.selectAll(e.target.checked);
                    if (window.ContractDiffView) window.ContractDiffView.renderModal("diffModalMountPoint");
                }
                return;
            }
        });

        // 5. Top Navbar Navigation Pills (Home Hub + Steps 1-5)
        for (let s = 0; s <= 5; s++) {
            bindClick(`nav-step-${s}`, () => window.WorkflowEngine.goToStep(s));
        }

        // Home Hub & Column C Quick Document Openers / Solo Compilers
        bindClick("btn-hub-open-doc1", () => window.WorkflowEngine.goToStep(1));
        bindClick("btn-hub-open-cal", () => window.WorkflowEngine.goToStep(2));
        bindClick("btn-hub-open-doc2", () => window.WorkflowEngine.goToStep(3));
        bindClick("btn-hub-open-doc3", () => window.WorkflowEngine.goToStep(4));

        bindClick("btn-colc-doc1", () => window.WorkflowEngine.goToStep(1));
        bindClick("btn-colc-doc2", () => window.WorkflowEngine.goToStep(3));
        bindClick("btn-colc-doc3", () => window.WorkflowEngine.goToStep(4));

        const setChecksAndCompile = (c1, c2, c3) => {
            const el1 = document.getElementById("chk-doc-contract");
            const el2 = document.getElementById("chk-doc-addendum");
            const el3 = document.getElementById("chk-doc-receipt");
            if (el1) el1.checked = c1;
            if (el2) el2.checked = c2;
            if (el3) el3.checked = c3;
            window.WorkflowEngine.processPdfAndVerifyTextInputs({ contract: c1, addendum: c2, receipt: c3 });
        };
        bindClick("btn-hub-solo-doc1", () => setChecksAndCompile(true, false, false));
        bindClick("btn-hub-solo-doc2", () => setChecksAndCompile(false, true, false));
        bindClick("btn-hub-solo-doc3", () => setChecksAndCompile(false, false, true));

        // 6. Footer Master Journey Controls (All Journey Navigation in Footer)
        const handlePrevStep = () => {
            if (window.WorkflowEngine.currentStep > 0) {
                window.WorkflowEngine.goToStep(window.WorkflowEngine.currentStep - 1);
            }
        };
        const handleNextStep = () => {
            const step = window.WorkflowEngine.currentStep;
            if (step === 0) window.WorkflowEngine.goToStep(1);
            else if (step === 1) window.WorkflowEngine.lockFormData();
            else if (step === 2) window.WorkflowEngine.confirmCoordinatesAndAdvanceToStep3();
            else if (step === 3) window.WorkflowEngine.confirmAddendumAndAdvanceToStep4();
            else if (step === 4) window.WorkflowEngine.confirmReceiptAndAdvanceToStep5();
        };

        bindClick("btn-footer-prev", handlePrevStep);
        bindClick("btn-footer-next", handleNextStep);

        // 7. Center PDF Viewer Controls (Page Switcher, Zoom, On-Screen 1pt Nudge, Reset & Export)
        const fileInput = document.getElementById("pdfFileInput");
        if (fileInput) {
            fileInput.addEventListener("change", function () {
                if (window.WorkflowEngine) window.WorkflowEngine.handleFileSelection(this);
            });
        }

        // Page & Zoom dropdowns, collapsible calibration tools, focus mode
        if (window.ViewerToolbarView) {
            window.ViewerToolbarView.buildDropdowns();
            if (window.PdfViewerEngine) {
                window.ViewerToolbarView.syncPageSelect(window.PdfViewerEngine.activeViewingPage);
                window.ViewerToolbarView.syncZoomSelect(window.PdfViewerEngine.currentZoom);
            }
        }
        const pageSelect = document.getElementById("viewer-page-select");
        if (pageSelect) pageSelect.addEventListener("change", () => {
            if (window.PdfViewerEngine) window.PdfViewerEngine.switchPlaygroundViewPage(parseInt(pageSelect.value, 10));
        });
        const zoomSelect = document.getElementById("viewer-zoom-select");
        if (zoomSelect) zoomSelect.addEventListener("change", () => {
            if (window.PdfViewerEngine) window.PdfViewerEngine.setZoom(parseFloat(zoomSelect.value));
        });
        bindClick("btn-toggle-viewer-tools", () => window.ViewerToolbarView && window.ViewerToolbarView.toggleCalibrationTools());
        bindClick("btn-viewer-focus", () => window.ViewerToolbarView && window.ViewerToolbarView.toggleFocusMode());
        bindClick("nav-step-2", () => window.ViewerToolbarView && window.ViewerToolbarView.toggleCalibrationTools(true));
        bindClick("btn-hub-open-cal", () => window.ViewerToolbarView && window.ViewerToolbarView.toggleCalibrationTools(true));

        bindClick("btn-nudge-left", () => window.PdfViewerEngine && window.PdfViewerEngine.nudgeSelectedNode(-1, 0));
        bindClick("btn-nudge-up", () => window.PdfViewerEngine && window.PdfViewerEngine.nudgeSelectedNode(0, -1));
        bindClick("btn-nudge-down", () => window.PdfViewerEngine && window.PdfViewerEngine.nudgeSelectedNode(0, 1));
        bindClick("btn-nudge-right", () => window.PdfViewerEngine && window.PdfViewerEngine.nudgeSelectedNode(1, 0));

        bindClick("btn-reset-coordinates", () => window.PdfViewerEngine && window.PdfViewerEngine.resetAllCoordinatesToDefault());
        bindClick("btn-export-script-file", () => window.PdfViewerEngine && window.PdfViewerEngine.downloadCalibratedMapperScript());

        // 8. Footer Combiner, Process, Download & WhatsApp Share Controls
        ["chk-doc-contract", "chk-doc-addendum", "chk-doc-receipt"].forEach(id => {
            const chk = document.getElementById(id);
            if (chk) chk.addEventListener("change", () => {
                window.WorkflowEngine.confirmations.pdfProcessedAndVerified = false;
                window.WorkflowEngine.syncDownloadButtonLockState();
            });
        });

        bindClick("btn-process-pdf-step3", () => window.WorkflowEngine.processPdfAndVerifyTextInputs());
        bindClick("btn-footer-process", () => window.WorkflowEngine.processPdfAndVerifyTextInputs());

        for (let p = 1; p <= 7; p++) {
            bindClick(`btn-jump-page-${p}`, () => window.WorkflowEngine.scrollToViewerSheetPage(p));
        }

        bindClick("btn-download-final-pdf", () => {
            if (window.WorkflowEngine && window.DownloadHandler) {
                if (!window.WorkflowEngine.confirmations.pdfProcessedAndVerified) {
                    alert("Please click '⚡ Process Selected PDF' in the footer first.");
                    return;
                }
                window.DownloadHandler.executeSecureDownload(
                    window.WorkflowEngine.downloadBlobUrl,
                    window.WorkflowEngine.lastOutputFileName || "White_Caves_Complete_Tenancy_Package_2026.pdf"
                );
            }
        });

        bindClick("btn-share-whatsapp", () => {
            if (window.WhatsAppSharer) window.WhatsAppSharer.shareCompiledPackage();
        });
    });
}
