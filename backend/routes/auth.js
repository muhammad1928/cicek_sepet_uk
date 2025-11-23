const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ---------------------------------------------------------
// 1. KAYIT OL (REGISTER)
// ---------------------------------------------------------
router.post('/register', async (req, res) => {
    console.log("Kayıt isteği geldi:", req.body);

    try {
        // Şifreyi kriptola
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Yeni kullanıcıyı hazırla
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || 'customer' // Eğer rol gelmezse müşteri olsun
        });

        // Veritabanına yaz
        const user = await newUser.save();
        console.log("Kullanıcı başarıyla oluşturuldu:", user.username);
        res.status(200).json(user);
        
    } catch (err) {
        console.log("Kayıt Hatası:", err);
        res.status(500).json(err);
    }
});

// ---------------------------------------------------------
// 2. GİRİŞ YAP (LOGIN)
// ---------------------------------------------------------
router.post('/login', async (req, res) => {
    console.log("Login isteği geldi:", req.body.username);

    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            console.log("Hata: Kullanıcı yok.");
            return res.status(404).json("Kullanıcı bulunamadı!");
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            console.log("Hata: Şifre yanlış.");
            return res.status(400).json("Şifre yanlış!");
        }

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SEC,
            { expiresIn: "3d" }
        );

        console.log("Giriş Başarılı. Token gönderiliyor.");
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });

    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;