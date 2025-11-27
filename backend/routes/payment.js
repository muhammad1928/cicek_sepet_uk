const router = require('express').Router();
// .env dosyasındaki STRIPE_KEY'i aldığından emin ol
const stripe = require('stripe')(process.env.STRIPE_KEY);

router.post('/create-checkout-session', async (req, res) => {
  try {
    // Frontend'den gelen verileri al
    const { items, userEmail, deliveryFee, userId, couponCode } = req.body;

    // 1. ÜRÜNLERİ STRIPE FORMATINA ÇEVİR
    const line_items = items.map((item) => {
      // Stripe resim URL'lerinin "http" ile başlamasını zorunlu kılar.
      // Base64 veya bozuk link gelirse ödeme sayfası açılmaz.
      // Bu yüzden basit bir kontrol yapıyoruz:
      const validImage = item.img && item.img.startsWith("http") ? [item.img] : [];

      return {
        price_data: {
          currency: 'gbp', // İngiltere Sterlini
          product_data: {
            name: item.title,
            description: item.desc ? item.desc.substring(0, 100) : "ÇiçekSepeti Ürünü",
            images: validImage, 
          },
          // Stripe kuruş cinsinden çalışır (10.50 £ -> 1050 penny)
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // 2. KARGO ÜCRETİNİ EKLE (Eğer varsa)
    if (deliveryFee && deliveryFee > 0) {
      line_items.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: "Teslimat Ücreti",
            description: "Kargo ve Paketleme Hizmeti",
            images: ["https://cdn-icons-png.flaticon.com/512/709/709790.png"], // Temsili kargo ikonu
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    // 3. OTURUMU OLUŞTUR
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Sadece kart ile ödeme
      line_items: line_items,
      mode: 'payment',
      success_url: 'http://localhost:5173/success', // Başarılı dönüş
      cancel_url: 'http://localhost:5173/',        // İptal dönüş
      customer_email: userEmail, // Müşterinin emailini Stripe'a otomatik doldur
      
      // Ekstra bilgileri sakla (İleride Webhook kullanırsan işine yarar)
      metadata: {
        userId: userId || "guest",
        couponCode: couponCode || "none"
      }
    });

    // 4. URL'İ DÖNDÜR
    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("STRIPE HATASI:", err.message); // Terminalde hatayı gör
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;