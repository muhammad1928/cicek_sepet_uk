const Log = require('../models/Log');
const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');
const UAParser = require('ua-parser-js');

// --- ŞİFRELEME AYARLARI ---
const ALGORITHM = 'aes-256-cbc';
// Secret key'i 32 byte uzunluğuna sabitliyoruz
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.LOG_ENC_KEY || 'secret').digest(); 
const IV_LENGTH = 16;

// Yardımcı Fonksiyon: Şifreleme
const encryptIp = (text) => {
    if (!text) return null;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        // Format: IV:ŞifreliVeri (Çözerken IV lazım olacak)
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (e) {
        return text; // Hata olursa ham halini döndür
    }
};

const logActivity = async (userId, action, req, metadata = {}) => {
    try {
        // 1. GERÇEK IP YAKALAMA
        let rawIp = req.headers['x-forwarded-for'] || 
                    req.connection?.remoteAddress || 
                    req.ip || '0.0.0.0';

        if (rawIp.includes(',')) rawIp = rawIp.split(',')[0].trim();
        if (rawIp.startsWith('::ffff:')) rawIp = rawIp.substring(7);

        // 2. USER AGENT PARSE
        const uaString = req.headers['user-agent'] || '';
        const parser = new UAParser(uaString);
        const result = parser.getResult();
        
        // 3. GEO LOCATION
        let geoData = { country: "Unknown", city: "Unknown", region: "Unknown", ll: [] };
        if (rawIp !== '127.0.0.1' && rawIp !== '::1' && rawIp !== '0.0.0.0') {
            try {
                const response = await axios.get(`http://ip-api.com/json/${rawIp}?fields=status,country,city,regionName,lat,lon`);
                if (response.data.status === 'success') {
                    geoData = {
                        country: response.data.country || "Unknown",
                        city: response.data.city || "Unknown",
                        region: response.data.regionName || "Unknown",
                        ll: [response.data.lat, response.data.lon]
                    };
                }
            } catch (err) {
                console.error("Geo API Error:", err.message);
            }
        }

        // 4. IP'Yİ ŞİFRELE (AES)
        const encryptedIp = encryptIp(rawIp);

        const safeUserId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;

        // 5. KAYIT
        await Log.create({
            userId: safeUserId,
            action,
            ip: encryptedIp, // <-- Veritabanına şifreli yazılır
            
            userAgent: uaString,
            device: {
                type: result.device.type === 'mobile' ? 'Mobile' : result.device.type === 'tablet' ? 'Tablet' : 'Desktop',
                name: result.device.model || 'PC',
                vendor: result.device.vendor || '' 
            },
            os: {
                name: result.os.name || 'Unknown',
                version: result.os.version || ''
            },
            browser: {
                name: result.browser.name || 'Unknown',
                version: result.browser.version || ''
            },

            geo: geoData,
            request: {
                method: req.method,
                url: req.originalUrl || req.url || '/'
            },
            metadata
        });

    } catch (err) {
        console.error("Log System Error:", err.message);
    }
};

module.exports = logActivity;