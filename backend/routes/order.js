const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// 1. SİPARİŞ OLUŞTUR (MÜŞTERİ)
router.post('/', async (req, res) => {
  // Frontend'den gelen tüm verileri alıyoruz
  const { items, totalAmount, sender, recipient, delivery, userId } = req.body;

  try {
    // A) Stok Kontrolü ve Düşme İşlemi
    for (const item of items) {
      const product = await Product.findById(item._id);
      
      if (!product) {
        return res.status(404).json({ message: "Ürün bulunamadı" });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stok yetersiz: ${item.title}` });
      }
      
      // Stoktan düş
      product.stock -= item.quantity;
      await product.save();
    }

    // B) Siparişi Veritabanına Kaydet
    const newOrder = new Order({
      userId, // Siparişi veren üye ise ID'si buraya gelir
      items,
      totalAmount,
      sender,
      recipient,
      delivery
    });

    const savedOrder = await newOrder.save();
    // --- MAİL GÖNDERME İŞLEMİ ---
    const emailHTML = `
      <h1>Siparişiniz Alındı! 🌸</h1>
      <p>Merhaba <b>${recipient.name}</b>,</p>
      <p>Siparişiniz başarıyla oluşturuldu. En taze çiçekleri hazırlamaya başlıyoruz.</p>
      <hr/>
      <h3>Sipariş Özeti:</h3>
      <ul>
        ${items.map(item => `<li>${item.title} - ${item.quantity} Adet</li>`).join('')}
      </ul>
      <p><strong>Toplam Tutar: £${totalAmount}</strong></p>
      <p>Teslimat Tarihi: ${new Date(delivery.date).toLocaleDateString()}</p>
      <br/>
      <p>Bizi tercih ettiğiniz için teşekkürler!<br/>ÇiçekSepeti UK Ekibi</p>
    `;

    // await kullanmıyoruz ki müşteri beklemesin, arka planda gitsin
    sendEmail(sender.email, "Sipariş Onayı #" + savedOrder._id, emailHTML);
  
    res.status(200).json({ message: "Sipariş başarıyla oluşturuldu! 🌸", order: savedOrder });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
});

// 2. KULLANICININ SİPARİŞLERİNİ GETİR (SİPARİŞLERİM SAYFASI İÇİN)
router.get('/find/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. TÜM SİPARİŞLERİ GETİR (ADMİN İÇİN)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. SİPARİŞ DURUMUNU GÜNCELLE (KURYE VE ADMİN İÇİN)
router.put('/:id', async (req, res) => {
  try {
    // Frontend'den status ve (varsa) courierId gelecek
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, 
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 1. SİPARİŞ OLUŞTUR
router.post('/', async (req, res) => {
  const { items, totalAmount, sender, recipient, delivery, userId } = req.body;

  try {
    // ... (Stok kontrol kodları AYNI KALSIN) ...
    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });
      if (product.stock < item.quantity) return res.status(400).json({ message: `Stok yetersiz: ${item.title}` });
      product.stock -= item.quantity;
      await product.save();
    }

    // --- YENİ: ADRESİ KULLANICIYA KAYDET ---
    if (userId) {
      // Bu adres daha önce kaydedilmiş mi diye basitçe bakmıyoruz, 
      // direkt ekliyoruz (Gelişmiş versiyonda tekrar kontrolü yapılabilir)
      // Adres başlığı olarak "Alıcı Adı - Şehir" yapalım
      const newAddress = {
        title: `${recipient.name} - ${recipient.city}`,
        recipientName: recipient.name,
        recipientPhone: recipient.recipientPhone || recipient.phone, // Frontend'den gelen isme dikkat
        address: recipient.address,
        city: recipient.city,
        postcode: recipient.postcode
      };

      // User'a push et (addToSet duplicate önler ama obje olduğu için zor, direkt push yapalım)
      await User.findByIdAndUpdate(userId, {
        $push: { savedAddresses: newAddress }
      });
    }
    // ---------------------------------------

    const newOrder = new Order({ userId, items, totalAmount, sender, recipient, delivery });
    const savedOrder = await newOrder.save();
    
    res.status(200).json({ message: "Sipariş alındı! Adresiniz kaydedildi. 🌸", order: savedOrder });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;