import BookingFormTemplate from './BookingFormTemplate';
import ViewingFormTemplate from './ViewingFormTemplate';
import GovtEmployeeBookingTemplate from './GovtEmployeeBookingTemplate';
import AddendumTemplate from './AddendumTemplate';
import TenancyContractTemplate from './TenancyContractTemplate';
import InvoiceTemplate from './InvoiceTemplate';
import KeyHandoverMaintenanceTemplate from './KeyHandoverMaintenanceTemplate';
import OfferLetterTemplate from './OfferLetterTemplate';

export const TEMPLATE_CONFIG = [
  { key: 'viewing', label: 'Viewing Form', component: ViewingFormTemplate },
  { key: 'booking', label: 'Booking Form (Standard Leasing)', component: BookingFormTemplate },
  {
    key: 'bookingGov',
    label: 'Government Office Leasing Quotation',
    component: GovtEmployeeBookingTemplate,
  },
  { key: 'addendum', label: 'Addendum', component: AddendumTemplate },
  { key: 'tenancy', label: 'Tenancy Contract', component: TenancyContractTemplate },
  { key: 'invoice', label: 'Invoice', component: InvoiceTemplate },
  {
    key: 'keyHandover',
    label: 'Key Handover and Maintenance Confirmation',
    component: KeyHandoverMaintenanceTemplate,
  },
  {
    key: 'offer',
    label: 'Property Offer Letter (Buying)',
    component: OfferLetterTemplate,
  },
];

export const TEMPLATE_MAP = TEMPLATE_CONFIG.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {});
