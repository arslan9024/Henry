// FILE: js/state/pdf_modal_state.js
/**
 * [Category 3: Values State]
 * White Caves Real Estate - PDF Preview Modal State Buffer (pdf_modal_state.js)
 * Tracks active state, current page, zoom level, and display mode for the fullscreen PDF preview modal.
 * Pure in-memory reactive state buffer: zero DOM manipulation.
 */

window.PdfModalState = {
    isOpen: false,
    activePage: 1, // 1 to 6, 7 (Receipt), or 0 (All pages continuous)
    zoom: 0.95,

    open: function (page) {
        this.isOpen = true;
        if (typeof page === "number") this.activePage = page;
    },

    close: function () {
        this.isOpen = false;
    },

    toggle: function () {
        this.isOpen = !this.isOpen;
    },

    setPage: function (pageNum) {
        if (pageNum === 0 || (pageNum >= 1 && pageNum <= 7)) {
            this.activePage = pageNum;
        }
    },

    setZoom: function (zoomValue) {
        this.zoom = Math.max(0.6, Math.min(1.5, parseFloat(zoomValue) || 0.95));
    },

    zoomIn: function () {
        this.setZoom(this.zoom + 0.1);
    },

    zoomOut: function () {
        this.setZoom(this.zoom - 0.1);
    }
};

