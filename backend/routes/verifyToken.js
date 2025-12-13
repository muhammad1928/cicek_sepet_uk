const jwt = require("jsonwebtoken");

// 1. TEMEL DOĞRULAMA (Giriş Yapmış mı?)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token || req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) return res.status(403).json({ message: "Token geçersiz!" });
      req.user = user; // Token içindeki (id, role) bilgisini request'e ekle
      next();
    });
  } else {
    return res.status(401).json({ message: "Giriş yapmanız gerekiyor!" });
  }
};

// 2. YETKİLENDİRME (Kendi Hesabı veya Admin)
// Örn: Kullanıcı kendi siparişlerini görebilir, Admin herkesinkini görebilir.
const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    // req.params.id (URL'deki ID) ile giriş yapan kişinin ID'si (req.user.id) aynı mı?
    // Veya giriş yapan kişi Admin mi?
    // Veya URL'deki ID 'find' gibi bir kelime değilse ve vendorId parametresi varsa (Satıcı kontrolü için)
    if (req.user.id === req.params.id || req.user.id === req.params.userId || req.user.id === req.params.vendorId || req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok!" });
    }
  });
};

// 3. SADECE ADMIN
const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Bu işlem sadece yöneticiler içindir!" });
    }
  });
};

// 4. SATICI VEYA ADMIN (Ürün Yönetimi İçin)
const verifyTokenAndSeller = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "vendor" || req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Sadece satıcılar işlem yapabilir!" });
    }
  });
};

// 5. KURYE VEYA ADMIN (İş Havuzu İçin)
const verifyTokenAndCourier = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "courier" || req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Sadece kuryeler işlem yapabilir!" });
    }
  });
};

// 6. ÇALIŞAN (Kurye, Satıcı veya Admin - Sipariş Durumu Güncellemek İçin)
const verifyTokenAndWorker = (req, res, next) => {
  verifyToken(req, res, () => {
    if (["admin", "vendor", "courier"].includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: "Yetkisiz işlem!" });
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyTokenAndSeller,
  verifyTokenAndCourier,
  verifyTokenAndWorker
};