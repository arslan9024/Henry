// FILE: server/controllers/extract_controller.js
/**
 * White Caves Real Estate - Document Extraction Orchestrator Controller
 * Coordinates Direct PDF Text Parsing, Image Preprocessing, Dual-Tier OCR,
 * Algorithmic MRZ/EID/Contract Parsing, and AES-256-GCM encryption.
 */

const ImagePreprocessor = require('../services/image_preprocessor');
const OcrEngine = require('../services/ocr_engine');
const MrzParser = require('../services/mrz_parser');
const EidParser = require('../services/eid_parser');
const ContractParser = require('../services/contract_parser');
const SecurityConfig = require('../config/security_config');

const ExtractController = {
    handleExtraction: async function (req, res) {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, error: 'No document file uploaded.' });
        }

        try {
            const rawBuffer = req.file.buffer;
            const originalName = req.file.originalname || '';
            const mimeType = req.file.mimetype || '';
            const requestedType = req.body.docType || 'auto';

            const isPdf = mimeType === 'application/pdf' ||
                originalName.toLowerCase().endsWith('.pdf') ||
                (rawBuffer.length >= 5 && rawBuffer.slice(0, 4).toString() === '%PDF');

            let text = '';
            let lines = [];
            let engineUsed = 'none';

            // -----------------------------------------------------------------
            // Branch 1: PDF Documents (Direct High-Speed Text Extraction)
            // -----------------------------------------------------------------
            if (isPdf) {
                try {
                    let pdfParseModule = null;
                    try {
                        pdfParseModule = require('pdf-parse');
                    } catch (e) {}

                    if (pdfParseModule) {
                        if (typeof pdfParseModule.PDFParse === 'function') {
                            const parser = new pdfParseModule.PDFParse({ data: rawBuffer });
                            const result = await parser.getText();
                            text = result.text || '';
                            await parser.destroy();
                        } else if (typeof pdfParseModule === 'function') {
                            const result = await pdfParseModule(rawBuffer);
                            text = result.text || '';
                        }
                    }

                    lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    engineUsed = 'pdf_parse_native';
                } catch (pdfErr) {
                    console.warn('[ExtractController] PDF direct text extraction warning:', pdfErr.message);
                }
            }

            // -----------------------------------------------------------------
            // Branch 2: Image Documents (Dual-Tier OCR: Vision -> Tesseract)
            // -----------------------------------------------------------------
            if (!text || (!isPdf && (requestedType === 'passport' || requestedType.includes('emirates_id')))) {
                if (!isPdf) {
                    const preprocessedBuffer = await ImagePreprocessor.preprocessForOcr(rawBuffer);
                    const ocrResult = await OcrEngine.recognizeText(preprocessedBuffer);
                    text = ocrResult.text || '';
                    lines = ocrResult.lines || [];
                    engineUsed = ocrResult.engineUsed || 'ocr';
                }
            }

            let docType = requestedType;
            let parsedData = null;

            // Step C: Auto-Classification and Algorithmic Parsing
            // 1. Check for Machine Readable Zone (Passport TD3 or EID Back TD1)
            const mrzData = MrzParser.parse(lines);
            if (mrzData && mrzData.isValid) {
                if (mrzData.mrzFormat === 'TD3') {
                    docType = 'passport';
                    parsedData = {
                        fullName: mrzData.fullName,
                        firstName: mrzData.firstName,
                        lastName: mrzData.lastName,
                        documentNumber: mrzData.documentNumber,
                        documentNumberMasked: SecurityConfig.mask(mrzData.documentNumber),
                        nationality: mrzData.nationality,
                        birthDate: mrzData.birthDate,
                        expiryDate: mrzData.expiryDate,
                        sex: mrzData.sex
                    };
                } else if (mrzData.mrzFormat === 'TD1') {
                    docType = 'emirates_id_back';
                    parsedData = {
                        documentNumber: mrzData.documentNumber,
                        documentNumberMasked: SecurityConfig.mask(mrzData.documentNumber),
                        birthDate: mrzData.birthDate,
                        expiryDate: mrzData.expiryDate,
                        nationality: mrzData.nationality,
                        sex: mrzData.sex
                    };
                }
            }

            // 2. Check for Emirates ID Front
            if (!parsedData && (docType === 'emirates_id_front' || /\b784[-\s]?\d{4}/.test(text) || /RESIDENT.*CARD/i.test(text))) {
                docType = 'emirates_id_front';
                const eid = EidParser.parse(text, lines);
                parsedData = {
                    fullName: eid.fullName,
                    idNumber: eid.idNumber,
                    idNumberMasked: SecurityConfig.mask(eid.idNumber),
                    nationality: eid.nationality,
                    expiryDate: eid.expiryDate
                };
            }

            // 3. Check for DLD Tenancy Contract
            if (!parsedData && (docType === 'tenancy_contract' || /TENANCY\s*CONTRACT|EJARI|DLD|عقد\s*إيجار/i.test(text) || isPdf)) {
                docType = 'tenancy_contract';
                parsedData = ContractParser.parse(text, lines);
            }

            // Fallback: Generic document
            if (!parsedData) {
                docType = 'generic_document';
                parsedData = { textExcerpt: text.substring(0, 500) };
            }

            // Step D: Secure Data Encryption Layer (AES-256-GCM)
            const sensitivePayload = {};
            if (parsedData.documentNumber) sensitivePayload.documentNumber = parsedData.documentNumber;
            if (parsedData.idNumber) sensitivePayload.idNumber = parsedData.idNumber;

            const encryptedToken = Object.keys(sensitivePayload).length > 0
                ? SecurityConfig.encrypt(JSON.stringify(sensitivePayload))
                : null;

            return res.json({
                success: true,
                documentType: docType,
                fileName: originalName,
                mimeType: mimeType,
                engineUsed: engineUsed,
                encryptedToken: encryptedToken,
                renewalDates: parsedData.renewalDates || null,
                data: parsedData
            });

        } catch (err) {
            console.error('[ExtractController] Processing Error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = ExtractController;
