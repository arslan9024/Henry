import React from 'react';
import { pdf } from '@react-pdf/renderer';
import QuotationPDF from './QuotationPDF';
import EjariPDF from './EjariPDF';
import ViewingAgreementPDF from './ViewingAgreementPDF';
import AddendumPDF from './AddendumPDF';
import { buildPdfFileName } from './pdfHelpers';

const pickPdfComponent = (templateKey) => {
  if (templateKey === 'tenancy') return EjariPDF;
  if (templateKey === 'viewing') return ViewingAgreementPDF;
  if (templateKey === 'addendum') return AddendumPDF;
  return QuotationPDF;
};

export const generateQuotationPdfBlob = async ({ documentData, templateKey }) => {
  const Component = pickPdfComponent(templateKey);
  const instance = pdf(
    React.createElement(Component, {
      documentData,
      templateKey,
    }),
  );
  return instance.toBlob();
};

export const downloadQuotationPdf = async ({ documentData, templateKey }) => {
  const blob = await generateQuotationPdfBlob({ documentData, templateKey });
  const fileName = buildPdfFileName(templateKey, documentData);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);

  return { blob, fileName };
};
