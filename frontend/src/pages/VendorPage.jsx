import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CATEGORIES = ["Doğum Günü", "Yıldönümü", "İç Mekan", "Yenilebilir Çiçek", "Tasarım Çiçek"];

const VendorPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || (user.role !== "vendor" && user.role !== "admin")) {
      navigate("/");
    }
  }, [navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans pt-20">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white text-gray-800 flex flex-col shadow-xl z-10 fixed h-full top-20 left-0 border-r border-gray-200">
        <div className="p-6 text-xl font-bold text-pink-600 border-b border-gray-100 flex items-center gap-2">
          🏪 <span>Mağaza Paneli</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab("dashboard")} className={`w-full text-left px-4 py-3 rounded-lg transition font-bold ${activeTab === "dashboard" ? "bg-pink-50 text-pink-600 border-l-4 border-pink-600" : "hover:bg-gray-50 text-gray-500"}`}>📊 Özet & Ciro</button>
          <button onClick={() => setActiveTab("products")} className={`w-full text-left px-4 py-3 rounded-lg transition font-bold ${activeTab === "products" ? "bg-pink-50 text-pink-600 border-l-4 border-pink-600" : "hover:bg-gray-50 text-gray-500"}`}>📦 Ürünlerim</button>
          <button onClick={() => setActiveTab("orders")} className={`w-full text-left px-4 py-3 rounded-lg transition font-bold ${activeTab === "orders" ? "bg-pink-50 text-pink-600 border-l-4 border-pink-600" : "hover:bg-gray-50 text-gray-500"}`}>🚚 Siparişler</button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 mb-2">Giriş: {user?.username}</div>
          <button onClick={handleLogout} className="w-full bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 py-2 rounded text-sm font-bold transition">Çıkış Yap</button>
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
        
        // Basit Ciro Hesabı (Sipariş toplamı üzerinden - Komisyon düşülmemiş hali)
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
          <div><div className="text-sm text-gray-500 font-bold uppercase">Toplam Ciro</div><div className="text-2xl font-extrabold text-gray-800">£{stats.totalSales}</div></div>
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
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-2">👋 Hoşgeldin, {user.username}!</h3>
        <p className="text-sm text-blue-600">Buradan ürünlerini ekleyebilir, siparişlerini takip edebilirsin. Bol satışlar!</p>
      </div>
    </div>
  );
};

// --- 2. VENDOR PRODUCT MANAGER ---
const VendorProductManager = ({ user }) => {
  const { notify } = useCart();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", price: "", desc: "", img: "", stock: 10, category: "Doğum Günü" });

  const fetchProducts = async () => {
    try { const res = await axios.get(`http://localhost:5000/api/products/vendor/${user._id}`); setProducts(res.data); } 
    catch (err) { console.log(err); }
  };
  useEffect(() => { fetchProducts(); }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Vendor ID'sini ekleyerek gönderiyoruz
      await axios.post("http://localhost:5000/api/products", { ...formData, vendor: user._id, isActive: true });
      notify("Ürün eklendi! 🌸", "success");
      setShowForm(false);
      fetchProducts();
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  const handleDelete = async (id) => {
    if(confirm("Silinsin mi?")) { try { await axios.delete(`http://localhost:5000/api/products/${id}`); fetchProducts(); } catch(e){} }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Ürünlerim ({products.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-pink-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-pink-700 transition">+ Yeni Ürün Ekle</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-pink-100 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
           <input name="title" onChange={handleChange} placeholder="Ürün Adı" className="p-2 border rounded" required />
           <div className="flex gap-2"><input name="price" type="number" onChange={handleChange} placeholder="Fiyat" className="p-2 border rounded w-full" required /><input name="stock" type="number" onChange={handleChange} placeholder="Stok" className="p-2 border rounded w-full" /></div>
           <select name="category" onChange={handleChange} className="p-2 border rounded bg-white">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
           <input name="img" onChange={handleChange} placeholder="Resim URL" className="p-2 border rounded" />
           <textarea name="desc" onChange={handleChange} placeholder="Açıklama" className="p-2 border rounded md:col-span-2" />
           <button type="submit" className="bg-green-600 text-white py-2 rounded font-bold md:col-span-2">Kaydet</button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => (
          <div key={p._id} className="bg-white border rounded-xl overflow-hidden group">
            <img src={p.img} className="h-40 w-full object-cover" />
            <div className="p-3">
              <div className="font-bold truncate">{p.title}</div>
              <div className="flex justify-between text-sm mt-1"><span className="font-bold text-pink-600">£{p.price}</span><span className="text-gray-500">Stok: {p.stock}</span></div>
              <button onClick={() => handleDelete(p._id)} className="w-full mt-2 bg-red-50 text-red-600 text-xs py-1 rounded font-bold hover:bg-red-100">Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 3. VENDOR ORDER MANAGER ---
const VendorOrderManager = ({ user }) => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetchOrders = async () => {
      try { const res = await axios.get(`http://localhost:5000/api/orders/vendor/${user._id}`); setOrders(res.data); } 
      catch (err) { console.log(err); }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800">Gelen Siparişler</h2>
      {orders.length === 0 ? <div className="text-center py-10 text-gray-400">Henüz sipariş yok.</div> : 
        orders.map(order => (
          <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
            <div>
              <div className="font-bold text-gray-800">{order.recipient.name}</div>
              <div className="text-xs text-gray-500">#{order._id.slice(-6)} • {new Date(order.createdAt).toLocaleDateString()}</div>
              <div className="text-xs mt-1 bg-gray-50 px-2 py-1 rounded inline-block">📍 {order.recipient.city}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-pink-600">£{order.totalAmount}</div>
              <span className={`text-xs px-2 py-1 rounded font-bold ${order.status === 'Teslim Edildi' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{order.status}</span>
            </div>
          </div>
        ))
      }
    </div>
  );
};

export default VendorPage;