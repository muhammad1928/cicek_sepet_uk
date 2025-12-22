const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const sendEmail = require('../utils/sendEmail');
const logActivity = require('../utils/logActivity');
const emailTexts = require('../utils/emailTranslations'); 
const { 
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyTokenAndSeller,
  verifyToken
} = require('./verifyToken');

const PRICING = {
    standart: 5.00,   
    nextDay: 9.99,    
    sameDay: 24.99,   
    freeThreshold: 200 
};

// =============================================================================
// 1. MAİL ŞABLONLARI
// =============================================================================
const createOrderEmail = (order, title, message, t) => {
  const subTotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = (subTotal + order.deliveryFee) - order.totalAmount;

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        ${item.img ? `<img src="${item.img}" width="40" style="border-radius:4px; vertical-align: middle; margin-right: 10px;">` : ''}
        <strong>${item.title}</strong>
        ${item.selectedVariant ? `<br/><span style="font-size:12px; color:#666;">(${item.selectedVariant.size} / ${item.selectedVariant.color})</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">£${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #db2777; padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">${title}</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #555; line-height: 1.5;">${message}</p>
        <h3 style="color: #333; border-bottom: 2px solid #db2777; padding-bottom: 10px; margin-top: 30px;">
            ${t.orderSummaryTitle} <span style="font-size: 14px; color: #888; font-weight: normal;">(#${order._id.toString().slice(-8).toUpperCase()})</span>
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f9f9f9; color: #666;">
              <th style="text-align: left; padding: 10px;">Product</th>
              <th style="text-align: center; padding: 10px;">Qty</th>
              <th style="text-align: right; padding: 10px;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align: right; margin-top: 20px; font-size: 14px;">
          <p style="margin: 5px 0; color: #666;">${t.subtotal}: <strong>£${subTotal.toFixed(2)}</strong></p>
          ${discountAmount > 0.01 ? `<p style="margin: 5px 0; color: #16a34a;">${t.discount}: <strong>-£${discountAmount.toFixed(2)}</strong></p>` : ''}
          <p style="margin: 5px 0; color: #666;">${t.delivery}: <strong>${order.deliveryFee === 0 ? t.free : '£' + order.deliveryFee.toFixed(2)}</strong></p>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 22px; color: #db2777;"><strong>${t.total}: £${order.totalAmount.toFixed(2)}</strong></p>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 25px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 14px; color: #334155;"><strong>📍 ${t.deliveryAddress}:</strong><br/>
          ${order.recipient.name}<br/>
          ${order.recipient.street ? order.recipient.street : order.recipient.address}, ${order.recipient.city}<br/>
          ${order.recipient.phone}</p>
        </div>
        <div style="text-align: center; margin-top: 35px;">
          <a href="${process.env.CLIENT_URL}/my-orders" style="background-color: #db2777; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
            ${t.trackOrderBtn}
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} FlowerLovers. All rights reserved.
      </div>
    </div>
  `;
};

const createVendorEmail = (vendorData, orderId, deliveryFee, t) => {
  const vendorTotal = vendorData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const itemsHtml = vendorData.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.title}
        ${item.selectedVariant ? `<br/><small>(${item.selectedVariant.size} - ${item.selectedVariant.color})</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">£${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">£${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">📦 ${t.newOrderSubject}</h2>
      </div>
      <div style="padding: 25px;">
        <p style="font-size: 16px; color: #333;">Hello <b>${vendorData.name}</b>,</p>
        <p style="color: #555;">${t.newOrderMsg} (#${orderId.toString().slice(-8).toUpperCase()}).</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <thead>
             <tr style="background-color: #f3f4f6; color: #555;">
               <th style="text-align: left; padding: 10px;">Product</th>
               <th style="text-align: center; padding: 10px;">Qty</th>
               <th style="text-align: right; padding: 10px;">Unit Price</th>
               <th style="text-align: right; padding: 10px;">Total</th>
             </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align: right; margin-top: 20px; font-size: 18px;">
           <p>${t.vendorEarnings}: <strong style="color: #4f46e5;">£${vendorTotal.toFixed(2)}</strong></p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL}/vendor" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">${t.vendorPanelBtn}</a>
        </div>
      </div>
    </div>
  `;
};

const createVendorCancelEmail = (vendorName, orderId, t) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px; background-color: #fff5f5;">
      <h2 style="color: #991b1b; margin-top: 0;">${t.vendorCancelSubject}</h2>
      <p>Hello <b>${vendorName}</b>,</p>
      <p>Order <strong>#${orderId.toString().slice(-8).toUpperCase()}</strong> ${t.vendorCancelMsg}</p>
      <hr style="border: 0; border-top: 1px solid #fecaca; margin: 20px 0;">
      <p style="font-size: 12px; color: #7f1d1d;">FlowerLovers Team</p>
    </div>
  `;
};

const createCourierCancelEmail = (courierName, orderId, t) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #dc2626; border-radius: 8px; background-color: #fef2f2;">
      <h2 style="color: #dc2626; margin-top: 0;">${t.courierCancelSubject}</h2>
      <p>Hello <b>${courierName}</b>,</p>
      <p>Order <strong>#${orderId.toString().slice(-8).toUpperCase()}</strong> ${t.courierCancelMsg}</p>
    </div>
  `;
};


// =============================================================================
// 2. SİPARİŞ OLUŞTURMA (POST)
// =============================================================================
router.post('/', async (req, res) => {
  const { items, sender, recipient, delivery, userId, couponCode, metaData, saveAddress, language } = req.body;

  try {
    const lang = language || 'en';
    const t = emailTexts[lang] || emailTexts['en'];

    let calculatedTotal = 0;
    let rawTotal = 0;
    let finalItems = [];

    // --- A) ÜRÜNLERİ DOĞRULA, FİYATI DB'DEN ÇEK VE STOK DÜŞ ---
    for (const item of items) {
      const product = await Product.findById(item._id);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.title}` });
      }

      // --- STOK KONTROLÜ ---
      let hasStock = false;
      let variantIndex = -1;

      if (item.selectedVariant && product.variants && product.variants.length > 0) {
          variantIndex = product.variants.findIndex(v => 
              v.size === item.selectedVariant.size && v.color === item.selectedVariant.color
          );

          if (variantIndex > -1) {
              if (product.variants[variantIndex].stock >= item.quantity) {
                  hasStock = true;
                  product.variants[variantIndex].stock -= item.quantity;
              }
          }
      } else {
          if (product.stock >= item.quantity) {
              hasStock = true;
              product.stock -= item.quantity;
          }
      }

      if (!hasStock) {
        return res.status(400).json({ message: `Insufficient stock for ${item.title}` });
      }
      
      await product.save();

      const price = product.price;
      calculatedTotal += price * item.quantity;
      rawTotal += price * item.quantity; 

      // --- RESİM KONTROLÜ (GÜVENLİ) ---
      // Önce product.img'ye bak, yoksa product.imgs dizisinin ilk elemanına bak.
      const itemImage = product.img || (product.imgs && product.imgs.length > 0 ? product.imgs[0] : "");

      finalItems.push({
        _id: product._id,
        title: product.title,
        price: price,
        quantity: item.quantity,
        img: itemImage, // <-- Düzeltilen kısım
        vendor: product.vendor, 
        selectedVariant: item.selectedVariant || null
      });
    }

    // --- B) KUPON VE KARGO ---
    let discountAmount = 0;
    let isFreeDelivery = false;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (coupon && coupon.isActive) {
        const now = new Date();
        const expiry = new Date(coupon.expiryDate);
        expiry.setHours(23, 59, 59, 999); 
        if (now <= expiry) {
            const isUsed = userId && coupon.usedBy.includes(userId);
            if (!isUsed) {
              discountAmount = (calculatedTotal * coupon.discountRate) / 100;
              if (coupon.includeDelivery) isFreeDelivery = true;
              if (userId) {
                coupon.usedBy.push(userId);
                await coupon.save();
              }
            }
        }
      }
    }

    let priceAfterDiscount = calculatedTotal - discountAmount;
    let deliveryFee = 0;
    const deliveryType = delivery.deliveryType || 'standart';

    if (!isFreeDelivery) {
        switch (deliveryType) {
            case 'same-day': deliveryFee = PRICING.sameDay; break;
            case 'next-day': deliveryFee = PRICING.nextDay; break;
            case 'standart':
            default:
                if ((calculatedTotal - discountAmount) < PRICING.freeThreshold) {
                    deliveryFee = PRICING.standart;
                }
                break;
        }
    }
    const finalTotalAmount = priceAfterDiscount + deliveryFee;

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const finalMetaData = { ...metaData, ip: clientIp };

    if (userId) {
      try {
         await User.findByIdAndUpdate(userId, { $set: { phone: sender.phone } });
         if (saveAddress) {
             await User.findByIdAndUpdate(userId, { 
                 $addToSet: { savedAddresses: {
                    title: `${recipient.name} - ${recipient.city}`,
                    recipientName: recipient.name, 
                    recipientPhone: recipient.phone,
                    address: recipient.address || recipient.street,
                    street: recipient.street,
                    buildingNo: recipient.buildingNo,
                    apartment: recipient.apartment,
                    floor: recipient.floor,
                    city: recipient.city, 
                    postcode: recipient.postcode,
                    country: recipient.country
                 }} 
             });
         }
      } catch(e) { console.log("User update error:", e); }
    }

    // --- SİPARİŞİ KAYDET ---
    const newOrder = new Order({
      userId,
      items: finalItems,
      totalAmount: finalTotalAmount,
      rawTotal: rawTotal,
      deliveryFee: deliveryFee,
      sender, recipient, delivery,
      status: 'Sipariş Alındı',
      metaData: finalMetaData,
      language: lang
    });

    const savedOrder = await newOrder.save();

    if (userId) {
        await logActivity(userId, 'order_placed', req, { 
            orderId: savedOrder._id, 
            amount: finalTotalAmount 
        });
    }

    // --- MAİLLER ---
    const customerMailContent = createOrderEmail(savedOrder, t.orderSubject, `${t.orderTitle} ${sender.name}, ${t.orderMsg}`, t);
    sendEmail(sender.email, t.orderSubject, customerMailContent).catch(console.error);

    // 2. ADMİN'E (SANA) GİDEN MAİL - [YENİ EKLENEN KISIM] 🚨
    // .env dosyanda ADMIN_EMAIL varsa ona, yoksa info@fesfu.com'a gönderir.
    const adminEmail = process.env.ADMIN_EMAIL || 'info@fesfu.com';
    const adminSubject = `[ADMIN] Yeni Sipariş Var! (#${savedOrder._id.toString().slice(-6)})`;
    
    // Admin'e de müşteriye giden detaylı formatın aynısını atıyoruz ki her şeyi gör.
    sendEmail(adminEmail, adminSubject, customerMailContent).catch(err => console.error("Admin Mail Error:", err.message));

    // satici mailleri
    const vendorMap = new Map(); 
    for (const item of finalItems) {
        if (item.vendor) {
            const vId = item.vendor.toString();
            if (!vendorMap.has(vId)) {
                const vendorUser = await User.findById(item.vendor);
                if (vendorUser) {
                    vendorMap.set(vId, { email: vendorUser.email, name: vendorUser.fullName, items: [] });
                }
            }
            if(vendorMap.has(vId)) {
                vendorMap.get(vId).items.push({ 
                    title: item.title, 
                    quantity: item.quantity, 
                    price: item.price,
                    selectedVariant: item.selectedVariant 
                });
            }
        }
    }

    for (const [id, data] of vendorMap) {
        const vendorMail = createVendorEmail(data, savedOrder._id, deliveryFee, t);
        sendEmail(data.email, t.newOrderSubject, vendorMail).catch(console.error);
    }

    res.status(200).json({ message: "Order created successfully!", order: savedOrder });

  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ message: "Server error occurred." });
  }
});

// =============================================================================
// 3. GET VE PUT ROTALARI
// =============================================================================

// KULLANICI
router.get('/find/:userId', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) { res.status(500).json(err); }
});

// SATICI
router.get('/vendor/:vendorId', verifyTokenAndSeller, async (req, res) => {
  try {
    const orders = await Order.find({
      "items.vendor": req.params.vendorId 
    }).sort({ createdAt: -1 });

    const sanitizedOrders = orders.map((order) => {
      const orderDoc = order.toObject();
      orderDoc.items = orderDoc.items.filter(
        (item) => item.vendor && item.vendor.toString() === req.params.vendorId
      );
      if (orderDoc.items.length > 0) {
          orderDoc.vendorTotal = orderDoc.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      }
      return orderDoc;
    });

    const finalOrders = sanitizedOrders.filter(o => o.items.length > 0);
    res.status(200).json(finalOrders);
  } catch (err) { res.status(500).json(err); }
});

// ADMIN
router.get('/', verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('items.vendor', 'username shopName'); 
    res.status(200).json(orders);
  } catch (err) { res.status(500).json(err); }
});

// GÜNCELLEME
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { status, courierId, courierRejectionReason, cancellationReason } = req.body;
    
    if (req.user.role === 'customer' && status !== 'İptal Talebi') {
        return res.status(403).json({ message: "Unauthorized action." });
    }
    if (!['admin', 'vendor', 'courier', 'customer'].includes(req.user.role)) {
        return res.status(403).json({ message: "Unauthorized." });
    }

    const updateData = { status };
    if (courierId !== undefined) updateData.courierId = courierId;
    if (courierRejectionReason) updateData.courierRejectionReason = courierRejectionReason;
    if (cancellationReason) updateData.cancellationReason = cancellationReason;

    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json("Order not found");

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });

    const lang = updatedOrder.language || 'en';
    const t = emailTexts[lang] || emailTexts['en'];

    if (status === "İptal") {
        const vendorSet = new Set(); 
        for (const item of updatedOrder.items) {
            if (item._id) {
                const product = await Product.findById(item._id).populate('vendor');
                if (product && product.vendor && !vendorSet.has(product.vendor._id.toString())) {
                    vendorSet.add(product.vendor._id.toString());
                    const mailContent = createVendorCancelEmail(product.vendor.fullName, updatedOrder._id, t);
                    sendEmail(product.vendor.email, t.vendorCancelSubject, mailContent).catch(console.error);
                }
            }
        }
        if (oldOrder.courierId) {
            const courier = await User.findById(oldOrder.courierId);
            if (courier) {
                const courierMail = createCourierCancelEmail(courier.fullName, updatedOrder._id, t);
                sendEmail(courier.email, t.courierCancelSubject, courierMail).catch(console.error);
            }
        }
    }
    
    if (status === "İptal Talebi" && updatedOrder.userId) {
        try { await logActivity(updatedOrder.userId, 'order_cancel_request', req, { orderId: updatedOrder._id, reason: cancellationReason }); } catch(e) {}
    }

    let subject = "";
    let msg = "";

    switch (status) {
      case "Hazırlanıyor": subject = t.statusPreparing; msg = t.msgPreparing; break;
      case "Yola Çıktı": subject = t.statusOnWay; msg = t.msgOnWay; break;
      case "Teslim Edildi": subject = t.statusDelivered; msg = t.msgDelivered; break;
      case "İptal": subject = t.statusCancelled; msg = t.msgCancelled; break;
      case "İptal Talebi": subject = t.statusCancelRequest; msg = `${t.msgCancelRequest}<br/><br/>${cancellationReason || ''}`; break;
    }

    if (subject && updatedOrder.sender.email) {
      const mailContent = createOrderEmail(updatedOrder, subject, msg, t);
      sendEmail(updatedOrder.sender.email, subject, mailContent).catch(console.error);
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;