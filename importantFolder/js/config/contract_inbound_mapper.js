// FILE: js/config/contract_inbound_mapper.js
/**
 * [Category 2: Data Config - INBOUND EXTRACTION & PARSING ONLY]
 * White Caves Real Estate - Old Tenancy Contract & Ejari Inbound Extraction Schema (contract_inbound_mapper.js)
 * 
 * ⚠️ STRICT ARCHITECTURAL ISOLATION RULE:
 * This file is EXCLUSIVELY used for:
 *   1. Reading and parsing OLD Tenancy Contracts, Ejari Certificates, and KYC documents (PDF/OCR).
 *   2. Defining inbound extraction anchors, regex rules, label-rejection tokens, and field normalization.
 * 
 * ⛔ DO NOT USE THIS FILE FOR OUTPUT CALIBRATION OR STAMPING NEW TEMPLATES!
 * Output stamping onto the blank DLD template is handled exclusively by the Outbound Coordinate
 * Matrix (js/config/contract_mapper.js).
 * Pure static schema dictionary: zero DOM manipulation, zero coordinate calculations.
 */

window.ContractInboundMapper = {
    // Complete 29 Target Fields: 24 Page 1 Fields (including ✓ Usage Tick) + 5 Page 3 Additional Clauses
    allTargetKeys: [
        // A. Header (1 Field)
        "contract_date",
        // B. Lessor / Owner (5 Fields)
        "owner_name", "lessor_name", "lessor_id", "lessor_email", "lessor_phone",
        // C. Tenant (4 Fields)
        "tenant_name", "tenant_eid", "tenant_email", "tenant_phone",
        // D. Property (8 Fields)
        "prop_usage", "plot_no", "building_name", "property_no", "property_type", "property_area", "location", "dewa_premises",
        // E. Financials & Period (6 Fields)
        "date_from", "date_to", "contract_value", "annual_rent", "security_deposit", "mode_of_payment",
        // F. Page 3 Clauses (5 Clauses)
        "term_line_1", "term_line_2", "term_line_3", "term_line_4", "term_line_5"
    ],

    // Human-readable labels & section categories for the Inbound Diff & Verification modal
    fieldLabels: {
        // Section A: Header
        contract_date: "Contract Date / تاريخ العقد",

        // Section B: Lessor / Owner
        owner_name: "Owner's Name / اسم المالك",
        lessor_name: "Lessor's Name / اسم المؤجر",
        lessor_id: "Lessor's ID or Passport / الهوية أو الجواز",
        lessor_email: "Lessor's Email / البريد الإلكتروني",
        lessor_phone: "Lessor's Phone / رقم الهاتف",

        // Section C: Tenant
        tenant_name: "Tenant's Name / اسم المستأجر",
        tenant_eid: "Tenant's Emirates ID / الهوية الإماراتية",
        tenant_email: "Tenant's Email / البريد الإلكتروني",
        tenant_phone: "Tenant's Phone / رقم الهاتف",

        // Section D: Property
        prop_usage: "Property Usage Tick / نوع الاستخدام (✓)",
        plot_no: "Plot No. / رقم الأرض",
        building_name: "Building Name / اسم المبنى",
        property_no: "Property / Unit No. / رقم العقار",
        property_type: "Property Type / نوع الوحدة",
        property_area: "Property Area (s.m) / مساحة العقار",
        location: "Location / Area / الموقع",
        dewa_premises: "Premises No. (DEWA) / رقم ديوا",

        // Section E: Financials
        date_from: "Period - From / من تاريخ",
        date_to: "Period - To / إلى تاريخ",
        contract_value: "Contract Value / قيمة العقد",
        annual_rent: "Annual Rent / الايجار السنوي",
        security_deposit: "Security Deposit / مبلغ التأمين",
        mode_of_payment: "Mode of Payment / طريقة الدفع",

        // Section F: Page 3 Additional Clauses
        term_line_1: "Clause Line 1 / البند 1 (Integral Addendum)",
        term_line_2: "Clause Line 2 / البند 2 (1-Year Validity)",
        term_line_3: "Clause Line 3 / البند 3 (Deposit Refund Condition)",
        term_line_4: "Clause Line 4 / البند 4 (Landlord Maintenance & AC)",
        term_line_5: "Clause Line 5 / البند 5 (Key Handover & Move-In Permit)"
    },

    // Category Section Definitions for Tabular Grouping in Diff Modal
    sections: [
        {
            name: "A. Contract Header",
            badge: "Header",
            keys: ["contract_date"]
        },
        {
            name: "B. Owner / Lessor Information",
            badge: "Lessor",
            keys: ["owner_name", "lessor_name", "lessor_id", "lessor_email", "lessor_phone"]
        },
        {
            name: "C. Tenant Information",
            badge: "Tenant",
            keys: ["tenant_name", "tenant_eid", "tenant_email", "tenant_phone"]
        },
        {
            name: "D. Property Details",
            badge: "Property",
            keys: ["prop_usage", "plot_no", "building_name", "property_no", "property_type", "property_area", "location", "dewa_premises"]
        },
        {
            name: "E. Financial Terms & Period",
            badge: "Financials",
            keys: ["date_from", "date_to", "contract_value", "annual_rent", "security_deposit", "mode_of_payment"]
        },
        {
            name: "F. Page 3 Additional Clauses",
            badge: "Clauses",
            keys: ["term_line_1", "term_line_2", "term_line_3", "term_line_4", "term_line_5"]
        }
    ],

    // Inbound Extraction Rules for Old Tenancy Contracts & Ejari Certificates
    extractionGuidelines: {
        contract_no: {
            patterns: [/(?:contract|registration|ejari)\s*(?:no|number|\#|\:)/i, /رقم\s*العقد/, /رقم\s*إيجاري/],
            type: "alphanumeric",
            minDigits: 4
        },
        date_from: {
            patterns: [/(?:Period\s*[-–]?\s*From|Commencement|Start\s*Date|Tenancy\s*Commencement|من\s*تاريخ)[:\s]+(\d{2}[-\/\.]\d{2}[-\/\.]\d{4})/i],
            type: "date"
        },
        date_to: {
            patterns: [/(?:Period\s*[-–]?\s*To|Expiration|Expiry|End\s*Date|Tenancy\s*Expiration|إلى\s*تاريخ)[:\s]+(\d{2}[-\/\.]\d{2}[-\/\.]\d{4})/i],
            type: "date"
        },
        annual_rent: {
            patterns: [/(?:Annual\s*Rent|Rent\s*Value|Total\s*Rent|Gross\s*Annual\s*Rent|الإيجار\s*السنوي)[:\s]+(?:AED)?\s*([\d,]+(?:\.\d{2})?)/i],
            type: "currency"
        },
        contract_value: {
            patterns: [/(?:Contract\s*Value|Total\s*Contract\s*Value|قيمة\s*العقد)[:\s]+(?:AED)?\s*([\d,]+(?:\.\d{2})?)/i],
            type: "currency"
        },
        security_deposit: {
            patterns: [/(?:Security\s*Deposit|Deposit|Refundable\s*Security\s*Deposit|مبلغ\s*التأمين)[:\s]+(?:AED)?\s*([\d,]+(?:\.\d{2})?)/i],
            type: "currency"
        },
        mode_of_payment: {
            patterns: [/(\d+)\s*(?:Cheques?|Installments?|CHEQUES|Payments?)/i, /(?:Mode\s*of\s*Payment|Payment\s*Mode|طريقة\s*الدفع)[:\s]+([^\n\r,]{3,30})/i],
            type: "text"
        },
        dewa_premises: {
            patterns: [/(?:DEWA|Premise(?:s)?\s*(?:No|Number|\#)?|رقم\s*ديوا)[:\s\.\-]+(\d{7,12})/i, /\b(9\d{8})\b/],
            type: "numeric"
        },
        tenant_eid: {
            patterns: [/\b784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d\b/],
            type: "uae_eid"
        }
    },

    // Strict Form Label Rejection Tokens to prevent form headers from being extracted as values
    labelRejectionTokens: [
        "tenant", "tenant's name", "name of tenant", "اسم المستأجر",
        "owner", "owner's name", "landlord", "lessor", "lessor's name", "اسم المالك", "اسم المؤجر",
        "emirates id", "id no", "passport", "passport no", "رقم الهوية", "جواز السفر",
        "email", "e-mail", "phone", "mobile", "telephone", "fax", "البريد الإلكتروني", "رقم الهاتف",
        "plot", "plot no", "رقم الأرض",
        "building", "building name", "tower", "cluster", "project", "اسم المبنى", "اسم البرج",
        "property", "property no", "unit", "unit no", "flat", "apartment", "رقم العقار", "رقم الوحدة",
        "property type", "نوع العقار", "property area", "مساحة العقار", "property usage", "استخدام العقار",
        "location", "community", "area", "master developer", "الموقع", "المنطقة",
        "premise", "premises", "dewa", "dewa premises", "رقم ديوا", "رقم المبنى",
        "period", "period from", "period to", "from date", "to date", "من تاريخ", "إلى تاريخ",
        "annual rent", "rent value", "contract value", "الإيجار السنوي", "قيمة العقد",
        "security deposit", "deposit", "مبلغ التأمين",
        "mode of payment", "payment mode", "cheques", "installments", "طريقة الدفع"
    ]
};
