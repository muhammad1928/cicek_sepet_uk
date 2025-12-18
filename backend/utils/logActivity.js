const Log = require('../models/Log');
const crypto = require('crypto');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js'); // Modern kütüphane

/**
 * Gelişmiş Loglama Fonksiyonu (Modern Kütüphaneler ile)
 */
const logActivity = async (userId, action, req, metadata = {}) => {
  try {
    // 1. IP ADRESİNİ YAKALA
    const rawIp = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket.remoteAddress || '';
    
    // 2. GDPR UYUMLULUĞU: IP HASHLEME
    // Salt (tuz) olarak JWT_SEC kullanıyoruz ki hash tahmin edilemesin.
    const secret = process.env.JWT_SEC || 'fallback_secret_key';
    const hashedIp = crypto.createHash('sha256').update(rawIp + secret).digest('hex');

    // 3. COĞRAFİ KONUM BULMA
    const geoLookup = geoip.lookup(rawIp);
    const geoData = {
        country: geoLookup ? geoLookup.country : 'Unknown',
        city: geoLookup ? geoLookup.city : 'Unknown',
        region: geoLookup ? geoLookup.region : 'Unknown',
        ll: geoLookup ? geoLookup.ll : [] // Enlem, Boylam
    };

    // 4. CİHAZ VE TARAYICI ANALİZİ (ua-parser-js ile)
    const uaString = req.headers['user-agent'] || '';
    const parser = new UAParser(uaString);
    const result = parser.getResult(); // { browser, cpu, device, os, engine }

    // Cihaz tipini belirle (Mobile, Tablet, Desktop)
    let deviceType = result.device.type 
        ? (result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1)) 
        : 'Desktop'; // Kütüphane desktop'ı undefined dönerse Desktop kabul et

    // Bot kontrolü (Ekstra güvenlik)
    if (/bot|crawl|spider|googlebot/i.test(uaString)) {
        deviceType = 'Bot';
    }

    // 5. PAZARLAMA VERİLERİ (UTM Parametreleri)
    const utm = {
        source: req.query?.utm_source || null,
        medium: req.query?.utm_medium || null,
        campaign: req.query?.utm_campaign || null
    };

    // 6. REFERRER (Nereden Geldi?)
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';

    // 7. LOGU KAYDET
    // Hata durumunda sistemi durdurmaması için .catch kullanıyoruz
    Log.create({
        userId: userId || null,
        action,
        ip: hashedIp,
        sessionID: req.sessionID || null,
        
        geo: geoData,
        
        device: {
            type: deviceType,
            vendor: result.device.vendor || 'Generic',
            model: result.device.model || 'Unknown'
        },
        os: {
            name: result.os.name || 'Unknown',
            version: result.os.version || 'Unknown'
        },
        browser: {
            name: result.browser.name || 'Unknown',
            version: result.browser.version || 'Unknown'
        },
        userAgent: uaString, // Ham veri yedek

        referrer,
        utm,

        request: {
            method: req.method,
            url: req.originalUrl || req.url
        },

        metadata // Fiyat, hata kodu vb.
    }).catch(err => {
        console.error("LOG WRITE ERROR:", err.message);
    });

  } catch (err) {
    console.error("Logactivity System Error:", err);
  }
};

module.exports = logActivity;