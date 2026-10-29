/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - 2-Page Official RERA Addendum PDF Binary Vector Builder
 * Uses pdf-lib to draw vector Addendum pages with statutory clauses, parameters table, and signature blocks.
 */

import { rgb } from 'pdf-lib';
import { ADDENDUM_CONTENT_CONFIG } from '../../config/tenancyStudio/addendumConfig';

export function wrapTextLines(text, maxChars = 105) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function appendAddendumPages(pdfDoc, params = {}) {
  const cfg = ADDENDUM_CONTENT_CONFIG;
  const p = { ...cfg.defaultParams, ...params };

  // Page 1: Statutory Clauses 1-3
  const page1 = pdfDoc.addPage([595, 842]);
  drawAddendumPage1(page1, cfg, p);

  // Page 2: Statutory Clauses 4-5 + Parameters Table + Signature Execution Block
  const page2 = pdfDoc.addPage([595, 842]);
  drawAddendumPage2(page2, cfg, p);
}

function drawAddendumPage1(page, cfg, _p) {
  const leftX = 45;
  let curTopY = 55;

  // Title
  page.drawText('ADDENDUM TO TENANCY CONTRACT', {
    x: 175,
    y: 842 - curTopY,
    size: 14,
    color: rgb(0.06, 0.09, 0.16),
  });

  curTopY += 22;

  // Preamble
  const preambleLines = wrapTextLines(cfg.preambleText, 105);
  preambleLines.forEach((ln) => {
    page.drawText(ln, {
      x: leftX,
      y: 842 - curTopY,
      size: 8.2,
      color: rgb(0.2, 0.25, 0.33),
    });
    curTopY += 11.5;
  });

  curTopY += 12;

  // Sections 1 to 3
  const sectionsToDraw = (cfg.clauses || []).slice(0, 3);
  sectionsToDraw.forEach((sec) => {
    // Section Header Box
    page.drawRectangle({
      x: leftX,
      y: 842 - (curTopY + 16),
      width: 505,
      height: 16,
      color: rgb(0.15, 0.17, 0.31),
    });

    page.drawText(sec.section, {
      x: leftX + 8,
      y: 842 - (curTopY + 11.5),
      size: 9,
      color: rgb(1, 1, 1),
    });

    curTopY += 22;

    sec.items.forEach((item) => {
      const wrapped = wrapTextLines(item, 106);
      wrapped.forEach((line) => {
        page.drawText(line, {
          x: leftX + 6,
          y: 842 - curTopY,
          size: 7.8,
          color: rgb(0.12, 0.15, 0.2),
        });
        curTopY += 10.5;
      });
      curTopY += 4;
    });

    curTopY += 6;
  });

  // Footer
  page.drawText('White Caves Real Estate LLC · RERA Addendum · Page 1 of 2', {
    x: leftX,
    y: 35,
    size: 7.5,
    color: rgb(0.5, 0.55, 0.65),
  });
}

function drawAddendumPage2(page, cfg, p) {
  const leftX = 45;
  let curTopY = 55;

  // Title
  page.drawText('ADDENDUM TO TENANCY CONTRACT (CONTINUED)', {
    x: 145,
    y: 842 - curTopY,
    size: 13,
    color: rgb(0.06, 0.09, 0.16),
  });

  curTopY += 20;

  // Sections 4 & 5
  const remainingSections = (cfg.clauses || []).slice(3, 5);
  remainingSections.forEach((sec) => {
    page.drawRectangle({
      x: leftX,
      y: 842 - (curTopY + 16),
      width: 505,
      height: 16,
      color: rgb(0.15, 0.17, 0.31),
    });

    page.drawText(sec.section, {
      x: leftX + 8,
      y: 842 - (curTopY + 11.5),
      size: 9,
      color: rgb(1, 1, 1),
    });

    curTopY += 22;

    sec.items.forEach((item) => {
      const wrapped = wrapTextLines(item, 106);
      wrapped.forEach((line) => {
        page.drawText(line, {
          x: leftX + 6,
          y: 842 - curTopY,
          size: 7.6,
          color: rgb(0.12, 0.15, 0.2),
        });
        curTopY += 10;
      });
      curTopY += 3;
    });

    curTopY += 6;
  });

  // Section 6: Specific Tenancy Parameters Table
  page.drawRectangle({
    x: leftX,
    y: 842 - (curTopY + 16),
    width: 505,
    height: 16,
    color: rgb(0.15, 0.17, 0.31),
  });
  page.drawText('SPECIFIC TENANCY PARAMETERS & PARTICULARS', {
    x: leftX + 8,
    y: 842 - (curTopY + 11.5),
    size: 9,
    color: rgb(1, 1, 1),
  });

  curTopY += 20;

  const paramRows = [
    ['Property Address:', p.property_address || ''],
    ['Property Fit-Out Status:', p.property_fitout_status || ''],
    ['Gross Annual Rent:', p.gross_annual_rent || ''],
    ['Payment Schedule / Cheques:', p.payment_frequency || ''],
    ['Refundable Security Deposit:', p.refundable_security_deposit || ''],
    ['Returned Cheque Admin Penalty:', p.returned_cheque_penalty || 'AED 1,000 per event'],
    ['Minor Maintenance (Tenant):', p.minor_maintenance_threshold || 'Under AED 1,000'],
    ['Major Maintenance (Landlord):', p.major_maintenance_threshold || 'AED 1,000 and above'],
  ];

  const rowHeight = 14;
  paramRows.forEach((r, idx) => {
    const rowY = curTopY + idx * rowHeight;
    page.drawRectangle({
      x: leftX,
      y: 842 - (rowY + rowHeight),
      width: 505,
      height: rowHeight,
      borderWidth: 0.5,
      borderColor: rgb(0.7, 0.75, 0.82),
      color: idx % 2 === 0 ? rgb(0.97, 0.98, 0.99) : rgb(1, 1, 1),
    });

    page.drawText(r[0], {
      x: leftX + 6,
      y: 842 - (rowY + 10),
      size: 7.5,
      color: rgb(0.2, 0.25, 0.35),
    });

    page.drawText(r[1], {
      x: leftX + 210,
      y: 842 - (rowY + 10),
      size: 7.5,
      color: rgb(0.06, 0.09, 0.16),
    });
  });

  curTopY += paramRows.length * rowHeight + 18;

  // Execution & Signature Blocks
  const sigBoxW = 245;
  const sigBoxH = 65;

  // Landlord Signature Box
  page.drawRectangle({
    x: leftX,
    y: 842 - (curTopY + sigBoxH),
    width: sigBoxW,
    height: sigBoxH,
    borderWidth: 0.8,
    borderColor: rgb(0.3, 0.35, 0.45),
  });
  page.drawText('FIRST PARTY (LANDLORD)', {
    x: leftX + 8,
    y: 842 - (curTopY + 14),
    size: 8.5,
    color: rgb(0.06, 0.09, 0.16),
  });
  page.drawText(`Name: ${p.landlord_name || ''}`, {
    x: leftX + 8,
    y: 842 - (curTopY + 28),
    size: 7.5,
    color: rgb(0.2, 0.25, 0.35),
  });
  page.drawText('Signature: _______________________', {
    x: leftX + 8,
    y: 842 - (curTopY + 50),
    size: 7.5,
    color: rgb(0.4, 0.45, 0.55),
  });

  // Tenant Signature Box
  const tenantX = leftX + sigBoxW + 15;
  page.drawRectangle({
    x: tenantX,
    y: 842 - (curTopY + sigBoxH),
    width: sigBoxW,
    height: sigBoxH,
    borderWidth: 0.8,
    borderColor: rgb(0.3, 0.35, 0.45),
  });
  page.drawText('SECOND PARTY (TENANT)', {
    x: tenantX + 8,
    y: 842 - (curTopY + 14),
    size: 8.5,
    color: rgb(0.06, 0.09, 0.16),
  });
  page.drawText(`Name: ${p.tenant_name || ''}`, {
    x: tenantX + 8,
    y: 842 - (curTopY + 28),
    size: 7.5,
    color: rgb(0.2, 0.25, 0.35),
  });
  page.drawText('Signature: _______________________', {
    x: tenantX + 8,
    y: 842 - (curTopY + 50),
    size: 7.5,
    color: rgb(0.4, 0.45, 0.55),
  });

  // Footer
  page.drawText('White Caves Real Estate LLC · RERA Addendum · Page 2 of 2', {
    x: leftX,
    y: 35,
    size: 7.5,
    color: rgb(0.5, 0.55, 0.65),
  });
}
