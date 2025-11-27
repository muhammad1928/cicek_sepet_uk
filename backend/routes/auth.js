const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// ==========================================
// 1. KAYIT OL (REGISTER) - EMAIL & FULLNAME
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, fullName } = req.body;

    // 1. E-posta Kontrolü
    const checkEmail = await User.findOne({ email: email });
    if (checkEmail) {
      return res.status(400).json({ message: "Bu e-posta adresiyle zaten bir hesap var." });
    }

    // 2. Şifreleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 3. Token Üretimi
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // 4. Yeni Kullanıcı (username YOK, fullName VAR)
    const newUser = new User({
      fullName: fullName, 
      email: email,
      password: hashedPassword,
      role: role || 'customer',
      isVerified: false, // Onaysız başlar
      verificationToken: verifyToken,
      badges: []
    });

    const savedUser = await newUser.save();

    // 5. Mail Gönderimi
    const frontendUrl = "http://localhost:5173"; 
    const verifyLink = `${frontendUrl}/verify/${verifyToken}`;
    
    const emailContent = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #db2777;">Hoşgeldiniz, ${savedUser.fullName}! 🌸</h2>
        <p>ÇiçekSepeti UK ailesine katıldığınız için teşekkürler.</p>
        <p>Hesabınızı aktifleştirmek için lütfen tıklayın:</p>
        <br/>
        <a href="${verifyLink}" style="background: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Hesabımı Onayla</a>
      </div>
    `;

    // Mail hatası akışı bozmasın diye catch ekliyoruz
    await sendEmail(savedUser.email, "Hesap Onayı", emailContent).catch(err => console.log("Mail Hatası:", err));

    res.status(200).json({ message: "Kayıt başarılı! Lütfen e-postanızı kontrol edin." });

  } catch (err) {
    console.log(err); // Terminale hatayı yazdır
    res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
});

// ==========================================
// 2. HESAP ONAYLA (VERIFY)
// ==========================================
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) return res.status(400).json("Geçersiz veya süresi dolmuş link.");

    user.isVerified = true;
    user.verificationToken = undefined; 
    await user.save();

    res.status(200).json("Hesap başarıyla onaylandı!");
  } catch (err) {
    res.status(500).json(err);
  }
});

// ==========================================
// 3. GİRİŞ YAP (LOGIN) - EMAIL İLE
// ==========================================
router.post('/login', async (req, res) => {
  try {
    // Email ile kullanıcı bul
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı!" });

    // Şifre Kontrolü
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Şifre yanlış!" });

    // Onay Kontrolü
    if (!user.isVerified) return res.status(403).json({ message: "Lütfen e-postanızı onaylayın." });
    
    // Engel Kontrolü
    if (user.isBlocked) return res.status(403).json({ message: "Hesabınız askıya alınmıştır! 🚫" });

    // Token Oluştur
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

// ==========================================
// 4. ŞİFREMİ UNUTTUM (FORGOT PASSWORD)
// ==========================================
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
      <h3>Şifre Sıfırlama İsteği</h3>
      <p>Aşağıdaki linke tıklayarak şifrenizi yenileyebilirsiniz:</p>
      <a href="${resetLink}">Şifremi Sıfırla</a>
    `;

    await sendEmail(user.email, "Şifre Sıfırlama", emailContent);
    res.status(200).json("Sıfırlama linki gönderildi.");

  } catch (err) {
    res.status(500).json("Hata oluştu.");
  }
});

// ==========================================
// 5. ŞİFREYİ SIFIRLA (RESET PASSWORD)
// ==========================================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json("Geçersiz veya süresi dolmuş link.");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    res.status(200).json("Şifre başarıyla güncellendi.");

  } catch (err) {
    res.status(500).json("Hata oluştu.");
  }
});

module.exports = router;