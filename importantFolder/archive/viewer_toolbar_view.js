// FILE: viewer_toolbar_view.js
/**
 * [Category 1: View]
 * White Caves Real Estate - Center PDF Viewer Toolbar View (viewer_toolbar_view.js)
 * Builds the Page / Zoom dropdowns from ViewerControlsConfig and toggles the collapsible
 * calibration tools panel and the full-toolbar "focus mode". Pure presentation, no business logic.
 */

window.ViewerToolbarView = {
    buildDropdowns: function () {
        if (typeof document === "undefined" || !window.ViewerControlsConfig) return;
        const fill = (id, options) => {
            const sel = document.getElementById(id);
            if (!sel) return;
            sel.innerHTML = options.map(o => `<option value="${o.value}">${o.label}</option>`).join("");
        };
        fill("viewer-page-select", window.ViewerControlsConfig.pageOptions);
        fill("viewer-zoom-select", window.ViewerControlsConfig.zoomOptions);
    },

    syncPageSelect: function (pageValue) {
        const sel = typeof document !== "undefined" ? document.getElementById("viewer-page-select") : null;
        if (sel) sel.value = String(pageValue);
    },

    syncZoomSelect: function (zoomValue) {
        const sel = typeof document !== "undefined" ? document.getElementById("viewer-zoom-select") : null;
        if (!sel) return;
        const match = Array.from(sel.options).find(o => Math.abs(parseFloat(o.value) - zoomValue) < 0.001);
        if (match) sel.value = match.value;
    },

    toggleCalibrationTools: function (forceOpen) {
        const bar = document.getElementById("viewer-calibration-tools");
        const btn = document.getElementById("btn-toggle-viewer-tools");
        if (!bar) return;
        const open = typeof forceOpen === "boolean" ? forceOpen : bar.classList.contains("is-collapsed");
        bar.classList.toggle("is-collapsed", !open);
        if (btn) btn.classList.toggle("is-active", open);
    },

    toggleFocusMode: function () {
        const viewer = document.querySelector(".col-b-viewer");
        const btn = document.getElementById("btn-viewer-focus");
        if (!viewer) return;
        const collapsed = viewer.classList.toggle("toolbar-collapsed");
        if (btn) {
            btn.innerText = collapsed ? "☰" : "⤢";
            btn.title = collapsed ? "Show viewer controls" : "Hide controls for a clearer page view";
        }
    }
};

