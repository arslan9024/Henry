// FILE: addendum_content_config.js
/**
 * [Category 2: Data Config]
 * White Caves Real Estate - 2-Page Official RERA Addendum Model & Clauses (addendum_content_config.js)
 * Pure static configuration dictionary matching the official White Caves 2-page Addendum layout.
 * Page 1: Sections 1–3 statutory clauses.
 * Page 2: Section 4 statutory clauses, Section 5 parameter table & execution block.
 */

window.AddendumContentConfig = {
    defaultParams: {
        property_address: "Studio Apartment 404, Viridis A, Madinat Hind 4, Dubai",
        property_fitout_status: "Fully Furnished Hotel Apartment",
        tenancy_commencement: "01-10-2026",
        tenancy_expiration: "30-09-2027",
        gross_annual_rent: "AED 35,000",
        payment_frequency: "Four (4) Installments (Cheque/Transfer)",
        refundable_security_deposit: "AED 3,000",
        returned_cheque_penalty: "AED 1,000 per event",
        minor_maintenance_threshold: "Costs under AED 1,000",
        major_maintenance_threshold: "Costs AED 1,000 and above",
        dewa_premises_no: "916058204",
        authorized_agency_fee: "White Caves Real Estate LLC (Admin Fee: AED 1,500)",
        tenant_name: "Ajas Paliakarkadu Fasal Fasaludheen Peerukutty",
        landlord_name: "Hassen Soltani"
    },

    // 9 fields pulled automatically from Step 1 (Contract Grid)
    syncedFromStep1: [
        { key: "property_address", label: "Property Address (P1)" },
        { key: "tenancy_commencement", label: "Commencement (P1)" },
        { key: "tenancy_expiration", label: "Expiration (P1)" },
        { key: "gross_annual_rent", label: "Annual Rent (P1)" },
        { key: "payment_frequency", label: "Payment Frequency (P1)" },
        { key: "refundable_security_deposit", label: "Security Deposit (P1)" },
        { key: "dewa_premises_no", label: "DEWA Premise No (P1)" },
        { key: "tenant_name", label: "Tenant Signatory (P1)" },
        { key: "landlord_name", label: "Landlord Signatory (P1)" }
    ],

    // Addendum-specific new fields to collect in Step 3
    sections: [
        {
            id: "Fitout",
            chip: "1. Fit-Out Status",
            title: "1. Property Fit-Out Status",
            badge: "Section 5 Table",
            fields: [
                {
                    key: "property_fitout_status",
                    label: "Property Fit-Out Status",
                    options: [
                        "Fully Furnished Hotel Apartment",
                        "Fully Furnished",
                        "Semi-furnished",
                        "Un-furnished"
                    ]
                }
            ]
        },
        {
            id: "Maintenance",
            chip: "2. Maintenance Thresholds",
            title: "2. Maintenance Thresholds (Minor / Major)",
            badge: "Section 3 & 5",
            fields: [
                { key: "minor_maintenance_threshold", label: "Minor Maintenance Threshold (Tenant)" },
                { key: "major_maintenance_threshold", label: "Major Maintenance Threshold (Landlord)" }
            ]
        },
        {
            id: "PenaltiesAgency",
            chip: "3. Penalties & Agency Fee",
            title: "3. Financial Penalties & Agency Fee",
            badge: "Section 2 & 5",
            fields: [
                { key: "returned_cheque_penalty", label: "Returned Cheque Penalty" },
                { key: "authorized_agency_fee", label: "Authorized Agency & Admin Fee" }
            ]
        }
    ],

    // Static text templates for Page 1 & Page 2
    page1Clauses: [
        {
            title: "SECTION 1: USE OF PREMISES & OCCUPANCY",
            clauses: [
                {
                    num: "1.1 Permitted Use:",
                    body: "The Leased Premises shall be utilized exclusively for private residential purposes. Any form of commercial operation, industrial use, or unauthorized business activity within the premises is strictly prohibited."
                },
                {
                    num: "1.2 Subleasing and Assignment:",
                    body: "The Tenant shall not sublease, assign, share occupancy, or transfer the possession of the premises, in whole or in part, to any third party without obtaining the prior explicit written consent of the Landlord, in strict accordance with Article (24) of Dubai Law No. (26) of 2007."
                },
                {
                    num: "1.3 Alterations and Modifications:",
                    body: "The Tenant is prohibited from executing any structural modifications, internal alterations, or permanent decorative changes to the property without obtaining a written No Objection Certificate (NOC) from the Landlord, alongside mandatory regulatory approvals from competent local authorities (including Dubai Municipality and RERA)."
                }
            ]
        },
        {
            title: "SECTION 2: FINANCIAL OBLIGATIONS & PAYMENT CLAUSES",
            clauses: [
                {
                    num: "2.1 Rent Schedule:",
                    body: "The total annual rent value stipulated in this contract is strictly payable via the specific payment instruments and regular installments outlined in the core contract parameters."
                },
                {
                    num: "2.2 Instrument Dishonour:",
                    body: "In the event that any cheque is returned dishonoured by the drawee bank, the Tenant shall immediately incur the specified administrative fee. The Tenant remains legally obligated to settle the outstanding balance via cleared funds (electronic bank transfer or manager's cheque) within five (5) working days from the date of notification."
                },
                {
                    num: "2.3 Security Deposit Security & Liquidation:",
                    body: "The security deposit serves as a financial guarantee for the Tenant's performance of contract terms. This balance shall be refunded within seven (7) business days following the formal handover and final vacating inspection, subject to the deduction of verified costs for non-fair wear-and-tear damages, outstanding utility balances, and structural restoration."
                }
            ]
        },
        {
            title: "SECTION 3: MAINTENANCE OBLIGATIONS & RESTORATION",
            clauses: [
                {
                    num: "3.1 Operational Division of Maintenance:",
                    body: "The financial and execution responsibility for property upkeep is divided into minor and major categories governed by a monetary threshold. The Tenant is solely responsible for minor, routine maintenance tasks whose cost falls below the agreed threshold. The Landlord is responsible for major maintenance, structural defects, and essential system repairs (including air conditioning compressor replacement, central plumbing, and main electrical grid issues) equal to or exceeding the threshold, provided such failures are not caused by Tenant misuse."
                },
                {
                    num: "3.2 Handover and End of Tenancy Cleaning:",
                    body: "Upon the expiration or legal termination of the tenancy, the Tenant shall return the premises in its original handover state, fair wear and tear excepted. The Tenant shall deliver a final utility clearance certificate along with paid professional tax invoices for comprehensive deep cleaning, painting, and air conditioning sanitation."
                }
            ]
        }
    ],

    page2Clauses: [
        {
            title: "SECTION 4: LEASE RENEWAL, TERMINATION & STATUTORY COMPLIANCE",
            clauses: [
                {
                    num: "4.1 Lease Renewal Terms & RERA Matrix:",
                    body: "Any contract renewal, structural modification of lease terms, or adjustment to the annual rent value must comply with the official RERA Rental Calculator guidelines and Decree No. (43) of 2013. Either party intending to modify or not renew the lease contract must serve a formal written notice to the other party at least ninety (90) days prior to the expiration date, pursuant to Article (14) of Dubai Law No. (26) of 2007."
                },
                {
                    num: "4.2 Legal Landlord Eviction Protocol:",
                    body: "Should the Landlord require the Tenant to vacate the premises upon expiry for reasons of personal use or property sale, the Landlord must serve a minimum twelve (12) months' formal statutory notice channeled via the Notary Public or Registered Mail, in strict accordance with Dubai Law No. (33) of 2008."
                },
                {
                    num: "4.3 Premises Inspection Access:",
                    body: "The Landlord and their authorized corporate representatives (White Caves Real Estate LLC) reserve the right to access the premises for routine structural inspections or necessary maintenance. This right is subject to a mandatory forty-eight (48) hours advance written notice, except in acute emergency scenarios."
                },
                {
                    num: "4.4 Property Marketing and Viewings:",
                    body: "During the final sixty (60) days of the tenancy term, the Tenant shall grant reasonable access to the Landlord or their designated broker for scheduled property viewings, subject to a forty-eight (48) hours pre-scheduling notice."
                },
                {
                    num: "4.5 Statutory Governance & Ejari:",
                    body: "This agreement is governed exclusively by the laws of the Emirate of Dubai. The Tenant bears the absolute responsibility for immediate Ejari registration via the Dubai Land Department portal. Any unresolved contractual disputes shall be referred directly to the Rental Disputes Settlement Centre (RDC) for formal adjudication."
                }
            ]
        }
    ],

    preambleText: "This Addendum forms an integral and legally binding part of the underlying Tenancy Contract executed between the Landlord and the Tenant for the Leased Premises specified herein. In the event of any conflict or ambiguity between the provisions of the main Tenancy Contract and this Addendum, the terms of this Addendum shall prevail. Both parties covenant to comply strictly with the statutory framework established by the Dubai Land Department (DLD) and the Real Estate Regulatory Agency (RERA).",

    acceptanceText: "The parties hereby explicitly declare that they have carefully read, comprehended, and unconditionally agreed to be legally bound by all terms, thresholds, and statutory guidelines defined within this Addendum and the core Tenancy Contract."
};
