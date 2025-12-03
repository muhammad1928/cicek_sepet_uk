import { useState, useEffect } from "react";
import { userRequest} from "../../requestMethods";
import { useCart } from "../../context/CartContext";
import OrderTracker from "../OrderTracker";
import InvoiceModal from "../InvoiceModal";
import CancelModal from "../CancelModal";
import { FiUser, FiBox, FiPrinter, FiX, FiChevronDown, FiChevronUp, FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";


const OrderHistory = ({ user }) => {
  const { t } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { notify } = useCart();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await userRequest.get(`/orders/find/${user._id}`);
        setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) { console.log(err); } 
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [user]);

  const handleCancelClick = (e, id) => {
    e.stopPropagation(); 
    setSelectedOrderId(id);
    setShowCancelModal(true); 
  };

  const submitCancelRequest = async (reason) => {
    try {
      await userRequest.put(`/orders/${selectedOrderId}`, {
        status: "İptal Talebi",
        cancellationReason: reason
      });
      notify("{orderHistory.cancelRequestReceived}.", "info");
      setOrders(prev => prev.map(o => o._id === selectedOrderId ? { ...o, status: "İptal Talebi" } : o));
      setShowCancelModal(false);
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  const getStatusColor = (s) => {
    if(s==="Teslim Edildi") return "bg-green-100 text-green-700 border-green-200";
    if(s==="İptal") return "bg-red-100 text-red-700 border-red-200";
    if(s==="İptal Talebi") return "bg-orange-100 text-orange-700 border-orange-200 animate-pulse";
    if(s==="Yola Çıktı") return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  if (loading) return <div className="text-center p-20 text-gray-400 font-bold animate-pulse">{t("common.loading")}</div>;
  if (orders.length === 0) return <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"><div className="text-5xl mb-4 opacity-30">🛍️</div><h3 className="text-lg font-bold text-gray-700">{t("profilePage.orderHistory.caseNoOrders")}</h3><p className="text-gray-400 text-sm mt-1">{t("profilePage.orderHistory.information")}</p></div>;

  return (
    <div className="space-y-6 rounded-2xl animate-fade-in">
      {orders.map((order) => {
        const isExpanded = expandedId === order._id;
        return (
        <div key={order._id} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer overflow-hidden ${isExpanded ? 'border-pink-400 ring-4 ring-pink-50/50' : 'border-gray-200 hover:border-pink-200'}`} onClick={() => setExpandedId(isExpanded ? null : order._id)}>
          
          {/* ÖZET */}
          <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className={`w-1.5 h-12 rounded-full ${order.status === 'Teslim Edildi' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <div>
                <div className="text-sm font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</div>
                <div className="text-xs text-gray-400 font-mono flex items-center gap-2">#{order._id.slice(-8).toUpperCase()} {order.status==='İptal Talebi'&&<FiAlertCircle className="text-orange-500"/>}</div>
              </div>
            </div>
            <div className="text-center sm:text-right w-full sm:w-auto"><div className="text-xs text-gray-400 font-bold uppercase">Tutar</div><div className="text-xl font-extrabold text-pink-600">£{order.totalAmount.toFixed(2)}</div></div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>{order.status}</span><span className={`text-gray-400 transform transition ${isExpanded ? 'rotate-180' : ''}`}>{isExpanded ? <FiChevronUp size={20}/> : <FiChevronDown size={20}/>}</span></div>
          </div>

          {/* DETAY */}
          {isExpanded && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-6 cursor-default" onClick={e => e.stopPropagation()}>
               <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><OrderTracker status={order.status} /></div>
               
               <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                      <FiUser /> {t("profilePage.orderHistory.deliverTo")}
                      </h4>
                      <p className="font-bold text-gray-800 text-lg">{order.recipient.name}</p>
                      <p className="text-sm text-gray-600 mb-2">{order.recipient.phone}</p>
                      <p className="text-sm text-gray-600 leading-snug bg-gray-50 p-2 rounded">{order.recipient.address}, {order.recipient.city}, {order.recipient.postcode}</p>
                    </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                      <FiBox /> {t("profilePage.orderHistory.deliverNote")}
                    </h4>
                  <div className="flex items-center gap-3 text-sm font-medium text-blue-600 mb-3"><span className="bg-blue-50 px-2 py-1 rounded">📅 {new Date(order.delivery.date).toLocaleDateString()}</span><span className="bg-blue-50 px-2 py-1 rounded">⏰ {order.delivery.timeSlot}</span></div>{order.delivery.cardMessage ? (<div className="text-sm text-pink-700 italic bg-pink-50 p-3 rounded-lg border border-pink-100 relative"><span className="absolute -top-2 -left-1 text-2xl">💌</span> <span className="ml-6">"{order.delivery.cardMessage}"</span></div>) : <span className="text-xs text-gray-400 italic">{t("profilePage.orderHistory.noteNotAdded")}</span>}</div>
               </div>

               <div className="space-y-3">{order.items.map((item, i) => (<div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-pink-300 transition">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                  <img src={item.img} className="w-full h-full object-cover" alt={item.title} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-sm">{item.title}
                  </div>
                  <div className="text-xs text-gray-500">{t("profilePage.orderHistory.quantity")}: {item.quantity}
                  </div>
                </div>
                <div className="font-extrabold text-gray-700">£{item.price.toFixed(2)}
                </div>
              </div>))}
            </div>
               
               <div className="mt-8 flex justify-between items-center pt-5 border-t border-gray-200">
                  <div>
                    {order.status === "Sipariş Alındı" && (
                        <button onClick={(e) => handleCancelClick(e, order._id)} className="px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition flex items-center gap-2"><FiX /> {t("profilePage.orderHistory.cancelRequest")}</button>
                    )}
                  </div>
                  <button onClick={() => setSelectedInvoice(order)} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-md transform active:scale-95"><FiPrinter /> {t("profilePage.orderHistory.invoice")}</button>
               </div>
            </div>
          )}
        </div>
      )})}
      
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
      {showCancelModal && <CancelModal onClose={() => setShowCancelModal(false)} onConfirm={submitCancelRequest} />}
    </div>
  );
};

export default OrderHistory;