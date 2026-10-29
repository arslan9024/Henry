// FILE: js/handlers/pdf_modal_event_handler.js
/**
 * [Category 4: Event Handler Bridge]
 * White Caves Real Estate - PDF Preview Modal Event Orchestrator (pdf_modal_event_handler.js)
 * Binds DOM interactions (navbar button, backdrop, page switching, zoom controls, Esc key)
 * to PdfModalState and triggers PdfModalView updates.
 * Zero mathematical or rendering computations.
 */

window.PdfModalEventHandler = {
    _bound: false,
    MOUNT_ID: "pdfModalMountPoint",

    init: function () {
        if (this._bound) return;
        this._bound = true;

        // 1. Open Button in Top Navbar
        const openBtn = document.getElementById("btnTogglePdfModal");
        if (openBtn) {
            openBtn.addEventListener("click", () => {
                this.openModal();
            });
        }

        // 2. Global Delegated Listener on Modal Mount Point
        const mount = document.getElementById(this.MOUNT_ID);
        if (mount) {
            mount.addEventListener("click", (e) => {
                // Close button or backdrop
                if (e.target.closest("[data-close-pdf-modal]") || e.target.id === "pdfModalBackdrop") {
                    this.closeModal();
                    return;
                }

                // Page navigation buttons
                const pageBtn = e.target.closest("[data-pdf-modal-page]");
                if (pageBtn) {
                    const action = pageBtn.getAttribute("data-pdf-modal-page");
                    const state = window.PdfModalState;
                    if (!state) return;

                    if (action === "prev" && state.activePage > 1) {
                        state.setPage(state.activePage - 1);
                        this.refreshModal();
                    } else if (action === "next" && state.activePage < 7) {
                        state.setPage(state.activePage + 1);
                        this.refreshModal();
                    }
                    return;
                }

                // Zoom controls
                const zoomBtn = e.target.closest("[data-pdf-modal-zoom]");
                if (zoomBtn) {
                    const action = zoomBtn.getAttribute("data-pdf-modal-zoom");
                    const state = window.PdfModalState;
                    if (!state) return;

                    if (action === "in") state.zoomIn();
                    else if (action === "out") state.zoomOut();
                    else if (action === "reset") state.setZoom(0.95);

                    this.applyZoom();
                    return;
                }
            });

            // Page select dropdown change
            mount.addEventListener("change", (e) => {
                if (e.target.id === "pdfModalPageSelect") {
                    const pageVal = parseInt(e.target.value, 10);
                    const state = window.PdfModalState;
                    if (state && !isNaN(pageVal)) {
                        state.setPage(pageVal);
                        this.refreshModal();
                    }
                }
            });
        }

        // 3. Escape key to close modal
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && window.PdfModalState && window.PdfModalState.isOpen) {
                this.closeModal();
            }
        });
    },

    openModal: function () {
        const state = window.PdfModalState;
        if (!state) return;

        // Inherit active page from viewer engine if available
        const currentViewerPage = window.PdfViewerEngine ? window.PdfViewerEngine.activeViewingPage : 1;
        state.open(currentViewerPage === 0 ? 0 : currentViewerPage);

        if (window.PdfModalView) {
            window.PdfModalView.render(this.MOUNT_ID);
        }
    },

    closeModal: function () {
        const state = window.PdfModalState;
        if (state) state.close();
        if (window.PdfModalView) {
            window.PdfModalView.render(this.MOUNT_ID);
        }
    },

    refreshModal: function () {
        if (window.PdfModalView) {
            window.PdfModalView.render(this.MOUNT_ID);
        }
    },

    applyZoom: function () {
        const state = window.PdfModalState;
        const zoom = state ? state.zoom : 0.95;
        const wrapper = document.getElementById("pdfModalStageWrapper");
        if (wrapper) {
            wrapper.style.transform = `scale(${zoom})`;
        }
        const zoomDisplay = document.getElementById("pdfModalZoomDisplay");
        if (zoomDisplay) {
            zoomDisplay.innerText = `${Math.round(zoom * 100)}%`;
        }
    }
};

