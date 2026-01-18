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

// Token'dan User ID Çözümleme
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
// Ürün eklendiğinde, güncellendiğinde veya silindiğinde çalışır.
const clearProductCache = async (productId) => {
    try {
        if (redisClient && redisClient.isOpen) {
            // 1. Tekil ürün cache'ini sil
            if (productId) {
                await redisClient.del(`products:${productId}`);
            }
            
            // 2. Listeleme cache'lerini sil
            // Yeni ürün eklenince sayfa sıralaması bozulur, bu yüzden listeleri temizliyoruz.
            const keys = await redisClient.keys('products:list:*');
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
            console.log("⚡ Redis Cache temizlendi (Ürün ID ve Listeler).");
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

    // --- RESİM SENKRONİZASYONU ---
    if (productData.imgs && productData.imgs.length > 0) {
        productData.img = productData.imgs[0];
    } else if (productData.img) {
        productData.imgs = [productData.img];
    } else {
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

    // --- RESİM SENKRONİZASYONU ---
    if (updateData.imgs) {
        if (updateData.imgs.length > 0) {
            updateData.img = updateData.imgs[0];
        } else {
            updateData.img = "";
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    // Cache temizle
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
// 4. TEK ÜRÜN GETİR (GET) - (Redis Aktif)
// =============================================================================
router.get('/:id', async (req, res) => {
  const cacheKey = `products:${req.params.id}`;

  try {
    // 1. Redis Oku
    try {
        if (redisClient && redisClient.isOpen) {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) return res.status(200).json(JSON.parse(cachedData));
        }
    } catch (e) {
        console.log("Redis okuma hatası:", e.message);
    }

    // 2. DB Sorgusu
    const product = await Product.findById(req.params.id)
        .populate('vendor', 'username fullName shopName img'); 
    
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    // 3. Redis Yaz (1 Saatlik Cache)
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(product));
        }
    } catch (e) {
        console.log("Redis yazma hatası:", e.message);
    }

    // 4. Loglama
    const userId = getUserId(req); 
    try { 
        if (typeof logActivity === 'function') {
            await logActivity(userId || null, 'view_product', req, { 
                productId: product._id,
                productName: product.title,
                price: product.price
            }); 
        }
    } catch(e) { console.error("Log error:", e.message); }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 5. TÜM ÜRÜNLERİ GETİR / FİLTRELE (PAGINATION + REDIS AKTİF)
// =============================================================================
router.get('/', async (req, res) => {
  const qNew = req.query.new;
  const qSearch = req.query.search;
  
  // Frontend'den virgülle ayrılmış kategoriler gelebilir
  const qCategories = req.query.categories ? req.query.categories.split(',') : null;

  // --- PAGINATION AYARLARI ---
  const page = parseInt(req.query.page) || 1;      // Hangi sayfa? (Varsayılan 1)
  const limit = parseInt(req.query.limit) || 8;    // Sayfada kaç ürün? (Varsayılan 8)
  const skip = (page - 1) * limit;                 // Kaç ürün atlanacak?

  // Cache anahtarı: Tüm query parametrelerini içerir (page, limit, category, search)
  const cacheKey = `products:list:${JSON.stringify(req.query)}`;

  try {
    // -----------------------------------------------------
    // 1. Redis Oku (AKTİF)
    // -----------------------------------------------------
    try {
        if (redisClient && redisClient.isOpen) {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                return res.status(200).json(JSON.parse(cachedData));
            }
        }
    } catch (e) {
        console.log("Redis okuma hatası:", e.message);
    }

    // -----------------------------------------------------
    // 2. DB Sorgusunu Hazırla
    // -----------------------------------------------------
    let query = { isActive: true };

    if (qNew) {
      // Yeni ürünler (query zaten isActive: true)
    } else if (qCategories && qCategories.length > 0) {
      // Kategori Filtresi (Çoklu)
      query.$or = [
        { category: { $in: qCategories } },
        { tags: { $in: qCategories } }
      ];
    } else if (qSearch) {
      // Arama Filtresi + Loglama
      const userId = getUserId(req); 
      try {
          if(typeof logActivity === 'function') {
             await logActivity(userId || null, 'search_query', req, { searchTerm: qSearch });
          }
      } catch(e) {}

      query.$or = [
        { title: { $regex: qSearch, $options: "i" } },
        { desc: { $regex: qSearch, $options: "i" } }
      ];
    }

    // -----------------------------------------------------
    // 3. Veritabanından Çek
    // -----------------------------------------------------
    const populateSettings = { path: 'vendor', select: 'username fullName shopName img' };
    
    // Toplam sayıyı bul (Frontend 'Load More' butonu için gerekli)
    const totalItems = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)   // Pagination: Atla
      .limit(limit) // Pagination: Limitle
      .populate(populateSettings);

    const responseData = {
        products,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page
    };

    // -----------------------------------------------------
    // 4. Redis Yaz (AKTİF - 5 Dakika)
    // -----------------------------------------------------
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
        }
    } catch (e) {
        console.log("Redis yazma hatası:", e.message);
    }

    res.status(200).json(responseData);

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

    // Cache temizle
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