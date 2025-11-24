import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import InvoiceModal from "../components/InvoiceModal";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("orders"); // Varsayılan: Siparişlerim
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Hesabım</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SOL MENÜ (SIDEBAR) --- */}
          <aside className="w-full lg:w-72 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-fit shrink-0">
            
            {/* Profil Özeti */}
            <div className="p-6 border-b border-gray-100 text-center bg-gradient-to-b from-white to-gray-50">
              <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3 shadow-inner border-4 border-white">
                {user.username[0].toUpperCase()}
              </div>
              <h2 className="font-bold text-gray-800 text-lg">{user.username}</h2>
              <p className="text-xs text-gray-500">{user.email}</p>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full inline-block mt-2 uppercase tracking-wider">
                {user.role}
              </span>
            </div>

            {/* Menü Butonları */}
            <nav className="p-3 space-y-1">
              <MenuButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")} icon="📦" label="Siparişlerim" />
              <MenuButton active={activeTab === "addresses"} onClick={() => setActiveTab("addresses")} icon="📍" label="Adres Defteri" />
              <MenuButton active={activeTab === "info"} onClick={() => setActiveTab("info")} icon="👤" label="Kullanıcı Bilgileri" />
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition flex items-center gap-3">
                <span>🚪</span> Çıkış Yap
              </button>
            </nav>
          </aside>

          {/* --- SAĞ İÇERİK --- */}
          <main className="flex-1 min-w-0">
            {activeTab === "orders" && <OrderHistory user={user} />}
            {activeTab === "addresses" && <AddressBook user={user} />}
            {activeTab === "info" && <UserInfo user={user} />}
          </main>

        </div>
      </div>
    </div>
  );
};

// YARDIMCI: Menü Butonu
const MenuButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center gap-3 ${active ? "bg-pink-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
  >
    <span className="text-lg">{icon}</span> {label}
  </button>
);

// ---------------------------------------------------------
// 1. SİPARİŞ GEÇMİŞİ
// ---------------------------------------------------------
const OrderHistory = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { notify } = useCart();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/find/${user._id}`);
        setOrders(res.data);
      } catch (err) { console.log(err); } 
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [user]);

  const cancelOrder = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Siparişi iptal etmek istiyor musunuz?")) return;
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}`, { status: "İptal" });
      notify("Sipariş iptal edildi.", "success");
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "İptal" } : o));
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  const getStatusColor = (s) => {
    if(s==="Teslim Edildi") return "bg-green-100 text-green-700 border-green-200";
    if(s==="İptal") return "bg-red-100 text-red-700 border-red-200";
    if(s==="Yola Çıktı") return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  if (loading) return <div className="text-center p-10 text-gray-500">Yükleniyor...</div>;
  if (orders.length === 0) return <EmptyState icon="📦" title="Siparişiniz Yok" desc="Henüz bir sipariş vermediniz." />;

  return (
    <div className="space-y-4 animate-fade-in">
      {orders.map((order) => (
        <div key={order._id} className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer overflow-hidden ${expandedId === order._id ? 'border-pink-300 ring-2 ring-pink-50' : 'border-gray-200 hover:border-pink-200'}`} onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}>
          
          {/* ÖZET (TIKLANABİLİR) */}
          <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className={`w-2 h-12 rounded-full ${order.status === 'Teslim Edildi' ? 'bg-green-500' : order.status === 'İptal' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              <div>
                <div className="text-sm font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</div>
                <div className="text-xs text-gray-400 font-mono">#{order._id.slice(-6)}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-extrabold text-pink-600">£{order.totalAmount}</div>
              <div className="text-xs text-gray-500">{order.items.length} Ürün</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>{order.status}</span>
              <span className={`text-gray-400 transform transition ${expandedId === order._id ? 'rotate-180' : ''}`}>▼</span>
            </div>
          </div>

          {/* DETAY (AÇILIR KISIM) */}
          {expandedId === order._id && (
            <div className="border-t border-gray-100 bg-gray-50 p-6 cursor-default" onClick={e => e.stopPropagation()}>
               <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Alıcı</h4>
                     <p className="font-bold text-gray-800">{order.recipient.name}</p>
                     <p className="text-sm text-gray-600">{order.recipient.address}, {order.recipient.city}</p>
                  </div>
                  <div>
                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Teslimat</h4>
                     <p className="text-sm text-gray-600">📅 {new Date(order.delivery.date).toLocaleDateString()} • ⏰ {order.delivery.timeSlot}</p>
                     {order.delivery.cardMessage && <div className="mt-2 text-xs text-pink-600 italic bg-white p-2 rounded border border-pink-100">💌 "{order.delivery.cardMessage}"</div>}
                  </div>
               </div>
               <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                       <img src={item.img} className="w-12 h-12 rounded object-cover" />
                       <div className="flex-1"><div className="font-bold text-sm">{item.title}</div><div className="text-xs text-gray-500">{item.quantity} Adet</div></div>
                       <div className="font-bold text-gray-700">£{item.price}</div>
                    </div>
                  ))}
               </div>
               <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                  {order.status === "Sipariş Alındı" && <button onClick={(e) => cancelOrder(e, order._id)} className="text-sm text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold transition">İptal Et</button>}
                  <button onClick={() => setSelectedInvoice(order)} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900 transition"><span>🖨️</span> Faturayı Görüntüle</button>
               </div>
            </div>
          )}
        </div>
      ))}
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
    </div>
  );
};

// ---------------------------------------------------------
// 2. ADRES DEFTERİ
// ---------------------------------------------------------
const AddressBook = ({ user }) => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ title: "", recipientName: "", recipientPhone: "", address: "", city: "Londra", postcode: "" });
  const { notify } = useCart();

  const fetchAddresses = async () => {
    try { const res = await axios.get(`http://localhost:5000/api/users/${user._id}/addresses`); setAddresses(res.data); } 
    catch(e){} 
  };
  useEffect(() => { fetchAddresses(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAddress.title || !newAddress.address) return notify("Eksik bilgi!", "warning");
    try {
      await axios.post(`http://localhost:5000/api/users/${user._id}/addresses`, newAddress);
      notify("Adres eklendi", "success");
      setShowForm(false);
      setNewAddress({ title: "", recipientName: "", recipientPhone: "", address: "", city: "Londra", postcode: "" });
      fetchAddresses();
    } catch(e){ notify("Hata", "error"); }
  };

  const handleDelete = async (id) => {
    if(!confirm("Silinsin mi?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${user._id}/addresses/${id}`);
      fetchAddresses();
    } catch(e){ notify("Hata", "error"); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Kayıtlı Adresler</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-pink-700">
          {showForm ? "İptal" : "+ Yeni Adres"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-green-200 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
           <input placeholder="Başlık (Ev, İş)" className="p-3 border rounded outline-none focus:border-pink-500" value={newAddress.title} onChange={e=>setNewAddress({...newAddress, title:e.target.value})} required />
           <input placeholder="Alıcı Adı" className="p-3 border rounded outline-none focus:border-pink-500" value={newAddress.recipientName} onChange={e=>setNewAddress({...newAddress, recipientName:e.target.value})} />
           <input placeholder="Telefon" className="p-3 border rounded outline-none focus:border-pink-500" value={newAddress.recipientPhone} onChange={e=>setNewAddress({...newAddress, recipientPhone:e.target.value})} />
           <input placeholder="Posta Kodu" className="p-3 border rounded outline-none focus:border-pink-500" value={newAddress.postcode} onChange={e=>setNewAddress({...newAddress, postcode:e.target.value})} />
           <textarea placeholder="Adres" className="p-3 border rounded outline-none focus:border-pink-500 md:col-span-2" value={newAddress.address} onChange={e=>setNewAddress({...newAddress, address:e.target.value})} required />
           <button type="submit" className="bg-green-600 text-white py-3 rounded font-bold md:col-span-2 hover:bg-green-700">Kaydet</button>
        </form>
      )}

      {addresses.length === 0 ? <EmptyState icon="📍" title="Adres Yok" desc="Henüz kayıtlı bir adresiniz bulunmuyor." /> : 
        <div className="grid gap-4">
          {addresses.map(addr => (
            <div key={addr._id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition flex justify-between items-start">
              <div>
                 <div className="font-bold text-gray-800 flex items-center gap-2"><span className="text-xl">🏠</span> {addr.title}</div>
                 <div className="text-sm text-gray-600 mt-1">{addr.recipientName} • {addr.recipientPhone}</div>
                 <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded inline-block">{addr.address}, {addr.postcode}</div>
              </div>
              <button onClick={() => handleDelete(addr._id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition" title="Sil">🗑️</button>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

// ---------------------------------------------------------
// 3. KULLANICI BİLGİLERİ & ŞİFRE DEĞİŞTİRME
// ---------------------------------------------------------
const UserInfo = ({ user }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ oldPass: "", newPass: "", confirmPass: "" });
  const { notify } = useCart();

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!passwords.oldPass) return notify("Lütfen eski şifrenizi girin", "warning");
    if (passwords.newPass !== passwords.confirmPass) return notify("Yeni şifreler uyuşmuyor", "error");
    if (passwords.newPass.length < 6) return notify("Yeni şifre en az 6 karakter olmalı", "warning");

    try {
      await axios.put(`http://localhost:5000/api/users/${user._id}/change-password`, {
        oldPassword: passwords.oldPass,
        newPassword: passwords.newPass
      });
      
      notify("Şifre başarıyla değişti! Tekrar giriş yapın.", "success");
      localStorage.removeItem("user");
      setTimeout(() => window.location.href="/login", 2000);
      
    } catch (err) {
      notify(err.response?.data || "Hata oluştu", "error");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
      <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Profil Bilgileri</h3>
      
      <div className="space-y-6 max-w-md">
        <div><label className="text-xs font-bold text-gray-400 uppercase">Kullanıcı Adı</label><div className="text-lg font-medium text-gray-800 border-b border-gray-100 pb-2">{user.username}</div></div>
        <div><label className="text-xs font-bold text-gray-400 uppercase">E-Posta Adresi</label><div className="text-lg font-medium text-gray-800 border-b border-gray-100 pb-2">{user.email}</div></div>
        <div><label className="text-xs font-bold text-gray-400 uppercase">Hesap Türü</label><div className="mt-1"><span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase">{user.role}</span></div></div>

        {/* ŞİFRE DEĞİŞTİRME BUTONU VE FORMU */}
        <div className="pt-6 border-t border-gray-100">
          {!showPasswordForm ? (
            <button onClick={() => setShowPasswordForm(true)} className="flex items-center gap-2 text-pink-600 font-bold hover:bg-pink-50 px-4 py-2 rounded-lg transition border border-pink-200">
              <span>🔒</span> Şifremi Değiştir
            </button>
          ) : (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in-down">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-700">Güvenlik Ayarları</h4>
                <button onClick={() => setShowPasswordForm(false)} className="text-xs text-gray-500 hover:text-red-500 font-bold">İptal</button>
              </div>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mevcut Şifre</label><input type="password" required className="w-full p-3 border rounded-lg outline-none focus:border-pink-500 bg-white" placeholder="••••••••" onChange={e => setPasswords({...passwords, oldPass: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yeni Şifre</label><input type="password" required minLength={6} className="w-full p-3 border rounded-lg outline-none focus:border-pink-500 bg-white" onChange={e => setPasswords({...passwords, newPass: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yeni Şifre (Tekrar)</label><input type="password" required minLength={6} className="w-full p-3 border rounded-lg outline-none focus:border-pink-500 bg-white" onChange={e => setPasswords({...passwords, confirmPass: e.target.value})} /></div>
                <button type="submit" className="bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition w-full shadow-md mt-2">Şifreyi Güncelle</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, title, desc }) => (
  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-gray-700">{title}</h3>
    <p className="text-gray-400 text-sm mt-1">{desc}</p>
  </div>
);

export default ProfilePage;