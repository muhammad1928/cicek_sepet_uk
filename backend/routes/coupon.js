const router = require('express').Router();
const Coupon = require('../models/Coupon');

// 1. KUPON SORGULA (GÜNCELLENDİ)
// Artık userId'yi de query olarak alacağız: /validate/KOD?userId=123
router.get('/validate/:code', async (req, res) => {
  const { userId } = req.query; // URL'den userId al

  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });
    
    if (!coupon) return res.status(404).json({ message: "Geçersiz kupon kodu." });
    if (!coupon.isActive) return res.status(400).json({ message: "Bu kupon pasif." });

    // Tarih Kontrolü
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "Bu kuponun süresi dolmuş." });
    }

    // Kullanım Kontrolü (Eğer giriş yapmışsa)
    if (userId && coupon.usedBy.includes(userId)) {
      return res.status(400).json({ message: "Bu kuponu zaten kullandınız." });
    }

    res.status(200).json(coupon); 
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. KUPON OLUŞTUR (Admin İçin)
router.post('/', async (req, res) => {
  try {
    const newCoupon = new Coupon(req.body);
    const savedCoupon = await newCoupon.save();
    res.status(200).json(savedCoupon);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. TÜM KUPONLARI GETİR (Admin İçin)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (err) { res.status(500).json(err); }
});

// 4. KUPON SİL (YENİ)
router.delete('/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json("Kupon silindi.");
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;