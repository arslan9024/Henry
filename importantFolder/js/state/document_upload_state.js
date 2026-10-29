// FILE: document_upload_state.js
/**
 * [Category 3: Values State]
 * White Caves Real Estate - Uploaded Verification Files Live State (document_upload_state.js)
 * Tracks uploaded file streams, metadata, and validation in live RAM memory.
 * Pure state module: does not touch external DOM nodes directly.
 */

window.DocumentUploadState = {
    files: {
        old_contract: null,
        emirates_id: null,
        residence_permit: null,
        passport: null
    },

    setFile: function (key, file) {
        if (!file) return;
        this.files[key] = {
            name: file.name,
            size: file.size,
            sizeFormatted: (file.size / 1024).toFixed(1) + " KB",
            type: file.type || "application/octet-stream",
            lastModified: file.lastModified,
            fileRef: file
        };
    },

    removeFile: function (key) {
        this.files[key] = null;
    },

    getFile: function (key) {
        return this.files[key] || null;
    },

    hasFile: function (key) {
        return !!this.files[key];
    },

    getSummary: function (mode) {
        const isRenewal = mode === "RENEWAL";
        const requiredKeys = isRenewal
            ? ["old_contract"]
            : ["emirates_id", "residence_permit", "passport"];

        const uploadedCount = requiredKeys.filter(k => !!this.files[k]).length;
        const totalRequired = requiredKeys.length;

        return {
            mode: mode,
            uploadedCount: uploadedCount,
            totalRequired: totalRequired,
            isComplete: uploadedCount === totalRequired,
            requiredKeys: requiredKeys
        };
    }
};

