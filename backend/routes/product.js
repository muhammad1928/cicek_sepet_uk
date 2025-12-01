const router = require('express').Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken'); // Token okumak için
const logActivity = require('../utils/logActivity'); // Loglama Fonksiyonu
const { 
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require('./verifyToken'); // GÜVENLİK İMPORTU
// --- KÜFÜR LİSTESİ ---
const BAD_WORDS = ["aptal", "salak", "gerizekali", "dolandirici", "sahtekar", "scam", "fraud", "idiot"];

// --- YARDIMCI: GİZLİCE KULLANICI ID'Sİ ALMA ---
// (Public rotalarda kimin gezdiğini anlamak için)
const getUserId = (req) => {
  try {
    const authHeader = req.headers.token;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SEC);
      return decoded.id;
    }
  } catch (err) {
    return null; // Token yoksa veya geçersizse null dön
  }
  return null;
};

// =============================================================================
// 1. YENİ ÜRÜN OLUŞTUR (POST)
// =============================================================================
router.post('/', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const productData = req.body;

    // Otomatik Kod
    const generateProductCode = () => "PR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    if (!productData.productCode) {
        productData.productCode = generateProductCode();
    }

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    
    res.status(200).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 2. ÜRÜN GÜNCELLE (PUT)
// =============================================================================
router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {
  try {
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
// 3. ÜRÜN SİL (DELETE)
// =============================================================================
router.delete('/:id', verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Ürün silindi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 4. TEK ÜRÜN GETİR (GET) + LOGLAMA (View Product)
// =============================================================================
router.get('/:id', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor');
    
    // --- LOGLAMA: ÜRÜN GÖRÜNTÜLEME ---
    const userId = getUserId(req);
    if (userId) {
        // Hata olsa bile akışı bozma (catch yok sayılır)
        logActivity(userId, 'view_product', req, { 
            productId: product._id, 
            productName: product.title,
            category: product.category
        }).catch(() => {});
    }
    // ---------------------------------

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 5. TÜM ÜRÜNLERİ GETİR (GET ALL) + LOGLAMA (Search)
// =============================================================================
router.get('/', verifyTokenAndAuthorization, async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qSearch = req.query.search;

  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(5);
    } else if (qCategory) {
      products = await Product.find({ categories: { $in: [qCategory] } });
    } else if (qSearch) {
      // Metin araması
      products = await Product.find({ $text: { $search: qSearch } });
      
      // --- LOGLAMA: ARAMA ---
      const userId = getUserId(req);
      if (userId && qSearch.length > 2) {
          logActivity(userId, 'search', req, { query: qSearch }).catch(() => {});
      }
      // ----------------------

    } else {
      products = await Product.find().sort({ createdAt: -1 }).populate('vendor');
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 6. SATICININ ÜRÜNLERİNİ GETİR
// =============================================================================
router.get('/vendor/:vendorId', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.params.vendorId }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 7. YORUM EKLEME (POST REVIEW)
// =============================================================================
router.post('/:id/reviews', verifyTokenAndAuthorization, async (req, res) => {
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

    // --- LOGLAMA: YORUM YAPMA ---
    const userId = getUserId(req); // Yorum yapan giriş yapmış olmalı ama yine de kontrol
    if (userId) {
       logActivity(userId, 'add_review', req, { productId: product._id, rating }).catch(() => {});
    }
    // ----------------------------

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 8. YORUM SİLME (DELETE REVIEW)
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

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;