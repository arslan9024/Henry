import React from 'react';
import { pdf } from '@react-pdf/renderer';
import QuotationPDF from './QuotationPDF';
import EjariPDF from './EjariPDF';
import ViewingAgreementPDF from './ViewingAgreementPDF';
import AddendumPDF from './AddendumPDF';
import SalaryCertificatePDF from './SalaryCertificatePDF';
import KeyHandoverPDF from './KeyHandoverPDF';
import { buildGeneratedCopyFileName, buildPdfFileName } from './pdfHelpers';

const pickPdfComponent = (templateKey) => {
  if (templateKey === 'tenancy') return EjariPDF;
  if (templateKey === 'viewing') return ViewingAgreementPDF;
  if (templateKey === 'addendum') return AddendumPDF;
  if (templateKey === 'salaryCertificate') return SalaryCertificatePDF;
  if (templateKey === 'keyHandover') return KeyHandoverPDF;
  if (templateKey === 'booking' || templateKey === 'bookingGov') return QuotationPDF;
  return null;
};

export const generateQuotationPdfBlob = async ({ documentData, templateKey }) => {
  const Component = pickPdfComponent(templateKey);
  if (!Component) {
    throw new Error(
      `No dedicated PDF renderer for template "${templateKey}". Export blocked to preserve source design.`,
    );
  }
  const instance = pdf(
    React.createElement(Component, {
      documentData,
      templateKey,
    }),
  );
  return instance.toBlob();
};

export const downloadQuotationPdf = async ({ documentData, templateKey, createdAt, copyNumber }) => {
  const blob = await generateQuotationPdfBlob({ documentData, templateKey });
  const baseFileName = buildPdfFileName(templateKey, documentData);
  const fileName = buildGeneratedCopyFileName(baseFileName, { createdAt, copyNumber });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);

  return { blob, fileName };
};

/**
 * Creates an empty document data object for blank template downloads.
 * Preserves White Caves company/landlord defaults but clears all
 * client-specific fields (property, tenant, payments, broker, etc.).
 */
const createBlankDocumentData = () => ({
  company: {
    name: 'White Caves Real Estate L.L.C',
    dedLicense: '1388443',
    role: 'Authorized Property Leasing Agent',
    city: 'Dubai',
  },
  property: {
    referenceNo: '',
    documentDate: '',
    unit: '',
    cluster: '',
    community: '',
    city: 'Dubai',
    description: '',
    size: '',
    parking: '',
    condition: '',
    usage: 'Residential',
    plotNo: '',
    makaniNo: '',
    dewaPremisesNo: '',
    projectName: '',
    buildingNumber: '',
    ownersAssociationNo: '',
    propertyStatus: '',
    parkingCount: 0,
    propertyType: '',
  },
  broker: {
    orn: '',
    companyName: 'White Caves Real Estate L.L.C',
    commercialLicenseNumber: '1388443',
    brokerName: '',
    brn: '',
    phone: '',
    mobile: '',
    address: 'Dubai, U.A.E.',
    email: '',
  },
  viewing: {
    agreementNumber: '',
    rentalBudget: '',
    additionalInfo: '',
    servicesNotes: '',
    viewingDate: '',
    viewingTime: '',
  },
  tenant: {
    fullName: '',
    emiratesId: '',
    idExpiryDate: '',
    contactNo: '',
    occupation: '',
    category: '',
    email: '',
    passportNo: '',
    address: '',
    poBox: '',
  },
  landlord: {
    name: 'MUHAMMAD NAEEM MUHAMMAD H K KHAN',
    emiratesId: '',
    idExpiryDate: '',
    iban: 'AE030359356491705358002',
    bank: 'First Abu Dhabi Bank (FAB)',
    swift: 'NBADAEAA',
    email: '',
    phone: '',
  },
  payments: {
    moveInDate: '',
    contractStartDate: '',
    contractEndDate: '',
    signingDeadline: '',
    annualRent: 0,
    securityDeposit: 0,
    agencyFee: 0,
    ejariFee: 0,
    total: 0,
    modeOfPayment: '',
  },
  renewal: {
    currentRent: 0,
    proposedRent: 0,
    marketRent: 0,
    renewalDate: '',
    noticeSentDate: '',
    noticeChannel: 'not-set',
  },
  occupancy: {
    isSharedHousing: false,
    sharedHousingPermitNumber: '',
    ejariOccupantsRegistered: false,
    occupants: '',
  },
  eviction: {
    reason: 'none',
    noticeDate: '',
    noticeMethod: 'notarized',
  },
  tenancy: {
    additionalTerms: [],
    specialConditions: '',
    maintenanceObligation: 'tenant-minor-landlord-major',
    subletAllowed: false,
    petsAllowed: false,
  },
  salaryCertificate: {
    employeeName: '',
    employeeId: '',
    designation: '',
    basicSalary: '',
    housingAllowance: '',
    transportAllowance: '',
    hrName: '',
    issuedTo: '',
    salaryInWords: '',
  },
});

/**
 * Download a blank (unfilled) version of a template as PDF.
 * Useful for staff circulation — keeps company letterhead but
 * has no client/property data pre-filled.
 */
export const downloadBlankTemplate = async (templateKey) => {
  const Component = pickPdfComponent(templateKey);
  if (!Component) {
    throw new Error(
      `No PDF renderer available for template "${templateKey}". Cannot download blank template.`,
    );
  }
  const emptyData = createBlankDocumentData();
  const blob = await generateQuotationPdfBlob({ documentData: emptyData, templateKey });
  const templateLabels = {
    viewing: 'Viewing_Agreement_RERA_P210',
    booking: 'Booking_Form',
    bookingGov: 'Govt_Employee_Booking_Form',
    tenancy: 'Tenancy_Contract_DLD_Ejari',
    addendum: 'Standard_Addendum_RERA',
    salaryCertificate: 'Salary_Certificate',
  };
  const fileName = `BLANK_${templateLabels[templateKey] ?? templateKey}_Template.pdf`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};
