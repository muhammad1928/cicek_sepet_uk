const mongoose = require('mongoose');

// Frontend'deki JSON ağacından çıkarılan TÜM kategori ve tag anahtarları
// Bu liste sayesinde veritabanına sadece geçerli kategoriler girilebilir.
const ALL_CATEGORIES = [
  // Nav & Ana Başlıklar
  'flowers', 'gift', 'fashion', 'edible', 'other', 'all', 'gifts', 'others', 'clothes',
  
  // Çiçek Alt Kategorileri
  'bouquet', 'special', 'rose', 'orchid', 'daisy', 'tulip', 
  'designFlowers', 'indoor_flowers', 'unique',

  // Giyim (Kadın - Erkek - Bebek - Çocuk) Anahtarları
  'women', 'women_clothes', 'men', 'men_clothes', 
  'baby', 'baby_clothes', 'kids', 'kids_clothes',

  // Kıyafet Tipleri (Ortak ve Özel)
  'dresses', 'tops', 'bottoms', 'skirts', 'tshirt', 'tshirts', 
  'pants', 'shorts', 'casual', 'formal', 'lingerines', 'sleepwear', 
  'activeWear', 'hats', 'watches', 'shirt', 'shirts', 'jacket', 'jackets', 
  'styles', 'Stiller', 'bag_women', 'bag_men', 'parfume_women', 'parfume_men', 
  'accessory', 'accessories', 'suits', 'hoodies', 'underwear', 
  'bodysuits', 'rompers', 'outerwear', 'shoes',

  // Hediye Alt Kategorileri
  'for_him', 'for_her', 'for_kids', 'personalized', 'books', 
  'crypto', 'giftcard', 'birthday', 'anniversary',

  // Yiyecek Alt Kategorileri
  'cake', 'cookies', 'drinks', 'chocolate', 'fruit_basket', 
  'chocolate_box', 'snack',

  // Diğerleri
  'proteinPowder', 'tech', 'home_decor', 'stationery', 'sports'
];

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  desc: { type: String, required: true },
  price: { type: Number, required: true, index: true },
  currency: { type: String, default: 'GBP' },
  
  // Resimler (Array)
  imgs: { 
    type: [String], 
    validate: [arrayLimit, '{PATH} en fazla 5 resim olabilir'] // Limit isteğe bağlı artırılabilir
  },
  
  // 1. ANA KATEGORİ (Zorunlu)
  // Örn: "women_clothes" veya "flowers" seçilebilir.
  category: {
    type: String,
    enum: ALL_CATEGORIES, 
    required: true,
    index: true
  },

  // 2. EK KATEGORİLER / ETİKETLER (İsteğe Bağlı)
  // Örn: Ana kategori 'women_clothes' iken buraya ['dresses', 'casual'] eklenebilir.
  tags: [{
    type: String,
    enum: ALL_CATEGORIES // Tagler de aynı havuzdan seçilsin
  }],

  // Varyantlar (Beden/Renk)
  variants: [{
    size: { type: String },
    color: { type: String },
    stock: { type: Number, default: 0 }
  }],

  // Yiyecek Detayları (Opsiyonel)
  foodDetails: {
    calories: { type: Number },
    ingredients: [{ type: String }]
  },

  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  favoritesCount: { type: Number, default: 0 },
  productCode: { type: String, unique: true },

  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 }
  }],

  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
}, {
  timestamps: true,
  strict: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

function arrayLimit(val) {
  return val.length <= 5; // Resim limitini biraz esnettim
}

ProductSchema.virtual('averageRating').get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

// Resim sanal alanı (Eski frontend uyumluluğu için)
ProductSchema.virtual('img').get(function() {
  if (this.imgs && this.imgs.length > 0) return this.imgs[0];
  return "";
});

module.exports = mongoose.model('Product', ProductSchema);