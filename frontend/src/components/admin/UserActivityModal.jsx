import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiActivity, FiClock, FiMapPin, FiMonitor, FiGlobe, FiChrome } from "react-icons/fi";
import { userRequest } from "../../requestMethods"; // API isteği için gerekli

const UserActivityModal = ({ user, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [logs, setLogs] = useState([]); // Log verisi state'i
  const [loading, setLoading] = useState(true); // Yükleniyor durumu
  
  const modalRoot = document.getElementById("modal-root") || document.body;

  // 1. Modal açılınca API'den logları çek
  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflow = 'hidden';

    const fetchLogs = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        // Backend'de oluşturduğumuz rota: router.get('/:userId', ...)
        const res = await userRequest.get(`/logs/${user._id}`);
        setLogs(res.data);
      } catch (err) {
        console.error("Loglar çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    return () => { document.body.style.overflow = 'unset'; };
  }, [user]);

  if (!isMounted || !user) return null;

  // İşlem isimlerini Türkçeleştirme
  const getActionLabel = (action) => {
    const labels = {
      'login': 'Giriş Yaptı',
      'register': 'Kayıt Oldu',
      'password_change': 'Şifre Değişti',
      'profile_update': 'Profil Güncellendi',
      'add_address': 'Adres Eklendi',
      'search_query': 'Arama Yaptı', // Yeni log adı
      'view_product': 'Ürün İnceledi',
      'add_to_cart': 'Sepete Ekledi', // Yeni log adı
      'remove_from_cart': 'Sepetten Sildi',
      'order_placed': 'Sipariş Verdi',
      'sync_favorites': 'Favori Eşitleme',
      'add_favorite': 'Favoriye Ekleme',
      'remove_favorite': 'Favoriden Çıkarma',
      'logout': 'Çıkış Yapıldı'
    };
    return labels[action] || action;
  };

  const getActionColor = (action) => {
    if (action.includes('login') || action.includes('register')) return 'text-green-600 bg-green-50';
    if (action.includes('order') || action.includes('cart')) return 'text-purple-600 bg-purple-50';
    if (action.includes('cancel') || action.includes('remove') || action.includes('logout')) return 'text-red-600 bg-red-50';
    return 'text-blue-600 bg-blue-50';
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl">
                <FiActivity />
             </div>
             <div>
                <h3 className="text-xl font-black text-gray-800">{user.fullName}</h3>
                <p className="text-sm text-gray-500">Dijital Ayak İzi ve Hareket Dökümü</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition shadow-sm border border-gray-100">
             <FiX size={24} />
          </button>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-2"></div>
                <p>Loglar sunucudan çekiliyor...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
                <p className="text-lg">📭</p>
                <p>Bu kullanıcıya ait kayıtlı yeni sistem logu yok.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="flex flex-col lg:flex-row gap-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition bg-gray-50/30 group">
                   
                   {/* Sol: İkon ve Tarih */}
                   <div className="w-full lg:w-48 shrink-0 flex lg:flex-col items-center lg:items-start justify-between lg:justify-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-mono" title={log.createdAt}>
                        <FiClock /> {new Date(log.createdAt).toLocaleString('tr-TR')}
                      </div>
                   </div>

                   {/* Orta: Detaylar (Metadata) */}
                   <div className="flex-1">
                      <div className="text-sm text-gray-700 break-all">
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                           <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                             {Object.entries(log.metadata).map(([key, val]) => (
                               <li key={key} className="flex gap-1 items-baseline">
                                 <span className="font-bold text-gray-500 text-xs capitalize">{key}:</span>
                                 <span className="font-mono text-indigo-700 text-xs">
                                    {typeof val === 'object' ? JSON.stringify(val) : val.toString()}
                                 </span>
                               </li>
                             ))}
                           </ul>
                        ) : <span className="text-gray-400 italic text-xs">Ek detay yok.</span>}
                      </div>
                   </div>

                   {/* Sağ: Teknik Metadata (Yeni Şemaya Uygun) */}
                   <div className="w-full lg:w-48 shrink-0 text-[10px] text-gray-400 border-t lg:border-t-0 lg:border-l border-gray-200 pt-2 lg:pt-0 lg:pl-4 flex flex-col justify-center gap-1">
                      
                      {/* Cihaz Bilgisi */}
                      <div className="flex items-center gap-2">
                         <FiMonitor className="text-gray-300"/> 
                         <span className="truncate">
                             {log.device?.type || 'PC'} 
                             {log.os?.name !== 'Unknown' && ` - ${log.os?.name}`}
                         </span>
                      </div>
                      
                      {/* Tarayıcı Bilgisi */}
                      <div className="flex items-center gap-2">
                         <FiChrome className="text-gray-300"/> 
                         <span className="truncate">{log.browser?.name || 'Browser'}</span>
                      </div>

                      {/* Konum ve IP */}
                      <div className="flex items-center gap-2">
                         <FiMapPin className="text-gray-300"/> 
                         <span className="truncate text-gray-500 font-medium">
                            {log.geo?.city ? `${log.geo.city}, ${log.geo.country}` : 'Konum Yok'}
                         </span>
                      </div>
                      
                      {/* IP Adresi (Tooltip ile göster) */}
                      <div className="mt-1 text-[9px] font-mono text-gray-300 truncate" title={log.ip}>
                          IP: {log.ip?.substring(0, 15)}...
                      </div>
                   </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default UserActivityModal;