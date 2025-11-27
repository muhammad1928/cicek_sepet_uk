const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const sendEmail = require('../utils/sendEmail');

// --- SABİTLER ---
const DELIVERY_COST = 20;
const DELIVERY_THRESHOLD = 200;

// --- YARDIMCI: MÜŞTERİ MAİL ŞABLONU ---
const createOrderEmail = (order, title, message) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        <img src="${item.img}" width="40" style="border-radius:4px; vertical-align: middle; margin-right: 5px;"> 
        ${item.title}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">£${item.price}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #db2777; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">${title}</h1>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #555;">${message}</p>
        
        <h3 style="color: #333; border-bottom: 2px solid #db2777; padding-bottom: 5px; margin-top: 20px;">Sipariş Özeti (No: #${order._id.toString().slice(-6).toUpperCase()})</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8f8f8; color: #555;">
              <th style="text-align: left; padding: 8px;">Ürün</th>
              <th style="text-align: center; padding: 8px;">Adet</th>
              <th style="text-align: right; padding: 8px;">Fiyat</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="text-align: right; margin-top: 15px;">
          <p style="margin: 5px 0; color: #777;">Kargo: <strong>£${order.deliveryFee.toFixed(2)}</strong></p>
          <p style="margin: 5px 0; font-size: 18px; color: #db2777;"><strong>Toplam: £${order.totalAmount.toFixed(2)}</strong></p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; color: #555;"><strong>Teslimat Adresi:</strong><br/>
          ${order.recipient.name}<br/>
          ${order.recipient.address}, ${order.recipient.city}<br/>
          ${order.recipient.phone}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:5173/my-orders" style="background-color: #db2777; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">Siparişi Takip Et</a>
        </div>
      </div>
    </div>
  `;
};

// --- YARDIMCI: SATICI (VENDOR) MAİL ŞABLONU ---
const createVendorEmail = (vendorData, orderId) => {
  const itemsHtml = vendorData.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">£${item.price}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">📦 Yeni Siparişiniz Var!</h2>
      </div>
      <div style="padding: 20px;">
        <p>Merhaba <b>${vendorData.name}</b>,</p>
        <p>Mağazanızdan yeni ürünler sipariş edildi (Sipariş No: #${orderId.toString().slice(-6).toUpperCase()}).</p>
        <p>Lütfen siparişi panelinizden onaylayıp hazırlayınız.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead><tr style="background-color: #f3f4f6;"><th style="text-align: left; padding: 8px;">Ürün</th><th style="text-align: center; padding: 8px;">Adet</th><th style="text-align: right; padding: 8px;">Tutar</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:5173/vendor" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Panele Git</a>
        </div>
      </div>
    </div>
  `;
};

// =============================================================================
// 1. SİPARİŞ OLUŞTURMA (POST)
// =============================================================================
router.post('/', async (req, res) => {
  const { items, totalAmount, sender, recipient, delivery, userId, couponCode } = req.body;

  try {
    // A) STOK KONTROLÜ VE GÜNCELLEME
    for (const item of items) {
      const product = await Product.findById(item._id);
      
      if (!product) {
        return res.status(404).json({ message: `Ürün bulunamadı: ${item.title}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stok yetersiz: ${item.title}. Kalan: ${product.stock}` });
      }
      
      // Stoktan düş
      product.stock -= item.quantity;
      await product.save();
    }

    // B) TESLİMAT ÜCRETİ HESAPLAMA (Backend Doğrulaması)
    // Frontend'den gelen 'totalAmount' içinde kargo olabilir. 
    // Biz ürünlerin ham toplamına bakıp kargo gerekip gerekmediğini teyit ediyoruz.
    let calculatedDeliveryFee = 0;
    const itemsTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // Eğer ürün toplamı 200'den az ise ve totalAmount (kargo dahil) da buna uygunsa
    // Basit kural: Ham ürün toplamı 200 altındaysa kargo ücreti yazarız.
    if (itemsTotal < DELIVERY_THRESHOLD) {
        calculatedDeliveryFee = DELIVERY_COST;
    }
    
    // Not: Eğer kupon "kargo dahil" ise frontend bunu '0' olarak yansıtmıştır.
    // Burada kupon kontrolü yapıp tekrar 0'a çekebiliriz ama basitlik adına
    // frontend'den gelen `req.body.deliveryFee` varsa onu da kullanabilirsin.
    // Şimdilik kendi hesabımızı kullanıyoruz:
    if (req.body.deliveryFee === 0) calculatedDeliveryFee = 0; // Frontend 0 dediyse (Kupon) kabul et.


    // C) ADRESİ KULLANICIYA KAYDET
    if (userId) {
      // Adresi sadece benzersizse eklemek daha iyi olur ama basit push yapıyoruz
      const newAddress = {
        title: `${recipient.name} - ${recipient.city}`,
        recipientName: recipient.name,
        recipientPhone: recipient.phone,
        address: recipient.address,
        city: recipient.city,
        postcode: recipient.postcode
      };
      await User.findByIdAndUpdate(userId, {
        $push: { savedAddresses: newAddress }
      });
    }

    // D) KUPON KULLANIMI
    if (userId && couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $addToSet: { usedBy: userId } }
      );
    }

    // E) SİPARİŞİ KAYDET
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      deliveryFee: calculatedDeliveryFee,
      sender,
      recipient,
      delivery
    });

    const savedOrder = await newOrder.save();

    // F) MÜŞTERİYE MAİL GÖNDER
    const customerMail = createOrderEmail(savedOrder, "Siparişiniz Alındı! 🌸", `Merhaba ${sender.name}, siparişiniz başarıyla oluşturuldu.`);
    sendEmail(sender.email, "Sipariş Onayı - ÇiçekSepeti UK", customerMail).catch(console.error);

    // --- G) SATICILARA (VENDORS) BİLDİRİM GÖNDER ---
    // Sepetteki ürünleri satıcılara göre ayır
    const vendorMap = new Map(); // { vendorId: { email, name, items: [] } }

    for (const item of items) {
        const product = await Product.findById(item._id).populate('vendor');
        if (product && product.vendor) {
            const vId = product.vendor._id.toString();
            
            if (!vendorMap.has(vId)) {
                vendorMap.set(vId, {
                    email: product.vendor.email,
                    name: product.vendor.fullName,
                    items: []
                });
            }
            vendorMap.get(vId).items.push({
                title: item.title,
                quantity: item.quantity,
                price: item.price
            });
        }
    }

    // Her satıcıya kendi ürün listesini mail at
    for (const [id, data] of vendorMap) {
        const vendorMail = createVendorEmail(data, savedOrder._id);
        sendEmail(data.email, "Yeni Sipariş Aldınız! 📦", vendorMail).catch(console.error);
    }
    // -----------------------------------------------

    res.status(200).json({ message: "Sipariş başarıyla oluşturuldu! 🌸", order: savedOrder });

  } catch (err) {
    console.error("Sipariş Hatası:", err);
    res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
});

// =============================================================================
// 2. GET ROTALARI (LİSTELEME)
// =============================================================================

// KULLANICININ SİPARİŞLERİ
router.get('/find/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) { res.status(500).json(err); }
});

// SATICININ SİPARİŞLERİ (Sadece kendi ürünlerini içerenler)
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const vendorProducts = await Product.find({ vendor: req.params.vendorId }).select('_id');
    const vendorProductIds = vendorProducts.map(p => p._id.toString());

    // İçinde bu satıcının en az bir ürünü olan siparişleri bul
    const orders = await Order.find({
      "items._id": { $in: vendorProductIds } 
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) { res.status(500).json(err); }
});

// TÜM SİPARİŞLER (Admin & Kurye Havuzu)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) { res.status(500).json(err); }
});

// =============================================================================
// 3. DURUM GÜNCELLEME (PUT) & BİLDİRİM
// =============================================================================
router.put('/:id', async (req, res) => {
  try {
    const { status, courierId, courierRejectionReason } = req.body;
    
    const updateData = { status };
    if (courierId !== undefined) updateData.courierId = courierId;
    if (courierRejectionReason) updateData.courierRejectionReason = courierRejectionReason;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, 
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json("Sipariş bulunamadı");

    // --- DURUM BİLDİRİM MAİLİ (MÜŞTERİYE) ---
    let subject = "";
    let msg = "";

    switch (status) {
      case "Hazırlanıyor":
        subject = "Siparişiniz Hazırlanıyor! 🎁";
        msg = `Siparişiniz onaylandı ve hazırlanıyor.`;
        break;
      case "Yola Çıktı":
        subject = "Siparişiniz Yola Çıktı! 🛵";
        msg = `Siparişiniz kuryemize teslim edildi. Adresinize doğru yola çıktı.`;
        break;
      case "Teslim Edildi":
        subject = "Teslimat Başarılı! ✅";
        msg = `Siparişiniz başarıyla teslim edildi. Bizi tercih ettiğiniz için teşekkür ederiz.`;
        break;
      case "İptal":
        subject = "Sipariş İptali ❌";
        msg = `Siparişiniz iptal edilmiştir. Detaylı bilgi için bizimle iletişime geçin.`;
        break;
    }

    if (subject && updatedOrder.sender.email) {
      const mailContent = createOrderEmail(updatedOrder, subject, msg);
      sendEmail(updatedOrder.sender.email, subject, mailContent).catch(console.error);
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;