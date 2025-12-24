import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  FiX, FiActivity, FiClock, FiMapPin, FiMonitor, FiSmartphone, 
  FiChrome, FiGlobe, FiShoppingCart, FiSearch, FiEye, FiUser, FiShield 
} from "react-icons/fi";
import { FaSafari, FaFirefox, FaEdge } from "react-icons/fa";
import { userRequest } from "../../requestMethods"; 

const UserActivityModal = ({ user, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [logs, setLogs] = useState([]); 
  const [loading, setLoading] = useState(true); 
  
  const modalRoot = document.getElementById("modal-root") || document.body;

  // --- 1. Tarayıcı İkonu Seçen Fonksiyon (Eksiksiz) ---
  const getBrowserIcon = (browserName) => {
    const name = browserName?.toLowerCase() || "";
    if (name.includes("chrome")) return <FiChrome className="text-blue-500" />;
    if (name.includes("safari")) return <FaSafari className="text-blue-400" />;
    if (name.includes("firefox")) return <FaFirefox className="text-orange-500" />;
    if (name.includes("edge")) return <FaEdge className="text-blue-600" />;
    return <FiGlobe className="text-gray-400" />;
  };

  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflow = 'hidden';

    const fetchUserLogs = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        // Backend rotası: /logs/user/:id
        const res = await userRequest.get(`/logs/user/${user._id}`);
        setLogs(res.data);
      } catch (err) {
        console.error("Kullanıcı logları çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLogs();

    return () => { document.body.style.overflow = 'unset'; };
  }, [user]);

  if (!isMounted || !user) return null;

  // --- 2. Eylem Stilleri ve Renkleri ---
  const getActionStyle = (action) => {
    switch (action) {
      case 'view_product': return { icon: <FiEye />, color: 'text-blue-600 bg-blue-50', label: 'Ürün İnceledi' };
      case 'add_to_cart': return { icon: <FiShoppingCart />, color: 'text-purple-600 bg-purple-50', label: 'Sepete Ekledi' };
      case 'search_query': return { icon: <FiSearch />, color: 'text-yellow-600 bg-yellow-50', label: 'Arama Yaptı' };
      case 'login': return { icon: <FiUser />, color: 'text-green-600 bg-green-50', label: 'Giriş Yaptı' };
      case 'logout': return { icon: <FiUser />, color: 'text-gray-600 bg-gray-50', label: 'Çıkış Yaptı' };
      case 'order_success': return { icon: <FiShoppingCart />, color: 'text-green-600 bg-green-50', label: 'Sipariş Tamamlandı' };
      default: return { icon: <FiActivity />, color: 'text-gray-600 bg-gray-50', label: action };
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl">
                <FiActivity />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-800">{user.fullName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{user.email}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="uppercase text-xs font-bold tracking-wider bg-gray-200 px-2 py-0.5 rounded text-gray-600">{user.role}</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition shadow-sm border border-gray-100">
             <FiX size={24} />
          </button>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                <p className="text-sm">Geçmiş yükleniyor...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>Bu kullanıcıya ait kayıtlı aktivite bulunamadı.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => {
                const style = getActionStyle(log.action);
                return (
                  <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-gray-50/50 transition group">
                     
                     {/* Sol: İkon ve Zaman */}
                     <div className="sm:w-40 shrink-0 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-1">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 ${style.color}`}>
                          {style.icon} {style.label}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono mt-1">
                          <FiClock size={10} /> {new Date(log.createdAt).toLocaleString('tr-TR')}
                        </div>
                     </div>

                     {/* Orta: Detaylar (Metadata) */}
                     <div className="flex-1 border-l border-gray-100 sm:pl-4 pl-0 border-l-0 sm:border-t-0 border-t pt-2 sm:pt-0">
                        <div className="text-sm text-gray-700">
                          {log.action === 'view_product' && log.metadata?.productName && (
                              <div className="flex items-center gap-2">
                                <span>📦</span> <span className="font-medium">{log.metadata.productName}</span> incelendi.
                              </div>
                          )}
                          {log.action === 'search_query' && (
                              <div className="flex items-center gap-2">
                                <span>🔍</span> <span className="font-bold">"{log.metadata?.searchTerm}"</span> araması yapıldı.
                              </div>
                          )}
                          {log.action === 'add_to_cart' && (
                              <div className="flex items-center gap-2">
                                <span>🛒</span> <span className="font-medium">{log.metadata?.productName}</span> sepete eklendi.
                              </div>
                          )}
                          {!['view_product', 'search_query', 'add_to_cart'].includes(log.action) && (
                              <span className="text-gray-400 italic text-xs">Standart işlem kaydı.</span>
                          )}
                        </div>
                     </div>

                     {/* Sağ: Teknik Metadata (Cihaz/Konum/IP) */}
                     <div className="sm:w-40 shrink-0 text-[10px] text-gray-400 flex flex-col justify-center gap-1.5 sm:text-right sm:items-end">
                        
                        {/* Konum */}
                        <div className="flex items-center gap-1 sm:flex-row-reverse">
                            <FiMapPin className="text-red-400"/> 
                            <span className="truncate max-w-[100px]">{log.geo?.city || '?'}, {log.geo?.country}</span>
                        </div>

                        {/* Cihaz ve OS */}
                        <div className="flex items-center gap-1 sm:flex-row-reverse">
                            {log.device?.type === 'Mobile' ? <FiSmartphone className="text-gray-400"/> : <FiMonitor className="text-gray-400"/>}
                            <span className="truncate max-w-[100px]">{log.os?.name}</span>
                        </div>

                        {/* --- 3. Tarayıcı (Burada Kullanılıyor) --- */}
                        <div className="flex items-center gap-1 sm:flex-row-reverse">
                            {getBrowserIcon(log.browser?.name)} 
                            <span className="truncate max-w-[100px]">{log.browser?.name || 'Browser'}</span>
                        </div>
                        
                        {/* IP (Güvenlik) */}
                        <div className="flex items-center gap-1 sm:flex-row-reverse bg-gray-100 px-1.5 py-0.5 rounded w-fit">
                            <FiShield size={10} className="text-gray-400"/>
                            <span className="font-mono text-gray-500">{log.ip ? log.ip.substring(0, 15) : 'IP Yok'}</span>
                        </div>

                     </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default UserActivityModal;