const mongoose = require('mongoose');

// Alt Şema: Aktivite Detayları
const ActivitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  }, // 'login', 'register', 'password_change', 'search', 'view_product', 'add_to_cart'
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
  details: Object // Ekstra veri (Örn: Aranan kelime, Değişen alanlar)
});

const UserSchema = new mongoose.Schema({
  // Username BURADA OLMAMALI!
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
    // 👇 BURASI ÇOK ÖNEMLİ: Desteklediğin 8 dilin hepsini buraya yazmalısın.
    // Veritabanı bu listede olmayan bir şey gelirse hata verir.
    enum: ["en", "tr", "de", "fr", "es", "it", "ar", "ru"],

    default: "en",

    // 👇 BU "SET" FONKSİYONU HAYAT KURTARIR:
    // Tarayıcıdan 'en-US', 'tr-TR', 'fr-CA' gibi tireli kod gelse bile
    // bunu otomatikman 'en', 'tr', 'fr' haline getirir.
    set: function (lang) {
      if (!lang) return 'en';
      // Tireden sonrasını at (en-US -> en)
      const cleanLang = lang.split('-')[0].toLowerCase();

      // KONTROL: Eğer gelen dil (örn: 'jp') senin 8 dilin arasında yoksa
      // sistemi çökertmek yerine varsayılan olarak 'en' yap.
      const supportedLanguages = ["en", "tr", "de", "fr", "es", "it", "ar", "ru"];
      return supportedLanguages.includes(cleanLang) ? cleanLang : 'en';
    }
  },
  activityLog: [ActivitySchema],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  savedAddresses: [{
    title: String,
    recipientName: String,
    recipientPhone: String,
    address: String,
    city: String,
    postcode: String
  }],
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