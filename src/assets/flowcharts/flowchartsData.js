/**
 * [Category 5: Config / Schemas / Data]
 * White Caves Real Estate - Master Workflow Flowcharts Catalog
 * Pure data definitions for all 8 system blueprints & flowcharts (< 115 lines).
 */

export const WORKFLOW_FLOWCHARTS = [
  {
    id: 'conversation-compaction',
    title: '1. Evolution & Full Conversation Compaction',
    category: 'System Architecture',
    badge: 'Core History',
    filename: '01_conversation_compaction.svg',
    summary:
      'Chronological progression from legacy monolithic workspace to modern 5-way symmetrical studio cockpit.',
    stages: [
      'Legacy Workspace',
      'importantFolder Integration',
      'Feedback & Symmetrical Cockpit',
      '5-Way Modular Rule',
    ],
  },
  {
    id: '5way-category-architecture',
    title: '2. The 5-Way File Category & Single-Purpose Rule',
    category: 'Engineering Standards',
    badge: 'Code Isolation',
    filename: '02_5way_category_architecture.svg',
    summary:
      'Strict segregation of View (Cat 1), Logic (Cat 2), State (Cat 3), Services (Cat 4), and Config (Cat 5). Files <= 120 lines.',
    stages: [
      'Cat 1: View',
      'Cat 2: Logic / Hooks',
      'Cat 3: State',
      'Cat 4: Services / Storage',
      'Cat 5: Config / Schemas',
    ],
  },
  {
    id: 'tenancy-contract-flow',
    title: '3. Scenario 1: Tenancy Contract, RERA Addendum & Receipt',
    category: 'Leasing Workflows',
    badge: 'DLD Official',
    filename: '03_scenario1_tenancy_contract_addendum_receipt.svg',
    summary:
      '24 DLD coordinate fields, 5 statutory clauses, 1pt precision calibration, PDC cheque math, and VAT receipt.',
    stages: [
      'Input 24 Fields',
      'RERA Special Clauses',
      'Vector Canvas Calibration',
      'Verification Gates',
      'Export & Vault Save',
    ],
  },
  {
    id: 'kyc-identity-ingestion',
    title: '4. Scenario 2: KYC & Identity Ingestion (EID & Passport MRZ)',
    category: 'Identity & OCR',
    badge: 'Multilingual OCR',
    filename: '04_scenario2_kyc_identity_ingestion.svg',
    summary:
      'Client-side Tesseract OCR parsing Emirates ID front/back, Passport 2-line MRZ, and auto-populating active templates.',
    stages: [
      'Drop Scans',
      'Tesseract & MRZ Parser',
      'Redux State Sync',
      'Cross-Template Autofill',
      'Encrypted Vault Archive',
    ],
  },
  {
    id: 'title-deed-property-specs',
    title: '5. Scenario 3: Title Deed & Property Specs Ingestion',
    category: 'Property Verification',
    badge: 'DLD Registry',
    filename: '05_scenario3_title_deed_property_specs.svg',
    summary:
      'Extracting Title Deed #, Plot #, Municipality #, Community names, and cross-verifying ownership with DLD schema.',
    stages: [
      'Upload Deed Scan',
      'Deed Parser Engine',
      'DLD Schema Match',
      'Broadcast to Redux',
      'Pre-Flight Gate Lock',
    ],
  },
  {
    id: 'wps-sif-payroll-flow',
    title: '6. Scenario 4: WPS SIF Payroll Operations Flow',
    category: 'Human Resources',
    badge: 'MoHRE / CBUAE',
    filename: '06_scenario4_wps_sif_payroll.svg',
    summary:
      'MoHRE & Central Bank compliant SIF generator with 14-digit Labour ID validation and EOSG gratuity calculations.',
    stages: [
      'Employer & Bank Setup',
      'Employee Roster Validation',
      'MoHRE Rule Engine',
      'SIF Generation',
      'Batch Audit Hashing',
    ],
  },
  {
    id: 'universal-vault-diff',
    title: '7. Scenario 5: Universal Document Vault, Search & Diff Engine',
    category: 'Storage & Audit',
    badge: 'IndexedDB Vault',
    filename: '07_scenario5_universal_vault_diff.svg',
    summary:
      'In-browser persistent IndexedDB vault with full-text search, universal viewer modal, and side-by-side contract diffing.',
    stages: [
      'IndexedDB Retrieval',
      'Filter & Search',
      'Universal View Modal',
      'Side-by-Side Diff View',
      'Re-export & Share',
    ],
  },
  {
    id: 'adhoc-core-operations',
    title: '8. Scenario 6: Ad-Hoc Operations (Booking, Viewing, Handover)',
    category: 'Broker Operations',
    badge: 'Core Handover',
    filename: '08_scenario6_adhoc_core_operations.svg',
    summary:
      'Rapid preparation of booking deposits, viewing agreements, key handover protocols, and inspection checklists.',
    stages: [
      'Template Selection',
      'Shared Input Grids',
      'RERA Compliance Check',
      'Vector PDF Compilation',
      'WhatsApp Dispatch',
    ],
  },
];
