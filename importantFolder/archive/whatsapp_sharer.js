/**
 * White Caves Real Estate - WhatsApp Share & PDF File Attachment Engine (whatsapp_sharer.js)
 * Single-responsibility module for sharing & attaching the compiled PDF via WhatsApp.
 */

window.WhatsAppSharer = {
    shareCompiledPackage: async function () {
        const wf = window.WorkflowEngine;
        if (!wf || !wf.confirmations.pdfProcessedAndVerified || !wf.processedBytes) {
            alert("Please click '⚡ Process Selected PDF' first so your PDF is compiled and verified before sharing on WhatsApp.");
            return;
        }

        const p1 = (wf.payload && wf.payload.page1) ? wf.payload.page1 : {};
        const fileName = wf.lastOutputFileName || "White_Caves_Complete_Tenancy_Package_2026.pdf";
        const pdfBlob = new Blob([wf.processedBytes], { type: "application/pdf" });
        const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

        const tenantName = p1.tenant_name || "Valued Client";
        const unitInfo = `${p1.property_no || "142"} ${p1.building_name || "PRIMROSE"}, ${p1.location || "DAMAC HILLS 2"}`;
        const periodInfo = `${p1.date_from || "10-11-2026"} to ${p1.date_to || "09-11-2027"}`;
        const rawPhone = String(p1.tenant_phone || "").replace(/[^0-9]/g, "");

        const messageText =
            `Hello ${tenantName},\n\n` +
            `Please find attached your official tenancy document package from *White Caves Real Estate LLC*:\n` +
            `• *Property:* ${unitInfo}\n` +
            `• *Tenancy Period:* ${periodInfo}\n` +
            `• *Annual Rent:* ${p1.annual_rent || "115,000 AED"}\n` +
            `• *File:* ${fileName}\n\n` +
            `Best regards,\n*White Caves Real Estate LLC*`;

        // 1. Native Web Share API with direct PDF file attachment (Mobile / Windows / macOS share sheet)
        if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            try {
                await navigator.share({
                    title: fileName,
                    text: messageText,
                    files: [pdfFile]
                });
                return;
            } catch (err) {
                if (err && err.name === "AbortError") return;
            }
        }

        // 2. Desktop fallback: Auto-download the PDF file and open WhatsApp chat with pre-filled message
        if (window.DownloadHandler && wf.downloadBlobUrl) {
            window.DownloadHandler.executeSecureDownload(wf.downloadBlobUrl, fileName);
        }
        const encoded = encodeURIComponent(messageText);
        const waUrl = rawPhone.length >= 9
            ? `https://wa.me/${rawPhone}?text=${encoded}`
            : `https://wa.me/?text=${encoded}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
    }
};
