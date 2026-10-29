// FILE: server/config/security_config.js
/**
 * White Caves Real Estate - Secure Data Encryption Layer (AES-256-GCM)
 * Encrypts and decrypts high-sensitivity document values (Passport No, Emirates ID No)
 * using Node.js native crypto module with zero external dependencies.
 */

const crypto = require('crypto');

// 32-character encryption key (256 bits)
const RAW_KEY = process.env.ENCRYPTION_KEY || 'WhiteCavesDocumentIntelligence26!';
const CIPHER_KEY = crypto.createHash('sha256').update(RAW_KEY).digest();
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

const SecurityConfig = {
    /**
     * Encrypts plaintext string using AES-256-GCM.
     * Returns a compact token: iv:authTag:ciphertext (hex encoded)
     */
    encrypt: function (text) {
        if (!text) return '';
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, CIPHER_KEY, iv);
        
        let encrypted = cipher.update(String(text), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag().toString('hex');

        return `${iv.toString('hex')}:${tag}:${encrypted}`;
    },

    /**
     * Decrypts ciphertext token back to plaintext string.
     */
    decrypt: function (token) {
        if (!token || typeof token !== 'string') return '';
        const parts = token.split(':');
        if (parts.length !== 3) return token; // Not an encrypted token

        const [ivHex, tagHex, encryptedHex] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, CIPHER_KEY, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    },

    /**
     * Masks sensitive identification numbers for secure UI display.
     * e.g., "784-1988-1234567-1" -> "784-1988-*******-1"
     */
    mask: function (val) {
        if (!val) return '';
        const s = String(val);
        if (s.length > 8) {
            return s.substring(0, 4) + '•'.repeat(s.length - 8) + s.substring(s.length - 4);
        }
        return '••••••••';
    }
};

module.exports = SecurityConfig;

