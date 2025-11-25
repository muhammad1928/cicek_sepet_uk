const router = require('express').Router();
const User = require('../models/User');
const Product = require('../models/Product'); // <--- BU SATIR EKLENDİ (Populate için gerekli)
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// 1. KULLANICI GÜNCELLE (Şifre veya Bilgi)
router.put('/:id', async (req, res) => {
  if (req.body.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } catch (err) {
      return res.status(500).json(err);
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    const { password, ...others } = updatedUser._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. ADRES SİLME (DÜZELTİLMİŞ)
router.delete('/:id/addresses/:addressId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("Kullanıcı bulunamadı.");

    // Adres dizisinden ilgili ID'ye sahip olanı çıkar ($pull)
    await user.updateOne({ 
      $pull: { savedAddresses: { _id: req.params.addressId } } 
    });
    
    res.status(200).json("Adres başarıyla silindi.");
  } catch (err) {
    console.log(err); // Hatayı terminale yazdır ki görelim
    res.status(500).json(err);
  }
});

// ADRES EKLEME
router.post('/:id/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // req.body içinde adres objesi gelecek
    await user.updateOne({ $push: { savedAddresses: req.body } });
    res.status(200).json("Adres eklendi");
  } catch (err) { res.status(500).json(err); }
});


// 3. FAVORİ EKLE / ÇIKAR (GÜNCELLENDİ: SAYAÇLI SİSTEM)
router.put('/:id/favorites', async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.params.id);
    const isFavorited = user.favorites.includes(productId);

    if (isFavorited) {
      // 1. Kullanıcıdan Çıkar
      await user.updateOne({ $pull: { favorites: productId } });
      // 2. Ürün Sayacını Azalt (-1)
      await Product.findByIdAndUpdate(productId, { $inc: { favoritesCount: -1 } });
      
      res.status(200).json("Çıkarıldı");
    } else {
      // 1. Kullanıcıya Ekle
      await user.updateOne({ $push: { favorites: productId } });
      // 2. Ürün Sayacını Artır (+1)
      await Product.findByIdAndUpdate(productId, { $inc: { favoritesCount: 1 } });
      
      res.status(200).json("Eklendi");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. FAVORİLERİ GETİR (Populate Kullanılıyor!)
router.get('/:id/favorites', async (req, res) => {
  try {
    // .populate('favorites') diyebilmek için Product modelinin require edilmiş olması gerekir.
    const user = await User.findById(req.params.id).populate('favorites');
    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. ADRESLERİ GETİR
router.get('/:id/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user.savedAddresses || []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 6. TÜM KULLANICILARI GETİR (ADMİN İÇİN)
router.get('/', async (req, res) => {
  try {
    // Şifreleri gönderme, sadece gerekli bilgileri al
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 7. KULLANICI ROLÜNÜ DEĞİŞTİR (ADMİN İÇİN)
router.put('/:id/role', async (req, res) => {
  try {
    const { role } = req.body; // 'admin', 'vendor', 'courier', 'customer'
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role: role },
      { new: true }
    ).select('-password');
    
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 8. KULLANICI ENGELLE / AÇ (TOGGLE)
router.put('/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json("Kullanıcı bulunamadı.");

    // Admin kendini engelleyemesin
    if (user.role === 'admin') return res.status(400).json("Yönetici engellenemez!");

    user.isBlocked = !user.isBlocked; // Durumu tersine çevir
    await user.save();
    
    res.status(200).json({ 
      message: user.isBlocked ? "Kullanıcı engellendi." : "Kullanıcı engeli kaldırıldı.", 
      isBlocked: user.isBlocked 
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// 10. KULLANICI KENDİ ŞİFRESİNİ DEĞİŞTİRİR (Mail Bildirimli)
router.put('/:id/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    // Eski şifre kontrolü
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) return res.status(400).json("Eski şifreniz hatalı!");

    // Yeni şifre kaydı
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // --- GÜVENLİK MAİLİ ---
    const emailContent = `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color: #d00;">⚠️ Şifreniz Değiştirildi</h2>
        <p>Merhaba ${user.username},</p>
        <p>Hesabınızın şifresi az önce başarıyla değiştirildi.</p>
        <p>Eğer bu işlemi siz yapmadıysanız, lütfen <b>hemen</b> bizimle iletişime geçin.</p>
      </div>
    `;
    sendEmail(user.email, "Güvenlik Uyarısı: Şifreniz Değişti", emailContent).catch(console.error);
    // ----------------------

    res.status(200).json("Şifreniz başarıyla güncellendi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 11. BAŞVURU FORMU GÖNDER
router.post('/:id/apply', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      applicationStatus: 'pending',
      applicationData: req.body // Formdan gelen tüm veriler (IBAN, Ehliyet vb.)
    });
    res.status(200).json("Başvurunuz alındı, onay bekleniyor.");
  } catch (err) { res.status(500).json(err); }
});

// 12. BAŞVURU ONAYLA / REDDET (GÜNCELLENDİ: MAİL BİLDİRİMLİ)
router.put('/:id/application-status', async (req, res) => {
  try {
    const { status, reason } = req.body; // reason: Red sebebi
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json("Kullanıcı bulunamadı.");

    // Durumu güncelle
    // Eğer reddedildiyse, sebebini de veritabanına not düşebiliriz (Opsiyonel)
    if (status === 'rejected' && reason) {
        // applicationData objesini bozmadan içine rejectionReason ekliyoruz
        user.applicationData = { ...user.applicationData, rejectionReason: reason };
    }
    
    user.applicationStatus = status;
    await user.save();

    // --- BİLDİRİM MAİLİ ---
    let subject = "";
    let htmlContent = "";

    if (status === 'approved') {
      subject = "Başvurunuz Onaylandı! 🎉";
      htmlContent = `
        <div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: green;">Tebrikler ${user.username}!</h2>
          <p><b>${user.role === 'vendor' ? 'Mağaza' : 'Kurye'}</b> başvurunuz onaylanmıştır.</p>
          <p>Artık sisteme giriş yapabilir ve panelinizi kullanmaya başlayabilirsiniz.</p>
          <a href="http://localhost:5173/login" style="background: green; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Giriş Yap</a>
        </div>
      `;
    } 
    else if (status === 'rejected') {
      subject = "Başvurunuz Hakkında ⚠️";
      htmlContent = `
        <div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #d00;">Başvurunuz Reddedildi</h2>
          <p>Merhaba ${user.username},</p>
          <p>Yapmış olduğunuz başvuru incelenmiş ve aşağıdaki sebepten dolayı uygun görülmemiştir:</p>
          <div style="background: #fff0f0; padding: 15px; border-left: 4px solid #d00; margin: 20px 0; font-style: italic;">
            "${reason || 'Belgelerinizdeki eksiklikler nedeniyle.'}"
          </div>
          <p>Bilgilerinizi güncelleyip tekrar başvurmak için bizimle iletişime geçebilirsiniz.</p>
        </div>
      `;
    }

    // Maili gönder
    sendEmail(user.email, subject, htmlContent).catch(console.error);
    // ---------------------

    res.status(200).json(`Kullanıcı durumu: ${status}`);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 13. SATICI PROFİLİ GETİR (HERKES İÇİN - PUBLIC)
router.get('/vendor-profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username email createdAt'); // Sadece güvenli bilgileri gönder
    if (!user || user.role !== 'vendor') return res.status(404).json("Satıcı bulunamadı.");
    
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;