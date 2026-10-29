// FILE: server/server.js
/**
 * White Caves Real Estate LLC - Document Intelligence Local Microservice
 * High-performance, local-first document extraction for Passports, Emirates IDs, and DLD Tenancy Contracts.
 * Zero mandatory database dependencies: pure memory & local state execution.
 */

// Process error safety guards to prevent worker/port unhandled crashes
process.on('unhandledRejection', (reason) => {
    console.warn('⚠️ [Server] Handled unhandled Promise rejection:', reason ? (reason.message || reason) : '');
});

process.on('uncaughtException', (err) => {
    console.error('⚠️ [Server] Handled uncaught exception:', err ? (err.message || err) : '');
});

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ExtractController = require('./controllers/extract_controller');
const SecurityConfig = require('./config/security_config');

const app = express();
const PORT = process.env.PORT || 3001;

// Memory storage for zero disk artifacts
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'White Caves Document Intelligence API',
        version: '1.0.0',
        architecture: 'Local-first Node.js Microservice',
        supportedDocuments: ['passport', 'emirates_id_front', 'emirates_id_back', 'tenancy_contract']
    });
});

// Document extraction endpoint
app.post('/api/extract', upload.single('document'), ExtractController.handleExtraction);

// Decryption endpoint for verified client sessions
app.post('/api/decrypt', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'Token required.' });
    try {
        const decrypted = SecurityConfig.decrypt(token);
        res.json({ success: true, decrypted: JSON.parse(decrypted) });
    } catch (e) {
        res.status(400).json({ success: false, error: 'Invalid or corrupted encryption token.' });
    }
});

app.listen(PORT, () => {
    console.log(`======================================================`);
    console.log(`🚀 White Caves Document Intelligence Microservice Online`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔍 Endpoints:`);
    console.log(`   - GET  /api/health`);
    console.log(`   - POST /api/extract  (multipart/form-data: document)`);
    console.log(`   - POST /api/decrypt  (json: token)`);
    console.log(`======================================================`);
});
