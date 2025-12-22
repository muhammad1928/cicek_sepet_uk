const router = require("express").Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require("mongoose"); // ObjectId dönüşümleri için gerekli
const { verifyTokenAndAdmin, verifyTokenAndSeller } = require("./verifyToken");

// =============================================================================
// 1. ADMIN DASHBOARD - GENEL ÖZET (Full Kapsamlı)
// =============================================================================
router.get("/admin-summary", verifyTokenAndAdmin, async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    // --- A. TEMEL SAYAÇLAR (Eski Koddan Geldi) ---
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments(); // Bunu ekledik

    // --- B. TOPLAM CİRO (Optimize Edildi) ---
    // İptal edilenleri ciroya katmıyoruz.
    const incomeStats = await Order.aggregate([
      { $match: { status: { $ne: "İptal" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = incomeStats.length > 0 ? incomeStats[0].total : 0;

    // --- C. AYLIK SATIŞ GRAFİĞİ (Yeni Özellik) ---
    const monthlySales = await Order.aggregate([
      { $match: { status: { $ne: "İptal" } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$totalAmount",
        },
      },
      { $group: { _id: "$month", total: { $sum: "$sales" } } },
      { $sort: { _id: 1 } }
    ]);

    // --- D. SİPARİŞ DURUM DAĞILIMI (Pasta Grafik İçin - Eski Koddan) ---
    const orderStatusStats = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // --- E. EN ÇOK SATAN ÜRÜNLER (Top 5) ---
    const topProducts = await Order.aggregate([
        { $match: { status: { $ne: "İptal" } } },
        { $unwind: "$items" },
        { 
            $group: { 
                _id: "$items._id", 
                title: { $first: "$items.title" },
                img: { $first: "$items.img" },
                totalSold: { $sum: "$items.quantity" } 
            } 
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
    ]);

    // --- F. SON 5 SİPARİŞ (Özet Tablo İçin - Eski Koddan) ---
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("items.vendor", "username shopName") // Vendor ismini de görelim
      .select("recipient totalAmount status createdAt items");

    res.status(200).json({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts, // Eklendi
      orderStatusStats, // Eklendi
      monthlySales,
      topProducts,
      recentOrders // Eklendi
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// =============================================================================
// 2. VENDOR DASHBOARD - SATICIYA ÖZEL İSTATİSTİKLER
// =============================================================================
router.get("/vendor-summary/:vendorId", verifyTokenAndSeller, async (req, res) => {
    const vendorId = req.params.vendorId;
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        // 1. Satıcının Toplam Kazancı ve Satış Sayısı
        // Sadece bu satıcının ürünlerini (items array içinden) çekip topluyoruz.
        const vendorStats = await Order.aggregate([
            { $match: { status: { $ne: "İptal" } } },
            { $unwind: "$items" },
            { 
                $match: { "items.vendor": new mongoose.Types.ObjectId(vendorId) } 
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    totalItemsSold: { $sum: "$items.quantity" },
                    orderCount: { $addToSet: "$_id" } // Benzersiz sipariş sayısı
                }
            }
        ]);

        const stats = vendorStats.length > 0 ? vendorStats[0] : { totalEarnings: 0, totalItemsSold: 0, orderCount: [] };

        // 2. Aylık Kazanç Grafiği (Son 1 Yıl)
        const monthlyIncome = await Order.aggregate([
            { $match: { createdAt: { $gte: lastYear }, status: { $ne: "İptal" } } },
            { $unwind: "$items" },
            { $match: { "items.vendor": new mongoose.Types.ObjectId(vendorId) } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    earnings: { $multiply: ["$items.price", "$items.quantity"] },
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: "$earnings" },
                },
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            totalEarnings: stats.totalEarnings,
            totalSales: stats.totalItemsSold,
            totalOrders: stats.orderCount.length,
            monthlyData: monthlyIncome
        });

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// =============================================================================
// 3. KULLANICI KAYIT GRAFİĞİ (ADMİN İÇİN)
// =============================================================================
router.get("/user-stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 }, // O ay kaç kişi kaydoldu
        },
      },
      { $sort: { _id: 1 } }
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;