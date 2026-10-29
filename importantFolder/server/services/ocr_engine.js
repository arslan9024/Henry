// FILE: server/services/ocr_engine.js
/**
 * White Caves Real Estate - Dual-Tier Free OCR Engine
 * Primary Tier: Google Cloud Vision API (textDetection, Always Free 1,000 req/mo)
 * Fallback Tier: Tesseract.js Worker Pool (100% offline local memory execution)
 */

const path = require('path');
const serverDir = path.resolve(__dirname, '..');

let vision;
try {
    const visionModule = require('@google-cloud/vision');
    vision = new visionModule.ImageAnnotatorClient();
} catch (e) {
    // Expected when Google Cloud Vision credentials or module are not provided
}

let tesseract;
try {
    tesseract = require('tesseract.js');
} catch (e) {
    console.warn('[OcrEngine] tesseract.js not yet loaded.');
}

const OcrEngine = {
    /**
     * Executes dual-tier text detection on an image buffer.
     * @param {Buffer} imageBuffer - Preprocessed image buffer
     * @returns {Promise<{ text: string, lines: string[], engineUsed: string }>}
     */
    recognizeText: async function (imageBuffer) {
        if (!imageBuffer || !Buffer.isBuffer(imageBuffer) || imageBuffer.length < 16) {
            return { text: '', lines: [], engineUsed: 'none' };
        }

        // Safety: Do not pass PDF binaries to image OCR
        if (imageBuffer.slice(0, 4).toString() === '%PDF') {
            return { text: '', lines: [], engineUsed: 'pdf_skipped' };
        }

        // 1. Primary Layer: Google Cloud Vision API (if available and configured)
        if (vision && (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_API_KEY)) {
            try {
                const [result] = await vision.textDetection({ image: { content: imageBuffer } });
                const detections = result.textAnnotations;
                if (detections && detections.length > 0) {
                    const fullText = detections[0].description || '';
                    const lines = fullText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    return {
                        text: fullText,
                        lines: lines,
                        engineUsed: 'google_vision'
                    };
                }
            } catch (googleErr) {
                console.warn('[OcrEngine] Google Vision unavailable or quota cap reached. Falling back to local Tesseract.js:', googleErr.message);
            }
        }

        // 2. Fallback Layer: Tesseract.js Local Worker Pool (Safe Worker Lifecycle)
        if (tesseract) {
            let worker = null;
            try {
                if (typeof tesseract.createWorker === 'function') {
                    worker = await tesseract.createWorker('eng', 1, {
                        langPath: serverDir,
                        cachePath: serverDir,
                        gzip: false,
                        errorHandler: (err) => console.warn('[OcrEngine] Tesseract worker warning:', err ? err.message : '')
                    });
                    const ret = await worker.recognize(imageBuffer);
                    const cleanText = String(ret.data?.text || '');
                    const lines = cleanText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    await worker.terminate();
                    worker = null;
                    return {
                        text: cleanText,
                        lines: lines,
                        engineUsed: 'tesseract_local'
                    };
                } else if (typeof tesseract.recognize === 'function') {
                    const { data: { text } } = await tesseract.recognize(imageBuffer, 'eng', {
                        langPath: serverDir,
                        cachePath: serverDir,
                        gzip: false,
                        logger: () => {}
                    });
                    const cleanText = String(text || '');
                    const lines = cleanText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    return {
                        text: cleanText,
                        lines: lines,
                        engineUsed: 'tesseract_local'
                    };
                }
            } catch (tessErr) {
                console.warn('[OcrEngine] Local Tesseract.js OCR execution error (handled):', tessErr.message);
            } finally {
                if (worker && typeof worker.terminate === 'function') {
                    try { await worker.terminate(); } catch (e) {}
                }
            }
        }

        return { text: '', lines: [], engineUsed: 'failed' };
    }
};

module.exports = OcrEngine;
