const router = require("express").Router();
const Cart = require("../models/Cart");
const logActivity = require("../utils/logActivity"); // EKLENDİ
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

// =============================================================================
// 1. SEPET OLUŞTUR (CREATE)
// =============================================================================
router.post("/", verifyToken, async (req, res) => {
  const newCart = new Cart(req.body);
  try {
    const savedCart = await newCart.save();

    // LOGLAMA EKLENDİ
    await logActivity(req.user.id, 'add_to_cart', req, {
        cartId: savedCart._id,
        itemCount: req.body.products?.length || 0,
        action: 'create_new_cart'
    });

    res.status(200).json(savedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 2. SEPET GÜNCELLE (UPDATE)
// =============================================================================
router.put("/:id", verifyToken, async (req, res) => { 
  // verifyToken ekledim ki req.user.id'ye erişebilelim, güvenlik için de iyi.
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // LOGLAMA EKLENDİ
    if (updatedCart) {
        await logActivity(req.user.id, 'add_to_cart', req, {
            cartId: updatedCart._id,
            totalQuantity: updatedCart.products?.length || 0,
            action: 'update_cart'
        });
    }

    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 3. SEPET SİL (DELETE)
// =============================================================================
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    
    // Log (Opsiyonel: Sepet temizleme)
    await logActivity(req.user.id, 'remove_from_cart', req, { cartId: req.params.id, action: 'delete_cart' });

    res.status(200).json("Sepet silindi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 4. KULLANICI SEPETİNİ GETİR (GET USER CART)
// =============================================================================
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
});

// =============================================================================
// 5. TÜM SEPETLERİ GETİR (ADMIN)
// =============================================================================
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;