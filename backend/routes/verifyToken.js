const jwt = require("jsonwebtoken");

// 1. TOKEN KONTROLÜ (Giriş Yapmış mı?)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    // "Bearer <token>" formatından token'ı alıyoruz
    const token = authHeader.split(" ")[1]; 
    
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) return res.status(403).json("Token geçersiz veya süresi dolmuş!");
      req.user = user; // Kullanıcı bilgisini request'e ekle
      next();
    });
  } else {
    return res.status(401).json("Giriş yapmanız gerekiyor!");
  }
};

// 2. YETKİ KONTROLÜ (Kendi hesabı mı veya Yetkili mi?)
const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    // Kullanıcı kendi hesabını yönetiyorsa VEYA yetkili bir rolü varsa (Admin, Vendor, Courier)
    if (req.user.id === req.params.id || req.user.role === 'admin' || req.user.role === 'vendor' || req.user.role === 'courier') {
      next();
    } else {
      res.status(403).json("Bu işlem için yetkiniz yok!");
    }
  });
};

// 3. SADECE ADMIN KONTROLÜ
const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json("Bu işlem sadece yöneticiler içindir!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};