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

    // --- RESİM URL DÜZELTMESİ ---
    // Eğer imgs dizisi gelmediyse ama tekil img geldiyse diziye çevir.
    // Eğer imgs dizisi geldiyse dokunma, aynen kaydet.
    if (!productData.imgs || productData.imgs.length === 0) {
        if (productData.img) {
            productData.imgs = [productData.img];
        } else {
            productData.imgs = [];
        }
    }

    // Ürün kodu oluştur
    const generateProductCode = () => "PR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    if (!productData.productCode) productData.productCode = generateProductCode();

    // Veriyi modele aktar (imgs dizisi req.body içinde olduğu sürece Model bunu kabul eder)
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    // Cache temizle (Wildcard temizleme stratejisi)
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.del('products:all'); 
            // Daha gelişmiş yapılarda pattern silme gerekebilir
        }
    } catch (redisErr) {
        console.log("Redis temizleme uyarısı:", redisErr.message);
    }

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

    // Gelen veriyi hazırla
    const updateData = { ...req.body };

    // Eğer kullanıcı imgs dizisini boşaltıp tek bir resim linki (img) gönderdiyse senkronize et
    if (updateData.img && (!updateData.imgs || updateData.imgs.length === 0)) {
        updateData.imgs = [updateData.img];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    // Cache temizle
    try { if (redisClient && redisClient.isOpen) await redisClient.del(`products:${req.params.id}`); } catch(e){}

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
    try { if (redisClient && redisClient.isOpen) await redisClient.del(`products:${req.params.id}`); } catch(e){}

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

    // 🚨 GÜVENLİK DÜZELTMESİ: 'email' alanını populate'den kaldırdım.
    // Sadece public olması gereken verileri çekiyoruz.
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
    // Ortak populate ayarı: Email hariç
    const populateSettings = { path: 'vendor', select: 'username fullName shopName' };

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
    // Burada satıcı detayına gerek yoksa populate yapmayabiliriz,
    // ya da yine email olmadan yapabiliriz.
    const products = await Product.find({ vendor: req.params.vendorId })
        .sort({ createdAt: -1 })
        .populate('vendor', 'username shopName'); // Email hariç
        
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

    // Cache temizle
    try { if (redisClient && redisClient.isOpen) await redisClient.del(`products:${req.params.id}`); } catch(e){}

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
    try { if (redisClient && redisClient.isOpen) await redisClient.del(`products:${req.params.id}`); } catch(e){}
    
    res.status(200).json({ message: "Yorum silindi.", product });
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;