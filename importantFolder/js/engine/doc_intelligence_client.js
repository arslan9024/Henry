// FILE: js/engine/doc_intelligence_client.js
/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - Document Intelligence Client Connector (doc_intelligence_client.js)
 * Connects the browser Studio with the local Node.js Document Intelligence microservice.
 * Gracefully falls back to client-side extraction if the microservice is offline.
 * Pure functional engine: zero DOM manipulation.
 */

window.DocIntelligenceClient = {
    SERVER_URL: "http://localhost:3001",
    _isOnline: null,

    /**
     * Pings the local microservice health endpoint.
     */
    checkHealth: async function () {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);
            const res = await fetch(`${this.SERVER_URL}/api/health`, { signal: controller.signal });
            clearTimeout(timeoutId);
            this._isOnline = res.ok;
            return res.ok;
        } catch (e) {
            this._isOnline = false;
            return false;
        }
    },

    /**
     * Sends document file to microservice or runs client-side fallback.
     */
    extractDocument: async function (file, docTypeHint = "auto") {
        if (!file) throw new Error("No file provided.");

        const isServerUp = await this.checkHealth();

        if (isServerUp) {
            try {
                const formData = new FormData();
                formData.append("document", file);
                formData.append("docType", docTypeHint);

                const res = await fetch(`${this.SERVER_URL}/api/extract`, {
                    method: "POST",
                    body: formData
                });

                if (res.ok) {
                    const json = await res.json();
                    return json;
                }
            } catch (serverErr) {
                console.warn("[DocIntelligenceClient] Remote call failed, using client fallback:", serverErr);
            }
        }

        // Client-Side Fallback for Tenancy Contracts and client-side processing
        if (window.ContractParserEngine) {
            const clientParsed = await window.ContractParserEngine.parseUploadedContract(file);
            return {
                success: true,
                documentType: "tenancy_contract",
                engineUsed: "client_pdfjs",
                fileName: file.name,
                data: clientParsed.extracted,
                renewalDates: clientParsed.renewalDates
            };
        }

        return { success: false, error: "Document intelligence engine unavailable." };
    }
};

