const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const logActivity = require('../utils/logActivity');
const Joi = require('joi');

// =============================================================================
// GÜVENLİK KURALLARI (REGEX)
// =============================================================================
// En az 1 küçük, 1 büyük, 1 rakam, 1 özel karakter, min 8 karakter
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

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
router.post('/register', async (req, res) => {
  try {
    // 1. Validasyon
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: "auth.validationError" });

    const { email, password, fullName } = req.body;

    // 2. Email Kontrolü
    const checkEmail = await User.findOne({ email: email });
    if (checkEmail) return res.status(400).json({ message: "auth.emailExists" });

    // 3. Şifreleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 4. Token Üretimi (Email Onayı İçin)
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // 5. Kullanıcı Oluşturma
    const newUser = new User({
      fullName: fullName, 
      email: email,
      password: hashedPassword,
      role: 'customer', // Güvenlik: Varsayılan müşteri
      isVerified: false, 
      verificationToken: verifyToken,
      badges: []
    });

    const savedUser = await newUser.save();

    // 6. Loglama
    await logActivity(savedUser._id, 'register', req, { method: 'email' });

    // 7. Onay Maili Gönderme
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verifyLink = `${frontendUrl}/verify/${verifyToken}`;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #db2777; margin-top: 0;">Welcome, ${savedUser.fullName}! 🌸</h2>
        <p style="font-size: 16px;">Thank you for joining the CicekSepeti UK family.</p>
        <p style="font-size: 16px;">Please click the button below to verify your email address and activate your account:</p>
        <br/>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verifyLink}" style="background-color: #db2777; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Verify My Account</a>
        </div>
        <br/>
        <p style="font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${verifyLink}" style="color: #db2777;">${verifyLink}</a>
        </p>
      </div>
    `;

    await sendEmail(savedUser.email, "Verify Your Account", emailContent).catch(err => console.error("Mail Hatası:", err));

    res.status(200).json({ message: "auth.registerSuccess" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "common.serverError" });
  }
});

// =============================================================================
// 2. HESAP ONAYLA (VERIFY)
// =============================================================================
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) return res.status(400).json({ message: "auth.invalidToken" });

    user.isVerified = true;
    user.verificationToken = undefined; 
    await user.save();

    // Hoşgeldin Maili (Kuponlu)
    const couponCode = "WELCOME10"; 
    const loginLink = `${process.env.CLIENT_URL}/login`;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #db2777;">Account Verified! 🎉</h2>
        <p>Welcome ${user.fullName}. Here is your first order gift:</p>
        <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="margin: 0; color: #db2777; letter-spacing: 2px;">${couponCode}</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #555;">10% OFF on your first order</p>
        </div>
        <a href="${loginLink}" style="display: block; text-align: center; color: #db2777; font-weight: bold;">Login Now</a>
      </div>
    `;
    sendEmail(user.email, "Welcome Gift 🎁", emailContent).catch(console.error);

    res.status(200).json({ message: "auth.verifiedSuccess" });
  } catch (err) {
    res.status(500).json({ message: "common.serverError" });
  }
});

// =============================================================================
// 3. GİRİŞ YAP (LOGIN)
// =============================================================================
router.post('/login', async (req, res) => {
  // Joi Doğrulama
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: "auth.validationError" });

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "auth.userNotFound" });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: "auth.wrongPassword" });

    if (!user.isVerified) return res.status(403).json({ message: "auth.verifyEmail" });
    if (user.isBlocked) return res.status(403).json({ message: "auth.accountBlocked" });

    // 1. Access Token (Kısa Ömürlü - 5 Dakika)
    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SEC,
        { expiresIn: "5m" }
    );

    // 2. Refresh Token (Uzun Ömürlü - 7 Gün)
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SEC,
        { expiresIn: "7d" }
    );

    // Loglama
    await logActivity(user._id, 'login', req);

    const { password, ...others } = user._doc;

    // Cookie Ayarları
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Canlıda HTTPS zorunlu
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-site
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Gün
      })
      .status(200)
      .json({ ...others, accessToken });

  } catch (err) {
    res.status(500).json({ message: "common.serverError" });
  }
});

// =============================================================================
// 4. TOKEN YENİLEME (REFRESH)
// =============================================================================
router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) return res.status(401).json({ message: "auth.sessionExpired" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SEC, async (err, decodedUser) => {
    if (err) return res.status(403).json({ message: "auth.invalidToken" });

    const user = await User.findById(decodedUser.id);
    if(!user) return res.status(404).json({ message: "auth.userNotFound" });

    // Yeni Access Token
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SEC,
      { expiresIn: "5m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  });
});

// =============================================================================
// 5. ŞİFREMİ UNUTTUM
// =============================================================================
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "auth.userNotFound" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 saat
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const emailContent = `
      <h3>Password Reset Request</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="background: #db2777; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p style="font-size: 12px; color: #777; margin-top: 20px;">If you didn't request this, please ignore.</p>
    `;

    await sendEmail(user.email, "Password Reset", emailContent);
    res.status(200).json({ message: "auth.resetLinkSent" });

  } catch (err) {
    res.status(500).json({ message: "common.serverError" });
  }
});

// =============================================================================
// 6. ŞİFRE SIFIRLAMA
// =============================================================================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Yeni Şifre Güvenlik Kontrolü
    const { error } = Joi.object({ 
        newPassword: Joi.string().min(8).pattern(passwordPattern).required() 
    }).validate({ newPassword });
    
    if (error) return res.status(400).json({ message: "auth.weakPassword" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "auth.invalidToken" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    await logActivity(user._id, 'password_change', req, { method: 'reset_link' });

    // Bilgilendirme Maili
    sendEmail(user.email, "Password Changed 🔒", `
      <h3>Hello ${user.fullName},</h3>
      <p>Your password has been successfully updated.</p>
    `).catch(console.error);

    res.status(200).json({ message: "auth.passwordUpdated" });

  } catch (err) {
    res.status(500).json({ message: "common.serverError" });
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
  }).status(200).json({ message: "auth.logoutSuccess" });
});

module.exports = router;