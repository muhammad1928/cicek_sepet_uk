const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Rastgele kod üretmek için
const sendEmail = require('../utils/sendEmail'); // Mail gönderme fonksiyonumuz

// ---------------------------------------------------------
// 1. KAYIT OL (REGISTER) - E-POSTA ONAYLI
// ---------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    // 1. Şifreleme (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // 2. Rastgele Doğrulama Kodu Üret (32 byte hex)
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // 3. Kullanıcıyı Oluştur (Onaysız olarak)
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || 'customer',
      isVerified: false, // <--- ÖNEMLİ: Başlangıçta onaysız
      verificationToken: verifyToken
    });

    const savedUser = await newUser.save();

    // 4. Onay Linkini Hazırla (Frontend Adresine Yönlendirilecek)
    // Localhost ise: http://localhost:5173/verify/...
    // Canlı ise: https://seninsiten.vercel.app/verify/...
    // Şimdilik geliştirme ortamı için localhost yazıyoruz. Canlıya alınca burayı güncelleyeceğiz.
    const frontendUrl = "http://localhost:5173"; 
    const verifyLink = `${frontendUrl}/verify/${verifyToken}`;
    
    // 5. E-Posta İçeriği
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #db2777;">Hoşgeldiniz, ${savedUser.username}! 🌸</h1>
        <p>ÇiçekSepeti UK ailesine katıldığınız için teşekkürler.</p>
        <p>Hesabınızı güvenle kullanabilmek için lütfen aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın:</p>
        <br/>
        <a href="${verifyLink}" style="background-color: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Hesabımı Onayla</a>
        <br/><br/>
        <p style="font-size: 12px; color: #777;">Buton çalışmıyorsa şu linki tarayıcınıza yapıştırın: <br/> ${verifyLink}</p>
      </div>
    `;

    // 6. Maili Gönder
    await sendEmail(savedUser.email, "ÇiçekSepeti UK - Hesap Onayı", emailContent);

    res.status(200).json({ message: "Kayıt başarılı! Lütfen e-postanızı kontrol edip hesabınızı onaylayın." });

  } catch (err) {
    console.log(err);
    // Eğer kullanıcı adı veya email zaten varsa E11000 hatası döner
    if (err.code === 11000) {
      return res.status(400).json({ message: "Bu kullanıcı adı veya e-posta zaten kullanılıyor." });
    }
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ---------------------------------------------------------
// 2. HESAP ONAYLA (VERIFY)
// ---------------------------------------------------------
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    // Token'a sahip kullanıcıyı bul
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json("Geçersiz veya süresi dolmuş onay linki.");
    }

    // Kullanıcıyı onayla ve token'ı temizle
    user.isVerified = true;
    user.verificationToken = undefined; 
    await user.save();

    res.status(200).json("Hesap başarıyla onaylandı! Şimdi giriş yapabilirsiniz.");

  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------------------------------------
// 3. GİRİŞ YAP (LOGIN) - ONAY KONTROLLÜ
// ---------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(404).json("Kullanıcı bulunamadı!");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json("Şifre yanlış!");

    if (!user.isVerified) {
      return res.status(403).json({ message: "Lütfen e-postanızı onaylayın.", isVerified: false });
    }

    // --- YENİ: ENGEL KONTROLÜ ---
    if (user.isBlocked) {
      return res.status(403).json({ message: "Hesabınız yönetici tarafından askıya alınmıştır! 🚫" });
    }
    // ----------------------------

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SEC, { expiresIn: "3d" });
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });

  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. ŞİFREMİ UNUTTUM (Mail Gönder)
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.");

    // Token üret
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Token'ı kaydet (1 saat geçerli olsun)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 saat
    await user.save();

    // Mail Linki (Localhost veya Canlı URL)
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    const emailContent = `
      <div style="padding: 20px; font-family: Arial;">
        <h2 style="color: #db2777;">Şifre Sıfırlama İsteği</h2>
        <p>Hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
        <p>Aşağıdaki linke tıklayarak yeni şifrenizi belirleyebilirsiniz (Link 1 saat geçerlidir):</p>
        <a href="${resetLink}" style="background-color: #db2777; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Şifremi Sıfırla</a>
      </div>
    `;

    await sendEmail(user.email, "Şifre Sıfırlama Talebi", emailContent);
    res.status(200).json("Sıfırlama bağlantısı e-posta adresinize gönderildi.");

  } catch (err) {
    res.status(500).json("Hata oluştu.");
  }
});

// 5. ŞİFREYİ SIFIRLA (Yeni Şifreyi Kaydet)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Token'ı ve Süresini Kontrol Et ($gt = greater than = şu andan büyük olmalı)
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json("Geçersiz veya süresi dolmuş bağlantı.");

    // Yeni şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Tokenları temizle
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    res.status(200).json("Şifreniz başarıyla değiştirildi! Giriş yapabilirsiniz.");

  } catch (err) {
    res.status(500).json("Hata oluştu.");
  }
});

// 8. KULLANICIYI ENGELLE / AÇ (TOGGLE BLOCK)
router.put('/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // Durumu tersine çevir (True ise False, False ise True)
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

// 9. ADMİN TARAFINDAN ŞİFRE DEĞİŞTİRME
router.put('/:id/admin-reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.status(200).json("Şifre başarıyla güncellendi.");
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;