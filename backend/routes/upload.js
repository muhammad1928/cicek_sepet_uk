const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Cloudinary Ayarları
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer (Dosyayı geçici olarak RAM'de tut)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// RESİM YÜKLEME İSTEĞİ
router.post('/', upload.single('file'), async (req, res) => {
  try {
    // Dosya gelmediyse hata ver
    if (!req.file) return res.status(400).json("Dosya yok!");

    // Buffer'ı Base64'e çevirip Cloudinary'e yolla
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "ciceksepeti_urunler", // Cloudinary'de klasör adı
    });

    // Başarılıysa resmin internet linkini (URL) döndür
    res.status(200).json(result.secure_url);

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;