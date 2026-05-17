import BookingFormTemplate from './BookingFormTemplate';
import ViewingFormTemplate from './ViewingFormTemplate';
import GovtEmployeeBookingTemplate from './GovtEmployeeBookingTemplate';
import AddendumTemplate from './AddendumTemplate';
import TenancyContractTemplate from './TenancyContractTemplate';
import InvoiceTemplate from './InvoiceTemplate';
import KeyHandoverMaintenanceTemplate from './KeyHandoverMaintenanceTemplate';
import OfferLetterTemplate from './OfferLetterTemplate';
import SalaryCertificateTemplate from './SalaryCertificateTemplate';
import QuotationPDF from '../pdf/QuotationPDF';
import EjariPDF from '../pdf/EjariPDF';
import ViewingAgreementPDF from '../pdf/ViewingAgreementPDF';
import AddendumPDF from '../pdf/AddendumPDF';
import SalaryCertificatePDF from '../pdf/SalaryCertificatePDF';
import KeyHandoverPDF from '../pdf/KeyHandoverPDF';
import InvoiceDocument from '../pdf/InvoiceDocument';

const CURRENT_TEMPLATE_VERSION = '2026.04';

const createTemplateSourceOfTruth = (governmentIssued) => ({
  immutable: true,
  governmentIssued,
  templateVersion: CURRENT_TEMPLATE_VERSION,
});

const createTemplateConfig = ({
  key,
  label,
  component,
  governmentIssued,
  pdfComponent = null,
  blankPdfLabel = null,
}) => ({
  key,
  label,
  component,
  supportsPdf: Boolean(pdfComponent),
  pdfComponent,
  blankPdfLabel,
  sourceOfTruth: createTemplateSourceOfTruth(governmentIssued),
});

export const TEMPLATE_CONFIG = [
  createTemplateConfig({
    key: 'viewing',
    label: 'Property Viewing Agreement (DLD/RERA P210)',
    component: ViewingFormTemplate,
    governmentIssued: true,
    pdfComponent: ViewingAgreementPDF,
    blankPdfLabel: 'Viewing_Agreement_RERA_P210',
  }),
  createTemplateConfig({
    key: 'booking',
    label: 'Booking Form (Standard Leasing)',
    component: BookingFormTemplate,
    governmentIssued: false,
    pdfComponent: QuotationPDF,
    blankPdfLabel: 'Booking_Form',
  }),
  createTemplateConfig({
    key: 'bookingGov',
    label: 'Government Office Leasing Quotation',
    component: GovtEmployeeBookingTemplate,
    governmentIssued: true,
    pdfComponent: QuotationPDF,
    blankPdfLabel: 'Govt_Employee_Booking_Form',
  }),
  createTemplateConfig({
    key: 'addendum',
    label: 'Standard Tenancy Addendum (RERA)',
    component: AddendumTemplate,
    governmentIssued: true,
    pdfComponent: AddendumPDF,
    blankPdfLabel: 'Standard_Addendum_RERA',
  }),
  createTemplateConfig({
    key: 'tenancy',
    label: 'Tenancy Contract (DLD Ejari)',
    component: TenancyContractTemplate,
    governmentIssued: true,
    pdfComponent: EjariPDF,
    blankPdfLabel: 'Tenancy_Contract_DLD_Ejari',
  }),
  createTemplateConfig({
    key: 'invoice',
    label: 'Invoice',
    component: InvoiceTemplate,
    governmentIssued: false,
    pdfComponent: InvoiceDocument,
    blankPdfLabel: 'Invoice',
  }),
  createTemplateConfig({
    key: 'keyHandover',
    label: 'Key Handover and Maintenance Confirmation',
    component: KeyHandoverMaintenanceTemplate,
    governmentIssued: true,
    pdfComponent: KeyHandoverPDF,
    blankPdfLabel: 'Key_Handover_and_Maintenance_Confirmation',
  }),
  createTemplateConfig({
    key: 'offer',
    label: 'Property Offer Letter (Buying)',
    component: OfferLetterTemplate,
    governmentIssued: false,
  }),
  createTemplateConfig({
    key: 'salaryCertificate',
    label: 'Salary Certificate',
    component: SalaryCertificateTemplate,
    governmentIssued: true,
    pdfComponent: SalaryCertificatePDF,
    blankPdfLabel: 'Salary_Certificate',
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

export const getTemplatePdfConfig = (templateKey) => {
  const template = TEMPLATE_MAP[templateKey];
  if (!template) {
    return {
      supportsPdf: false,
      pdfComponent: null,
      blankPdfLabel: null,
    };
  }

  return {
    supportsPdf: template.supportsPdf,
    pdfComponent: template.pdfComponent,
    blankPdfLabel: template.blankPdfLabel || template.key,
  };
};
