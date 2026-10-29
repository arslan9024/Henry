// FILE: upload_config.js
/**
 * [Category 2: Data Config]
 * White Caves Real Estate - Step 1 Verification Documents Configuration (upload_config.js)
 * Pure static schema dictionary for Renewal vs New Tenancy Contract file uploads.
 * Zero operational code.
 */

window.UploadConfig = {
    renewalDocs: [
        {
            key: "old_contract",
            title: "Previous Tenancy Contract / Ejari",
            badge: "Required for Renewal",
            badgeColor: "#1d4ed8",
            accept: ".pdf,image/*",
            icon: "📄",
            hint: "Upload the existing or expiring Tenancy Contract / Ejari certificate (PDF or image).",
            helper: "Used for validating returning tenant record & property parameters."
        }
    ],

    newDocs: [
        {
            key: "emirates_id",
            title: "1. Emirates ID (Front & Back)",
            badge: "Required (KYC)",
            badgeColor: "#059669",
            accept: ".pdf,image/*",
            icon: "🪪",
            hint: "Upload valid UAE National / Resident ID copy (Front and Back).",
            helper: "Mandatory DLD/RERA identity verification for new lease."
        },
        {
            key: "residence_permit",
            title: "2. Residence Permit / Visa",
            badge: "Required (KYC)",
            badgeColor: "#059669",
            accept: ".pdf,image/*",
            icon: "🛂",
            hint: "Upload UAE Residence Visa, E-Visa, or Entry Permit copy.",
            helper: "Verifies lawful residency status under UAE immigration statutory rules."
        },
        {
            key: "passport",
            title: "3. Passport Copy",
            badge: "Required (KYC)",
            badgeColor: "#059669",
            accept: ".pdf,image/*",
            icon: "📘",
            hint: "Upload clear bio-data / information page of tenant's passport.",
            helper: "Required for Ejari registration & RERA system tenant profile."
        }
    ]
};

