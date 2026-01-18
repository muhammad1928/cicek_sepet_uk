const jwt = require("jsonwebtoken");

// 1. TEMEL DOĞRULAMA (Giriş Yapmış mı?)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token || req.headers.authorization;
  
  if (authHeader) {
    // "Bearer <token>" formatını veya sadece token'ı destekle
    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.split(" ")[1] 
      : authHeader;

    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      // Token geçersizse veya süresi dolmuşsa 403 yerine 401 dönüyoruz.
      // Bu sayede frontend interceptor'ı token yenilemesi gerektiğini anlar.
      if (err) return res.status(401).json({ message: "Token geçersiz veya süresi dolmuş!" });
      
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ message: "Giriş yapmanız gerekiyor!" });
  }
};

// 2. YETKİLENDİRME (Kendi Hesabı veya Admin)
const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
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

// 4. SATICI VEYA ADMIN
const verifyTokenAndSeller = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "vendor" || req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Sadece satıcılar işlem yapabilir!" });
    }
  });
};

// 5. KURYE VEYA ADMIN
const verifyTokenAndCourier = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "courier" || req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Sadece kuryeler işlem yapabilir!" });
    }
  });
};

// 6. ÇALIŞAN
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