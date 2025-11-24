const router = require('express').Router();
const User = require('../models/User');
const Product = require('../models/Product'); // <--- BU SATIR EKLENDİ (Populate için gerekli)
const bcrypt = require('bcryptjs');

// 1. KULLANICI GÜNCELLE (Şifre veya Bilgi)
router.put('/:id', async (req, res) => {
  if (req.body.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } catch (err) {
      return res.status(500).json(err);
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    const { password, ...others } = updatedUser._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. ADRES SİLME
router.delete('/:id/addresses/:addressId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.updateOne({ $pull: { savedAddresses: { _id: req.params.addressId } } });
    res.status(200).json("Adres silindi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. FAVORİ EKLE / ÇIKAR (GÜNCELLENDİ: SAYAÇLI SİSTEM)
router.put('/:id/favorites', async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.params.id);
    const isFavorited = user.favorites.includes(productId);

    if (isFavorited) {
      // 1. Kullanıcıdan Çıkar
      await user.updateOne({ $pull: { favorites: productId } });
      // 2. Ürün Sayacını Azalt (-1)
      await Product.findByIdAndUpdate(productId, { $inc: { favoritesCount: -1 } });
      
      res.status(200).json("Çıkarıldı");
    } else {
      // 1. Kullanıcıya Ekle
      await user.updateOne({ $push: { favorites: productId } });
      // 2. Ürün Sayacını Artır (+1)
      await Product.findByIdAndUpdate(productId, { $inc: { favoritesCount: 1 } });
      
      res.status(200).json("Eklendi");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. FAVORİLERİ GETİR (Populate Kullanılıyor!)
router.get('/:id/favorites', async (req, res) => {
  try {
    // .populate('favorites') diyebilmek için Product modelinin require edilmiş olması gerekir.
    const user = await User.findById(req.params.id).populate('favorites');
    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. ADRESLERİ GETİR
router.get('/:id/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user.savedAddresses || []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 6. TÜM KULLANICILARI GETİR (ADMİN İÇİN)
router.get('/', async (req, res) => {
  try {
    // Şifreleri gönderme, sadece gerekli bilgileri al
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 7. KULLANICI ROLÜNÜ DEĞİŞTİR (ADMİN İÇİN)
router.put('/:id/role', async (req, res) => {
  try {
    const { role } = req.body; // 'admin', 'vendor', 'courier', 'customer'
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role: role },
      { new: true }
    ).select('-password');
    
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;