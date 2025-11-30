const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // --- SİPARİŞİ VEREN ÜYE (Varsa) ---
  userId: { type: String }, // Üye ID'si (Misafir ise boş olabilir)

  // --- 1. GÖNDERİCİ BİLGİLERİ ---
  sender: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  
  // --- 2. ALICI BİLGİLERİ ---
  recipient: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postcode: { type: String,required: true }
  },

  // --- 3. TESLİMAT DETAYLARI ---
  delivery: {
    date: { type: Date, required: true },
    timeSlot: { type: String, default: "Gün İçinde" },
    cardMessage: { type: String }, // Kart notu
    courierNote: { type: String }, // Kuryeye not
    isAnonymous: { type: Boolean, default: false } // İsim gizli mi?
  },

  // --- 4. ÜRÜNLER ---
  items: [
    {
      _id: String,
      title: String,
      price: Number,
      quantity: Number,
      img: String
    }
  ],

  // --- 5. FİNANSAL BİLGİLER ---
  totalAmount: { type: Number, required: true }, // Toplam Tutar
  deliveryFee: { type: Number, default: 0 },     // Teslimat Ücreti (YENİ)
  rawTotal: { type: Number }, // Ürün Toplamı (YENİ)

  // --- 6. OPERASYONEL DURUMLAR ---
  status: { 
    type: String, 
    default: 'Sipariş Alındı',
    // 'Hazır' durumu Satıcı -> Kurye geçişi için eklendi
    enum: ['Sipariş Alındı', 'Hazırlanıyor', 'Hazır', 'Yola Çıktı', 'Teslim Edildi', 'İptal', 'İptal Talebi']
  },

  // --- 7. KURYE DETAYLARI ---
  courierId: { type: String }, // Hangi kurye taşıyor?
  courierRejectionReason: { type: String },// Kurye işi neden bıraktı? (YENİ)

  // --- YENİ: MÜŞTERİ METADATASI ---
  metaData: {
    ip: String,           // IP Adresi (Güvenlik için şart)
    // Cihaz Bilgileri
    userAgent: String,         // Tarayıcı Kimliği (Raw)
    browserName: String,       // Chrome, Firefox vb.
    osName: String,            // Windows, iOS, Android
    deviceType: String,        // Mobile / Desktop / Tablet
    
    // Ekran ve Dil
    screenResolution: String,  // Örn: 1920x1080
    language: String,          // Tarayıcı Dili (tr-TR)
    timeZone: String,          // Zaman Dilimi (Europe/Istanbul)
    
    // Bağlantı (Varsa)
    connectionType: String,    // 4G, WiFi (Destekleyen tarayıcılarda)
    
    // Çerez/Referans
    referrer: String           // Hangi siteden geldi? (Google, Instagram vb.)
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);