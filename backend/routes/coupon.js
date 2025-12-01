const router = require('express').Router();
const Coupon = require('../models/Coupon');
const { 
  verifyTokenAndAdmin,
} = require('./verifyToken'); // GÜVENLİK İMPORTU
// =============================================================================
// 1. KUPON OLUŞTUR (SADECE ADMIN)
// =============================================================================
router.post('/', verifyTokenAndAdmin, async (req, res) => {
  try {
    const { code, discountRate, expiryDate, includeDelivery } = req.body;

    // Kodun benzersiz olup olmadığını kontrol et (Opsiyonel, MongoDB unique index zaten hata verir ama temiz mesaj için)
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Bu kupon kodu zaten var." });
    }

    const newCoupon = new Coupon({
      code,
      discountRate,
      expiryDate,
      includeDelivery // Kargo ücretini kapsıyor mu?
    });

    const savedCoupon = await newCoupon.save();
    res.status(200).json(savedCoupon);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 2. KUPON SİL (SADECE ADMIN)
// =============================================================================
router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json("Kupon başarıyla silindi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 3. TÜM KUPONLARI GETİR (SADECE ADMIN)
// =============================================================================
router.get('/', verifyTokenAndAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 4. KUPON DOĞRULA (HERKES KULLANABİLİR)
// =============================================================================
router.get('/validate/:code',  async (req, res) => {
  try {
    const { userId } = req.query; // Kullanıcı ID'si (Daha önce kullanmış mı diye bakmak için)
    const coupon = await Coupon.findOne({ code: req.params.code });

    // 1. Kupon var mı?
    if (!coupon) {
      return res.status(404).json({ message: "Geçersiz kupon kodu." });
    }

    // 2. Kupon aktif mi?
    if (!coupon.isActive) {
      return res.status(400).json({ message: "Bu kupon şu an pasif durumda." });
    }

    // 3. Tarih Kontrolü (Gün sonuna kadar geçerli olması için)
    if (coupon.expiryDate) {
        const now = new Date();
        const expiry = new Date(coupon.expiryDate);
        
        // Son kullanma tarihini o günün bitimine (23:59:59.999) ayarla
        expiry.setHours(23, 59, 59, 999);

        if (now > expiry) {
            return res.status(400).json({ message: "Bu kuponun süresi dolmuş." });
        }
    }

    // 4. Kullanım Hakkı Kontrolü (Eğer üye girişi yapılmışsa)
    if (userId && coupon.usedBy.includes(userId)) {
        return res.status(400).json({ message: "Bu kuponu daha önce kullandınız." });
    }

    // Her şey yolunda, kupon verisini döndür
    res.status(200).json(coupon);

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;