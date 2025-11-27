import { useCart } from "../context/CartContext";
import axios from "axios";
import { useState, useEffect } from "react";
import { FiTrash2, FiX, FiChevronLeft, FiShoppingBag } from "react-icons/fi";

const CartSidebar = () => {
  const { 
    cart, removeFromCart, increaseQuantity, decreaseQuantity, updateItemQuantity,
    totalPrice, isCartOpen, setIsCartOpen, setCart, clearCart, notify
  } = useCart();

  // --- STATE TANIMLARI ---
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [showClearConfirm, setShowClearConfirm] = useState(false); 
  
  // Görünüm: 'cart' (Liste) veya 'checkout' (Form)
  const [view, setView] = useState("cart"); 

  // Kupon
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponData, setCouponData] = useState(null); // Kargo dahil mi bilgisi için

  // Adres ve Kullanıcı
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddress, setSaveAddress] = useState(false); // Yeni adresi kaydetme isteği
  const user = JSON.parse(localStorage.getItem("user"));

  // Form Verileri
  const [formData, setFormData] = useState({
    senderName: "", senderPhone: "", senderEmail: "",
    recipientName: "", recipientPhone: "", address: "", city: "Londra", postcode: "",
    deliveryDate: "", timeSlot: "09:00 - 18:00", cardMessage: "", courierNote: "", isAnonymous: false
  });

  const [errors, setErrors] = useState({}); // Validasyon hataları

  // --- HESAPLAMALAR ---
  const DELIVERY_THRESHOLD = 200;
  const DELIVERY_COST = 20;

  // 1. İndirim
  const discountAmount = (totalPrice * discount) / 100;
  const priceAfterDiscount = totalPrice - discountAmount;

  // 2. Kargo (Kupon 'includeDelivery' ise veya tutar > 200 ise Ücretsiz)
  let deliveryFee = (cart.length > 0 && priceAfterDiscount < DELIVERY_THRESHOLD) ? DELIVERY_COST : 0;
  
  if (couponApplied && couponData?.includeDelivery) {
      deliveryFee = 0;
  }

  // 3. Toplam
  const finalPrice = priceAfterDiscount + deliveryFee;

  // --- ETKİLER (EFFECTS) ---

  // Form açılınca kullanıcı bilgilerini ve kayıtlı adresleri çek
  useEffect(() => {
    if (user && view === "checkout") {
      const fetchAddresses = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/users/${user._id}/addresses`);
          setSavedAddresses(res.data);
        } catch (err) { console.log(err); }
      };
      fetchAddresses();
      
      // Otomatik Doldurma
      setFormData(prev => ({
        ...prev,
        senderName: user.fullName || "", // fullName modeline uygun
        senderEmail: user.email || ""
      }));
    }
  }, [view, user]);

  // Sepet kapanırsa görünümü sıfırla
  useEffect(() => {
      if (!isCartOpen) {
          setTimeout(() => {
              setView("cart");
              setErrors({});
              setSaveAddress(false);
          }, 300);
      }
  }, [isCartOpen]);

  // --- AKSİYONLAR ---

  const handleAddressSelect = (e) => {
    const index = e.target.value;
    if (index === "") return;
    const selected = savedAddresses[index];
    setFormData(prev => ({
      ...prev,
      recipientName: selected.recipientName, recipientPhone: selected.recipientPhone,
      address: selected.address, city: selected.city, postcode: selected.postcode
    }));
    notify("Adres bilgileri dolduruldu ✨", "success");
    setErrors({});
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return notify("Kod girmediniz", "warning");
    try {
      const userIdParam = user ? `?userId=${user._id}` : "";
      const res = await axios.get(`http://localhost:5000/api/coupons/validate/${couponCode}${userIdParam}`);
      
      setCouponData(res.data);
      setDiscount(res.data.discountRate);
      setCouponApplied(true);
      
      let msg = `%${res.data.discountRate} İndirim Uygulandı! 🎉`;
      if (res.data.includeDelivery) msg += " + Kargo Bedava 🚚";
      notify(msg, "success");

    } catch (err) {
      setDiscount(0); setCouponApplied(false); setCouponData(null);
      notify(err.response?.data?.message || "Geçersiz kod.", "error");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: false });
  };

  const proceedToPayment = async (e) => {
    e.preventDefault();
    
    // 1. Validasyon
    const newErrors = {};
    const required = ["senderName", "senderPhone", "recipientName", "recipientPhone", "address", "city", "deliveryDate"];
    required.forEach(field => { if (!formData[field]) newErrors[field] = true; });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notify("Lütfen kırmızı alanları doldurun!", "error");
      return;
    }

    // 2. Adres Kaydetme (İsteğe Bağlı)
    if (user && saveAddress) {
        try {
           await axios.post(`http://localhost:5000/api/users/${user._id}/addresses`, {
             title: formData.recipientName + " - " + formData.city, // Otomatik başlık
             recipientName: formData.recipientName,
             recipientPhone: formData.recipientPhone,
             address: formData.address,
             city: formData.city,
             postcode: formData.postcode
           });
        } catch(e) { console.log("Adres kaydedilemedi", e); }
    }

    // 3. Sipariş Verisi
    const orderData = {
      userId: user ? user._id : null,
      items: cart,
      totalAmount: finalPrice,
      couponCode: couponApplied ? couponCode : null,
      deliveryFee: deliveryFee,
      sender: { name: formData.senderName, phone: formData.senderPhone, email: formData.senderEmail },
      recipient: { name: formData.recipientName, phone: formData.recipientPhone, address: formData.address, city: formData.city, postcode: formData.postcode },
      delivery: { date: formData.deliveryDate, timeSlot: formData.timeSlot, cardMessage: formData.cardMessage, courierNote: formData.courierNote, isAnonymous: formData.isAnonymous }
    };

    // 4. Ödeme Yöntemi Seçimi
    // A) Tutar 0 ise -> Direkt Kayıt
    if (finalPrice <= 0) {
      try {
        await axios.post("http://localhost:5000/api/orders", orderData);
        notify("Siparişiniz alındı! (Ücretsiz) 🌸", "success");
        setCart([]); setIsCartOpen(false); 
        localStorage.removeItem("tempOrderData");
        setTimeout(() => { window.location.href = "/my-orders"; }, 1500);
      } catch (err) { notify("Hata oluştu", "error"); }
      return;
    }

    // B) Tutar > 0 ise -> Stripe
    localStorage.setItem("tempOrderData", JSON.stringify(orderData));

    try {
      notify("Ödeme sayfasına yönlendiriliyorsunuz... 💳", "success");
      const res = await axios.post("http://localhost:5000/api/payment/create-checkout-session", {
        items: cart,
        couponCode: couponApplied ? couponCode : null,
        userEmail: formData.senderEmail,
        userId: user ? user._id : null
      });
      window.location.href = res.data.url;
    } catch (err) { notify("Ödeme sistemi başlatılamadı.", "error"); }
  };

  // Helperlar
  const handleCheckoutClick = () => { if (cart.length === 0) { notify("Sepet boş!", "error"); return; } setView("checkout"); };
  const handleDeleteClick = (item) => setItemToDelete(item);
  const confirmDelete = () => { if (itemToDelete) { removeFromCart(itemToDelete._id, itemToDelete.title); setItemToDelete(null); } };
  const confirmClearAll = () => { clearCart(); setShowClearConfirm(false); };
  const handleQuantityInput = (e, item) => {
    const val = e.target.value; if (val === "") { updateItemQuantity(item._id, 1, item.stock, item.title); return; }
    const numVal = parseInt(val); if (!isNaN(numVal)) updateItemQuantity(item._id, numVal, item.stock, item.title);
  };
  
  const inputClass = (name) => `w-full p-3 border rounded-xl outline-none transition text-sm ${errors[name] ? "border-red-500 bg-red-50 animate-shake" : "border-gray-200 focus:border-pink-500 focus:bg-white bg-gray-50"}`;

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right z-20">
        
        {/* --- BAŞLIK --- */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {view === "checkout" && (
              <button onClick={() => setView("cart")} className="text-gray-500 hover:text-pink-600 transition text-xl"><FiChevronLeft /></button>
            )}
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {view === "cart" ? <><FiShoppingBag /> Sepetim ({cart.length})</> : "Teslimat Bilgileri"}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {view === "cart" && cart.length > 0 && (
                <button onClick={() => setShowClearConfirm(true)} className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition">Temizle</button>
            )}
            <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-800 text-2xl transition"><FiX /></button>
          </div>
        </div>

        {/* --- İÇERİK --- */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6 scrollbar-hide">
          
          {/* 1. SEPET LİSTESİ */}
          {view === "cart" && (
            <>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 opacity-60">
                  <span className="text-6xl mb-4">🛒</span>
                  <p>Sepetiniz boş.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item._id} className="flex gap-4 items-center bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:shadow-md transition group">
                      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
                        <div className="text-pink-600 font-extrabold mt-1">£{item.price * item.quantity}</div>
                        
                        <div className="flex items-center gap-2 mt-2">
                           <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                             <button onClick={() => {if(item.quantity===1) setItemToDelete(item); else decreaseQuantity(item._id, item.title)}} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition font-bold">-</button>
                             <input type="number" value={item.quantity} onChange={(e) => handleQuantityInput(e, item)} className="w-8 h-7 text-center bg-transparent font-bold text-sm outline-none" />
                             <button onClick={() => increaseQuantity(item._id, item.title, item.stock)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition font-bold">+</button>
                           </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteClick(item)} className="text-gray-300 hover:text-red-500 transition p-2">
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 2. CHECKOUT FORMU */}
          {view === "checkout" && (
            <form id="checkout-form" onSubmit={proceedToPayment} className="space-y-6 animate-fade-in">
              
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">1. İletişim</h3>
                <div className="space-y-3">
                  <input name="senderName" value={formData.senderName} onChange={handleInputChange} className={inputClass("senderName")} placeholder="Adınız Soyadınız *" />
                  <div className="grid grid-cols-2 gap-3">
                      <input name="senderPhone" value={formData.senderPhone} onChange={handleInputChange} className={inputClass("senderPhone")} placeholder="Telefon *" />
                      <input name="senderEmail" value={formData.senderEmail} onChange={handleInputChange} className={inputClass("senderEmail")} placeholder="E-posta *" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">2. Alıcı & Adres</h3>
                   {savedAddresses.length > 0 && (
                      <select onChange={handleAddressSelect} className="text-xs border-b border-pink-300 text-pink-600 bg-transparent outline-none cursor-pointer font-bold py-1">
                        <option value="">📍 Kayıtlı Adres Seç</option>
                        {savedAddresses.map((addr, i) => (<option key={i} value={i}>{addr.title}</option>))}
                      </select>
                   )}
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                      <input name="recipientName" value={formData.recipientName} onChange={handleInputChange} className={inputClass("recipientName")} placeholder="Alıcı Adı *" />
                      <input name="recipientPhone" value={formData.recipientPhone} onChange={handleInputChange} className={inputClass("recipientPhone")} placeholder="Alıcı Tel *" />
                  </div>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} className={`h-24 resize-none ${inputClass("address")}`} placeholder="Tam Adres *" />
                  <div className="grid grid-cols-2 gap-3">
                      <input name="city" value={formData.city} onChange={handleInputChange} className={inputClass("city")} placeholder="Şehir *" />
                      <input name="postcode" value={formData.postcode} onChange={handleInputChange} className={inputClass("postcode")} placeholder="Posta Kodu" />
                  </div>
                  
                  {/* ADRES KAYDETME SEÇENEĞİ */}
                  {user && (
                    <div className="flex items-center gap-2 mt-2">
                      <input 
                        type="checkbox" 
                        id="saveAddr" 
                        checked={saveAddress} 
                        onChange={(e) => setSaveAddress(e.target.checked)} 
                        className="accent-pink-600 w-4 h-4 cursor-pointer" 
                      />
                      <label htmlFor="saveAddr" className="text-xs font-bold text-gray-600 cursor-pointer select-none">Bu adresi defterime kaydet</label>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">3. Teslimat</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input type="date" name="deliveryDate" min={new Date().toISOString().split("T")[0]} value={formData.deliveryDate} onChange={handleInputChange} className={inputClass("deliveryDate")} />
                  <select name="timeSlot" value={formData.timeSlot} onChange={handleInputChange} className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm font-medium outline-none"><option>09:00 - 12:00</option><option>12:00 - 18:00</option><option>18:00 - 22:00</option></select>
                </div>
                <textarea name="cardMessage" value={formData.cardMessage} onChange={handleInputChange} className="w-full p-3 rounded-xl border-2 border-pink-100 bg-pink-50/30 text-sm outline-none h-24 placeholder-pink-400/60 mb-3" placeholder="💌 Hediye Notunuz..." />
                <input name="courierNote" value={formData.courierNote} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none" placeholder="⚠️ Kuryeye Not" />
                <div className="flex items-center gap-2 mt-3 ml-1"><input type="checkbox" name="isAnonymous" checked={formData.isAnonymous} onChange={handleInputChange} className="accent-pink-600" /><label className="text-sm text-gray-600">İsimsiz Gönder</label></div>
              </div>
            </form>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="border-t bg-white p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-30">
          
          {view === "cart" && (
             <div className="mb-4">
               {!couponApplied ? (
                 <div className="flex gap-2">
                   <input type="text" placeholder="İndirim Kodu" className="flex-1 border-b-2 border-gray-200 p-2 text-sm uppercase outline-none focus:border-pink-500 bg-transparent font-bold tracking-wider" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                   <button onClick={handleApplyCoupon} className="text-sm font-bold text-pink-600 hover:text-pink-800 transition px-2">UYGULA</button>
                 </div>
               ) : (
                 <div className="flex justify-between items-center bg-green-50 p-3 rounded-xl border border-green-200 text-green-700 text-xs font-bold shadow-sm"><span>🎟️ {couponCode} (-%{discount}) {couponData?.includeDelivery && "+ Kargo Bedava"}</span><button onClick={() => {setDiscount(0); setCouponApplied(false); setCouponCode(""); setCouponData(null);}} className="text-red-500 hover:underline">Kaldır</button></div>
               )}
             </div>
          )}

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-gray-500"><span>Ara Toplam</span><span>£{totalPrice.toFixed(2)}</span></div>
            {couponApplied && <div className="flex justify-between text-green-600"><span>İndirim</span><span>-£{discountAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-blue-600"><span>Teslimat</span><span>{deliveryFee===0?"Ücretsiz 🚚":`£${deliveryFee.toFixed(2)}`}</span></div>
            <div className="flex justify-between text-xl font-extrabold text-gray-800 pt-2 border-t border-gray-100 mt-2"><span>Toplam</span><span className="text-pink-600">£{finalPrice.toFixed(2)}</span></div>
          </div>

          {view === "cart" ? (
            <button onClick={handleCheckoutClick} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition shadow-lg transform active:scale-95">Sepeti Onayla</button>
          ) : (
            <button type="submit" form="checkout-form" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition transform active:scale-95 flex justify-center items-center gap-2"><span>Öde ve Bitir</span> <span>💳</span></button>
          )}
        </div>
        
        {itemToDelete && (<div className="absolute inset-0 bg-white/95 z-50 flex items-center justify-center p-6 text-center"><div className="max-w-xs"><h3 className="text-xl font-bold mb-2">Silinsin mi?</h3><p className="text-gray-500 mb-6 text-sm">"{itemToDelete.title}" sepetten çıkarılacak.</p><div className="flex gap-3 justify-center"><button onClick={() => setItemToDelete(null)} className="px-6 py-3 border rounded-xl font-bold">Hayır</button><button onClick={confirmDelete} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg">Evet</button></div></div></div>)}
        {showClearConfirm && (<div className="absolute inset-0 bg-white/95 z-50 flex items-center justify-center p-6 text-center"><div className="max-w-xs"><h3 className="text-xl font-bold mb-2">Sepeti Boşalt?</h3><div className="flex gap-3 justify-center"><button onClick={() => setShowClearConfirm(false)} className="px-6 py-3 border rounded-xl font-bold">Vazgeç</button><button onClick={confirmClearAll} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg">Boşalt</button></div></div></div>)}
      </div>
    </div>
  );
};

export default CartSidebar;