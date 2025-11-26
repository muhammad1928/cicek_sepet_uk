const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin', 'courier'], default: 'customer' },
  
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  savedAddresses: [{ 
    title: String, recipientName: String, recipientPhone: String, 
    address: String, city: String, postcode: String 
  }],

  badges: [{ icon: String, label: String, color: String }],

  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  isBlocked: { type: Boolean, default: false },

  applicationStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  applicationData: Object, // Ehliyet, Vergi No vb.

  storeSettings: {
    logo: String,
    banner: String,
    description: String,
    phone: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);