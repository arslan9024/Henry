/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - Master Multi-Document Package Compiler
 * Orchestrates:
 *   1. Stamping of DLD Unified Contract (Pages 1-3)
 *   2. Appending of RERA Legal Addendum (Pages 4-5)
 *   3. Appending of Payment Receipt (Page 6)
 * Produces unified or selective binary PDF blobs.
 */

import { PDFDocument } from 'pdf-lib';
import { stampTenancyContractPdf } from './tenancyPdfStamper';
import { appendAddendumPages } from './addendumPdfBuilder';
import { appendReceiptPage } from './receiptPdfBuilder';

export function calculateVatAndFee({ annualRent = 0, agencyFeePct = 5 }) {
  const numericRent = parseFloat(String(annualRent).replace(/[^\d.]/g, '')) || 0;
  const pct = parseFloat(String(agencyFeePct).replace(/[^\d.]/g, '')) || 5;

  const feeAmount = (numericRent * pct) / 100;
  const vatAmount = (feeAmount * 5) / 100;
  const totalAmount = feeAmount + vatAmount;

  return {
    annualRentFormatted: `${numericRent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`,
    agencyFeeFormatted: `${pct}% (Amount = ${feeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED)`,
    vatFormatted: `${vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`,
    totalFormatted: `${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED (Including 5% VAT)`,
    feeAmount,
    vatAmount,
    totalAmount,
  };
}

export async function compileTenancyPackage({
  scope = 'full-package',
  templateBytes = null,
  page1Payload = {},
  page3Payload = {},
  coordinates = {},
  addendumParams = {},
  receiptParams = {},
}) {
  if (scope === 'addendum-only') {
    const doc = await PDFDocument.create();
    appendAddendumPages(doc, addendumParams);
    const bytes = await doc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  if (scope === 'receipt-only') {
    const doc = await PDFDocument.create();
    appendReceiptPage(doc, receiptParams);
    const bytes = await doc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  // 1. Stamp Contract (Pages 1-3)
  const stampedBytes = await stampTenancyContractPdf({
    templateBytes,
    page1Payload,
    page3Payload,
    coordinates,
  });

  if (scope === 'contract-only') {
    return new Blob([stampedBytes], { type: 'application/pdf' });
  }

  // 2. Full 7-Page Master Compilation: Load stamped contract and append Addendum + Receipt
  const masterDoc = await PDFDocument.load(stampedBytes);

  // Append Addendum (Pages 4 & 5)
  appendAddendumPages(masterDoc, addendumParams);

  // Append Receipt (Page 6)
  if (receiptParams.include_receipt !== false) {
    appendReceiptPage(masterDoc, receiptParams);
  }

  const finalBytes = await masterDoc.save();
  return new Blob([finalBytes], { type: 'application/pdf' });
}
