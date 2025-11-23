const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'GBP' },
  img: { type: String },
  category: { type: String },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  
  // --- YENİ: YORUMLAR ALANI ---
  reviews: [
    {
      user: { type: String, required: true }, // Yorum yapanın adı
      rating: { type: Number, required: true }, // Puan (1-5)
      comment: { type: String, required: true }, // Yorum metni
      date: { type: Date, default: Date.now } // Tarih
    }
  ],
  // ----------------------------

  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);