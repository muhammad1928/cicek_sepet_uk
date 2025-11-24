const router = require('express').Router();
const Product = require('../models/Product');

// YASAKLI KELİMELER LİSTESİ (Örnek)
const BAD_WORDS = ["aptal", "salak", "gerizekalı", "dolandırıcı", "sahtekar", "bok", "kötü kelime"];

// 1. ÜRÜN EKLE
router.post('/', async (req, res) => {
  try {
    // Frontend'den 'vendor' id'si de gelecek
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// 2. TÜM ÜRÜNLERİ GETİR
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) { res.status(500).json(err); }
});

// 3. TEK ÜRÜN GETİR (DETAY SAYFASI İÇİN - YENİ!)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) { res.status(500).json(err); }
});

// 4. YORUM EKLE (YENİ!)
router.post('/:id/reviews', async (req, res) => {
  const { user, rating, comment } = req.body;

  // --- KÜFÜR KONTROLÜ ---
  const isBad = BAD_WORDS.some(word => comment.toLowerCase().includes(word));
  if (isBad) {
    return res.status(400).json({ message: "Yorumunuz uygunsuz içerik barındırıyor!" });
  }

  try {
    const product = await Product.findById(req.params.id);
    // Yorumu diziye ekle
    product.reviews.push({ user, rating, comment });
    await product.save();
    res.status(200).json(product);
  } catch (err) { res.status(500).json(err); }
});

// 5. YORUM SİL (ADMİN İÇİN - YENİ ROTA)
router.delete('/:id/reviews/:reviewId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    // Yorumu ID'sine göre diziden çıkar ($pull mantığı)
    product.reviews = product.reviews.filter(r => r._id.toString() !== req.params.reviewId);
    
    await product.save();
    res.status(200).json("Yorum silindi");
  } catch (err) {
    res.status(500).json(err);
  }
});
// --- YENİ: SADECE BELLİ BİR SATICININ ÜRÜNLERİNİ GETİR ---
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.params.vendorId }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});
// 6. YORUM OYLAMA (UP/DOWN)
router.put('/:id/reviews/:reviewId/vote', async (req, res) => {
  const { type } = req.body; // 'up' veya 'down'
  try {
    const product = await Product.findById(req.params.id);
    const review = product.reviews.id(req.params.reviewId);
    
    if (type === 'up') {
      review.upvotes += 1;
    } else if (type === 'down') {
      review.downvotes += 1;
    }
    
    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.status(200).json("Silindi"); } catch (err) { res.status(500).json(err); }
});

// SATICININ ÜRÜNLERİNİ GETİR
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    // Sadece 'vendor' alanı bu ID olanları getir
    const products = await Product.find({ vendor: req.params.vendorId }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;