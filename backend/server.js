require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- GÜVENLİK KÜTÜPHANELERİ ---
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
// ------------------------------

const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const orderRoute = require('./routes/order');
const paymentRoute = require('./routes/payment');
const userRoute = require('./routes/users');
const couponRoute = require('./routes/coupon');
const statsRoute = require('./routes/stats');
const uploadRoute = require('./routes/upload');

const app = express();

// 1. GÜVENLİK DUVARLARI
app.use(helmet()); // HTTP Başlıklarını Güvenli Hale Getir
app.use(cors());   // Frontend erişimine izin ver

// 2. RATE LIMITING (DDOS ve Brute Force Koruması)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP'den max 100 istek
  message: "Çok fazla istek yaptınız, lütfen 15 dakika sonra tekrar deneyin."
});
app.use('/api', limiter); // Sadece /api rotalarına uygula

// 3. VERİ TEMİZLEME
app.use(express.json({ limit: '10kb' })); // Çok büyük verileri engelle
app.use(mongoSanitize()); // SQL Injection Koruması ($ ve . işaretlerini siler)
app.use(xss()); // HTML Script Koruması (<script>alert(1)</script> gibi)
app.use(hpp()); // Parametre Kirliliği Koruması

// --- ROTALAR ---
app.get('/api/health', (req, res) => { res.status(200).send('Sunucu Güvende ve Çalışıyor! 🛡️'); });

app.use('/api/auth', authRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/users', userRoute);
app.use('/api/coupons', couponRoute);
app.use('/api/stats', statsRoute);
app.use('/api/upload', uploadRoute);

// TEMİZLİK ROTALARI (Geliştirme aşaması bittiğinde bunları silebilirsin)
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
app.get('/api/clean-users/:username', async (req, res) => { await User.deleteOne({username: req.params.username}); res.send("Silindi"); });
app.get('/api/clean-products', async (req, res) => { await Product.deleteMany({}); res.send("Ürünler Silindi"); });
app.get('/api/clean-orders', async (req, res) => { await Order.deleteMany({}); res.send("Siparişler Silindi"); });

// DB BAĞLANTISI
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Veritabanı Bağlantısı BAŞARILI!"))
    .catch((err) => console.log("DB Hatası:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda güvenli şekilde çalışıyor...`);
});