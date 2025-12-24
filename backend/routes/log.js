const router = require("express").Router();
const Log = require("../models/Log");
const logActivity = require("../utils/logActivity");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

// --- ŞİFRE ÇÖZME AYARLARI ---
const ALGORITHM = 'aes-256-cbc';
// .env dosyasındaki LOG_ENC_KEY'i kullanıyoruz
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.LOG_ENC_KEY || 'secret_yedek').digest(); 

// Yardımcı Fonksiyon: Şifre Çözme
const decryptIp = (text) => {
    if (!text) return null;
    // Eğer format 'iv:content' değilse (eski log veya şifresizse) olduğu gibi döndür
    if (!text.includes(':')) return text; 

    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        // Çözülemezse şifreli halini döndür (Hata patlamasın)
        return text;
    }
};

// 1. TÜM LOGLARI GETİR (Decrypt Ederek)
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    // .lean() performansı artırır ve dönen objeyi değiştirmemize izin verir
    const logs = await Log.find()
      .populate("userId", "fullName role email")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean(); 

    // Her logun IP adresini çözüyoruz
    const decryptedLogs = logs.map(log => ({
        ...log,
        ip: decryptIp(log.ip)
    }));
      
    res.status(200).json(decryptedLogs);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. KULLANICI GEÇMİŞİ (Decrypt Ederek - UserActivityModal için)
router.get("/user/:userId", verifyTokenAndAdmin, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const decryptedLogs = logs.map(log => ({
        ...log,
        ip: decryptIp(log.ip)
    }));

    res.status(200).json(decryptedLogs);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. TEK LOG DETAYI
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id)
       .populate("userId", "fullName email")
       .lean();

    if(log) {
        log.ip = decryptIp(log.ip);
    }
    res.status(200).json(log);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. TEK SİLME
router.delete("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Log.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Log silindi." });
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. TOPLU SİLME
router.delete("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (ids && Array.isArray(ids) && ids.length > 0) {
      await Log.deleteMany({ _id: { $in: ids } });
      res.status(200).json({ message: "Seçilenler silindi." });
    } else {
      await Log.deleteMany({});
      res.status(200).json({ message: "Tümü temizlendi." });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// 6. AKTİVİTE KAYDET (POST)
router.post("/activity", async (req, res) => {
  try {
    const { action, metadata } = req.body;
    let userId = null;

    // Header kontrolü (Frontend'den gelen token)
    const authHeader = req.headers.token || req.headers.authorization;
    if (authHeader) {
      const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
      try {
        const user = jwt.verify(token, process.env.JWT_SEC);
        userId = user.id;
      } catch (e) { userId = null; }
    }

    await logActivity(userId, action, req, metadata);
    res.status(200).json({ message: "Log saved" });
  } catch (err) {
    res.status(200).json({ message: "Log ignored" });
  }
});

module.exports = router;