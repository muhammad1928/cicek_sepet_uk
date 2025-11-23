const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({

  // 1. GÖNDEREN BİLGİLERİ
  userId: { type: String }, 
  // 2. KURYE BİLGİLERİ (İsteğe Bağlı)
  courierId: { type: String },
  
  // 3. GÖNDEREN
  sender: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  
  // 2. ALICI
  recipient: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postcode: { type: String }
  },

  // 3. TESLİMAT
  delivery: {
    date: { type: Date, required: true },
    timeSlot: { type: String, default: "Gün İçinde" },
    cardMessage: { type: String },
    courierNote: { type: String },
    isAnonymous: { type: Boolean, default: false }
  },

  // 4. ÜRÜNLER
  items: [
    {
      _id: String,
      title: String,
      price: Number,
      quantity: Number,
      img: String
    }
  ],
  totalAmount: { type: Number, required: true },
  
  // 5. DURUM
  status: { 
    type: String, 
    default: 'Sipariş Alındı',
    enum: ['Sipariş Alındı', 'Hazırlanıyor', 'Yola Çıktı', 'Teslim Edildi', 'İptal']
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);