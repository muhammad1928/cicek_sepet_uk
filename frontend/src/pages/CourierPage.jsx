import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; 

// Bildirim Sesi (Tarayıcıda olan standart bir ses)
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const CourierPage = () => {
  const [activeTab, setActiveTab] = useState("pool");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // YENİ: İş Fırsatı Modalı için State
  const [jobOffer, setJobOffer] = useState(null); // Yeni gelen siparişi tutar
  
  const navigate = useNavigate();
  const { notify } = useCart();
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Eski sipariş sayısını tutmak için (Yeni geldiğini anlamak için)
  const prevOrderCountRef = useRef(0);

  useEffect(() => {
    if (!user || (user.role !== "courier" && user.role !== "admin")) {
      navigate("/");
    }
    // İlk yükleme
    fetchOrders();

    // CANLI TAKİP: Her 5 saniyede bir yeni iş var mı bak
    const interval = setInterval(() => {
      fetchOrders(true); // true = otomatik kontrol
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchOrders = async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    try {
      const res = await axios.get("https://ciceksepeti-api-m8ir.onrender.com/api/orders");
      const allOrders = res.data;
      
      // Sadece "Hazırlanıyor" olanlar (Havuz)
      const pool = allOrders.filter(o => o.status === "Hazırlanıyor");

      // YENİ SİPARİŞ KONTROLÜ
      if (isAuto && pool.length > prevOrderCountRef.current) {
        // Yeni bir iş var! En son geleni yakala
        const newJob = pool[0]; // Veya en yenisini bul
        setJobOffer(newJob); // Modalı Aç
        new Audio(NOTIFICATION_SOUND).play().catch(e => console.log("Ses çalınamadı")); // Sesi Çal
      }

      prevOrderCountRef.current = pool.length; // Sayıyı güncelle
      setOrders(allOrders);
    } catch (err) { console.log(err); }
    finally { if (!isAuto) setLoading(false); }
  };

  const takeOrder = async (orderId) => {
    try {
      await axios.put(`https://ciceksepeti-api-m8ir.onrender.com/api/orders/${orderId}`, {
        status: "Yola Çıktı",
        courierId: user._id
      });
      notify("Sipariş senin! Hızlı teslimat dileriz ⚡", "success");
      setJobOffer(null); // Modalı kapat
      fetchOrders();
      setActiveTab("mine");
    } catch (err) { notify("Başkası kaptı bile!", "error"); setJobOffer(null); }
  };

  const completeOrder = async (orderId) => {
    if (!confirm("Teslimatı onaylıyor musun?")) return;
    try {
      await axios.put(`https://ciceksepeti-api-m8ir.onrender.com/api/orders/${orderId}`, { status: "Teslim Edildi" });
      notify("Harika iş! Teslim edildi ✅", "success");
      fetchOrders();
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  const poolOrders = orders.filter(o => o.status === "Hazırlanıyor");
  const myOrders = orders.filter(o => o.courierId === user?._id && o.status === "Yola Çıktı");

  return (
    <div className="min-h-screen bg-gray-100 font-sans pt-24 pb-10 px-4">
      
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kurye Paneli 🛵</h1>
          <div className="text-right">
            <div className="text-xs text-gray-500">{user?.username}</div>
            <button onClick={() => { localStorage.removeItem("user"); navigate("/login"); }} className="text-sm text-red-500 font-bold">Çıkış</button>
          </div>
        </div>

        {/* Tab Menü */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6">
          <button onClick={() => setActiveTab("pool")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === "pool" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>
            İş Havuzu ({poolOrders.length})
          </button>
          <button onClick={() => setActiveTab("mine")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === "mine" ? "bg-green-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>
            Üzerimdekiler ({myOrders.length})
          </button>
        </div>

        {/* Liste */}
        <div className="space-y-4">
          {loading && <div className="text-center py-4">Yükleniyor...</div>}
          
          {activeTab === "pool" && (
            poolOrders.length === 0 ? <div className="text-center text-gray-400 py-10">Havuz boş, beklemede kal.</div> :
            poolOrders.map(order => (
              <OrderCard key={order._id} order={order} actionLabel="Kabul Et" onAction={() => takeOrder(order._id)} color="blue" />
            ))
          )}

          {activeTab === "mine" && (
            myOrders.length === 0 ? <div className="text-center text-gray-400 py-10">Aktif teslimatın yok.</div> :
            myOrders.map(order => (
              <OrderCard key={order._id} order={order} actionLabel="Teslim Edildi" onAction={() => completeOrder(order._id)} color="green" />
            ))
          )}
        </div>
      </div>

      {/* --- YENİ İŞ FIRSATI MODALI (POP-UP) --- */}
      {jobOffer && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative">
            {/* Harita Görseli (Temsili) */}
            <div className="h-32 bg-blue-100 flex items-center justify-center bg-[url('https://img.freepik.com/free-vector/city-map-background-design_1017-14473.jpg')] bg-cover opacity-80">
              <div className="bg-white p-3 rounded-full shadow-lg animate-bounce">
                🛵
              </div>
            </div>
            
            <div className="p-6 text-center">
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Yeni İş Fırsatı!</h2>
              <p className="text-gray-500 text-sm mb-4">Konumunuza yakın yeni bir sipariş düştü.</p>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 text-left">
                <div className="text-xs font-bold text-gray-400 uppercase">Teslimat Adresi</div>
                <div className="font-bold text-gray-800 text-lg leading-tight">{jobOffer.recipient.address}</div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm font-bold text-pink-600">£{jobOffer.totalAmount}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{jobOffer.items.length} Paket</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setJobOffer(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  Reddet
                </button>
                <button 
                  onClick={() => takeOrder(jobOffer._id)}
                  className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition transform active:scale-95"
                >
                  Kabul Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Kart Bileşeni (Temiz kod için ayırdım)
const OrderCard = ({ order, actionLabel, onAction, color }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden`}>
    <div className={`absolute left-0 top-0 bottom-0 w-2 bg-${color}-500`}></div>
    <div className="pl-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">#{order._id.slice(-4)}</span>
        <div className="text-right">
           <div className="font-bold text-gray-800">{order.recipient.city}</div>
           <div className="text-[10px] text-gray-400">Londra, UK</div>
        </div>
      </div>
      <div className="font-bold text-gray-800 text-lg mb-1 leading-snug">{order.recipient.address}</div>
      <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
        <span>📦 {order.items.length} Ürün</span>
        <span>•</span>
        <span className="text-pink-600 font-bold">£{order.totalAmount}</span>
      </div>
      <button onClick={onAction} className={`w-full bg-${color}-600 text-white py-3 rounded-xl font-bold hover:bg-${color}-700 active:scale-95 transition shadow-lg shadow-${color}-500/20`}>
        {actionLabel}
      </button>
    </div>
  </div>
);

export default CourierPage;