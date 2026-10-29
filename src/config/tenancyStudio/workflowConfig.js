/**
 * [Category 2: Data Config]
 * White Caves Real Estate - 4-Phase Guided Journey Workflow Configuration
 */

export const STUDIO_WORKFLOW_STEPS = [
  {
    step: 1,
    id: 'deal-inputs',
    title: 'Deal & DLD Inputs',
    subtitle: '24 Official DLD Form Fields & Page 3 Clauses',
    icon: '📝',
  },
  {
    step: 2,
    id: 'visual-alignment',
    title: 'Visual Alignment',
    subtitle: 'Drag & Drop Canvas + 1pt Micro-Nudging',
    icon: '🎯',
  },
  {
    step: 3,
    id: 'rera-addendum',
    title: 'RERA Legal Addendum',
    subtitle: '25 Statutory Clauses & Signature Block',
    icon: '⚖️',
  },
  {
    step: 4,
    id: 'payment-receipt',
    title: 'Receipt & Compilation',
    subtitle: '5% Agency Fee + 5% VAT & 7-Page Package',
    icon: '📦',
  },
];

export const TOOLBOX_PDF_ENGINES = {
  PDF_LIB_STAMP: {
    id: 'pdf-lib-stamp',
    name: 'Binary Vector Stamping (pdf-lib)',
    description:
      'High-precision coordinate stamping onto official DLD blank template (Recommended for government submission)',
  },
  REACT_PDF_VECTOR: {
    id: 'react-pdf-vector',
    name: 'Declarative Vector (@react-pdf/renderer)',
    description: 'Crisp SVG/Vector generation with dynamic wrapping and Henry design system formatting',
  },
  COMBINED_BUNDLE: {
    id: 'combined-bundle',
    name: '7-Page Master Compilation',
    description: 'Compiles Contract (p.1-3) + RERA Addendum (p.4-6) + VAT Receipt (p.7) in one file',
  },
};

export const TOOLBOX_EXTRACTION_MODES = {
  CLIENT_OCR: {
    id: 'client-ocr',
    name: 'In-Browser Tesseract.js & Regex',
    description: 'Local browser-native text extraction with confidence scoring',
  },
  MRZ_PASSPORT_EID: {
    id: 'mrz-passport-eid',
    name: 'MRZ Parser (TD1 Emirates ID & TD3 Passport)',
    description: 'Algorithmic 2-line/3-line machine-readable zone decoding with date formatting',
  },
};

export const TOOLBOX_DOCUMENT_SCOPES = {
  FULL_PACKAGE: {
    id: 'full-package',
    name: 'Complete 7-Page Master Bundle',
    description: 'Contract (Pages 1-3) + Addendum (Pages 4-6) + Payment Receipt (Page 7)',
  },
  CONTRACT_ONLY: {
    id: 'contract-only',
    name: 'DLD Tenancy Contract Only',
    description: 'Pages 1-3 official Dubai Land Department Unified Lease agreement',
  },
  ADDENDUM_ONLY: {
    id: 'addendum-only',
    name: 'RERA Legal Addendum Only',
    description: 'Pages 4-6 supplementary 25-clause standard addendum',
  },
  RECEIPT_ONLY: {
    id: 'receipt-only',
    name: 'Brokerage Payment Receipt Only',
    description: 'Page 7 agency fee with 5% VAT calculation and transaction breakdown',
  },
};
