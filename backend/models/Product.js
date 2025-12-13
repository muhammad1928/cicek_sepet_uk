const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  }, // İsimle arama için
  desc: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    index: true
  }, // Fiyat sıralaması için
  currency: {
    type: String,
    default: 'GBP'
  },
  img: {
    type: String
  },
  category: {
    type: String,
    enum: ['birthday', 'anniversary', 'indoor', 'edible', 'designFlowers', 'rose', 'orchid', 'daisy'],
    index: true
  }, // Kategori filtresi için
  stock: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  favoritesCount: {
    type: Number,
    default: 0
  },
  productCode: {
    type: String,
    unique: true
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },

    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    }

  }],

  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }, // Satıcı ürünleri için
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

ProductSchema.virtual('averageRating').get(function () {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

module.exports = mongoose.model('Product', ProductSchema);