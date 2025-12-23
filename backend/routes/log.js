const router = require('express').Router();
const Log = require('../models/Log'); // Yeni Log modelimiz
const { verifyTokenAndAdmin } = require('./verifyToken');

// 1. TÜM LOGLARI GETİR (Admin Paneli İçin)
router.get('/', verifyTokenAndAdmin, async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ createdAt: -1 }) // En yeniden eskiye
      .limit(100) // Sayfa donmasın diye son 100 işlem
      .populate('userId', 'fullName email role'); // User ID yerine ismini getir

    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. KULLANICI DETAYI (Bir kişinin geçmişi)
router.get('/:userId', verifyTokenAndAdmin, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;