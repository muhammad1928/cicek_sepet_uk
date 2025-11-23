// 1. EN TEPEYE BUNU YAZ (Şifreleri yükle)
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const orderRoute = require('./routes/order');
const uploadRoute = require('./routes/upload');
const userRoute = require('./routes/users');
const paymentRoute = require('./routes/payment');
const statsRoute = require('./routes/stats');
const couponRoute = require('./routes/coupon');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/users', userRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/stats', statsRoute);
app.use('/api/coupons', couponRoute);

// HEALTH CHECK (Sunucuyu uyanık tutmak için)
app.get('/api/health', (req, res) => {
  res.status(200).send('Sunucu ayakta ve çalışıyor! 🚀');
});

// Debug için: Konsola veritabanı linkini yazdıralım (Sorunu görmek için)
console.log("Veritabanı Linki:", process.env.MONGO_URI); 

app.use('/api/auth', authRoute);

// Veritabanı Bağlantısı
// Eğer MONGO_URI yoksa hata vermesin diye kontrol ekleyelim
if (!process.env.MONGO_URI) {
    console.error("HATA: .env dosyası okunamadı veya MONGO_URI boş!");
    process.exit(1); // Uygulamayı durdur
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Veritabanı Bağlantısı BAŞARILI!"))
    .catch((err) => console.log("Veritabanı Hatası:", err));

const PORT = process.env.PORT || 5000;
// GEÇİCİ: KULLANICI SİLME ROTASI
const User = require('./models/User'); // User modelini çağırdık

app.get('/api/reset-user/:username', async (req, res) => {
    try {
        const username = req.params.username;
        await User.deleteOne({ username: username });
        res.send(`<h1>✅ ${username} başarıyla silindi!</h1><p>Şimdi Thunder Client ile tekrar oluşturabilirsin.</p>`);
    } catch (err) {
        res.send("Hata: " + err.message);
    }
});
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});