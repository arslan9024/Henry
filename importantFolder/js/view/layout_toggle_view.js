// FILE: js/view/layout_toggle_view.js
/**
 * [Category 1: View]
 * White Caves Real Estate - 3-Column Studio Layout Toggle View (layout_toggle_view.js)
 * Controls collapsing and expanding of Column B (Center Live PDF Viewer) and
 * Column C (Right Status & Verification Gates).
 * Remembers user preference in localStorage.
 * Pure DOM presentation & layout management.
 */

window.LayoutToggleView = {
    isColBCollapsed: false,
    isColCCollapsed: false,

    init: function () {
        if (typeof localStorage !== "undefined") {
            this.isColBCollapsed = localStorage.getItem("wcre_col_b_collapsed") === "true";
            this.isColCCollapsed = localStorage.getItem("wcre_col_c_collapsed") === "true";
        }
        this.applyLayoutState();
    },

    toggleColumnB: function (forceState) {
        if (typeof forceState === "boolean") {
            this.isColBCollapsed = forceState;
        } else {
            this.isColBCollapsed = !this.isColBCollapsed;
        }

        if (typeof localStorage !== "undefined") {
            localStorage.setItem("wcre_col_b_collapsed", String(this.isColBCollapsed));
        }

        this.applyLayoutState();

        // When uncollapsing Column B, trigger canvas resize and redraw
        if (!this.isColBCollapsed && window.PdfViewerEngine) {
            setTimeout(() => {
                if (typeof window.PdfViewerEngine.renderPlaygroundView === "function") {
                    window.PdfViewerEngine.renderPlaygroundView();
                }
            }, 120);
        }
    },

    toggleColumnC: function (forceState) {
        if (typeof forceState === "boolean") {
            this.isColCCollapsed = forceState;
        } else {
            this.isColCCollapsed = !this.isColCCollapsed;
        }

        if (typeof localStorage !== "undefined") {
            localStorage.setItem("wcre_col_c_collapsed", String(this.isColCCollapsed));
        }

        this.applyLayoutState();
    },

    applyLayoutState: function () {
        const shell = document.querySelector(".studio-shell");
        if (!shell) return;

        shell.classList.toggle("col-b-collapsed", this.isColBCollapsed);
        shell.classList.toggle("col-c-collapsed", this.isColCCollapsed);

        // Update Navbar Button B
        const btnB = document.getElementById("btn-toggle-col-b");
        const lblB = document.getElementById("label-toggle-col-b");
        if (btnB) {
            btnB.classList.toggle("is-hidden-state", this.isColBCollapsed);
            btnB.title = this.isColBCollapsed 
                ? "Show Center Live PDF Viewer (Column B)" 
                : "Hide Center Live PDF Viewer (Column B)";
        }
        if (lblB) {
            lblB.textContent = this.isColBCollapsed ? "Show PDF Viewer" : "Hide PDF Viewer";
        }

        // Update Navbar Button C
        const btnC = document.getElementById("btn-toggle-col-c");
        const lblC = document.getElementById("label-toggle-col-c");
        if (btnC) {
            btnC.classList.toggle("is-hidden-state", this.isColCCollapsed);
            btnC.title = this.isColCCollapsed 
                ? "Show Right Verification Gates & Deal Status (Column C)" 
                : "Hide Right Verification Gates & Deal Status (Column C)";
        }
        if (lblC) {
            lblC.textContent = this.isColCCollapsed ? "Show Status" : "Hide Status";
        }

        // Update Floating Quick Uncollapse Strips
        const stripB = document.getElementById("strip-toggle-col-b");
        if (stripB) {
            stripB.style.display = this.isColBCollapsed ? "flex" : "none";
        }

        const stripC = document.getElementById("strip-toggle-col-c");
        if (stripC) {
            stripC.style.display = this.isColCCollapsed ? "flex" : "none";
        }
    }
};

