const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // ... (Eski alanlar: username, email, password, role, favorites, savedAddresses, isVerified, verificationToken, reset..., isBlocked, application...) ...
  
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin', 'courier'], default: 'customer' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  savedAddresses: [{ title: String, recipientName: String, recipientPhone: String, address: String, city: String, postcode: String }],
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isBlocked: { type: Boolean, default: false },
  applicationStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  applicationData: { type: Object },

  // --- YENİ: MAĞAZA AYARLARI ---
  storeSettings: {
    logo: { type: String }, // Mağaza Logosu URL
    banner: { type: String }, // Kapak Fotoğrafı URL
    description: { type: String }, // Hakkımızda yazısı
    phone: { type: String } // İletişim No
  }
  // ----------------------------

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);