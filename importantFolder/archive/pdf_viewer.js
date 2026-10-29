/**
 * White Caves Real Estate - Right-Docked Multi-Mode Live PDF Viewer & Calibration Engine (pdf_viewer.js)
 * Renders DLD Pages 1-3 (via PDF.js from Tenancy Contract Template.pdf), Addendum Pages 4-6,
 * Payment Receipt Page 7, or All 7 Pages Continuous Scroll.
 */

window.PdfViewerEngine = {
    payload: null,
    templateBuffer: null,
    activeDragElement: null,
    selectedElement: null,
    dragStartMouse: { x: 0, y: 0 },
    dragStartPos: { left: 0, top: 0 },
    activeViewingPage: 1, // 1, 2, 3, 4 (Addendum 4-6), 7 (Receipt), or 0 (All 7 Pages Scroll)
    currentZoom: 0.85,
    _listenersBound: false,
    PAD_LEFT: 4,

    initializeVisualPlayground: async function (capturedPayload, rawPdfBuffer) {
        this.payload = capturedPayload;
        this.templateBuffer = rawPdfBuffer;
        if (window.PdfDragController) window.PdfDragController.bindGlobalEventsOnce(this);
        await this.renderWorkspaceViewportFrame();
    },

    setZoom: function (zoomValue) {
        this.currentZoom = Math.max(0.55, Math.min(1.35, parseFloat(zoomValue) || 0.85));
        if (typeof document === "undefined") return;
        const canvasArea = document.getElementById("playground-canvas-area");
        const stageWrapper = document.getElementById("playground-stage-sizer");
        if (canvasArea && stageWrapper) {
            let pageCount = 1;
            if (this.activeViewingPage === 0) pageCount = 6;
            else if (this.activeViewingPage === 4) pageCount = 2;

            const totalHeight = pageCount * 842 + (pageCount - 1) * 24;
            canvasArea.style.transform = `scale(${this.currentZoom})`;
            canvasArea.style.transformOrigin = "top left";
            stageWrapper.style.width = `${Math.round(595 * this.currentZoom)}px`;
            stageWrapper.style.height = `${Math.round(totalHeight * this.currentZoom)}px`;
        }
        if (window.ViewerToolbarView) window.ViewerToolbarView.syncZoomSelect(this.currentZoom);
    },

    renderWorkspaceViewportFrame: async function () {
        if (typeof document === "undefined") return;
        const container = document.getElementById("playground-canvas-area");
        if (!container) return;

        container.innerHTML = "";
        this.selectedElement = null;
        this.updateInspectorReadout(null);

        let pagesToRender = [1];
        if (this.activeViewingPage === 0) pagesToRender = [1, 2, 3, 4, 5, 6];
        else if (this.activeViewingPage === 4) pagesToRender = [4, 5];
        else if (this.activeViewingPage === 7) pagesToRender = [6];
        else pagesToRender = [this.activeViewingPage];

        const totalContainerHeight = pagesToRender.length * 842 + (pagesToRender.length - 1) * 24;
        container.style.height = `${totalContainerHeight}px`;
        container.style.background = pagesToRender.length > 1 ? "transparent" : "#ffffff";
        container.style.boxShadow = pagesToRender.length > 1 ? "none" : "0 12px 32px rgba(0, 0, 0, 0.35)";

        let lastRenderResult = null;

        for (let idx = 0; idx < pagesToRender.length; idx++) {
            const pageNum = pagesToRender[idx];
            const yOffset = idx * (842 + 24);

            const pageSheet = document.createElement("div");
            pageSheet.id = `viewer-sheet-page-${pageNum}`;
            pageSheet.style.cssText = `position:absolute;top:${yOffset}px;left:0;width:595px;height:842px;background:#ffffff;box-shadow:0 8px 24px rgba(0,0,0,0.3);`;
            pageSheet.setAttribute("data-sheet-page", String(pageNum));
            container.appendChild(pageSheet);

            if (pagesToRender.length > 1) {
                const pill = document.createElement("div");
                pill.className = "sheet-corner-badge";
                pill.innerText = `Page ${pageNum} of 6`;
                pageSheet.appendChild(pill);
            }

            const blueprintCanvas = document.createElement("canvas");
            blueprintCanvas.style.cssText = "position:absolute;top:0;left:0;z-index:1;pointer-events:none;";
            pageSheet.appendChild(blueprintCanvas);

            if (pageNum <= 3) {
                lastRenderResult = await window.PdfRenderEngine.drawPdfPageToCanvas(blueprintCanvas, this.templateBuffer, pageNum);
                const mapperRoot = window.ContractMapper;
                const pageKey = `page${pageNum}`;
                const activeFieldsGroup = mapperRoot[pageKey];
                const activeValuesGroup = (this.payload && this.payload[pageKey]) ? this.payload[pageKey] : {};

                if (activeFieldsGroup) {
                    for (const fieldKey in activeFieldsGroup) {
                        const fieldCoordinates = activeFieldsGroup[fieldKey];
                        const rawDisplay = activeValuesGroup[fieldKey] || "";
                        const displayString = pageNum === 3 ? rawDisplay.replace(/^\s*\d+[\.\)\-]\s*/, "").trim() : rawDisplay.trim();

                        if (displayString !== "") {
                            const fontSize = parseFloat(fieldCoordinates.size || 8.5);
                            const textNode = document.createElement("div");
                            textNode.className = "draggable-text-node";
                            textNode.id = `node-${pageKey}-${fieldKey}`;
                            textNode.innerText = displayString;
                            textNode.setAttribute("data-field-key", fieldKey);
                            textNode.setAttribute("data-field-label", fieldCoordinates.label || fieldKey);
                            textNode.setAttribute("data-page-scope", pageKey);
                            textNode.setAttribute("data-font-size", String(fontSize));

                            const pdfX = parseFloat(fieldCoordinates.x);
                            const pdfY = parseFloat(fieldCoordinates.y);
                            textNode.style.left = `${pdfX - this.PAD_LEFT}px`;
                            textNode.style.top = `${(842 - pdfY) - fontSize}px`;
                            textNode.style.fontSize = `${fontSize}px`;
                            textNode.style.zIndex = "100";
                            textNode.title = `${fieldCoordinates.label || fieldKey} (X: ${Math.round(pdfX)}, Y: ${Math.round(pdfY)}) — Drag to calibrate`;

                            if (window.PdfDragController) window.PdfDragController.bindNodeMouseDown(this, textNode);
                            pageSheet.appendChild(textNode);
                        }
                    }
                } else if (pageNum === 2) {
                    const infoOverlay = document.createElement("div");
                    infoOverlay.className = "page2-readonly-pill";
                    infoOverlay.innerText = "ℹ️ Page 2: Standard DLD Legal Terms & Conditions (Read-Only)";
                    pageSheet.appendChild(infoOverlay);
                }
            } else if (pageNum >= 4 && pageNum <= 5) {
                if (window.AddendumEngine) window.AddendumEngine.renderAddendumPageToCanvas(blueprintCanvas, pageNum - 4);
            } else if (pageNum === 6) {
                if (window.ReceiptEngine) window.ReceiptEngine.renderReceiptPageToCanvas(blueprintCanvas);
            }
        }

        const engineBadge = document.getElementById("viewer-render-mode-badge");
        if (engineBadge) {
            engineBadge.innerText = lastRenderResult && lastRenderResult.mode === "pdfjs"
                ? "🟢 Direct PDF.js HiDPI Engine"
                : "🟢 Calibrated HiDPI Vector Engine";
        }

        const indicator = document.getElementById("playground-page-indicator");
        if (indicator) {
            const labels = {
                0: "All 6 Pages (Continuous Scroll)",
                1: "Page 1 of 6 — DLD Grid (24 Fields + ✓)",
                2: "Page 2 of 6 — DLD Legal Terms",
                3: "Page 3 of 6 — DLD Clauses (5 Lines)",
                4: "Pages 4–5 of 6 — 2-Page RERA Addendum",
                6: "Page 6 of 6 — Payment Receipt"
            };
            indicator.innerText = labels[this.activeViewingPage] || "";
        }

        if (window.ViewerToolbarView) window.ViewerToolbarView.syncPageSelect(this.activeViewingPage);

        this.setZoom(this.currentZoom);
    },

    switchPlaygroundViewPage: async function (targetPageNumber) {
        if (targetPageNumber === 7) targetPageNumber = 6;
        if (![0, 1, 2, 3, 4, 6].includes(targetPageNumber)) return;
        this.activeViewingPage = targetPageNumber;
        await this.renderWorkspaceViewportFrame();
    },

    selectNode: function (element) {
        if (this.selectedElement && this.selectedElement !== element) {
            this.selectedElement.classList.remove("selected-node");
        }
        this.selectedElement = element;
        if (element) {
            element.classList.add("selected-node");
            this.updateInspectorReadout(element);
        }
    },

    highlightFieldTag: function (pageScope, fieldKey) {
        if (typeof document === "undefined") return;
        const targetNode = document.getElementById(`node-${pageScope}-${fieldKey}`);
        if (targetNode) {
            this.selectNode(targetNode);
        }
    },

    nudgeSelectedNode: function (dx, dy) {
        if (!this.selectedElement) return;
        const left = (parseFloat(this.selectedElement.style.left) || 0) + dx;
        const top = (parseFloat(this.selectedElement.style.top) || 0) + dy;
        this.selectedElement.style.left = `${left}px`;
        this.selectedElement.style.top = `${top}px`;
        this.saveUpdatedNodeCoordinates(this.selectedElement, true);
    },

    saveUpdatedNodeCoordinates: function (element, persistToStorage) {
        const fieldKey = element.getAttribute("data-field-key");
        const scopeKey = element.getAttribute("data-page-scope");
        const fontSize = parseFloat(element.getAttribute("data-font-size") || 8.5);
        const updatedPdfX = Math.round((parseFloat(element.style.left) || 0) + this.PAD_LEFT);
        const updatedPdfY = Math.round(842 - ((parseFloat(element.style.top) || 0) + fontSize));

        if (window.ContractMapper[scopeKey] && window.ContractMapper[scopeKey][fieldKey]) {
            window.ContractMapper[scopeKey][fieldKey].x = updatedPdfX;
            window.ContractMapper[scopeKey][fieldKey].y = updatedPdfY;
            element.title = `${element.getAttribute("data-field-label")} (X: ${updatedPdfX}, Y: ${updatedPdfY})`;
            this.updateInspectorReadout(element);

            if (persistToStorage) {
                if (window.ContractMapperHelper) window.ContractMapperHelper.saveCoordinatesToStorage();
                if (window.WorkflowEngine) window.WorkflowEngine.onCoordinatesMutated();
            }
        }
    },

    updateInspectorReadout: function (element) {
        const readout = document.getElementById("selected-field-readout");
        if (!readout) return;
        if (!element) {
            readout.innerText = "🎯 Coordinate Inspector: Click or drag any tag on Page 1 or Page 3 (Arrow keys = 1pt)";
            return;
        }
        const fieldKey = element.getAttribute("data-field-key");
        const scopeKey = element.getAttribute("data-page-scope");
        const label = element.getAttribute("data-field-label") || fieldKey;
        const coords = window.ContractMapper[scopeKey][fieldKey];
        readout.innerHTML = `🎯 <strong>${label}</strong> &rarr; <code>X: ${coords.x} pt, Y: ${coords.y} pt</code>`;
    },

    resetAllCoordinatesToDefault: async function () {
        if (window.ContractMapperHelper) window.ContractMapperHelper.resetToDefaults();
        if (window.WorkflowEngine) window.WorkflowEngine.onCoordinatesMutated();
        await this.renderWorkspaceViewportFrame();
    },

    downloadCalibratedMapperScript: function () {
        if (window.ContractMapperHelper) window.ContractMapperHelper.exportMapperScriptFile();
    }
};
