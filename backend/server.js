require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- GÜVENLİK KÜTÜPHANELERİ ---
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// --- MODELLER (Temizlik ve Onay işlemleri için burada çağırıyoruz) ---
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

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

// 1. TEMEL AYARLAR
app.use(cors());
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 2. GÜVENLİK DUVARLARI
app.use(helmet());
app.use(hpp());

// --- MANUEL GÜVENLİK FİLTRESİ (NoSQL Injection) ---
app.use((req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
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

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: "Çok fazla istek yaptınız, lütfen biraz bekleyin."
});
app.use('/api', limiter);

// --- API ROTALARI ---
app.get('/api/health', (req, res) => { res.status(200).send('Sunucu Güvende ve Çalışıyor! 🛡️'); });

app.use('/api/auth', authRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/users', userRoute);
app.use('/api/coupons', couponRoute);
app.use('/api/stats', statsRoute);
app.use('/api/upload', uploadRoute);

// --- GEÇİCİ YÖNETİM ROTALARI (Burada Hata Yok Artık) ---

// 1. Tüm Kullanıcıları Onayla (Eski hesaplara girebilmek için)
app.get('/api/verify-all-users', async (req, res) => {
    try {
        await User.updateMany({}, { isVerified: true });
        res.send("<h1>✅ Başarılı!</h1><p>Tüm kullanıcılar (eski ve yeni) onaylandı. Artık giriş yapabilirsin.</p>");
    } catch (err) {
        res.send("Hata: " + err.message);
    }
});

// 2. Temizlik Rotaları
app.get('/api/clean-users/:username', async (req, res) => { await User.deleteOne({username: req.params.username}); res.send("Kullanıcı Silindi"); });
app.get('/api/clean-products', async (req, res) => { await Product.deleteMany({}); res.send("Ürünler Silindi"); });
app.get('/api/clean-orders', async (req, res) => { await Order.deleteMany({}); res.send("Siparişler Silindi"); });

// DB BAĞLANTISI
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Veritabanı Bağlantısı BAŞARILI!"))
    .catch((err) => {
        console.log("DB Hatası:", err);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});