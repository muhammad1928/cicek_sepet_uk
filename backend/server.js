require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- GÜVENLİK KÜTÜPHANELERİ ---
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// --- ROTA DOSYALARI ---
const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const orderRoute = require('./routes/order');
const paymentRoute = require('./routes/payment');
const userRoute = require('./routes/users');
const couponRoute = require('./routes/coupon');
const statsRoute = require('./routes/stats');
const uploadRoute = require('./routes/upload');

const app = express();

// ============================================================
// 1. TEMEL AYARLAR VE GÜVENLİK
// ============================================================

// CORS ve Veri Okuma (Parsing)
app.use(cors());
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP Başlık Güvenliği
app.use(helmet());

// HTTP Parametre Kirliliği Koruması
app.use(hpp());

// --- MANUEL GÜVENLİK FİLTRESİ (NoSQL Injection Koruması) ---
// express-mongo-sanitize yerine geçen özel fonksiyon
app.use((req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Dolar ($) işaretlerini temizle (MongoDB operatörlerini engelle)
        obj[key] = obj[key].replace(/\$/g, ""); 
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
});

// Rate Limiting (DDOS ve Brute Force Koruması)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 500, // IP başına maksimum istek sayısı
  message: "Çok fazla istek yaptınız, lütfen biraz bekleyin."
});
app.use('/api', limiter);

// ============================================================
// 2. ROTALAR (ENDPOINTS)
// ============================================================

// Sağlık Kontrolü (Render uyku modunu önlemek veya kontrol için)
app.get('/api/health', (req, res) => { 
  res.status(200).send('Sunucu Güvende ve Çalışıyor! 🛡️'); 
});

app.use('/api/auth', authRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/users', userRoute);
app.use('/api/coupons', couponRoute);
app.use('/api/stats', statsRoute);
app.use('/api/upload', uploadRoute);

// ============================================================
// 3. VERİTABANI BAĞLANTISI VE SUNUCU BAŞLATMA
// ============================================================

mongoose.connect(process.env.MONGO_URI, {
    family: 4 // <--- ESERVFAIL hatasını çözen kritik ayar (IPv4 Zorlaması)
})
    .then(() => console.log("Veritabanı Bağlantısı BAŞARILI!"))
    .catch((err) => {
        console.log("DB Hatası:", err);
        console.log("Lütfen DNS ayarlarınızı (8.8.8.8) veya IP Whitelist ayarlarını kontrol edin.");
    });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda GÜVENLİ şekilde çalışıyor...`);
});