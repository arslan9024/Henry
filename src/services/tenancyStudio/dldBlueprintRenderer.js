/**
 * [Category 5: Processing Engine]
 * Offline 1:1 Coordinate-Accurate DLD Vector Blueprint Canvas Renderer
 * Renders the official DLD Unified Tenancy Contract header, watermark, section bars,
 * and dotted lines on HTML5 Canvas with HiDPI support.
 */

export function renderDldBlueprint(canvas, pageNumber = 1, dpr = 2) {
  if (!canvas) return;

  canvas.width = Math.round(595 * dpr);
  canvas.height = Math.round(842 * dpr);
  canvas.style.width = '595px';
  canvas.style.height = '842px';

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 595, 842);

  // Government Header
  ctx.fillStyle = '#1e293b';
  ctx.font = "bold 10px 'Segoe UI', Arial, sans-serif";
  ctx.fillText('GOVERNMENT OF DUBAI', 28, 52);
  ctx.font = "bold 12px 'Segoe UI', Arial, sans-serif";
  ctx.fillText('حكومة دبي', 28, 38);

  ctx.textAlign = 'right';
  ctx.fillText('دائرة الأراضي والأملاك', 567, 38);
  ctx.font = "bold 10px 'Segoe UI', Arial, sans-serif";
  ctx.fillText('Land Department', 567, 52);
  ctx.textAlign = 'left';

  // Ejari Watermark
  ctx.save();
  ctx.fillStyle = 'rgba(226, 232, 240, 0.35)';
  ctx.font = 'bold 46px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('E J A R I   إيـجـاري', 297, 440);
  ctx.restore();

  const drawSectionBar = (topY, titleEn, titleAr) => {
    ctx.fillStyle = '#252c50';
    ctx.fillRect(28, topY, 539, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 9.5px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(titleEn, 35, topY + 13.5);
    ctx.textAlign = 'right';
    ctx.fillText(titleAr, 560, topY + 13.5);
    ctx.textAlign = 'left';
  };

  const drawDottedLine = (topY, labelEn, labelX, dotStartX, dotEndX, labelAr, arX = 562) => {
    ctx.fillStyle = '#334155';
    ctx.font = "8px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(labelEn, labelX, topY);
    if (labelAr) {
      ctx.textAlign = 'right';
      ctx.fillText(labelAr, arX, topY);
      ctx.textAlign = 'left';
    }
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.7;
    ctx.setLineDash([1.5, 2]);
    ctx.beginPath();
    ctx.moveTo(dotStartX, topY + 1);
    ctx.lineTo(dotEndX, topY + 1);
    ctx.stroke();
    ctx.restore();
  };

  if (pageNumber === 1) {
    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = "bold 13px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('UNIFIED TENANCY CONTRACT / عقد الإيجار الموحد', 297, 84);
    ctx.textAlign = 'left';

    drawDottedLine(118, 'Contract Date:', 28, 95, 230, 'تاريخ العقد:', 562);

    // Section 1: Landlord & Tenant
    drawSectionBar(134, '1. LANDLORD & TENANT INFORMATION', 'بيانات المؤجر والمستأجر .1');
    drawDottedLine(177, "Owner's Name:", 28, 95, 500, 'اسم المالك:');
    drawDottedLine(199, "Lessor's Name:", 28, 95, 500, 'اسم المؤجر:');
    drawDottedLine(224, "Lessor's ID/Pass:", 28, 115, 260, 'رقم الهوية/الجواز:');
    drawDottedLine(271, "Lessor's Email:", 28, 95, 260, 'البريد الإلكتروني:');
    drawDottedLine(292, "Lessor's Phone:", 28, 95, 260, 'رقم الهاتف:');

    drawDottedLine(347, "Tenant's Name:", 28, 95, 500, 'اسم المستأجر:');
    drawDottedLine(370, "Tenant's ID/Pass:", 28, 115, 260, 'رقم الهوية/الجواز:');
    drawDottedLine(417, "Tenant's Email:", 28, 95, 260, 'البريد الإلكتروني:');
    drawDottedLine(439, "Tenant's Phone:", 28, 95, 260, 'رقم الهاتف:');

    // Section 2: Property
    drawSectionBar(462, '2. PROPERTY INFORMATION', 'بيانات العقار .2');
    drawDottedLine(521, 'Plot No.:', 28, 75, 260, 'رقم الأرض:');
    drawDottedLine(544, 'Building Name:', 28, 95, 260, 'اسم المبنى:');
    drawDottedLine(544, 'Property No.:', 285, 360, 500, 'رقم العقار:');
    drawDottedLine(567, 'Property Type:', 28, 95, 260, 'نوع العقار:');
    drawDottedLine(567, 'Property Area:', 285, 360, 500, 'مساحة العقار:');
    drawDottedLine(590, 'Location:', 28, 75, 260, 'الموقع:');
    drawDottedLine(590, 'Premises (DEWA):', 285, 385, 500, 'رقم المبنى ديوا:');

    // Section 3: Contract Terms
    drawSectionBar(615, '3. CONTRACT DETAILS & PAYMENTS', 'تفاصيل العقد والدفعات .3');
    drawDottedLine(647, 'From Date:', 28, 95, 175, 'من تاريخ:');
    drawDottedLine(647, 'To Date:', 180, 220, 290, 'إلى تاريخ:');
    drawDottedLine(647, 'Contract Value:', 295, 370, 500, 'قيمة العقد:');
    drawDottedLine(672, 'Annual Rent:', 28, 85, 260, 'الإيجار السنوي:');
    drawDottedLine(672, 'Security Deposit:', 285, 380, 500, 'مبلغ التأمين:');
    drawDottedLine(693, 'Mode of Payment:', 28, 105, 260, 'طريقة السداد:');
  } else if (pageNumber === 3) {
    // Page 3: Additional Terms
    ctx.fillStyle = '#0f172a';
    ctx.font = "bold 13px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('ADDITIONAL TERMS & CONDITIONS / شروط وأحكام إضافية', 297, 84);
    ctx.textAlign = 'left';

    drawSectionBar(134, 'ADDITIONAL CLAUSES & SPECIAL CONDITIONS', 'بنود إضافية وشروط خاصة');

    for (let i = 0; i < 5; i++) {
      const lineY = 324 + i * 25;
      drawDottedLine(lineY, `Clause Line ${i + 1}:`, 28, 110, 500, `البند ${i + 1}:`);
    }
  }

  // Footer Branding
  ctx.fillStyle = '#64748b';
  ctx.font = "italic 7.5px 'Segoe UI', Arial, sans-serif";
  ctx.fillText('White Caves Real Estate LLC · Official DLD Calibration Studio Engine', 28, 822);
  ctx.textAlign = 'right';
  ctx.fillText(`Page ${pageNumber} of 3`, 567, 822);
  ctx.textAlign = 'left';

  ctx.restore();
}
