const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const axios = require('axios');

// DÜZELTME 1: Sadece verifyToken'ı alıyoruz
const { verifyToken } = require('./verifyToken'); 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 1. RESİM YÜKLEME
// DÜZELTME 2: verifyTokenAndAuthorization -> verifyToken olarak değiştirildi.
// Artık URL'de ID aramıyor, sadece geçerli token var mı diye bakıyor.
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json("Dosya yok!");

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "ciceksepeti_belgeler",
      type: "authenticated",
      access_mode: "authenticated"
    });

    res.status(200).json(result.secure_url);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// 2. GÜVENLİ RESİM GÖRÜNTÜLEME
// Burası da verifyToken olarak değiştirildi.
router.get('/secure-image', verifyToken, async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).json("URL gerekli.");

    const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/);
    let downloadUrl = imageUrl;

    if (publicIdMatch) {
        const publicId = publicIdMatch[1];
        downloadUrl = cloudinary.url(publicId, {
            type: 'authenticated',
            sign_url: true,
            secure: true
        });
    }

    const response = await axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(res);

  } catch (err) {
    console.error("Resim proxy hatası:", err.message);
    res.status(500).json("Resim yüklenemedi.");
  }
});

module.exports = router;