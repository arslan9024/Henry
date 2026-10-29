// FILE: js/view/contract_diff_view.js
/**
 * [Category 1: View]
 * White Caves Real Estate - Contract Comparison Side-by-Side Modal Builder (contract_diff_view.js)
 * Pure presentational module for rendering the side-by-side comparison modal between
 * uploaded old contract data and current Step 1 & Step 3 form fields.
 * Displays all 29 fields: 24 Page 1 fields (including ✓ usage tick) + 5 Page 3 clauses.
 * Zero inline events: delegated in event_orchestrator.js.
 */

window.ContractDiffView = {
    escape: function (v) {
        return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    },

    renderModal: function (containerId) {
        if (typeof document === "undefined") return;
        let root = document.getElementById(containerId);
        if (!root) {
            root = document.createElement("div");
            root.id = containerId;
            document.body.appendChild(root);
        }

        const state = window.ContractDiffState;
        if (!state || !state.isOpen) {
            root.innerHTML = "";
            root.style.display = "none";
            return;
        }

        const selectedCount = state.items.filter(i => i.selected).length;
        const detectedCount = state.items.filter(i => i.isDetected).length;

        // Group rows by Section for clarity
        const sections = [
            { id: "A. Header", title: "A. Contract Header (1 Field)" },
            { id: "B. Lessor", title: "B. Owner / Lessor Information (5 Fields)" },
            { id: "C. Tenant", title: "C. Tenant Information (4 Fields)" },
            { id: "D. Property", title: "D. Property Details (8 Fields - including ✓ Usage Tick)" },
            { id: "E. Financials", title: "E. Contract Terms & Financials (6 Fields)" },
            { id: "F. Clauses", title: "F. Page 3 Additional Clauses (5 Clauses)" }
        ];

        let tableRowsHtml = "";

        sections.forEach(sec => {
            const secItems = state.items.filter(it => it.section === sec.id);
            if (secItems.length === 0) return;

            tableRowsHtml += `
                <tr class="diff-section-row">
                    <td colspan="5">
                        📂 ${this.escape(sec.title)}
                    </td>
                </tr>
            `;

            secItems.forEach(item => {
                let badgeClass = "diff-badge-retain";
                let badgeText = "📋 Keep Current";

                if (item.isRenewalDate) {
                    badgeClass = "diff-badge-renewal";
                    badgeText = "🔄 +1 Year Renewal";
                } else if (item.isDetected) {
                    if (item.isDifferent) {
                        badgeClass = "diff-badge-update";
                        badgeText = "✨ Detected";
                    } else {
                        badgeClass = "diff-badge-same";
                        badgeText = "✔️ Same";
                    }
                }

                tableRowsHtml += `
                    <tr class="${item.selected ? 'diff-row-selected' : ''}">
                        <td class="diff-td-check">
                            <input type="checkbox" class="diff-field-checkbox" data-diff-key="${item.key}" ${item.selected ? 'checked' : ''}>
                        </td>
                        <td class="diff-td-label">
                            <strong>${this.escape(item.label)}</strong>
                        </td>
                        <td class="diff-td-current">
                            <span class="diff-val-text">${this.escape(item.currentVal) || '<em style="color:#94a3b8;">Empty</em>'}</span>
                        </td>
                        <td class="diff-td-detected">
                            <strong class="diff-detected-text">${this.escape(item.detectedVal)}</strong>
                        </td>
                        <td class="diff-td-badge">
                            <span class="diff-pill ${badgeClass}">${badgeText}</span>
                        </td>
                    </tr>
                `;
            });
        });

        root.style.display = "flex";
        root.className = "diff-modal-backdrop";
        root.innerHTML = `
            <div class="diff-modal-container" role="dialog" aria-modal="true" aria-labelledby="diffModalTitle">
                <div class="diff-modal-header">
                    <div>
                        <h3 id="diffModalTitle" class="diff-modal-title">🔄 Contract Elements Comparison &amp; Verification</h3>
                        <p class="diff-modal-subtitle">
                            Source: <strong>${this.escape(state.fileName)}</strong>. Complete Contract Model: <strong>24 Page 1 Fields + ✓ Usage Tick + 5 Page 3 Clauses</strong> (29 Total Elements).
                        </p>
                    </div>
                    <button type="button" id="btn-close-diff-modal" class="diff-close-btn" title="Close">✕</button>
                </div>

                <div class="diff-modal-body">
                    <!-- Quick Filter & Action Toolbar -->
                    <div class="diff-toolbar">
                        <div style="font-size:0.73rem; color:#475569;">
                            Showing <strong>${state.items.length} Elements</strong> (<strong>${detectedCount}</strong> detected from document).
                        </div>
                        <div style="display:flex; gap:6px;">
                            <button type="button" id="diff-btn-select-detected" class="diff-quick-btn">✨ Select Detected (${detectedCount})</button>
                            <button type="button" id="diff-btn-select-all" class="diff-quick-btn">☑️ Select All</button>
                            <button type="button" id="diff-btn-deselect-all" class="diff-quick-btn">⬜ Deselect All</button>
                        </div>
                    </div>

                    <div class="diff-table-wrapper">
                        <table class="diff-table">
                            <thead>
                                <tr>
                                    <th style="width:40px;"><input type="checkbox" id="diff-select-all-chk" ${selectedCount === state.items.length ? 'checked' : ''} title="Select All"></th>
                                    <th>Field / Schema Node</th>
                                    <th>Current Value (Form / Preset)</th>
                                    <th>Detected / Proposed Renewal Value</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRowsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="diff-modal-footer">
                    <div class="diff-footer-info">
                        <strong>${selectedCount}</strong> of <strong>${state.items.length}</strong> fields selected to apply.
                    </div>
                    <div class="diff-footer-actions">
                        <button type="button" id="btn-cancel-diff" class="secondary-btn">Cancel</button>
                        <button type="button" id="btn-apply-diff" class="primary-btn" ${selectedCount === 0 ? 'disabled' : ''}>
                            ✓ Apply Selected (${selectedCount}) to Form
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    closeModal: function (containerId) {
        if (typeof document === "undefined") return;
        const root = document.getElementById(containerId);
        if (root) {
            root.innerHTML = "";
            root.style.display = "none";
        }
        if (window.ContractDiffState) {
            window.ContractDiffState.close();
        }
    }
};
