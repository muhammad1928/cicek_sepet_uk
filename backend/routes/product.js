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

// --- YARDIMCI: Cache Temizleme Fonksiyonu ---
const clearProductCache = async (productId) => {
    try {
        if (redisClient && redisClient.isOpen) {
            // 1. Tekil ürün cache'ini sil
            await redisClient.del(`products:${productId}`);
            
            // 2. Listeleme cache'lerini sil (Wildcard/Pattern silme)
            // Redis'te doğrudan pattern silme yoktur, scan ile bulup silmek gerekir.
            // Güvenli ve basit yöntem: En sık kullanılan list keylerini manuel silmektir.
            // Not: Prod ortamında 'scan' döngüsü daha sağlıklıdır.
            const keys = await redisClient.keys('products:list:*');
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
            
            // Satıcı ürün listesini de temizleyelim (Opsiyonel ama iyi olur)
            // Ancak vendorId parametresi burada olmadığı için genel temizlik yapıyoruz.
        }
    } catch (e) {
        console.log("Redis cache temizleme hatası:", e.message);
    }
};

// =============================================================================
// 1. YENİ ÜRÜN OLUŞTUR (POST)
// =============================================================================
router.post('/', verifyTokenAndSeller, async (req, res) => {
  try {
    const productData = req.body;
    
    // Satıcı ise vendor alanını zorla (Güvenlik)
    if (req.user.role === 'vendor') {
        productData.vendor = req.user.id;
    }

    // --- RESİM SENKRONİZASYONU (POST) ---
    // 1. Eğer imgs dizisi geldi ve doluysa -> İlk resmi 'img' alanına kopyala (Thumbnail için)
    if (productData.imgs && productData.imgs.length > 0) {
        productData.img = productData.imgs[0];
    }
    // 2. Eğer imgs yok ama tekil img geldiyse -> Onu diziye çevir
    else if (productData.img) {
        productData.imgs = [productData.img];
    }
    // 3. Hiçbiri yoksa -> Boşalt
    else {
        productData.imgs = [];
        productData.img = "";
    }

    // Ürün kodu oluştur
    const generateProductCode = () => "PR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    if (!productData.productCode) productData.productCode = generateProductCode();

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    // Cache temizle
    await clearProductCache(savedProduct._id);

    res.status(200).json(savedProduct);
  } catch (err) {
    console.error("Ürün ekleme hatası:", err);
    res.status(500).json({ message: "Ürün eklenemedi", error: err.message });
  }
});

// =============================================================================
// 2. ÜRÜN GÜNCELLE (PUT)
// =============================================================================
router.put('/:id', verifyTokenAndSeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json("Ürün bulunamadı");

    // Satıcı yetki kontrolü
    if (req.user.role === 'vendor' && product.vendor?.toString() !== req.user.id) {
        return res.status(403).json("Bu ürünü düzenleme yetkiniz yok!");
    }

    const updateData = { ...req.body };

    // --- RESİM SENKRONİZASYONU (PUT - KRİTİK KISIM) ---
    // Frontend'den 'imgs' dizisi geldiyse, 'img' alanını da buna göre güncellemek ZORUNDAYIZ.
    // Aksi takdirde imgs güncellenir ama ana resim (img) eski kalır.
    if (updateData.imgs) {
        if (updateData.imgs.length > 0) {
            updateData.img = updateData.imgs[0]; // İlk resmi ana resim yap
        } else {
            updateData.img = ""; // Dizi boşsa ana resmi sil
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    // Cache temizle (Eski resimlerin görünmemesi için şart)
    await clearProductCache(req.params.id);

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 3. ÜRÜN SİL (DELETE)
// =============================================================================
router.delete('/:id', verifyTokenAndSeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json("Ürün bulunamadı");

    if (req.user.role === 'vendor' && product.vendor?.toString() !== req.user.id) {
        return res.status(403).json("Bu ürünü silme yetkiniz yok!");
    }

    await Product.findByIdAndDelete(req.params.id);
    
    // Cache temizle
    await clearProductCache(req.params.id);

    res.status(200).json("Ürün silindi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 4. TEK ÜRÜN GETİR (GET)
// =============================================================================
router.get('/:id', async (req, res) => {
  const cacheKey = `products:${req.params.id}`;

  try {
    // Redis Kontrol
    try {
        if (redisClient && redisClient.isOpen) {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) return res.status(200).json(JSON.parse(cachedData));
        }
    } catch (e) {}

    // GÜVENLİK: Email'i populate etme!
    const product = await Product.findById(req.params.id)
        .populate('vendor', 'username fullName shopName img'); 
    
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    // Redis Kaydet (1 saat)
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(product));
        }
    } catch (e) {}

    // Loglama
    const userId = getUserId(req);
    if (userId) {
        try { logActivity(userId, 'view_product', req, { productId: product._id }); } catch(e) {}
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 5. TÜM ÜRÜNLERİ GETİR / FİLTRELE (GET ALL)
// =============================================================================
router.get('/', async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qSearch = req.query.search;

  const cacheKey = `products:list:${JSON.stringify(req.query)}`;

  try {
    // 1. Redis Oku
    try {
        if (redisClient && redisClient.isOpen) {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) return res.status(200).json(JSON.parse(cachedData));
        }
    } catch (e) {}

    // 2. DB Sorgusu
    let products;
    // GÜVENLİK: Email hariç populate ayarı
    const populateSettings = { path: 'vendor', select: 'username fullName shopName img' };

    if (qNew) {
      products = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate(populateSettings);
    } else if (qCategory && qCategory !== "all") {
      products = await Product.find({
        isActive: true,
        $or: [
            { category: qCategory },
            { tags: { $in: [qCategory] } }
        ]
      }).sort({ createdAt: -1 }).populate(populateSettings);
      
    } else if (qSearch) {
      products = await Product.find({ 
          isActive: true,
          $or: [
            { title: { $regex: qSearch, $options: "i" } },
            { desc: { $regex: qSearch, $options: "i" } }
          ]
      }).populate(populateSettings);
    } else {
      products = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate(populateSettings);
    }

    // 3. Redis Yaz (10 dakika)
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.setEx(cacheKey, 600, JSON.stringify(products));
        }
    } catch (e) {}

    res.status(200).json(products);

  } catch (err) {
    console.error("Liste Hatası:", err);
    res.status(500).json({ message: "Listeleme hatası", error: err.message });
  }
});

// =============================================================================
// 6. SATICI ÜRÜNLERİ
// =============================================================================
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    // GÜVENLİK: Email hariç populate
    const products = await Product.find({ vendor: req.params.vendorId })
        .sort({ createdAt: -1 })
        .populate('vendor', 'username shopName img'); 
        
    res.status(200).json(products);
  } catch (err) { res.status(500).json(err); }
});

// =============================================================================
// 7. YORUM İŞLEMLERİ
// =============================================================================
router.post('/:id/reviews', verifyToken, async (req, res) => {
  const { user, rating, comment } = req.body;
  
  if (BAD_WORDS.some(word => comment.toLowerCase().includes(word))) {
      return res.status(400).json({ message: "Yorumunuz uygunsuz içerik barındırıyor." });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    const newReview = { 
        user: req.body.user || req.user.id, 
        rating: Number(rating), 
        comment, 
        date: new Date() 
    };

    product.reviews.push(newReview);

    const totalRating = product.reviews.reduce((acc, item) => acc + item.rating, 0);
    product.averageRating = (totalRating / product.reviews.length).toFixed(1);

    await product.save();

    // Cache temizle (Yorum eklendiğinde de cache silinmeli)
    await clearProductCache(req.params.id);

    res.status(200).json(product);
  } catch (err) { res.status(500).json(err); }
});

router.delete('/:id/reviews/:reviewId', verifyTokenAndAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    product.reviews = product.reviews.filter(r => r._id.toString() !== req.params.reviewId);

    if (product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((acc, item) => acc + item.rating, 0);
        product.averageRating = (totalRating / product.reviews.length).toFixed(1);
    } else {
        product.averageRating = 0;
    }

    await product.save();
    
    // Cache temizle
    await clearProductCache(req.params.id);
    
    res.status(200).json({ message: "Yorum silindi.", product });
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;