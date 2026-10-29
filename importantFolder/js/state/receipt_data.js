/**
 * [Category 3: Values State]
 * White Caves Real Estate - Payment Receipt Live State & Tax Calculator (receipt_data.js)
 * Tracks live RAM values for Page 7 Payment Receipt and auto-calculates 5% Fee + 5% VAT.
 */

window.ReceiptData = {
    params: JSON.parse(JSON.stringify(
        window.ReceiptContentConfig ? window.ReceiptContentConfig.defaultParams : {}
    )),

    syncFromStep1Payload: function (page1Payload) {
        if (!page1Payload) return;
        if (page1Payload.tenant_name) {
            this.params.tenant_name = page1Payload.tenant_name;
        }
        const bldg = (page1Payload.building_name || "Primrose").trim();
        const propNo = (page1Payload.property_no || "142").trim();
        const loc = (page1Payload.location || "DAMAC Hills 2").trim();
        const bldgClean = bldg.charAt(0).toUpperCase() + bldg.slice(1).toLowerCase();
        this.params.property_summary = `Property: ${bldgClean}, ${propNo}, ${loc}`;

        const rawRentStr = (page1Payload.annual_rent || "115,000 AED").replace(/AED/gi, "").trim();
        const numericRent = parseFloat(rawRentStr.replace(/,/g, "")) || 115000;

        this.params.rent_display = `${numericRent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`;
        this.recalculateFeeFromPercentage(numericRent, parseFloat(this.params.agency_fee_pct) || 5);
        this.populateReceiptFormInputs();
    },

    recalculateFeeFromPercentage: function (numericRent, pct) {
        const feeAmount = numericRent * (pct / 100);
        const totalWithVat = feeAmount * 1.05;
        const feeClean = Number.isInteger(feeAmount) ? feeAmount.toString() : feeAmount.toFixed(2);
        const totalClean = totalWithVat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        this.params.agency_fee_display = `${pct}% (Amount= ${feeClean} AED)`;
        this.params.total_display = `${totalClean} AED (Including 5% VAT)`;
    },

    renderReceiptForm: function (containerId) {
        if (typeof document === "undefined" || !window.ReceiptContentConfig) return;
        const root = document.getElementById(containerId);
        if (!root) return;

        const fields = window.ReceiptContentConfig.fieldDefs || [];
        let html = `<div class="grid-container">`;
        fields.forEach(f => {
            const val = this.params[f.key] || "";
            html += `<div class="input-card"><label for="receipt-${f.key}">${f.label}</label><input type="text" id="receipt-${f.key}" data-receipt-key="${f.key}" value="${val}" autocomplete="off"></div>`;
        });
        root.innerHTML = html + `</div>`;

        root.querySelectorAll("input[data-receipt-key]").forEach(inp => {
            inp.addEventListener("input", () => {
                const k = inp.getAttribute("data-receipt-key");
                this.params[k] = inp.value;

                if (k === "agency_fee_pct" || k === "rent_display") {
                    const numRent = parseFloat(String(this.params.rent_display).replace(/[^0-9.]/g, "")) || 115000;
                    const pct = parseFloat(this.params.agency_fee_pct) || 5;
                    this.recalculateFeeFromPercentage(numRent, pct);
                    const feeInput = document.getElementById("receipt-agency_fee_display");
                    const totInput = document.getElementById("receipt-total_display");
                    if (feeInput) feeInput.value = this.params.agency_fee_display;
                    if (totInput) totInput.value = this.params.total_display;
                }

                if (window.WorkflowEngine) window.WorkflowEngine.onReceiptMutated();
            });
        });
    },

    populateReceiptFormInputs: function () {
        if (typeof document === "undefined") return;
        for (const k in this.params) {
            const el = document.getElementById(`receipt-${k}`);
            if (el) el.value = this.params[k];
        }
    }
};
