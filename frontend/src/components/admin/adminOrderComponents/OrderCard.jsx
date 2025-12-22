import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiUser, FiMapPin, FiBox, FiTruck, FiPrinter, FiAlertCircle, FiShoppingBag, FiEye, FiEyeOff, FiTrendingDown, FiClock, FiPackage, FiCheckCircle, FiXCircle } from "react-icons/fi";
import OrderMetadata from "./OrderMetadata";
import { useTranslation } from "react-i18next";

const OrderCard = ({ order, isExpanded, onToggle, onStatusChange, onInvoiceClick }) => {
  const [showMetaData, setShowMetaData] = useState(false);
  const { t } = useTranslation();
  
  const getStatusStyle = (status) => {
    switch(status) {
      case "Sipariş Alındı": return { border: "border-l-blue-500", badge: "bg-blue-100 text-blue-700", icon: <FiClock/> };
      case "Hazırlanıyor": return { border: "border-l-yellow-500", badge: "bg-yellow-100 text-yellow-700", icon: <FiPackage/> };
      case "Hazır": return { border: "border-l-teal-500", badge: "bg-teal-100 text-teal-700", icon: <FiPackage/> };
      case "Yola Çıktı": return { border: "border-l-purple-500", badge: "bg-purple-100 text-purple-700", icon: <FiTruck/> };
      case "Teslim Edildi": return { border: "border-l-green-500", badge: "bg-green-100 text-green-700", icon: <FiCheckCircle/> };
      case "İptal": return { border: "border-l-red-500", badge: "bg-red-100 text-red-700 opacity-70", icon: <FiXCircle/> };
      case "İptal Talebi": return { border: "border-l-orange-500", badge: "bg-orange-100 text-orange-800 animate-pulse border border-orange-200", icon: <FiAlertCircle/> };
      default: return { border: "border-l-gray-500", badge: "bg-gray-100 text-gray-600", icon: <FiBox/> };
    }
  };

  const statusStyle = getStatusStyle(order.status);
  
  // Mağaza Bilgisi
  const vendors = [...new Set(order.items.map(i => i.vendorName || "Bilinmiyor"))];
  const vendorDisplay = vendors.length > 1 ? "Çoklu Mağaza" : vendors[0];

  // Finansal Analiz
  const rawTotal = order.rawTotal || order.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const realCost = rawTotal + order.deliveryFee;
  const isLoss = (realCost > order.totalAmount) && order.status !== "İptal";
  const lossAmount = realCost - order.totalAmount;

  // --- ÜRÜNLERİ GRUPLA ---
  const groupedItems = order.items.reduce((groups, item) => {
      const vName = item.vendorName || "Platform";
      if (!groups[vName]) groups[vName] = [];
      groups[vName].push(item);
      return groups;
  }, {});

  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer hover:shadow-md 
        border-l-4 ${statusStyle.border} 
        ${isExpanded ? 'ring-2 ring-blue-100 scale-[1.005]' : 'border-gray-200'}
      `}
    >
      {/* --- ÜST ÖZET --- */}
      <div className="p-6 flex flex-col lg:flex-row items-center justify-between gap-6" onClick={onToggle}>
        
        {/* Sol */}
        <div className="flex items-center gap-5 w-full lg:w-auto">
          <div className={`p-4 rounded-2xl transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            {isExpanded ? <FiChevronUp size={24}/> : <FiChevronDown size={24}/>}
          </div>
          <div>
            <div className="font-mono text-xs text-gray-400 font-bold flex items-center gap-2 mb-1">
              #{order._id.slice(-8).toUpperCase()}
              {order.status === "İptal Talebi" && <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-bold border border-orange-200"><FiAlertCircle/> {t("adminComponents.adminOrderComp.orderCard.request")}</span>}
              {isLoss && <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-bold border border-red-100" title={`Zarar: £${lossAmount.toFixed(2)}`}><FiTrendingDown/> {t("adminComponents.adminOrderComp.orderCard.loss")}</span>}
            </div>
            <div className="font-bold text-gray-900 text-xl">{order.recipient.name}</div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>📅 {new Date(order.createdAt).toLocaleDateString()}</span>
                <span>⏰ {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        </div>

        {/* Orta */}
        <div className="hidden md:flex flex-col items-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Satıcı / {t("adminComponents.adminOrderComp.orderCard.vendor")}</div>
            <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-1.5 rounded-lg font-bold text-sm border border-purple-100">
                <FiShoppingBag /> {vendorDisplay}
            </div>
        </div>

        {/* Sağ */}
        <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
          <div className="text-right">
            <div className="text-xs text-gray-400 font-bold uppercase">{t("adminComponents.adminOrderComp.orderCard.total")}</div>
            <div className="text-xl font-black text-pink-600">£{order.totalAmount.toFixed(2)}</div>
            {isLoss && <div className="text-[10px] text-red-400 font-bold line-through">{t("adminComponents.adminOrderComp.orderCard.cost")}: £{realCost.toFixed(2)}</div>}
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <select 
              value={order.status} 
              onChange={(e) => onStatusChange(e, order._id)} 
              className={`text-xs font-bold px-4 py-3 rounded-xl border-2 outline-none cursor-pointer transition shadow-sm appearance-none text-center w-40 ${order.status === 'İptal Talebi' ? 'bg-orange-500 text-white border-orange-600 animate-pulse' : 'bg-white hover:border-blue-400 text-gray-700'}`}
            >
              <option>{t("adminComponents.adminOrderComp.orderCard.orderReceived")}</option><option>{t("adminComponents.adminOrderComp.orderCard.orderPreparing")}</option><option>{t("adminComponents.adminOrderComp.orderCard.ready")}</option><option>{t("adminComponents.adminOrderComp.orderCard.onTheWay")}</option><option>{t("adminComponents.adminOrderComp.orderCard.delivered")}</option><option className="bg-orange-100 text-orange-800 font-bold">{t("adminComponents.adminOrderComp.orderCard.cancelRequest")}</option><option className="text-red-600 font-bold">{t("adminComponents.adminOrderComp.orderCard.cancel")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- ALT DETAY --- */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-6 lg:p-8 cursor-default animate-fade-in" onClick={(e) => e.stopPropagation()}>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Alıcı & Gönderen */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><FiUser /> {t("adminComponents.adminOrderComp.orderCard.senderReceiver")}</h4>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 text-sm shadow-sm">
                <p className="font-bold text-gray-800 text-lg">{order.recipient.name}</p>
                <p className="text-gray-600">{order.recipient.phone}</p>
                <div className="my-3 border-t border-dashed border-gray-200"></div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">{t("adminComponents.adminOrderComp.orderCard.sender")}</p>
                <p className="font-medium text-gray-700">{order.sender.name}</p>
                <p className="text-gray-500 text-xs">{order.sender.email}</p>
              </div>
            </div>
            
            {/* Teslimat */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><FiMapPin /> {t("adminComponents.adminOrderComp.orderCard.delivery")}</h4>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 text-sm shadow-sm h-full">
                <p className="font-medium text-gray-800 text-lg">{order.recipient.city}</p>
                <p className="text-gray-600 leading-relaxed">
                    {order.recipient.street ? order.recipient.street : order.recipient.address} {order.recipient.buildingNo}
                </p>
                {(order.recipient.floor || order.recipient.apartment) && (
                    <p className="text-gray-500 text-xs font-medium">
                        {order.recipient.floor && `Kat: ${order.recipient.floor} `} 
                        {order.recipient.apartment && `Daire: ${order.recipient.apartment}`}
                    </p>
                )}
                <p className="text-xs text-gray-400 mt-2 font-mono bg-gray-50 inline-block px-2 py-1 rounded">{order.recipient.postcode}</p>
                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-3 text-xs font-bold text-blue-600">
                  <span className="bg-blue-50 px-3 py-1.5 rounded-lg">📅 {new Date(order.delivery.date).toLocaleDateString()}</span>
                  <span className="bg-blue-50 px-3 py-1.5 rounded-lg">⏰ {order.delivery.timeSlot}</span>
                </div>
              </div>
            </div>

            {/* Notlar & Finans */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">📝 {t("adminComponents.adminOrderComp.orderCard.notesAndFinance")}</h4>
              <div className="flex flex-col gap-3 h-full">
                  {order.delivery.cardMessage ? <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100 text-sm text-pink-800 italic shadow-sm flex-1"><span className="text-2xl opacity-20 block">❝</span>{order.delivery.cardMessage}</div> : <div className="text-xs text-gray-400 italic p-4 bg-white rounded-2xl border border-dashed border-gray-300">{t("adminComponents.adminOrderComp.orderCard.cardNoteNotAvailable")}.</div>}
                  {order.delivery.courierNote && <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 text-xs text-yellow-800 font-bold shadow-sm flex items-center gap-2"><span className="text-xl">⚠️</span> {order.delivery.courierNote}</div>}
                  
                  {isLoss && (
                      <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-xs text-red-700 font-mono mt-auto">
                        <div className="flex justify-between"><span>{t("adminComponents.adminOrderComp.orderCard.realCost")}:</span> <span>£{realCost.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold border-t border-red-200 pt-1 mt-1"><span>{t("adminComponents.adminOrderComp.orderCard.netLoss")}:</span> <span>-£{lossAmount.toFixed(2)}</span></div>
                      </div>
                  )}
                  {order.status === "İptal Talebi" && order.cancellationReason && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-pulse">
                      <div className="flex items-center gap-2 text-red-800 font-bold mb-1"><FiAlertCircle /><span>{t("adminComponents.adminOrderComp.orderCard.cancelReason")}:</span></div>
                      <p className="text-red-700 text-sm italic">"{order.cancellationReason}"</p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Ürün Listesi (MAĞAZALARA GÖRE GRUPLU) */}
          <div className="mt-8">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><FiBox /> {t("adminComponents.adminOrderComp.orderCard.products")}</h4>
            <div className="space-y-4">
                {Object.keys(groupedItems).map((vendorName, vIndex) => (
                    <div key={vIndex} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        {/* Dükkan Başlığı */}
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><FiShoppingBag className="text-purple-500"/> {vendorName}</span>
                            <span className="text-xs bg-white border px-2 py-0.5 rounded text-gray-500">{groupedItems[vendorName].length} Items</span>
                        </div>
                        {/* Dükkan Ürünleri */}
                        <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {groupedItems[vendorName].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition">
                                    <img src={item.img} className="w-12 h-12 rounded-lg object-cover border border-gray-100" alt={item.title} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-800 truncate">{item.title}</div>
                                        {item.selectedVariant && <div className="text-[10px] text-gray-500">{item.selectedVariant.size} / {item.selectedVariant.color}</div>}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 font-bold">x{item.quantity}</div>
                                        <div className="font-bold text-pink-600 text-sm">£{item.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Alt Bar */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); setShowMetaData(!showMetaData); }} className="text-xs font-bold flex items-center gap-2 transition px-5 py-3 rounded-xl border bg-white text-slate-500 border-slate-200 hover:border-slate-400">
              {showMetaData ? <FiEyeOff /> : <FiEye />} {showMetaData ? t("adminComponents.adminOrderComp.orderCard.hideTechnicalDetails") : t("adminComponents.adminOrderComp.orderCard.showTechnicalDetails")}
            </button>

            <div className="flex items-center gap-4">
               {order.courierId && <span className="text-xs bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-bold border border-purple-200 flex items-center gap-2"><FiTruck/> {t("adminComponents.adminOrderComp.orderCard.courierFound")}</span>}
               <button onClick={() => onInvoiceClick(order)} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg transform active:scale-95"><FiPrinter /> {t("adminComponents.adminOrderComp.orderCard.printInvoice")}</button>
            </div>
          </div>

          {showMetaData && <OrderMetadata meta={order.metaData} />}

        </div>
      )}
    </div>
  );
};

export default OrderCard;