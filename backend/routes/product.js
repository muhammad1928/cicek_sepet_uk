const router = require('express').Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const redisClient = require('../utils/redisClient');
const logActivity = require('../utils/logActivity');

// --- GÜVENLİK KATMANI ---
const { 
  verifyToken, 
  verifyTokenAndAdmin, 
  verifyTokenAndSeller 
} = require('./verifyToken');

const BAD_WORDS = ["aptal", "salak", "gerizekali", "dolandirici", "sahtekar", "scam", "fraud", "idiot"];

// Yardımcı: Token'dan User ID al (Hata verirse null dön)
const getUserId = (req) => {
  try {
    const authHeader = req.headers.token;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SEC);
      return decoded.id;
    }
  } catch (err) { return null; }
  return null;
};

// =============================================================================
// 1. YENİ ÜRÜN OLUŞTUR (POST) - KİLİTLİ
// =============================================================================
router.post('/', verifyTokenAndSeller, async (req, res) => {
  try {
    const productData = req.body;
    
    // Satıcı ekliyorsa vendor ID'yi sabitle
    if (req.user.role === 'vendor') {
        productData.vendor = req.user.id;
    }

    const generateProductCode = () => "PR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    if (!productData.productCode) productData.productCode = generateProductCode();

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    // --- KRİTİK: YENİ ÜRÜN EKLENİNCE CACHE'İ SİL ---
    // Böylece ana sayfa yenilendiğinde güncel veriyi çeker
    if (redisClient.isOpen) {
        const keys = await redisClient.keys('products:*');
        if (keys.length > 0) await redisClient.del(keys);
    }

    res.status(200).json(savedProduct);
  } catch (err) {
    console.error("Ürün ekleme hatası:", err);
    res.status(500).json(err);
  }
});

// =============================================================================
// 2. ÜRÜN GÜNCELLE (PUT) - KİLİTLİ
// =============================================================================
router.put('/:id', verifyTokenAndSeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json("Ürün bulunamadı");

    if (req.user.role === 'vendor' && product.vendor?.toString() !== req.user.id) {
        return res.status(403).json("Bu ürünü düzenleme yetkiniz yok!");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 3. ÜRÜN SİL (DELETE) - KİLİTLİ
// =============================================================================
router.delete('/:id', verifyTokenAndSeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json("Ürün bulunamadı");

    if (req.user.role === 'vendor' && product.vendor?.toString() !== req.user.id) {
        return res.status(403).json("Bu ürünü silme yetkiniz yok!");
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Ürün silindi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 4. TEK ÜRÜN GETİR (GET) + LOG
// =============================================================================
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor');
    
    // Loglama (Hata olsa bile devam et)
    const userId = getUserId(req);
    if (userId) {
        try {
            logActivity(userId, 'view_product', req, { 
                productId: product._id, 
                productName: product.title 
            });
        } catch(e) {}
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("Ürün Detay Hatası:", err); // Render loglarında görmek için
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// =============================================================================
// 5. TÜM ÜRÜNLERİ GETİR (GET ALL) - DÜZELTİLDİ (Regex Search)
// =============================================================================
// router.get('/', async (req, res) => {
//   const qNew = req.query.new;
//   const qCategory = req.query.category;
//   const qSearch = req.query.search;

//   // Cache Anahtarı oluştur (Sorguya göre değişmeli)
//   const cacheKey = `products:${JSON.stringify(req.query)}`;


//   try {
//     // 1. Önce Redis'e bak
//     const cachedData = await redisClient.get(cacheKey);
//     if (cachedData) {
//       // Varsa direkt gönder (Veritabanına gitme!)
//       return res.status(200).json(JSON.parse(cachedData));
//     }

//     // 2. Yoksa veritabanından çek
//     let products;
//     if (qNew) {
//       products = await Product.find().sort({ createdAt: -1 }).limit(5);
//     } else if (qCategory) {
//       products = await Product.find({ categories: { $in: [qCategory] } });
//     } else if (qSearch) {
//       // DÜZELTME: $text yerine $regex kullanıyoruz (Index gerektirmez, daha güvenli çalışır)
//       products = await Product.find({ 
//         title: { $regex: qSearch, $options: "i" } 
//       });
      
//       // Loglama
//       const userId = getUserId(req);
//       if (userId && qSearch.length > 2) {
//           try { logActivity(userId, 'search', req, { query: qSearch }); } catch(e){}
//       }

//     } else {
//       // Varsayılan: Hepsini getir
//       products = await Product.find().sort({ createdAt: -1 }).populate('vendor');
//     }

//     // 3. Veriyi Redis'e Kaydet (Örn: 1 Saatlik - 3600sn)
//     await redisClient.setEx(cacheKey, 3600, JSON.stringify(products));
    
//     res.status(200).json(products);
//   } catch (err) {
//     // Hata detayını konsola yaz (Server terminalinde görebilmek için)
//     console.error("Ürün çekme hatası:", err);
//     res.status(500).json({ message: "Ürünler yüklenirken hata oluştu.", error: err.message });
//   }
// });
router.get('/', async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qSearch = req.query.search;

  // Cache Anahtarı
  const cacheKey = `products:${JSON.stringify(req.query)}`;

  try {
    // 1. REDIS KONTROLÜ (Eğer Redis çalışıyorsa)
    if (redisClient.isOpen) {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            // console.log("Veri Redis'ten geldi ⚡");
            return res.status(200).json(JSON.parse(cachedData));
        }
    }

    // 2. VERİTABANI SORGUSU
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(5);
    } else if (qCategory && qCategory !== "all") {
      products = await Product.find({ categories: { $in: [qCategory] } });
    } else if (qSearch) {
      products = await Product.find({ title: { $regex: qSearch, $options: "i" } });
      // ... loglama ...
    } else {
      // Varsayılan: Hepsini getir
      products = await Product.find().sort({ createdAt: -1 }).populate('vendor');
    }

    // 3. REDIS'E KAYDET (Süresi: 10 Dakika)
    // Çok uzun süre (1 saat) verirsek yeni ürünler geç görünür. 600sn idealdir.
    if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, 600, JSON.stringify(products));
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Ürün Listeleme Hatası:", err);
    res.status(500).json({ message: "Ürünler yüklenirken hata oluştu." });
  }
});

// =============================================================================
// 6. SATICI ÜRÜNLERİ
// =============================================================================
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.params.vendorId }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) { res.status(500).json(err); }
});

// =============================================================================
// 7. YORUM EKLE (POST)
// =============================================================================
router.post('/:id/reviews', verifyToken, async (req, res) => {
  const { user, rating, comment } = req.body;

  const isBad = BAD_WORDS.some(word => comment.toLowerCase().includes(word));
  if (isBad) return res.status(400).json({ message: "Uygunsuz içerik!" });

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    const newReview = { user, rating: Number(rating), comment, date: new Date() };
    product.reviews.push(newReview);

    const totalRating = product.reviews.reduce((acc, item) => acc + item.rating, 0);
    product.averageRating = (totalRating / product.reviews.length).toFixed(1);

    await product.save();
    
    try { logActivity(req.user.id, 'add_review', req, { productId: product._id, rating }); } catch(e){}

    res.status(200).json(product);
  } catch (err) { res.status(500).json(err); }
});

// =============================================================================
// 8. YORUM SİL (DELETE) - SADECE ADMIN
// =============================================================================
router.delete('/:id/reviews/:reviewId', verifyTokenAndAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    const initialLength = product.reviews.length;
    product.reviews = product.reviews.filter(r => r._id.toString() !== req.params.reviewId);

    if (product.reviews.length === initialLength) return res.status(404).json({ message: "Yorum bulunamadı." });

    if (product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((acc, item) => acc + item.rating, 0);
        product.averageRating = (totalRating / product.reviews.length).toFixed(1);
    } else {
        product.averageRating = 0;
    }

    await product.save();
    res.status(200).json({ message: "Yorum silindi.", product });
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;