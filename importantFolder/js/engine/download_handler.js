/**
 * White Caves Real Estate - Independent Production Document Saving Engine
 * Triggers hardware file download only after PDF stamping verification is confirmed.
 */

window.DownloadHandler = {
    executeSecureDownload: function (structuredBlobUrl, customFileName) {
        if (!structuredBlobUrl) {
            alert("Download Blocked: Please process the PDF and verify that text inputs are stamped first.");
            return;
        }

        try {
            const hardwareAnchorLink = document.createElement("a");
            hardwareAnchorLink.href = structuredBlobUrl;
            hardwareAnchorLink.download = customFileName || "Filled_Unified_Tenancy_Contract_2026.pdf";

            document.body.appendChild(hardwareAnchorLink);
            hardwareAnchorLink.click();
            document.body.removeChild(hardwareAnchorLink);
        } catch (err) {
            alert("File system download error: " + err.message);
        }
    }
};

console.log("[DownloadHandler] Production PDF export handler ready.");
