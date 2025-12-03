import { useState, useEffect } from "react";
import { userRequest } from "../../requestMethods";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import SecureImage from "../SecureImage";
import { FiEye, FiSearch, FiRefreshCw, FiFilter, FiX, FiMaximize, FiUser, FiShield, FiLock } from "react-icons/fi";
import UserActivityModal from "./UserActivityModal";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useCart();
  const userMe = JSON.parse(localStorage.getItem("user"));

  // --- YENİ: MODAL STATE ---
  const [selectedUserLog, setSelectedUserLog] = useState(null);

  // --- FİLTRELEME ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // --- MODAL STATE'LERİ ---
  const [viewUser, setViewUser] = useState(null); // Detay Modalı
  const [userStats, setUserStats] = useState(null); // İstatistik Verisi
  
  const [modalUser, setModalUser] = useState(null); // İşlem Modalı (Rol)
  const [newRole, setNewRole] = useState("customer");
  const [confirmData, setConfirmData] = useState(null); // Onay Modalı (Bloke)

  // KULLANICILARI ÇEK
  const fetchUsers = async () => {
    setLoading(true);
    try { 
      const res = await userRequest.get("/users"); 
      setUsers(res.data); 
    } catch (err) { 
      console.log(err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- DETAY GÖRÜNTÜLEME ---
  const handleViewDetails = async (user) => {
    setViewUser(user);
    setUserStats(null); // Yüklenene kadar boşalt

    try {
      let statsData = {};
      
      // Müşteri İstatistikleri
      if (user.role === 'customer') {
         const res = await userRequest.get(`/orders/find/${user._id}`);
         const totalSpent = res.data.reduce((acc, o) => acc + o.totalAmount, 0);
         statsData = { label: "Toplam Harcama", value: `£${totalSpent.toFixed(2)}`, countLabel: "Sipariş Sayısı", count: res.data.length };
      } 
      // Satıcı İstatistikleri
      else if (user.role === 'vendor') {
         const res = await userRequest.get(`/orders/vendor/${user._id}`);
         const totalSales = res.data.reduce((acc, o) => acc + o.totalAmount, 0);
         statsData = { label: "Toplam Ciro", value: `£${totalSales.toFixed(2)}`, countLabel: "Alınan Sipariş", count: res.data.length };
      }
      // Kurye İstatistikleri
      else if (user.role === 'courier') {
         // (Basitlik için tüm siparişleri çekip filtreliyoruz, performans için backend rotası yazılabilir)
         const res = await userRequest.get("/orders");
         const myDeliveries = res.data.filter(o => o.courierId === user._id && o.status === "Teslim Edildi");
         const earnings = myDeliveries.reduce((acc, o) => acc + (o.totalAmount * 0.10), 0); // %10 Pay
         statsData = { label: "Toplam Kazanç", value: `£${earnings.toFixed(2)}`, countLabel: "Teslimat Sayısı", count: myDeliveries.length };
      }

      setUserStats(statsData);
    } catch (err) { console.log(err); }
  };

  // --- İŞLEM ONAYLAMA (ROL / BLOKE) ---
  const handleConfirmAction = async () => {
    try {
      // Rol Değiştirme
      if (modalUser) { 
          await userRequest.put(`/users/${modalUser._id}/role`, { role: newRole }); 
          notify("Kullanıcı rolü güncellendi", "success"); 
      } 
      // Bloke Etme (ConfirmData üzerinden gelir)
      else {
          // Bu blok confirmData'nın action'ı içinde çağrılır, buraya düşmez.
      }
      setModalUser(null); 
      fetchUsers();
    } catch { notify("İşlem başarısız", "error"); }
  };

  const getDocUrl = (data) => data?.licenseImage || data?.documentImage;


  // Filtreleme Mantığı
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pt-2 animate-fade-in">
      
      {/* --- ÜST BAR --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 top-20 z-20">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          Kullanıcılar <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{filteredUsers.length}</span>
        </h2>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Filtre */}
          <div className="relative">
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="pl-9 pr-4 py-2 border rounded-lg w-full md:w-40 outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer">
              <option value="all">Tüm Roller</option>
              <option value="customer">Müşteriler</option>
              <option value="vendor">Satıcılar</option>
              <option value="courier">Kuryeler</option>
              <option value="admin">Yöneticiler</option>
            </select>
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Arama */}
          <div className="relative flex-1">
            <input type="text" placeholder="İsim veya E-posta..." className="pl-9 pr-4 py-2 border rounded-lg w-full outline-none focus:border-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Yenile */}
          <button onClick={fetchUsers} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-2 transition" disabled={loading}>
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> {loading ? "..." : "Yenile"}
          </button>
        </div>
      </div>
      
      {/* --- LİSTE --- */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr><th className="p-4">Kullanıcı</th><th className="p-4">Rol</th><th className="p-4">Durum</th><th className="p-4 text-right">İşlem</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((u) => (
              <tr key={u._id} className={`hover:bg-gray-50 ${u.isBlocked ? 'bg-red-50' : ''}`}>
                <td className="p-4">
                  <div className="font-bold text-gray-800 flex items-center gap-2">
                    {u.fullName} 
                    {u._id === userMe._id && <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded font-bold">BEN</span>}
                  </div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'vendor' ? 'bg-pink-100 text-pink-700' :
                    u.role === 'courier' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  {u.isBlocked 
                    ? <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded flex items-center gap-1 w-fit"><FiLock /> Engelli</span> 
                    : <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded flex items-center gap-1 w-fit"><FiShield /> Aktif</span>
                  }
                </td>
                <td className="p-4 text-right space-x-2">
                  {/* --- AKTİVİTE BUTONU (YENİ) --- */}
                  <button 
                    onClick={() => setSelectedUserLog(u)} // Modalı açar
                    className="text-indigo-500 hover:text-indigo-700 p-2 bg-indigo-50 rounded-lg transition hover:bg-indigo-100" 
                    title="Aktivite Geçmişi"
                  >
                    <FiActivity />
                  </button>

                  {/* Detay Butonu */}
                  <button onClick={() => handleViewDetails(u)} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 rounded-lg transition" title="Detayları Gör"><FiEye /></button>
                  
                  {/* İşlem Butonları (Kendine işlem yapamaz) */}
                  {u._id !== userMe._id && (
                    <>
                      {/* Rol Değiştir */}
                      <button onClick={() => { setModalUser(u); setNewRole(u.role); }} className="text-purple-500 hover:text-purple-700 p-2 bg-purple-50 rounded-lg transition" title="Rol Değiştir">
                        <FiUser />
                      </button>
                      
                      {/* Engelle/Aç */}
                      <button 
                        onClick={() => { 
                          setConfirmData({ 
                            isOpen: true, 
                            title: u.isBlocked ? "Engeli Kaldır?" : "Kullanıcıyı Engelle?", 
                            message: u.isBlocked ? "Kullanıcının erişimi tekrar açılacak." : "Kullanıcı sisteme giriş yapamayacak.", 
                            isDanger: !u.isBlocked, 
                            action: async () => { 
                                try { await userRequest.put(`/users/${u._id}/block`); notify("Durum güncellendi", "success"); fetchUsers(); } 
                                catch { notify("Hata", "error"); } 
                                setConfirmData(null); 
                            } 
                          }); 
                        }} 
                        className={`p-2 rounded-lg transition font-bold ${u.isBlocked ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}
                        title={u.isBlocked ? "Engeli Kaldır" : "Engelle"}
                      >
                        {u.isBlocked ? <FiShield /> : <FiLock />}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && !loading && <div className="p-8 text-center text-gray-400 italic">Kullanıcı bulunamadı.</div>}
      </div>

      {/* --- DETAY MODALI (DEV EKRAN) --- */}
      {viewUser && (
        <div className="fixed inset-0 z-[3000] flex justify-center items-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
              <div><h3 className="text-2xl font-bold text-gray-800">Kullanıcı Dosyası</h3><p className="text-sm text-blue-600 font-bold">{viewUser.fullName} ({viewUser.role.toUpperCase()})</p></div>
              <button onClick={() => setViewUser(null)} className="text-4xl text-gray-400 hover:text-red-600 transition"><FiX /></button>
            </div>

            {/* İçerik */}
            <div className="p-8 overflow-y-auto flex-1 bg-white">
                
                {/* İstatistikler (Varsa) */}
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
                    {/* Sol: Bilgiler */}
                    <div className="space-y-4 bg-white border rounded-xl p-5 h-fit">
                        <h4 className="font-bold text-gray-700 uppercase border-b pb-2 mb-2 flex items-center gap-2"><FiUser /> Hesap Bilgileri</h4>
                        <div className="flex justify-between text-sm py-1"><span className="text-gray-500">Email:</span> <span className="font-bold">{viewUser.email}</span></div>
                        <div className="flex justify-between text-sm py-1"><span className="text-gray-500">Kayıt:</span> <span className="font-bold">{new Date(viewUser.createdAt).toLocaleDateString()}</span></div>
                        <div className="flex justify-between text-sm py-1"><span className="text-gray-500">Durum:</span> <span className={`font-bold ${viewUser.isVerified ? "text-green-600":"text-red-500"}`}>{viewUser.isVerified ? "Onaylı" : "Onaysız"}</span></div>
                        
                        {/* Başvuru Detayları */}
                        {viewUser.applicationData && (
                           <div className="mt-6 pt-4 border-t">
                             <h4 className="font-bold text-gray-700 uppercase border-b pb-2 mb-2">İş / Başvuru Bilgileri</h4>
                             {Object.entries(viewUser.applicationData).map(([k, v]) => {
                                if (k === 'licenseImage' || k === 'documentImage' || k === 'requestedRole' || k === 'rejectionReason') return null;
                                return <div key={k} className="flex justify-between py-2 text-sm border-b border-gray-50 last:border-0"><span className="text-gray-500 uppercase text-xs font-bold">{k}:</span> <span className="font-medium text-right pl-2">{v}</span></div>
                             })}
                           </div>
                        )}
                    </div>

                    {/* Sağ: Belge Görseli */}
                    <div className="h-full flex flex-col">
                        <h4 className="font-bold text-gray-700 uppercase border-b pb-2 mb-4 flex items-center gap-2">📷 Resmi Belge</h4>
                        {getDocUrl(viewUser.applicationData) ? (
                            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 flex items-center justify-center group cursor-zoom-in hover:border-blue-400 transition relative min-h-[300px]" onClick={() => window.open(getDocUrl(viewUser.applicationData), '_blank')}>
                                <SecureImage src={getDocUrl(viewUser.applicationData)} className="max-h-80 max-w-full object-contain rounded shadow-sm" alt="Belge" />
                                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded pointer-events-none flex items-center gap-1"><FiMaximize /> Büyüt</div>
                            </div>
                        ) : <div className="text-center py-20 bg-gray-50 rounded-xl text-gray-400 border border-dashed text-lg">Belge Yüklenmemiş</div>}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Rol Değiştirme Modalı */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">Rol Değiştir: {modalUser.fullName}</h3>
            <select value={newRole} onChange={e=>setNewRole(e.target.value)} className="w-full p-3 border rounded-lg mb-6 bg-white outline-none focus:border-blue-500">
                <option value="customer">Müşteri</option>
                <option value="vendor">Satıcı (Dükkan)</option>
                <option value="courier">Kurye</option>
                <option value="admin">Yönetici</option>
            </select>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setModalUser(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-bold text-gray-600">İptal</button>
              <button onClick={handleConfirmAction} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Onay Modalı */}
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
        {/* --- YENİ AKTİVİTE MODALI --- */}
      {selectedUserLog && (
        <UserActivityModal 
          user={selectedUserLog} 
          onClose={() => setSelectedUserLog(null)} 
        />
      )}
    </div>
  );
};

export default AdminUsers;