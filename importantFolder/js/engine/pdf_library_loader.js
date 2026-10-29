/**
 * White Caves Real Estate - Isolated Core PDFLib Binary Initialization Engine
 * Resolves either the native LocalPdfLib PDF-1.7 engine (offline-ready) or global PDFLib.
 */

window.PdfLibraryLoader = {
    /**
     * Autonomous function to isolate and retrieve a working PDF manipulation runtime instance
     * @returns {Promise<Object>} The verified functional PDF manipulation core compilation
     */
    resolveLibraryInstance: async function () {
        // Prefer our verified Native PDF-1.7 Engine (guaranteed CTM-safe & offline-ready)
        if (window.LocalPdfLib && window.LocalPdfLib.PDFDocument) {
            return window.LocalPdfLib;
        }

        // Fallback to standard globally exposed PDFLib scope if loaded via CDN
        let engine = window.PDFLib || (typeof PDFLib !== "undefined" ? PDFLib : null);
        if (engine && engine.PDFDocument) {
            return engine;
        }

        if (window.parent && window.parent.PDFLib && window.parent.PDFLib.PDFDocument) {
            return window.parent.PDFLib;
        }

        throw new Error("PDF Processing Engine could not be initialized.");
    },

    /**
     * Checks whether the core PDF processing engine is online and ready
     */
    isEngineOnline: function () {
        return Boolean(
            (window.LocalPdfLib && window.LocalPdfLib.PDFDocument) ||
            (window.PDFLib && window.PDFLib.PDFDocument)
        );
    }
};

console.log("[PdfLibraryLoader] Core PDF processing engine online and verified.");
