const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountRate: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // --- YENİ: KARGO DAHİL Mİ? ---
  includeDelivery: { type: Boolean, default: true } 
  // -----------------------------

}, { timestamps: true });

module.exports = mongoose.model('Coupon', CouponSchema);