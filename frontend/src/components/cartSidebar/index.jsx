import { useCart } from "../../context/CartContext";
import axios from "axios";
import { publicRequest, userRequest } from "../requestMethods";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../ConfirmModal";

// Alt Bileşenler
import SidebarHeader from "./SidebarHeader";
import CartItemList from "./CartItemList";
import CheckoutForm from "./CheckoutForm";
import SidebarFooter from "./SidebarFooter";

const CartSidebar = () => {
  const { 
    cart, removeFromCart, increaseQuantity, decreaseQuantity, updateItemQuantity,
    totalPrice, isCartOpen, setIsCartOpen, setCart, clearCart, notify
  } = useCart();
  
  const navigate = useNavigate();

  

  // --- STATE ---
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [showClearConfirm, setShowClearConfirm] = useState(false); 
  const [view, setView] = useState("cart"); 
  

  // Güvenlik
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckoutReady, setIsCheckoutReady] = useState(false);

  // Kupon
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponData, setCouponData] = useState(null);

  // Adres
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddress, setSaveAddress] = useState(false);
  
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } }, [isCartOpen]);

  // Form
  const [formData, setFormData] = useState({
    senderName: "", senderPhone: "", senderEmail: "",
    recipientName: "", recipientPhone: "", address: "", city: "Londra", postcode: "",
    deliveryDate: "", timeSlot: "", cardMessage: "", courierNote: "", isAnonymous: false,
    deliveryType: "standart"
  });

  const [errors, setErrors] = useState({});

  // --- TARİH AYARLARI ---
  const today = new Date();
  const currentHour = today.getHours();
  const todayStr = today.toISOString().split("T")[0];

  // Yarın
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // 2 Gün Sonra (Standart Kargo Başlangıcı)
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split("T")[0];

  // --- FİYATLANDIRMA ---
  const PRICES = { standart: 5.00, nextDay: 9.99, sameDay: 24.99, threshold: 200 };
  
  const discountAmount = (totalPrice * discount) / 100;
  const priceAfterDiscount = totalPrice - discountAmount;

  let deliveryFee = 0;
  if (!couponApplied || !couponData?.includeDelivery) {
      if (formData.deliveryType === 'same-day') deliveryFee = PRICES.sameDay;
      else if (formData.deliveryType === 'next-day') deliveryFee = PRICES.nextDay;
      else if (priceAfterDiscount < PRICES.threshold) deliveryFee = PRICES.standart;
  }

  const finalPrice = priceAfterDiscount + deliveryFee;

  // --- TARİH MANTIĞI ---
  const handleDeliveryTypeChange = (e) => {
    const type = e.target.value;
    let newDate = "";

    if (type === 'same-day') newDate = todayStr;
    else if (type === 'next-day') newDate = tomorrowStr;
    else if (type === 'standart') newDate = dayAfterTomorrowStr;

    setFormData({ ...formData, deliveryType: type, deliveryDate: newDate });
  };

  const getMinDate = () => {
    if (formData.deliveryType === 'same-day') return todayStr;
    if (formData.deliveryType === 'next-day') return tomorrowStr;
    return dayAfterTomorrowStr;
  };

  const getMaxDate = () => {
    if (formData.deliveryType === 'same-day') return todayStr;
    if (formData.deliveryType === 'next-day') return tomorrowStr;
    return undefined;
  };

  const getAvailableTimeSlots = () => {
    const allSlots = ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00", "18:00 - 22:00"];
    if (formData.deliveryDate === todayStr) {
        return allSlots.filter(slot => parseInt(slot.split(":")[0]) > currentHour);
    }
    return allSlots;
  };

  // --- SCROLL KİLİDİ VE ETKİLER ---
  
  // 1. Sepet açıkken arkaplanı kilitle
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen]);

  // 2. Form açılınca bilgileri çek
  useEffect(() => {
    if (view === "checkout") {
      setIsCheckoutReady(false);
      const timer = setTimeout(() => setIsCheckoutReady(true), 1000);
      
      if (user?._id) {
        const fetchAddresses = async () => { try { const res = await userRequest.get(`/users/${user._id}/addresses`); setSavedAddresses(res.data); } catch {} };
        fetchAddresses();
        setFormData(prev => ({ ...prev, senderName: user.fullName || "", senderEmail: user.email || "", senderPhone: user.phone || "" }));
      }
      
      if (!formData.deliveryDate) {
          setFormData(prev => ({ ...prev, deliveryDate: dayAfterTomorrowStr }));
      }

      return () => clearTimeout(timer);
    }
  }, [view, user?._id]); 

  // 3. Sepet kapanırsa temizle
  useEffect(() => {
      if (!isCartOpen) {
          setTimeout(() => {
              setView("cart"); setErrors({}); setSaveAddress(false); setCouponCode(""); setDiscount(0); setCouponApplied(false); setCouponData(null); setIsProcessing(false); setIsCheckoutReady(false);
          }, 300);
      }
  }, [isCartOpen]);

  // --- ACTIONS ---
  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: false });
  };

  const handleAddressSelect = (e) => {
      const index = e.target.value; if(index==="")return; const s = savedAddresses[index];
      setFormData(prev => ({...prev, recipientName: s.recipientName, recipientPhone: s.recipientPhone, address: s.address, city: s.city, postcode: s.postcode }));
      notify("Adres seçildi", "success"); setErrors({});
  };
  
  const handleApplyCoupon = async () => {
      if(!couponCode) return notify("Kod giriniz","warning");
      try { const res = await userRequest.get(`/coupons/validate/${couponCode}?userId=${user?._id||''}`); setCouponData(res.data); setDiscount(res.data.discountRate); setCouponApplied(true); notify("Kupon uygulandı!","success"); } 
      catch(e) { setDiscount(0); setCouponApplied(false); notify(e.response?.data?.message||"Geçersiz","error"); }
  };
  
  const handleCheckoutClick = () => {
      if (cart.length === 0) { notify("Sepet boş","error"); return; }
      setView("checkout");
  };
  
  const proceedToPayment = async (e) => {
    e.preventDefault(); if(!isCheckoutReady || isProcessing) return;
    
    const reqFields = ["senderName","senderPhone","recipientName","recipientPhone","address","city","deliveryDate"];
    const newErr={}; reqFields.forEach(f=>{if(!formData[f]) newErr[f]=true});
    if(Object.keys(newErr).length>0){ setErrors(newErr); notify("Kırmızı alanları doldurun","error"); return; }
    
    setIsProcessing(true);
    const metaDataInfo = { userAgent: navigator.userAgent, language: navigator.language };
    const orderData = { userId: user?user._id:null, items: cart, totalAmount: finalPrice, couponCode: couponApplied?couponCode:null, deliveryFee, sender: {name:formData.senderName, phone:formData.senderPhone, email:formData.senderEmail}, recipient: {name:formData.recipientName, phone:formData.recipientPhone, address:formData.address, city:formData.city, postcode:formData.postcode}, delivery: {date:formData.deliveryDate, timeSlot:formData.timeSlot, cardMessage:formData.cardMessage, courierNote:formData.courierNote, isAnonymous:formData.isAnonymous, deliveryType:formData.deliveryType}, metaData: metaDataInfo, saveAddress };

    if (finalPrice <= 0) {
        try { const res = await userRequest.post("/orders", orderData); notify("Sipariş alındı!","success"); setCart([]); setIsCartOpen(false); localStorage.removeItem("tempOrderData"); navigate("/success", { state: { order: res.data.order } }); } catch { notify("Hata","error"); setIsProcessing(false); } return;
    }
    localStorage.setItem("tempOrderData", JSON.stringify(orderData));
    try { notify("Ödeme sayfasına gidiliyor...","success"); const res = await userRequest.post("/payment/create-checkout-session", { items: cart, couponCode: couponApplied?couponCode:null, userEmail: formData.senderEmail, userId: user?user._id:null, deliveryFee }); window.location.href = res.data.url; } catch { notify("Ödeme hatası","error"); setIsProcessing(false); }
  };

  const handleDeleteClick = (item) => setItemToDelete(item);

  if (!isCartOpen) return null;

  return (
    // z-[5000] ile Navbar'ın üstüne çıkar
    <div className="fixed inset-0 z-[5000] flex justify-end">
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
      
      {/* Custom Scrollbar Style */}
      <style>{`
        .cart-scroll::-webkit-scrollbar { width: 6px; }
        .cart-scroll::-webkit-scrollbar-track { background: transparent; }
        .cart-scroll::-webkit-scrollbar-thumb { background: #db2777; border-radius: 10px; } 
        .cart-scroll::-webkit-scrollbar-thumb:hover { background: #be185d; }
      `}</style>

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-20 animate-slide-in-right">
        
        <SidebarHeader view={view} setView={setView} cartCount={cart.length} onClose={()=>setIsCartOpen(false)} setShowClearConfirm={setShowClearConfirm} />

        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6 cart-scroll">
           {view === 'cart' ? (
             <CartItemList cart={cart} increaseQuantity={increaseQuantity} decreaseQuantity={decreaseQuantity} updateItemQuantity={updateItemQuantity} removeFromCart={removeFromCart} setItemToDelete={setItemToDelete} />
           ) : (
             <CheckoutForm 
               formData={formData} handleInputChange={handleInputChange} 
               savedAddresses={savedAddresses} handleAddressSelect={handleAddressSelect} 
               user={user} saveAddress={saveAddress} setSaveAddress={setSaveAddress}
               errors={errors} getMinDate={getMinDate} getMaxDate={getMaxDate}
               getAvailableTimeSlots={getAvailableTimeSlots} handleDeliveryTypeChange={handleDeliveryTypeChange}
               priceAfterDiscount={priceAfterDiscount} PRICES={PRICES} currentHour={currentHour}
             />
           )}
        </div>

        <SidebarFooter 
           view={view} cartLength={cart.length} couponApplied={couponApplied} couponCode={couponCode} setCouponCode={setCouponCode} discount={discount} handleApplyCoupon={handleApplyCoupon} setDiscount={setDiscount} setCouponApplied={setCouponApplied} setCouponData={setCouponData} couponData={couponData}
           totalPrice={totalPrice} discountAmount={discountAmount} deliveryFee={deliveryFee} finalPrice={finalPrice} formData={formData}
           handleCheckoutClick={handleCheckoutClick} isProcessing={isProcessing} isCheckoutReady={isCheckoutReady} proceedToPayment={proceedToPayment}
        />
        
        {itemToDelete && (
        <ConfirmModal
            title={
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 tracking-tight">
                {itemToDelete.quantity} adet 
                <span className="font-semibold"> "{itemToDelete.title.toUpperCase()}" </span>
            </span>
            }
            message=" sepetten silinsin mi?"
            isDanger={true}
            onConfirm={() => {
            removeFromCart(itemToDelete._id, itemToDelete.title);
            setItemToDelete(null);
            }}
            onCancel={() => setItemToDelete(null)}
        />
        )}

        {showClearConfirm && <ConfirmModal title="Sepeti Boşalt?" message="Tüm ürünler silinecek." isDanger={true} onConfirm={() => { clearCart(); setShowClearConfirm(false); }} onCancel={() => setShowClearConfirm(false)} />}

      </div>
    </div>
  );
};

export default CartSidebar;