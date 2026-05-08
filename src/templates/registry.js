import BookingFormTemplate from './BookingFormTemplate';
import ViewingFormTemplate from './ViewingFormTemplate';
import GovtEmployeeBookingTemplate from './GovtEmployeeBookingTemplate';
import AddendumTemplate from './AddendumTemplate';
import TenancyContractTemplate from './TenancyContractTemplate';
import InvoiceTemplate from './InvoiceTemplate';
import KeyHandoverMaintenanceTemplate from './KeyHandoverMaintenanceTemplate';
import OfferLetterTemplate from './OfferLetterTemplate';
import SalaryCertificateTemplate from './SalaryCertificateTemplate';

/** Single source-of-truth for the current template revision. */
const CURRENT_TEMPLATE_VERSION = '2026.04';

export const TEMPLATE_CONFIG = [
  {
    key: 'viewing',
    label: 'Property Viewing Agreement (DLD/RERA P210)',
    component: ViewingFormTemplate,
    supportsPdf: true,
    sourceOfTruth: {
      immutable: true,
      governmentIssued: true,
      templateVersion: CURRENT_TEMPLATE_VERSION,
    },
  },
  {
    key: 'booking',
    label: 'Booking Form (Standard Leasing)',
    component: BookingFormTemplate,
    supportsPdf: true,
    sourceOfTruth: {
      immutable: true,
      governmentIssued: false,
      templateVersion: CURRENT_TEMPLATE_VERSION,
    },
  },
  {
    key: 'bookingGov',
    label: 'Government Office Leasing Quotation',
    component: GovtEmployeeBookingTemplate,
    supportsPdf: true,
    sourceOfTruth: {
      immutable: true,
      governmentIssued: true,
      templateVersion: CURRENT_TEMPLATE_VERSION,
    },
  },
  {
    key: 'addendum',
    label: 'Standard Tenancy Addendum (RERA)',
    component: AddendumTemplate,
    supportsPdf: true,
    sourceOfTruth: {
      immutable: true,
      governmentIssued: true,
      templateVersion: CURRENT_TEMPLATE_VERSION,
    },
  },
  {
    key: 'tenancy',
    label: 'Tenancy Contract (DLD Ejari)',
    component: TenancyContractTemplate,
    supportsPdf: true,
    sourceOfTruth: {
      immutable: true,
      governmentIssued: true,
      templateVersion: CURRENT_TEMPLATE_VERSION,
    },
  },
  {
    key: 'invoice',
    label: 'Invoice',
    component: InvoiceTemplate,
    supportsPdf: true,
    sourceOfTruth: {
      immutable: true,
      governmentIssued: false,
      templateVersion: CURRENT_TEMPLATE_VERSION,
    },
  },
  {
    key: 'keyHandover',
    label: 'Key Handover and Maintenance Confirmation',
    component: KeyHandoverMaintenanceTemplate,
    supportsPdf: true,
    sourceOfTruth: {
      immutable: true,
      governmentIssued: true,
      templateVersion: CURRENT_TEMPLATE_VERSION,
    },
  },
  {
    key: 'offer',
    label: 'Property Offer Letter (Buying)',
    component: OfferLetterTemplate,
    supportsPdf: false,
    sourceOfTruth: {
      immutable: true,
      governmentIssued: false,
      templateVersion: CURRENT_TEMPLATE_VERSION,
    },
  },
  {
    key: 'salaryCertificate',
    label: 'Salary Certificate',
    component: SalaryCertificateTemplate,
    supportsPdf: true,
    sourceOfTruth: {
      immutable: true,
      governmentIssued: true,
      templateVersion: CURRENT_TEMPLATE_VERSION,
    },
  },
];

export const TEMPLATE_MAP = TEMPLATE_CONFIG.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {});

export const getTemplateSourcePolicy = (templateKey) => {
  const template = TEMPLATE_MAP[templateKey];
  const source = template?.sourceOfTruth || {};
  return {
    immutable: source.immutable !== false,
    governmentIssued: Boolean(source.governmentIssued),
    templateVersion: source.templateVersion || 'unknown',
  };
};
