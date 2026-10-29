/**
 * White Caves Real Estate - Standalone Template Auto-Loader System
 * Automatically loads 'Tenancy Contract Template.pdf' from the root folder (via HTTP fetch
 * or local script cache on file:///) so the user never has to wait for manual upload.
 */

window.TemplateAutoLoader = {
    _LOCAL_TARGET_PATHWAY: "Tenancy Contract Template.pdf",
    detectedLocalBuffer: null,
    detectedFileName: "Tenancy Contract Template.pdf",

    /**
     * Converts a base64 string into an ArrayBuffer
     */
    base64ToArrayBuffer: function (base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    },

    /**
     * Automatically pulls 'Tenancy Contract Template.pdf' from the root folder into memory
     */
    tryExecuteAutomaticLoadPipeline: async function () {
        // 1. Try direct fetch from root folder first (when running via local/web server)
        try {
            const responseStream = await fetch(this._LOCAL_TARGET_PATHWAY);
            if (responseStream.ok) {
                const rawBytesArrayBuffer = await responseStream.arrayBuffer();
                if (rawBytesArrayBuffer && rawBytesArrayBuffer.byteLength > 0) {
                    this.detectedLocalBuffer = rawBytesArrayBuffer;
                    console.log(`[TemplateAutoLoader] Auto-loaded '${this._LOCAL_TARGET_PATHWAY}' via fetch (${rawBytesArrayBuffer.byteLength} bytes).`);
                    return true;
                }
            }
        } catch (fetchErr) {
            // Expected when opened directly via file:/// protocol
        }

        // 2. Fallback to root folder's pre-cached 'template_cache.js' bundle (works 100% on file:///)
        if (window.EmbeddedTemplateBase64 && window.EmbeddedTemplateBase64.length > 0) {
            try {
                const rawBytesArrayBuffer = this.base64ToArrayBuffer(window.EmbeddedTemplateBase64);
                if (rawBytesArrayBuffer && rawBytesArrayBuffer.byteLength > 0) {
                    this.detectedLocalBuffer = rawBytesArrayBuffer;
                    console.log(`[TemplateAutoLoader] Auto-loaded '${this._LOCAL_TARGET_PATHWAY}' from root folder cache (${rawBytesArrayBuffer.byteLength} bytes).`);
                    return true;
                }
            } catch (cacheErr) {
                console.warn("[TemplateAutoLoader] Failed decoding embedded template cache:", cacheErr);
            }
        }

        return false;
    }
};
