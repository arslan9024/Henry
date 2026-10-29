/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - DLD Unified Tenancy Contract PDF-lib Binary Stamper
 * Stamps the 24 official form fields on Page 1 and the 5 additional clause lines on Page 3.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function stampTenancyContractPdf({
  templateBytes = null,
  page1Payload = {},
  page3Payload = {},
  coordinates = {},
}) {
  let pdfDoc;

  if (templateBytes && templateBytes.byteLength > 0) {
    pdfDoc = await PDFDocument.load(templateBytes);
  } else {
    // Attempt to fetch the official template from local static route or fallback to blank pages
    try {
      const resp = await fetch('/importantFolder/Tenancy%20Contract%20Template.pdf');
      if (resp.ok) {
        const buf = await resp.arrayBuffer();
        pdfDoc = await PDFDocument.load(buf);
      } else {
        pdfDoc = await PDFDocument.create();
        pdfDoc.addPage([595, 842]); // Page 1
        pdfDoc.addPage([595, 842]); // Page 2
        pdfDoc.addPage([595, 842]); // Page 3
      }
    } catch {
      pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([595, 842]);
      pdfDoc.addPage([595, 842]);
      pdfDoc.addPage([595, 842]);
    }
  }

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();
  const page1 = pages[0] || pdfDoc.addPage([595, 842]);
  const page3 = pages[2] || (pages.length >= 2 ? pages[pages.length - 1] : pdfDoc.addPage([595, 842]));

  const coordsP1 = coordinates.page1 || {};
  const coordsP3 = coordinates.page3 || {};

  // 1. Stamp Page 1 Fields
  Object.keys(coordsP1).forEach((fieldKey) => {
    const coord = coordsP1[fieldKey];
    if (!coord) return;

    const val = page1Payload[fieldKey];
    if (val === undefined || val === null || val === '') return;

    if (coord.isTickMark) {
      page1.drawText('✓', {
        x: coord.x,
        y: coord.y,
        size: coord.size || 10,
        font: helveticaBold,
        color: rgb(0.12, 0.16, 0.24),
      });
      return;
    }

    page1.drawText(String(val), {
      x: coord.x,
      y: coord.y,
      size: coord.size || 8.5,
      font: helvetica,
      color: rgb(0.06, 0.09, 0.16),
    });
  });

  // 2. Stamp Page 3 Clauses
  Object.keys(coordsP3).forEach((clauseKey) => {
    const coord = coordsP3[clauseKey];
    if (!coord) return;

    const val = page3Payload[clauseKey];
    if (!val) return;

    page3.drawText(String(val), {
      x: coord.x,
      y: coord.y,
      size: coord.size || 7.5,
      font: helvetica,
      color: rgb(0.06, 0.09, 0.16),
    });
  });

  return await pdfDoc.save();
}
