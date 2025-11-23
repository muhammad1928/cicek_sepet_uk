const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { items } = req.body;

  // 1. Ürünleri Stripe Formatına Çevir
  const lineItems = items.map((product) => ({
    price_data: {
      currency: 'gbp', // İngiliz Sterlini
      product_data: {
        name: product.title,
        images: [product.img], // Stripe sayfasında resim görünsün
      },
      unit_amount: Math.round(product.price * 100), // Stripe kuruş (pence) bazında çalışır (10£ = 1000p)
    },
    quantity: product.quantity,
  }));

  try {
    // 2. Oturumu Başlat
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      // Ödeme Başarılı Olursa Dönülecek Sayfa:
      success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
      // İptal Olursa Dönülecek Sayfa:
      cancel_url: 'http://localhost:5173/',
    });

    // 3. Linki Frontend'e Gönder
    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;