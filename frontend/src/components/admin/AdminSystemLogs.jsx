import { useEffect, useState } from "react";
import { userRequest } from "../../requestMethods";
import { 
  FiClock, FiMapPin, FiMonitor, FiSearch, FiRefreshCw, 
  FiEye, FiShoppingCart, FiUser, FiGlobe, FiSmartphone, FiChrome, 
  FiShield, FiTrash2, FiFilter, FiAlertCircle, FiActivity, FiXCircle 
} from "react-icons/fi";
import { FaSafari, FaFirefox, FaEdge } from "react-icons/fa";
import AdminPanelHeader from "./adminComponents/AdminPanelHeader"; 
import ConfirmModal from "../ConfirmModal"; 

// --- YARDIMCI FONKSİYONLAR ---
const getBrowserIcon = (browserName) => {
  const name = browserName?.toLowerCase() || "";
  if (name.includes("chrome")) return <FiChrome className="text-blue-500" />;
  if (name.includes("safari")) return <FaSafari className="text-blue-400" />;
  if (name.includes("firefox")) return <FaFirefox className="text-orange-500" />;
  if (name.includes("edge")) return <FaEdge className="text-blue-600" />;
  return <FiGlobe className="text-gray-400" />;
};

const getActionLabelRaw = (action) => {
    const labels = {
      'login': 'Giriş Yaptı',
      'register': 'Kayıt Oldu',
      'password_change': 'Şifre Değişti',
      'profile_update': 'Profil Güncellendi',
      'add_address': 'Adres Eklendi',
      'search_query': 'Arama Yaptı', 
      'view_product': 'Ürün İnceledi',
      'add_to_cart': 'Sepete Ekledi', 
      'order_placed': 'Sipariş Verdi',
      'order_success': 'Sipariş Tamamlandı',
      'logout': 'Çıkış Yapıldı'
    };
    return labels[action] || action;
};

const AdminSystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtreleme State'leri
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);

  // Silme Onayları
  const [confirmData, setConfirmData] = useState(null); // { type: 'single' | 'batch', id?: string, title, message }

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await userRequest.get("/logs");
      setLogs(res.data);
      setFilteredLogs(res.data); 
    } catch (err) {
      console.error("Loglar çekilemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- FİLTRELEME MANTIĞI ---
  useEffect(() => {
    let result = logs;

    if (filterType !== "all") {
      result = result.filter(log => log.action === filterType);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLocaleLowerCase('tr');
      result = result.filter(log => {
        const nameMatch = log.userId?.fullName?.toLocaleLowerCase('tr').includes(lowerTerm);
        const emailMatch = log.userId?.email?.toLocaleLowerCase('tr').includes(lowerTerm);
        const ipMatch = log.ip?.includes(searchTerm);
        const actionLabel = getActionLabelRaw(log.action).toLocaleLowerCase('tr');
        const actionMatch = actionLabel.includes(lowerTerm);
        const metaMatch = (log.metadata?.searchTerm && log.metadata.searchTerm.toLocaleLowerCase('tr').includes(lowerTerm)) ||
                          (log.metadata?.productName && log.metadata.productName.toLocaleLowerCase('tr').includes(lowerTerm));
        return nameMatch || emailMatch || ipMatch || actionMatch || metaMatch;
      });
    }

    setFilteredLogs(result);
  }, [filterType, searchTerm, logs]);

  // --- SİLME İŞLEMLERİ ---

  // 1. Tekli Silme İsteği
  const handleDeleteSingle = async (id) => {
    try {
      await userRequest.delete(`/logs/find/${id}`);
      // State'den de sil (Tekrar fetch yapmaya gerek yok, hızlı olsun)
      setLogs(prev => prev.filter(l => l._id !== id));
      setConfirmData(null);
    } catch (err) {
      alert("Silme işlemi başarısız.");
    }
  };

  // 2. Toplu Silme İsteği (Filtreli veya Tümü)
  const handleBatchDelete = async () => {
    const isFiltering = filterType !== "all" || searchTerm !== "";
    
    try {
      if (isFiltering) {
        // Sadece ekranda görünenleri sil (ID listesi gönder)
        const idsToDelete = filteredLogs.map(l => l._id);
        if (idsToDelete.length === 0) return;

        // Backend'e body içinde gönderiyoruz
        await userRequest.delete("/logs", { data: { ids: idsToDelete } });
        
        // State güncelle
        setLogs(prev => prev.filter(l => !idsToDelete.includes(l._id)));
      } else {
        // Hepsini sil
        await userRequest.delete("/logs");
        setLogs([]);
      }
      setConfirmData(null);
    } catch (err) {
      alert("Toplu silme başarısız.");
    }
  };

  // Buton Tıklanınca Onay Modalı Aç
  const openDeleteModal = (type, id = null) => {
    if (type === 'single') {
        setConfirmData({
            type: 'single',
            id,
            title: "Log Kaydını Sil?",
            message: "Bu işlem geri alınamaz."
        });
    } else {
        const isFiltering = filterType !== "all" || searchTerm !== "";
        setConfirmData({
            type: 'batch',
            title: isFiltering ? "Filtrelenenleri Sil?" : "Tüm Kayıtları Temizle?",
            message: isFiltering 
                ? `Listelenen ${filteredLogs.length} adet kayıt kalıcı olarak silinecek.` 
                : "Dikkat! Veritabanındaki TÜM LOGLAR silinecek. Bu işlem geri alınamaz."
        });
    }
  };

  const getActionStyle = (action) => {
    const label = getActionLabelRaw(action);
    switch (action) {
      case 'view_product': return { icon: <FiEye />, color: 'bg-blue-100 text-blue-600', label };
      case 'add_to_cart': return { icon: <FiShoppingCart />, color: 'bg-purple-100 text-purple-600', label };
      case 'search_query': return { icon: <FiSearch />, color: 'bg-yellow-100 text-yellow-700', label };
      case 'login': return { icon: <FiUser />, color: 'bg-green-100 text-green-600', label };
      case 'logout': return { icon: <FiUser />, color: 'bg-gray-100 text-gray-600', label };
      case 'order_success': return { icon: <FiShoppingCart />, color: 'bg-green-100 text-green-600', label };
      default: return { icon: <FiActivity />, color: 'bg-gray-100 text-gray-600', label };
    }
  };

  const isFiltering = filterType !== "all" || searchTerm !== "";

  return (
    <div className="space-y-6 pt-2 max-w-7xl mx-auto animate-fade-in">
      
      {/* Header & Toolbar */}
      <AdminPanelHeader title="Canlı Sistem Trafiği" count={filteredLogs.length}>
        <div className="flex flex-wrap items-center gap-3">
            
            {/* Arama */}
            <div className="relative group">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" />
                <input 
                  type="text" 
                  placeholder="Kullanıcı, Eylem veya IP ara..." 
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filtre */}
            <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select 
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white cursor-pointer"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="all">Tüm İşlemler</option>
                    <option value="search_query">🔍 Aramalar</option>
                    <option value="view_product">📦 Ürün İnceleme</option>
                    <option value="add_to_cart">🛒 Sepet İşlemleri</option>
                    <option value="login">🔑 Giriş Hareketleri</option>
                </select>
            </div>

            <button onClick={fetchLogs} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition" title="Yenile">
               <FiRefreshCw className={loading ? "animate-spin" : ""} />
            </button>

            {/* AKILLI SİLME BUTONU */}
            <button 
              onClick={() => openDeleteModal('batch')} 
              disabled={filteredLogs.length === 0}
              className={`px-4 py-2 border rounded-lg font-bold flex items-center gap-2 transition ${
                  isFiltering 
                    ? "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100" // Filtreli Silme Rengi
                    : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" // Tam Silme Rengi
              } ${filteredLogs.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
               {isFiltering ? <FiXCircle /> : <FiTrash2 />} 
               {isFiltering ? "Listelenenleri Sil" : "Tümünü Temizle"}
            </button>
        </div>
      </AdminPanelHeader>

      {/* Tablo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="p-4 font-bold">Zaman</th>
                <th className="p-4 font-bold">Kullanıcı</th>
                <th className="p-4 font-bold">Eylem</th>
                <th className="p-4 font-bold">Detay</th>
                <th className="p-4 font-bold">Teknik Bilgi</th>
                <th className="p-4 font-bold w-10"></th> {/* Silme Butonu İçin Yer */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredLogs.map((log) => {
                const style = getActionStyle(log.action);
                return (
                  <tr key={log._id} className="hover:bg-gray-50 transition group">
                    
                    {/* Zaman */}
                    <td className="p-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                        <div className="flex items-center gap-1">
                          <FiClock /> {new Date(log.createdAt).toLocaleTimeString('tr-TR')}
                        </div>
                        <div className="text-[10px] text-gray-400 pl-4">{new Date(log.createdAt).toLocaleDateString('tr-TR')}</div>
                    </td>

                    {/* Kullanıcı */}
                    <td className="p-4">
                        {log.userId ? (
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                                {log.userId.fullName?.[0] || 'U'}
                             </div>
                             <div>
                                <div className="font-bold text-gray-800">{log.userId.fullName}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wide">{log.userId.role}</div>
                                <div className="text-[10px] text-gray-400">{log.userId.email}</div>
                             </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs shrink-0">?</div>
                             <div>
                                <div className="font-bold text-gray-600 italic">Misafir</div>
                                <div className="text-[10px] text-gray-400">Giriş Yapılmamış</div>
                             </div>
                          </div>
                        )}
                    </td>

                    {/* Eylem */}
                    <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-fit ${style.color}`}>
                          {style.icon} {style.label}
                        </span>
                    </td>

                    {/* Detay */}
                    <td className="p-4 max-w-xs">
                        <div className="truncate text-gray-600">
                          {log.action === 'view_product' && log.metadata?.productName && (
                              <span title={log.metadata.productName}>📦 <b>{log.metadata.productName}</b></span>
                          )}
                          {log.action === 'search_query' && (
                              <span>🔍 <b>"{log.metadata?.searchTerm}"</b></span>
                          )}
                          {log.action === 'add_to_cart' && (
                              <span>🛒 <b>{log.metadata?.productName}</b> sepete eklendi</span>
                          )}
                          {!['view_product', 'search_query', 'add_to_cart'].includes(log.action) && (
                              <span className="text-gray-400 italic">Detay yok</span>
                          )}
                        </div>
                    </td>

                    {/* Teknik */}
                    <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1 font-bold text-gray-700 text-xs">
                               <FiMapPin className="text-red-500" /> {log.geo?.city || 'Bilinmiyor'}, {log.geo?.country}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded w-fit border border-gray-100">
                              <FiShield className="text-gray-300" size={10} /> 
                              {log.ip ? log.ip.substring(0, 15) + '...' : 'IP Yok'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                               <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-600">
                                  {log.device?.type === 'Mobile' ? <FiSmartphone /> : <FiMonitor />}
                                  <span>{log.os?.name}</span>
                               </div>
                               <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-[10px] text-blue-600">
                                  {getBrowserIcon(log.browser?.name)}
                                  <span>{log.browser?.name}</span>
                               </div>
                          </div>
                        </div>
                    </td>

                    {/* TEKİL SİLME BUTONU (Hover olunca belirginleşir) */}
                    <td className="p-4 text-right">
                        <button 
                            onClick={() => openDeleteModal('single', log._id)}
                            className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                            title="Bu kaydı sil"
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredLogs.length === 0 && !loading && (
             <div className="flex flex-col items-center justify-center py-20 text-center">
                 <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <FiAlertCircle size={30} className="text-gray-300"/>
                 </div>
                 <p className="text-gray-500 font-bold">Kayıt Bulunamadı</p>
                 <p className="text-gray-400 text-sm">Aradığınız kriterlere uygun log kaydı yok.</p>
             </div>
          )}
        </div>
      </div>

      {/* Ortak Silme Modalı */}
      {confirmData && (
        <ConfirmModal 
           title={confirmData.title} 
           message={confirmData.message}
           isDanger={true}
           onConfirm={() => confirmData.type === 'single' ? handleDeleteSingle(confirmData.id) : handleBatchDelete()}
           onCancel={() => setConfirmData(null)}
        />
      )}

    </div>
  );
};

export default AdminSystemLogs;