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

// --- 1. VENDOR DASHBOARD (ÖZET) ---
const VendorDashboard = ({ user }) => {
  const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, productCount: 0 });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Sadece bu satıcıya ait verileri çekiyoruz
        const prodRes = await axios.get(`http://localhost:5000/api/products/vendor/${user._id}`);
        const ordRes = await axios.get(`http://localhost:5000/api/orders/vendor/${user._id}`);
        
        // Ciro Hesabı
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
        {/* Ciro Kartı */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-2xl">💷</div>
          <div><div className="text-sm text-gray-500 font-bold uppercase">Toplam Ciro</div><div className="text-2xl font-extrabold text-gray-800">£{stats.totalSales}</div></div>
        </div>
        {/* Sipariş Kartı */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl">📦</div>
          <div><div className="text-sm text-gray-500 font-bold uppercase">Alınan Sipariş</div><div className="text-2xl font-extrabold text-gray-800">{stats.orderCount}</div></div>
        </div>
        {/* Ürün Kartı */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl">🌸</div>
          <div><div className="text-sm text-gray-500 font-bold uppercase">Ürün Sayısı</div><div className="text-2xl font-extrabold text-gray-800">{stats.productCount}</div></div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 flex items-start gap-4">
        <div className="text-4xl">👋</div>
        <div>
          <h3 className="font-bold text-blue-800 mb-1">Hoşgeldin, {user.username}!</h3>
          <p className="text-sm text-blue-600">
            Mağazan şu an aktif. Ürünlerini güncel tutarak satışlarını artırabilirsin. 
            Ödemelerin her hafta Cuma günü hesabına yatırılır.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- 2. VENDOR PRODUCT MANAGER (ÜRÜNLER) ---
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
      notify("Ürün başarıyla eklendi! 🌸", "success");
      setShowForm(false);
      fetchProducts();
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  const handleDelete = async (id) => {
    if(confirm("Bu ürünü silmek istediğine emin misin?")) { 
      try { await axios.delete(`http://localhost:5000/api/products/${id}`); fetchProducts(); } 
      catch(e){} 
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Ürünlerim ({products.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-pink-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-pink-700 transition">
          {showForm ? "İptal" : "+ Yeni Ürün Ekle"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-pink-100 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fade-in-down">
           <input name="title" onChange={handleChange} placeholder="Ürün Adı" className="p-2 border rounded outline-none focus:border-pink-500" required />
           <div className="flex gap-2">
             <input name="price" type="number" onChange={handleChange} placeholder="Fiyat" className="p-2 border rounded w-full outline-none focus:border-pink-500" required />
             <input name="stock" type="number" onChange={handleChange} placeholder="Stok" className="p-2 border rounded w-full outline-none focus:border-pink-500" />
           </div>
           <select name="category" onChange={handleChange} className="p-2 border rounded bg-white outline-none focus:border-pink-500">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
           <input name="img" onChange={handleChange} placeholder="Resim URL (veya yükleme)" className="p-2 border rounded outline-none focus:border-pink-500" />
           <textarea name="desc" onChange={handleChange} placeholder="Açıklama" className="p-2 border rounded md:col-span-2 h-20 outline-none focus:border-pink-500" />
           <button type="submit" className="bg-green-600 text-white py-2 rounded font-bold md:col-span-2 hover:bg-green-700 transition">Kaydet ve Yayınla</button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.length === 0 ? <div className="text-gray-400 col-span-4 text-center py-10">Henüz ürün eklemediniz.</div> :
        products.map(p => (
          <div key={p._id} className="bg-white border rounded-xl overflow-hidden group hover:shadow-md transition">
            <div className="h-40 overflow-hidden relative">
               <img src={p.img} className="w-full h-full object-cover group-hover:scale-105 transition" />
               <div className="absolute top-2 right-2 bg-white/90 text-[10px] font-bold px-2 py-1 rounded shadow">Stok: {p.stock}</div>
            </div>
            <div className="p-3">
              <div className="font-bold truncate text-gray-800">{p.title}</div>
              <div className="font-bold text-pink-600 text-sm mt-1">£{p.price}</div>
              <button onClick={() => handleDelete(p._id)} className="w-full mt-3 bg-red-50 text-red-600 text-xs py-1.5 rounded font-bold hover:bg-red-100 transition">Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 3. VENDOR ORDER MANAGER (SİPARİŞLER) ---
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
          <div key={order._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="text-xs text-gray-400 font-mono">#{order._id.slice(-6)}</div>
              <div className="font-bold text-gray-800 text-lg">{order.recipient.name}</div>
              <div className="text-xs text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded inline-block">📍 {order.recipient.city}</div>
            </div>
            
            {/* Ürünler */}
            <div className="flex gap-2">
               {order.items.map((item, i) => (
                 <div key={i} className="relative group">
                    <img src={item.img} className="w-10 h-10 rounded-lg object-cover border" title={item.title} />
                    <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full shadow">{item.quantity}</span>
                 </div>
               ))}
            </div>

            <div className="text-right">
              <div className="font-bold text-pink-600 text-lg">£{order.totalAmount}</div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${order.status === 'Teslim Edildi' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))
      }
    </div>
  );
};

export default VendorPage;