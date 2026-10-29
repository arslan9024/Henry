// FILE: document_upload_view.js
/**
 * [Category 1: View]
 * White Caves Real Estate - Step 1 Verification Documents View Builder (document_upload_view.js)
 * Pure presentational module for rendering dynamic Renewal vs New Contract document upload dropzones.
 * Zero event listeners attached directly inside: all events are delegated in event_orchestrator.js.
 */

window.DocumentUploadView = {
    escape: function (v) {
        return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    },

    render: function (containerId, mode) {
        if (typeof document === "undefined") return;
        const container = document.getElementById(containerId);
        if (!container) return;

        const cfg = window.UploadConfig || { renewalDocs: [], newDocs: [] };
        const state = window.DocumentUploadState || { files: {} };
        const isRenewal = mode === "RENEWAL";
        const docs = isRenewal ? cfg.renewalDocs : cfg.newDocs;
        const summary = state.getSummary ? state.getSummary(mode) : { uploadedCount: 0, totalRequired: docs.length };

        let html = `
            <div class="upload-section-card">
                <div class="upload-section-header">
                    <div>
                        <div class="upload-section-title">
                            ${isRenewal ? "📁 Required Document: Previous Tenancy Contract" : "📁 Mandatory Tenant KYC Documents (3 Files Required)"}
                        </div>
                        <div class="upload-section-subtitle">
                            ${isRenewal 
                                ? "Upload the previous contract or Ejari certificate to verify returning lease data." 
                                : "Under DLD and RERA guidelines, a new tenancy contract requires 3 official identification documents."}
                        </div>
                    </div>
                    <span class="upload-count-pill ${summary.uploadedCount === summary.totalRequired ? 'pill-complete' : 'pill-pending'}">
                        ${summary.uploadedCount} of ${summary.totalRequired} Attached
                    </span>
                </div>
                <div class="upload-cards-grid ${isRenewal ? 'upload-grid-single' : 'upload-grid-triple'}">
        `;

        docs.forEach(doc => {
            const uploaded = state.getFile ? state.getFile(doc.key) : null;
            html += `
                <div class="upload-doc-card ${uploaded ? 'card-has-file' : 'card-empty'}" data-doc-key="${doc.key}">
                    <div class="upload-doc-top">
                        <span class="upload-doc-icon">${doc.icon}</span>
                        <div class="upload-doc-info">
                            <div class="upload-doc-title">${this.escape(doc.title)}</div>
                            <span class="upload-doc-badge" style="background:${doc.badgeColor}18; color:${doc.badgeColor}; border-color:${doc.badgeColor}40;">
                                ${this.escape(doc.badge)}
                            </span>
                        </div>
                    </div>
                    <div class="upload-doc-hint">${this.escape(doc.hint)}</div>
            `;

            if (uploaded) {
                html += `
                    <div class="upload-attached-box">
                        <div class="upload-attached-details">
                            <span class="upload-attached-icon">✔️</span>
                            <div class="upload-attached-meta">
                                <span class="upload-attached-name" title="${this.escape(uploaded.name)}">${this.escape(uploaded.name)}</span>
                                <span class="upload-attached-size">${uploaded.sizeFormatted}</span>
                            </div>
                        </div>
                        <div class="upload-attached-actions">
                            <label class="upload-change-label">
                                ↺ Change
                                <input type="file" class="upload-hidden-input" data-upload-target="${doc.key}" accept="${doc.accept}" style="display:none;">
                            </label>
                            <button type="button" class="upload-delete-btn" data-remove-target="${doc.key}" title="Remove attached file">✕</button>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="upload-dropzone">
                        <label class="upload-dropzone-label">
                            <span class="upload-dropzone-btn">📎 Choose File</span>
                            <span class="upload-dropzone-text">PDF or Image (${doc.accept})</span>
                            <input type="file" class="upload-hidden-input" data-upload-target="${doc.key}" accept="${doc.accept}" style="display:none;">
                        </label>
                    </div>
                `;
            }

            html += `
                    <div class="upload-doc-helper">${this.escape(doc.helper)}</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
};

