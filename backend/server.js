const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// const mongoSanitize = require("express-mongo-sanitize");
// const xss = require("xss-clean");
const hpp = require("hpp");
const morgan = require("morgan");
const { RedisStore } = require("rate-limit-redis"); // Yeni
const redisClient = require("./utils/redisClient"); // Yeni
const logger = require("./utils/logger"); // Yeni

// --- ROTA İMPORTLARI ---
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
const cartRoute = require("./routes/cart");
const couponRoute = require("./routes/coupon");
const paymentRoute = require("./routes/payment");
const uploadRoute = require("./routes/upload");
const cookieParser = require("cookie-parser");
const contactRoute = require("./routes/contact");
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

// GÜVENLİ BEYAZ LİSTE (Whitelist)
const allowedOrigins = [
  "http://localhost:5173",                  // Geliştirme ortamı
  "https://cicek-sepet-uk.vercel.app",      // Canlı Frontend (Slashsız)
  "https://cicek-sepet-uk.vercel.app/",     // Canlı Frontend (Slashlı - Bazen tarayıcı ekler)
  process.env.CLIENT_URL                    // .env dosyasından gelen (Yedek)
];

const corsOptions = {
  origin: (origin, callback) => {
    // !origin: Postman, Mobile App veya Stripe Webhook gibi "tarayıcı olmayan" istekler.
    // allowedOrigins.includes(origin): Gelen istek bizim listemizde var mı?
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Hatası: ${origin} adresine izin verilmiyor.`));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Cookie (Token) transferi için ZORUNLU
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
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});
// Sadece /api rotalarına uygula
app.use("/api", limiter);



app.use(cookieParser());

// 5. Body Parser (Veriyi JSON olarak oku)
// Webhook için raw body gerekebilir, o yüzden webhook rotasını bunun üzerine koymak gerekir.
app.use(express.json({ limit: '10kb' })); // 10kb'dan büyük veri gelirse reddet (DDoS önlemi)

// 6. Data Sanitization (NoSQL Injection Önleme)
// app.use(mongoSanitize());
// 6. MANUEL NoSQL Injection Koruması (Kütüphanesiz - Hata Vermez)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj instanceof Object) {
      for (const key in obj) {
        if (/^\$/.test(key)) {
          delete obj[key]; // $ ile başlayan (MongoDB operatörü) keyleri sil
        } else {
          sanitize(obj[key]); // İç içe objeleri de temizle
        }
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
});
// 7. Data Sanitization (XSS Önleme)
// app.use(xss());
// 7. MANUEL XSS Koruması (xss-clean yerine)
// Basitçe HTML taglerini encode eder (<script> -> &lt;script&gt;)
const simpleXSS = (req, res, next) => {
    const escapeHTML = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"']/g, (m) => ({ 
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' 
        })[m]);
    };

    const clean = (obj) => {
        if (!obj) return;
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = escapeHTML(obj[key]);
            } else if (typeof obj[key] === 'object') {
                clean(obj[key]);
            }
        }
    };

    if (req.body) clean(req.body);
    // req.query ve req.params genellikle read-only olabilir, onları ellemiyoruz
    // zaten body'deki XSS en tehlikelisidir.
    
    next();
};
app.use(simpleXSS);

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
app.use("/api/contact", contactRoute);

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

// GLOBAL HATA YAKALAYICI (WINSTON İLE)
app.use((err, req, res, next) => {
  // Hataları dosyaya yaz
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
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