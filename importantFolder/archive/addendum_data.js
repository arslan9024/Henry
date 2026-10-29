// FILE: addendum_data.js
/**
 * [Category 3: Values State]
 * White Caves Real Estate - Addendum Live State & Form Synchronizer (addendum_data.js)
 * Tracks live RAM values for the Addendum parameters and syncs shared values from Step 1 inputs.
 */

window.AddendumData = {
    params: JSON.parse(JSON.stringify(
        window.AddendumContentConfig ? window.AddendumContentConfig.defaultParams : {}
    )),

    syncFromStep1Payload: function (page1Payload) {
        if (!page1Payload) return;

        // 1. Property Address (Formatted from Unit, Building, Location)
        const propNo = (page1Payload.property_no || "").trim();
        const bldg = (page1Payload.building_name || "").trim();
        const loc = (page1Payload.location || "").trim();
        const premises = (page1Payload.premises || "").trim();
        if (premises) {
            this.params.property_address = premises;
        } else if (propNo || bldg || loc) {
            this.params.property_address = [propNo, bldg, loc].filter(Boolean).join(", ");
        }

        // 2. Tenancy Commencement & Expiration Dates
        if (page1Payload.contract_period_from) {
            this.params.tenancy_commencement = page1Payload.contract_period_from.trim();
        }
        if (page1Payload.contract_period_to) {
            this.params.tenancy_expiration = page1Payload.contract_period_to.trim();
        }

        // 3. Gross Annual Rent
        if (page1Payload.annual_rent) {
            const rawRent = page1Payload.annual_rent.replace(/AED/gi, "").trim();
            this.params.gross_annual_rent = `AED ${rawRent}`;
        }

        // 4. Payment Frequency (e.g. Four (4) Installments (Cheque/Transfer))
        if (page1Payload.mode_of_payment) {
            const mode = page1Payload.mode_of_payment.trim();
            const match = mode.match(/(\d+)/);
            if (match) {
                const count = parseInt(match[1], 10);
                const words = { 1: "One (1)", 2: "Two (2)", 3: "Three (3)", 4: "Four (4)", 6: "Six (6)", 12: "Twelve (12)" };
                const word = words[count] || `${count} (${count})`;
                this.params.payment_frequency = `${word} Installments (Cheque/Transfer)`;
            } else {
                this.params.payment_frequency = mode;
            }
        }

        // 5. Refundable Security Deposit
        if (page1Payload.security_deposit) {
            const rawDep = page1Payload.security_deposit.replace(/AED/gi, "").trim();
            this.params.refundable_security_deposit = `AED ${rawDep}`;
        }

        // 6. DED / DEWA Premises No.
        if (page1Payload.dewa_premise_no) {
            this.params.dewa_premises_no = page1Payload.dewa_premise_no.trim();
        }

        // 7. Tenant & Landlord Signatory Names
        if (page1Payload.tenant_name) {
            this.params.tenant_name = page1Payload.tenant_name.trim();
        }
        if (page1Payload.owner_name) {
            this.params.landlord_name = page1Payload.owner_name.trim();
        }

        this.populateAddendumFormInputs();
    },

    setParam: function (key, value) {
        this.params[key] = value;
    },

    renderAddendumForm: function (containerId) {
        if (window.AddendumFormView) window.AddendumFormView.render(containerId, this.params);
    },

    populateAddendumFormInputs: function () {
        if (typeof document === "undefined") return;
        for (const k in this.params) {
            const el = document.getElementById(`addendum-${k}`);
            if (el) el.value = this.params[k];
        }
    }
};
