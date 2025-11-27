import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import SecureImage from "../SecureImage";
import { FiEye, FiX, FiMaximize } from "react-icons/fi";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { notify } = useCart();
  const userMe = JSON.parse(localStorage.getItem("user"));

  // State'ler
  const [viewUser, setViewUser] = useState(null); // Detay Modalı
  const [userStats, setUserStats] = useState(null); // Seçilen kullanıcının istatistikleri
  
  const [modalUser, setModalUser] = useState(null); // İşlem Modalı
  const [actionType, setActionType] = useState(null); 
  const [newRole, setNewRole] = useState("customer");
  const [confirmData, setConfirmData] = useState(null);

  const fetchUsers = async () => {
    try { const res = await axios.get("http://localhost:5000/api/users"); setUsers(res.data); } catch (err) { console.log(err); }
  };
  useEffect(() => { fetchUsers(); }, []);

  // --- KULLANICI DETAYLARINI VE GEÇMİŞİNİ ÇEKME ---
  const handleViewDetails = async (user) => {
    setViewUser(user);
    setUserStats(null); // Önceki veriyi temizle

    try {
      let statsData = {};
      
      // Role göre veri çek
      if (user.role === 'customer') {
         const res = await axios.get(`http://localhost:5000/api/orders/find/${user._id}`);
         const totalSpent = res.data.reduce((acc, o) => acc + o.totalAmount, 0);
         statsData = { label: "Toplam Harcama", value: `£${totalSpent.toFixed(2)}`, countLabel: "Sipariş Sayısı", count: res.data.length };
      } 
      else if (user.role === 'vendor') {
         const res = await axios.get(`http://localhost:5000/api/orders/vendor/${user._id}`);
         const totalSales = res.data.reduce((acc, o) => acc + o.totalAmount, 0);
         statsData = { label: "Toplam Ciro", value: `£${totalSales.toFixed(2)}`, countLabel: "Alınan Sipariş", count: res.data.length };
      }
      else if (user.role === 'courier') {
         // Kurye için tüm siparişleri çekip filtreliyoruz (veya özel rota yazılabilir)
         const res = await axios.get("http://localhost:5000/api/orders");
         const myDeliveries = res.data.filter(o => o.courierId === user._id && o.status === "Teslim Edildi");
         const earnings = myDeliveries.reduce((acc, o) => acc + (o.totalAmount * 0.10), 0); // %10 Kazanç varsayımı
         statsData = { label: "Toplam Kazanç", value: `£${earnings.toFixed(2)}`, countLabel: "Teslimat Sayısı", count: myDeliveries.length };
      }

      setUserStats(statsData);
    } catch (err) {
      console.log(err);
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (actionType === 'role') { await axios.put(`http://localhost:5000/api/users/${modalUser._id}/role`, { role: newRole }); notify("Rol güncellendi", "success"); } 
      else if (actionType === 'block') { await axios.put(`http://localhost:5000/api/users/${modalUser._id}/block`); notify("Durum değişti", "success"); } 
      setModalUser(null); fetchUsers();
    } catch { notify("Hata", "error"); }
  };

  const getDocUrl = (data) => data?.licenseImage || data?.documentImage;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200"><h2 className="text-2xl font-bold text-gray-800">Kullanıcılar ({users.length})</h2><button onClick={fetchUsers} className="text-blue-600 hover:underline font-bold">Yenile</button></div>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600"><tr><th className="p-4">Kullanıcı</th><th className="p-4">Rol</th><th className="p-4">Durum</th><th className="p-4 text-right">İşlem</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u._id} className={`hover:bg-gray-50 ${u.isBlocked ? 'bg-red-50' : ''}`}>
                <td className="p-4"><div className="font-bold text-gray-800">{u.fullName} {u._id === userMe._id && <span className="text-[10px] bg-purple-100 px-1 rounded">BEN</span>}</div><div className="text-xs text-gray-500">{u.email}</div></td>
                <td className="p-4"><span className={`text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded`}>{u.role}</span></td>
                <td className="p-4">{u.isBlocked ? <span className="text-red-600 font-bold text-xs">Engelli</span> : <span className="text-green-600 font-bold text-xs">Aktif</span>}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleViewDetails(u)} className="text-blue-500 hover:text-blue-700 p-1 text-lg" title="Detayları Gör"><FiEye /></button>
                  {u._id !== userMe._id && (<><button onClick={() => { setModalUser(u); setActionType('role'); setNewRole(u.role); }} className="text-gray-500 hover:text-purple-600 p-1" title="Rol Değiştir">👮‍♂️</button><button onClick={() => { setConfirmData({ isOpen: true, title: u.isBlocked ? "Engeli Kaldır?" : "Engelle?", message: "Emin misiniz?", isDanger: !u.isBlocked, action: async () => { setModalUser(u); setActionType('block'); handleConfirmAction(); setConfirmData(null); } }); }} className={`text-xs font-bold px-2 py-1 rounded border ${u.isBlocked ? 'border-green-500 text-green-600' : 'border-red-300 text-red-500'}`}>{u.isBlocked ? "Aç" : "Bloke"}</button></>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- SÜPER DETAY MODALI --- */}
      {viewUser && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0">
                <div><h3 className="text-2xl font-bold text-gray-800">Kullanıcı Dosyası</h3><p className="text-sm text-blue-600 font-bold">{viewUser.fullName} ({viewUser.role.toUpperCase()})</p></div>
                <button onClick={() => setViewUser(null)} className="text-4xl text-gray-400 hover:text-red-600 transition"><FiX /></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
                
                {/* İstatistikler Kartı */}
                {userStats && (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-center">
                       <p className="text-xs font-bold text-blue-400 uppercase">{userStats.label}</p>
                       <p className="text-3xl font-extrabold text-blue-800">{userStats.value}</p>
                    </div>
                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 text-center">
                       <p className="text-xs font-bold text-purple-400 uppercase">{userStats.countLabel}</p>
                       <p className="text-3xl font-extrabold text-purple-800">{userStats.count}</p>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Kişisel Bilgiler */}
                    <div className="space-y-4 bg-white border rounded-xl p-5 h-fit">
                        <h4 className="font-bold text-gray-700 uppercase border-b pb-2 mb-2">Temel Bilgiler</h4>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Email:</span> <span className="font-bold">{viewUser.email}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Kayıt Tarihi:</span> <span className="font-bold">{new Date(viewUser.createdAt).toLocaleDateString()}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Onay Durumu:</span> <span className={`font-bold ${viewUser.isVerified ? "text-green-600":"text-red-500"}`}>{viewUser.isVerified ? "Onaylı" : "Onaysız"}</span></div>
                        
                        {/* Başvuru Detayları */}
                        {viewUser.applicationData && (
                           <div className="mt-4 pt-4 border-t">
                             <h4 className="font-bold text-gray-700 uppercase border-b pb-2 mb-2">İş / Başvuru Bilgileri</h4>
                             {Object.entries(viewUser.applicationData).map(([k, v]) => {
                                if (k === 'licenseImage' || k === 'documentImage' || k === 'requestedRole') return null;
                                return <div key={k} className="flex justify-between py-1 text-sm"><span className="text-gray-500 uppercase text-xs">{k}</span><span className="font-medium">{v}</span></div>
                             })}
                           </div>
                        )}
                    </div>

                    {/* Belge Görseli */}
                    <div className="h-full flex flex-col">
                        <h4 className="font-bold text-gray-700 uppercase border-b pb-2 mb-4">Resmi Belge / Ehliyet</h4>
                        {getDocUrl(viewUser.applicationData) ? (
                            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 flex items-center justify-center group cursor-zoom-in hover:border-blue-400 transition relative min-h-[300px]" onClick={() => window.open(getDocUrl(viewUser.applicationData), '_blank')}>
                                <SecureImage src={getDocUrl(viewUser.applicationData)} className="max-h-80 max-w-full object-contain rounded shadow" alt="Belge" />
                                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1 pointer-events-none"><FiMaximize /> Tıkla</div>
                            </div>
                        ) : <div className="text-center py-20 bg-gray-50 rounded-xl text-gray-400 border border-dashed">Belge Yok</div>}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* İşlem Modalları (Rol Değiştirme vs.) */}
      {modalUser && actionType !== 'block' && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"><div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center"><h3 className="text-lg font-bold mb-4">Rol Değiştir</h3><select value={newRole} onChange={e=>setNewRole(e.target.value)} className="w-full p-2 border rounded mb-4"><option value="customer">Müşteri</option><option value="vendor">Dükkan</option><option value="courier">Kurye</option><option value="admin">Yönetici</option></select><div className="flex gap-3 justify-center"><button onClick={() => setModalUser(null)} className="px-4 py-2 border rounded hover:bg-gray-50">İptal</button><button onClick={handleConfirmAction} className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Onayla</button></div></div></div>)}
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

export default AdminUsers;