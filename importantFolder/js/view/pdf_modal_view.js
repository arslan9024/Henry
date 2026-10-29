// FILE: js/view/pdf_modal_view.js
/**
 * [Category 1: View Skeleton]
 * White Caves Real Estate - Fullscreen PDF Document Preview Modal View (pdf_modal_view.js)
 * Renders a side-by-side / fullscreen modal overlay for focused PDF document inspection,
 * pagination, zooming, and zero-loss return to form workflow steps.
 * Pure presentational DOM builder: zero business logic.
 */

window.PdfModalView = {
    render: function (mountId) {
        const mount = document.getElementById(mountId);
        if (!mount) return;

        const state = window.PdfModalState;
        if (!state || !state.isOpen) {
            mount.innerHTML = "";
            return;
        }

        const activePage = state.activePage;
        const zoom = state.zoom || 0.95;
        const zoomPercent = Math.round(zoom * 100);

        mount.innerHTML = `
        <div class="pdf-modal-backdrop" id="pdfModalBackdrop" role="dialog" aria-modal="true" aria-labelledby="pdfModalTitle">
            <div class="pdf-modal-container">
                <!-- Modal Header -->
                <div class="pdf-modal-header">
                    <div class="pdf-modal-title-block">
                        <span class="pdf-modal-icon">📄</span>
                        <div>
                            <h2 id="pdfModalTitle" class="pdf-modal-title">Live Document Preview</h2>
                            <p class="pdf-modal-subtitle">Official DLD Unified Tenancy Contract, RERA Addendum & Payment Receipt</p>
                        </div>
                    </div>

                    <!-- Centered Toolbar: Page & Zoom Controls -->
                    <div class="pdf-modal-toolbar">
                        <div class="pdf-modal-btn-group">
                            <button type="button" class="pdf-modal-btn" data-pdf-modal-page="prev" title="Previous Page" ${activePage <= 1 ? "disabled" : ""}>◀ Prev</button>
                            <select id="pdfModalPageSelect" class="pdf-modal-select" aria-label="Select Viewing Page">
                                <option value="0" ${activePage === 0 ? "selected" : ""}>All Pages (Continuous Scroll)</option>
                                <option value="1" ${activePage === 1 ? "selected" : ""}>Page 1: DLD Contract Grid</option>
                                <option value="2" ${activePage === 2 ? "selected" : ""}>Page 2: Standard Legal Terms</option>
                                <option value="3" ${activePage === 3 ? "selected" : ""}>Page 3: Special Stipulations</option>
                                <option value="4" ${activePage === 4 ? "selected" : ""}>Page 4: RERA Addendum (Part 1)</option>
                                <option value="5" ${activePage === 5 ? "selected" : ""}>Page 5: RERA Addendum (Part 2)</option>
                                <option value="6" ${activePage === 6 ? "selected" : ""}>Page 6: Addendum Signatures</option>
                                <option value="7" ${activePage === 7 ? "selected" : ""}>Page 7: Official Payment Receipt</option>
                            </select>
                            <button type="button" class="pdf-modal-btn" data-pdf-modal-page="next" title="Next Page" ${activePage >= 7 || activePage === 0 ? "disabled" : ""}>Next ▶</button>
                        </div>

                        <div class="pdf-modal-divider"></div>

                        <div class="pdf-modal-btn-group">
                            <button type="button" class="pdf-modal-btn" data-pdf-modal-zoom="out" title="Zoom Out">🔍−</button>
                            <span class="pdf-modal-zoom-display" id="pdfModalZoomDisplay">${zoomPercent}%</span>
                            <button type="button" class="pdf-modal-btn" data-pdf-modal-zoom="in" title="Zoom In">🔍+</button>
                            <button type="button" class="pdf-modal-btn" data-pdf-modal-zoom="reset" title="Fit to View">Fit</button>
                        </div>
                    </div>

                    <!-- Close Action -->
                    <button type="button" class="pdf-modal-close-btn" data-close-pdf-modal title="Close Preview (Esc)">✕</button>
                </div>

                <!-- Modal Body: Viewport -->
                <div class="pdf-modal-body" id="pdfModalViewport">
                    <div id="pdfModalStageWrapper" class="pdf-modal-stage-wrapper" style="transform: scale(${zoom}); transform-origin: top center;">
                        <div id="pdfModalCanvasArea" class="pdf-modal-canvas-area"></div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="pdf-modal-footer">
                    <div class="pdf-modal-footer-info">
                        <span class="pdf-modal-badge-live">🟢 High-DPI Engine Active</span>
                        <span class="pdf-modal-footer-caption">Tip: You can press <strong>Esc</strong> to return to your form inputs anytime.</span>
                    </div>
                    <div class="pdf-modal-footer-actions">
                        <button type="button" class="pdf-modal-btn-return" data-close-pdf-modal>
                            <span>✓ Return to Editor Steps</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

        this.renderCanvasSheets();
    },

    renderCanvasSheets: async function () {
        const container = document.getElementById("pdfModalCanvasArea");
        if (!container) return;

        container.innerHTML = "";
        const state = window.PdfModalState;
        const activePage = state ? state.activePage : 1;

        let pagesToRender = [1];
        if (activePage === 0) pagesToRender = [1, 2, 3, 4, 5, 6, 7];
        else pagesToRender = [activePage];

        const totalHeight = pagesToRender.length * 842 + (pagesToRender.length - 1) * 28;
        container.style.width = "595px";
        container.style.height = `${totalHeight}px`;

        const templateBuffer = window.PdfViewerEngine ? window.PdfViewerEngine.templateBuffer : null;
        const payload = window.FormLayoutBuilder ? window.FormLayoutBuilder.collectCurrentFormMetrics().payload : {};

        for (let idx = 0; idx < pagesToRender.length; idx++) {
            const pageNum = pagesToRender[idx];
            const yOffset = idx * (842 + 28);

            const pageSheet = document.createElement("div");
            pageSheet.className = "pdf-modal-sheet";
            pageSheet.style.cssText = `position:absolute;top:${yOffset}px;left:0;width:595px;height:842px;background:#ffffff;box-shadow:0 12px 36px rgba(0,0,0,0.3);border-radius:4px;overflow:hidden;`;
            container.appendChild(pageSheet);

            const pageBadge = document.createElement("div");
            pageBadge.className = "sheet-corner-badge";
            pageBadge.innerText = `Page ${pageNum} of ${pageNum <= 3 ? "3 (DLD)" : (pageNum <= 6 ? "6 (Addendum)" : "7 (Receipt)")}`;
            pageSheet.appendChild(pageBadge);

            const canvas = document.createElement("canvas");
            canvas.style.cssText = "position:absolute;top:0;left:0;z-index:1;";
            pageSheet.appendChild(canvas);

            // Render according to page category
            if (pageNum <= 3) {
                if (window.PdfRenderEngine) {
                    await window.PdfRenderEngine.drawPdfPageToCanvas(canvas, templateBuffer, pageNum);
                }
                // Mount field text overlays
                const mapperRoot = window.ContractMapper;
                const pageKey = `page${pageNum}`;
                const activeFields = mapperRoot ? mapperRoot[pageKey] : null;
                const activeValues = payload[pageKey] || {};

                if (activeFields) {
                    for (const fieldKey in activeFields) {
                        const coords = activeFields[fieldKey];
                        const val = activeValues[fieldKey] || "";
                        if (val.trim()) {
                            const fontSize = parseFloat(coords.size || 8.5);
                            const textNode = document.createElement("div");
                            textNode.style.cssText = `position:absolute;left:${parseFloat(coords.x) - 4}px;top:${(842 - parseFloat(coords.y)) - fontSize}px;font-size:${fontSize}px;font-family:Arial,sans-serif;color:#0f172a;z-index:20;pointer-events:none;white-space:nowrap;`;
                            textNode.innerText = val.trim();
                            pageSheet.appendChild(textNode);
                        }
                    }
                }
            } else if (pageNum >= 4 && pageNum <= 6) {
                if (window.AddendumEngine) {
                    window.AddendumEngine.renderAddendumPageToCanvas(canvas, pageNum - 4);
                }
            } else if (pageNum === 7) {
                if (window.ReceiptEngine) {
                    window.ReceiptEngine.renderReceiptPageToCanvas(canvas);
                }
            }
        }
    }
};

