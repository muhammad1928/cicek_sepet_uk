const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, // Ad Soyad
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

  // --- YENİ: BAŞVURU SİSTEMİ ---
  applicationStatus: { 
    type: String, 
    enum: ['none', 'pending', 'approved', 'rejected'], 
    default: 'none' // Müşteriler için hep 'approved' sayılabilir veya kullanılmaz
  },
  applicationData: { type: Object }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);