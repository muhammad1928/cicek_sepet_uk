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

// 1. TEMEL AYARLAR
app.use(cors()); // Frontend'in erişmesi için
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 2. GÜVENLİK DUVARLARI
app.use(helmet()); // HTTP Başlıklarını gizler
app.use(hpp()); // Parametre kirliliğini önler

// --- MANUEL GÜVENLİK FİLTRESİ (NoSQL Injection) ---
app.use((req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/\$/g, ""); // $ işaretlerini temizle
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

// Rate Limiting (DDOS Koruması)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 150, // IP başına limit
  message: "Çok fazla istek yaptınız, lütfen biraz bekleyin."
});
app.use('/api', limiter);

// --- API ROTALARI ---
// Sunucu durumunu kontrol etmek için (Render uyku modunu engellemek için)
app.get('/api/health', (req, res) => { res.status(200).send('Sunucu Güvende ve Çalışıyor! 🛡️'); });

app.use('/api/auth', authRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/users', userRoute);
app.use('/api/coupons', couponRoute);
app.use('/api/stats', statsRoute);
app.use('/api/upload', uploadRoute);

// DB BAĞLANTISI
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Veritabanı Bağlantısı BAŞARILI!"))
    .catch((err) => {
        console.log("DB Hatası:", err);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda GÜVENLİ şekilde çalışıyor...`);
});

// 1. Tüm Kullanıcıları Onayla (Eski hesaplara girebilmek için)
app.get('/api/verify-all-users', async (req, res) => {
    try {
        await User.updateMany({}, { isVerified: true });
        res.send("<h1>✅ Başarılı!</h1><p>Tüm kullanıcılar (eski ve yeni) onaylandı. Artık giriş yapabilirsin.</p>");
    } catch (err) {
        res.send("Hata: " + err.message);
    }
});

// --- GÜVENLİK İÇİN GEREKLİ: BCRYPT IMPORT ---
// Eğer dosyanın en tepesinde yoksa buraya ekle:
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // User modelini çağırdık
const Product = require('./models/Product');
const Order = require('./models/Order');
const Coupon = require('./models/Coupon');

// --- SİSTEMİ SIFIRLA VE SÜPER ADMİN OLUŞTUR (GÜNCEL) ---
app.get('/api/reset-system', async (req, res) => {
    try {
        // 1. Her şeyi sil (Temiz Başlangıç)
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Coupon.deleteMany({});

        // 2. Yeni Süper Admin Oluştur (fullName ile)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("123", salt); // Şifre: 123

        const adminUser = new User({
            fullName: "Süper Yönetici", // <--- ARTIK username YOK, BU VAR
            email: "admin@ciceksepeti.uk",
            password: hashedPassword,
            role: "admin",          // Yetki: Yönetici
            isVerified: true,       // Direkt onaylı (Mail onayı beklemez)
            badges: [],
            savedAddresses: [],
            applicationStatus: "approved" // Başvuru derdi yok
        });

        await adminUser.save();

        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: green;">✅ SİSTEM SIFIRLANDI!</h1>
                <p>Veritabanı temizlendi ve yeni yapıya uygun Süper Admin oluşturuldu.</p>
                <div style="border: 1px solid #ccc; padding: 20px; display: inline-block; border-radius: 10px; background: #f9f9f9;">
                    <p><b>E-Posta:</b> admin@ciceksepeti.uk</p>
                    <p><b>Şifre:</b> 123</p>
                </div>
                <br/><br/>
                <a href="http://localhost:5173/login" style="background: #db2777; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Giriş Yap</a>
            </div>
        `);
    } catch (err) {
        res.send("Hata: " + err.message);
    }
});