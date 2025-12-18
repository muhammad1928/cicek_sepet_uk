const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // Login değilse null olabilir
  action: { type: String, required: true }, // Örn: "view_product", "add_to_cart"
  
  // --- KİMLİK & GÜVENLİK ---
  ip: { type: String },     // Hashlenmiş (Maskelenmiş) IP
  sessionID: { type: String }, // Misafir kullanıcı takibi için (varsa)

  // --- LOKASYON (IP'den türetilen) ---
  geo: {
    country: String, // TR, UK, DE
    city: String,    // Istanbul, London
    region: String,  // 34, ENG
    ll: [Number]     // Enlem/Boylam (Harita ısı haritası için)
  },

  // --- CİHAZ & TEKNOLOJİ ---
  device: {
    type: String,   // Mobile, Tablet, Desktop, Bot
    vendor: String, // Apple, Samsung
    model: String   // iPhone, Galaxy S10
  },
  os: {
    name: String,    // Windows, iOS, Android
    version: String  // 10, 14.2
  },
  browser: {
    name: String,   // Chrome, Safari
    version: String // 90.0.4430
  },
  userAgent: String, // Raw data (Yedek)

  // --- TRAFİK KAYNAĞI (PAZARLAMA) ---
  referrer: String, // Sitemize nereden geldi? (Google, Facebook, Direct)
  utm: {            // Reklam linki parametreleri
    source: String, // utm_source (google, newsletter)
    medium: String, // utm_medium (cpc, email)
    campaign: String// utm_campaign (yaz_indirimleri)
  },

  // --- İSTEK DETAYLARI ---
  request: {
    method: String, // GET, POST
    url: String,    // /api/products/123
  },

  // --- İŞLEM ÖZEL VERİSİ ---
  // { productId: "...", cartTotal: 500, errorMsg: "..." }
  metadata: { type: mongoose.Schema.Types.Mixed },

}, { 
  timestamps: true, // createdAt zamanı otomatik eklenir
  expireAfterSeconds: 31536000 // 1 Yıl sonra sil (Opsiyonel)
});

module.exports = mongoose.model('Log', LogSchema);