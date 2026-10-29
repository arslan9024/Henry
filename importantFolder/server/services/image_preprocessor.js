// FILE: server/services/image_preprocessor.js
/**
 * White Caves Real Estate - Image Preprocessing Layer (sharp)
 * Cleans image artifacts, expands dynamic range, converts to grayscale, and sharpens edges
 * to maximize OCR accuracy on watermarked Emirates IDs and compressed mobile camera photos.
 */

let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.warn('[ImagePreprocessor] sharp module not loaded, using passthrough mode.');
}

const ImagePreprocessor = {
    /**
     * Preprocesses an image buffer for optimal OCR extraction.
     * @param {Buffer} inputBuffer - Raw image buffer
     * @returns {Promise<Buffer>} - Cleaned, high-contrast, sharpened image buffer
     */
    preprocessForOcr: async function (inputBuffer) {
        if (!sharp || !inputBuffer) return inputBuffer;

        try {
            const pipeline = sharp(inputBuffer)
                .rotate() // Auto-orient based on EXIF
                .grayscale() // Remove colored backgrounds and holographic watermarks
                .normalize() // Stretch dynamic luminance range
                .sharpen({
                    sigma: 1.2,
                    m1: 1.5,
                    m2: 2.5
                })
                .png({ compressionLevel: 6 });

            const processedBuffer = await pipeline.toBuffer();
            return processedBuffer;
        } catch (err) {
            console.warn('[ImagePreprocessor] Preprocessing failed, falling back to original buffer:', err.message);
            return inputBuffer;
        }
    }
};

module.exports = ImagePreprocessor;

