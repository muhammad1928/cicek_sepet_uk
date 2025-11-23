import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import InvoiceModal from "../components/InvoiceModal";

// Sabit Kategoriler
const CATEGORIES = ["Tümü", "Doğum Günü", "Yıldönümü", "İç Mekan", "Yenilebilir Çiçek", "Tasarım Çiçek"];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

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
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 fixed h-full top-20 left-0 overflow-y-auto pb-20">
        <div className="p-6 text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent border-b border-slate-800">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab("dashboard")} className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${activeTab === "dashboard" ? "bg-pink-600 text-white shadow-lg shadow-pink-500/30" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}>📊 Genel Bakış</button>
          <button onClick={() => setActiveTab("products")} className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${activeTab === "products" ? "bg-pink-600 text-white shadow-lg shadow-pink-500/30" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}>📦 Ürün Yönetimi</button>
          <button onClick={() => setActiveTab("orders")} className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${activeTab === "orders" ? "bg-pink-600 text-white shadow-lg shadow-pink-500/30" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}>🚚 Siparişler</button>
          <button onClick={() => setActiveTab("coupons")} className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${activeTab === "coupons" ? "bg-pink-600 text-white shadow-lg shadow-pink-500/30" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}>🎟️ Kuponlar</button>
          <button onClick={() => setActiveTab("reviews")} className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${activeTab === "reviews" ? "bg-pink-600 text-white shadow-lg shadow-pink-500/30" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}>💬 Yorumlar</button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white py-2 rounded text-sm font-bold transition border border-red-600/20">Çıkış Yap</button>
        </div>
      </aside>

      {/* --- İÇERİK --- */}
      <main className="flex-1 p-8 ml-64">
        {activeTab === "dashboard" && <DashboardStats />}
        {activeTab === "products" && <ProductManager />}
        {activeTab === "orders" && <OrderManager />}
        {activeTab === "coupons" && <CouponManager />}
        {activeTab === "reviews" && <ReviewManager />}
      </main>
    </div>
  );
};

// --- 1. DASHBOARD (İSTATİSTİKLER) ---
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

  if (!stats) return <div className="text-center mt-20 text-gray-500">Veriler yükleniyor...</div>;
  
  const statusCounts = {};
  stats.orderStatusStats.forEach(item => { statusCounts[item._id] = item.count; });

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
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
            {['Sipariş Alındı', 'Hazırlanıyor', 'Yola Çıktı', 'Teslim Edildi', 'İptal'].map(s => <Statusbar key={s} label={s} count={statusCounts[s]||0} total={stats.totalOrders} color={s==='İptal'?'bg-red-500':s==='Teslim Edildi'?'bg-green-500':'bg-blue-500'} />)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Son Siparişler</h3>
          <div className="space-y-3">{stats.recentOrders.map(order => ( <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"><div><div className="font-bold text-sm text-gray-800">{order.customerInfo?.name || "Misafir"}</div><div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div></div><div className="text-right"><div className="font-bold text-pink-600 text-sm">£{order.totalAmount}</div><span className="text-[10px] px-2 py-0.5 bg-white border rounded text-gray-500">{order.status}</span></div></div> ))}</div>
        </div>
      </div>
    </div>
  );
};
const StatCard = ({icon, title, value, color}) => (<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4"><div className={`w-12 h-12 bg-${color}-100 text-${color}-600 rounded-full flex items-center justify-center text-2xl`}>{icon}</div><div><div className="text-sm text-gray-500 font-bold uppercase">{title}</div><div className="text-2xl font-extrabold text-gray-800">{value}</div></div></div>);
const Statusbar = ({ label, count, total, color }) => { const percentage = total > 0 ? Math.round((count / total) * 100) : 0; return (<div><div className="flex justify-between text-xs font-bold text-gray-600 mb-1"><span>{label}</span><span>{count} ({percentage}%)</span></div><div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div></div></div>); };

// --- 2. ÜRÜN YÖNETİMİ ---
const ProductManager = () => {
  const { notify } = useCart();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [uploading, setUploading] = useState(false);

  const initialForm = { title: "", price: "", desc: "", img: "", stock: 10, isActive: true, category: "Doğum Günü" };
  const [formData, setFormData] = useState(initialForm);

  const fetchProducts = async () => {
    try { const res = await axios.get("http://localhost:5000/api/products"); setProducts(res.data); } catch (err) { console.log(err); }
  };
  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => { const value = e.target.type === "checkbox" ? e.target.checked : e.target.value; setFormData({ ...formData, [e.target.name]: value }); };
  
  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const data = new FormData(); data.append("file", file);
    try {
      const res = await axios.post("http://localhost:5000/api/upload", data);
      setFormData((prev) => ({ ...prev, img: res.data }));
      notify("Resim yüklendi! 🖼️", "success");
    } catch (err) { notify("Resim yüklenemedi!", "error"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) { notify("Zorunlu alanları doldurun!", "warning"); return; }
    try {
      if (editMode) { await axios.put(`http://localhost:5000/api/products/${editMode}`, formData); notify("Güncellendi!", "success"); } 
      else { await axios.post("http://localhost:5000/api/products", formData); notify("Eklendi!", "success"); }
      setFormData(initialForm); setShowForm(false); setEditMode(null); fetchProducts();
    } catch (err) { notify("Hata!", "error"); }
  };

  const handleEditClick = (product) => { setFormData({ ...product, category: product.category || "Doğum Günü" }); setEditMode(product._id); setShowForm(true); window.scrollTo(0,0); };
  const handleDelete = async (id) => { if(confirm("Silinsin mi?")) { try { await axios.delete(`http://localhost:5000/api/products/${id}`); fetchProducts(); } catch(e){} } };

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-20 z-20">
        <h2 className="text-2xl font-bold text-gray-800">Ürünler ({products.length})</h2>
        <div className="flex gap-3">
          <input type="text" placeholder="Ara..." className="px-4 py-2 border rounded-lg w-64 outline-none focus:border-pink-500" onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={() => { setShowForm(!showForm); setEditMode(null); setFormData(initialForm); }} className={`px-4 py-2 rounded-lg font-bold text-white ${showForm ? "bg-gray-500" : "bg-green-600"}`}>{showForm ? "Kapat" : "+ Ekle"}</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 animate-fade-in-down mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">{editMode ? "Düzenle" : "Yeni Ekle"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Ürün Adı *</label><input name="title" value={formData.title} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-pink-500 bg-gray-50" /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Fiyat *</label><input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-pink-500 bg-gray-50" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Stok</label><input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-pink-500 bg-gray-50" /></div>
            </div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label><select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-pink-500 bg-white">{CATEGORIES.filter(c => c !== "Tümü").map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Görsel</label><div className="flex items-center gap-4 border p-2 rounded bg-gray-50"><label className="cursor-pointer bg-white border hover:bg-gray-100 px-4 py-2 rounded text-sm font-bold text-gray-600 transition">{uploading ? "..." : "📷 Seç"}<input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} /></label>{formData.img && <img src={formData.img} className="h-10 w-10 object-cover rounded" />}<input name="img" value={formData.img} onChange={handleChange} placeholder="URL" className="flex-1 bg-transparent outline-none text-xs" /></div></div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Açıklama</label><textarea name="desc" value={formData.desc} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-pink-500 bg-gray-50 h-24" /></div>
            <div className="md:col-span-2 flex items-center gap-2 bg-gray-50 p-3 rounded border"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="active" className="w-5 h-5 text-pink-600" /><label htmlFor="active" className="cursor-pointer font-medium text-gray-700">Satışta olsun mu?</label></div>
            <button type="submit" className="bg-blue-600 text-white py-3 rounded font-bold md:col-span-2 hover:bg-blue-700 transition">{editMode ? "Değişiklikleri Kaydet" : "Ürünü Oluştur"}</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col group hover:shadow-md transition relative ${product.stock <= 0 ? "border-red-300 opacity-80" : "border-gray-200"}`}>
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
               {!product.isActive && <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded font-bold">Pasif</span>}
               {product.stock <= 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold">Tükendi</span>}
            </div>
            <div className="h-48 overflow-hidden bg-gray-100 relative">
              <img src={product.img || "https://placehold.co/400"} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              {product.category && <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow">{product.category}</span>}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h4 className="font-bold text-gray-800 mb-1 truncate" title={product.title}>{product.title}</h4>
              <div className="flex justify-between items-center mb-3"><span className="text-lg font-bold text-pink-600">£{product.price}</span><span className="text-xs text-gray-500 font-mono">ID: {product._id.slice(-4)}</span></div>
              <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase">Stok</span>
                <QuickStockUpdate product={product} refresh={fetchProducts} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleEditClick(product)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold py-2 rounded transition">Düzenle</button>
                <button onClick={() => handleDelete(product._id)} className="bg-red-50 text-red-500 hover:bg-red-100 text-xs font-bold py-2 rounded transition">Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 3. SİPARİŞ YÖNETİMİ ---
const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { notify } = useCart();

  const fetchOrders = async () => {
    setLoading(true);
    try { const res = await axios.get("http://localhost:5000/api/orders"); setOrders(res.data); } 
    catch (err) { console.log(err); } finally { setTimeout(() => setLoading(false), 500); }
  };
  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, st) => { try { await axios.put(`http://localhost:5000/api/orders/${id}`, { status: st }); notify(`Sipariş: ${st}`, "success"); setOrders(prev => prev.map(o => o._id === id ? { ...o, status: st } : o)); } catch (err) { notify("Hata", "error"); } };
  
  const getStatusStyle = (status) => {
    switch(status) {
      case "Sipariş Alındı": return { border: "border-l-blue-500", badge: "bg-blue-100 text-blue-700" };
      case "Hazırlanıyor": return { border: "border-l-yellow-500", badge: "bg-yellow-100 text-yellow-700" };
      case "Yola Çıktı": return { border: "border-l-purple-500", badge: "bg-purple-100 text-purple-700" };
      case "Teslim Edildi": return { border: "border-l-green-500", badge: "bg-green-100 text-green-700" };
      case "İptal": return { border: "border-l-red-500", badge: "bg-red-100 text-red-700" };
      default: return { border: "border-l-gray-500", badge: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Siparişler <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full">{orders.length}</span></h2>
        <button onClick={fetchOrders} disabled={loading} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition disabled:opacity-50"><span className={loading ? "animate-spin" : ""}>↻</span> {loading ? "Yükleniyor..." : "Listeyi Yenile"}</button>
      </div>
      <div className="space-y-4">
        {orders.map((order) => {
            const style = getStatusStyle(order.status);
            return (
              <div key={order._id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition border-l-4 ${style.border} p-4 flex flex-col md:flex-row gap-4`}>
                <div className="min-w-[220px]"><div className="text-xs text-gray-400 font-mono mb-1">#{order._id.slice(-6)}</div><div className="font-bold text-gray-800 text-lg leading-tight">{order.recipient.name}</div><div className="text-xs text-gray-500 mt-1">📞 {order.recipient.phone}</div><div className="text-xs text-gray-500 mt-1 bg-gray-50 p-1 rounded inline-block">Teslimat: <b>{new Date(order.delivery.date).toLocaleDateString()}</b></div></div>
                <div className="flex-1 space-y-2 border-l pl-4 border-gray-100"><div className="text-xs text-gray-500 line-clamp-1" title={order.recipient.address}>📍 {order.recipient.address}, {order.recipient.city}</div>{(order.delivery.cardMessage || order.delivery.courierNote) && (<div className="flex flex-wrap gap-2">{order.delivery.cardMessage && <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-1 rounded border border-pink-100">💌 {order.delivery.cardMessage}</span>}{order.delivery.courierNote && <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded border border-orange-100">⚠️ {order.delivery.courierNote}</span>}</div>)}<div className="flex gap-2 overflow-x-auto pt-2">{order.items.map((item, i) => (<div key={i} className="relative flex-shrink-0 group"><img src={item.img} className="w-8 h-8 rounded border object-cover" title={item.title} /><span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white shadow">{item.quantity}</span></div>))}</div></div>
                <div className="flex flex-col items-end justify-between gap-2 min-w-[140px] border-t md:border-t-0 pt-2 md:pt-0 md:pl-4 md:border-l border-gray-100"><span className="text-xl font-extrabold text-pink-600">£{order.totalAmount}</span>
                  <div className="flex gap-2 w-full"><button onClick={() => setSelectedInvoice(order)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition" title="Yazdır">🖨️</button><select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} className={`flex-1 text-xs font-bold px-2 py-2 rounded-lg border cursor-pointer outline-none appearance-none transition w-full text-center ${style.badge}`}><option>Sipariş Alındı</option><option>Hazırlanıyor</option><option>Yola Çıktı</option><option>Teslim Edildi</option><option>İptal</option></select></div>
                </div>
              </div>
            );
          })}
      </div>
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
    </div>
  );
};

// --- 4. KUPON YÖNETİMİ ---
const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({ code: "", discountRate: "" });
  const { notify } = useCart();
  const fetchCoupons = async () => { try { const res = await axios.get("http://localhost:5000/api/coupons"); setCoupons(res.data); } catch (err) { console.log(err); } };
  useEffect(() => { fetchCoupons(); }, []);
  const handleSubmit = async (e) => { e.preventDefault(); if (!formData.code || !formData.discountRate) return notify("Bilgileri doldurun", "warning"); try { await axios.post("http://localhost:5000/api/coupons", { code: formData.code.toUpperCase(), discountRate: Number(formData.discountRate) }); notify("Kupon oluşturuldu! 🎉", "success"); setFormData({ code: "", discountRate: "" }); fetchCoupons(); } catch (err) { notify("Hata oluştu", "error"); } };
  const handleDelete = async (id) => { if (confirm("Kuponu silmek istiyor musunuz?")) { try { await axios.delete(`http://localhost:5000/api/coupons/${id}`); notify("Silindi.", "success"); fetchCoupons(); } catch (err) { notify("Silinemedi", "error"); } } };
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">İndirim Kuponları</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><h3 className="text-lg font-bold text-gray-700 mb-4">Yeni Kupon</h3><form onSubmit={handleSubmit} className="flex gap-4 items-end"><div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase mb-1">Kod</label><input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full p-3 border rounded outline-none focus:border-pink-500 font-mono uppercase" placeholder="Örn: YAZ2024" /></div><div className="w-32"><label className="text-xs font-bold text-gray-500 uppercase mb-1">İndirim (%)</label><input type="number" value={formData.discountRate} onChange={(e) => setFormData({...formData, discountRate: e.target.value})} className="w-full p-3 border rounded outline-none focus:border-pink-500" placeholder="10" /></div><button type="submit" className="bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700 transition">Oluştur</button></form></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{coupons.map(c => (<div key={c._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center group hover:shadow-md transition relative overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-2 bg-pink-500"></div><div><div className="text-xl font-bold text-gray-800 font-mono">{c.code}</div><div className="text-sm text-green-600 font-bold">%{c.discountRate} İndirim</div></div><button onClick={() => handleDelete(c._id)} className="text-gray-400 hover:text-red-500 transition p-2">🗑️</button></div>))}</div>
    </div>
  );
};

// --- 5. YORUM YÖNETİMİ ---
const ReviewManager = () => {
  const [allReviews, setAllReviews] = useState([]);
  const { notify } = useCart();
  const fetchReviews = async () => { try { const res = await axios.get("http://localhost:5000/api/products"); let gathered = []; res.data.forEach(p => { p.reviews.forEach(r => { gathered.push({ ...r, productId: p._id, productName: p.title, productImg: p.img }); }); }); gathered.sort((a, b) => new Date(b.date) - new Date(a.date)); setAllReviews(gathered); } catch (err) { console.log(err); } };
  useEffect(() => { fetchReviews(); }, []);
  const handleDelete = async (pid, rid) => { if(!confirm("Silinsin mi?")) return; try { await axios.delete(`http://localhost:5000/api/products/${pid}/reviews/${rid}`); notify("Silindi", "success"); fetchReviews(); } catch (err) { notify("Hata", "error"); } };
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">Yorumlar ({allReviews.length})</h2><button onClick={fetchReviews} className="text-blue-600 hover:underline text-sm font-bold">🔄 Yenile</button></div>
      <div className="grid gap-4">{allReviews.map((r) => (<div key={r._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition"><img src={r.productImg} className="w-16 h-16 rounded-lg object-cover border" /><div className="flex-1"><div className="flex justify-between items-start"><div><h4 className="font-bold text-gray-800 text-sm">{r.user}</h4><div className="text-xs text-gray-500">Ürün: <span className="font-semibold">{r.productName}</span></div></div><span className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</span></div><div className="mt-2"><div className="text-yellow-400 text-xs mb-1">{"★".repeat(r.rating)}</div><p className="text-gray-700 text-sm bg-gray-50 p-2 rounded italic border border-gray-100">"{r.comment}"</p></div></div><div className="flex items-center"><button onClick={() => handleDelete(r.productId, r._id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition">🗑️</button></div></div>))}</div>
    </div>
  );
};

// --- HIZLI STOK GÜNCELLEME ---
const QuickStockUpdate = ({ product, refresh }) => {
  const [stock, setStock] = useState(product.stock);
  const [loading, setLoading] = useState(false);
  const { notify } = useCart();
  const handleUpdate = async () => {
    if (Number(stock) === product.stock) return;
    setLoading(true);
    try { await axios.put(`http://localhost:5000/api/products/${product._id}`, { ...product, stock: Number(stock) }); notify("Stok güncellendi", "success"); refresh(); } 
    catch (err) { notify("Hata", "error"); } finally { setLoading(false); }
  };
  const isChanged = Number(stock) !== product.stock;
  return (
    <div className="flex items-center gap-2">
      <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-14 p-1.5 border rounded text-center text-sm outline-none focus:border-pink-500 bg-gray-50" />
      <button onClick={handleUpdate} disabled={!isChanged || loading} className={`text-xs px-3 py-1.5 rounded font-bold transition shadow-sm ${isChanged ? "bg-pink-600 text-white hover:bg-pink-700 cursor-pointer" : "bg-gray-100 text-gray-400 cursor-default"}`}>{loading ? "..." : "Güncelle"}</button>
    </div>
  );
};

export default AdminPage;