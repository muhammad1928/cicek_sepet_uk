const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, 
  action: { type: String, required: true }, 
  
  // --- KİMLİK & GÜVENLİK ---
  ip: { type: String }, 
  sessionID: { type: String }, 

  // --- LOKASYON ---
  geo: {
    country: String, 
    city: String, 
    region: String, 
    ll: [Number] 
  },

  // --- CİHAZ & TEKNOLOJİ (DÜZELTİLEN KISIM) ---
  device: {
    // Mongoose'da alan ismine 'type' dersen karışır. 
    // Bu yüzden { type: String } şeklinde sarmalamamız gerekir.
    type: { type: String }, 
    vendor: String, 
    model: String 
  },
  
  os: {
    name: String, 
    version: String 
  },
  browser: {
    name: String, 
    version: String 
  },
  userAgent: String, 

  // --- TRAFİK KAYNAĞI ---
  referrer: String, 
  utm: { 
    source: String, 
    medium: String, 
    campaign: String
  },

  // --- İSTEK DETAYLARI ---
  request: {
    method: String, 
    url: String, 
  },

  metadata: { type: mongoose.Schema.Types.Mixed },

}, { 
  timestamps: true, 
  expireAfterSeconds: 31536000 
});

// İndeksler (Performans İçin)
LogSchema.index({ action: 1 });
LogSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Log', LogSchema);