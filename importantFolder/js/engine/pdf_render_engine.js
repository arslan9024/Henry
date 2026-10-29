// pdf_render_engine.js - High-DPI PDF.js Document Rasterizer
window.PdfRenderEngine = {
    pdfjsInstance: null,
    activeDocumentProxy: null,
    lastBufferByteLength: 0,

    ensureEngineReady: function () {
        if (typeof window["pdfjs-dist/build/pdf"] !== "undefined") {
            this.pdfjsInstance = window["pdfjs-dist/build/pdf"];
        } else if (typeof pdfjsLib !== "undefined") {
            this.pdfjsInstance = pdfjsLib;
        }
        if (this.pdfjsInstance && this.pdfjsInstance.GlobalWorkerOptions) {
            if (!this.pdfjsInstance.GlobalWorkerOptions.workerSrc) {
                this.pdfjsInstance.GlobalWorkerOptions.workerSrc =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            }
        }
    },

    drawPdfPageToCanvas: async function (targetCanvas, pdfBuffer, pageNumber) {
        this.ensureEngineReady();
        const dpr = Math.max(window.devicePixelRatio || 1, 2);

        if (this.pdfjsInstance && pdfBuffer && pdfBuffer.byteLength > 0) {
            try {
                if (!this.activeDocumentProxy || this.lastBufferByteLength !== pdfBuffer.byteLength) {
                    const rawCopy = new Uint8Array(pdfBuffer.byteLength);
                    rawCopy.set(new Uint8Array(pdfBuffer));
                    const loadingTask = this.pdfjsInstance.getDocument({
                        data: rawCopy,
                        disableWorker: true,
                        stopAtErrors: false
                    });
                    this.activeDocumentProxy = await loadingTask.promise;
                    this.lastBufferByteLength = pdfBuffer.byteLength;
                }

                const safePageNum = Math.min(Math.max(1, pageNumber), this.activeDocumentProxy.numPages);
                const page = await this.activeDocumentProxy.getPage(safePageNum);

                const baseViewport = page.getViewport({ scale: 1.0 });
                const scaleX = (595 * dpr) / baseViewport.width;
                const scaleY = (842 * dpr) / baseViewport.height;
                const calibratedViewport = page.getViewport({ scale: Math.min(scaleX, scaleY) });

                targetCanvas.width = Math.round(595 * dpr);
                targetCanvas.height = Math.round(842 * dpr);
                targetCanvas.style.width = "595px";
                targetCanvas.style.height = "842px";

                const context = targetCanvas.getContext("2d");
                context.save();
                context.fillStyle = "#ffffff";
                context.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
                await page.render({ canvasContext: context, viewport: calibratedViewport }).promise;
                context.restore();
                return { success: true, mode: "pdfjs" };
            } catch (renderError) {
                console.warn("[PdfRenderEngine] PDF.js fallback to DLD vector blueprint:", renderError);
            }
        }

        if (typeof drawDldBlueprintFallback === "function") {
            drawDldBlueprintFallback(targetCanvas, pageNumber, dpr);
        }
        return { success: true, mode: "blueprint" };
    },

    invalidateSessionCache: function () {
        this.activeDocumentProxy = null;
        this.lastBufferByteLength = 0;
    }
};
