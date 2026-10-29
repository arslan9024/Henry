// FILE: addendum_form_view.js
/**
 * [Category 1: View]
 * White Caves Real Estate - Step 3 Categorized Addendum Form Builder (addendum_form_view.js)
 * Builds the section filter bar, the read-only "Synced from Step 1" strip and the
 * addendum-only input groups from AddendumContentConfig. Events are bound in event_orchestrator.js.
 */

window.AddendumFormView = {
    escape: function (v) {
        return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    },

    buildFilterBarHTML: function (sections) {
        let html = `<div class="section-filter-bar" aria-label="Addendum Section Filter">
            <button type="button" class="filter-chip active" data-filter-group="ALL">All Sections</button>`;
        sections.forEach(s => {
            html += `<button type="button" class="filter-chip" data-filter-group="${s.id}">${s.chip}</button>`;
        });
        return html + `</div>`;
    },

    buildSyncedStripHTML: function (synced, params) {
        let html = `<div class="synced-strip"><div class="synced-strip-title">🔗 Pulled automatically from Step 1 <span>(edit in Step 1)</span></div><div class="synced-grid">`;
        synced.forEach(f => {
            html += `<div class="synced-item"><span class="synced-label">${f.label}</span>
                <input type="text" id="addendum-${f.key}" class="synced-value" value="${this.escape(params[f.key])}" readonly tabindex="-1"></div>`;
        });
        return html + `</div></div>`;
    },

    buildFieldHTML: function (def, params) {
        const val = params[def.key] || "";
        if (Array.isArray(def.options)) {
            const opts = def.options.map(o => `<option value="${this.escape(o)}"${o === val ? " selected" : ""}>${o}</option>`).join("");
            return `<div class="input-card"><label for="addendum-${def.key}">${def.label}</label>
                <select id="addendum-${def.key}" data-addendum-key="${def.key}">${opts}</select></div>`;
        }
        return `<div class="input-card"><label for="addendum-${def.key}">${def.label}</label>
            <input type="text" id="addendum-${def.key}" data-addendum-key="${def.key}" value="${this.escape(val)}" autocomplete="off"></div>`;
    },

    render: function (containerId, params) {
        if (typeof document === "undefined" || !window.AddendumContentConfig) return;
        const root = document.getElementById(containerId);
        if (!root) return;

        const cfg = window.AddendumContentConfig;
        const header = window.FormLayoutBuilder
            ? (t, b) => window.FormLayoutBuilder.createSectionHeaderHTML(t, b, "#065f46")
            : (t, b) => `<div class="section-header"><span>${t}</span><span class="section-sub-pill">${b}</span></div>`;

        let html = this.buildFilterBarHTML(cfg.sections);
        html += this.buildSyncedStripHTML(cfg.syncedFromStep1 || [], params);
        cfg.sections.forEach(s => {
            html += `<div class="form-section-group" data-section-badge="${s.id}">${header(s.title, s.badge)}<div class="grid-container">`;
            s.fields.forEach(def => { html += this.buildFieldHTML(def, params); });
            html += `</div></div>`;
        });
        html += `<div class="signature-note-card">✍️ <strong>Acceptance &amp; Signatures (Page 2 of 2):</strong> Tenant &amp; Landlord names are synchronized automatically from Step 1. Both parties must execute this Addendum digitally using the <strong>UAE PASS</strong> application (signing date is recorded automatically in the official audit trail).</div>`;
        root.innerHTML = html;
    }
};
