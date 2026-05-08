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
const createTemplateSourceOfTruth = (governmentIssued) => ({
  immutable: true,
  governmentIssued,
  templateVersion: CURRENT_TEMPLATE_VERSION,
});

const createTemplateConfig = ({ key, label, component, supportsPdf, governmentIssued }) => ({
  key,
  label,
  component,
  supportsPdf,
  sourceOfTruth: createTemplateSourceOfTruth(governmentIssued),
});

export const TEMPLATE_CONFIG = [
  createTemplateConfig({
    key: 'viewing',
    label: 'Property Viewing Agreement (DLD/RERA P210)',
    component: ViewingFormTemplate,
    supportsPdf: true,
    governmentIssued: true,
  }),
  createTemplateConfig({
    key: 'booking',
    label: 'Booking Form (Standard Leasing)',
    component: BookingFormTemplate,
    supportsPdf: true,
    governmentIssued: false,
  }),
  createTemplateConfig({
    key: 'bookingGov',
    label: 'Government Office Leasing Quotation',
    component: GovtEmployeeBookingTemplate,
    supportsPdf: true,
    governmentIssued: true,
  }),
  createTemplateConfig({
    key: 'addendum',
    label: 'Standard Tenancy Addendum (RERA)',
    component: AddendumTemplate,
    supportsPdf: true,
    governmentIssued: true,
  }),
  createTemplateConfig({
    key: 'tenancy',
    label: 'Tenancy Contract (DLD Ejari)',
    component: TenancyContractTemplate,
    supportsPdf: true,
    governmentIssued: true,
  }),
  createTemplateConfig({
    key: 'invoice',
    label: 'Invoice',
    component: InvoiceTemplate,
    supportsPdf: true,
    governmentIssued: false,
  }),
  createTemplateConfig({
    key: 'keyHandover',
    label: 'Key Handover and Maintenance Confirmation',
    component: KeyHandoverMaintenanceTemplate,
    supportsPdf: true,
    governmentIssued: true,
  }),
  createTemplateConfig({
    key: 'offer',
    label: 'Property Offer Letter (Buying)',
    component: OfferLetterTemplate,
    supportsPdf: false,
    governmentIssued: false,
  }),
  createTemplateConfig({
    key: 'salaryCertificate',
    label: 'Salary Certificate',
    component: SalaryCertificateTemplate,
    supportsPdf: true,
    governmentIssued: true,
  }),
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
