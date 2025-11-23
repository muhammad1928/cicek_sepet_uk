import { useCart } from "../context/CartContext";
import axios from "axios";
import { useState, useEffect } from "react";

const CartSidebar = () => {
  const { 
    cart, removeFromCart, increaseQuantity, decreaseQuantity, updateItemQuantity,
    totalPrice, isCartOpen, setIsCartOpen, setCart, clearCart, notify
  } = useCart();

  // Modallar için State
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [showClearConfirm, setShowClearConfirm] = useState(false); 
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Kupon State'leri
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0); // İndirim oranı (% kaç?)
  const [couponApplied, setCouponApplied] = useState(false);

  // Adres Defteri State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  // Form Verileri
  const [formData, setFormData] = useState({
    senderName: "", senderPhone: "", senderEmail: "",
    recipientName: "", recipientPhone: "", address: "", city: "Londra", postcode: "",
    deliveryDate: "", timeSlot: "09:00 - 18:00", cardMessage: "", courierNote: "", isAnonymous: false
  });

  // --- HESAPLAMALAR ---
  const discountAmount = (totalPrice * discount) / 100;
  const finalPrice = totalPrice - discountAmount;

  // --- ADRESLERİ ÇEK ---
  useEffect(() => {
    if (user && showCheckoutForm) {
      const fetchAddresses = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/users/${user._id}/addresses`);
          setSavedAddresses(res.data);
        } catch (err) { console.log(err); }
      };
      fetchAddresses();
    }
  }, [showCheckoutForm]);

  // --- KUPON İŞLEMLERİ ---
  const handleApplyCoupon = async () => {
    if (!couponCode) return notify("Kod girmediniz", "warning");
    try {
      const res = await axios.get(`http://localhost:5000/api/coupons/validate/${couponCode}`);
      setDiscount(res.data.discountRate);
      setCouponApplied(true);
      notify(`%${res.data.discountRate} İndirim Uygulandı! 🎉`, "success");
    } catch (err) {
      setDiscount(0);
      setCouponApplied(false);
      notify(err.response?.data?.message || "Geçersiz Kod", "error");
    }
  };

  // --- FORM İŞLEMLERİ ---
  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

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
  };

  // --- ÖDEME SÜRECİNİ BAŞLAT ---
  const proceedToPayment = async (e) => {
    e.preventDefault();
    
    // 1. Zorunlu Alan Kontrolü
    const requiredFields = [
        formData.senderName, formData.senderPhone, 
        formData.recipientName, formData.recipientPhone, 
        formData.address, formData.city, formData.deliveryDate
    ];

    if (requiredFields.some(field => !field || field.trim() === "")) {
      notify("Lütfen tüm zorunlu (*) alanları doldurun!", "error");
      return;
    }

    // 2. Sipariş Paketini Hazırla
    const orderData = {
      userId: user ? user._id : null,
      items: cart,
      totalAmount: finalPrice, // İndirimli tutarı gönderiyoruz
      sender: { name: formData.senderName, phone: formData.senderPhone, email: formData.senderEmail },
      recipient: { name: formData.recipientName, phone: formData.recipientPhone, address: formData.address, city: formData.city, postcode: formData.postcode },
      delivery: { date: formData.deliveryDate, timeSlot: formData.timeSlot, cardMessage: formData.cardMessage, courierNote: formData.courierNote, isAnonymous: formData.isAnonymous }
    };

    // 3. Veriyi Geçici Olarak Tarayıcıya Kaydet (Success sayfasında işlemek için)
    localStorage.setItem("tempOrderData", JSON.stringify(orderData));

    try {
      notify("Ödeme sayfasına yönlendiriliyorsunuz... 💳", "success");
      
      // 4. Stripe Linki İste (Buraya ürünleri gönderiyoruz)
      // Not: Gerçek senaryoda kupon bilgisini de göndermek gerekir ama şimdilik sepet tutarını backend hesaplıyor.
      // Basitlik için backend'deki payment rotası item fiyatlarını kullanıyor.
      const res = await axios.post("http://localhost:5000/api/payment/create-checkout-session", {
        items: cart
      });

      // 5. Stripe'a Yönlendir
      window.location.href = res.data.url;

    } catch (err) {
      notify("Ödeme sistemi başlatılamadı.", "error");
      console.log(err);
    }
  };

  // --- HELPERLAR ---
  const handleCheckoutClick = () => { if (cart.length === 0) { notify("Sepet boş!", "error"); return; } setShowCheckoutForm(true); };
  const handleDeleteClick = (item) => setItemToDelete(item);
  const confirmDelete = () => { if (itemToDelete) { removeFromCart(itemToDelete._id, itemToDelete.title); setItemToDelete(null); } };
  const confirmClearAll = () => { clearCart(); setShowClearConfirm(false); };
  
  const handleDecrease = (item) => { if (item.quantity === 1) setItemToDelete(item); else decreaseQuantity(item._id, item.title); };
  
  // Input ile miktar değişimi
  const handleQuantityInput = (e, item) => {
    const val = e.target.value;
    if (val === "") { updateItemQuantity(item._id, 1, item.stock, item.title); return; }
    const numVal = parseInt(val);
    if (!isNaN(numVal)) updateItemQuantity(item._id, numVal, item.stock, item.title);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end">
      {/* Arka Plan (Buzlu Cam) */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md transition-all duration-300" onClick={() => setIsCartOpen(false)}></div>
      
      {/* ANA SIDEBAR */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in z-20">
        
        {/* Başlık */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">Sepet ({cart.length})</h2>
            {cart.length > 0 && <button onClick={() => setShowClearConfirm(true)} className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition">Temizle</button>}
          </div>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
        </div>

        {/* Ürün Listesi */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? <div className="text-center mt-20 text-gray-400">Sepet boş.</div> : 
            cart.map((item) => (
              <div key={item._id} className="flex gap-4 border-b pb-4 items-center">
                <img src={item.img} alt={item.title} className="w-20 h-20 object-cover rounded-md border" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 line-clamp-1">{item.title}</h4>
                  <div className="text-pink-600 font-bold mt-1">£{item.price * item.quantity}</div>
                  
                  {/* Adet Kontrolü */}
                  <div className="flex items-center gap-0 mt-2 bg-gray-100 w-fit rounded-lg border border-gray-200">
                    <button onClick={() => handleDecrease(item)} className="w-8 h-8 font-bold text-gray-600 hover:bg-gray-200 rounded-l-lg">-</button>
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => handleQuantityInput(e, item)}
                      className="w-10 h-8 text-center font-bold text-gray-800 bg-transparent outline-none text-sm appearance-none m-0"
                    />
                    <button onClick={() => increaseQuantity(item._id, item.title, item.stock)} className="w-8 h-8 font-bold text-gray-600 hover:bg-gray-200 rounded-r-lg">+</button>
                  </div>
                </div>
                <button onClick={() => handleDeleteClick(item)} className="text-gray-400 hover:text-red-500 p-2">🗑️</button>
              </div>
            ))
          }
        </div>

        {/* FOOTER ALANI (Kupon ve Fiyat) */}
        <div className="border-t bg-gray-50">
          
          {/* Kupon Alanı */}
          <div className="px-6 py-4 border-b border-gray-200">
            {!couponApplied ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="İndirim Kodu" 
                  className="flex-1 border border-gray-300 rounded p-2 text-sm uppercase outline-none focus:border-pink-500"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <button onClick={handleApplyCoupon} className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-700 transition">Uygula</button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-green-100 p-2 rounded border border-green-200 text-green-700 text-sm font-bold">
                <span>🎟️ {couponCode} uygulandı (-%{discount})</span>
                <button onClick={() => {setDiscount(0); setCouponApplied(false); setCouponCode("");}} className="text-red-500 hover:underline">Kaldır</button>
              </div>
            )}
          </div>

          {/* Fiyat Özeti ve Buton */}
          <div className="p-6 pt-4">
            <div className="flex justify-between text-gray-500 mb-1"><span>Ara Toplam:</span><span>£{totalPrice}</span></div>
            {couponApplied && (
              <div className="flex justify-between text-green-600 mb-1"><span>İndirim:</span><span>-£{discountAmount.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-800 mb-4 pt-2 border-t border-gray-200">
              <span>Toplam:</span>
              <span className="text-pink-600">£{finalPrice.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckoutClick} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-500/30">
              Ödemeye Geç &gt;
            </button>
          </div>
        </div>

        {/* --- FORM MODALI --- */}
        {showCheckoutForm && (
          <div className="absolute inset-0 bg-white z-30 flex flex-col animate-fade-in">
            <div className="p-4 border-b flex justify-between items-center bg-pink-600 text-white">
              <h2 className="text-lg font-bold">Teslimat Bilgileri</h2>
              <button onClick={() => setShowCheckoutForm(false)} className="text-white/80 hover:text-white font-bold text-sm">KAPAT</button>
            </div>
            
            <form onSubmit={proceedToPayment} className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-6">
              
              {/* Gönderici */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-pink-600 uppercase mb-3 border-b pb-1">1. İletişim Bilgileriniz</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input name="senderName" value={formData.senderName} onChange={handleInputChange} className="p-2 border rounded w-full focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Adınız Soyadınız *" />
                  <input name="senderPhone" value={formData.senderPhone} onChange={handleInputChange} className="p-2 border rounded w-full focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Telefonunuz *" />
                  <input name="senderEmail" value={formData.senderEmail} onChange={handleInputChange} className="p-2 border rounded w-full col-span-2 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="E-posta Adresiniz" />
                </div>
              </div>

              {/* Alıcı */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3 border-b pb-1">
                  <h3 className="text-sm font-bold text-pink-600 uppercase">2. Alıcı Bilgileri</h3>
                  {savedAddresses.length > 0 && (
                    <select onChange={handleAddressSelect} className="text-xs border border-pink-300 rounded p-1 text-gray-600 bg-pink-50 outline-none max-w-[150px]">
                      <option value="">Kayıtlı Adres Seç...</option>
                      {savedAddresses.map((addr, i) => (<option key={i} value={i}>{addr.title}</option>))}
                    </select>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input name="recipientName" value={formData.recipientName} onChange={handleInputChange} className="p-2 border rounded w-full col-span-2 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Alıcı Adı Soyadı *" />
                  <input name="recipientPhone" value={formData.recipientPhone} onChange={handleInputChange} className="p-2 border rounded w-full col-span-2 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Alıcı Telefonu *" />
                  <textarea name="address" value={formData.address} onChange={handleInputChange} className="p-2 border rounded w-full col-span-2 h-20 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Tam Adres *" />
                  <input name="city" value={formData.city} onChange={handleInputChange} className="p-2 border rounded w-full focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Şehir *" />
                  <input name="postcode" value={formData.postcode} onChange={handleInputChange} className="p-2 border rounded w-full focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Posta Kodu" />
                </div>
              </div>

              {/* Teslimat */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-pink-600 uppercase mb-3 border-b pb-1">3. Teslimat Detayları</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 font-bold">Tarih *</label>
                        <input type="date" name="deliveryDate" min={new Date().toISOString().split("T")[0]} value={formData.deliveryDate} onChange={handleInputChange} className="p-2 border rounded w-full focus:ring-2 focus:ring-pink-500 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 font-bold">Saat Aralığı</label>
                        <select name="timeSlot" value={formData.timeSlot} onChange={handleInputChange} className="p-2 border rounded w-full bg-white focus:ring-2 focus:ring-pink-500 outline-none">
                            <option>09:00 - 12:00</option><option>12:00 - 18:00</option><option>18:00 - 22:00</option>
                        </select>
                    </div>
                  </div>
                  <textarea name="cardMessage" value={formData.cardMessage} onChange={handleInputChange} className="p-2 border rounded w-full h-16 text-sm focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Kart Notunuz..." />
                  <div className="flex items-center gap-2"><input type="checkbox" name="isAnonymous" checked={formData.isAnonymous} onChange={handleInputChange} id="anon" className="w-4 h-4 accent-pink-600" /><label htmlFor="anon" className="text-sm text-gray-700 select-none">Gizli Gönderim</label></div>
                  <input name="courierNote" value={formData.courierNote} onChange={handleInputChange} className="p-2 border rounded w-full text-xs focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Kuryeye Not" />
                </div>
              </div>

              <div className="pt-2 pb-10">
                <div className="flex justify-between text-lg font-bold text-gray-800 mb-4 px-2"><span>Ödenecek Tutar:</span><span className="text-pink-600">£{finalPrice.toFixed(2)}</span></div>
                <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-500/30">
                  Öde ve Tamamla 💳
                </button>
              </div>
            </form>
          </div>
        )}

        {itemToDelete && (<div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm"><div className="bg-white p-6 rounded-2xl text-center shadow-2xl"><h3 className="text-lg font-bold mb-4">Silinsin mi?</h3><div className="flex gap-3"><button onClick={() => setItemToDelete(null)} className="px-4 py-2 border rounded">Hayır</button><button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Evet</button></div></div></div>)}
        {showClearConfirm && (<div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm"><div className="bg-white p-6 rounded-2xl text-center shadow-2xl"><h3 className="text-lg font-bold mb-4">Sepet Boşaltılsın mı?</h3><div className="flex gap-3"><button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 border rounded">Vazgeç</button><button onClick={confirmClearAll} className="px-4 py-2 bg-red-600 text-white rounded">Temizle</button></div></div></div>)}

      </div>
    </div>
  );
};

export default CartSidebar;