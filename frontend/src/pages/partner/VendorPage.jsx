import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import InvoiceModal from "../../components/InvoiceModal";
import ConfirmModal from "../../components/ConfirmModal";

const CATEGORIES = ["Doğum Günü", "Yıldönümü", "İç Mekan", "Yenilebilir Çiçek", "Tasarım Çiçek"];

const VendorPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || (user.role !== "vendor" && user.role !== "admin")) {
      navigate("/");
    } else if (user.role === "vendor" && user.applicationStatus !== 'approved') {
      navigate("/partner-application");
    }
  }, [navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("user-change"));
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans pt-20">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white text-gray-800 flex flex-col shadow-xl z-10 fixed h-full top-20 left-0 border-r border-gray-200 overflow-y-auto pb-20">
        <div className="p-6 text-xl font-bold text-pink-600 border-b border-gray-100 flex items-center gap-2">
          🏪 <span>Mağaza Paneli</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab("dashboard")} className={`w-full text-left px-4 py-3 rounded-lg transition font-bold ${activeTab === "dashboard" ? "bg-pink-50 text-pink-600 border-l-4 border-pink-600" : "hover:bg-gray-50 text-gray-500"}`}>📊 Özet & Ciro</button>
          <button onClick={() => setActiveTab("products")} className={`w-full text-left px-4 py-3 rounded-lg transition font-bold ${activeTab === "products" ? "bg-pink-50 text-pink-600 border-l-4 border-pink-600" : "hover:bg-gray-50 text-gray-500"}`}>📦 Ürün Yönetimi</button>
          <button onClick={() => setActiveTab("orders")} className={`w-full text-left px-4 py-3 rounded-lg transition font-bold ${activeTab === "orders" ? "bg-pink-50 text-pink-600 border-l-4 border-pink-600" : "hover:bg-gray-50 text-gray-500"}`}>🚚 Siparişler</button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 mb-2 font-bold uppercase">Hesap: {user?.username}</div>
          <button onClick={handleLogout} className="w-full bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 py-2 rounded text-sm font-bold transition border border-gray-200">Çıkış Yap</button>
        </div>
      </aside>

      {/* İÇERİK */}
      <main className="flex-1 p-8 ml-64">
        {activeTab === "dashboard" && <VendorDashboard user={user} />}
        {activeTab === "products" && <VendorProductManager user={user} />}
        {activeTab === "orders" && <VendorOrderManager user={user} />}
      </main>
    </div>
  );
};

// --- 1. VENDOR DASHBOARD ---
const VendorDashboard = ({ user }) => {
  const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, productCount: 0 });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await axios.get(`http://localhost:5000/api/products/vendor/${user._id}`);
        const ordRes = await axios.get(`http://localhost:5000/api/orders/vendor/${user._id}`);
        
        // Ciro: Sadece kendi ürünleri üzerinden hesaplama (Basitleştirilmiş)
        const totalSales = ordRes.data.reduce((acc, o) => acc + o.totalAmount, 0);
        
        setStats({
          totalSales,
          orderCount: ordRes.data.length,
          productCount: prodRes.data.length
        });
      } catch (err) { console.log(err); }
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Mağaza Özeti</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-2xl">💷</div>
          <div><div className="text-sm text-gray-500 font-bold uppercase">Toplam Ciro</div><div className="text-2xl font-extrabold text-gray-800">£{stats.totalSales.toLocaleString()}</div></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl">📦</div>
          <div><div className="text-sm text-gray-500 font-bold uppercase">Alınan Sipariş</div><div className="text-2xl font-extrabold text-gray-800">{stats.orderCount}</div></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl">🌸</div>
          <div><div className="text-sm text-gray-500 font-bold uppercase">Ürün Sayısı</div><div className="text-2xl font-extrabold text-gray-800">{stats.productCount}</div></div>
        </div>
      </div>
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 flex items-start gap-4">
        <span className="text-4xl">👋</span>
        <div>
          <h3 className="font-bold text-blue-800 mb-1">Hoşgeldin, {user.username}!</h3>
          <p className="text-sm text-blue-600">Mağazan şu an aktif. Ürünlerini yönetebilir ve gelen siparişleri hazırlayabilirsin.</p>
        </div>
      </div>
    </div>
  );
};

// --- 2. VENDOR ÜRÜN YÖNETİMİ (MODALLI SİLME) ---
const VendorProductManager = ({ user }) => {
  const { notify } = useCart();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmData, setConfirmData] = useState(null); // Modal State
  
  const initialForm = { title: "", price: "", desc: "", img: "", stock: 10, category: "Doğum Günü" };
  const [formData, setFormData] = useState(initialForm);

  const fetchProducts = async () => {
    try { const res = await axios.get(`http://localhost:5000/api/products/vendor/${user._id}`); setProducts(res.data); } 
    catch (err) { console.log(err); }
  };
  useEffect(() => { fetchProducts(); }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); const data = new FormData(); data.append("file", file);
    try { const res = await axios.post("http://localhost:5000/api/upload", data); setFormData((prev) => ({ ...prev, img: res.data })); notify("Resim yüklendi! 🖼️", "success"); } 
    catch (err) { notify("Yüklenemedi", "error"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/products", { ...formData, vendor: user._id, isActive: true });
      notify("Ürün eklendi! 🌸", "success"); setShowForm(false); fetchProducts();
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  // SİLME İŞLEMİ (MODAL İLE)
  const handleDeleteRequest = (id) => {
    setConfirmData({
      isOpen: true, title: "Ürünü Sil?", message: "Bu işlem geri alınamaz. Ürünü silmek istiyor musunuz?", isDanger: true,
      action: async () => {
        try { await axios.delete(`http://localhost:5000/api/products/${id}`); notify("Ürün silindi.", "success"); fetchProducts(); }
        catch { notify("Hata oluştu.", "error"); }
        setConfirmData(null);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Ürünlerim ({products.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className={`px-4 py-2 rounded-lg font-bold text-white transition ${showForm ? 'bg-gray-500' : 'bg-pink-600 hover:bg-pink-700'}`}>{showForm ? "Kapat" : "+ Yeni Ürün Ekle"}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-pink-100 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 animate-fade-in-down">
           <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Ürün Adı</label><input name="title" onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-pink-500" required /></div>
           <div className="flex gap-2">
             <div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase mb-1">Fiyat</label><input name="price" type="number" onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-pink-500" required /></div>
             <div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase mb-1">Stok</label><input name="stock" type="number" onChange={handleChange} placeholder="10" className="w-full p-2 border rounded outline-none focus:border-pink-500" /></div>
           </div>
           <select name="category" onChange={handleChange} className="p-2 border rounded bg-white outline-none focus:border-pink-500">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
           <div>
             <label className="text-xs font-bold text-gray-500 uppercase mb-1">Görsel</label>
             <div className="flex items-center gap-2 border p-2 rounded bg-gray-50">
                <label className="cursor-pointer bg-white border hover:bg-gray-100 px-3 py-1 rounded text-xs font-bold text-gray-600 shadow-sm">{uploading?"...":"📷 Seç"}<input type="file" className="hidden" onChange={handleUpload} /></label>
                <input name="img" value={formData.img} onChange={handleChange} placeholder="URL" className="flex-1 bg-transparent outline-none text-xs" />
             </div>
           </div>
           <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</label><textarea name="desc" onChange={handleChange} className="w-full p-2 border rounded h-20 outline-none focus:border-pink-500" /></div>
           <button type="submit" disabled={uploading} className="bg-green-600 text-white py-2 rounded font-bold md:col-span-2 hover:bg-green-700 shadow-lg disabled:opacity-50">Kaydet ve Yayınla</button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => (
          <div key={p._id} className="bg-white border rounded-xl overflow-hidden group hover:shadow-md transition flex flex-col relative">
            {p.stock<=0 && <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow z-10">TÜKENDİ</div>}
            <div className="h-40 relative bg-gray-100"><img src={p.img} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
            <div className="p-3 flex-1 flex flex-col">
              <div className="font-bold truncate text-gray-800 mb-1">{p.title}</div>
              <div className="font-bold text-pink-600 text-sm">£{p.price}</div>
              <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Hızlı Stok</span>
                <QuickStockUpdate product={p} refresh={fetchProducts} />
              </div>
              <button onClick={() => handleDeleteRequest(p._id)} className="w-full bg-red-50 text-red-600 text-xs py-1.5 rounded font-bold hover:bg-red-100 border border-red-100">Sil</button>
            </div>
          </div>
        ))}
      </div>

      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

// --- 3. VENDOR ORDER MANAGER ---
const VendorOrderManager = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { notify } = useCart();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try { const res = await axios.get(`http://localhost:5000/api/orders/vendor/${user._id}`); setOrders(res.data); } 
      catch (err) { console.log(err); }
    };
    fetchOrders();
  }, [user]);

  const handleStatusChange = async (id, st) => {
    try { await axios.put(`http://localhost:5000/api/orders/${id}`, { status: st }); notify("Güncellendi", "success"); setOrders(prev => prev.map(o => o._id === id ? { ...o, status: st } : o)); } 
    catch { notify("Hata", "error"); }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case "Sipariş Alındı": return "border-l-blue-500";
      case "Hazırlanıyor": return "border-l-yellow-500";
      case "Hazır": return "border-l-green-400"; // Kurye Bekleniyor
      case "Yola Çıktı": return "border-l-purple-500";
      case "Teslim Edildi": return "border-l-green-600";
      case "İptal": return "border-l-red-500";
      default: return "border-l-gray-500";
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 bg-white p-4 rounded-xl border border-gray-200">Gelen Siparişler ({orders.length})</h2>
      {orders.length === 0 ? <div className="text-center py-10 text-gray-400">Henüz sipariş yok.</div> : 
        orders.map(order => (
          <div key={order._id} className={`bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 hover:shadow-md transition border-l-4 ${getStatusStyle(order.status)}`}>
            <div className="min-w-[200px]">
              <div className="text-xs text-gray-400 font-mono mb-1">#{order._id.slice(-6)}</div>
              <div className="font-bold text-gray-800 text-lg">{order.recipient.name}</div>
              <div className="text-xs text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded inline-block">📍 {order.recipient.city}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            
            <div className="flex-1 space-y-2 border-l border-gray-100 pl-4">
               <div className="text-xs font-bold text-gray-400 uppercase">Sipariş İçeriği</div>
               <div className="flex gap-2 overflow-x-auto pb-2">
                 {order.items.map((item, i) => (
                   <div key={i} className="relative group flex-shrink-0">
                      <img src={item.img} className="w-10 h-10 rounded-lg object-cover border shadow-sm" title={item.title} />
                      <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full shadow border border-white">{item.quantity}</span>
                   </div>
                 ))}
               </div>
               {order.delivery.cardMessage && <div className="text-xs text-pink-600 bg-pink-50 p-2 rounded border border-pink-100 italic">💌 "{order.delivery.cardMessage}"</div>}
            </div>

            <div className="text-right flex flex-col justify-between items-end min-w-[140px]">
              <div className="font-bold text-pink-600 text-xl">£{order.totalAmount}</div>
              
              <div className="flex flex-col gap-2 items-end mt-2 w-full">
                {/* Fatura */}
                <button onClick={() => setSelectedInvoice(order)} className="text-xs flex items-center justify-center gap-1 text-blue-600 hover:underline font-bold bg-blue-50 px-2 py-1 rounded w-full">🖨️ Fatura</button>

                {/* Durum (Satıcı sadece "Hazır" yapabilir, kuryeye devredebilir) */}
                <select 
                  value={order.status} 
                  onChange={(e) => handleStatusChange(order._id, e.target.value)} 
                  className="text-xs font-bold px-2 py-2 rounded-lg border cursor-pointer outline-none bg-white w-full"
                  disabled={order.status === 'Yola Çıktı' || order.status === 'Teslim Edildi'} 
                >
                  <option value="Sipariş Alındı">Sipariş Alındı</option>
                  <option value="Hazırlanıyor">Hazırlanıyor 👨‍🍳</option>
                  <option value="Hazır">Hazır (Kurye Bekle) 📦</option>
                  <option disabled value="Yola Çıktı">Yola Çıktı 🛵</option>
                  <option disabled value="Teslim Edildi">Teslim Edildi ✅</option>
                </select>
              </div>
            </div>
          </div>
        ))
      }
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
    </div>
  );
};

// --- YARDIMCI: HIZLI STOK GÜNCELLEME ---
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

  return (
    <div className="flex items-center gap-1">
      <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-10 p-1 border rounded text-center text-xs font-bold outline-none focus:border-pink-500" />
      <button onClick={handleUpdate} disabled={loading || Number(stock)===product.stock} className={`text-xs px-2 py-1 rounded font-bold transition ${Number(stock)!==product.stock ? "bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer" : "bg-gray-100 text-gray-300 cursor-default"}`}>{loading?"..":"✓"}</button>
    </div>
  );
};

export default VendorPage;