import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import InvoiceModal from "../InvoiceModal"; // Bir üst klasördeki InvoiceModal'ı çağırıyoruz

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { notify } = useCart();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data);
    } catch (err) { console.log(err); } 
    finally { setTimeout(() => setLoading(false), 500); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, st) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}`, { status: st });
      notify(`Sipariş: ${st}`, "success");
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: st } : o));
    } catch (err) { notify("Hata", "error"); }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case "Sipariş Alındı": return { border: "border-l-blue-500", badge: "bg-blue-100 text-blue-700" };
      case "Hazırlanıyor": return { border: "border-l-yellow-500", badge: "bg-yellow-100 text-yellow-700" };
      case "Yola Çıktı": return { border: "border-l-purple-500", badge: "bg-purple-100 text-purple-700" };
      case "Teslim Edildi": return { border: "border-l-green-500", badge: "bg-green-100 text-green-700" };
      case "İptal": return { border: "border-l-red-500", badge: "bg-red-100 text-red-700" };
      default: return { border: "border-l-gray-500", badge: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Siparişler <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full">{orders.length}</span></h2>
        <button onClick={fetchOrders} disabled={loading} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition disabled:opacity-50">
          <span className={loading ? "animate-spin" : ""}>↻</span> {loading ? "Yükleniyor..." : "Listeyi Yenile"}
        </button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? <div className="text-center py-10 text-gray-400">Sipariş yok.</div> : 
          orders.map((order) => {
            const style = getStatusStyle(order.status);
            return (
              <div key={order._id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition border-l-4 ${style.border} p-4 flex flex-col md:flex-row gap-4`}>
                
                <div className="min-w-[220px]">
                  <div className="text-xs text-gray-400 font-mono mb-1">#{order._id.slice(-6)}</div>
                  <div className="font-bold text-gray-800 text-lg leading-tight">{order.recipient.name}</div>
                  <div className="text-xs text-gray-500 mt-1">📞 {order.recipient.phone}</div>
                  <div className="text-xs text-gray-500 mt-1 bg-gray-50 p-1 rounded inline-block">Teslimat: <b>{new Date(order.delivery.date).toLocaleDateString()}</b></div>
                </div>

                <div className="flex-1 space-y-2 border-l pl-4 border-gray-100">
                  <div className="text-xs text-gray-500 line-clamp-1" title={order.recipient.address}>📍 {order.recipient.address}, {order.recipient.city}</div>
                  
                  {(order.delivery.cardMessage || order.delivery.courierNote) && (
                    <div className="flex flex-wrap gap-2">
                      {order.delivery.cardMessage && <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-1 rounded border border-pink-100">💌 {order.delivery.cardMessage}</span>}
                      {order.delivery.courierNote && <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-100">⚠️ {order.delivery.courierNote}</span>}
                    </div>
                  )}

                  <div className="flex gap-2 overflow-x-auto pt-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="relative flex-shrink-0 group">
                        <img src={item.img} className="w-8 h-8 rounded border object-cover" title={item.title} />
                        <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white shadow">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-2 min-w-[140px] border-t md:border-t-0 pt-2 md:pt-0 md:pl-4 md:border-l border-gray-100">
                  <span className="text-xl font-extrabold text-pink-600">£{order.totalAmount}</span>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => setSelectedInvoice(order)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition" title="Yazdır">🖨️</button>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order._id, e.target.value)} 
                      className={`flex-1 text-xs font-bold px-2 py-2 rounded-lg border cursor-pointer outline-none appearance-none transition w-full text-center ${style.badge}`}
                    >
                      <option>Sipariş Alındı</option>
                      <option>Hazırlanıyor</option>
                      <option>Yola Çıktı</option>
                      <option>Teslim Edildi</option>
                      <option>İptal</option>
                    </select>
                  </div>
                </div>

              </div>
            );
          })
        }
      </div>
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
    </div>
  );
};

export default AdminOrders;