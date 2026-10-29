/**
 * White Caves Real Estate - Form Metrics & Contract Mode Controller (form_metrics.js)
 * Single-responsibility module for collecting live form values, stripping leading numbers,
 * and switching between Renewal and New Tenancy Contract presets.
 */

window.FormMetricsHelper = {
    bindFormEvents: function () {
        if (typeof document === "undefined") return;
        const usageRadios = document.querySelectorAll('input[name="prop_usage_radio"]');
        usageRadios.forEach(r => {
            r.addEventListener("change", (e) => {
                const chosen = e.target.value;
                const hiddenField = document.getElementById("field-prop_usage");
                if (hiddenField) hiddenField.value = "✓";
                if (window.PropertyUsageCirclePresets && window.PropertyUsageCirclePresets[chosen] && window.ContractMapper) {
                    window.ContractMapper.page1.prop_usage.x = window.PropertyUsageCirclePresets[chosen].x;
                    window.ContractMapper.page1.prop_usage.y = window.PropertyUsageCirclePresets[chosen].y;
                    if (window.ContractMapperHelper) window.ContractMapperHelper.saveCoordinatesToStorage();
                }
                if (window.WorkflowEngine) window.WorkflowEngine.onFormInputMutated();
            });
        });

        const allInputs = document.querySelectorAll('#contractDataForm input[type="text"]');
        allInputs.forEach(inp => {
            inp.addEventListener("input", () => {
                if (window.WorkflowEngine) window.WorkflowEngine.onFormInputMutated();
            });
        });
    },

    setContractMode: function (mode) {
        const builder = window.FormLayoutBuilder;
        if (!builder) return;

        builder.contractMode = mode === "NEW" ? "NEW" : "RENEWAL";
        const isRenewal = builder.contractMode === "RENEWAL";

        if (typeof document !== "undefined") {
            ["btn-mode-renewal", "hub-mode-renewal"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.toggle("active-mode-card", isRenewal);
            });
            ["btn-mode-new", "hub-mode-new"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.toggle("active-mode-card", !isRenewal);
            });

            const modeBadge = document.getElementById("contract-mode-active-badge");
            if (modeBadge) {
                modeBadge.innerHTML = isRenewal
                    ? "🔄 <strong>Active Mode: Renewal Tenancy Contract</strong> — Pre-populated with returning tenant &amp; property data (142 Primrose, DAMAC Hills 2)."
                    : "🆕 <strong>Active Mode: New Tenancy Contract</strong> — Preparing a first-time tenancy contract, Addendum &amp; Receipt.";
            }

            if (isRenewal) {
                for (const k in builder.renewalPreset) {
                    const el = document.getElementById(`field-${k}`);
                    if (el) el.value = builder.renewalPreset[k];
                }
            }
            if (window.DocumentUploadView) {
                window.DocumentUploadView.render("step1UploadRoot", builder.contractMode);
            }
        }
        if (window.WorkflowEngine) window.WorkflowEngine.onFormInputMutated();
    },

    collectCurrentFormMetrics: function () {
        const builder = window.FormLayoutBuilder;
        const payload = { contractMode: builder ? builder.contractMode : "RENEWAL", page1: {}, page3: {} };
        let page1Count = 0;
        let page3Count = 0;

        if (!builder) return { payload, page1Count, page3Count };

        const form = typeof document !== "undefined" ? document.getElementById("contractDataForm") : null;
        if (!form) {
            builder.page1Keys.forEach(k => {
                payload.page1[k] = builder.renewalPreset[k] || "";
                if (payload.page1[k] !== "") page1Count++;
            });
            const defClauses = [
                "The addendum attached to this is an integral part of the tenancy contract.",
                "This contract is valid for 1 year only. Renewal of the contract is subject to the approval of the landlord.",
                "The security deposit is non-refundable if the house isn't returned clean, undamaged, and with proof of required services.",
                "The landlord will confirm and arrange the maintenance, including cleaning, painting, and AC service, for the tenant before MOVE-IN.",
                "The key handover will be processed after the submission of EJARI, DEWA receipt, and MOVE-IN permit by DAMAC."
            ];
            defClauses.forEach((c, i) => {
                payload.page3[`term_line_${i + 1}`] = c;
                page3Count++;
            });
            return { payload, page1Count, page3Count };
        }

        const fd = new FormData(form);
        builder.page1Keys.forEach(k => {
            const val = (fd.get(k) || "").trim();
            payload.page1[k] = val;
            if (val !== "") page1Count++;
        });

        for (let i = 1; i <= 5; i++) {
            const key = `term_line_${i}`;
            const rawVal = (fd.get(key) || "").trim();
            const cleanVal = rawVal.replace(/^\s*\d+[\.\)\-]\s*/, "").trim();
            payload.page3[key] = cleanVal;
            if (cleanVal !== "") page3Count++;
        }

        return { payload, page1Count, page3Count };
    }
};

if (window.FormLayoutBuilder) {
    window.FormLayoutBuilder.setContractMode = (m) => window.FormMetricsHelper.setContractMode(m);
    window.FormLayoutBuilder.collectCurrentFormMetrics = () => window.FormMetricsHelper.collectCurrentFormMetrics();
}
