import React from 'react';
import { pdf } from '@react-pdf/renderer';
import QuotationPDF from './QuotationPDF';
import EjariPDF from './EjariPDF';
import ViewingAgreementPDF from './ViewingAgreementPDF';
import AddendumPDF from './AddendumPDF';
import SalaryCertificatePDF from './SalaryCertificatePDF';
import InvoiceDocument from './InvoiceDocument';
import KeyHandoverDocument from './KeyHandoverDocument';
import { buildGeneratedCopyFileName, buildPdfFileName } from './pdfHelpers';
import { initialState as documentInitialState } from '../store/documentSlice';

const pickPdfComponent = (templateKey) => {
  if (templateKey === 'tenancy') return EjariPDF;
  if (templateKey === 'viewing') return ViewingAgreementPDF;
  if (templateKey === 'addendum') return AddendumPDF;
  if (templateKey === 'salaryCertificate') return SalaryCertificatePDF;
  if (templateKey === 'invoice') return InvoiceDocument;
  if (templateKey === 'keyHandover') return KeyHandoverDocument;
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
 * Download a blank / empty template PDF.
 *
 * Uses `documentSlice.initialState` as the document data so all
 * user-editable fields are at their factory defaults (empty strings / zeros).
 * The company block, DED licence, and landlord name are pre-filled from the
 * canonical values in `initialState` — operators only need to fill the
 * tenant-facing fields.
 *
 * @param {{ templateKey: string, templateLabel: string }} options
 */
export const downloadEmptyTemplate = async ({ templateKey, templateLabel }) => {
  const Component = pickPdfComponent(templateKey);
  if (!Component) {
    throw new Error(
      `No dedicated PDF renderer for template "${templateKey}". Empty template download blocked.`,
    );
  }

  const instance = pdf(
    React.createElement(Component, {
      documentData: documentInitialState,
      templateKey,
    }),
  );
  const blob = await instance.toBlob();
  const safeName = (templateLabel || templateKey).replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_');
  const fileName = `BLANK_${safeName}_TEMPLATE.pdf`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);

  return { blob, fileName };
};
