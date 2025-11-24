const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const Coupon = require('../models/Coupon'); // Kupon modelini çağır

router.post('/create-checkout-session', async (req, res) => {
  const { items, couponCode, userEmail, userId } = req.body; // Yeni parametreler

  try {
    let discountRate = 0;

    // 1. Kupon Varsa Backend'de Doğrula (Güvenlik)
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      // Tarih ve Kullanım kontrolü burada da yapılabilir ama basitlik için aktif mi diye bakalım
      if (coupon && coupon.isActive) {
        discountRate = coupon.discountRate;
        
        // Eğer sipariş tamamlanırsa kuponu "kullanıldı" işaretlemek için Webhook gerekir.
        // Ancak basit MVP mantığında, kullanıcıyı buraya kadar getirdiysek kuponu "kullandı" sayabiliriz
        // veya sipariş oluştuğunda (/api/orders) işaretleyebiliriz. 
        // Biz Stripe'a odaklanalım.
      }
    }

    // 2. Ürünleri Hazırla ve İndirimi Uygula
    const lineItems = items.map((product) => {
      // Orijinal Fiyat
      let unitAmount = Math.round(product.price * 100);
      
      // İndirim Varsa Uygula
      if (discountRate > 0) {
        const discountAmount = (unitAmount * discountRate) / 100;
        unitAmount = Math.round(unitAmount - discountAmount);
      }

      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: product.title,
            images: [product.img],
            description: discountRate > 0 ? `%${discountRate} İndirim Uygulandı` : undefined,
          },
          unit_amount: unitAmount,
        },
        quantity: product.quantity,
      };
    });

    // 3. Oturumu Başlat (Email Ekli)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: userEmail, // Stripe formunda email otomatik dolar
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/',
      metadata: {
        userId: userId,
        couponCode: couponCode // Stripe panelinde görmek için
      }
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;