const router = require("express").Router();
const Stripe = require("stripe");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const dotenv = require("dotenv");
const { 
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyTokenAndSeller,
  verifyTokenAndCourier,
  verifyTokenAndWorker
} = require('./verifyToken'); // GÜVENLİK İMPORTU
dotenv.config();
const stripe = Stripe(process.env.STRIPE_KEY);

// --- FİYATLANDIRMA KURALLARI ---
const PRICING = {
  standart: 5.00,    // 2-3 Gün
  nextDay: 9.99,     // Ertesi Gün
  sameDay: 24.99,    // Aynı Gün
  freeThreshold: 200 // Ücretsiz Kargo Limiti (Sadece Standart için)
};

router.post("/create-checkout-session", verifyTokenAndAuthorization, async (req, res) => {
  const { items, couponCode, userEmail, userId, deliveryType } = req.body;

  try {
    let line_items = [];
    let productTotal = 0;

    // 1. ÜRÜNLERİ DOĞRULA VE GERÇEK FİYATLARI AL
    for (const item of items) {
      const product = await Product.findById(item._id);
      
      if (!product) {
        return res.status(404).json({ message: `Ürün bulunamadı: ${item.title}` });
      }
      
      // Stok Kontrolü
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stok yetersiz: ${product.title} (Kalan: ${product.stock})` });
      }

      // Stripe için ürün formatı (Gerçek DB fiyatı ile)
      line_items.push({
        price_data: {
          currency: "gbp",
          product_data: {
            name: product.title,
            images: [product.img],
            metadata: {
              id: product._id.toString()
            }
          },
          unit_amount: Math.round(product.price * 100), // Kuruş cinsinden (10.50 -> 1050)
        },
        quantity: item.quantity,
      });

      productTotal += product.price * item.quantity;
    }

    // 2. KUPON İŞLEMLERİ
    let stripeDiscounts = [];
    let isFreeDelivery = false;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      
      if (coupon && coupon.isActive) {
        // Tarih Kontrolü
        const now = new Date();
        const expiry = coupon.expiryDate ? new Date(coupon.expiryDate) : null;
        if (expiry) expiry.setHours(23, 59, 59, 999); // Gün sonuna kadar geçerli

        const isExpired = expiry && now > expiry;
        const isUsed = userId && coupon.usedBy.includes(userId);

        if (!isExpired && !isUsed) {
           // Kargo bedava mı?
           if (coupon.includeDelivery) isFreeDelivery = true;

           // Stripe için anlık kupon oluştur (Yüzdelik indirim)
           // Not: Gerçek projelerde Stripe Dashboard'daki kupon ID'si kullanılabilir,
           // burada dinamik oluşturuyoruz.
           const stripeCoupon = await stripe.coupons.create({
             percent_off: coupon.discountRate,
             duration: 'once',
             name: couponCode
           });
           
           stripeDiscounts.push({ coupon: stripeCoupon.id });
        }
      }
    }

    // 3. KARGO ÜCRETİ HESAPLAMA (Sunucu Taraflı)
    let deliveryFee = 0;
    const type = deliveryType || 'standart';

    if (!isFreeDelivery) {
        // Kupon kargoyu karşılamıyorsa hesapla
        switch (type) {
            case 'same-day':
                deliveryFee = PRICING.sameDay;
                break;
            case 'next-day':
                deliveryFee = PRICING.nextDay;
                break;
            case 'standart':
            default:
                // İndirimli tutar üzerinden mi yoksa ham tutar üzerinden mi limit?
                // Genelde ham tutar üzerinden hesaplanır.
                if (productTotal < PRICING.freeThreshold) {
                    deliveryFee = PRICING.standart;
                } else {
                    deliveryFee = 0;
                }
                break;
        }
    }

    // Kargo ücretini ayrı bir kalem olarak ekle
    if (deliveryFee > 0) {
        line_items.push({
            price_data: {
                currency: "gbp",
                product_data: {
                    name: "Teslimat Ücreti / Delivery Fee",
                    description: type === 'same-day' ? 'Aynı Gün Teslimat (Premium)' : type === 'next-day' ? 'Ertesi Gün Teslimat' : 'Standart Teslimat'
                },
                unit_amount: Math.round(deliveryFee * 100),
            },
            quantity: 1,
        });
    }

    // 4. OTURUM OLUŞTURMA
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: `http://localhost:5173/success`,
      cancel_url: `http://localhost:5173/`,
      customer_email: userEmail,
      discounts: stripeDiscounts, // İndirim burada uygulanır
      metadata: {
        userId: userId,
        couponCode: couponCode || "",
        deliveryType: type
      }
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Stripe Hatası:", err);
    res.status(500).json({ message: "Ödeme başlatılamadı." });
  }
});

module.exports = router;