const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // Örn: YAZ2024
  discountRate: { type: Number, required: true }, // Örn: 10 (%10 indirim)
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date, required: true },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Coupon', CouponSchema);