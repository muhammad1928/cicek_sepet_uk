const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const Joi = require('joi'); // Veri Doğrulama
const logActivity = require('../utils/logActivity');
const { 
  verifyTokenAndAuthorization,
} = require('./verifyToken'); // GÜVENLİK İMPORTU
// =============================================================================
// GÜVENLİK KURALLARI (REGEX)
// =============================================================================
// En az 1 küçük, 1 büyük, 1 rakam, 1 özel karakter
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

// =============================================================================
// JOI ŞEMALARI (Gelen Verinin Kuralları)
// =============================================================================

// 1. Kayıt Doğrulama Şeması
const registerSchema = Joi.object({
    fullName: Joi.string().min(3).max(50).required().messages({ 
        'string.min': 'Adınız en az 3 karakter olmalı.', 
        'any.required': 'Ad Soyad zorunludur.' 
    }),
    email: Joi.string().email().required().messages({ 
        'string.email': 'Geçerli bir e-posta adresi giriniz.', 
        'any.required': 'E-posta zorunludur.' 
    }),
    
    // Backend Şifre Güvenliği (Postman/Hacker Koruması)
    password: Joi.string()
        .min(8)
        .pattern(passwordPattern) 
        .required()
        .messages({ 
            'string.min': 'Şifre en az 8 karakter olmalıdır.',
            'string.pattern.base': 'Şifre en az 1 Büyük Harf, 1 Küçük Harf, 1 Rakam ve 1 Özel Karakter içermelidir.',
            'any.required': 'Şifre zorunludur.'
        }),
        
    // Rolü buradan gelse bile yoksayacağız ama şemada hata vermesin diye optional
    role: Joi.string().optional()
});

// 2. Giriş Doğrulama Şeması
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({ 'any.required': 'E-posta gereklidir.' }),
    password: Joi.string().required().messages({ 'any.required': 'Şifre gereklidir.' })
});


// =============================================================================
// 1. KAYIT OL (REGISTER)
// =============================================================================
router.post('/register', verifyTokenAndAuthorization, async (req, res) => {
  try {
    // A) Backend Validasyonu
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, fullName } = req.body;

    // B) E-posta Kontrolü
    const checkEmail = await User.findOne({ email: email });
    if (checkEmail) {
      return res.status(400).json({ message: "Bu e-posta adresiyle zaten bir hesap var." });
    }

    // C) Şifreleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // D) Token Üretimi
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // E) Kayıt (Güvenlik: role zorla 'customer' yapılıyor)
    const newUser = new User({
      fullName: fullName, 
      email: email,
      password: hashedPassword,
      role: 'customer', // <--- GÜVENLİK KİLİDİ: Hacker admin gönderse bile customer olur
      isVerified: false, 
      verificationToken: verifyToken,
      badges: []
    });

    const savedUser = await newUser.save();
    await logActivity(savedUser._id, 'register', req, { method: 'email' }); // LOG

    // F) Mail Gönderimi
    const frontendUrl = "http://localhost:5173"; 
    const verifyLink = `${frontendUrl}/verify/${verifyToken}`;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #db2777;">Hoşgeldiniz, ${savedUser.fullName}! 🌸</h2>
        <p>ÇiçekSepeti UK ailesine katıldığınız için teşekkürler.</p>
        <p>Hesabınızı aktifleştirmek için lütfen tıklayın:</p>
        <br/>
        <a href="${verifyLink}" style="background: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Hesabımı Onayla</a>
        <br/><br/>
        <p style="font-size: 12px; color: #777;">Link çalışmıyorsa: ${verifyLink}</p>
      </div>
    `;

    await sendEmail(savedUser.email, "Hesap Onayı", emailContent).catch(err => console.log("Mail Hatası:", err));

    res.status(200).json({ message: "Kayıt başarılı! Lütfen e-postanızı kontrol edin." });

  } catch (err) {
    console.log(err); 
    res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
});

// =============================================================================
// 2. HESAP ONAYLA (VERIFY) + KUPON HEDİYESİ
// =============================================================================
router.post('/verify', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) return res.status(400).json({ message: "Geçersiz veya süresi dolmuş link." });

    user.isVerified = true;
    user.verificationToken = undefined; 
    await user.save();

    // --- HOŞGELDİN MAİLİ (KUPONLU) ---
    const couponCode = "MERHABA10"; // Admin panelinden bu kodu oluşturmalısın!
    const loginLink = "http://localhost:5173/login";
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #db2777;">Hesabınız Onaylandı! 🎉</h2>
        <p>Aramıza hoşgeldiniz <strong>${user.fullName}</strong>.</p>
        <p>İlk siparişinize özel hediye kuponunuz:</p>
        <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="margin: 0; color: #db2777; letter-spacing: 2px;">${couponCode}</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #555;">%10 İndirim sağlar</p>
        </div>
        <a href="${loginLink}" style="display: block; text-align: center; color: #db2777; font-weight: bold;">Hemen Giriş Yap</a>
      </div>
    `;
    sendEmail(user.email, "Hoşgeldiniz & Hediye Kuponu 🎁", emailContent).catch(console.error);

    res.status(200).json("Hesap başarıyla onaylandı!");
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 3. GİRİŞ YAP (LOGIN)
// =============================================================================
router.post('/login',  async (req, res) => {
  // Joi Doğrulama
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı! Lütfen bilgileri kontrol edin." });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Şifre yanlış!" });

    if (!user.isVerified) return res.status(403).json({ message: "Lütfen e-postanızı onaylayın." });
    if (user.isBlocked) return res.status(403).json({ message: "Hesabınız askıya alınmıştır! 🚫" });

    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SEC,
        { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    await logActivity(user._id, 'login', req);
    res.status(200).json({ ...others, accessToken });

  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 4. ŞİFREMİ UNUTTUM (FORGOT PASSWORD)
// =============================================================================
router.post('/forgot-password',  async (req, res) => {
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
      <a href="${resetLink}" style="background: #db2777; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
      <p style="font-size: 12px; color: #777; margin-top: 20px;">Bu isteği siz yapmadıysanız, bu maili görmezden gelin.</p>
    `;

    await sendEmail(user.email, "Şifre Sıfırlama", emailContent);
    res.status(200).json("Sıfırlama linki gönderildi.");

  } catch (err) {
    res.status(500).json("Hata oluştu.");
  }
});

// =============================================================================
// 5. ŞİFREYİ SIFIRLA (RESET PASSWORD)
// =============================================================================
router.post('/reset-password',  async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // --- YENİ ŞİFRE GÜVENLİĞİ KONTROLÜ ---
    const { error } = Joi.object({ 
        newPassword: Joi.string().min(8).pattern(passwordPattern).required() 
    }).validate({ newPassword });
    
    if (error) return res.status(400).json({ message: "Yeni şifre güvenlik kurallarına uymuyor." });
    // -------------------------------------

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
    await logActivity(user._id, 'password_change', req, { method: 'reset_link' }); // LOG
    // --- YENİ: BİLGİLENDİRME MAİLİ ---
    sendEmail(user.email, "Şifreniz Değiştirildi 🔒", `
      <h3>Merhaba ${user.fullName},</h3>
      <p>Hesabınızın şifresi başarıyla güncellenmiştir.</p>
      <p>Bu işlemi siz yapmadıysanız derhal bizimle iletişime geçin.</p>
    `).catch(console.error);
    // -------------------------------


    res.status(200).json("Şifre başarıyla güncellendi. Giriş yapabilirsiniz.");

  } catch (err) {
    res.status(500).json("Hata oluştu.");
  }
});

module.exports = router;