const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Şifreleme kütüphanesi
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const sendEmail = require('../utils/sendEmail');

// ---------------------------------------------------------
// 1. KAYIT OL (REGISTER)
// ---------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    // 1. KULLANICI VAR MI KONTROLÜ
    const existingUser = await User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] });
    if (existingUser) {
        return res.status(400).json({ message: "Bu kullanıcı adı veya e-posta zaten kullanılıyor." });
    }

    // 2. ŞİFREYİ KRİPTOLA (HASHING) - İŞTE BU KISIM ŞART!
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // -----------------------------------------------------

    // 3. TOKEN OLUŞTUR
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // 4. KULLANICIYI OLUŞTUR
    const newUser = new User({
      fullName: req.body.fullName || req.body.username, // İsim yoksa kullanıcı adını kullan
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword, // <--- Şifrelenmiş halini kaydediyoruz
      role: req.body.role || 'customer',
      isVerified: false, 
      verificationToken: verifyToken
    });

    const savedUser = await newUser.save();

    // 5. MAİL GÖNDER
    const frontendUrl = "http://localhost:5173"; 
    const verifyLink = `${frontendUrl}/verify/${verifyToken}`;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #db2777;">Hoşgeldiniz, ${savedUser.username}! 🌸</h1>
        <p>ÇiçekSepeti UK ailesine katıldığınız için teşekkürler.</p>
        <p>Lütfen aşağıdaki butona tıklayarak hesabınızı doğrulayın:</p>
        <br/>
        <a href="${verifyLink}" style="background-color: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Hesabımı Onayla</a>
      </div>
    `;

    await sendEmail(savedUser.email, "ÇiçekSepeti UK - Hesap Onayı", emailContent);

    res.status(200).json({ message: "Kayıt başarılı! Lütfen e-postanızı kontrol edip hesabınızı onaylayın." });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ---------------------------------------------------------
// 2. HESAP ONAYLA (VERIFY)
// ---------------------------------------------------------
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });

    if (!user) return res.status(400).json("Geçersiz veya süresi dolmuş onay linki.");

    user.isVerified = true;
    user.verificationToken = undefined; 
    await user.save();

    res.status(200).json("Hesap başarıyla onaylandı! Şimdi giriş yapabilirsiniz.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------------------------------------
// 3. GİRİŞ YAP (LOGIN)
// ---------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    // Kullanıcıyı Bul
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı!" });

    // Şifreyi Kontrol Et (Hash karşılaştırması)
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Şifre yanlış!" });

    // Engel Kontrolü
    if (user.isBlocked) return res.status(403).json({ message: "Hesabınız askıya alınmıştır! 🚫" });

    // Onay Kontrolü
    if (!user.isVerified) return res.status(403).json({ message: "Lütfen önce e-postanızı onaylayın." });

    // Token Üret
    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SEC,
        { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });

  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------------------------------------
// 4. ŞİFREMİ UNUTTUM (FORGOT PASSWORD)
// ---------------------------------------------------------
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("Kullanıcı bulunamadı.");

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 saat
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    const emailContent = `
      <p>Şifre sıfırlama isteği aldık. Aşağıdaki linke tıklayarak yeni şifrenizi belirleyin:</p>
      <a href="${resetLink}">Şifremi Sıfırla</a>
    `;
    await sendEmail(user.email, "Şifre Sıfırlama", emailContent);
    
    res.status(200).json("Sıfırlama bağlantısı gönderildi.");
  } catch (err) {
    res.status(500).json("Hata oluştu.");
  }
});

// ---------------------------------------------------------
// 5. ŞİFREYİ SIFIRLA (RESET PASSWORD)
// ---------------------------------------------------------
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json("Geçersiz veya süresi dolmuş link.");

    // Yeni şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json("Şifreniz değiştirildi.");
  } catch (err) {
    res.status(500).json("Hata oluştu.");
  }
});

module.exports = router;