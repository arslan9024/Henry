// FILE: form_layout.js
/**
 * [Category 1: View]
 * White Caves Real Estate - Reusable DLD Form DOM Builder (form_layout.js)
 * Renders reusable section filters, 24 Page 1 inputs, and 5 Page 3 clause inputs from ContractContentConfig.
 */

window.FormLayoutBuilder = {
    contractMode: "RENEWAL",

    get page1Keys() {
        return window.ContractContentConfig ? window.ContractContentConfig.page1Keys : [];
    },

    get renewalPreset() {
        return window.ContractContentConfig ? window.ContractContentConfig.renewalPreset : {};
    },

    createSectionHeaderHTML: function (title, badgeText, accentColor) {
        const styleAttr = accentColor ? ` style="color:${accentColor};"` : "";
        return `<div class="section-header"${styleAttr}><span>${title}</span><span class="section-sub-pill">${badgeText}</span></div>`;
    },

    createInputCardHTML: function (field, scopePrefix) {
        if (field.type === "tick_usage") {
            return `<div class="input-card tick-card-highlight">
                <label>${field.label}</label>
                <input type="hidden" id="field-${field.name}" name="${field.name}" value="✓">
                <div class="radio-pill-group">
                    <label class="radio-pill"><input type="radio" name="prop_usage_radio" value="RESIDENTIAL" checked> <strong>✓ Residential</strong></label>
                    <label class="radio-pill"><input type="radio" name="prop_usage_radio" value="COMMERCIAL"> <strong>✓ Commercial</strong></label>
                    <label class="radio-pill"><input type="radio" name="prop_usage_radio" value="INDUSTRIAL"> <strong>✓ Industrial</strong></label>
                </div>
            </div>`;
        }
        return `<div class="input-card" data-card-field="${field.name}">
            <label for="field-${field.name}">${field.label}</label>
            <input type="text" id="field-${field.name}" name="${field.name}" data-focus-page="${scopePrefix}" data-focus-key="${field.name}" value="${field.value}" autocomplete="off">
        </div>`;
    },

    renderFormFields: function (page1ContainerId, page3ContainerId) {
        if (typeof document === "undefined" || !window.ContractContentConfig) return;
        const p1Node = document.getElementById(page1ContainerId);
        const p3Node = document.getElementById(page3ContainerId);
        if (!p1Node || !p3Node) return;

        const p1Structure = window.ContractContentConfig.getPage1Sections();

        let filterBarHtml = `<div class="section-filter-bar" aria-label="Quick Input Section Filter">
            <button type="button" class="filter-chip active" data-filter-group="ALL">All Sections</button>
            <button type="button" class="filter-chip" data-filter-group="Header,Lessor">A–B. Lessor</button>
            <button type="button" class="filter-chip" data-filter-group="Tenant">C. Tenant</button>
            <button type="button" class="filter-chip" data-filter-group="Property">D. Property</button>
            <button type="button" class="filter-chip" data-filter-group="Financials">E. Financials</button>
            <button type="button" class="filter-chip" data-filter-group="Clauses">F. Clauses</button>
        </div>`;

        let p1Html = filterBarHtml;
        p1Structure.forEach(s => {
            p1Html += `<div class="form-section-group" data-section-badge="${s.badge}">`;
            p1Html += this.createSectionHeaderHTML(s.category, s.badge, "");
            p1Html += `<div class="grid-container">`;
            s.fields.forEach(f => {
                p1Html += this.createInputCardHTML(f, "page1");
            });
            p1Html += `</div></div>`;
        });
        p1Node.innerHTML = p1Html;

        const clausesDefault = window.ContractContentConfig.clausesDefault || [];
        let p3Html = `<div class="form-section-group" data-section-badge="Clauses">`;
        p3Html += this.createSectionHeaderHTML("F. Page 3 Additional Terms (Sentences Only — Numbers 1–5 Pre-Printed)", "5 Lines", "#6d28d9");
        p3Html += `<div class="clauses-stack">`;
        clausesDefault.forEach((text, i) => {
            const cField = { name: `term_line_${i + 1}`, label: `Clause Line ${i + 1} Sentence`, value: text };
            p3Html += this.createInputCardHTML(cField, "page3");
        });
        p3Html += `</div></div>`;
        p3Node.innerHTML = p3Html;

        if (window.DocumentUploadView) {
            window.DocumentUploadView.render("step1UploadRoot", this.contractMode || "RENEWAL");
        }

        if (window.FormMetricsHelper) {
            window.FormMetricsHelper.bindFormEvents();
        }

        if (window.SmartFormatter) {
            window.SmartFormatter.init();
        }
    },

    filterInputSections: function (groupSpec, scopeRoot) {
        if (typeof document === "undefined") return;
        const scope = scopeRoot || document;
        const allowed = groupSpec === "ALL" ? null : groupSpec.split(",");
        scope.querySelectorAll(".form-section-group").forEach(grp => {
            const badge = grp.getAttribute("data-section-badge");
            grp.style.display = (!allowed || allowed.includes(badge)) ? "block" : "none";
        });
        scope.querySelectorAll(".filter-chip").forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-filter-group") === groupSpec);
        });
    },

    setContractMode: function (mode) {
        if (window.FormMetricsHelper) window.FormMetricsHelper.setContractMode(mode);
    },

    collectCurrentFormMetrics: function () {
        return window.FormMetricsHelper
            ? window.FormMetricsHelper.collectCurrentFormMetrics()
            : { payload: { contractMode: "RENEWAL", page1: {}, page3: {} }, page1Count: 0, page3Count: 0 };
    }
};
