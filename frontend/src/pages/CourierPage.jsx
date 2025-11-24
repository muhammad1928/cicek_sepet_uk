import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; 

// Bildirim Sesi
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const CourierPage = () => {
  const [activeTab, setActiveTab] = useState("pool"); // 'pool', 'mine', 'history'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobOffer, setJobOffer] = useState(null); // Yeni İş Fırsatı Modalı
  
  const navigate = useNavigate();
  const { notify } = useCart();
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Yeni sipariş takibi için referans
  const prevOrderCountRef = useRef(0);

  useEffect(() => {
    if (!user || (user.role !== "courier" && user.role !== "admin")) {
      navigate("/");
    }
    fetchOrders();

    // Polling (Canlı Takip) - 5 saniyede bir
    const interval = setInterval(() => fetchOrders(true), 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchOrders = async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      const allOrders = res.data;
      
      // Sadece "Hazırlanıyor" (Havuz) olanları filtrele
      const pool = allOrders.filter(o => o.status === "Hazırlanıyor");

      // Yeni iş varsa Modal Aç & Ses Çal
      if (isAuto && pool.length > prevOrderCountRef.current) {
        const newJob = pool[0]; 
        setJobOffer(newJob);
        new Audio(NOTIFICATION_SOUND).play().catch(e => {});
      }

      prevOrderCountRef.current = pool.length;
      setOrders(allOrders);
    } catch (err) { console.log(err); }
    finally { if (!isAuto) setLoading(false); }
  };

  const takeOrder = async (orderId) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
        status: "Yola Çıktı",
        courierId: user._id
      });
      notify("Sipariş zimmetlendi! İyi yolculuklar 🛵", "success");
      setJobOffer(null);
      fetchOrders();
      setActiveTab("mine");
    } catch (err) { notify("Hata oluştu veya iş alındı.", "error"); setJobOffer(null); }
  };

  const completeOrder = async (orderId) => {
    if (!confirm("Teslimatı onaylıyor musun?")) return;
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: "Teslim Edildi" });
      notify("Tebrikler! Teslimat tamamlandı ✅", "success");
      fetchOrders();
      setActiveTab("history");
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  // --- FİLTRELER ---
  const poolOrders = orders.filter(o => o.status === "Hazırlanıyor");
  const myOrders = orders.filter(o => o.courierId === user?._id && o.status === "Yola Çıktı");
  const historyOrders = orders.filter(o => o.courierId === user?._id && o.status === "Teslim Edildi");
  
  // Kazanç Hesabı (%10 Komisyon)
  const totalEarnings = historyOrders.reduce((acc, o) => acc + (o.totalAmount * 0.10), 0);

  return (
    <div className="min-h-screen bg-gray-100 font-sans pt-24 pb-10 px-4">
      
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kurye Paneli 🛵</h1>
          <div className="text-right">
            <div className="text-xs text-gray-500 font-bold">{user?.username}</div>
            <button onClick={() => { localStorage.removeItem("user"); navigate("/login"); }} className="text-sm text-red-500 font-bold hover:underline">Çıkış</button>
          </div>
        </div>

        {/* Kazanç Kartı */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg mb-6 flex justify-between items-center animate-fade-in">
          <div><p className="text-blue-100 text-sm font-medium uppercase">Toplam Kazanç</p><h2 className="text-3xl font-extrabold">£{totalEarnings.toFixed(2)}</h2></div>
          <div className="text-right"><div className="text-3xl font-bold">{historyOrders.length}</div><div className="text-xs text-blue-100">Teslimat</div></div>
        </div>

        {/* TAB MENÜSÜ */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab("pool")} className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${activeTab === "pool" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>
            Havuz ({poolOrders.length})
          </button>
          <button onClick={() => setActiveTab("mine")} className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${activeTab === "mine" ? "bg-green-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>
            Aktif ({myOrders.length})
          </button>
          <button onClick={() => setActiveTab("history")} className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${activeTab === "history" ? "bg-gray-700 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>
            Geçmiş ({historyOrders.length})
          </button>
        </div>

        {/* İÇERİK ALANI */}
        <div className="space-y-4">
          {loading && <div className="text-center py-4 font-bold text-gray-400">Yükleniyor...</div>}
          
          {/* TAB 1: BEKLEYEN İŞLER */}
          {activeTab === "pool" && (
            poolOrders.length === 0 ? <div className="text-center text-gray-400 py-10">Havuz boş, beklemede kal.</div> :
            poolOrders.map(order => (
              <OrderCard key={order._id} order={order} actionLabel="Teslim Al 📦" onAction={() => takeOrder(order._id)} color="blue" />
            ))
          )}

          {/* TAB 2: AKTİF TESLİMATLAR */}
          {activeTab === "mine" && (
            myOrders.length === 0 ? <div className="text-center text-gray-400 py-10">Üzerinizde aktif iş yok.</div> :
            myOrders.map(order => (
              <OrderCard key={order._id} order={order} actionLabel="Teslim Edildi ✅" onAction={() => completeOrder(order._id)} color="green" />
            ))
          )}

          {/* TAB 3: GEÇMİŞ SİPARİŞLER */}
          {activeTab === "history" && (
            historyOrders.length === 0 ? <div className="text-center text-gray-400 py-10">Henüz tamamlanan iş yok.</div> :
            historyOrders.map(order => (
              <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 opacity-80 hover:opacity-100 transition">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">Tamamlandı</span>
                  <span className="text-xs text-gray-400">{new Date(order.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">{order.recipient.address}</div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Tutar: £{order.totalAmount}</span>
                  <span className="text-sm font-bold text-green-600">+ £{(order.totalAmount * 0.10).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- YENİ İŞ FIRSATI MODALI --- */}
      {jobOffer && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative animate-bounce-in">
            <div className="h-32 bg-blue-600 flex items-center justify-center relative">
              <div className="bg-white p-4 rounded-full shadow-xl z-10 animate-pulse">🛵</div>
            </div>
            
            <div className="p-6 text-center">
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Yeni İş Fırsatı!</h2>
              <p className="text-gray-500 text-sm mb-6">Yakınlarda teslimat var.</p>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-left shadow-inner">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Adres</div>
                <div className="font-bold text-gray-800 text-md leading-tight line-clamp-2">{jobOffer.recipient.address}</div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm font-bold text-pink-600">£{jobOffer.totalAmount}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{jobOffer.items.length} Paket</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setJobOffer(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition border">Reddet</button>
                <button onClick={() => takeOrder(jobOffer._id)} className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg active:scale-95 transition">Kabul Et</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Kart Bileşeni
const OrderCard = ({ order, actionLabel, onAction, color }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden`}>
    <div className={`absolute left-0 top-0 bottom-0 w-2 bg-${color}-500`}></div>
    <div className="pl-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">#{order._id.slice(-4)}</span>
        <div className="text-right"><div className="font-bold text-gray-800">{order.recipient.city}</div></div>
      </div>
      <div className="font-bold text-gray-800 text-lg mb-1 leading-snug">{order.recipient.address}</div>
      <div className="text-xs text-gray-500 mb-4 flex items-center gap-2"><span>📦 {order.items.length} Ürün</span><span>•</span><span className="text-pink-600 font-bold">£{order.totalAmount}</span></div>
      <button onClick={onAction} className={`w-full bg-${color}-600 text-white py-3 rounded-xl font-bold hover:bg-${color}-700 active:scale-95 transition shadow-lg shadow-${color}-500/20`}>{actionLabel}</button>
    </div>
  </div>
);

export default CourierPage;