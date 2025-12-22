const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // --- SİPARİŞİ VEREN ÜYE (Varsa) ---
  userId: { type: String, index: true }, // "Siparişlerim" sayfası için

  // --- 1. GÖNDERİCİ BİLGİLERİ ---
  sender: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  
  // --- 2. ALICI VE ADRES BİLGİLERİ (GÜNCELLENDİ) ---
  recipient: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    
    // Eski "address" tek satırdı, şimdi detaylandırıldı:
    street: { type: String, required: true },      // Cadde/Sokak Adı
    buildingNo: { type: String, required: true },  // Bina No
    apartment: { type: String, default: "" },      // Daire No (Opsiyonel)
    floor: { type: String, default: "" },          // Kat (Opsiyonel)
    
    postcode: { type: String, required: true },    // Posta Kodu
    city: { type: String, required: true },        // Şehir (London vb.)
    country: { type: String, required: true }      // Ülke (United Kingdom vb.)
  },

  // --- 3. TESLİMAT DETAYLARI ---
  delivery: {
    date: { type: Date, required: true },
    timeSlot: { type: String, default: "09:00 - 18:00" },
    deliveryType: { 
        type: String, 
        enum: ['standart', 'next-day', 'same-day'], 
        default: 'standart' 
    },
    cardMessage: { type: String }, // Hediye notu
    courierNote: { type: String }, // Kuryeye özel not (Zili çalma vb.)
    isAnonymous: { type: Boolean, default: false } // İsimsiz gönderim
  },

  // --- 4. ÜRÜN LİSTESİ (GÜNCELLENDİ) ---
  items: [
    {
      _id: String,      // Ürün ID'si
      title: String,
      price: Number,    // Satış anındaki birim fiyat (Değişmez)
      quantity: Number,
      img: String,
      
      // --- YENİ: VENDOR ID ---
      // Admin panelinde siparişi dükkanlara göre ayırmak ve 
      // Satıcı panelinde sadece kendi ürününü göstermek için şart.
      vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

      // Seçilen Varyant Bilgisi
      selectedVariant: {
          size: String,   // "M", "L"
          color: String,  // "Red", "Blue"
          stock: Number   // Opsiyonel: Satın alınan varyantın stok bilgisi (history için)
      }
    }
  ],

  // --- 5. FİNANSAL BİLGİLER ---
  totalAmount: { type: Number, required: true }, // Müşterinin ödediği son tutar
  
  // Satıcı hakedişi için ham tutar (Kuponsuz, İndirimsiz)
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
        'Dağıtımda',       // Kurye ürünü aldı, müşteriye gidiyor
        'Teslim Edildi',   // İşlem tamam
        'İptal',           // İptal edildi
        'İptal Talebi'     // Müşteri iptal istedi, onay bekliyor
    ],
    index: true
  },

  // --- 7. İPTAL VE İADE YÖNETİMİ ---
  cancellationReason: { type: String }, // Müşterinin yazdığı iptal sebebi

  // --- 8. KURYE YÖNETİMİ ---
  courierId: { type: String }, // Siparişi taşıyan kuryenin ID'si
  courierRejectionReason: { type: String }, // Eğer bir kurye işi reddederse

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