import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InvoiceModal from "../components/InvoiceModal"; // <--- İMPORT
import Seo from "../components/Seo";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null); // <--- FATURA STATE
  const navigate = useNavigate();

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
      <Seo 
        title="Siparişlerim" 
        noindex={true} // <--- Google burayı İNDEKSLEMEYECEK
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Siparişlerim 📦</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center shadow-sm">
            <div className="text-4xl mb-4">🥀</div>
            <h3 className="text-lg font-semibold text-gray-600">Henüz bir siparişiniz yok.</h3>
            <p className="text-gray-400 text-sm mt-2">Sevdiklerinizi mutlu etmek için hemen alışverişe başlayın.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                
                {/* Üst Bilgi */}
                <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Sipariş Tarihi</div>
                    <div className="text-sm font-medium text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Alıcı</div>
                    <div className="text-sm font-medium text-gray-800">{order.recipient.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Tutar</div>
                    <div className="text-sm font-bold text-pink-600">£{order.totalAmount}</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                    {/* FATURA BUTONU */}
                    <button 
                      onClick={() => setSelectedInvoice(order)}
                      className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 text-gray-600 transition"
                      title="Faturayı Görüntüle"
                    >
                      🖨️
                    </button>
                  </div>
                </div>

                {/* Ürünler */}
                <div className="p-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 mb-4 last:mb-0">
                      <img src={item.img} className="w-16 h-16 rounded-lg object-cover border" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{item.title}</h4>
                        <div className="text-sm text-gray-500">Adet: {item.quantity} x £{item.price}</div>
                      </div>
                      {/* Teslimat Bilgisi */}
                      <div className="text-right text-xs text-gray-500">
                        <span className="block font-bold text-blue-500">Teslimat:</span>
                        {new Date(order.delivery.date).toLocaleDateString()} <br/>
                        {order.delivery.timeSlot}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
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