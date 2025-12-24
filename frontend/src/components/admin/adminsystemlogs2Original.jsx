// import { useEffect, useState } from "react";
// import { userRequest } from "../../requestMethods";
// import { 
//   FiClock, FiMapPin, FiMonitor, FiSearch, FiRefreshCw, 
//   FiEye, FiShoppingCart, FiUser, FiGlobe, FiSmartphone, FiChrome, 
//   FiShield, FiTrash2, FiFilter, FiAlertCircle, FiActivity 
// } from "react-icons/fi";
// import { FaSafari, FaFirefox, FaEdge } from "react-icons/fa";
// import AdminPanelHeader from "./adminComponents/AdminPanelHeader"; 
// import ConfirmModal from "../ConfirmModal"; 

// // Tarayıcı ikonu
// const getBrowserIcon = (browserName) => {
//   const name = browserName?.toLowerCase() || "";
//   if (name.includes("chrome")) return <FiChrome className="text-blue-500" />;
//   if (name.includes("safari")) return <FaSafari className="text-blue-400" />;
//   if (name.includes("firefox")) return <FaFirefox className="text-orange-500" />;
//   if (name.includes("edge")) return <FaEdge className="text-blue-600" />;
//   return <FiGlobe className="text-gray-400" />;
// };

// const AdminSystemLogs = () => {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // --- YENİ: Filtreleme ve Arama State'leri ---
//   const [filterType, setFilterType] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredLogs, setFilteredLogs] = useState([]);

//   // --- YENİ: Silme Onayı State'i ---
//   const [confirmDelete, setConfirmDelete] = useState(false);

//   const fetchLogs = async () => {
//     setLoading(true);
//     try {
//       const res = await userRequest.get("/logs");
//       setLogs(res.data);
//       setFilteredLogs(res.data); // İlk yüklemede hepsi görünsün
//     } catch (err) {
//       console.error("Loglar çekilemedi", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLogs();
//     const interval = setInterval(fetchLogs, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   // --- YENİ: Filtreleme Mantığı (Her değişiklikte çalışır) ---
//   useEffect(() => {
//     let result = logs;

//     // 1. Tip Filtresi
//     if (filterType !== "all") {
//       result = result.filter(log => log.action === filterType);
//     }

//     // 2. Arama Filtresi (Kullanıcı Adı, Email, IP veya Eylem)
//     if (searchTerm) {
//       const lowerTerm = searchTerm.toLowerCase();
//       result = result.filter(log => 
//         log.userId?.fullName?.toLowerCase().includes(lowerTerm) ||
//         log.userId?.email?.toLowerCase().includes(lowerTerm) ||
//         log.ip?.includes(searchTerm) ||
//         log.action?.includes(lowerTerm) ||
//         (log.metadata?.searchTerm && log.metadata.searchTerm.toLowerCase().includes(lowerTerm))
//       );
//     }

//     setFilteredLogs(result);
//   }, [filterType, searchTerm, logs]);

//   // --- YENİ: Logları Silme Fonksiyonu ---
//   const handleClearLogs = async () => {
//     try {
//       await userRequest.delete("/logs");
//       setLogs([]); 
//       setFilteredLogs([]);
//       setConfirmDelete(false);
//       // İsteğe bağlı bildirim ekleyebilirsin: notify("Loglar temizlendi", "success");
//     } catch (err) {
//       alert("Loglar silinemedi! Yetkiniz olmayabilir.");
//     }
//   };

//   const getActionStyle = (action) => {
//     switch (action) {
//       case 'view_product': return { icon: <FiEye />, color: 'bg-blue-100 text-blue-600', label: 'Ürün İnceledi' };
//       case 'add_to_cart': return { icon: <FiShoppingCart />, color: 'bg-purple-100 text-purple-600', label: 'Sepete Ekledi' };
//       case 'search_query': return { icon: <FiSearch />, color: 'bg-yellow-100 text-yellow-700', label: 'Arama Yaptı' };
//       case 'login': return { icon: <FiUser />, color: 'bg-green-100 text-green-600', label: 'Giriş Yaptı' };
//       case 'logout': return { icon: <FiUser />, color: 'bg-gray-100 text-gray-600', label: 'Çıkış Yaptı' };
//       default: return { icon: <FiActivity />, color: 'bg-gray-100 text-gray-600', label: action };
//     }
//   };

//   return (
//     <div className="space-y-6 pt-2 max-w-7xl mx-auto animate-fade-in">
      
//       {/* Header & Toolbar */}
//       <AdminPanelHeader title="Canlı Sistem Trafiği" count={filteredLogs.length}>
//         <div className="flex flex-wrap items-center gap-3">
            
//             {/* Arama Kutusu */}
//             <div className="relative group">
//                 <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" />
//                 <input 
//                   type="text" 
//                   placeholder="Kullanıcı, IP veya İşlem ara..." 
//                   className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//             </div>

//             {/* Filtre Dropdown */}
//             <div className="relative">
//                 <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                 <select 
//                   className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white cursor-pointer"
//                   onChange={(e) => setFilterType(e.target.value)}
//                 >
//                     <option value="all">Tüm İşlemler</option>
//                     <option value="search_query">🔍 Aramalar</option>
//                     <option value="view_product">📦 Ürün İnceleme</option>
//                     <option value="add_to_cart">🛒 Sepet İşlemleri</option>
//                     <option value="login">🔑 Giriş Hareketleri</option>
//                 </select>
//             </div>

//             {/* Yenile Butonu */}
//             <button onClick={fetchLogs} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition" title="Tabloyu Yenile">
//                <FiRefreshCw className={loading ? "animate-spin" : ""} />
//             </button>

//             {/* Temizle Butonu (Delete) */}
//             <button 
//               onClick={() => setConfirmDelete(true)} 
//               className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold hover:bg-red-100 flex items-center gap-2 transition"
//               title="Tüm kayıtları sil"
//             >
//                <FiTrash2 /> Temizle
//             </button>
//         </div>
//       </AdminPanelHeader>

//       {/* Log Tablosu */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
//               <tr>
//                 <th className="p-4 font-bold">Zaman</th>
//                 <th className="p-4 font-bold">Kullanıcı</th>
//                 <th className="p-4 font-bold">Eylem</th>
//                 <th className="p-4 font-bold">Detay</th>
//                 <th className="p-4 font-bold">Teknik Bilgi</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 text-sm">
//               {filteredLogs.map((log) => {
//                 const style = getActionStyle(log.action);
//                 return (
//                   <tr key={log._id} className="hover:bg-gray-50 transition">
                    
//                     {/* 1. Zaman */}
//                     <td className="p-4 whitespace-nowrap text-gray-500 font-mono text-xs">
//                         <div className="flex items-center gap-1">
//                           <FiClock /> {new Date(log.createdAt).toLocaleTimeString('tr-TR')}
//                         </div>
//                         <div className="text-[10px] text-gray-400 pl-4">{new Date(log.createdAt).toLocaleDateString('tr-TR')}</div>
//                     </td>

//                     {/* 2. Kullanıcı */}
//                     <td className="p-4">
//                         {log.userId ? (
//                           <div className="flex items-center gap-3">
//                              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
//                                 {log.userId.fullName?.[0] || 'U'}
//                              </div>
//                              <div>
//                                 <div className="font-bold text-gray-800">{log.userId.fullName}</div>
//                                 <div className="text-[10px] text-gray-500 uppercase tracking-wide">{log.userId.role}</div>
//                                 <div className="text-[10px] text-gray-400">{log.userId.email}</div>
//                              </div>
//                           </div>
//                         ) : (
//                           <div className="flex items-center gap-3">
//                              <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs shrink-0">?</div>
//                              <div>
//                                 <div className="font-bold text-gray-600 italic">Misafir</div>
//                                 <div className="text-[10px] text-gray-400">Giriş Yapılmamış</div>
//                              </div>
//                           </div>
//                         )}
//                     </td>

//                     {/* 3. Eylem */}
//                     <td className="p-4">
//                         <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-fit ${style.color}`}>
//                           {style.icon} {style.label}
//                         </span>
//                     </td>

//                     {/* 4. Detay */}
//                     <td className="p-4 max-w-xs">
//                         <div className="truncate text-gray-600">
//                           {log.action === 'view_product' && log.metadata?.productName && (
//                               <span title={log.metadata.productName}>📦 <b>{log.metadata.productName}</b></span>
//                           )}
//                           {log.action === 'search_query' && (
//                               <span>🔍 <b>"{log.metadata?.searchTerm}"</b></span>
//                           )}
//                           {log.action === 'add_to_cart' && (
//                               <span>🛒 <b>{log.metadata?.productName}</b> sepete eklendi</span>
//                           )}
//                           {!['view_product', 'search_query', 'add_to_cart'].includes(log.action) && (
//                               <span className="text-gray-400 italic">Detay yok</span>
//                           )}
//                         </div>
//                     </td>

//                     {/* 5. Teknik Bilgi (IP, Konum, Cihaz) */}
//                     <td className="p-4">
//                         <div className="flex flex-col gap-2">
//                           <div className="flex items-center gap-1 font-bold text-gray-700 text-xs">
//                                <FiMapPin className="text-red-500" /> {log.geo?.city || 'Bilinmiyor'}, {log.geo?.country}
//                           </div>
//                           <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded w-fit border border-gray-100" title="Kullanıcı IP Adresi">
//                               <FiShield className="text-gray-300" size={10} /> 
//                               {log.ip ? log.ip.substring(0, 15) + '...' : 'IP Yok'}
//                           </div>
//                           <div className="flex items-center gap-2 mt-1">
//                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-600">
//                                   {log.device?.type === 'Mobile' ? <FiSmartphone /> : <FiMonitor />}
//                                   <span>{log.os?.name || 'OS'}</span>
//                                </div>
//                                <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-[10px] text-blue-600">
//                                   {getBrowserIcon(log.browser?.name)}
//                                   <span>{log.browser?.name}</span>
//                                </div>
//                           </div>
//                         </div>
//                     </td>

//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
          
//           {/* Boş Durum Kontrolü */}
//           {filteredLogs.length === 0 && !loading && (
//              <div className="flex flex-col items-center justify-center py-20 text-center">
//                  <div className="bg-gray-50 p-4 rounded-full mb-3">
//                     <FiAlertCircle size={30} className="text-gray-300"/>
//                  </div>
//                  <p className="text-gray-500 font-bold">Kayıt Bulunamadı</p>
//                  <p className="text-gray-400 text-sm">Aradığınız kriterlere uygun log kaydı yok.</p>
//              </div>
//           )}
//         </div>
//       </div>

//       {/* Silme Onay Modalı */}
//       {confirmDelete && (
//         <ConfirmModal 
//            title="Tüm Logları Temizle?" 
//            message="Dikkat! Tüm sistem hareket kayıtları kalıcı olarak silinecek. Bu işlem geri alınamaz."
//            isDanger={true}
//            onConfirm={handleClearLogs}
//            onCancel={() => setConfirmDelete(false)}
//         />
//       )}

//     </div>
//   );
// };

// export default AdminSystemLogs;