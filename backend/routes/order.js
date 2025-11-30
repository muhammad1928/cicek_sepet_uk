const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const sendEmail = require('../utils/sendEmail');

// --- SABİTLER ---
const DELIVERY_COST = 20;
const DELIVERY_THRESHOLD = 200;

// =============================================================================
// YARDIMCI: MÜŞTERİ MAİL ŞABLONU (Detaylı)
// =============================================================================
const createOrderEmail = (order, title, message) => {
  // Mailde göstermek için hesaplamalar
  const subTotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = (subTotal + order.deliveryFee) - order.totalAmount;

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        ${item.img ? `<img src="${item.img}" width="50" style="border-radius:4px; vertical-align: middle; margin-right: 10px;">` : ''}
        <strong>${item.title}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">£${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #db2777; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">${title}</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #555; line-height: 1.5;">${message}</p>
        
        <h3 style="color: #333; border-bottom: 2px solid #db2777; padding-bottom: 10px; margin-top: 30px;">Sipariş Özeti <span style="font-size: 14px; color: #888; font-weight: normal;">(#${order._id.toString().slice(-8).toUpperCase()})</span></h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f9f9f9; color: #666;">
              <th style="text-align: left; padding: 10px;">Ürün</th>
              <th style="text-align: center; padding: 10px;">Adet</th>
              <th style="text-align: right; padding: 10px;">Fiyat</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="text-align: right; margin-top: 20px; font-size: 14px;">
          <p style="margin: 5px 0; color: #666;">Ara Toplam: <strong>£${subTotal.toFixed(2)}</strong></p>
          ${discountAmount > 0.01 ? `<p style="margin: 5px 0; color: #16a34a;">İndirim: <strong>-£${discountAmount.toFixed(2)}</strong></p>` : ''}
          <p style="margin: 5px 0; color: #666;">Kargo: <strong>${order.deliveryFee === 0 ? 'Ücretsiz' : '£' + order.deliveryFee.toFixed(2)}</strong></p>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 22px; color: #db2777;"><strong>Toplam: £${order.totalAmount.toFixed(2)}</strong></p>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 25px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 14px; color: #334155;"><strong>📍 Teslimat Adresi:</strong><br/>
          ${order.recipient.name}<br/>
          ${order.recipient.address}, ${order.recipient.city}<br/>
          ${order.recipient.phone}</p>
        </div>

        <div style="text-align: center; margin-top: 35px;">
          <a href="http://localhost:5173/my-orders" style="background-color: #db2777; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">Siparişi Takip Et</a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} ÇiçekSepeti UK. Tüm hakları saklıdır.
      </div>
    </div>
  `;
};

// --- YARDIMCI: SATICI (VENDOR) MAİL ŞABLONU ---
const createVendorEmail = (vendorData, orderId) => {
  // Satıcı kazancı = Orijinal Fiyat * Adet (İndirim yansımaz)
  const vendorTotal = vendorData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const itemsHtml = vendorData.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">£${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">£${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">📦 Yeni Siparişiniz Var!</h2>
      </div>
      <div style="padding: 25px;">
        <p style="font-size: 16px; color: #333;">Merhaba <b>${vendorData.name}</b>,</p>
        <p style="color: #555;">Mağazanızdan yeni ürünler sipariş edildi (Sipariş No: #${orderId.toString().slice(-8).toUpperCase()}).</p>
        
        <div style="background-color: #eef2ff; padding: 12px; border-radius: 6px; color: #3730a3; font-size: 13px; margin: 15px 0; border-left: 4px solid #4f46e5;">
          ℹ️ <b>Bilgi:</b> Bu siparişteki müşteri indirimleri platform tarafından karşılanmıştır. Sizin kazancınız <b>Orijinal Liste Fiyatı</b> üzerinden hesaplanmıştır.
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <thead>
             <tr style="background-color: #f3f4f6; color: #555;">
               <th style="text-align: left; padding: 10px;">Ürün</th>
               <th style="text-align: center; padding: 10px;">Adet</th>
               <th style="text-align: right; padding: 10px;">Birim Fiyat</th>
               <th style="text-align: right; padding: 10px;">Toplam</th>
             </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        
        <div style="text-align: right; margin-top: 20px; font-size: 18px;">
           <p>Toplam Hakediş: <strong style="color: #4f46e5;">£${vendorTotal.toFixed(2)}</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:5173/vendor" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Mağaza Paneline Git</a>
        </div>
      </div>
    </div>
  `;
};

// =============================================================================
// 1. SİPARİŞ OLUŞTURMA (POST) - GÜVENLİ SERVER-SIDE HESAPLAMA
// =============================================================================
router.post('/', async (req, res) => {
  const { items, sender, recipient, delivery, userId, couponCode, metaData, saveAddress } = req.body;

  try {
    let calculatedTotal = 0;
    let finalItems = [];

    // A) ÜRÜNLERİ DOĞRULA, FİYATI DB'DEN AL VE STOK DÜŞ
    for (const item of items) {
      const product = await Product.findById(item._id);
      
      if (!product) return res.status(404).json({ message: `Ürün bulunamadı: ${item.title}` });
      if (product.stock < item.quantity) return res.status(400).json({ message: `Stok yetersiz: ${item.title}. Kalan: ${product.stock}` });
      
      // Fiyatı veritabanından al (Güvenlik: Frontend fiyatına güvenilmez)
      const price = product.price;
      calculatedTotal += price * item.quantity;

      // Stoktan düş
      product.stock -= item.quantity;
      await product.save();

      // Güvenli item listesine ekle
      finalItems.push({
        _id: product._id,
        title: product.title,
        price: price, // Orijinal DB fiyatı
        quantity: item.quantity,
        img: product.img
      });
    }

    // B) KUPON VE KARGO HESAPLAMA
    let discountAmount = 0;
    let isFreeDelivery = false;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      
      if (coupon && coupon.isActive) {
        let isExpired = false;
        
        // Tarih Kontrolü (Gün sonuna kadar geçerli)
        if (coupon.expiryDate) {
             const now = new Date();
             const expiry = new Date(coupon.expiryDate);
             expiry.setHours(23, 59, 59, 999); 
             if (now > expiry) isExpired = true;
        }

        // Kullanım Kontrolü (Daha önce kullanmış mı?)
        const isUsed = userId && coupon.usedBy.includes(userId);

        if (!isExpired && !isUsed) {
          // İndirimi hesapla
          discountAmount = (calculatedTotal * coupon.discountRate) / 100;
          if (coupon.includeDelivery) isFreeDelivery = true;
          
          // Kuponu kullanıldı olarak işaretle (Sadece kayıtlı kullanıcı için)
          if (userId) {
            coupon.usedBy.push(userId);
            await coupon.save();
          }
        }
      }
    }

    // İndirimli Ara Toplam
    let priceAfterDiscount = calculatedTotal - discountAmount;

    // Kargo Ücreti Hesabı
    let deliveryFee = 0;
    // Eğer kupon kargoyu kapsamıyorsa VE tutar 200 altındaysa kargo ekle
    if (!isFreeDelivery && priceAfterDiscount < DELIVERY_THRESHOLD) {
        deliveryFee = DELIVERY_COST;
    }

    // Genel Toplam
    const finalTotalAmount = priceAfterDiscount + deliveryFee;

    // C) METADATA VE IP YAKALAMA
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const finalMetaData = {
        ...metaData, // Frontend'den gelen (Browser, OS vb.)
        ip: clientIp // Backend'den gelen (IP)
    };

    // D) KULLANICI BİLGİLERİNİ GÜNCELLE (Adres Kaydetme İsteği Varsa)
    if (userId) {
      try {
         // Telefon numarasını her zaman güncelle/ekle
         await User.findByIdAndUpdate(userId, { $set: { phone: sender.phone } });

         // Eğer 'saveAddress' true ise adresi de ekle
         if (saveAddress) {
             await User.findByIdAndUpdate(userId, { 
                 $addToSet: { savedAddresses: {
                    title: `${recipient.name} - ${recipient.city}`,
                    recipientName: recipient.name, recipientPhone: recipient.phone,
                    address: recipient.address, city: recipient.city, postcode: recipient.postcode
                 }} 
             });
         }
      } catch(e) { console.log("Kullanıcı bilgileri güncellenemedi:", e); }
    }

    // E) SİPARİŞİ KAYDET
    const newOrder = new Order({
      userId,
      items: finalItems, // Güvenli liste
      totalAmount: finalTotalAmount, // Server hesaplaması
      deliveryFee: deliveryFee,
      sender,
      recipient,
      delivery,
      status: 'Sipariş Alındı',
      metaData: finalMetaData
    });

    const savedOrder = await newOrder.save();

    // F) MÜŞTERİYE MAİL GÖNDER
    const customerMailContent = createOrderEmail(savedOrder, "Siparişiniz Alındı! 🌸", `Merhaba ${sender.name}, siparişiniz başarıyla oluşturuldu.`);
    sendEmail(sender.email, "Sipariş Onayı - ÇiçekSepeti UK", customerMailContent).catch(console.error);

    // G) SATICILARA (VENDORS) BİLDİRİM GÖNDER (Gruplama)
    const vendorMap = new Map(); // { vendorId: { email, name, items: [] } }

    for (const item of finalItems) {
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
                price: item.price // Orijinal fiyat (Satıcı indirimi görmez)
            });
        }
    }

    // Her satıcıya kendi ürün listesini mail at
    for (const [id, data] of vendorMap) {
        const vendorMail = createVendorEmail(data, savedOrder._id);
        sendEmail(data.email, "Yeni Sipariş Aldınız! 📦", vendorMail).catch(console.error);
    }

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
// 3. DURUM GÜNCELLEME (PUT) & İPTAL TALEBİ
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
      case "İptal Talebi":
        subject = "İptal Talebiniz Alındı 📩";
        msg = `Sipariş iptal talebiniz bize ulaştı. Müşteri temsilcimiz inceleyip size dönüş yapacaktır.`;
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