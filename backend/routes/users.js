const router = require('express').Router();
const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail'); 
const cloudinary = require('cloudinary').v2;

// --- CLOUDINARY AYARLARI (Resim Silme İçin) ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- YARDIMCI FONKSİYON: Cloudinary'den Resim Silme ---
const deleteFromCloudinary = async (url) => {
  if (!url) return;
  try {
    // URL'den public_id'yi ayıkla
    // Örn: .../upload/v123456/ciceksepeti_belgeler/resim.jpg -> ciceksepeti_belgeler/resim
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/;
    const match = url.match(regex);
    
    if (match) {
      const publicId = match[1];
      // 'authenticated' modunda yüklenenleri silmek için type belirtmek gerekir
      await cloudinary.uploader.destroy(publicId, { type: 'authenticated' });
      console.log("Cloudinary'den silindi:", publicId);
    }
  } catch (err) {
    console.error("Resim silme hatası:", err);
  }
};

// =============================================================================
// 1. KULLANICI GÜNCELLEME (GENEL PROFİL)
// =============================================================================
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

// =============================================================================
// 2. TEK KULLANICIYI GETİR (SENKRONİZASYON İÇİN)
// =============================================================================
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("Kullanıcı bulunamadı.");
    
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 3. ADRES SİLME
// =============================================================================
router.delete('/:id/addresses/:addressId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.updateOne({ $pull: { savedAddresses: { _id: req.params.addressId } } });
    res.status(200).json("Adres silindi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 4. ADRES EKLEME
// =============================================================================
router.post('/:id/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.updateOne({ $push: { savedAddresses: req.body } });
    res.status(200).json("Adres eklendi");
  } catch (err) { res.status(500).json(err); }
});

// =============================================================================
// 5. ADRESLERİ GETİR
// =============================================================================
router.get('/:id/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user.savedAddresses || []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 6. FAVORİ EKLE / ÇIKAR
// =============================================================================
router.put('/:id/favorites', async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.params.id);
    const isFavorited = user.favorites.includes(productId);

    if (isFavorited) {
      await user.updateOne({ $pull: { favorites: productId } });
      await Product.findByIdAndUpdate(productId, { $inc: { favoritesCount: -1 } });
      res.status(200).json("Çıkarıldı");
    } else {
      await user.updateOne({ $push: { favorites: productId } });
      await Product.findByIdAndUpdate(productId, { $inc: { favoritesCount: 1 } });
      res.status(200).json("Eklendi");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 7. FAVORİLERİ LİSTELE
// =============================================================================
router.get('/:id/favorites', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('favorites');
    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 8. TÜM KULLANICILARI GETİR (ADMİN)
// =============================================================================
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 9. ROL DEĞİŞTİR (ADMİN)
// =============================================================================
router.put('/:id/role', async (req, res) => {
  try {
    const { role } = req.body; 
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role: role }, { new: true }).select('-password');
    res.status(200).json(updatedUser);
  } catch (err) { res.status(500).json(err); }
});

// =============================================================================
// 10. ENGELLE / AÇ (ADMİN)
// =============================================================================
router.put('/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("Kullanıcı bulunamadı.");
    if (user.role === 'admin') return res.status(400).json("Yönetici engellenemez!");

    user.isBlocked = !user.isBlocked;
    await user.save();
    
    res.status(200).json({ 
      message: user.isBlocked ? "Kullanıcı engellendi." : "Kullanıcı engeli kaldırıldı.", 
      isBlocked: user.isBlocked 
    });
  } catch (err) { res.status(500).json(err); }
});

// =============================================================================
// 11. ADMİN TARAFINDAN ŞİFRE SIFIRLAMA
// =============================================================================
router.put('/:id/admin-reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.status(200).json("Şifre güncellendi.");
  } catch (err) { res.status(500).json(err); }
});

// =============================================================================
// 12. KULLANICI KENDİ ŞİFRESİNİ DEĞİŞTİRİR (MAİL BİLDİRİMLİ)
// =============================================================================
router.put('/:id/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) return res.status(400).json("Eski şifreniz hatalı!");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    const resetLink = "http://localhost:5173/forgot-password";
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 30px; border: 1px solid #eee; background-color: #fff5f5; border-radius: 10px;">
        <h2 style="color: #d32f2f; text-align: center;">⚠️ Şifreniz Değiştirildi</h2>
        <p>Merhaba <b>${user.fullName}</b>,</p> 
        <p>Hesabınızın şifresi az önce başarıyla değiştirildi.</p>
        <p>Siz yapmadıysanız: <a href="${resetLink}">Şifremi Acil Sıfırla</a></p>
      </div>
    `;
    sendEmail(user.email, "Güvenlik Uyarısı: Şifreniz Değişti", emailContent).catch(console.error);

    res.status(200).json("Şifreniz başarıyla güncellendi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 13. BAŞVURU FORMU GÖNDER (GÜNCELLENDİ: UNIK KONTROLÜ)
router.post('/:id/apply', async (req, res) => {
  try {
    const { requestedRole, ...applicationData } = req.body;
    
    // UNIKLİK KONTROLÜ
    // Tüm kullanıcıları tarayıp applicationData içindeki vergi/ehliyet no eşleşiyor mu bakarız
    const users = await User.find();
    
    for (let user of users) {
        if (user._id.toString() === req.params.id) continue; // Kendini atla
        
        const data = user.applicationData || {};
        
        // Satıcı ise Vergi No Kontrolü
        if (requestedRole === 'vendor' && data.taxNumber === applicationData.taxNumber) {
            return res.status(400).json("Bu Vergi Numarası ile zaten bir başvuru var!");
        }
        // Kurye ise Ehliyet No Kontrolü
        if (requestedRole === 'courier' && data.licenseNumber === applicationData.licenseNumber) {
            return res.status(400).json("Bu Ehliyet Numarası ile zaten bir başvuru var!");
        }
    }

    await User.findByIdAndUpdate(req.params.id, {
      applicationStatus: 'pending',
      applicationData: { ...applicationData, requestedRole } 
    });
    res.status(200).json("Başvurunuz alındı.");
  } catch (err) { res.status(500).json(err); }
});
// =============================================================================
// 14. BAŞVURU ONAYLA / REDDET (RESİM SİLME & MAİL BİLDİRİMİ)
// =============================================================================
router.put('/:id/application-status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("Kullanıcı bulunamadı.");

    // A) ONAYLANDIYSA
    if (status === 'approved' && user.applicationData?.requestedRole) {
        user.role = user.applicationData.requestedRole; 
    }
    
    // B) REDDEDİLDİYSE (Resimleri Sil)
    if (status === 'rejected') {
        // Cloudinary'den sil
        if (user.applicationData?.licenseImage) {
            await deleteFromCloudinary(user.applicationData.licenseImage);
        }
        if (user.applicationData?.documentImage) {
            await deleteFromCloudinary(user.applicationData.documentImage);
        }

        // Veritabanından sil ve sebep ekle
        user.applicationData = { 
            ...user.applicationData, 
            rejectionReason: reason,
            licenseImage: null,    
            documentImage: null    
        };
    }
    
    user.applicationStatus = status;
    await user.save();

    // Bildirim Maili
    const reApplyLink = "http://localhost:5173/partner-application";
    const loginLink = "http://localhost:5173/login";
    const boxStyle = "background-color: #f9f9f9; padding: 20px; border-radius: 10px; font-family: Arial;";
    const btnStyle = "display:inline-block; padding:10px 20px; color:white; text-decoration:none; border-radius:5px; font-weight:bold;";

    let subject = "";
    let htmlContent = "";

    if (status === 'approved') {
      subject = "🎉 Başvurunuz Onaylandı!";
      htmlContent = `
        <div style="${boxStyle} border-top: 5px solid green;">
          <h2 style="color: green;">Tebrikler ${user.fullName}!</h2>
          <p><b>${user.role === 'vendor' ? 'Mağaza' : 'Kurye'}</b> başvurunuz onaylanmıştır.</p>
          <p>Panele giriş yaparak işlemlerinize başlayabilirsiniz.</p>
          <br/>
          <a href="${loginLink}" style="${btnStyle} background-color: green;">Panele Giriş Yap</a>
        </div>
      `;
    } else if (status === 'rejected') {
      subject = "⚠️ Başvurunuz Hakkında";
      htmlContent = `
        <div style="${boxStyle} border-top: 5px solid red;">
          <h2 style="color: red;">Başvurunuz Reddedildi</h2>
          <p>Merhaba ${user.fullName}, başvurunuz şu sebeple onaylanamadı:</p>
          <div style="background: #fff; padding: 10px; border: 1px solid #ddd; margin: 10px 0; font-style: italic;">
             "${reason || 'Eksik bilgiler.'}"
          </div>
          <p>Lütfen eksiklikleri giderip tekrar başvurunuz.</p>
          <br/>
          <a href="${reApplyLink}" style="${btnStyle} background-color: red;">Tekrar Başvur</a>
        </div>
      `;
    }

    sendEmail(user.email, subject, htmlContent).catch(console.error);

    res.status(200).json(`Kullanıcı durumu: ${status}`);
  } catch (err) { 
    console.log(err);
    res.status(500).json(err); 
  }
});

// =============================================================================
// 15. SATICI PROFİLİ GETİR (PUBLIC)
// =============================================================================
router.get('/vendor-profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullName email createdAt storeSettings role');
    if (!user || user.role !== 'vendor') return res.status(404).json("Satıcı bulunamadı.");
    res.status(200).json(user);
  } catch (err) { res.status(500).json(err); }
});

// =============================================================================
// 16. EHLİYET KONTROL (CRON JOB)
// =============================================================================
router.get('/check-licenses', async (req, res) => {
  try {
    const users = await User.find({ role: 'courier' });
    // Kontrol mantığı buraya eklenebilir
    res.send("Kontrol tamamlandı.");
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;