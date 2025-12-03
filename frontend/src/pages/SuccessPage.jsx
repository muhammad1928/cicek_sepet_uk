import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // useLocation EKLENDİ
import { publicRequest } from "../requestMethods";
import { useCart } from "../context/CartContext";
import Confetti from "react-confetti";
import { FiCheckCircle, FiPackage, FiMapPin, FiHome, FiCalendar, FiClock } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const SuccessPage = () => {
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { clearCart, notify } = useCart();
  const navigate = useNavigate();
  const location = useLocation(); // <--- Gelen veriyi yakalamak için
  
  const processedRef = useRef(false);

  useEffect(() => {
    const initializeOrder = async () => {
      // SENARYO 1: CartSidebar siparişi oluşturup bize elden verdiyse (0 TL)
      if (location.state?.order) {
        setOrder(location.state.order);
        setLoading(false);
        // Konfeti için temizlik yapıldığından emin olalım
        clearCart();
        return; 
      }

      // SENARYO 2: Stripe'dan döndüyse (Henüz sipariş oluşmadı)
      if (processedRef.current) return;

      const data = localStorage.getItem("tempOrderData");
      
      if (!data) {
        setLoading(false);
        return; 
      }

      processedRef.current = true;

      try {
        const orderData = JSON.parse(data);
        
        // Backend'e siparişi kaydet
        const res = await publicRequest.post("/orders", orderData);
        
        if (res.status === 200) {
          setOrder(res.data.order);
          
          // Temizlik
          clearCart(); 
          localStorage.setItem("cart", "[]"); 
          localStorage.removeItem("tempOrderData"); 
          
          notify(`${t("success.orderSuccess")} 🎉`, "success");
        }
      } catch (err) {
        console.error("Sipariş Kayıt Hatası:", err);
        notify(t("success.errorWhileOrder"), "error");
      } finally {
        setLoading(false);
      }
    };

    initializeOrder();
  }, [location.state]); // location.state değişirse tetikle

  return (
    <div className="min-h-screen bg-green-50 font-sans pt-24 pb-10 px-4 flex justify-center items-start relative overflow-hidden">
      
      {!loading && order && (
        <Confetti 
          width={window.innerWidth} 
          height={window.innerHeight} 
          recycle={false} 
          numberOfPieces={400} 
          gravity={0.2}
        />
      )}

      {/* --- YÜKLENİYOR --- */}
      {loading && (
        <div className="text-center pt-20 animate-pulse">
          <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-600">{t("success.processingOrder")}</h2>
          <p className="text-gray-400 mt-2">{t("success.wait")}</p>
        </div>
      )}

      {/* --- HATA (Sipariş Yoksa) --- */}
      {!loading && !order && (
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border-t-8 border-red-500">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800">{t("success.orderNotVisible1")}</h2>
          <p className="text-gray-500 mt-2 mb-6 text-sm">
            {t("success.orderNotVisible2")}
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={() => navigate("/my-orders")} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">{t("success.navigateToOrders")}</button>
            <button onClick={() => navigate("/")} className="text-gray-500 font-bold hover:underline py-2">{t("common.backToHome")}</button>
          </div>
        </div>
      )}

      {/* --- BAŞARI EKRANI (FİŞ) --- */}
      {!loading && order && (
        <div className="w-full max-w-3xl animate-fade-in-up relative z-10">
          
          {/* Başlık Kartı */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border-t-8 border-green-500 text-center mb-6">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-inner animate-bounce">
              <FiCheckCircle />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t("success.thankYou")}</h1>
            <p className="text-gray-600 text-lg">{t("success.orderReceived")}</p>
            
            <div className="mt-6 inline-block bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-widest">{t("success.orderNumber")}</p>
              <p className="text-2xl font-mono font-bold text-pink-600 tracking-widest">#{order._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          {/* Detay Kartı */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Ürünler */}
            <div className="p-8 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-6 flex items-center gap-2">
                <FiPackage /> {t("success.orderSummary")}
              </h3>
              <div className="space-y-6">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden border border-gray-100 shrink-0">
                        <img src={item.img} className="w-full h-full object-cover" alt={item.title} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{item.title}</p>
                        <p className="text-sm text-gray-500 font-medium">{t("myOrders.orderPieces")}: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">£{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              {/* Toplamlar */}
              <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                 <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{t("success.totalAmount")}</span>
                    <span>£{(order.totalAmount - order.deliveryFee).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm text-blue-600 mb-4 font-medium">
                    <span>{t("success.deliveryFee")}</span>
                    <span>{order.deliveryFee === 0 ? "Ücretsiz" : `£${order.deliveryFee.toFixed(2)}`}</span>
                 </div>
                 <div className="flex justify-between items-center text-2xl font-extrabold text-gray-900 border-t border-gray-100 pt-4">
                    <span>{t("success.generalTotal")}</span>
                    <span className="text-pink-600">£{order.totalAmount.toFixed(2)}</span>
                 </div>
              </div>
            </div>

            {/* Teslimat Bilgileri */}
            <div className="p-8 bg-gray-50 grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                  <FiMapPin /> {t("success.deliveryAddress")}
                </h4>
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm text-gray-700 shadow-sm">
                  <p className="font-bold text-gray-900 mb-1">{order.recipient.name}</p>
                  <p className="leading-relaxed">
                    {order.recipient.address} <br/>
                    {order.recipient.city}, {order.recipient.postcode}
                  </p>
                  <p className="mt-2 font-medium text-blue-600">{order.recipient.phone}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                   <FiCalendar /> {t("success.deliveryTime")}
                </h4>
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm text-gray-700 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{t("common.date")}:</span>
                    <span className="font-bold">{new Date(order.delivery.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t("common.time")}:</span>
                    <span className="font-bold text-blue-600 flex items-center gap-1"><FiClock /> {order.delivery.timeSlot}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alt Butonlar */}
            <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-center gap-4 bg-white">
              <button 
                onClick={() => navigate("/my-orders")} 
                className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2 transform active:scale-95"
              >
                <FiPackage /> {t("success.allOrders")}
              </button>
              <button 
                onClick={() => navigate("/")} 
                className="px-8 py-3.5 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 transform active:scale-95"
              >
                <FiHome /> {t("common.backToHome")}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;