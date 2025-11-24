const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');     // Adres kaydı için
const Coupon = require('../models/Coupon'); // Kupon takibi için
const sendEmail = require('../utils/sendEmail'); // Mail bildirimi için

// 1. SİPARİŞ OLUŞTUR (MÜŞTERİ)
router.post('/', async (req, res) => {
  // Frontend'den gelen tüm veriler
  const { items, totalAmount, sender, recipient, delivery, userId, couponCode } = req.body;

  try {
    // A) Stok Kontrolü ve Düşme
    for (const item of items) {
      const product = await Product.findById(item._id);
      
      if (!product) {
        return res.status(404).json({ message: `${item.title} bulunamadı` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stok yetersiz: ${item.title}. Kalan: ${product.stock}` });
      }
      
      // Stoktan düş
      product.stock -= item.quantity;
      await product.save();
    }

    // B) Adresi Kullanıcıya Kaydet (Eğer üye ise)
    if (userId) {
      const newAddress = {
        title: `${recipient.name} - ${recipient.city}`,
        recipientName: recipient.name,
        recipientPhone: recipient.phone,
        address: recipient.address,
        city: recipient.city,
        postcode: recipient.postcode
      };

      // User modeline ekle
      await User.findByIdAndUpdate(userId, {
        $push: { savedAddresses: newAddress }
      });
    }

    // C) Kupon Kullanımını İşle (Eğer kupon varsa)
    if (userId && couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode }, 
        { $addToSet: { usedBy: userId } } // Kullanıcıyı listeye ekle
      );
    }

    // D) Siparişi Kaydet
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      sender,
      recipient,
      delivery
    });

    const savedOrder = await newOrder.save();

    // E) Mail Gönder (Arka planda)
    const emailHTML = `
      <h1>Siparişiniz Alındı! 🌸</h1>
      <p>Merhaba <b>${sender.name}</b>,</p>
      <p>Siparişiniz başarıyla oluşturuldu (No: #${savedOrder._id}). En taze çiçekleri hazırlamaya başlıyoruz.</p>
      <hr/>
      <p><strong>Alıcı:</strong> ${recipient.name}</p>
      <p><strong>Teslimat Tarihi:</strong> ${new Date(delivery.date).toLocaleDateString()}</p>
      <p><strong>Toplam Tutar:</strong> £${totalAmount}</p>
      <br/>
      <p>Bizi tercih ettiğiniz için teşekkürler!<br/>ÇiçekSepeti UK Ekibi</p>
    `;
    
    // Hata olsa bile siparişi durdurmaması için catch içine almadan çağırabiliriz veya basitçe await kullanmayabiliriz
    sendEmail(sender.email, "Sipariş Onayı", emailHTML).catch(console.error);

    res.status(200).json({ message: "Sipariş başarıyla oluşturuldu! 🌸", order: savedOrder });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
});

// 2. KULLANICININ SİPARİŞLERİNİ GETİR (Siparişlerim Sayfası)
router.get('/find/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. SATICININ SİPARİŞLERİNİ GETİR (Vendor Paneli)
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    // 1. Bu satıcının ürün ID'lerini bul
    const vendorProducts = await Product.find({ vendor: req.params.vendorId }).select('_id');
    const vendorProductIds = vendorProducts.map(p => p._id.toString());

    // 2. İçinde bu ürünlerden herhangi biri geçen siparişleri bul
    const orders = await Order.find({
      "items._id": { $in: vendorProductIds } 
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. TÜM SİPARİŞLERİ GETİR (Admin Paneli / Kurye Havuzu)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. SİPARİŞ DURUMUNU GÜNCELLE (Admin / Kurye / Satıcı)
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // status veya courierId güncellenir
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;