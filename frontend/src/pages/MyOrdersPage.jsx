import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InvoiceModal from "../components/InvoiceModal";
import ConfirmModal from "../components/ConfirmModal";
import OrderTracker from "../components/OrderTracker"; // <--- YENİ TAKİP BİLEŞENİ
import { useCart } from "../context/CartContext";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Görsel State'ler
  const [expandedId, setExpandedId] = useState(null); // Hangi kart açık?
  const [selectedInvoice, setSelectedInvoice] = useState(null); // Fatura
  const [confirmData, setConfirmData] = useState(null); // Onay Modalı

  const navigate = useNavigate();
  const { notify } = useCart();

  // 1. Siparişleri Çek
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/find/${user._id}`);
        setOrders(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [navigate]);

  // 2. İptal İsteği (Modal ile)
  const requestCancelOrder = (e, id) => {
    e.stopPropagation(); // Kartın kapanmasını engelle
    setConfirmData({
      isOpen: true,
      title: "Siparişi İptal Et?",
      message: "Siparişiniz iptal edilecek. Bu işlem geri alınamaz. Emin misiniz?",
      isDanger: true,
      action: async () => {
        try {
          await axios.put(`http://localhost:5000/api/orders/${id}`, { status: "İptal" });
          notify("Sipariş iptal edildi.", "success");
          // Listeyi yerel güncelle
          setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "İptal" } : o));
        } catch (err) {
          notify("İptal edilemedi veya hata oluştu.", "error");
        }
        setConfirmData(null);
      }
    });
  };

  // Durum Rengi Helper
  const getStatusColor = (status) => {
    switch(status) {
      case "Teslim Edildi": return "bg-green-100 text-green-700 border-green-200";
      case "İptal": return "bg-red-100 text-red-700 border-red-200";
      case "Yola Çıktı": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Hazırlanıyor": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-pink-600 font-bold bg-gray-50">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Siparişlerim 📦</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-gray-100 animate-fade-in">
            <div className="text-5xl mb-4">🥀</div>
            <h3 className="text-xl font-bold text-gray-700">Henüz bir siparişiniz yok.</h3>
            <p className="text-gray-400 mt-2 text-sm">Sevdiklerinizi mutlu etmek için hemen alışverişe başlayın.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedId === order._id;

              return (
                <div 
                  key={order._id} 
                  className={`bg-white rounded-2xl shadow-sm border transition-all cursor-pointer overflow-hidden animate-fade-in-up ${isExpanded ? 'border-pink-400 ring-2 ring-pink-50' : 'border-gray-200 hover:border-pink-300'}`}
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                >
                  
                  {/* --- ÖZET KISMI (HEP GÖRÜNÜR) --- */}
                  <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      {/* Durum Çubuğu (Dikey) */}
                      <div className={`w-1.5 h-12 rounded-full ${order.status === 'Teslim Edildi' ? 'bg-green-500' : order.status === 'İptal' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-extrabold text-pink-600">£{order.totalAmount}</div>
                      <div className="text-xs text-gray-500">{order.items.length} Ürün</div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </div>

                  {/* --- DETAY KISMI (AÇILIR PENCERE) --- */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-6 cursor-default" onClick={e => e.stopPropagation()}>
                       
                       {/* 1. KARGO TAKİP ÇUBUĞU */}
                       <div className="mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                         <OrderTracker status={order.status} />
                       </div>

                       {/* 2. ADRES VE DETAYLAR */}
                       <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-white p-4 rounded-xl border border-gray-100">
                             <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Alıcı Bilgileri</h4>
                             <p className="font-bold text-gray-800">{order.recipient.name}</p>
                             <p className="text-sm text-gray-600">{order.recipient.phone}</p>
                             <p className="text-sm text-gray-600 mt-1 leading-snug">{order.recipient.address}, {order.recipient.city}</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-gray-100">
                             <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Teslimat & Not</h4>
                             <p className="text-sm text-gray-600">📅 {new Date(order.delivery.date).toLocaleDateString()} • ⏰ {order.delivery.timeSlot}</p>
                             {order.delivery.cardMessage ? (
                               <div className="mt-3 text-xs text-pink-600 italic bg-pink-50 p-2 rounded border border-pink-100">
                                 💌 "{order.delivery.cardMessage}"
                               </div>
                             ) : (
                               <span className="text-xs text-gray-400 mt-2 block">Kart notu yok.</span>
                             )}
                          </div>
                       </div>

                       {/* 3. ÜRÜN LİSTESİ */}
                       <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Sipariş İçeriği</h4>
                       <div className="space-y-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                               <img src={item.img} className="w-14 h-14 rounded-lg object-cover border border-gray-100" alt={item.title} />
                               <div className="flex-1">
                                  <div className="font-bold text-sm text-gray-800">{item.title}</div>
                                  <div className="text-xs text-gray-500">Adet: {item.quantity}</div>
                               </div>
                               <div className="font-bold text-gray-700">£{item.price}</div>
                            </div>
                          ))}
                       </div>
                       
                       {/* 4. AKSİYON BUTONLARI */}
                       <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-200">
                          {/* Sadece 'Sipariş Alındı' ise iptal edilebilir */}
                          {order.status === "Sipariş Alındı" && (
                            <button 
                              onClick={(e) => requestCancelOrder(e, order._id)}
                              className="text-sm text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-lg font-bold transition border border-transparent hover:border-red-100"
                            >
                              Siparişi İptal Et
                            </button>
                          )}
                          
                          <button 
                            onClick={() => setSelectedInvoice(order)}
                            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition shadow-md hover:shadow-lg"
                          >
                            <span>🖨️</span> Faturayı Görüntüle
                          </button>
                       </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MODALLAR */}
        {selectedInvoice && (
          <InvoiceModal 
            order={selectedInvoice} 
            onClose={() => setSelectedInvoice(null)} 
          />
        )}

        {confirmData && (
          <ConfirmModal 
            title={confirmData.title} 
            message={confirmData.message} 
            isDanger={confirmData.isDanger} 
            onConfirm={confirmData.action} 
            onCancel={() => setConfirmData(null)} 
          />
        )}

      </div>
    </div>
  );
};

export default MyOrdersPage;