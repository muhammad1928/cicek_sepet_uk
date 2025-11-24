import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import InvoiceModal from "../components/InvoiceModal";
import ConfirmModal from "../components/ConfirmModal";

// Sabit Kategoriler
const CATEGORIES = ["Tümü", "Doğum Günü", "Yıldönümü", "İç Mekan", "Yenilebilir Çiçek", "Tasarım Çiçek"];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  // Güvenlik Kontrolü
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans pt-20">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 fixed h-full top-20 left-0 overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="p-6 text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent border-b border-slate-800">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} label="📊 Genel Bakış" />
          <SidebarButton active={activeTab === "applications"} onClick={() => setActiveTab("applications")} label="📝 Başvurular" />
          <SidebarButton active={activeTab === "users"} onClick={() => setActiveTab("users")} label="👥 Kullanıcılar" />
          <SidebarButton active={activeTab === "products"} onClick={() => setActiveTab("products")} label="📦 Ürün Yönetimi" />
          <SidebarButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")} label="🚚 Siparişler" />
          <SidebarButton active={activeTab === "coupons"} onClick={() => setActiveTab("coupons")} label="🎟️ Kuponlar" />
          <SidebarButton active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} label="💬 Yorumlar" />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white py-2 rounded text-sm font-bold transition border border-red-600/20">
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* --- İÇERİK --- */}
      <main className="flex-1 p-8 ml-64">
        {activeTab === "dashboard" && <DashboardStats />}
        {activeTab === "applications" && <ApplicationManager />}
        {activeTab === "users" && <UserManager />}
        {activeTab === "products" && <ProductManager />}
        {activeTab === "orders" && <OrderManager />}
        {activeTab === "coupons" && <CouponManager />}
        {activeTab === "reviews" && <ReviewManager />}
      </main>
    </div>
  );
};

const SidebarButton = ({ active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${active ? "bg-pink-600 text-white shadow-lg shadow-pink-500/30" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}
  >
    {label}
  </button>
);

// 1. DASHBOARD
const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stats");
        setStats(res.data);
      } catch (err) { console.log(err); }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="text-center mt-20 text-gray-500 font-bold">Veriler yükleniyor...</div>;
  const statusCounts = {};
  stats.orderStatusStats.forEach(item => { statusCounts[item._id] = item.count; });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Genel Bakış</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="💷" title="Toplam Ciro" value={`£${stats.totalRevenue}`} color="green" />
        <StatCard icon="📦" title="Toplam Sipariş" value={stats.totalOrders} color="blue" />
        <StatCard icon="🌸" title="Aktif Ürün" value={stats.totalProducts} color="pink" />
        <StatCard icon="👥" title="Kayıtlı Üye" value={stats.totalUsers} color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-6">Sipariş Durumları</h3>
          <div className="space-y-4">
            {['Sipariş Alındı', 'Hazırlanıyor', 'Yola Çıktı', 'Teslim Edildi', 'İptal'].map(s => (
              <Statusbar key={s} label={s} count={statusCounts[s] || 0} total={stats.totalOrders} color={s === 'Teslim Edildi' ? 'bg-green-500' : s === 'İptal' ? 'bg-red-500' : 'bg-blue-500'} />
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Son Siparişler</h3>
          <div className="space-y-3">
            {stats.recentOrders.map(order => (
              <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <div className="font-bold text-sm text-gray-800">{order.customerInfo?.name || "Misafir"}</div>
                  <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-pink-600 text-sm">£{order.totalAmount}</div>
                  <span className="text-[10px] px-2 py-0.5 bg-white border rounded text-gray-500">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
const StatCard = ({ icon, title, value, color }) => (<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4"><div className={`w-12 h-12 bg-${color}-100 text-${color}-600 rounded-full flex items-center justify-center text-2xl`}>{icon}</div><div><div className="text-xs text-gray-500 font-bold uppercase tracking-wide">{title}</div><div className="text-2xl font-extrabold text-gray-800">{value}</div></div></div>);
const Statusbar = ({ label, count, total, color }) => { const percentage = total > 0 ? Math.round((count / total) * 100) : 0; return (<div><div className="flex justify-between text-xs font-bold text-gray-600 mb-1"><span>{label}</span><span>{count} ({percentage}%)</span></div><div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div></div></div>); };

// 2. BAŞVURU YÖNETİMİ
const ApplicationManager = () => {
  const [applicants, setApplicants] = useState([]);
  const [confirmData, setConfirmData] = useState(null);
  const { notify } = useCart();

  const fetchApplicants = async () => { try { const res = await axios.get("http://localhost:5000/api/users"); setApplicants(res.data.filter(u => u.applicationStatus === 'pending')); } catch (err) { console.log(err); } };
  useEffect(() => { fetchApplicants(); }, []);

  const handleDecisionRequest = (userId, status) => {
    setConfirmData({
      isOpen: true, title: status === 'approved' ? "Başvuruyu Onayla?" : "Başvuruyu Reddet?", message: "Bu işlemi onaylıyor musunuz?", isDanger: status === 'rejected',
      action: async () => { try { await axios.put(`http://localhost:5000/api/users/${userId}/application-status`, { status }); notify(`İşlem Tamam: ${status}`, "success"); fetchApplicants(); } catch { notify("Hata", "error"); } setConfirmData(null); }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200"><h2 className="text-2xl font-bold text-gray-800">Bekleyen Başvurular <span className="ml-2 text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{applicants.length}</span></h2><button onClick={fetchApplicants} className="text-blue-600 hover:underline text-sm font-bold">🔄 Yenile</button></div>
      {applicants.length === 0 ? <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">Başvuru yok.</div> : 
        <div className="grid gap-6">{applicants.map(app => (<div key={app._id} className="bg-white rounded-xl shadow-md border-l-4 border-l-orange-400 overflow-hidden p-6"><div className="flex justify-between items-start mb-4 border-b pb-2"><div><h3 className="text-xl font-bold text-gray-800">{app.username}</h3><p className="text-sm text-gray-500">{app.email}</p></div><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase text-white ${app.role === 'vendor' ? 'bg-purple-500' : 'bg-blue-500'}`}>{app.role}</span></div><div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm mb-6">{app.applicationData && Object.entries(app.applicationData).map(([key, value]) => (<div key={key} className="flex flex-col"><span className="font-bold text-gray-400 uppercase text-xs">{key}</span><span className="font-medium text-gray-800">{value}</span></div>))}</div><div className="flex gap-4 justify-end"><button onClick={() => handleDecisionRequest(app._id, 'rejected')} className="px-6 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50">Reddet</button><button onClick={() => handleDecisionRequest(app._id, 'approved')} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg">Onayla</button></div></div>))}</div>
      }
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

// 3. KULLANICI YÖNETİMİ
const UserManager = () => {
  const [users, setUsers] = useState([]);
  const { notify } = useCart();
  const userMe = JSON.parse(localStorage.getItem("user"));
  const [confirmData, setConfirmData] = useState(null);
  const [modalUser, setModalUser] = useState(null);
  const [actionType, setActionType] = useState(null); 
  const [newRole, setNewRole] = useState("customer");
  const [newPass, setNewPass] = useState("");

  const fetchUsers = async () => { try { const res = await axios.get("http://localhost:5000/api/users"); setUsers(res.data); } catch (err) { console.log(err); } };
  useEffect(() => { fetchUsers(); }, []);

  const handleConfirmAction = async () => {
    try {
      if (actionType === 'role') {
        await axios.put(`http://localhost:5000/api/users/${modalUser._id}/role`, { role: newRole }); notify("Rol güncellendi", "success");
      } else if (actionType === 'block') {
        await axios.put(`http://localhost:5000/api/users/${modalUser._id}/block`); notify("Durum değişti", "success");
      } else if (actionType === 'password') {
        await axios.put(`http://localhost:5000/api/users/${modalUser._id}/admin-reset-password`, { newPassword: newPass }); notify("Şifre değişti", "success");
      }
      setModalUser(null); fetchUsers();
    } catch { notify("Hata", "error"); }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200"><h2 className="text-2xl font-bold text-gray-800">Kullanıcılar ({users.length})</h2><button onClick={fetchUsers} className="text-blue-600 hover:underline font-bold">Yenile</button></div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse"><thead className="bg-gray-50 text-gray-600 uppercase text-xs"><tr><th className="p-4">Kullanıcı</th><th className="p-4">Rol</th><th className="p-4">Durum</th><th className="p-4 text-right">İşlem</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{users.map(u => (<tr key={u._id} className={`hover:bg-gray-50 ${u.isBlocked ? 'bg-red-50' : ''}`}><td className="p-4"><div className="font-bold text-gray-800">{u.username} {u._id === userMe._id && <span className="text-[10px] bg-purple-100 px-1 rounded">BEN</span>}</div><div className="text-xs text-gray-500">{u.email}</div></td><td className="p-4"><span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded">{u.role}</span></td><td className="p-4">{u.isBlocked ? <span className="text-xs text-red-600 font-bold">Engelli</span> : <span className="text-xs text-green-600 font-bold">Aktif</span>}</td><td className="p-4 text-right space-x-2">{u._id !== userMe._id && (<><button onClick={() => { setModalUser(u); setActionType('password'); }} className="text-gray-500 hover:text-blue-600" title="Şifre">🔑</button><button onClick={() => { setModalUser(u); setActionType('role'); setNewRole(u.role); }} className="text-gray-500 hover:text-purple-600" title="Rol">👮‍♂️</button><button onClick={() => { setConfirmData({ isOpen: true, title: u.isBlocked ? "Engeli Kaldır?" : "Engelle?", message: "Emin misiniz?", isDanger: !u.isBlocked, action: async () => { setModalUser(u); setActionType('block'); handleConfirmAction(); setConfirmData(null); } }); }} className={`text-xs font-bold px-2 py-1 rounded border ${u.isBlocked ? 'border-green-500 text-green-600' : 'border-red-300 text-red-500'}`}>{u.isBlocked ? "Aç" : "Bloke"}</button></>)}</td></tr>))}</tbody></table>
      </div>
      {/* İç Modal (Rol ve Şifre İçin) */}
      {modalUser && actionType !== 'block' && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"><div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center"><h3 className="text-lg font-bold mb-4">{actionType === 'role' ? "Rol Değiştir" : "Şifre Sıfırla"}</h3>{actionType === 'role' ? (<select value={newRole} onChange={e=>setNewRole(e.target.value)} className="w-full p-2 border rounded mb-4"><option value="customer">Müşteri</option><option value="vendor">Dükkan</option><option value="courier">Kurye</option><option value="admin">Yönetici</option></select>) : (<input type="text" placeholder="Yeni Şifre" className="w-full p-2 border rounded mb-4 font-mono text-center" value={newPass} onChange={e=>setNewPass(e.target.value)} />)}<div className="flex gap-3 justify-center"><button onClick={() => setModalUser(null)} className="px-4 py-2 border rounded hover:bg-gray-50">İptal</button><button onClick={handleConfirmAction} className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Onayla</button></div></div></div>)}
      {/* Onay Modalı (Bloke İçin) */}
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

// 4. ÜRÜN YÖNETİMİ
const ProductManager = () => {
  const { notify } = useCart();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const initialForm = { title: "", price: "", desc: "", img: "", stock: 10, isActive: true, category: "Doğum Günü" };
  const [formData, setFormData] = useState(initialForm);
  
  const fetchProducts = async () => { try { const res = await axios.get("http://localhost:5000/api/products"); setProducts(res.data); } catch (err) { console.log(err); } };
  useEffect(() => { fetchProducts(); }, []);
  const handleChange = (e) => { const value = e.target.type === "checkbox" ? e.target.checked : e.target.value; setFormData({ ...formData, [e.target.name]: value }); };
  const handleUpload = async (e) => { const file = e.target.files[0]; if (!file) return; setUploading(true); const data = new FormData(); data.append("file", file); try { const res = await axios.post("http://localhost:5000/api/upload", data); setFormData((prev) => ({ ...prev, img: res.data })); notify("Yüklendi!", "success"); } catch { notify("Hata", "error"); } finally { setUploading(false); } };
  const handleSubmit = async (e) => { e.preventDefault(); try { if (editMode) await axios.put(`http://localhost:5000/api/products/${editMode}`, formData); else await axios.post("http://localhost:5000/api/products", formData); notify("Başarılı", "success"); setFormData(initialForm); setShowForm(false); setEditMode(null); fetchProducts(); } catch { notify("Hata", "error"); } };
  const handleEditClick = (p) => { setFormData({ ...p, category: p.category || "Doğum Günü" }); setEditMode(p._id); setShowForm(true); window.scrollTo(0,0); };
  
  const handleDeleteRequest = (id) => {
    setConfirmData({ isOpen: true, title: "Silinsin mi?", message: "Ürün kalıcı olarak silinecek.", isDanger: true,
      action: async () => { try { await axios.delete(`http://localhost:5000/api/products/${id}`); notify("Silindi", "success"); fetchProducts(); } catch { notify("Hata", "error"); } setConfirmData(null); }
    });
  };
  const filtered = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-20 z-20"><h2 className="text-xl font-bold">Ürünler ({products.length})</h2><div className="flex gap-3"><input placeholder="Ara..." className="px-4 py-2 border rounded-lg" onChange={e=>setSearchTerm(e.target.value)} /><button onClick={()=>{setShowForm(!showForm);setEditMode(null);}} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">{showForm?"Kapat":"+ Ekle"}</button></div></div>
      {showForm && <div className="bg-white p-6 rounded-xl shadow mb-6"><form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4"><input name="title" value={formData.title} onChange={handleChange} placeholder="Ad" className="p-2 border rounded" /><div className="flex gap-2"><input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Fiyat" className="p-2 border rounded w-full" /><input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Stok" className="p-2 border rounded w-full" /></div><select name="category" value={formData.category} onChange={handleChange} className="p-2 border rounded bg-white">{CATEGORIES.filter(c=>c!=="Tümü").map(c=><option key={c}>{c}</option>)}</select><div className="flex gap-2 border p-2 rounded"><label className="cursor-pointer font-bold text-gray-600">{uploading?"...":"📷"}<input type="file" className="hidden" onChange={handleUpload}/></label><input name="img" value={formData.img} onChange={handleChange} placeholder="URL" className="flex-1 outline-none text-xs" /></div><textarea name="desc" value={formData.desc} onChange={handleChange} placeholder="Açıklama" className="p-2 border rounded col-span-2 h-20" /><div className="col-span-2 flex gap-2"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} /><label>Satışta mı?</label></div><button className="bg-blue-600 text-white p-2 rounded col-span-2">Kaydet</button></form></div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{filtered.map(p=>(<div key={p._id} className={`bg-white border rounded-xl overflow-hidden group hover:shadow-md ${p.stock<=0?'border-red-300':''}`}><div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">{!p.isActive && <span className="bg-gray-800 text-white text-[10px] px-2 rounded">Pasif</span>}{p.stock<=0 && <span className="bg-red-600 text-white text-[10px] px-2 rounded">Tükendi</span>}</div><div className="h-40 bg-gray-100 relative"><img src={p.img} className="w-full h-full object-cover" /></div><div className="p-3"><div className="font-bold truncate">{p.title}</div><div className="flex justify-between mt-2 text-sm"><span className="font-bold text-pink-600">£{p.price}</span><span className="text-xs text-gray-500">STOK: <QuickStockUpdate product={p} refresh={fetchProducts} /></span></div><div className="grid grid-cols-2 gap-2 mt-3"><button onClick={()=>handleEditClick(p)} className="bg-blue-50 text-blue-600 text-xs py-1 rounded font-bold">Düzenle</button><button onClick={()=>handleDeleteRequest(p._id)} className="bg-red-50 text-red-500 text-xs py-1 rounded font-bold">Sil</button></div></div></div>))}</div>
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={()=>setConfirmData(null)} />}
    </div>
  );
};

// 5. SİPARİŞ YÖNETİMİ
const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { notify } = useCart();
  const fetchOrders = async () => { setLoading(true); try { const res = await axios.get("http://localhost:5000/api/orders"); setOrders(res.data); } catch(e){} finally { setTimeout(()=>setLoading(false), 500); } };
  useEffect(() => { fetchOrders(); }, []);
  const handleStatusChange = async (id, st) => { try { await axios.put(`http://localhost:5000/api/orders/${id}`, { status: st }); notify("Güncellendi", "success"); setOrders(prev => prev.map(o => o._id === id ? { ...o, status: st } : o)); } catch(e){ notify("Hata", "error"); } };
  const getStatusStyle = (s) => { if(s==="Teslim Edildi") return "bg-green-100 text-green-700 border-l-green-500"; return "bg-blue-100 text-blue-700 border-l-blue-500"; };
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200"><h2 className="text-2xl font-bold text-gray-800">Siparişler ({orders.length})</h2><button onClick={fetchOrders} disabled={loading} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">{loading ? "..." : "Yenile"}</button></div>
      <div className="space-y-4">{orders.map(o => (<div key={o._id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition border-l-4 ${getStatusStyle(o.status)} p-4 flex flex-col md:flex-row gap-4`}><div className="min-w-[200px]"><div className="text-xs text-gray-400">#{o._id.slice(-6)}</div><div className="font-bold text-gray-800">{o.recipient.name}</div><div className="text-xs text-gray-500 mt-1">📞 {o.recipient.phone}</div><div className="text-xs text-gray-500 mt-1 bg-gray-50 p-1 rounded inline-block">Teslimat: <b>{new Date(o.delivery.date).toLocaleDateString()}</b></div></div><div className="flex-1 space-y-2 border-l pl-4 border-gray-100"><div className="text-xs text-gray-500 line-clamp-1">📍 {o.recipient.address}</div><div className="flex gap-2 overflow-x-auto pt-2">{o.items.map((i,k)=>(<div key={k} className="relative flex-shrink-0 group"><img src={i.img} className="w-8 h-8 rounded border object-cover" /><span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white shadow">{i.quantity}</span></div>))}</div></div><div className="flex flex-col items-end justify-between gap-2 min-w-[140px] border-t md:border-t-0 pt-2 md:pt-0 md:pl-4 md:border-l border-gray-100"><span className="text-xl font-extrabold text-pink-600">£{o.totalAmount}</span><div className="flex gap-2 w-full"><button onClick={()=>setSelectedInvoice(o)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">🖨️</button><select value={o.status} onChange={(e)=>handleStatusChange(o._id, e.target.value)} className="flex-1 text-xs border rounded"><option>Sipariş Alındı</option><option>Hazırlanıyor</option><option>Yola Çıktı</option><option>Teslim Edildi</option><option>İptal</option></select></div></div></div>))}</div>
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
    </div>
  );
};

// 6. KUPON YÖNETİMİ
const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({ code: "", discountRate: "", expiryDate: "" });
  const [confirmData, setConfirmData] = useState(null);
  const { notify } = useCart();
  const fetchCoupons = async () => { try { const res = await axios.get("http://localhost:5000/api/coupons"); setCoupons(res.data); } catch(e){} };
  useEffect(() => { fetchCoupons(); }, []);
  const handleSubmit = async (e) => { e.preventDefault(); try { await axios.post("http://localhost:5000/api/coupons", { code: formData.code.toUpperCase(), discountRate: Number(formData.discountRate), expiryDate: formData.expiryDate }); notify("Eklendi", "success"); setFormData({ code: "", discountRate: "", expiryDate: "" }); fetchCoupons(); } catch(e) { notify("Hata", "error"); } };
  const handleDeleteRequest = (id) => { setConfirmData({ isOpen: true, title: "Silinsin mi?", message: "Kupon silinecek.", isDanger: true, action: async () => { try { await axios.delete(`http://localhost:5000/api/coupons/${id}`); notify("Silindi", "success"); fetchCoupons(); } catch { notify("Hata", "error"); } setConfirmData(null); } }); };
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="font-bold mb-4">Yeni Kupon</h3><form onSubmit={handleSubmit} className="flex gap-4 items-end"><input value={formData.code} onChange={e=>setFormData({...formData, code:e.target.value.toUpperCase()})} placeholder="KOD" className="flex-1 border p-2 rounded" /><input value={formData.discountRate} onChange={e=>setFormData({...formData, discountRate:e.target.value})} type="number" placeholder="%" className="w-20 border p-2 rounded" /><input type="date" value={formData.expiryDate} onChange={e=>setFormData({...formData, expiryDate:e.target.value})} className="border p-2 rounded" /><button className="bg-green-600 text-white px-4 rounded">Ekle</button></form></div>
      <div className="grid grid-cols-3 gap-4">{coupons.map(c=>(<div key={c._id} className="bg-white p-4 border rounded flex justify-between"><div><div className="font-bold">{c.code}</div><div className="text-sm text-green-600">%{c.discountRate}</div></div><button onClick={()=>handleDeleteRequest(c._id)} className="text-red-500">🗑️</button></div>))}</div>
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={()=>setConfirmData(null)} />}
    </div>
  );
};

// 7. YORUM YÖNETİMİ
const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [confirmData, setConfirmData] = useState(null);
  const { notify } = useCart();
  const fetchReviews = async () => { try { const res = await axios.get("http://localhost:5000/api/products"); let arr=[]; res.data.forEach(p=>p.reviews.forEach(r=>arr.push({...r, pid:p._id}))); setReviews(arr); } catch(e){} };
  useEffect(() => { fetchReviews(); }, []);
  const handleDeleteRequest = (pid, rid) => { setConfirmData({ isOpen: true, title: "Silinsin mi?", message: "Yorum silinecek.", isDanger: true, action: async () => { try { await axios.delete(`http://localhost:5000/api/products/${pid}/reviews/${rid}`); notify("Silindi", "success"); fetchReviews(); } catch { notify("Hata", "error"); } setConfirmData(null); } }); };
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex justify-between bg-white p-4 rounded border"><h2 className="font-bold">Yorumlar</h2><button onClick={fetchReviews} className="text-blue-600 text-sm font-bold">Yenile</button></div>
      <div className="grid gap-4">{reviews.map(r=>(<div key={r._id} className="bg-white p-4 rounded border flex gap-4 items-start"><div className="flex-1"><div className="font-bold text-sm">{r.user}</div><p className="text-gray-600 text-sm italic">"{r.comment}"</p></div><button onClick={()=>handleDeleteRequest(r.pid, r._id)} className="text-red-400 hover:text-red-600">🗑️</button></div>))}</div>
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={()=>setConfirmData(null)} />}
    </div>
  );
};

// Hızlı Stok
const QuickStockUpdate = ({ product, refresh }) => {
  const [stock, setStock] = useState(product.stock);
  const [loading, setLoading] = useState(false);
  const { notify } = useCart();
  const handleUpdate = async () => { if (Number(stock) === product.stock) return; setLoading(true); try { await axios.put(`http://localhost:5000/api/products/${product._id}`, { ...product, stock: Number(stock) }); notify("Güncellendi", "success"); refresh(); } catch(e){ notify("Hata", "error"); } finally { setLoading(false); } };
  return (<div className="flex items-center gap-1"><input type="number" value={stock} onChange={e=>setStock(e.target.value)} className="w-10 p-1 border rounded text-center text-xs" /><button onClick={handleUpdate} disabled={loading} className="text-xs bg-gray-100 px-2 py-1 rounded">{loading?"..":"✓"}</button></div>);
};

export default AdminPage;