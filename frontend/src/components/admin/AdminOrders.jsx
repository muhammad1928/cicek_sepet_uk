import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import InvoiceModal from "../InvoiceModal";
import AdminPanelHeader from "./adminComponents/AdminPanelHeader";
import { FiChevronDown, FiChevronUp, FiPrinter, FiBox, FiMapPin, FiUser, FiRefreshCw, FiAlertCircle, FiShield, FiEye, FiEyeOff } from "react-icons/fi";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Akordeon State'i
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Metadata Görünürlük State'i
  const [showMetaData, setShowMetaData] = useState(false);

  const { notify } = useCart();
  
  // Performans ve Polling için Ref'ler
  const isMounted = useRef(false);
  const timerRef = useRef(null);

  // 1. SİPARİŞLERİ ÇEK (AKILLI POLLING)
  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      
      if (isMounted.current) {
        // Tarihe göre yeniden eskiye sırala
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
        setLoading(false);
      }
    } catch (err) {
      console.log("Sipariş çekme hatası:", err);
    } finally {
      // İşlem bitince 30 saniye bekle ve tekrarla (Recursive Timeout)
      if (isMounted.current) {
        timerRef.current = setTimeout(() => {
          if (document.visibilityState === 'visible') fetchOrders();
        }, 30000);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchOrders();
    return () => {
      isMounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchOrders]);

  // 2. DURUM GÜNCELLEME
  const handleStatusChange = async (e, id) => {
    e.stopPropagation(); // Akordeonun açılmasını engelle
    const st = e.target.value;
    
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}`, { status: st });
      notify(`Sipariş güncellendi: ${st}`, "success");
      
      // Listeyi anında güncelle
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: st } : o));
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  // 3. KART AÇMA/KAPAMA
  const toggleOrder = (id) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(id);
      setShowMetaData(false); // Yeni kart açılınca metadatayı gizle
    }
  };

  // Renk ve Stil Ayarları
  const getStatusStyle = (status) => {
    switch(status) {
      case "Sipariş Alındı": return "border-l-blue-500 bg-blue-50/30";
      case "Hazırlanıyor": return "border-l-yellow-500 bg-yellow-50/30";
      case "Hazır": return "border-l-teal-400 bg-teal-50/30";
      case "Yola Çıktı": return "border-l-purple-500 bg-purple-50/30";
      case "Teslim Edildi": return "border-l-green-500 bg-green-50/30";
      case "İptal": return "border-l-red-500 bg-red-50/30 opacity-70";
      case "İptal Talebi": return "border-l-orange-500 bg-orange-100 border-2 border-orange-300 animate-pulse";
      default: return "border-l-gray-500";
    }
  };

  // Metadata Bileşeni
  const renderMetaData = (meta) => {
    if (!meta) return <div className="text-xs text-gray-400 italic mt-2">Metadata verisi yok.</div>;
    return (
      <div className="mt-6 bg-slate-800 text-slate-300 p-5 rounded-xl font-mono text-xs shadow-inner animate-fade-in">
        <h4 className="font-bold text-white border-b border-slate-600 pb-2 mb-3 flex items-center gap-2">
          <FiShield className="text-green-400" /> Güvenlik Analizi
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6">
          <div><span className="text-slate-500 block mb-1">IP Adresi:</span> <span className="text-white bg-slate-700 px-2 py-0.5 rounded">{meta.ip || "Bilinmiyor"}</span></div>
          <div><span className="text-slate-500 block mb-1">Cihaz & OS:</span> {meta.deviceType} / {meta.osName}</div>
          <div><span className="text-slate-500 block mb-1">Tarayıcı:</span> {meta.browserName}</div>
          <div><span className="text-slate-500 block mb-1">Ekran Çözünürlüğü:</span> {meta.screenResolution}</div>
          <div><span className="text-slate-500 block mb-1">Dil / Bölge:</span> {meta.language} / {meta.timeZone}</div>
          <div><span className="text-slate-500 block mb-1">Bağlantı Tipi:</span> {meta.connectionType || "Bilinmiyor"}</div>
          <div className="col-span-full border-t border-slate-700 mt-2 pt-2 truncate" title={meta.userAgent}>
            <span className="text-slate-500 mr-2">User Agent:</span> {meta.userAgent}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-2 max-w-6xl mx-auto animate-fade-in">
      
      {/* Başlık */}
      <AdminPanelHeader title="Siparişler" count={orders.length} onRefresh={() => { setLoading(true); fetchOrders(); }} />
      {/* <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          Siparişler <span className="ml-2 text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{orders.length}</span>
        </h2>
        <button onClick={() => { setLoading(true); fetchOrders(); }} className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1">
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Yenile
        </button>
      </div> */}

      {/* Liste */}
      <div className="space-y-3">
        {orders.length === 0 && !loading ? (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl bg-white">Henüz sipariş yok.</div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            
            return (
              <div 
                key={order._id} 
                onClick={() => toggleOrder(order._id)}
                className={`
                  bg-white rounded-xl shadow-sm border transition-all duration-300 cursor-pointer hover:shadow-md 
                  border-l-4 ${getStatusStyle(order.status)} 
                  ${isExpanded ? 'ring-2 ring-blue-100 scale-[1.005]' : 'border-gray-200'}
                `}
              >
                
                {/* --- ÜST ÖZET (HEP GÖRÜNÜR) --- */}
                <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`p-3 rounded-full transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {isExpanded ? <FiChevronUp size={20}/> : <FiChevronDown size={20}/>}
                    </div>
                    <div>
                      <div className="font-mono text-xs text-gray-400 font-bold flex items-center gap-2">
                        #{order._id.slice(-8).toUpperCase()}
                        {order.status === "İptal Talebi" && <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-bold border border-orange-200"><FiAlertCircle/> İPTAL TALEBİ</span>}
                      </div>
                      <div className="font-bold text-gray-800 text-lg">{order.recipient.name}</div>
                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <div className="text-xs text-gray-400 font-bold uppercase">Toplam</div>
                      <div className="text-lg font-extrabold text-pink-600">£{order.totalAmount.toFixed(2)}</div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(e, order._id)} 
                        className={`text-xs font-bold px-3 py-2 rounded-lg border outline-none cursor-pointer transition shadow-sm appearance-none text-center w-36
                          ${order.status === 'İptal Talebi' ? 'bg-orange-600 text-white border-orange-700 ring-2 ring-orange-300' : 'bg-white hover:border-blue-400'}
                        `}
                      >
                        <option>Sipariş Alındı</option>
                        <option>Hazırlanıyor</option>
                        <option>Hazır</option>
                        <option>Yola Çıktı</option>
                        <option>Teslim Edildi</option>
                        <option className="bg-orange-100 text-orange-800 font-bold">İptal Talebi</option>
                        <option className="text-red-600 font-bold">İptal</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* --- ALT DETAY (AKORDEON) --- */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-6 cursor-default animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                      {/* 1. Alıcı */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><FiUser /> Alıcı & Gönderen</h4>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm shadow-sm">
                          <p className="font-bold text-gray-800">{order.recipient.name}</p>
                          <p className="text-gray-600">{order.recipient.phone}</p>
                          <div className="my-2 border-t border-dashed"></div>
                          <p className="text-xs text-gray-400 uppercase">Gönderen:</p>
                          <p className="font-medium text-gray-700">{order.sender.name}</p>
                          <p className="text-gray-500 text-xs">{order.sender.email}</p>
                        </div>
                      </div>
                      
                      {/* 2. Teslimat */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><FiMapPin /> Teslimat</h4>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm shadow-sm">
                          <p className="font-medium text-gray-800">{order.recipient.city}</p>
                          <p className="text-gray-600">{order.recipient.address}</p>
                          <p className="text-xs text-gray-400 mt-1">{order.recipient.postcode}</p>
                          <div className="mt-3 pt-2 border-t border-gray-100 flex gap-3 text-xs font-bold text-blue-600">
                            <span className="bg-blue-50 px-2 py-1 rounded">📅 {new Date(order.delivery.date).toLocaleDateString()}</span>
                            <span className="bg-blue-50 px-2 py-1 rounded">⏰ {order.delivery.timeSlot}</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Notlar */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">📝 Notlar</h4>
                        <div className="flex flex-col gap-2">
                            {order.delivery.cardMessage ? (
                              <div className="bg-pink-50 p-3 rounded-xl border border-pink-100 text-sm text-pink-700 italic shadow-sm">
                                💌 "{order.delivery.cardMessage}"
                              </div>
                            ) : <div className="text-xs text-gray-400 italic p-2">Kart notu yok.</div>}
                            
                            {order.delivery.courierNote && (
                               <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-xs text-yellow-700 font-medium shadow-sm">
                                 ⚠️ Kurye Notu: {order.delivery.courierNote}
                               </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Ürün Listesi */}
                    <div className="mt-8">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><FiBox /> Ürünler</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition">
                            <img src={item.img} className="w-14 h-14 rounded-lg object-cover border" alt={item.title} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-gray-800 truncate">{item.title}</div>
                              <div className="text-xs text-gray-500 font-mono">Kod: {item._id ? item._id.slice(-6).toUpperCase() : "N/A"}</div> 
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">x{item.quantity}</div>
                              <div className="font-bold text-pink-600">£{item.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* --- ALT BAR (FATURA & METADATA BUTONLARI) --- */}
                    <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                      
                      {/* Metadata Butonu */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowMetaData(!showMetaData); }}
                        className={`text-xs font-bold flex items-center gap-2 transition px-4 py-2 rounded-lg border ${showMetaData ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                      >
                        {showMetaData ? <FiEyeOff /> : <FiEye />} 
                        {showMetaData ? "Teknik Verileri Gizle" : "Güvenlik & Metadata Göster"}
                      </button>

                      <div className="flex items-center gap-4">
                         {order.courierId && <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold border border-purple-200">🛵 Kurye Atandı</span>}
                         <button 
                           onClick={() => setSelectedInvoice(order)} 
                           className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg transform active:scale-95"
                         >
                           <FiPrinter /> Faturayı Yazdır
                         </button>
                      </div>
                    </div>

                    {/* --- METADATA İÇERİĞİ --- */}
                    {showMetaData && renderMetaData(order.metaData)}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
    </div>
  );
};

export default AdminOrders;