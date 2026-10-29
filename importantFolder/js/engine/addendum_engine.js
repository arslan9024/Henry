// FILE: js/engine/addendum_engine.js
/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - 2-Page Official RERA Addendum Dispatcher Facade (addendum_engine.js)
 * High-level orchestration facade that delegates:
 * - HTML5 Canvas rendering to AddendumCanvasRenderer
 * - pdf-lib binary page stamping to AddendumPdfBuilder
 * Preserves zero-crossover single-purpose isolation while ensuring 100% backward compatibility.
 */

window.AddendumEngine = {
    get params() {
        return window.AddendumData ? window.AddendumData.params : {};
    },

    syncFromStep1Payload: function (p1) {
        if (window.AddendumData) window.AddendumData.syncFromStep1Payload(p1);
    },

    renderAddendumForm: function (id) {
        if (window.AddendumData) window.AddendumData.renderAddendumForm(id);
    },

    renderAddendumPageToCanvas: function (canvas, pageIdx) {
        if (window.AddendumCanvasRenderer) {
            window.AddendumCanvasRenderer.renderPageToCanvas(canvas, pageIdx, this.params);
        }
    },

    appendAddendumPagesToPdfDoc: function (pdfDoc) {
        if (window.AddendumPdfBuilder) {
            return window.AddendumPdfBuilder.appendPagesToPdfDoc(pdfDoc, this.params);
        }
        return 0;
    }
};
