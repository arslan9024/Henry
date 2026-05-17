import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { buildGeneratedCopyFileName, buildPdfFileName } from './pdfHelpers';
import { getTemplatePdfConfig } from '../templates/registry';

const createDownloadLink = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const generateQuotationPdfBlob = async ({ documentData, templateKey }) => {
  const { pdfComponent: renderer } = getTemplatePdfConfig(templateKey);
  if (!renderer) {
    throw new Error(
      `No dedicated PDF renderer for template "${templateKey}". Export blocked to preserve source design.`,
    );
  }

  const instance = pdf(
    React.createElement(renderer, {
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

  createDownloadLink(blob, fileName);
  return { blob, fileName };
};

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

export const downloadBlankTemplate = async (templateKey) => {
  const { pdfComponent: renderer, blankPdfLabel } = getTemplatePdfConfig(templateKey);
  if (!renderer) {
    throw new Error(
      `No PDF renderer available for template "${templateKey}". Cannot download blank template.`,
    );
  }

  const blob = await generateQuotationPdfBlob({ documentData: createBlankDocumentData(), templateKey });
  const fileName = `BLANK_${blankPdfLabel ?? templateKey}_Template.pdf`;
  createDownloadLink(blob, fileName);
};
