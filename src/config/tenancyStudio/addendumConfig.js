/**
 * [Category 2: Data Config]
 * White Caves Real Estate - 2-Page Official RERA Addendum Model & 25 Statutory Clauses
 * Matches the official White Caves 2-page Addendum layout.
 */

export const ADDENDUM_CONTENT_CONFIG = {
  preambleText:
    'This Addendum is entered into between the Landlord and the Tenant and forms an integral, legally binding part of the Dubai Land Department Unified Tenancy Contract. In the event of any conflict or ambiguity between the standard contract terms and this Addendum, the provisions herein shall strictly prevail to the maximum extent permitted by UAE Federal Law No. 26 of 2007 (as amended by Law No. 33 of 2008).',

  defaultParams: {
    property_address: 'Studio Apartment 404, Viridis A, Madinat Hind 4, Dubai',
    property_fitout_status: 'Fully Furnished Hotel Apartment',
    tenancy_commencement: '01-10-2026',
    tenancy_expiration: '30-09-2027',
    gross_annual_rent: 'AED 35,000',
    payment_frequency: 'Four (4) Installments (Cheque/Transfer)',
    refundable_security_deposit: 'AED 3,000',
    returned_cheque_penalty: 'AED 1,000 per event',
    minor_maintenance_threshold: 'Costs under AED 1,000',
    major_maintenance_threshold: 'Costs AED 1,000 and above',
    dewa_premises_no: '916058204',
    authorized_agency_fee: 'White Caves Real Estate LLC (Admin Fee: AED 1,500)',
    tenant_name: 'Ajas Paliakarkadu Fasal Fasaludheen Peerukutty',
    landlord_name: 'Hassen Soltani',
  },

  syncedFromStep1: [
    { key: 'property_address', label: 'Property Address (P1)' },
    { key: 'tenancy_commencement', label: 'Commencement (P1)' },
    { key: 'tenancy_expiration', label: 'Expiration (P1)' },
    { key: 'gross_annual_rent', label: 'Annual Rent (P1)' },
    { key: 'payment_frequency', label: 'Payment Frequency (P1)' },
    { key: 'refundable_security_deposit', label: 'Security Deposit (P1)' },
    { key: 'dewa_premises_no', label: 'DEWA Premise No (P1)' },
    { key: 'tenant_name', label: 'Tenant Signatory (P1)' },
    { key: 'landlord_name', label: 'Landlord Signatory (P1)' },
  ],

  sections: [
    {
      id: 'Fitout',
      chip: '1. Fit-Out Status',
      title: '1. Property Fit-Out Status',
      badge: 'Section 5 Table',
      fields: [
        {
          key: 'property_fitout_status',
          label: 'Property Fit-Out Status',
          options: ['Fully Furnished Hotel Apartment', 'Fully Furnished', 'Semi-furnished', 'Un-furnished'],
        },
      ],
    },
    {
      id: 'Penalties',
      chip: '2. Penalties & Admin Fees',
      title: '2. Penalties & Admin Fees',
      badge: 'Financial Terms',
      fields: [
        { key: 'returned_cheque_penalty', label: 'Returned Cheque Administrative Penalty' },
        { key: 'authorized_agency_fee', label: 'Authorized Real Estate Agency Admin Fee' },
      ],
    },
    {
      id: 'Maintenance',
      chip: '3. Maintenance Thresholds',
      title: '3. Maintenance Responsibilities & Thresholds',
      badge: 'Statutory Limits',
      fields: [
        { key: 'minor_maintenance_threshold', label: 'Tenant Minor Maintenance Scope' },
        { key: 'major_maintenance_threshold', label: 'Landlord Major Structural Threshold' },
      ],
    },
  ],

  // 25 Comprehensive RERA statutory clauses across 5 sections
  clauses: [
    {
      section: 'Section 1: General Tenancy Terms',
      items: [
        '1. The tenant agrees to use the premises strictly and exclusively for residential purposes and shall not sublet or share the premises without prior written consent of the Landlord.',
        '2. The tenant shall maintain the premises in good order and condition, subject to fair wear and tear.',
        '3. The tenant must abide by all Dubai Municipality, Civil Defense, and building community rules and regulations.',
        '4. The tenant is strictly prohibited from carrying out any structural alterations, major decorations, or drilling without written landlord authorization.',
        '5. The landlord or their authorized agent retains the right of inspection upon giving forty-eight (48) hours prior written notice.',
      ],
    },
    {
      section: 'Section 2: Payment, Cheques & Bank Returns',
      items: [
        '6. Rent payments must be made strictly on or before the due dates stated in the payment schedule.',
        '7. Any bounced or dishonored cheque shall incur an administrative fee as specified in the summary table.',
        '8. The replacement cheque or cash payment must be settled within seven (7) banking days following notice of dishonor.',
        '9. Persistent failure or refusal to honor rental cheques constitutes a material breach entitling the landlord to initiate eviction proceedings under Law No. 26 of 2007.',
        '10. The security deposit shall be held as security for the due observance of tenant obligations and refunded upon final checkout inspection minus applicable repairs or utility arrears.',
      ],
    },
    {
      section: 'Section 3: Maintenance & Utility Responsibilities',
      items: [
        '11. The tenant is responsible for minor routine maintenance repairs below the designated threshold value per occurrence.',
        '12. The landlord is responsible for major structural defects, MEP plant failures, and roof/leakage issues exceeding the maintenance threshold, provided they are not caused by tenant negligence.',
        '13. All utility services including DEWA, cooling/chiller fees, gas, internet, and district charges must be transferred to the tenant name or settled promptly.',
        '14. Proof of final utility clearance and Ejari cancellation must be produced at the expiration of tenancy prior to deposit release.',
        '15. The tenant must allow immediate access for emergency repairs affecting building safety or neighboring units.',
      ],
    },
    {
      section: 'Section 4: Renewal, Vacating & Termination',
      items: [
        '16. Notice of non-renewal or intent to amend tenancy contract terms must be delivered in writing at least ninety (90) days prior to contract expiry.',
        '17. Rental increases must strictly comply with the RERA Rental Calculator guidelines established under Dubai Decree No. 43 of 2013.',
        '18. If the tenant vacates prior to the agreed expiration date, an early termination penalty equivalent to two (2) months rent shall apply unless mutually agreed.',
        '19. The premises must be handed back in the original handover state, freshly repainted and professionally cleaned.',
        '20. Any tenant belongings left on the premises seven (7) days after handover shall be deemed abandoned.',
      ],
    },
    {
      section: 'Section 5: Governing Law & Jurisdiction',
      items: [
        '21. This Addendum and the underlying Tenancy Contract shall be governed exclusively by the laws of the Emirate of Dubai and applicable UAE Federal Laws.',
        '22. Any dispute arising out of or in connection with this agreement shall fall under the exclusive jurisdiction of the Rental Dispute Center (RDC) in Dubai.',
        '23. Both parties confirm having read, understood, and received a copy of this Addendum in full.',
        '24. Electronic or digital signatures appended to this Addendum shall have the same legal force and effect as original wet-ink signatures under UAE Federal Law No. 46 of 2021.',
        '25. This document is issued in duplicate, one copy retained by each party.',
      ],
    },
  ],
};
