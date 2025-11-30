import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../../components/ConfirmModal";
import { FiMapPin, FiPackage, FiNavigation, FiUser, FiCheckCircle, FiClock, FiRefreshCw, FiPhone } from "react-icons/fi";

const CourierPage = () => {
  const [activeTab, setActiveTab] = useState("pool"); // pool | active | history
  const [orders, setOrders] = useState([]);
  const [myActiveJob, setMyActiveJob] = useState(null); // Üzerimdeki iş
  const [confirmData, setConfirmData] = useState(null); // Onay Modalı
  
  const { notify } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Polling Refleri
  const isMounted = useRef(false);
  const timerRef = useRef(null);

  // Güvenlik Kontrolü
  useEffect(() => {
    if (!user || user.role !== "courier") navigate("/");
    else if (user.applicationStatus !== "approved") navigate("/partner-application");
  }, [user, navigate]);

  // --- VERİLERİ ÇEK (POLLING İLE) ---
  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      
      if (isMounted.current) {
        const allOrders = res.data;

        // 1. Havuz: Durumu 'Hazır' olan ve henüz kuryesi olmayanlar
        const pool = allOrders.filter(o => o.status === "Hazır" && !o.courierId);
        
        // 2. Aktif İş: Benim üzerimdeki ve bitmemiş işler
        const active = allOrders.find(o => o.courierId === user._id && (o.status === "Kurye Yolda" || o.status === "Dağıtımda"));
        
        // 3. Geçmiş: Benim teslim ettiklerim
        const history = allOrders.filter(o => o.courierId === user._id && o.status === "Teslim Edildi").sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setMyActiveJob(active); // Aktif işi state'e at

        if (activeTab === "pool") setOrders(pool);
        else if (activeTab === "active") setOrders(active ? [active] : []); // Aktif sekmesinde sadece aktif işi göster
        else if (activeTab === "history") setOrders(history);
      }
    } catch (err) {
      console.log("Veri çekme hatası:", err);
    } finally {
      // 10 saniyede bir yenile (Sunucuyu çok yormadan)
      if (isMounted.current) {
        timerRef.current = setTimeout(() => {
          if (document.visibilityState === 'visible') fetchOrders();
        }, 10000);
      }
    }
  }, [activeTab, user._id]);

  // Lifecycle Yönetimi
  useEffect(() => {
    isMounted.current = true;
    fetchOrders();
    return () => {
      isMounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchOrders]);

  // --- AKSİYONLAR ---

  // 1. İşi Al (Havuz -> Aktif)
  const handleAcceptJob = (orderId) => {
    if (myActiveJob) return notify("Zaten üzerinde bir iş var! Önce onu tamamla.", "warning");

    setConfirmData({
      isOpen: true,
      title: "Görevi Kabul Et?",
      message: "Bu siparişi teslim etmek üzere üzerinize alıyorsunuz.",
      isDanger: false,
      action: async () => {
        try {
          await axios.put(`http://localhost:5000/api/orders/${orderId}`, { 
            status: "Kurye Yolda", 
            courierId: user._id 
          });
          notify("İş Alındı! Mağazaya doğru yola çıkın. 🛵", "success");
          setActiveTab("active");
          fetchOrders();
        } catch (err) {
          notify("Bu iş başkası tarafından alınmış olabilir.", "error");
          fetchOrders();
        }
        setConfirmData(null);
      }
    });
  };

  // 2. Mağazadan Teslim Al (Kurye Yolda -> Dağıtımda)
  const handlePickup = async () => {
    setConfirmData({
      isOpen: true, title: "Ürünleri Aldın mı?", message: "Mağazadan ürünleri teslim aldığını onayla.", isDanger: false,
      action: async () => {
        try {
          await axios.put(`http://localhost:5000/api/orders/${myActiveJob._id}`, { status: "Dağıtımda" });
          notify("Ürün Alındı! Müşteriye doğru yola çıkın. 🏁", "success");
          fetchOrders();
        } catch (err) { notify("Hata oluştu", "error"); }
        setConfirmData(null);
      }
    });
  };

  // 3. Teslim Et (Dağıtımda -> Teslim Edildi)
  const handleDeliver = async () => {
    setConfirmData({
      isOpen: true, title: "Teslim Edildi?", message: "Siparişi müşteriye teslim ettiğini onayla.", isDanger: false,
      action: async () => {
        try {
          await axios.put(`http://localhost:5000/api/orders/${myActiveJob._id}`, { status: "Teslim Edildi" });
          notify("Tebrikler! Teslimat tamamlandı. Kazancın eklendi. 🎉", "success");
          setMyActiveJob(null);
          setActiveTab("history");
          fetchOrders();
        } catch (err) { notify("Hata oluştu", "error"); }
        setConfirmData(null);
      }
    });
  };

  // Çıkış Yap
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("user-change"));
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Başlık ve Profil */}
        <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kurye Paneli</h1>
            <p className="text-xs text-gray-500">Hoşgeldin, {user.fullName}</p>
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition">Çıkış</button>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <TabBtn active={activeTab === "pool"} onClick={() => setActiveTab("pool")} label={`İş Havuzu (${activeTab === 'pool' ? orders.length : '...'})`} icon="📋" />
          <TabBtn active={activeTab === "active"} onClick={() => setActiveTab("active")} label="Aktif Görev" icon="🛵" highlight={!!myActiveJob} />
          <TabBtn active={activeTab === "history"} onClick={() => setActiveTab("history")} label="Geçmiş" icon="✅" />
        </div>

        {/* --- 1. İŞ HAVUZU --- */}
        {activeTab === "pool" && (
           <div className="space-y-4 animate-fade-in">
             <div className="flex justify-end mb-2">
                <button onClick={() => fetchOrders()} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"><FiRefreshCw/> Listeyi Yenile</button>
             </div>
             
             {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                  <div className="text-5xl mb-3 opacity-50">📭</div>
                  <p>Şu an uygun iş yok. Beklemede kalın.</p>
                </div>
             ) : (
                orders.map(order => (
                  <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition relative overflow-hidden">
                    <div className="absolute top-4 right-4 bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">£{(order.totalAmount * 0.10).toFixed(2)} Kazanç</div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="space-y-1">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Alınacak Yer</div>
                          {/* Not: Backend'den vendor address gelmeli, şimdilik temsili */}
                          <div className="font-bold text-gray-800 text-lg flex items-center gap-2"><FiStoreIcon /> {order.items[0]?.title || "Mağaza"}</div>
                          <div className="text-sm text-gray-500">123 Oxford Street (Temsili)</div>
                       </div>
                       
                       <div className="hidden md:block text-gray-300 text-2xl">➝</div>

                       <div className="space-y-1">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Teslimat</div>
                          <div className="font-bold text-gray-800 text-lg flex items-center gap-2"><FiMapPin /> {order.recipient.city}</div>
                          <div className="text-sm text-gray-500">{order.recipient.postcode}</div>
                       </div>

                       <button onClick={() => handleAcceptJob(order._id)} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg transform active:scale-95 transition">İşi Al</button>
                    </div>
                  </div>
                ))
             )}
           </div>
        )}

        {/* --- 2. AKTİF GÖREV --- */}
        {activeTab === "active" && (
           <div className="animate-fade-in">
             {!myActiveJob ? (
               <div className="text-center py-20 bg-white rounded-2xl border-dashed border-2 border-gray-200">
                 <div className="text-4xl mb-4">💤</div>
                 <h3 className="text-xl font-bold text-gray-700">Şu an üzerinde bir iş yok.</h3>
                 <p className="text-gray-500 mt-2">Havuzdan yeni bir iş alarak kazanmaya başla.</p>
                 <button onClick={() => setActiveTab("pool")} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Havuzu Görüntüle</button>
               </div>
             ) : (
               <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-100">
                 {/* Header */}
                 <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-1">Aktif Görev</h2>
                            <p className="opacity-80 text-sm font-mono">#{myActiveJob._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-center">
                            <p className="text-xs opacity-80">Tahmini Kazanç</p>
                            <p className="text-xl font-bold">£{(myActiveJob.totalAmount * 0.10).toFixed(2)}</p>
                        </div>
                    </div>
                 </div>

                 {/* Durum Çubuğu */}
                 <div className="p-6 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center text-center relative">
                    <div className="absolute top-1/2 left-10 right-10 h-1 bg-gray-200 -z-10 rounded-full">
                        <div className={`h-full bg-blue-500 transition-all duration-500 ${myActiveJob.status === "Dağıtımda" ? "w-full" : "w-1/2"}`}></div>
                    </div>
                    <StepBadge icon={<FiPackage />} label="İş Alındı" active={true} done={true} />
                    <StepBadge icon={<FiNavigation />} label="Mağaza" active={myActiveJob.status === "Kurye Yolda"} done={myActiveJob.status === "Dağıtımda"} />
                    <StepBadge icon={<FiUser />} label="Müşteri" active={myActiveJob.status === "Dağıtımda"} />
                 </div>

                 {/* Aksiyon Alanı */}
                 <div className="p-8">
                    
                    {/* 1. Adım: Mağazaya Git */}
                    {myActiveJob.status === "Kurye Yolda" && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 relative overflow-hidden">
                           <div className="absolute top-0 right-0 bg-yellow-200 text-yellow-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl">ADIM 1</div>
                           <h4 className="font-bold text-yellow-800 mb-4 flex items-center gap-2 text-lg"><FiMapPin /> Rota: Mağaza</h4>
                           
                           <div className="space-y-2">
                               <div className="flex justify-between text-sm text-gray-600 border-b border-yellow-200 pb-2">
                                   <span>Mağaza:</span> <span className="font-bold text-gray-800">ÇiçekSepeti Depo</span>
                               </div>
                               <div className="flex justify-between text-sm text-gray-600">
                                   <span>Adres:</span> <span className="font-bold text-gray-800 text-right">123 Oxford St, London</span>
                               </div>
                           </div>
                        </div>
                        <button onClick={handlePickup} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transform active:scale-95 transition">Ürünleri Teslim Aldım ✅</button>
                      </div>
                    )}

                    {/* 2. Adım: Müşteriye Git */}
                    {myActiveJob.status === "Dağıtımda" && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-200 relative overflow-hidden">
                           <div className="absolute top-0 right-0 bg-green-200 text-green-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl">ADIM 2 (SON)</div>
                           <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2 text-lg"><FiUser /> Rota: Müşteri</h4>
                           
                           <div className="space-y-3">
                               <div className="flex flex-col gap-1">
                                   <span className="text-xs text-gray-500 uppercase font-bold">Alıcı</span>
                                   <span className="text-lg font-bold text-gray-800">{myActiveJob.recipient.name}</span>
                               </div>
                               
                               <div className="flex flex-col gap-1">
                                   <span className="text-xs text-gray-500 uppercase font-bold">Adres</span>
                                   <span className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-green-100">
                                       {myActiveJob.recipient.address}<br/>
                                       {myActiveJob.recipient.city}, {myActiveJob.recipient.postcode}
                                   </span>
                               </div>

                               <a href={`tel:${myActiveJob.recipient.phone}`} className="flex items-center justify-center gap-2 bg-white border border-green-200 text-green-700 font-bold py-3 rounded-xl hover:bg-green-100 transition">
                                   <FiPhone /> {myActiveJob.recipient.phone} (Ara)
                               </a>
                           </div>
                           
                           {myActiveJob.delivery.courierNote && (
                             <div className="mt-4 bg-yellow-100 p-3 rounded-lg border border-yellow-200 text-orange-800 text-xs font-bold flex items-start gap-2">
                               <span className="text-lg">⚠️</span> <span>Not: {myActiveJob.delivery.courierNote}</span>
                             </div>
                           )}
                        </div>
                        <button onClick={handleDeliver} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transform active:scale-95 transition">Teslimat Başarılı! 🏁</button>
                      </div>
                    )}

                 </div>
               </div>
             )}
           </div>
        )}

        {/* --- 3. GEÇMİŞ --- */}
        {activeTab === "history" && (
           <div className="space-y-4 animate-fade-in">
             {orders.length === 0 ? <div className="text-center text-gray-400 py-10 bg-white rounded-2xl border-dashed border-2">Henüz tamamlanmış iş yok.</div> : orders.map(o => (
               <div key={o._id} className="bg-white p-5 rounded-2xl border border-gray-200 flex justify-between items-center hover:shadow-md transition group">
                 <div>
                   <div className="font-bold text-gray-800 mb-1">#{o._id.slice(-6).toUpperCase()}</div>
                   <div className="text-xs text-gray-500 flex items-center gap-1"><FiClock /> {new Date(o.updatedAt).toLocaleDateString()} {new Date(o.updatedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                   <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{o.recipient.address}</div>
                 </div>
                 <div className="text-right">
                   <div className="font-extrabold text-green-600 text-lg">+£{(o.totalAmount * 0.10).toFixed(2)}</div>
                   <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold inline-block mt-1">Tamamlandı</span>
                 </div>
               </div>
             ))}
           </div>
        )}

      </div>
      
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

// YARDIMCI BİLEŞENLER
const TabBtn = ({ active, onClick, label, icon, highlight }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition whitespace-nowrap ${active ? "bg-gray-900 text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"} ${highlight && !active ? "ring-2 ring-blue-500 ring-offset-2 animate-pulse" : ""}`}>
    <span className="text-lg">{icon}</span> {label}
  </button>
);

const StepBadge = ({ icon, label, active, done }) => (
  <div className={`flex flex-col items-center gap-2 z-10 relative ${active || done ? "text-blue-600" : "text-gray-300 grayscale opacity-50"}`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-4 transition-all shadow-sm ${active ? "bg-white border-blue-500 scale-110" : done ? "bg-blue-500 text-white border-blue-500" : "bg-gray-100 border-gray-200"}`}>
        {done ? <FiCheckCircle /> : icon}
    </div>
    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-100">{label}</span>
  </div>
);

// Basit Mağaza İkonu
const FiStoreIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v18h18V3H3zM9 9h6M9 15h6" /></svg>;

export default CourierPage;