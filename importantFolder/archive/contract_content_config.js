/**
 * [Category 2: Data Config]
 * White Caves Real Estate - DLD Contract Static Content, Presets & Field Schema (contract_content_config.js)
 * Pure static dictionary for the 24 Page 1 inputs (Categories A–E) and 5 Page 3 unnumbered clauses.
 */

window.ContractContentConfig = {
    page1Keys: [
        "contract_date", "owner_name", "lessor_name", "lessor_id", "lessor_email", "lessor_phone",
        "tenant_name", "tenant_eid", "tenant_email", "tenant_phone", "prop_usage", "plot_no",
        "building_name", "property_type", "location", "property_no", "property_area", "dewa_premises",
        "date_from", "date_to", "annual_rent", "contract_value", "security_deposit", "mode_of_payment"
    ],

    renewalPreset: {
        contract_date: "27-10-2026",
        owner_name: "BASHAR GHAZI MAJAR",
        lessor_name: "BASHAR GHAZI MAJAR",
        lessor_id: "N 016004319 ( PASSPORT NUMBER OF NON RESIDENT )",
        lessor_email: "majar77@gmail.com",
        lessor_phone: "97450161610",
        tenant_name: "HIRDESH BHAGIRATH PARSHOTAM LAL BHAGIRATH",
        tenant_eid: "784-1976-9510275-2",
        tenant_email: "HIRDESH.BHAGIRATH@GMAIL.COM",
        tenant_phone: "971569946568",
        prop_usage: "✓",
        plot_no: "9049",
        building_name: "PRIMROSE",
        property_no: "142",
        property_type: "LAND",
        property_area: "174.80",
        location: "DAMAC HILLS 2",
        dewa_premises: "916007758",
        date_from: "10-11-2026",
        date_to: "09-11-2027",
        contract_value: "115,000 AED",
        annual_rent: "115,000 AED",
        security_deposit: "6,000 AED",
        mode_of_payment: "2 CHEQUES"
    },

    clausesDefault: [
        "The addendum attached to this is an integral part of the tenancy contract.",
        "This contract is valid for 1 year only. Renewal of the contract is subject to the approval of the landlord.",
        "The security deposit is non-refundable if the house isn't returned clean, undamaged, and with proof of required services.",
        "The landlord will confirm and arrange the maintenance, including cleaning, painting, and AC service, for the tenant before MOVE-IN.",
        "The key handover will be processed after the submission of EJARI, DEWA receipt, and MOVE-IN permit by DAMAC."
    ],

    getPage1Sections: function () {
        const r = this.renewalPreset;
        return [
            {
                category: "A. Contract Header (1 Field)", badge: "Header",
                fields: [{ name: "contract_date", label: "Contract Date / تاريخ العقد", value: r.contract_date }]
            },
            {
                category: "B. Owner / Lessor Information (5 Fields)", badge: "Lessor",
                fields: [
                    { name: "owner_name", label: "Owner's Name / اسم المالك", value: r.owner_name },
                    { name: "lessor_name", label: "Lessor's Name / اسم المؤجر", value: r.lessor_name },
                    { name: "lessor_id", label: "Lessor's ID or Passport / الهوية أو الجواز", value: r.lessor_id },
                    { name: "lessor_email", label: "Lessor's Email / البريد الإلكتروني", value: r.lessor_email },
                    { name: "lessor_phone", label: "Lessor's Phone / رقم الهاتف", value: r.lessor_phone }
                ]
            },
            {
                category: "C. Tenant Information (4 Fields)", badge: "Tenant",
                fields: [
                    { name: "tenant_name", label: "Tenant's Name / اسم المستأجر", value: r.tenant_name },
                    { name: "tenant_eid", label: "Tenant's Emirates ID / الهوية الإماراتية", value: r.tenant_eid },
                    { name: "tenant_email", label: "Tenant's Email / البريد الإلكتروني", value: r.tenant_email },
                    { name: "tenant_phone", label: "Tenant's Phone / رقم الهاتف", value: r.tenant_phone }
                ]
            },
            {
                category: "D. Property Information (8 Fields)", badge: "Property",
                fields: [
                    { name: "prop_usage", label: "Property Usage (Tick Mark on PDF)", type: "tick_usage" },
                    { name: "plot_no", label: "Plot No. / رقم الأرض", value: r.plot_no },
                    { name: "building_name", label: "Building Name / اسم المبنى", value: r.building_name },
                    { name: "property_no", label: "Property / Unit No. / رقم العقار", value: r.property_no },
                    { name: "property_type", label: "Property Type / نوع الوحدة", value: r.property_type },
                    { name: "property_area", label: "Property Area (s.m) / مساحة العقار", value: r.property_area },
                    { name: "location", label: "Location / Area / الموقع", value: r.location },
                    { name: "dewa_premises", label: "Premises No. (DEWA) / رقم ديوا", value: r.dewa_premises }
                ]
            },
            {
                category: "E. Contract & Financial Terms (6 Fields)", badge: "Financials",
                fields: [
                    { name: "date_from", label: "Period - From / من تاريخ", value: r.date_from },
                    { name: "date_to", label: "Period - To / إلى تاريخ", value: r.date_to },
                    { name: "contract_value", label: "Contract Value / قيمة العقد", value: r.contract_value },
                    { name: "annual_rent", label: "Annual Rent / الايجار السنوي", value: r.annual_rent },
                    { name: "security_deposit", label: "Security Deposit / مبلغ التأمين", value: r.security_deposit },
                    { name: "mode_of_payment", label: "Mode of Payment / طريقة الدفع", value: r.mode_of_payment }
                ]
            }
        ];
    }
};

