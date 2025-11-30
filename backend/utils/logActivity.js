const User = require('../models/User');

const logActivity = async (userId, action, req, details = {}) => {
  if (!userId) return;

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Basit cihaz tahmini (İstersen 'useragent' kütüphanesi kullanabilirsin)
    const isMobile = /mobile/i.test(userAgent);
    
    const newActivity = {
      action,
      ip,
      deviceInfo: {
        userAgent,
        deviceType: isMobile ? 'Mobile' : 'Desktop',
        // Browser/OS ayrıştırması için kütüphane gerekir, şimdilik raw userAgent yeterli
      },
      details
    };

    await User.findByIdAndUpdate(userId, { 
      $push: { activityLog: newActivity } 
    });
  } catch (err) {
    console.error("Loglama hatası:", err);
  }
};

module.exports = logActivity;