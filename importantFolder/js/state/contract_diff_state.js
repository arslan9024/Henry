// FILE: js/state/contract_diff_state.js
/**
 * [Category 3: Values State]
 * White Caves Real Estate - Document Intelligence Comparison & Diff State Buffer (contract_diff_state.js)
 * 
 * ⚠️ STRICT ARCHITECTURAL ISOLATION RULE:
 * This file is EXCLUSIVELY used for comparing and applying INBOUND extracted data (from Old Tenancy Contracts,
 * Ejari Certificates, Passports, and Emirates IDs) against current Step 1 & Step 3 form metrics.
 * 
 * ⛔ DO NOT MIX WITH OUTBOUND STAMPING COORDINATES (contract_mapper.js).
 * Outbound template stamping is handled strictly by DefaultContractMapper (contract_mapper.js).
 * Inbound field schema labels & sections are derived from ContractInboundMapper (contract_inbound_mapper.js).
 * Contains the complete 29 contract elements: 24 Page 1 fields + ✓ usage tick + 5 Page 3 clauses.
 * Zero DOM manipulation.
 */

window.ContractDiffState = {
    isOpen: false,
    items: [],
    fileName: "",
    documentType: "",
    encryptedToken: null,

    get labelMap() {
        if (window.ContractInboundMapper && window.ContractInboundMapper.fieldLabels) {
            return window.ContractInboundMapper.fieldLabels;
        }
        return {
            contract_date: "Contract Date / تاريخ العقد",
            owner_name: "Owner's Name / اسم المالك",
            lessor_name: "Lessor's Name / اسم المؤجر",
            lessor_id: "Lessor's ID or Passport / الهوية أو الجواز",
            lessor_email: "Lessor's Email / البريد الإلكتروني",
            lessor_phone: "Lessor's Phone / رقم الهاتف",
            tenant_name: "Tenant's Name / اسم المستأجر",
            tenant_eid: "Tenant's Emirates ID / الهوية الإماراتية",
            tenant_email: "Tenant's Email / البريد الإلكتروني",
            tenant_phone: "Tenant's Phone / رقم الهاتف",
            prop_usage: "Property Usage / نوع الاستخدام (✓)",
            plot_no: "Plot No. / رقم الأرض",
            building_name: "Building Name / اسم المبنى",
            property_no: "Property / Unit No. / رقم العقار",
            property_type: "Property Type / نوع الوحدة",
            property_area: "Property Area (s.m) / مساحة العقار",
            location: "Location / Area / الموقع",
            dewa_premises: "Premises No. (DEWA) / رقم ديوا",
            date_from: "Period - From / من تاريخ",
            date_to: "Period - To / إلى تاريخ",
            contract_value: "Contract Value / قيمة العقد",
            annual_rent: "Annual Rent / الايجار السنوي",
            security_deposit: "Security Deposit / مبلغ التأمين",
            mode_of_payment: "Mode of Payment / طريقة الدفع",
            term_line_1: "Clause Line 1 / البند 1 (Integral Addendum)",
            term_line_2: "Clause Line 2 / البند 2 (1-Year Validity)",
            term_line_3: "Clause Line 3 / البند 3 (Deposit Refund Condition)",
            term_line_4: "Clause Line 4 / البند 4 (Landlord Maintenance & AC)",
            term_line_5: "Clause Line 5 / البند 5 (Key Handover & Move-In Permit)"
        };
    },

    setComparisonData: function (extractionResult, currentPayload, fileName) {
        this.fileName = fileName || "Uploaded Document";
        this.documentType = extractionResult ? extractionResult.documentType : "document";
        this.encryptedToken = extractionResult ? extractionResult.encryptedToken : null;
        this.items = [];

        const page1Current = (currentPayload && currentPayload.page1) ? currentPayload.page1 : {};
        const page3Current = (currentPayload && currentPayload.page3) ? currentPayload.page3 : {};
        const rawData = extractionResult ? (extractionResult.data || extractionResult.extracted || {}) : {};
        const renewalDates = extractionResult ? extractionResult.renewalDates : null;

        // Unified property mapper from extracted document to Step 1 & Step 3 field keys
        const mappedDetected = {};

        // 1. Passport Extraction Mapping
        if (this.documentType === "passport") {
            if (rawData.fullName) mappedDetected.tenant_name = rawData.fullName;
            if (rawData.documentNumber) mappedDetected.tenant_eid = rawData.documentNumber;
        }

        // 2. Emirates ID Front/Back Mapping
        if (this.documentType === "emirates_id_front" || this.documentType === "emirates_id_back") {
            if (rawData.fullName) mappedDetected.tenant_name = rawData.fullName;
            if (rawData.idNumber) mappedDetected.tenant_eid = rawData.idNumber;
            else if (rawData.documentNumber) mappedDetected.tenant_eid = rawData.documentNumber;
        }

        // 3. Tenancy Contract Mapping (All 24 Page 1 Fields + ✓ Tick + 5 Page 3 Clauses)
        if (this.documentType === "tenancy_contract") {
            // A. Contract Date
            if (rawData.contract_date) mappedDetected.contract_date = rawData.contract_date;

            // B. Owner / Lessor Info
            if (rawData.owner_name) mappedDetected.owner_name = rawData.owner_name;
            if (rawData.lessor_name || rawData.owner_name) mappedDetected.lessor_name = rawData.lessor_name || rawData.owner_name;
            if (rawData.lessor_id) mappedDetected.lessor_id = rawData.lessor_id;
            if (rawData.lessor_email) mappedDetected.lessor_email = rawData.lessor_email;
            if (rawData.lessor_phone) mappedDetected.lessor_phone = rawData.lessor_phone;

            // C. Tenant Info
            if (rawData.tenant_name) mappedDetected.tenant_name = rawData.tenant_name;
            if (rawData.tenant_eid) mappedDetected.tenant_eid = rawData.tenant_eid;
            if (rawData.tenant_email) mappedDetected.tenant_email = rawData.tenant_email;
            if (rawData.tenant_phone) mappedDetected.tenant_phone = rawData.tenant_phone;

            // D. Property Info
            mappedDetected.prop_usage = rawData.prop_usage || "✓";
            if (rawData.plot_no) mappedDetected.plot_no = rawData.plot_no;
            if (rawData.building_name) mappedDetected.building_name = rawData.building_name;
            if (rawData.property_no) mappedDetected.property_no = rawData.property_no;
            if (rawData.property_type) mappedDetected.property_type = rawData.property_type;
            if (rawData.property_area) mappedDetected.property_area = rawData.property_area;
            if (rawData.location) mappedDetected.location = rawData.location;
            if (rawData.dewa_premises || rawData.dewa_premise_no) {
                mappedDetected.dewa_premises = rawData.dewa_premises || rawData.dewa_premise_no;
            }

            // E. Financial Terms & Period
            if (renewalDates && renewalDates.suggestedRenewalFrom && renewalDates.suggestedRenewalTo) {
                mappedDetected.date_from = renewalDates.suggestedRenewalFrom;
                mappedDetected.date_to = renewalDates.suggestedRenewalTo;
            } else {
                if (rawData.date_from || rawData.contract_period_from) {
                    mappedDetected.date_from = rawData.date_from || rawData.contract_period_from;
                }
                if (rawData.date_to || rawData.contract_period_to) {
                    mappedDetected.date_to = rawData.date_to || rawData.contract_period_to;
                }
            }

            if (rawData.annual_rent) mappedDetected.annual_rent = rawData.annual_rent;
            if (rawData.contract_value || rawData.annual_rent) {
                mappedDetected.contract_value = rawData.contract_value || rawData.annual_rent;
            }
            if (rawData.security_deposit) mappedDetected.security_deposit = rawData.security_deposit;
            if (rawData.mode_of_payment) mappedDetected.mode_of_payment = rawData.mode_of_payment;

            // F. Page 3 Clauses (term_line_1 to term_line_5)
            for (let i = 1; i <= 5; i++) {
                const key = `term_line_${i}`;
                if (rawData[key]) mappedDetected[key] = rawData[key];
            }
        }

        // Complete Target Schema Matrix: 24 Page 1 fields + ✓ Tick + 5 Page 3 clauses = 29 Total Fields
        const targetKeys = (window.ContractInboundMapper && window.ContractInboundMapper.allTargetKeys)
            ? window.ContractInboundMapper.allTargetKeys
            : [
                "contract_date", "owner_name", "lessor_name", "lessor_id", "lessor_email", "lessor_phone",
                "tenant_name", "tenant_eid", "tenant_email", "tenant_phone",
                "prop_usage", "plot_no", "building_name", "property_no", "property_type", "property_area", "location", "dewa_premises",
                "date_from", "date_to", "contract_value", "annual_rent", "security_deposit", "mode_of_payment",
                "term_line_1", "term_line_2", "term_line_3", "term_line_4", "term_line_5"
            ];

        // Section mappings for categorization
        const sectionMap = {
            contract_date: "A. Header",
            owner_name: "B. Lessor", lessor_name: "B. Lessor", lessor_id: "B. Lessor", lessor_email: "B. Lessor", lessor_phone: "B. Lessor",
            tenant_name: "C. Tenant", tenant_eid: "C. Tenant", tenant_email: "C. Tenant", tenant_phone: "C. Tenant",
            prop_usage: "D. Property", plot_no: "D. Property", building_name: "D. Property", property_no: "D. Property",
            property_type: "D. Property", property_area: "D. Property", location: "D. Property", dewa_premises: "D. Property",
            date_from: "E. Financials", date_to: "E. Financials", contract_value: "E. Financials", annual_rent: "E. Financials",
            security_deposit: "E. Financials", mode_of_payment: "E. Financials",
            term_line_1: "F. Clauses", term_line_2: "F. Clauses", term_line_3: "F. Clauses", term_line_4: "F. Clauses", term_line_5: "F. Clauses"
        };

        const preset = (window.ContractContentConfig && window.ContractContentConfig.renewalPreset) || {};
        const defClauses = (window.ContractContentConfig && window.ContractContentConfig.clausesDefault) || [];

        // Build comparison items for ALL target keys so the user sees all 29 fields
        targetKeys.forEach(key => {
            const isClause = key.startsWith("term_line_");
            let currentVal = isClause ? (page3Current[key] || "") : (page1Current[key] || "");

            // Fallback to preset if form is currently empty
            if (!currentVal) {
                if (isClause) {
                    const clauseIdx = parseInt(key.replace("term_line_", ""), 10) - 1;
                    currentVal = defClauses[clauseIdx] || "";
                } else {
                    currentVal = preset[key] || "";
                }
            }

            const isDetected = Boolean(mappedDetected[key] != null && String(mappedDetected[key]).trim().length > 0);
            const detectedVal = isDetected ? String(mappedDetected[key]).trim() : currentVal;
            const isRenewalDate = (key === "date_from" || key === "date_to") && Boolean(renewalDates);
            const isDifferent = String(currentVal).trim() !== String(detectedVal).trim();

            this.items.push({
                key: key,
                label: this.labelMap[key] || key,
                section: sectionMap[key] || "General",
                currentVal: currentVal,
                detectedVal: detectedVal,
                isDetected: isDetected,
                isRenewalDate: isRenewalDate,
                isDifferent: isDifferent,
                // Pre-select fields that were detected from the document
                selected: isDetected
            });
        });

        this.isOpen = this.items.length > 0;
    },

    toggleField: function (key, isSelected) {
        const item = this.items.find(i => i.key === key);
        if (item) item.selected = !!isSelected;
    },

    selectAll: function (isSelected) {
        this.items.forEach(i => { i.selected = !!isSelected; });
    },

    selectDetectedOnly: function () {
        this.items.forEach(i => { i.selected = !!i.isDetected; });
    },

    close: function () {
        this.isOpen = false;
    },

    applySelectedToForm: function () {
        const appliedKeys = [];
        if (typeof document !== "undefined") {
            this.items.forEach(item => {
                if (item.selected) {
                    const input = document.getElementById(`field-${item.key}`);
                    if (input) {
                        input.value = item.detectedVal;
                        appliedKeys.push(item.key);
                    }

                    // Special handling for Property Usage Tick & Radios
                    if (item.key === "prop_usage") {
                        const usageInput = document.getElementById("field-prop_usage");
                        if (usageInput) usageInput.value = "✓";
                    }
                }
            });
        }

        if (window.WorkflowEngine) {
            window.WorkflowEngine.onFormInputMutated();
        }

        this.isOpen = false;
        return appliedKeys;
    }
};
