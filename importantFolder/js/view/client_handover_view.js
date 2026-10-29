// FILE: js/view/client_handover_view.js
/**
 * [Category 1: View]
 * White Caves Real Estate - Client Handover Summary & WhatsApp Formatter (client_handover_view.js)
 * Formats a clean, professional deal breakdown (Rent, Cheques, Security Deposit, Commission, VAT, Ejari)
 * for the tenant with 1-click clipboard copy and WhatsApp transmission.
 */

window.ClientHandoverView = {
    render: function (containerId) {
        if (typeof document === "undefined") return;
        const root = document.getElementById(containerId);
        if (!root) return;

        const metrics = window.FormLayoutBuilder ? window.FormLayoutBuilder.collectCurrentFormMetrics() : null;
        const page1 = metrics && metrics.payload ? metrics.payload.page1 : {};

        const tenantName = page1.tenant_name || "Valued Client";
        const unit = page1.property_no || "142";
        const building = page1.building_name || "Primrose";
        const location = page1.location || "DAMAC Hills 2";
        const annualRent = page1.annual_rent || "115,000 AED";
        const rentNumeric = parseFloat(String(annualRent).replace(/[^0-9.]/g, "")) || 115000;
        const deposit = page1.security_deposit || `${(rentNumeric * 0.05).toLocaleString()} AED`;
        const depositNumeric = parseFloat(String(deposit).replace(/[^0-9.]/g, "")) || (rentNumeric * 0.05);

        const feeDisplay = (window.ReceiptData && window.ReceiptData.params && window.ReceiptData.params.total_display)
            ? window.ReceiptData.params.total_display
            : "6,037.50 AED (Including 5% VAT)";

        const feeNumeric = parseFloat(String(feeDisplay).replace(/[^0-9.]/g, "")) || (rentNumeric * 0.05 * 1.05);
        const ejariFee = 220; // Standard DLD Ejari fee

        const chequeCount = (window.ChequeScheduleView && window.ChequeScheduleView.selectedChequeCount) || 4;
        const firstChequeAmount = Math.round(rentNumeric / chequeCount);
        const totalInitialDue = firstChequeAmount + depositNumeric + feeNumeric + ejariFee;

        const summaryText = `🏢 *TENANCY CONTRACT PACKAGE — WHITE CAVES REAL ESTATE LLC*
📍 *Premises:* Unit ${unit}, ${building}, ${location}
👤 *Tenant:* ${tenantName}
📅 *Tenancy Period:* ${page1.date_from || "01-10-2025"} to ${page1.date_to || "30-09-2026"}
--------------------------------------------------
💰 *Annual Rent:* ${annualRent} (${chequeCount} Cheques of ${firstChequeAmount.toLocaleString()} AED)
🛡️ *Security Deposit (Refundable):* ${deposit}
🧾 *Agency Brokerage Fee (5% + VAT):* ${feeDisplay}
📄 *DLD Ejari Registration:* ${ejariFee} AED
--------------------------------------------------
✅ *TOTAL INITIAL PAYMENT DUE ON SIGNING:*
👉 *${totalInitialDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED*

📁 *Documents Prepared:*
1. DLD Unified Tenancy Contract (Pages 1–3)
2. Official RERA Statutory Addendum (Pages 4–6)
3. Agency Commission & VAT Payment Receipt (Page 7)

*White Caves Real Estate LLC | Dubai, UAE*`;

        root.innerHTML = `
            <div class="handover-card">
                <div class="handover-header">
                    <div style="font-weight:700; color:#1e3a8a; font-size:0.86rem; display:flex; align-items:center; gap:6px;">
                        <span>💬</span>
                        <span>Client Handover &amp; Move-In Breakdown Summary</span>
                    </div>
                    <span class="diff-pill diff-badge-update" style="font-size:0.68rem;">Ready for Client</span>
                </div>
                <textarea id="handoverMessageText" class="handover-textbox" readonly>${summaryText}</textarea>
                <div class="handover-actions">
                    <button type="button" id="btn-copy-handover" class="secondary-btn" style="font-size:0.75rem;">📋 Copy Breakdown</button>
                    <button type="button" id="btn-whatsapp-handover" class="primary-btn" style="background:#059669; font-size:0.75rem;">💬 Send via WhatsApp</button>
                </div>
            </div>
        `;

        const copyBtn = root.querySelector("#btn-copy-handover");
        if (copyBtn) {
            copyBtn.addEventListener("click", () => {
                const ta = root.querySelector("#handoverMessageText");
                if (ta) {
                    ta.select();
                    navigator.clipboard.writeText(ta.value).then(() => {
                        const original = copyBtn.innerText;
                        copyBtn.innerText = "✓ Copied!";
                        setTimeout(() => copyBtn.innerText = original, 2000);
                    });
                }
            });
        }

        const waBtn = root.querySelector("#btn-whatsapp-handover");
        if (waBtn) {
            waBtn.addEventListener("click", () => {
                const ta = root.querySelector("#handoverMessageText");
                if (ta) {
                    const encoded = encodeURIComponent(ta.value);
                    const tenantPhone = String(page1.tenant_phone || "").replace(/[^0-9]/g, "");
                    const targetUrl = tenantPhone.length >= 9
                        ? `https://api.whatsapp.com/send?phone=${tenantPhone}&text=${encoded}`
                        : `https://api.whatsapp.com/send?text=${encoded}`;
                    window.open(targetUrl, "_blank");
                }
            });
        }
    }
};

