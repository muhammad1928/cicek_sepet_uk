const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const logActivity = require('../utils/logActivity');
const emailTexts = require('../utils/emailTranslations');
const Joi = require('joi');

// =============================================================================
// GÜVENLİK KURALLARI (REGEX)
// =============================================================================
// En az 1 küçük, 1 büyük, 1 rakam, 1 özel karakter, min 8 karakter
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#%^&*])/;

// =============================================================================
// JOI ŞEMALARI (Backend Validasyonu)
// =============================================================================
const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(passwordPattern).required(),
  role: Joi.string().valid('customer', 'vendor', 'courier').optional(),
  language: Joi.string().optional().allow(null, '') // Dil bilgisini kabul et
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  language: Joi.string().optional().allow(null, '')
});


// =============================================================================
// 1. KAYIT OL (REGISTER)
// =============================================================================
// =============================================================================
// 1. KAYIT OL (REGISTER)
// =============================================================================

// Tehlikeli karakter kontrolü fonksiyonu
const containsForbiddenChars = (str) => {
  const forbidden = /['"`\\;{}|<>]|--|\|\||\/\*|\*\/|<script|<\/script|\$\{|\{\{/i;
  return forbidden.test(str);
};

router.post('/register', async (req, res) => {
  let savedUser = null;
  try {
    // 1. Validasyon
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: "auth.validationError" });

    const { email, password, fullName, language } = req.body;

    // 2. Tehlikeli karakter kontrolü (SQL Injection / XSS koruması)
    if (containsForbiddenChars(password)) {
      return res.status(400).json({ message: "auth.passwordForbiddenChars" });
    }
    
    if (containsForbiddenChars(fullName)) {
      return res.status(400).json({ message: "auth.nameForbiddenChars" });
    }

    // 3. Şifre gücü kontrolü (backend'de de yapalım)
    const passwordRules = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#%^&*()_+\-=\[\]{}|:,.<>?]/.test(password)
    };
    
    if (!Object.values(passwordRules).every(Boolean)) {
      return res.status(400).json({ message: "auth.passwordWeak" });
    }

    // 4. Email Kontrolü
    const checkEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (checkEmail) return res.status(400).json({ message: "auth.emailExists" });

    // 5. Şifreleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Token Üretimi
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // 7. Dil Seçimi
    const userLang = (language || 'en').split('-')[0];
    const t = emailTexts[userLang] || emailTexts['en'];

    // 8. Kullanıcı Oluşturma - fullName sanitize edildi
    const sanitizedFullName = fullName.trim().replace(/[<>]/g, '');
    
    const newUser = new User({
      fullName: sanitizedFullName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'customer',
      isVerified: false,
      verificationToken: verifyToken,
      language: userLang,
      badges: []
    });

    savedUser = await newUser.save();

    // 9. Loglama
    await logActivity(savedUser._id, 'register', req, { method: 'email' });

    // 10. Mail Gönderimi
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verifyLink = `${frontendUrl}/verify/${verifyToken}`;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #db2777; margin-top: 0;">${t.verifyTitle} ${savedUser.fullName}! 🌸</h2>
        <p>${t.verifyMsg}</p>
        <br/>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verifyLink}" style="background-color: #db2777; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            ${t.verifyBtn}
          </a>
        </div>
        <br/>
        <p style="font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px;">
          ${t.verifyLinkFooter}<br/>
          <a href="${verifyLink}" style="color: #db2777;">${verifyLink}</a>
        </p>
      </div>
    `;

    await sendEmail(savedUser.email, t.verifySubject, emailContent);

    res.status(200).json({ message: "auth.registerSuccess" });

  } catch (err) {
    console.error("Register Error:", err);
    if (savedUser && savedUser._id) {
      try { await User.findByIdAndDelete(savedUser._id); } catch (e) {}
    }
    res.status(500).json({ message: "common.serverError" });
  }
});
// =============================================================================
// 2. HESAP ONAYLA (VERIFY)
// =============================================================================
router.post('/verify', async (req, res) => {
  try {
    const {
      token
    } = req.body;
    const user = await User.findOne({
      verificationToken: token
    });

    if (!user) return res.status(400).json({
      message: "auth.invalidToken"
    });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    const t = emailTexts[user.language || 'en'] || emailTexts['en'];

    // Hoşgeldin Maili (Kuponlu)
    const couponCode = "WELCOME10";
    const loginLink = `${process.env.CLIENT_URL}/login`;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #db2777;">${t.welcomeGiftTitle}</h2>
        <p>${t.welcomeGiftMsg}</p>
        <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="margin: 0; color: #db2777; letter-spacing: 2px;">${couponCode}</h1>
        </div>
        <a href="${loginLink}" style="display:block; text-align:center; font-weight:bold;">${t.loginBtn}</a>
      </div>
    `;
    sendEmail(user.email, t.welcomeGiftSubject, emailContent).catch(console.error);

    res.status(200).json({
      message: "auth.verifiedSuccess"
    });
  } catch (err) {
    res.status(500).json({
      message: "common.serverError"
    });
  }
});

// =============================================================================
// 3. GİRİŞ YAP (LOGIN)
// =============================================================================
router.post('/login', async (req, res) => {
  // Joi Doğrulama
  const {
    error
  } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({
    message: "auth.validationError"
  });

  try {
    const user = await User.findOne({
      email: req.body.email
    });
    if (!user) return res.status(404).json({
      message: "auth.userNotFound"
    });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({
      message: "auth.wrongPassword"
    });

    if (!user.isVerified) return res.status(403).json({
      message: "auth.verifyEmail"
    });
    if (user.isBlocked) return res.status(403).json({
      message: "auth.accountBlocked"
    });

    // --- DİL GÜNCELLEME ---
    // Kullanıcı login olurken dili değiştiyse (örn: İngiliz ama Türkçe'ye geçti), 
    // veritabanını güncelle ki sonraki mailler Türkçe gitsin.
    if (req.body.language) {
      // Gelen dili sadeleştir (en-US -> en)
      const cleanLang = req.body.language.split('-')[0];

      // Eğer veritabanındakinden farklıysa güncelle
      if (cleanLang !== user.language) {
        user.language = cleanLang;
        await user.save();
      }
    }

    // 1. Access Token (Kısa Ömürlü - 5 Dakika)
    const accessToken = jwt.sign({
        id: user._id,
        role: user.role
      },
      process.env.JWT_SEC, {
        expiresIn: "5m"
      }
    );

    // 2. Refresh Token (Uzun Ömürlü - 7 Gün)
    const refreshToken = jwt.sign({
        id: user._id
      },
      process.env.JWT_REFRESH_SEC, {
        expiresIn: "7d"
      }
    );

    // Loglama
    await logActivity(user._id, 'login', req);

    const {
      password,
      ...others
    } = user._doc;

    // Cookie Ayarları
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .status(200)
      .json({
        ...others,
        accessToken
      });

  } catch (err) {
    res.status(500).json({
      message: "common.serverError"
    });
  }
});

// =============================================================================
// 4. TOKEN YENİLEME (REFRESH)
// =============================================================================
router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).json({
    message: "auth.sessionExpired"
  });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SEC, async (err, decodedUser) => {
    if (err) return res.status(403).json({
      message: "auth.invalidToken"
    });

    const user = await User.findById(decodedUser.id);
    if (!user) return res.status(404).json({
      message: "auth.userNotFound"
    });

    // Yeni Access Token
    const newAccessToken = jwt.sign({
        id: user._id,
        role: user.role
      },
      process.env.JWT_SEC, {
        expiresIn: "5m"
      }
    );

    res.status(200).json({
      accessToken: newAccessToken
    });
  });
});

// =============================================================================
// 5. ŞİFREMİ UNUTTUM
// =============================================================================
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email
    });
    if (!user) return res.status(404).json({
      message: "auth.userNotFound"
    });

    // --- DİL SEÇİMİ ---
    const t = emailTexts[user.language || 'en'] || emailTexts['en'];

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 saat
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const emailContent = `
      <h3>${t.resetPwdSubject}</h3>
      <p>${t.resetPwdMsg}</p>
      <a href="${resetLink}" style="background: #db2777; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${t.resetPwdBtn}</a>
      <p style="font-size: 12px; color: #777; margin-top: 20px;">${t.resetPwdFooter}</p>
    `;

    await sendEmail(user.email, t.resetPwdSubject, emailContent);
    res.status(200).json({
      message: "auth.resetLinkSent"
    });

  } catch (err) {
    res.status(500).json({
      message: "common.serverError"
    });
  }
});

// =============================================================================
// 6. ŞİFRE SIFIRLAMA
// =============================================================================
router.post('/reset-password', async (req, res) => {
  try {
    const {
      token,
      newPassword
    } = req.body;

    // Yeni Şifre Güvenlik Kontrolü
    const {
      error
    } = Joi.object({
      newPassword: Joi.string().min(8).pattern(passwordPattern).required()
    }).validate({
      newPassword
    });

    if (error) return res.status(400).json({
      message: "auth.weakPassword"
    });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    });

    if (!user) return res.status(400).json({
      message: "auth.invalidToken"
    });

    // --- DİL SEÇİMİ ---
    const t = emailTexts[user.language || 'en'] || emailTexts['en'];

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    await logActivity(user._id, 'password_change', req, {
      method: 'reset_link'
    });

    // Bilgilendirme Maili
    sendEmail(user.email, t.passwordChangedSubject || "Password Changed 🔒", `
  <h3>${t.passwordChangedTitle || 'Hello'} ${user.fullName},</h3>
  <p>${t.passwordChangedMsg || 'Your password has been successfully updated.'}</p>
`).catch(console.error);

    res.status(200).json({
      message: "auth.passwordUpdated"
    });

  } catch (err) {
    res.status(500).json({
      message: "common.serverError"
    });
  }
});

// =============================================================================
// 7. ÇIKIŞ YAP (LOGOUT)
// =============================================================================
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }).status(200).json({
    message: "auth.logoutSuccess"
  });
});

module.exports = router;