const Log = require('../models/Log'); // Dosya adının disktekiyle AYNI olduğundan emin ol (Büyük/Küçük harf)
const crypto = require('crypto');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js'); 
const mongoose = require('mongoose');

const logActivity = async (userId, action, req, metadata = {}) => {
  try {
    // Header Kontrolü
    const headers = req.headers || {};
    const rawIp = (headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || '0.0.0.0';
    
    // IP Hash
    const secret = process.env.JWT_SEC || 'secret';
    const hashedIp = crypto.createHash('sha256').update(rawIp + secret).digest('hex');

    // Geo Location
    const geoLookup = geoip.lookup(rawIp);
    const geoData = {
        country: geoLookup?.country || null,
        city: geoLookup?.city || null,
        region: geoLookup?.region || null,
        ll: geoLookup?.ll || []
    };

    // User Agent Parse
    const uaString = headers['user-agent'] || '';
    let deviceData = { type: 'Desktop', vendor: 'Generic', model: 'Unknown' };
    let osData = { name: 'Unknown', version: 'Unknown' };
    let browserData = { name: 'Unknown', version: 'Unknown' };

    try {
        // UAParser v1/v2 uyumluluğu için basit yapı
        let parser;
        try { parser = new UAParser(uaString); } catch(e) { parser = UAParser(uaString); }
        
        const result = parser.getResult();
        
        if (result?.device?.type) {
            deviceData.type = result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1);
        } else if (/bot|crawl|spider|googlebot/i.test(uaString)) {
            deviceData.type = 'Bot';
        }
        
        if (result?.device?.vendor) deviceData.vendor = result.device.vendor;
        if (result?.device?.model) deviceData.model = result.device.model;
        if (result?.os?.name) osData.name = result.os.name;
        if (result?.browser?.name) browserData.name = result.browser.name;

    } catch (parseErr) {
        // Parser hatası loglamayı durdurmasın
    }

    // User ID Validation
    const safeUserId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;

    // Async Create (Await kullanmıyoruz ki response süresini uzatmasın, arka planda kaydetsin)
    Log.create({
        userId: safeUserId,
        action,
        ip: hashedIp,
        geo: geoData,
        device: deviceData,
        os: osData,
        browser: browserData,
        userAgent: uaString,
        request: {
            method: req.method,
            url: req.originalUrl || req.url || '/'
        },
        metadata
    }).catch(err => console.error("Log Write Error:", err.message));

  } catch (err) {
    console.error("Log System Error:", err.message);
  }
};

module.exports = logActivity;