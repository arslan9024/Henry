// FILE: viewer_controls_config.js
/**
 * [Category 2: Data Config]
 * White Caves Real Estate - Center PDF Viewer Control Options (viewer_controls_config.js)
 * Pure static dictionary for the Page dropdown and Zoom dropdown. Zero operational code.
 */

window.ViewerControlsConfig = {
    pageOptions: [
        { value: 1, label: "P1 — DLD Contract Grid" },
        { value: 2, label: "P2 — DLD Legal Terms" },
        { value: 3, label: "P3 — Additional Clauses" },
        { value: 4, label: "P4–5 — RERA Addendum (2 Pages)" },
        { value: 6, label: "P6 — Payment Receipt" },
        { value: 0, label: "📜 All 6 Pages (Continuous Scroll)" }
    ],

    zoomOptions: [
        { value: 0.6, label: "60%" },
        { value: 0.7, label: "70%" },
        { value: 0.8, label: "80% (Fit)" },
        { value: 0.85, label: "85%" },
        { value: 1.0, label: "100%" },
        { value: 1.15, label: "115%" },
        { value: 1.3, label: "130%" }
    ]
};
