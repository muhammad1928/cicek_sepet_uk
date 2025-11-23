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
// GEÇİCİ TEMİZLİK ROTASI (İşin bitince silebilirsin)
// const Order = require('./models/Order');
// app.get('/api/clean-orders', async (req, res) => {
//     await Order.deleteMany({});
//     res.send("Tüm eski siparişler silindi!");
// });
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});