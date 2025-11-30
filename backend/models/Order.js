const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // --- SİPARİŞİ VEREN ÜYE (Varsa) ---
  userId: { type: String }, // Üye ID'si (Misafir ise null olabilir)

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
    postcode: { type: String, required: true }
  },

  // --- 3. TESLİMAT DETAYLARI ---
  delivery: {
    date: { type: Date, required: true },
    timeSlot: { type: String, default: "09:00 - 18:00" },
    // --- YENİ ALAN: TESLİMAT TİPİ ---
    deliveryType: { 
        type: String, 
        enum: ['standart', 'next-day', 'same-day'], 
        default: 'standart' 
    },
    cardMessage: { type: String }, // Hediye notu
    courierNote: { type: String }, // Kuryeye özel not (Zili çalma vb.)
    isAnonymous: { type: Boolean, default: false } // İsimsiz gönderim
  },

  // --- 4. ÜRÜN LİSTESİ ---
  items: [
    {
      _id: String,
      title: String,
      price: Number,    // Satış anındaki birim fiyat (Değişmez)
      quantity: Number,
      img: String,
      // İleride satıcı bazlı raporlama için vendor ID'sini buraya da ekleyebiliriz
      // ancak şu an product._id üzerinden populate ederek buluyoruz.
    }
  ],

  // --- 5. FİNANSAL BİLGİLER ---
  totalAmount: { type: Number, required: true }, // Müşterinin ödediği son tutar
  // --- YENİ: SATICI HAKEDİŞİ İÇİN HAM TUTAR ---
  // (Kuponsuz, İndirimsiz, Orijinal Ürün Toplamı)
  rawTotal: { type: Number, default: 0 },
  
  deliveryFee: { type: Number, default: 0 },     // Kargo ücreti
  
  // --- 6. SİPARİŞ DURUMU ---
  status: { 
    type: String, 
    default: 'Sipariş Alındı',
    enum: [
        'Sipariş Alındı',  // İlk kayıt
        'Hazırlanıyor',    // Satıcı onayladı
        'Hazır',           // Satıcı paketi hazırladı, kurye bekliyor
        'Kurye Yolda',     // Kurye işi aldı, mağazaya gidiyor
        'Dağıtımda',       // Kurye ürünü aldı, müşteriye gidiyor (Eski adıyla: Yola Çıktı)
        'Teslim Edildi',   // İşlem tamam
        'İptal',           // İptal edildi
        'İptal Talebi'     // Müşteri iptal istedi, onay bekliyor
    ]
  },

  // --- 7. İPTAL VE İADE YÖNETİMİ ---
  cancellationReason: { type: String }, // Müşterinin yazdığı iptal sebebi

  // --- 8. KURYE YÖNETİMİ ---
  courierId: { type: String }, // Siparişi taşıyan kuryenin ID'si
  courierRejectionReason: { type: String }, // Eğer bir kurye işi reddederse (Opsiyonel)

  // --- 9. GÜVENLİK VE ANALİTİK (METADATA) ---
  metaData: {
    ip: String,                // IP Adresi
    userAgent: String,         // Tarayıcı Ham Verisi
    
    // Cihaz ve Ortam
    browserName: String,       // Chrome, Safari...
    osName: String,            // Windows, iOS...
    deviceType: String,        // Mobile / Desktop
    
    // Ekran ve Bölge
    screenResolution: String,  
    language: String,          // tr-TR
    timeZone: String,          
    
    // Ağ ve Kaynak
    connectionType: String,    // 4g, wifi
    referrer: String           // Nereden geldi?
  }

}, { timestamps: true }); // createdAt ve updatedAt otomatik oluşur

module.exports = mongoose.model('Order', OrderSchema);