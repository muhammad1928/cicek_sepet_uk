const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const sendEmail = require('../utils/sendEmail');

// --- SABİTLER ---
const DELIVERY_COST = 20;
const DELIVERY_THRESHOLD = 200;

// --- YARDIMCI FONKSİYON: SİPARİŞ MAİL ŞABLONU ---
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
        
        <h3 style="color: #333; border-bottom: 2px solid #db2777; padding-bottom: 5px; margin-top: 20px;">Sipariş Detayları (No: #${order._id.toString().slice(-6)})</h3>
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
          <a href="http://localhost:5173/my-orders" style="background-color: #db2777; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">Siparişi Görüntüle</a>
        </div>
      </div>
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        &copy; 2024 ÇiçekSepeti UK. Tüm hakları saklıdır.
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
    // Frontend'den gelen tutarı baz alıyoruz ama kargo ücretini burada da mantıksal olarak kontrol edip kaydediyoruz
    let calculatedDeliveryFee = 0;
    
    // Ürünlerin saf toplamını bul (item.price * quantity)
    const itemsTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // Eğer ürün toplamı 200'den az ise kargo ücreti vardır
    // Not: totalAmount içinde indirim olabilir, o yüzden itemsTotal'e bakmak daha sağlıklı olabilir 
    // ama basitlik için Frontend mantığıyla uyumlu: Toplam ödeme < 220 ise kargo dahil demektir.
    // Biz burada veritabanına "Kargo Ücreti: 20" diye not düşüyoruz sadece.
    if (totalAmount < (DELIVERY_THRESHOLD + DELIVERY_COST)) {
        // Eğer kupon indirimiyle 200 altına düştüyse veya zaten azsa
        // Basit kural: 200 altıysa kargo var.
         if (itemsTotal < DELIVERY_THRESHOLD) {
            calculatedDeliveryFee = DELIVERY_COST;
         }
    }

    // C) ADRESİ KULLANICIYA KAYDET
    if (userId) {
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
    const mailContent = createOrderEmail(savedOrder, "Siparişiniz Alındı! 🌸", `Merhaba ${sender.name}, siparişiniz başarıyla oluşturuldu.`);
    sendEmail(sender.email, "Sipariş Onayı - ÇiçekSepeti UK", mailContent).catch(console.error);

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

// SATICININ SİPARİŞLERİ
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    // 1. Satıcının ürünlerini bul
    const vendorProducts = await Product.find({ vendor: req.params.vendorId }).select('_id');
    const vendorProductIds = vendorProducts.map(p => p._id.toString());

    // 2. İçinde bu ürünlerden EN AZ BİRİ olan siparişleri bul
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
// 3. DURUM GÜNCELLEME (PUT)
// =============================================================================
router.put('/:id', async (req, res) => {
  try {
    const { status, courierId, courierRejectionReason } = req.body;
    
    // Güncelleme verisini hazırla
    const updateData = { status };
    if (courierId !== undefined) updateData.courierId = courierId;
    if (courierRejectionReason) updateData.courierRejectionReason = courierRejectionReason;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, 
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json("Sipariş bulunamadı");

    // --- DURUM DEĞİŞİKLİĞİ BİLDİRİM MAİLİ ---
    let subject = "";
    let msg = "";

    switch (status) {
      case "Hazırlanıyor":
        subject = "Siparişiniz Hazırlanıyor! 🎁";
        msg = `Siparişiniz satıcı tarafından onaylandı ve hazırlanıyor.`;
        break;
      case "Hazır":
        // Hazır olunca müşteriye değil, Kurye havuzuna düşüyor.
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

    // Eğer konu başlığı varsa (yani müşteriye haber verilecek bir durumsa) mail at
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