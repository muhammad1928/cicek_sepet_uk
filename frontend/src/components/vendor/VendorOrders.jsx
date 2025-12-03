import { useState, useEffect } from "react";
import { userRequest } from "../../requestMethods";
import { useCart } from "../../context/CartContext";
import InvoiceModal from "../InvoiceModal";
import { useTranslation } from "react-i18next";

const VendorOrders = ({ user }) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { notify } = useCart();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try { const res = await userRequest.get(`/orders/vendor/${user._id}`); setOrders(res.data); } 
      catch (err) { console.log(err); }
    };
    fetchOrders();
  }, [user]);

  const handleStatusChange = async (id, st) => {
    try { await userRequest.put(`/orders/${id}`, { status: st }); notify(t("vendorOrders.updated"), "success"); setOrders(prev => prev.map(o => o._id === id ? { ...o, status: st } : o)); } 
    catch { notify(t("common.error"), "error"); }
  };

  const getStatusStyle = (s) => { if(s==="Teslim Edildi") return "border-l-green-500"; if(s==="İptal") return "border-l-red-500"; return "border-l-blue-500"; };

  return (
    <div className="space-y-4 max-w-6xl mx-auto animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 bg-white p-4 rounded-xl border border-gray-200">{t("vendorOrders.orders")} ({orders.length})</h2>
      {orders.length === 0 ? <div className="text-center py-10 text-gray-400">{t("vendorOrders.empty")}.</div> : 
        orders.map(order => (
          <div key={order._id} className={`bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 hover:shadow-md transition border-l-4 ${getStatusStyle(order.status)}`}>
            <div className="min-w-[200px]">
              <div className="text-xs text-gray-400 font-mono mb-1">#{order._id.slice(-6)}</div>
              <div className="font-bold text-gray-800 text-lg">{order.recipient.name}</div>
              <div className="text-xs text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded inline-block">📍 {order.recipient.city}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            
            <div className="flex-1 space-y-2 border-l border-gray-100 pl-4">
               <div className="text-xs font-bold text-gray-400 uppercase">{t("vendorOrders.content")}</div>
               <div className="flex gap-2 overflow-x-auto pb-2">
                 {order.items.map((item, i) => (
                   <div key={i} className="relative group flex-shrink-0">
                      <img src={item.img} className="w-10 h-10 rounded-lg object-cover border shadow-sm" title={item.title} />
                      <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full shadow border border-white">{item.quantity}</span>
                   </div>
                 ))}
               </div>
               {order.delivery.cardMessage && <div className="text-xs text-pink-600 bg-pink-50 p-2 rounded border border-pink-100 italic">💌 "{order.delivery.cardMessage}"</div>}
            </div>

            <div className="text-right flex flex-col justify-between items-end min-w-[140px]">
              <div className="font-bold text-pink-600 text-xl">£{order.totalAmount}</div>
              <div className="flex flex-col gap-2 items-end mt-2 w-full">
                <button onClick={() => setSelectedInvoice(order)} className="text-xs flex items-center justify-center gap-1 text-blue-600 hover:underline font-bold bg-blue-50 px-2 py-1 rounded w-full">🖨️ {t("vendorOrders.invoice")}</button>
                <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} className="text-xs font-bold px-2 py-2 rounded-lg border cursor-pointer outline-none bg-white w-full" disabled={order.status === 'Yola Çıktı' || order.status === 'Teslim Edildi'}>
                  <option>{t("vendorOrders.orderReceived")}</option>
                  <option>{t("vendorOrders.orderPreparing")}</option>
                  <option>{t("vendorOrders.ready")}</option>
                  <option disabled>{t("vendorOrders.courierToStore")}</option>
                  <option disabled>{t("vendorOrders.deliveryOnTheWay")}</option>
                </select>
              </div>
            </div>
          </div>
        ))
      }
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
    </div>
  );
};

export default VendorOrders;