import { useState, useEffect } from "react";
import { userRequest } from "../requestMethods";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import OrderTracker from "../components/OrderTracker";
import InvoiceModal from "../components/InvoiceModal"; 
// --- YENİ İPTAL MODALI ---
import CancelModal from "../components/CancelModal"; 
import { FiPackage, FiClock, FiMapPin, FiChevronDown, FiChevronUp, FiX, FiPrinter, FiAlertTriangle } from "react-icons/fi";


const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- MODAL STATE'LERİ ---
  const [showCancelModal, setShowCancelModal] = useState(false); // Yeni Modal için
  const [selectedOrderId, setSelectedOrderId] = useState(null);  // İptal edilecek ID
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);  // Fatura
  const [expandedOrderId, setExpandedOrderId] = useState(null);  // Akordeon

  const { notify } = useCart();
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. Siparişleri Çek
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const res = await userRequest.get(`/orders/find/${user._id}`);
        // En yeni sipariş en üstte
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?._id]);

  // --- AKSİYONLAR ---

  // 1. İptal Butonuna Tıklanınca (ESKİ MODALI AÇMAZ, YENİYİ AÇAR)
  const handleCancelClick = (e, id) => {
    e.stopPropagation(); // Akordeonun kapanmasını önle
    setSelectedOrderId(id);
    setShowCancelModal(true); // <--- SADECE YENİ MODAL
  };

  // 2. İptal Talebini Gönder
  const submitCancelRequest = async (reason) => {
    try {
      await userRequest.put(`/orders/${selectedOrderId}`, {
        status: "İptal Talebi",
        cancellationReason: reason
      });

      notify("İptal talebiniz başarıyla alındı.", "info");
      
      // Listeyi güncelle
      setOrders(prev => prev.map(o => o._id === selectedOrderId ? { ...o, status: "İptal Talebi" } : o));
      
      setShowCancelModal(false);
    } catch (err) {
      notify("Bir hata oluştu.", "error");
    }
  };

  const toggleOrder = (id) => {
    if (expandedOrderId === id) setExpandedOrderId(null);
    else setExpandedOrderId(id);
  };

  // Durum Renkleri
  const getStatusStyle = (status) => {
    switch(status) {
      case "Sipariş Alındı": return { border: "border-blue-500", badge: "bg-blue-100 text-blue-700" };
      case "Hazırlanıyor": return { border: "border-yellow-500", badge: "bg-yellow-100 text-yellow-700" };
      case "Hazır": return { border: "border-teal-500", badge: "bg-teal-100 text-teal-700" };
      case "Yola Çıktı": 
      case "Dağıtımda": 
      case "Kurye Yolda": return { border: "border-purple-500", badge: "bg-purple-100 text-purple-700" };
      case "Teslim Edildi": return { border: "border-green-500", badge: "bg-green-100 text-green-700" };
      case "İptal": return { border: "border-red-500", badge: "bg-red-100 text-red-700 opacity-70" };
      case "İptal Talebi": return { border: "border-orange-500", badge: "bg-orange-100 text-orange-700 animate-pulse border border-orange-200" };
      default: return { border: "border-gray-200", badge: "bg-gray-100 text-gray-600" };
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-32 text-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Siparişleriniz yükleniyor...</p>
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-h-screen pt-32 pb-10 px-4 text-center">
        <div className="bg-white max-w-md mx-auto p-10 rounded-3xl shadow-xl border border-gray-100">
            <div className="text-6xl mb-4 opacity-50">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Henüz Siparişiniz Yok</h2>
            <p className="text-gray-500 mb-6">Hemen alışverişe başlayıp sevdiklerinizi mutlu edin.</p>
            <Link to="/" className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition shadow-lg">Alışverişe Başla</Link>
        </div>
    </div>
  );

  return (
    <div className="rounded-2xl border min-h-screen bg-gray-50 font-sans pt-4 pb-20 px-4">
      <Seo title="Siparişlerim" description="Geçmiş siparişlerinizi görüntüleyin." />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <span className="bg-pink-100 text-pink-600 p-2 rounded-xl"><FiPackage /></span> Siparişlerim
        </h1>

        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const styles = getStatusStyle(order.status);

            return (
              <div 
                key={order._id} 
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-pink-50 border-pink-200' : 'border-gray-200 hover:border-pink-200'}`}
              >
                {/* --- ÜST KISIM (ÖZET KART) --- */}
                <div 
                  className={`p-6 flex flex-col md:flex-row justify-between items-center gap-4 cursor-pointer border-l-8 ${styles.border}`}
                  onClick={() => toggleOrder(order._id)}
                >
                  {/* Sol: İkon ve No */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                       {order.status === 'Teslim Edildi' ? '🎁' : '📦'}
                    </div>
                    <div>
                       <div className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-0.5">Sipariş No</div>
                       <div className="text-lg font-bold text-gray-800 font-mono">#{order._id.slice(-8).toUpperCase()}</div>
                       <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                         <FiClock /> {new Date(order.createdAt).toLocaleDateString()}
                       </div>
                    </div>
                  </div>

                  {/* Orta: Tutar */}
                  <div className="text-center md:text-right w-full md:w-auto">
                     <div className="text-sm font-bold text-gray-400 uppercase tracking-wide">Tutar</div>
                     <div className="text-xl font-extrabold text-pink-600">£{order.totalAmount.toFixed(2)}</div>
                  </div>

                  {/* Sağ: Durum ve Ok */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${styles.badge}`}>
                        {order.status}
                     </span>
                     <span className={`text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        {isExpanded ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                     </span>
                  </div>
                </div>

                {/* --- ALT KISIM (DETAY & TRACKER) --- */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-6 cursor-default animate-fade-in">
                    
                    {/* Sipariş Takip Çubuğu */}
                    <div className="mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                       <OrderTracker status={order.status} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       {/* Ürün Listesi */}
                       <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><FiPackage /> Ürünler</h4>
                          <div className="space-y-3">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200">
                                <img src={item.img} className="w-14 h-14 rounded-lg object-cover border" alt={item.title} />
                                <div className="flex-1">
                                  <div className="font-bold text-gray-800 text-sm">{item.title}</div>
                                  <div className="text-xs text-gray-500">Adet: {item.quantity}</div>
                                </div>
                                <div className="font-bold text-gray-700">£{item.price.toFixed(2)}</div>
                              </div>
                            ))}
                          </div>
                       </div>

                       {/* Teslimat Bilgileri */}
                       <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><FiMapPin /> Teslimat</h4>
                          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-sm text-gray-700 shadow-sm">
                             <p><span className="font-bold">Alıcı:</span> {order.recipient.name}</p>
                             <p className="text-xs text-gray-500">{order.recipient.phone}</p>
                             <p className="bg-gray-50 p-2 rounded border border-gray-100 mt-2 leading-relaxed">
                                {order.recipient.address}<br/>
                                {order.recipient.city}, {order.recipient.postcode}
                             </p>
                             {order.delivery.cardMessage && (
                               <div className="mt-2 text-pink-600 italic bg-pink-50 p-2 rounded border border-pink-100 text-xs">
                                  💌 "{order.delivery.cardMessage}"
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                    
                    {/* BUTONLAR */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap justify-end gap-3">
                       {/* FATURA BUTONU */}
                       <button 
                          onClick={() => setSelectedInvoice(order)} 
                          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-md"
                       >
                          <FiPrinter /> Fatura
                       </button>

                       {/* İPTAL TALEBİ BUTONU (Sadece Sipariş Alındı ise ve İptal Talebi yoksa) */}
                       {order.status === "Sipariş Alındı" && (
                         <button 
                           onClick={(e) => handleCancelClick(e, order._id)} 
                           className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-xl font-bold text-sm transition border border-transparent hover:border-red-100"
                         >
                           <FiX /> İptal Talebi Oluştur
                         </button>
                       )}
                       
                       {order.status === "İptal Talebi" && (
                          <span className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-xl font-bold text-sm border border-orange-100 animate-pulse">
                            <FiAlertTriangle /> Talep İnceleniyor...
                          </span>
                       )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- YENİ İPTAL MODALI (CancelModal) --- */}
      {showCancelModal && (
        <CancelModal 
          onClose={() => setShowCancelModal(false)} 
          onConfirm={submitCancelRequest} 
        />
      )}

      {/* Fatura Modalı */}
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}

    </div>
  );
};

export default MyOrdersPage;