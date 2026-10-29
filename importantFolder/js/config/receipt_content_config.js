/**
 * [Category 2: Data Config]
 * White Caves Real Estate - Payment Receipt Static Content & Field Schema (receipt_content_config.js)
 * Pure static configuration for Page 7 Agency Fee Payment Receipt defaults and field definitions.
 */

window.ReceiptContentConfig = {
    defaultParams: {
        include_receipt: true,
        bill_from: "White Caves Real Estate LLC",
        tenant_name: "Hirdesh Bhagirath Parshotam Lal Bhagirath",
        property_summary: "Property: Primrose, 142, DAMAC Hills 2",
        rent_display: "115,000.00 AED",
        agency_fee_pct: "5",
        agency_fee_display: "5% (Amount= 5750 AED)",
        total_display: "6,037.50 AED (Including 5% VAT)",
        acknowledgment_text: "This is to acknowledge that the tenant has paid the agency fee.",
        signatory_name: "Arslan Malik",
        contact_mobile: "+971563616136",
        contact_email: "the.white.caves@gmail.com"
    },

    fieldDefs: [
        { key: "bill_from", label: "Bill From (Agency Name)" },
        { key: "tenant_name", label: "To: Tenant Name" },
        { key: "property_summary", label: "Payment Details (Property Line)" },
        { key: "rent_display", label: "Annual Rent Amount" },
        { key: "agency_fee_pct", label: "Quick Calc: Agency Fee % (Auto-updates Fee & 5% VAT Total)" },
        { key: "agency_fee_display", label: "Agency Fee Row Text" },
        { key: "total_display", label: "Total Row Text (Including 5% VAT)" },
        { key: "acknowledgment_text", label: "Receipt Acknowledgment Statement" },
        { key: "signatory_name", label: "Authorized Signatory Name" },
        { key: "contact_mobile", label: "Footer Contact Mobile" },
        { key: "contact_email", label: "Footer Contact Email" }
    ]
};

