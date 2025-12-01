const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const morgan = require("morgan");

// --- ROTA İMPORTLARI ---
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
const cartRoute = require("./routes/cart");
const couponRoute = require("./routes/coupon");
const paymentRoute = require("./routes/payment");
const uploadRoute = require("./routes/upload");
// const webhookRoute = require("./routes/webhook"); // (İleride eklenecek)

dotenv.config();

const app = express();

// ============================================================
// 🛡️ GÜVENLİK VE MIDDLEWARE KATMANI (SIRASI ÇOK ÖNEMLİDİR)
// ============================================================

// 1. Logging (Sadece Development modunda detaylı log)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production'da sadece hataları görmek isteyebilirsin (opsiyonel)
  app.use(morgan('tiny')); 
}

// 2. Güvenlik Başlıkları (Helmet)
app.use(helmet());

// 3. CORS Ayarları (Sadece senin frontend'ine izin ver)
// Production'a geçerken 'http://localhost:5173' yerine gerçek domainini yazmalısın!
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Cookie/Token için gerekli
};
app.use(cors(corsOptions));

// 4. Rate Limiting (Hız Sınırlama)
// 15 dakika içinde aynı IP'den en fazla 100 istek
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Bu IP adresinden çok fazla istek yapıldı, lütfen 15 dakika sonra tekrar deneyin.",
  standardHeaders: true,
  legacyHeaders: false,
});
// Sadece /api rotalarına uygula
app.use("/api", limiter);

// 5. Body Parser (Veriyi JSON olarak oku)
// Webhook için raw body gerekebilir, o yüzden webhook rotasını bunun üzerine koymak gerekir.
app.use(express.json({ limit: '10kb' })); // 10kb'dan büyük veri gelirse reddet (DDoS önlemi)

// 6. Data Sanitization (NoSQL Injection Önleme)
app.use(mongoSanitize());

// 7. Data Sanitization (XSS Önleme)
app.use(xss());

// 8. Parameter Pollution (Parametre Kirliliği Önleme)
app.use(hpp());

// ============================================================
// 🔌 VERİTABANI BAĞLANTISI
// ============================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connection Successful!"))
  .catch((err) => {
      console.error("❌ DB Connection Error:", err);
      process.exit(1); // DB bağlanmazsa sunucuyu kapat
  });

// ============================================================
// 📂 STATİK DOSYALAR
// ============================================================
app.use("/images", express.static(path.join(__dirname, "uploads")));

// ============================================================
// 🛤️ API ROTALARI
// ============================================================
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/carts", cartRoute);
app.use("/api/coupons", couponRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/upload", uploadRoute);

// ============================================================
// ⚠️ GLOBAL HATA YAKALAYICI
// ============================================================
app.use((err, req, res, next) => {
  console.error("🔥 SUNUCU HATASI:", err.stack);
  
  // Müşteriye teknik detay verme, genel mesaj ver
  res.status(500).json({ 
      message: "Sunucu tarafında bir hata oluştu!", 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error' 
  });
});

// ============================================================
// 🚀 SUNUCUYU BAŞLAT
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});