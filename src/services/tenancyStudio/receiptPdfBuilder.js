/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - Agency Fee Payment Receipt PDF Binary Vector Builder
 * Uses pdf-lib to draw the official Agency Commission & 5% UAE VAT Receipt (Page 7).
 */

import { rgb } from 'pdf-lib';
import { RECEIPT_CONTENT_CONFIG } from '../../config/tenancyStudio/receiptConfig';

export function appendReceiptPage(pdfDoc, params = {}) {
  const p = { ...RECEIPT_CONTENT_CONFIG.defaultParams, ...params };
  if (!p.include_receipt) return;

  const page = pdfDoc.addPage([595, 842]);
  const leftX = 45;
  const boxW = 505;

  // 1. Mountain Brand Graphics (White Caves stylized geometry)
  page.drawText('WHITE CAVES REAL ESTATE LLC', {
    x: 350,
    y: 842 - 75,
    size: 9.0,
    color: rgb(0.72, 0.11, 0.11),
  });
  page.drawText('"Future Real Estate Buy And Sell With Confidence"', {
    x: 325,
    y: 842 - 88,
    size: 7.0,
    color: rgb(0.4, 0.45, 0.52),
  });

  // 2. Receipt Title
  page.drawText('Payment Receipt', {
    x: leftX,
    y: 842 - 125,
    size: 22,
    color: rgb(0.06, 0.09, 0.16),
  });
  page.drawLine({
    start: { x: leftX, y: 842 - 132 },
    end: { x: leftX + 180, y: 842 - 132 },
    thickness: 2,
    color: rgb(0.72, 0.11, 0.11),
  });

  // 3. Bill From / Bill To Container
  const boxTop = 155;
  const boxH = 95;
  const midX = 285;

  page.drawRectangle({
    x: leftX,
    y: 842 - (boxTop + boxH),
    width: boxW,
    height: boxH,
    borderWidth: 0.8,
    borderColor: rgb(0.7, 0.75, 0.82),
    color: rgb(0.98, 0.99, 1),
  });

  page.drawLine({
    start: { x: midX, y: 842 - boxTop },
    end: { x: midX, y: 842 - (boxTop + boxH) },
    thickness: 0.8,
    color: rgb(0.7, 0.75, 0.82),
  });

  // Bill From column
  page.drawText('Bill From:', {
    x: leftX + 10,
    y: 842 - (boxTop + 18),
    size: 8.5,
    color: rgb(0.45, 0.5, 0.6),
  });
  page.drawText(p.bill_from || 'White Caves Real Estate LLC', {
    x: leftX + 10,
    y: 842 - (boxTop + 36),
    size: 10,
    color: rgb(0.06, 0.09, 0.16),
  });
  page.drawText('RERA Lic. No. 34098 · ORN: 31088', {
    x: leftX + 10,
    y: 842 - (boxTop + 54),
    size: 8,
    color: rgb(0.35, 0.4, 0.5),
  });
  page.drawText(`Email: ${p.contact_email || 'the.white.caves@gmail.com'}`, {
    x: leftX + 10,
    y: 842 - (boxTop + 70),
    size: 8,
    color: rgb(0.35, 0.4, 0.5),
  });

  // To column
  page.drawText('Bill To (Tenant):', {
    x: midX + 10,
    y: 842 - (boxTop + 18),
    size: 8.5,
    color: rgb(0.45, 0.5, 0.6),
  });
  page.drawText(p.tenant_name || 'Valued Client', {
    x: midX + 10,
    y: 842 - (boxTop + 36),
    size: 10,
    color: rgb(0.06, 0.09, 0.16),
  });
  page.drawText(p.property_summary || 'Dubai Property Lease', {
    x: midX + 10,
    y: 842 - (boxTop + 54),
    size: 8,
    color: rgb(0.35, 0.4, 0.5),
  });

  // 4. Payment Line Items Table
  const tblTop = 275;
  const rowH = 26;
  const colSplitX = 180;
  const rows = [
    ['Payment Details', p.property_summary || 'Tenancy Brokerage Service'],
    ['Annual Rent Amount', p.rent_display || 'AED 0.00'],
    ['Agency Fee', p.agency_fee_display || '5% Brokerage Commission'],
    ['Total Settlement (incl. 5% UAE VAT)', p.total_display || 'AED 0.00'],
  ];

  const tblH = rowH * rows.length;
  page.drawRectangle({
    x: leftX,
    y: 842 - (tblTop + tblH),
    width: boxW,
    height: tblH,
    borderWidth: 0.8,
    borderColor: rgb(0.7, 0.75, 0.82),
  });

  page.drawLine({
    start: { x: colSplitX, y: 842 - tblTop },
    end: { x: colSplitX, y: 842 - (tblTop + tblH) },
    thickness: 0.8,
    color: rgb(0.7, 0.75, 0.82),
  });

  rows.forEach((r, idx) => {
    const ry = tblTop + idx * rowH;
    if (idx > 0) {
      page.drawLine({
        start: { x: leftX, y: 842 - ry },
        end: { x: leftX + boxW, y: 842 - ry },
        thickness: 0.8,
        color: rgb(0.7, 0.75, 0.82),
      });
    }

    const isTotal = idx === rows.length - 1;
    page.drawText(r[0], {
      x: leftX + 10,
      y: 842 - (ry + 17),
      size: isTotal ? 9.5 : 8.5,
      color: isTotal ? rgb(0.72, 0.11, 0.11) : rgb(0.2, 0.25, 0.35),
    });

    page.drawText(r[1], {
      x: colSplitX + 10,
      y: 842 - (ry + 17),
      size: isTotal ? 10 : 8.5,
      color: isTotal ? rgb(0.72, 0.11, 0.11) : rgb(0.06, 0.09, 0.16),
    });
  });

  // 5. Acknowledgment Statement
  const ackY = tblTop + tblH + 28;
  page.drawText('RECEIPT ACKNOWLEDGMENT', {
    x: leftX,
    y: 842 - ackY,
    size: 9.5,
    color: rgb(0.06, 0.09, 0.16),
  });

  page.drawText(
    p.acknowledgment_text ||
      'This receipt confirms that the agency fee has been received in full by White Caves Real Estate LLC.',
    {
      x: leftX,
      y: 842 - (ackY + 16),
      size: 8.5,
      color: rgb(0.3, 0.35, 0.45),
    },
  );

  // 6. Signatory and Stamps Block
  const sigY = ackY + 65;
  page.drawRectangle({
    x: leftX,
    y: 842 - (sigY + 70),
    width: 240,
    height: 70,
    borderWidth: 0.8,
    borderColor: rgb(0.7, 0.75, 0.82),
  });
  page.drawText('AUTHORIZED SIGNATORY & OFFICIAL STAMP', {
    x: leftX + 8,
    y: 842 - (sigY + 16),
    size: 7.5,
    color: rgb(0.4, 0.45, 0.55),
  });
  page.drawText(p.signatory_name || 'Arslan Malik', {
    x: leftX + 8,
    y: 842 - (sigY + 36),
    size: 9.5,
    color: rgb(0.06, 0.09, 0.16),
  });
  page.drawText('White Caves Real Estate LLC', {
    x: leftX + 8,
    y: 842 - (sigY + 52),
    size: 8,
    color: rgb(0.3, 0.35, 0.45),
  });

  // 7. Footer Contacts
  page.drawText(
    `Mobile: ${p.contact_mobile || '+971 56 361 6136'} · Office: Dubai, UAE · www.whitecaves.ae`,
    {
      x: leftX,
      y: 35,
      size: 7.5,
      color: rgb(0.5, 0.55, 0.65),
    },
  );
}
