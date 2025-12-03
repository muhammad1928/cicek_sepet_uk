import { useCart } from "../context/CartContext";
import { userRequest } from "../requestMethods";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";
import { useTranslation } from "react-i18next";

// Yeni Componentler
import SidebarHeader from "./cartSidebar/SidebarHeader";
import CartItemList from "./cartSidebar/CartItemList";
import CheckoutForm from "./cartSidebar/CheckoutForm";
import SidebarFooter from "./cartSidebar/SidebarFooter";

const CartSidebar = () => {
  const { t } = useTranslation();
  const { 
    cart, removeFromCart, increaseQuantity, decreaseQuantity, updateItemQuantity,
    totalPrice, isCartOpen, setIsCartOpen, setCart, clearCart, notify
  } = useCart();
  
  const navigate = useNavigate();

  // --- STATE ---
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [showClearConfirm, setShowClearConfirm] = useState(false); 
  const [view, setView] = useState("cart"); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckoutReady, setIsCheckoutReady] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponData, setCouponData] = useState(null);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddress, setSaveAddress] = useState(false);
  
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } }, [isCartOpen]);

  const [formData, setFormData] = useState({
    senderName: "", senderPhone: "", senderEmail: "",
    recipientName: "", recipientPhone: "", address: "", city: "Londra", postcode: "",
    deliveryDate: "", timeSlot: "", cardMessage: "", courierNote: "", isAnonymous: false,
    deliveryType: "standart"
  });

  const [errors, setErrors] = useState({});

  // --- HESAPLAMALAR ---
  const PRICES = { standart: 5.99, nextDay: 9.99, sameDay: 24.99, threshold: 200 };
  const todayStr = new Date().toISOString().split("T")[0];
  
  const discountAmount = (totalPrice * discount) / 100;
  const priceAfterDiscount = totalPrice - discountAmount;

  let deliveryFee = 0;
  if (!couponApplied || !couponData?.includeDelivery) {
      if (formData.deliveryType === 'same-day') deliveryFee = PRICES.sameDay;
      else if (formData.deliveryType === 'next-day') deliveryFee = PRICES.nextDay;
      else if (priceAfterDiscount < PRICES.threshold) deliveryFee = PRICES.standart;
  }

  const finalPrice = priceAfterDiscount + deliveryFee;

  // --- ETKİLER ---
  useEffect(() => {
    if (view === "checkout") {
      setIsCheckoutReady(false);
      const timer = setTimeout(() => setIsCheckoutReady(true), 1000);
      
      if (user?._id) {
        const fetchAddresses = async () => {
            try { const res = await userRequest.get(`/users/${user._id}/addresses`); setSavedAddresses(res.data); } catch {}
        };
        fetchAddresses();
        setFormData(prev => ({ ...prev, senderName: prev.senderName || user.fullName || "", senderEmail: prev.senderEmail || user.email || "", senderPhone: prev.senderPhone || user.phone || "" }));
      }
      return () => clearTimeout(timer);
    }
  }, [view, user?._id]); 

  useEffect(() => {
      if (!isCartOpen) {
          setTimeout(() => {
              setView("cart"); setErrors({}); setSaveAddress(false); setCouponCode(""); setDiscount(0); setCouponApplied(false); setCouponData(null); setIsProcessing(false); setIsCheckoutReady(false);
          }, 300);
      }
  }, [isCartOpen]);

  // --- HELPER & ACTIONS ---
  const getAvailableTimeSlots = () => {
    const allSlots = ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00", "18:00 - 22:00"];
    if (formData.deliveryDate !== todayStr) return allSlots;
    const currentHour = new Date().getHours();
    return allSlots.filter(slot => parseInt(slot.split(":")[0]) > currentHour);
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: false });
  };

  const handleAddressSelect = (e) => {
      const index = e.target.value; if(index==="")return; const selected = savedAddresses[index];
      setFormData(prev => ({...prev, recipientName: selected.recipientName, recipientPhone: selected.recipientPhone, address: selected.address, city: selected.city, postcode: selected.postcode }));
      notify("Adres seçildi", "success"); setErrors({});
  };

  const handleApplyCoupon = async () => {
      if(!couponCode) return notify(t("cartSidebar.applyCode"),"warning");
      try {
          const userIdParam = user ? `?userId=${user._id}` : "";
          const res = await userRequest.get(`/coupons/validate/${couponCode}${userIdParam}`);
          setCouponData(res.data); setDiscount(res.data.discountRate); setCouponApplied(true); notify(t("cartSidebar.appliedSuccess"),"success");
      } catch(e) { setDiscount(0); setCouponApplied(false); notify(e.response?.data?.message||t("cartSidebar.invalid"),"error"); }
  };

  const handleCheckoutClick = () => {
      if (cart.length === 0) { notify(t("cartSidebar.emptyCart"), "error"); return; }
      setView("checkout");
  };

  const proceedToPayment = async (e) => {
    if(e) e.preventDefault();
    if (!isCheckoutReady || isProcessing) return;
    setIsProcessing(true);

    const newErrors = {};
    ["senderName","senderPhone","recipientName","recipientPhone","address","city","deliveryDate"].forEach(f => { if(!formData[f]) newErrors[f]=true; });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); notify(t("cartSidebar.fillEmptyBox"),"error"); setIsProcessing(false); return; }

    const metaDataInfo = { userAgent: navigator.userAgent, language: navigator.language, platform: navigator.platform, deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop", screenResolution: `${window.screen.width}x${window.screen.height}`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, referrer: document.referrer || "Direct" };
    const orderData = { userId: user ? user._id : null, items: cart, totalAmount: finalPrice, couponCode: couponApplied ? couponCode : null, deliveryFee, sender: { name: formData.senderName, phone: formData.senderPhone, email: formData.senderEmail }, recipient: { name: formData.recipientName, phone: formData.recipientPhone, address: formData.address, city: formData.city, postcode: formData.postcode }, delivery: { date: formData.deliveryDate, timeSlot: formData.timeSlot, cardMessage: formData.cardMessage, courierNote: formData.courierNote, isAnonymous: formData.isAnonymous, deliveryType: formData.deliveryType }, metaData: metaDataInfo, saveAddress };

    if (finalPrice <= 0) {
        try {
            const res = await userRequest.post("/orders", orderData);
            notify(t("cartSidebar.orderSuccess"),"success"); setCart([]); setIsCartOpen(false); localStorage.removeItem("tempOrderData"); navigate("/success", { state: { order: res.data.order } });
        } catch (e) { notify(t("common.error"),"error"); setIsProcessing(false); }
        return;
    }

    localStorage.setItem("tempOrderData", JSON.stringify(orderData));
    try {
        notify(t("cartSidebar.directingToPayment"),"success");
        const res = await userRequest.post("/payment/create-checkout-session", { items: cart, couponCode: couponApplied ? couponCode : null, userEmail: formData.senderEmail, userId: user ? user._id : null, deliveryFee });
        window.location.href = res.data.url;
    } catch (e) { notify(t("cartSidebar.paymentError"),"error"); setIsProcessing(false); }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right z-20">
        
        <SidebarHeader view={view} setView={setView} cartCount={cart.length} onClose={()=>setIsCartOpen(false)} setShowClearConfirm={setShowClearConfirm} />

        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6 scrollbar-hide">
           {view === "cart" ? (
             <CartItemList cart={cart} increaseQuantity={increaseQuantity} decreaseQuantity={decreaseQuantity} updateItemQuantity={updateItemQuantity} removeFromCart={removeFromCart} setItemToDelete={setItemToDelete} />
           ) : (
             <CheckoutForm 
               formData={formData} handleInputChange={handleInputChange} 
               savedAddresses={savedAddresses} handleAddressSelect={handleAddressSelect} 
               user={user} saveAddress={saveAddress} setSaveAddress={setSaveAddress}
               errors={errors} todayStr={todayStr} getAvailableTimeSlots={getAvailableTimeSlots}
               priceAfterDiscount={priceAfterDiscount} PRICES={PRICES}
             />
           )}
        </div>

        <SidebarFooter 
           view={view} cartLength={cart.length} couponApplied={couponApplied} couponCode={couponCode} setCouponCode={setCouponCode} discount={discount} handleApplyCoupon={handleApplyCoupon} setDiscount={setDiscount} setCouponApplied={setCouponApplied} setCouponData={setCouponData} couponData={couponData}
           totalPrice={totalPrice} discountAmount={discountAmount} deliveryFee={deliveryFee} finalPrice={finalPrice} formData={formData}
           handleCheckoutClick={handleCheckoutClick} isProcessing={isProcessing} isCheckoutReady={isCheckoutReady} proceedToPayment={proceedToPayment}
        />
        
        {itemToDelete && <ConfirmModal title={t("cartSidebar.wantToDelete")} message={`"${itemToDelete.title}" ${t("cartSidebar.removedFromCart")}`} isDanger={true} onConfirm={() => { removeFromCart(itemToDelete._id, itemToDelete.title); setItemToDelete(null); }} onCancel={() => setItemToDelete(null)} />}
        {showClearConfirm && <ConfirmModal title={t("cartSidebar.emptyCart")} message={t("cartSidebar.allWillBeRemoved")} isDanger={true} onConfirm={() => { clearCart(); setShowClearConfirm(false); }} onCancel={() => setShowClearConfirm(false)} />}

      </div>
    </div>
  );
};

export default CartSidebar;