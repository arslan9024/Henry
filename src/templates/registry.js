import BookingFormTemplate from './BookingFormTemplate';
import ViewingFormTemplate from './ViewingFormTemplate';
import GovtEmployeeBookingTemplate from './GovtEmployeeBookingTemplate';
import AddendumTemplate from './AddendumTemplate';
import TenancyContractTemplate from './TenancyContractTemplate';
import InvoiceTemplate from './InvoiceTemplate';
import KeyHandoverMaintenanceTemplate from './KeyHandoverMaintenanceTemplate';
import OfferLetterTemplate from './OfferLetterTemplate';
import SalaryCertificateTemplate from './SalaryCertificateTemplate';

export const TEMPLATE_CONFIG = [
  {
    key: 'viewing',
    label: 'Property Viewing Agreement (DLD/RERA P210)',
    component: ViewingFormTemplate,
    supportsPdf: true,
  },
  {
    key: 'booking',
    label: 'Booking Form (Standard Leasing)',
    component: BookingFormTemplate,
    supportsPdf: true,
  },
  {
    key: 'bookingGov',
    label: 'Government Office Leasing Quotation',
    component: GovtEmployeeBookingTemplate,
    supportsPdf: true,
  },
  {
    key: 'addendum',
    label: 'Standard Tenancy Addendum (RERA)',
    component: AddendumTemplate,
    supportsPdf: true,
  },
  {
    key: 'tenancy',
    label: 'Tenancy Contract (DLD Ejari)',
    component: TenancyContractTemplate,
    supportsPdf: true,
  },
  { key: 'invoice', label: 'Invoice', component: InvoiceTemplate, supportsPdf: false },
  {
    key: 'keyHandover',
    label: 'Key Handover and Maintenance Confirmation',
    component: KeyHandoverMaintenanceTemplate,
    supportsPdf: false,
  },
  {
    key: 'offer',
    label: 'Property Offer Letter (Buying)',
    component: OfferLetterTemplate,
    supportsPdf: false,
  },
  {
    key: 'salaryCertificate',
    label: 'Salary Certificate',
    component: SalaryCertificateTemplate,
    supportsPdf: true,
  },
];

export const TEMPLATE_MAP = TEMPLATE_CONFIG.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {});
