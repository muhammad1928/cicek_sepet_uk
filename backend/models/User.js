const mongoose = require('mongoose');

// Alt Şema: Aktivite Detayları
const ActivitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  ip: String,
  deviceInfo: {
    userAgent: String,
    browser: String,
    os: String,
    deviceType: String
  },
  location: {
    city: String,
    country: String
  },
  details: Object 
});

// Alt Şema: Kayıtlı Adresler (GÜNCELLENDİ)
const AddressSchema = new mongoose.Schema({
    title: String,
    recipientName: String,
    recipientPhone: String,
    // Detaylı adres alanları eklendi
    address: String, // Geriye dönük uyumluluk için (Street olarak kullanılabilir)
    street: String,
    buildingNo: String,
    floor: String,
    apartment: String,
    city: String,
    postcode: String,
    country: String
}, { _id: true }); // Her adresin kendi ID'si olsun

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin', 'courier'],
    default: 'customer'
  },
  language: {
    type: String,
    enum: ["en", "tr", "de", "fr", "es", "it", "ar", "ru"],
    default: "en",
    set: function (lang) {
      if (!lang) return 'en';
      const cleanLang = lang.split('-')[0].toLowerCase();
      const supportedLanguages = ["en", "tr", "de", "fr", "es", "it", "ar", "ru"];
      return supportedLanguages.includes(cleanLang) ? cleanLang : 'en';
    }
  },
  activityLog: [ActivitySchema],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // savedAddresses artık alt şema kullanıyor
  savedAddresses: [AddressSchema],
  badges: [{
    icon: String,
    label: String,
    color: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isBlocked: {
    type: Boolean,
    default: false
  },
  applicationStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  applicationData: Object,
  storeSettings: {
    logo: String,
    banner: String,
    description: String,
    phone: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);