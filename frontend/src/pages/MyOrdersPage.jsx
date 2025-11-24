import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InvoiceModal from "../components/InvoiceModal";
import { useCart } from "../context/CartContext"; // Bildirim için

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Hangi sipariş açık?
  
  const navigate = useNavigate();
  const { notify } = useCart();

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

  // Akordeon Aç/Kapa
  const toggleExpand = (id) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  // Sipariş İptal (Sadece 'Sipariş Alındı' aşamasındaysa)
  const cancelOrder = async (e, orderId) => {
    e.stopPropagation(); // Kartın kapanmasını engelle
    if (!confirm("Siparişi iptal etmek istediğinize emin misiniz?")) return;
    
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: "İptal" });
      notify("Sipariş iptal edildi.", "success");
      // Listeyi güncelle
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: "İptal" } : o));
    } catch (err) {
      notify("Hata oluştu", "error");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Sipariş Alındı": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Hazırlanıyor": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Yola Çıktı": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Teslim Edildi": return "bg-green-100 text-green-700 border-green-200";
      case "İptal": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-pink-600 font-bold">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Siparişlerim 📦</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center shadow-sm">
            <div className="text-4xl mb-4">🥀</div>
            <h3 className="text-lg font-semibold text-gray-600">Henüz bir siparişiniz yok.</h3>
            <p className="text-gray-400 text-sm mt-2">Sevdiklerinizi mutlu etmek için hemen alışverişe başlayın.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order._id;

              return (
                <div 
                  key={order._id} 
                  className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer overflow-hidden ${isExpanded ? 'border-pink-300 ring-1 ring-pink-100' : 'border-gray-200 hover:border-pink-200'}`}
                  onClick={() => toggleExpand(order._id)}
                >
                  
                  {/* --- ÖZET KISMI (HEP GÖRÜNÜR) --- */}
                  <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    
                    {/* Sol: Tarih ve ID */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className={`w-2 h-12 rounded-full ${order.status === 'Teslim Edildi' ? 'bg-green-500' : order.status === 'İptal' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</div>
                      </div>
                    </div>

                    {/* Orta: Tutar ve Ürün Sayısı */}
                    <div className="text-center">
                      <div className="text-lg font-extrabold text-pink-600">£{order.totalAmount}</div>
                      <div className="text-xs text-gray-500">{order.items.length} Ürün</div>
                    </div>

                    {/* Sağ: Durum ve Ok */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </div>

                  {/* --- DETAY KISMI (SADECE TIKLAYINCA AÇILIR) --- */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-6 animate-fade-in-down cursor-default" onClick={(e) => e.stopPropagation()}>
                      
                      {/* Adres ve Teslimat */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Alıcı Bilgileri</h4>
                          <p className="font-bold text-gray-800">{order.recipient.name}</p>
                          <p className="text-sm text-gray-600">{order.recipient.phone}</p>
                          <p className="text-sm text-gray-600 mt-1">{order.recipient.address}, {order.recipient.city}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Teslimat Detayları</h4>
                          <p className="text-sm text-gray-600">📅 {new Date(order.delivery.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">⏰ {order.delivery.timeSlot}</p>
                          {order.delivery.cardMessage && (
                            <div className="mt-2 bg-white p-2 rounded border border-pink-100 text-xs text-pink-600 italic">
                              💌 "{order.delivery.cardMessage}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ürün Listesi */}
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Sipariş İçeriği</h4>
                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                            <img src={item.img} className="w-12 h-12 rounded object-cover" />
                            <div className="flex-1">
                              <div className="font-bold text-sm text-gray-800">{item.title}</div>
                              <div className="text-xs text-gray-500">Adet: {item.quantity}</div>
                            </div>
                            <div className="font-bold text-gray-700">£{item.price}</div>
                          </div>
                        ))}
                      </div>

                      {/* Aksiyon Butonları */}
                      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                        {order.status === "Sipariş Alındı" && (
                          <button 
                            onClick={(e) => cancelOrder(e, order._id)}
                            className="text-sm text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold transition"
                          >
                            Siparişi İptal Et
                          </button>
                        )}
                        
                        <button 
                          onClick={() => setSelectedInvoice(order)}
                          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900 transition"
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

        {/* FATURA MODALI */}
        {selectedInvoice && (
          <InvoiceModal 
            order={selectedInvoice} 
            onClose={() => setSelectedInvoice(null)} 
          />
        )}

      </div>
    </div>
  );
};

export default MyOrdersPage;