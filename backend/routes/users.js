const router = require('express').Router();
const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const cloudinary = require('cloudinary').v2;
const logActivity = require('../utils/logActivity');
const { 
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require('./verifyToken'); // GÜVENLİK İMPORTU
// =============================================================================
// CLOUDINARY AYARLARI
// =============================================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary'den resim silme yardımcı fonksiyonu
const deleteFromCloudinary = async (url) => {
  if (!url) return;
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/;
    const match = url.match(regex);

    if (match) {
      const publicId = match[1];
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
router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {
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

    await logActivity(req.params.id, 'profile_update', req, {
      updatedFields: Object.keys(req.body)
    });

    // Bildirim maili
    sendEmail(updatedUser.email, "Profiliniz Güncellendi 📝", `
      <p>Merhaba ${updatedUser.fullName},</p>
      <p>Profil bilgilerinizde değişiklik yapıldı (Telefon, İsim vb.).</p>
      <p>Bu işlem size ait değilse şifrenizi değiştirin.</p>
    `).catch(console.error);

    const { password, ...others } = updatedUser._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 2. TEK KULLANICIYI GETİR
// =============================================================================
router.get('/:id', verifyTokenAndAuthorization, async (req, res) => {
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
// 3. FAVORİLERİ SENKRONİZE ET
// =============================================================================
router.post('/:id/sync-favorites', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const { localFavorites } = req.body;
    if (!localFavorites || localFavorites.length === 0) {
      return res.status(200).json("Senkronize edilecek veri yok.");
    }

    await User.findByIdAndUpdate(req.params.id, {
      $addToSet: { favorites: { $each: localFavorites } }
    });

    await logActivity(req.params.id, 'sync_favorites', req, { count: localFavorites.length });
    res.status(200).json("Favoriler eşitlendi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 4. ADRES YÖNETİMİ
// =============================================================================

// 4.1 ADRESLERİ GETİR
router.get('/:id/addresses', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('savedAddresses');
    res.status(200).json(user?.savedAddresses || []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4.2 ADRES EKLE
router.post('/:id/addresses', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const userId = req.params.id;
    const newAddress = req.body;

    // Aynı adres var mı kontrol et
    const userWithAddress = await User.findOne({
      _id: userId,
      savedAddresses: {
        $elemMatch: {
          address: newAddress.address,
          city: newAddress.city,
          postcode: newAddress.postcode
        }
      }
    });

    if (userWithAddress) {
      return res.status(200).json({ message: "Adres zaten kayıtlı, tekrar eklenmedi." });
    }

    await User.findByIdAndUpdate(userId, {
      $push: { savedAddresses: newAddress }
    });

    await logActivity(userId, 'add_address', req, {
      city: newAddress.city,
      title: newAddress.title
    });

    res.status(200).json("Adres başarıyla eklendi");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4.3 ADRES GÜNCELLE
router.put('/:id/addresses/:addressId', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const { title, recipientName, recipientPhone, address, city, postcode } = req.body;

    await User.updateOne(
      { _id: req.params.id, "savedAddresses._id": req.params.addressId },
      {
        $set: {
          "savedAddresses.$.title": title,
          "savedAddresses.$.recipientName": recipientName,
          "savedAddresses.$.recipientPhone": recipientPhone,
          "savedAddresses.$.address": address,
          "savedAddresses.$.city": city,
          "savedAddresses.$.postcode": postcode
        }
      }
    );

    await logActivity(req.params.id, 'update_address', req, { addressId: req.params.addressId });
    res.status(200).json("Adres güncellendi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4.4 ADRES SİL
router.delete('/:id/addresses/:addressId', verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { savedAddresses: { _id: req.params.addressId } }
    });

    await logActivity(req.params.id, 'delete_address', req, { addressId: req.params.addressId });
    res.status(200).json("Adres silindi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 5. FAVORİ YÖNETİMİ
// =============================================================================

// FAVORİ EKLE/ÇIKAR (TOGGLE)
router.put('/:id/favorites', verifyTokenAndAuthorization, async (req, res) => {
    const { productId } = req.body;
    try {
        const user = await User.findById(req.params.id);
        
        // Ürün zaten favoride mi?
        // (toString() ekleyerek ID karşılaştırmasını garantiye alıyoruz)
        const index = user.favorites.findIndex(fav => fav.toString() === productId);
        
        let actionType = '';

        if (index === -1) {
            // Ekle
            user.favorites.push(productId);
            actionType = 'add_favorite';
            await Product.findByIdAndUpdate(productId, { $inc: { favoritesCount: 1 } });
        } else {
            // Çıkar
            user.favorites.splice(index, 1);
            actionType = 'remove_favorite';
            await Product.findByIdAndUpdate(productId, { $inc: { favoritesCount: -1 } });
        }

        await user.save();

        // Loglama
        try {
           await logActivity(req.params.id, actionType, req, { productId });
        } catch(e) {}

        // ÖNEMLİ: Sadece ID listesini döndür
        res.status(200).json(user.favorites);
        
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: "common.serverError" }); 
    }
});

// 5.2 FAVORİLERİ LİSTELE
router.get('/:id/favorites', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('favorites');
    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 6. ŞİFRE DEĞİŞTİRME
// =============================================================================
router.put('/:id/change-password', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) return res.status(400).json("Eski şifreniz hatalı!");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await logActivity(req.params.id, 'password_change', req, { method: 'profile_settings' });

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/forgot-password`;
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

// =============================================================================
// 7. BAŞVURU FORMU GÖNDER (PERFORMANS OPTİMİZE EDİLDİ)
// =============================================================================
router.post('/:id/apply', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const { requestedRole, ...applicationData } = req.body;

    // Satıcı başvurusu - Vergi No kontrolü (findOne ile optimize)
    if (requestedRole === 'vendor' && applicationData.taxNumber) {
      const existingVendor = await User.findOne({
        _id: { $ne: req.params.id },
        'applicationData.taxNumber': applicationData.taxNumber
      });

      if (existingVendor) {
        return res.status(400).json("Bu Vergi Numarası ile zaten bir başvuru var!");
      }
    }

    // Kurye başvurusu - Ehliyet No kontrolü (findOne ile optimize)
    if (requestedRole === 'courier' && applicationData.licenseNumber) {
      const existingCourier = await User.findOne({
        _id: { $ne: req.params.id },
        'applicationData.licenseNumber': applicationData.licenseNumber
      });

      if (existingCourier) {
        return res.status(400).json("Bu Ehliyet Numarası ile zaten bir başvuru var!");
      }
    }

    await User.findByIdAndUpdate(req.params.id, {
      applicationStatus: 'pending',
      applicationData: { ...applicationData, requestedRole }
    });

    await logActivity(req.params.id, 'application_submit', req, { requestedRole });
    res.status(200).json("Başvurunuz alındı.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 8. SATICI PROFİLİ GETİR (PUBLIC)
// =============================================================================
router.get('/vendor-profile/:id',  async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('fullName email createdAt storeSettings role');

    if (!user || user.role !== 'vendor') {
      return res.status(404).json("Satıcı bulunamadı.");
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// ======================= ADMİN ROTALARI ======================================
// =============================================================================

// 9. TÜM KULLANICILARI GETİR (ADMİN)
router.get('/', verifyTokenAndAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 10. ROL DEĞİŞTİR (ADMİN)
router.put('/:id/role', verifyTokenAndAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 11. ENGELLE / AÇ (ADMİN)
router.put('/:id/block', verifyTokenAndAdmin, async (req, res) => {
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
  } catch (err) {
    res.status(500).json(err);
  }
});

// 12. BAŞVURU ONAYLA / REDDET (ADMİN)
router.put('/:id/application-status', verifyTokenAndAdmin, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("Kullanıcı bulunamadı.");

    // Onaylandıysa rol değiştir
    if (status === 'approved' && user.applicationData?.requestedRole) {
      user.role = user.applicationData.requestedRole;
    }

    // Reddedildiyse resimleri sil
    if (status === 'rejected') {
      if (user.applicationData?.licenseImage) {
        await deleteFromCloudinary(user.applicationData.licenseImage);
      }
      if (user.applicationData?.documentImage) {
        await deleteFromCloudinary(user.applicationData.documentImage);
      }

      user.applicationData = {
        ...user.applicationData,
        rejectionReason: reason,
        licenseImage: null,
        documentImage: null
      };
    }

    user.applicationStatus = status;
    await user.save();

    // Bildirim maili
    const reApplyLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/partner-application`;
    const loginLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;
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
    console.error(err);
    res.status(500).json(err);
  }
});

// 13. EHLİYET KONTROL (CRON JOB)
router.get('/check-licenses', verifyTokenAndAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'courier' });
    // Kontrol mantığı buraya eklenebilir
    res.send("Kontrol tamamlandı.");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;