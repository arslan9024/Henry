/**
 * White Caves Real Estate - Pure Coordinate Matrix Configuration (contract_mapper.js)
 * Coordinates are mapped in Points (pt) from Bottom-Left Origin of A4 (595 x 842).
 */

window.PropertyUsageCirclePresets = {
    RESIDENTIAL: { x: 370, y: 344, label: "Residential Circle" },
    COMMERCIAL:  { x: 256, y: 344, label: "Commercial Circle" },
    INDUSTRIAL:  { x: 149, y: 344, label: "Industrial Circle" }
};

window.DefaultContractMapper = {
    page1: {
        contract_date:     { x: 52,  y: 724, size: 8.5, label: "Contract Date" },
        owner_name:        { x: 98,  y: 665, size: 8.5, label: "Owner's Name" },
        lessor_name:       { x: 98,  y: 643, size: 8.5, label: "Lessor's Name" },
        lessor_id:         { x: 116, y: 618, size: 8.5, label: "Lessor's ID / Passport" },
        lessor_email:      { x: 98,  y: 571, size: 8.5, label: "Lessor's Email" },
        lessor_phone:      { x: 98,  y: 550, size: 8.5, label: "Lessor's Phone" },
        tenant_name:       { x: 98,  y: 495, size: 8.5, label: "Tenant's Name" },
        tenant_eid:        { x: 116, y: 472, size: 8.5, label: "Tenant's Emirates ID" },
        tenant_email:      { x: 98,  y: 425, size: 8.5, label: "Tenant's Email" },
        tenant_phone:      { x: 98,  y: 403, size: 8.5, label: "Tenant's Phone" },
        prop_usage:        { x: 370, y: 344, size: 10.0, label: "Usage Tick Mark (✓)", isTickMark: true },
        plot_no:           { x: 76,  y: 321, size: 8.5, label: "Plot No." },
        building_name:     { x: 98,  y: 298, size: 8.5, label: "Building Name" },
        property_no:       { x: 362, y: 298, size: 8.5, label: "Property No." },
        property_type:     { x: 96,  y: 275, size: 8.5, label: "Property Type" },
        property_area:     { x: 384, y: 275, size: 8.5, label: "Property Area (s.m)" },
        location:          { x: 78,  y: 252, size: 8.5, label: "Location" },
        dewa_premises:     { x: 392, y: 252, size: 8.5, label: "Premises No. (DEWA)" },
        date_from:         { x: 98,  y: 195, size: 8.5, label: "From Date" },
        date_to:           { x: 182, y: 195, size: 8.5, label: "To Date" },
        contract_value:    { x: 368, y: 195, size: 8.5, label: "Contract Value" },
        annual_rent:       { x: 88,  y: 170, size: 8.5, label: "Annual Rent" },
        security_deposit:  { x: 404, y: 170, size: 8.5, label: "Security Deposit" },
        mode_of_payment:   { x: 108, y: 149, size: 8.5, label: "Mode of Payment" }
    },
    page3: {
        term_line_1: { x: 58, y: 518, size: 7.5, label: "Clause Line 1" },
        term_line_2: { x: 58, y: 493, size: 7.5, label: "Clause Line 2" },
        term_line_3: { x: 58, y: 468, size: 7.5, label: "Clause Line 3" },
        term_line_4: { x: 58, y: 443, size: 7.5, label: "Clause Line 4" },
        term_line_5: { x: 58, y: 418, size: 7.5, label: "Clause Line 5" }
    }
};

window.ContractMapper = JSON.parse(JSON.stringify(window.DefaultContractMapper));
