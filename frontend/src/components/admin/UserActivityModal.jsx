import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiActivity, FiClock, FiMapPin, FiMonitor } from "react-icons/fi";

const UserActivityModal = ({ user, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  const modalRoot = document.getElementById("modal-root") || document.body;

  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!isMounted || !user) return null;

  // Logları tarihe göre (yeniden eskiye) sırala
  const logs = user.activityLog ? [...user.activityLog].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

  // İşlem isimlerini Türkçeleştirme
  const getActionLabel = (action) => {
    const labels = {
      'login': 'Giriş Yaptı',
      'register': 'Kayıt Oldu',
      'password_change': 'Şifre Değişti',
      'profile_update': 'Profil Güncellendi',
      'add_address': 'Adres Eklendi',
      'search': 'Arama Yaptı',
      'view_product': 'Ürün İnceledi',
      'add_review': 'Yorum Yaptı',
      'order_placed': 'Sipariş Verdi',
      'order_cancel_request': 'İptal Talebi',
      'sync_favorites': 'Favori Eşitleme',
      'add_favorite': 'Favoriye Ekleme',
      'remove_favorite': 'Favoriden Çıkarma',
      'partner_application': 'İş Ortağı Başvurusu'
    };
    return labels[action] || action;
  };

  const getActionColor = (action) => {
    if (action.includes('login') || action.includes('register')) return 'text-green-600 bg-green-50';
    if (action.includes('order')) return 'text-purple-600 bg-purple-50';
    if (action.includes('cancel') || action.includes('remove')) return 'text-red-600 bg-red-50';
    return 'text-blue-600 bg-blue-50';
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl">
                <FiActivity />
             </div>
             <div>
                <h3 className="text-xl font-black text-gray-800">{user.fullName}</h3>
                <p className="text-sm text-gray-500">Aktivite Geçmişi ve Metadata Kayıtları</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition shadow-sm border border-gray-100">
             <FiX size={24} />
          </button>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {logs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Henüz kayıtlı aktivite yok.</div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition bg-gray-50/30">
                   
                   {/* Sol: İkon ve Tarih */}
                   <div className="w-full md:w-48 shrink-0 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                        <FiClock /> {new Date(log.date).toLocaleString('tr-TR')}
                      </div>
                   </div>

                   {/* Orta: Detaylar */}
                   <div className="flex-1">
                      {/* Detay objesini JSON string olarak değil, anlamlı parçalar halinde göster */}
                      <div className="text-sm text-gray-700 break-all">
                        {log.details ? (
                           <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                             {Object.entries(log.details).map(([key, val]) => (
                               <li key={key} className="flex gap-1">
                                 <span className="font-bold text-gray-500 capitalize">{key}:</span>
                                 <span className="font-mono text-indigo-700">{typeof val === 'object' ? JSON.stringify(val) : val.toString()}</span>
                               </li>
                             ))}
                           </ul>
                        ) : <span className="text-gray-400 italic">Ek detay yok.</span>}
                      </div>
                   </div>

                   {/* Sağ: Teknik Metadata */}
                   <div className="w-full md:w-40 shrink-0 text-[10px] text-gray-400 border-t md:border-t-0 md:border-l border-gray-200 pt-2 md:pt-0 md:pl-4 flex flex-col justify-center gap-1">
                      <div className="flex items-center gap-1"><FiMonitor/> {log.deviceInfo?.deviceType || 'Bilinmiyor'}</div>
                      <div className="flex items-center gap-1"><FiMapPin/> {log.ip}</div>
                      <div className="truncate" title={log.deviceInfo?.userAgent}>{log.deviceInfo?.userAgent?.substring(0, 20)}...</div>
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