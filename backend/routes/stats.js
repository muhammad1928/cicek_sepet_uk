const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { 
  verifyTokenAndAdmin,
} = require('./verifyToken'); // GÜVENLİK İMPORTU
// GENEL İSTATİSTİKLERİ GETİR
router.get('/', verifyTokenAndAdmin, async (req, res) => {
  try {
    // 1. Toplam Ciro Hesapla
    const orders = await Order.find();
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // 2. Toplam Sipariş, Ürün ve Kullanıcı Sayısı
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    // 3. Sipariş Durumu Dağılımı (Kaç tane teslim edildi, kaçı iptal vs.)
    const orderStatusStats = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 4. En Son 5 Sipariş (Özet Tablo İçin)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("customerInfo totalAmount status createdAt");

    res.status(200).json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      orderStatusStats,
      recentOrders
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;