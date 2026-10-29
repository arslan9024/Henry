// pdf_blueprint_canvas.js - Offline 1:1 Coordinate-Accurate DLD Vector Blueprint Fallback
function drawDldBlueprintFallback(canvas, pageNumber, dpr = 2) {
    canvas.width = Math.round(595 * dpr);
    canvas.height = Math.round(842 * dpr);
    canvas.style.width = "595px";
    canvas.style.height = "842px";

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 595, 842);

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 10px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("GOVERNMENT OF DUBAI", 28, 52);
    ctx.font = "bold 12px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("حكومة دبي", 28, 38);
    ctx.textAlign = "right";
    ctx.fillText("دائرة الأراضي والأملاك", 567, 38);
    ctx.font = "bold 10px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("Land Department", 567, 52);
    ctx.textAlign = "left";

    ctx.save();
    ctx.fillStyle = "rgba(226, 232, 240, 0.35)";
    ctx.font = "bold 46px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("E J A R I   إيـجـاري", 297, 440);
    ctx.restore();

    const drawSectionBar = (topY, titleEn, titleAr) => {
        ctx.fillStyle = "#252c50";
        ctx.fillRect(28, topY, 539, 20);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9.5px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(titleEn, 35, topY + 13.5);
        ctx.textAlign = "right";
        ctx.fillText(titleAr, 560, topY + 13.5);
        ctx.textAlign = "left";
    };

    const drawHalfDotted = (topY, labelEn, labelX, dotStartX, dotEndX, labelAr, arX = 562) => {
        ctx.fillStyle = "#334155";
        ctx.font = "8px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(labelEn, labelX, topY);
        if (labelAr) {
            ctx.textAlign = "right";
            ctx.fillText(labelAr, arX, topY);
            ctx.textAlign = "left";
        }
        ctx.save();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 0.7;
        ctx.setLineDash([1.5, 2]);
        ctx.beginPath();
        ctx.moveTo(dotStartX, topY + 1);
        ctx.lineTo(dotEndX, topY + 1);
        ctx.stroke();
        ctx.restore();
    };

    const drawDottedRow = (topY, labelEn, dotStartX, dotEndX, labelAr) =>
        drawHalfDotted(topY, labelEn, 34, dotStartX, dotEndX, labelAr, 562);

    if (pageNumber === 1) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 13px 'Segoe UI', Arial, sans-serif";
        ctx.fillText("عــقــد إيــجــار", 297, 98);
        ctx.font = "bold 12px 'Segoe UI', Arial, sans-serif";
        ctx.fillText("TENANCY CONTRACT", 297, 115);
        ctx.textAlign = "left";

        drawHalfDotted(119.8, "Date", 28, 48, 127, "التاريخ", 152);
        drawSectionBar(142, "Owner / Lessor Information", "معلومات المالك / المؤجر");
        ctx.strokeStyle = "#cbd5e1"; ctx.strokeRect(28, 162, 539, 140);
        drawDottedRow(179.0, "Owner's Name", 92, 522, "اسم المالك");
        drawDottedRow(201.2, "Lessor's Name", 92, 520, "اسم المؤجر");
        drawDottedRow(225.6, "Lessor's Emirates ID", 110, 485, "الهوية الإماراتية للمؤجر");
        drawHalfDotted(246.7, "License No.", 34, 83, 245, "رقم الرخصة", 290);
        drawHalfDotted(246.7, "Licensing Authority", 304, 382, 512, "سلطة الترخيص", 562);
        drawDottedRow(272.6, "Lessor's Email", 90, 485, "البريد الإلكتروني للمؤجر");
        drawDottedRow(293.6, "Lessor's Phone", 92, 504, "رقم هاتف المؤجر");

        drawSectionBar(312, "Tenant Information", "معلومات المستأجر");
        ctx.strokeRect(28, 332, 539, 120);
        drawDottedRow(349.3, "Tenant's Name", 92, 515, "اسم المستأجر");
        drawDottedRow(372.4, "Tenant's Emirates ID", 112, 480, "الهوية الإماراتية للمستأجر");
        drawHalfDotted(395.6, "License No.", 34, 82, 245, "رقم الرخصة", 290);
        drawHalfDotted(395.6, "Licensing Authority", 304, 382, 509, "سلطة الترخيص", 562);
        drawDottedRow(419.4, "Tenant's Email", 92, 483, "البريد الإلكتروني للمستأجر");
        drawDottedRow(441.5, "Tenant's Phone", 93, 497, "رقم هاتف المستأجر");

        drawSectionBar(461, "Property Information", "معلومات العقار");
        ctx.strokeRect(28, 481, 539, 120);
        ctx.fillStyle = "#334155"; ctx.font = "8px 'Segoe UI', Arial, sans-serif";
        ctx.fillText("Property Usage", 34, 499);
        ctx.fillText("○ Industrial صناعي", 150, 499);
        ctx.fillText("○ Commercial تجاري", 256, 499);
        ctx.fillText("○ Residential سكني", 368, 499);
        ctx.textAlign = "right"; ctx.fillText("استخدام العقار", 562, 499); ctx.textAlign = "left";

        drawHalfDotted(522.7, "Plot No.", 34, 70, 252, "رقم الأرض", 290);
        drawHalfDotted(522.7, "Makani No.", 304, 352, 523, "رقم مكاني", 562);
        drawHalfDotted(545.8, "Building Name", 34, 92, 252, "اسم المبنى", 290);
        drawHalfDotted(545.8, "Property No.", 304, 356, 523, "رقم العقار", 562);
        drawHalfDotted(568.8, "Property Type", 34, 90, 253, "نوع الوحدة", 290);
        drawHalfDotted(568.8, "Property Area (s.m)", 304, 378, 485, "مساحة العقار", 562);
        drawHalfDotted(591.8, "Location", 34, 72, 259, "الموقع", 290);
        drawHalfDotted(591.8, "Premises No. (DEWA)", 304, 386, 501, "رقم المبنى (ديوا)", 562);

        drawSectionBar(610, "Contract Information", "معلومات العقد");
        ctx.strokeRect(28, 630, 539, 75);
        drawHalfDotted(648.8, "Contract Period", 34, 94, 166, "", 166);
        drawHalfDotted(648.8, "To", 168, 178, 249, "فترة العقد", 290);
        drawHalfDotted(648.8, "Contract Value", 304, 363, 518, "قيمة العقد", 562);
        drawHalfDotted(673.9, "Annual Rent", 34, 82, 238, "الايجار السنوي", 290);
        drawHalfDotted(673.9, "Security Deposit Amount", 304, 399, 518, "مبلغ التأمين", 562);
        drawDottedRow(694.8, "Mode of Payment", 103, 515, "طريقة الدفع");

        drawSectionBar(714, "Signatures", "التوقيعات");
        ctx.strokeRect(28, 734, 539, 80);
        drawHalfDotted(806, "Tenant Signature", 34, 199, 267, "التاريخ Date", 195);
        drawHalfDotted(806, "Lessor's Signature", 308, 472, 540, "التاريخ Date", 468);
    } else if (pageNumber === 2) {
        drawSectionBar(87, "Terms and Conditions", "الأحكام و الشروط");
        ctx.strokeStyle = "#cbd5e1"; ctx.strokeRect(28, 107, 539, 595);
        ctx.fillStyle = "#334155"; ctx.font = "8px 'Segoe UI', Arial, sans-serif";
        for (let i = 1; i <= 14; i++) {
            ctx.fillText(`${i}. Standard DLD Unified Tenancy Contract Terms & Conditions Clause #${i} (Law No. 26 of 2007).`, 36, 95 + i * 38);
        }
        drawSectionBar(714, "Signatures", "التوقيعات");
        ctx.strokeRect(28, 734, 539, 80);
    } else if (pageNumber === 3) {
        drawSectionBar(87, "Know your Rights", "لمعرفة حقوق الأطراف");
        ctx.strokeStyle = "#cbd5e1"; ctx.strokeRect(28, 107, 539, 78);
        drawSectionBar(195, "Attachments for Ejari Registration", "مرفقات التسجيل في إيجاري");
        ctx.strokeRect(28, 215, 539, 55);
        drawSectionBar(278, "Additional Terms", "شروط إضافية");
        ctx.strokeRect(28, 298, 539, 150);
        [326.0, 351.0, 376.0, 401.2, 426.1].forEach((ty, i) => {
            drawDottedRow(ty, `${i + 1}.`, 54.7, 543.6, `.${i + 1}`);
        });
        drawSectionBar(684, "Signatures", "التوقيعات");
        ctx.strokeRect(28, 704, 539, 80);
    }
    ctx.restore();
}

