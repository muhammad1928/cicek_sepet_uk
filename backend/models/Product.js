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
  favoritesCount: { type: Number, default: 0 },

  reviews: [
    {
      user: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      date: { type: Date, default: Date.now },
      // --- YENİ EKLENENLER ---
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 }
      // -----------------------
    }
  ],

  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ProductSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

module.exports = mongoose.model('Product', ProductSchema);