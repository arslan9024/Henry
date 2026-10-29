// FILE: js/engine/receipt_engine.js
/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - Agency Fee Payment Receipt Dispatcher Facade (receipt_engine.js)
 * High-level orchestration facade that delegates:
 * - HTML5 Canvas rendering to ReceiptCanvasRenderer
 * - pdf-lib binary page stamping to ReceiptPdfBuilder
 * Preserves zero-crossover single-purpose isolation while ensuring 100% backward compatibility.
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
        if (window.ReceiptCanvasRenderer) {
            window.ReceiptCanvasRenderer.renderPageToCanvas(canvas, this.params);
        }
    },

    appendReceiptPageToPdfDoc: function (pdfDoc) {
        if (window.ReceiptPdfBuilder) {
            return window.ReceiptPdfBuilder.appendPageToPdfDoc(pdfDoc, this.params);
        }
        return 0;
    }
};
