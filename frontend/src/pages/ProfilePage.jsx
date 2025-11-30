import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import InvoiceModal from "../components/InvoiceModal";
import ConfirmModal from "../components/ConfirmModal";
import BadgeDisplay from "../components/BadgeDisplay";
import OrderTracker from "../components/OrderTracker"; // <-- Takip Çubuğu
import { FiBox, FiMapPin, FiUser, FiLogOut, FiTrash2, FiPrinter, FiChevronDown, FiChevronUp, FiLock, FiPlus, FiAlertCircle } from "react-icons/fi";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [user, setUser] = useState(null);
  const [orderCount, setOrderCount] = useState(0);

  const navigate = useNavigate();
  
  // 1. GÜVENLİK VE OTURUM KONTROLÜ
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  // 2. SİPARİŞ SAYISINI ÇEK (Rozetler İçin)
  useEffect(() => {
    if (user) {
      const fetchCount = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/orders/find/${user._id}`);
          setOrderCount(res.data.length);
        } catch (e) {}
      };
      fetchCount();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("user-change")); // Navbar'ı güncelle
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-6 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SOL MENÜ (SIDEBAR) --- */}
          <aside className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-fit shrink-0">
            
          {/* Profil Özeti */}
          <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50/30 to-white p-8 border-b border-gray-100">
            {/* Dekoratif Arka Plan */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 text-center max-w-md mx-auto">
              {/* Profil Avatarı */}
              <div className="relative inline-block mb-6">
                <div className="w-28 h-28 bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-xl shadow-pink-200/50 ring-4 ring-white relative">
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                  
                  {/* VIP Crown */}
                  {orderCount >= 20 && (
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <span className="text-2xl">👑</span>
                    </div>
                  )}
                </div>
                
                {/* Online Indicator */}
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full ring-4 ring-white"></div>
              </div>

              {/* İsim ve Başlık */}
              <div className="mb-6">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {user.fullName}
                </h2>
                
                {/* Dekoratif Çizgiler */}
                <div className="flex justify-center gap-2 mb-3">
                  <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                  <div className="w-10 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"></div>
                  <div className="w-4 h-1 bg-pink-300 rounded-full opacity-40"></div>
                </div>
                
                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {user.email}
                </p>
              </div>

              {/* ROZETLER */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-pink-100/50">
                <BadgeDisplay user={user} orderCount={orderCount} />
              </div>
            </div>
          </div>

            {/* Navigasyon */}
            <nav className="p-3 space-y-1">
              <MenuButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")} icon={<FiBox />} label="Siparişlerim" />
              <MenuButton active={activeTab === "addresses"} onClick={() => setActiveTab("addresses")} icon={<FiMapPin />} label="Adres Defteri" />
              <MenuButton active={activeTab === "info"} onClick={() => setActiveTab("info")} icon={<FiUser />} label="Bilgilerim & Şifre" />
              
              <div className="pt-2 mt-2 border-t border-gray-100">
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition flex items-center gap-3"
                >
                  <FiLogOut className="text-lg" /> Çıkış Yap
                </button>
              </div>
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

const MenuButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`
      w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition flex items-center gap-3
      ${active ? "bg-pink-600 text-white shadow-md shadow-pink-200" : "text-gray-600 hover:bg-gray-50"}
    `}
  >
    <span className="text-lg">{icon}</span> {label}
  </button>
);

// =============================================================================
// 1. SİPARİŞ GEÇMİŞİ (MODERN & DETAYLI)
// =============================================================================
const OrderHistory = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
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

  const requestCancelOrder = (e, id) => {
    e.stopPropagation();
    setConfirmData({
      isOpen: true, title: "İptal Talebi Oluştur", message: "Siparişinizin iptali için talep oluşturulacaktır. Onaylıyor musunuz?", isDanger: true,
      action: async () => {
        try {
          await axios.put(`http://localhost:5000/api/orders/${id}`, { status: "İptal Talebi" });
          notify("İptal talebiniz alındı.", "info");
          setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "İptal Talebi" } : o));
        } catch (err) { notify("Hata oluştu", "error"); }
        setConfirmData(null);
      }
    });
  };

  const getStatusColor = (s) => {
    if(s==="Teslim Edildi") return "bg-green-100 text-green-700 border-green-200";
    if(s==="İptal") return "bg-red-100 text-red-700 border-red-200";
    if(s==="İptal Talebi") return "bg-orange-100 text-orange-700 border-orange-200 animate-pulse";
    if(s==="Yola Çıktı") return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  if (loading) return <div className="text-center p-20 text-gray-400 font-bold animate-pulse">Yükleniyor...</div>;
  
  if (orders.length === 0) return (
    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
      <div className="text-5xl mb-4 opacity-30">🛍️</div>
      <h3 className="text-lg font-bold text-gray-700">Henüz Siparişiniz Yok</h3>
      <p className="text-gray-400 text-sm mt-1">Verdiğiniz siparişler burada listelenecek.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {orders.map((order) => {
        const isExpanded = expandedId === order._id;
        return (
        <div 
          key={order._id} 
          className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer overflow-hidden ${isExpanded ? 'border-pink-400 ring-4 ring-pink-50/50' : 'border-gray-200 hover:border-pink-300'}`} 
          onClick={() => setExpandedId(isExpanded ? null : order._id)}
        >
          {/* ÖZET KISMI */}
          <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className={`w-1.5 h-12 rounded-full ${order.status === 'Teslim Edildi' ? 'bg-green-500' : order.status === 'İptal' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              <div>
                <div className="text-sm font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</div>
                <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                    #{order._id.slice(-8).toUpperCase()}
                    {order.status === 'İptal Talebi' && <FiAlertCircle className="text-orange-500" />}
                </div>
              </div>
            </div>
            
            <div className="text-center sm:text-right w-full sm:w-auto">
              <div className="text-xs text-gray-400 font-bold uppercase">Tutar</div>
              <div className="text-xl font-extrabold text-pink-600">£{order.totalAmount.toFixed(2)}</div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              <span className={`text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                {isExpanded ? <FiChevronUp size={20}/> : <FiChevronDown size={20}/>}
              </span>
            </div>
          </div>

          {/* DETAY KISMI */}
          {isExpanded && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-6 cursor-default animate-fade-in" onClick={e => e.stopPropagation()}>
               
               {/* TAKİP ÇUBUĞU */}
               <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <OrderTracker status={order.status} />
               </div>

               {/* BİLGİLER */}
               <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full">
                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><FiUser /> Alıcı Bilgileri</h4>
                     <p className="font-bold text-gray-800 text-lg">{order.recipient.name}</p>
                     <p className="text-sm text-gray-600 mb-2">{order.recipient.phone}</p>
                     <p className="text-sm text-gray-600 leading-snug bg-gray-50 p-2 rounded">{order.recipient.address}, {order.recipient.city}, {order.recipient.postcode}</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full">
                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><FiBox /> Teslimat & Not</h4>
                     <div className="flex items-center gap-3 text-sm font-medium text-blue-600 mb-3">
                        <span className="bg-blue-50 px-2 py-1 rounded">📅 {new Date(order.delivery.date).toLocaleDateString()}</span>
                        <span className="bg-blue-50 px-2 py-1 rounded">⏰ {order.delivery.timeSlot}</span>
                     </div>
                     {order.delivery.cardMessage ? (
                       <div className="text-sm text-pink-700 italic bg-pink-50 p-3 rounded-lg border border-pink-100 relative">
                         <span className="absolute -top-2 -left-1 text-2xl">💌</span> 
                         <span className="ml-6">"{order.delivery.cardMessage}"</span>
                       </div>
                     ) : <span className="text-xs text-gray-400 italic">Kart notu eklenmemiş.</span>}
                  </div>
               </div>

               {/* ÜRÜNLER */}
               <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Sipariş İçeriği</h4>
               <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-pink-300 transition">
                       <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                         <img src={item.img} className="w-full h-full object-cover" alt={item.title} />
                       </div>
                       <div className="flex-1">
                          <div className="font-bold text-gray-800">{item.title}</div>
                          <div className="text-xs text-gray-500">Adet: {item.quantity}</div>
                       </div>
                       <div className="font-extrabold text-gray-700">£{item.price.toFixed(2)}</div>
                    </div>
                  ))}
               </div>
               
               {/* BUTONLAR */}
               <div className="mt-8 flex flex-wrap justify-end gap-3 pt-5 border-t border-gray-200">
                  {order.status === "Sipariş Alındı" && (
                    <button 
                      onClick={(e) => requestCancelOrder(e, order._id)}
                      className="px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition"
                    >
                      İptal Talebi Oluştur
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedInvoice(order)}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg transform active:scale-95"
                  >
                    <FiPrinter /> Faturayı Görüntüle
                  </button>
               </div>

            </div>
          )}
        </div>
      )})}
      
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

// ---------------------------------------------------------
// 2. ADRES DEFTERİ (DÜZELTİLDİ: MODALLI SİLME)
// ---------------------------------------------------------
const AddressBook = ({ user }) => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ title: "", recipientName: "", recipientPhone: "", address: "", city: "Londra", postcode: "" });
  const [confirmData, setConfirmData] = useState(null);
  const { notify } = useCart();

  const fetchAddresses = async () => {
    try { const res = await axios.get(`http://localhost:5000/api/users/${user._id}/addresses`); setAddresses(res.data); } 
    catch(e){} 
  };
  useEffect(() => { fetchAddresses(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAddress.title || !newAddress.address) return notify("Lütfen zorunlu alanları doldurun", "warning");
    try {
      await axios.post(`http://localhost:5000/api/users/${user._id}/addresses`, newAddress);
      notify("Adres başarıyla eklendi ✨", "success");
      setShowForm(false);
      setNewAddress({ title: "", recipientName: "", recipientPhone: "", address: "", city: "Londra", postcode: "" });
      fetchAddresses();
    } catch(e){ notify("Hata oluştu", "error"); }
  };

  const handleDeleteRequest = (id) => {
    setConfirmData({
      isOpen: true, title: "Adresi Sil?", message: "Bu adres kalıcı olarak silinecek.", isDanger: true,
      action: async () => {
        try { await axios.delete(`http://localhost:5000/api/users/${user._id}/addresses/${id}`); notify("Adres silindi.", "success"); fetchAddresses(); } 
        catch { notify("Hata", "error"); }
        setConfirmData(null);
      }
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Kayıtlı Adresler</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-pink-700 flex items-center gap-2 transition shadow-md">
          {showForm ? <><FiX /> İptal</> : <><FiPlus /> Yeni Adres</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-pink-100 shadow-lg mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-down">
           <input placeholder="Adres Başlığı (Örn: Evim)" className="p-3 border rounded-lg outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition" value={newAddress.title} onChange={e=>setNewAddress({...newAddress, title:e.target.value})} required />
           <input placeholder="Alıcı Adı Soyadı" className="p-3 border rounded-lg outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition" value={newAddress.recipientName} onChange={e=>setNewAddress({...newAddress, recipientName:e.target.value})} />
           <input placeholder="Telefon Numarası" className="p-3 border rounded-lg outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition" value={newAddress.recipientPhone} onChange={e=>setNewAddress({...newAddress, recipientPhone:e.target.value})} />
           <input placeholder="Posta Kodu" className="p-3 border rounded-lg outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition" value={newAddress.postcode} onChange={e=>setNewAddress({...newAddress, postcode:e.target.value})} />
           <textarea placeholder="Açık Adres" className="p-3 border rounded-lg outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition md:col-span-2 h-24 resize-none" value={newAddress.address} onChange={e=>setNewAddress({...newAddress, address:e.target.value})} required />
           <button type="submit" className="bg-green-600 text-white py-3 rounded-lg font-bold md:col-span-2 hover:bg-green-700 transition shadow-md">Kaydet</button>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
            <FiMapPin className="mx-auto text-4xl mb-2 opacity-20" />
            <p>Henüz kayıtlı bir adresiniz bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr._id} className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-pink-300 hover:shadow-md transition group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
              <div className="pl-3">
                 <div className="font-bold text-gray-800 flex items-center gap-2 mb-1">
                    <span className="text-lg text-pink-500">🏠</span> {addr.title}
                 </div>
                 <p className="text-sm text-gray-600 font-medium">{addr.recipientName}</p>
                 <p className="text-xs text-gray-400 mb-2">{addr.recipientPhone}</p>
                 <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 leading-relaxed">
                    {addr.address}, {addr.postcode}, {addr.city}
                 </div>
              </div>
              <button 
                onClick={() => handleDeleteRequest(addr._id)} 
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"
                title="Adresi Sil"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

// ---------------------------------------------------------
// 3. KULLANICI BİLGİLERİ & ŞİFRE DEĞİŞTİRME
// ---------------------------------------------------------
const UserInfo = ({ user }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ oldPass: "", newPass: "", confirmPass: "" });
  // YENİ: Profil bilgilerini düzenlemek için state
  const [profileData, setProfileData] = useState({ fullName: user.fullName, phone: user.phone || "" });
  const [isEditing, setIsEditing] = useState(false);
  const { notify } = useCart();

  // Profil Güncelleme Fonksiyonu
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${user._id}`, profileData);
      
      // LocalStorage ve UI güncelle
      const updatedUser = { ...user, ...res.data }; // Gelen yeni verilerle birleştir
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-change")); // Navbar'ı uyar
      
      notify("Profil bilgileri güncellendi! ✅", "success");
      setIsEditing(false);
    } catch (err) {
      notify("Güncelleme başarısız.", "error");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!passwords.oldPass) return notify("Lütfen eski şifrenizi girin", "warning");
    if (passwords.newPass !== passwords.confirmPass) return notify("Yeni şifreler uyuşmuyor", "error");
    if (passwords.newPass.length < 8) return notify("Yeni şifre en az 8 karakter olmalı", "warning");

    try {
      await axios.put(`http://localhost:5000/api/users/${user._id}/change-password`, {
        oldPassword: passwords.oldPass,
        newPassword: passwords.newPass
      });
      notify("Şifre başarıyla değişti! Lütfen tekrar giriş yapın.", "success");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("user-change"));
      setTimeout(() => window.location.href="/login", 2000);
    } catch (err) {
      notify(err.response?.data || "Hata oluştu", "error");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FiUser /> Kişisel Bilgiler</h3>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition"
        >
          {isEditing ? "İptal" : "Düzenle"}
        </button>
      </div>
      
      {/* PROFİL DÜZENLEME FORMU */}
      <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
        
        {/* Ad Soyad */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Ad Soyad</label>
          <input 
            type="text" 
            value={profileData.fullName} 
            onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
            disabled={!isEditing}
            className={`w-full p-2 border-b outline-none transition ${isEditing ? "border-blue-500 bg-blue-50/50" : "border-gray-100 bg-transparent"}`}
          />
        </div>

        {/* E-Posta (Değiştirilemez) */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">E-Posta Adresi</label>
          <div className="text-lg font-medium text-gray-500 border-b border-gray-100 pb-2 cursor-not-allowed">{user.email}</div>
        </div>

        {/* Telefon (YENİ) */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Cep Telefonu</label>
          <input 
            type="text" 
            value={profileData.phone} 
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
            disabled={!isEditing}
            placeholder="+44..."
            className={`w-full p-2 border-b outline-none transition ${isEditing ? "border-blue-500 bg-blue-50/50" : "border-gray-100 bg-transparent"}`}
          />
        </div>

        {/* Kaydet Butonu */}
        {isEditing && (
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
            Değişiklikleri Kaydet
          </button>
        )}

      </form>

      {/* ŞİFRE DEĞİŞTİRME */}
      <div className="pt-8 mt-8 border-t border-gray-100">
        {!showPasswordForm ? (
          <button 
            onClick={() => setShowPasswordForm(true)} 
            className="flex items-center gap-2 text-pink-600 font-bold hover:bg-pink-50 px-5 py-3 rounded-xl transition border-2 border-pink-100 hover:border-pink-200"
          >
            <span>🔒</span> Şifremi Değiştir
          </button>
        ) : (
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in-down">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-700">Güvenlik Ayarları</h4>
              <button onClick={() => setShowPasswordForm(false)} className="text-xs text-gray-500 hover:text-red-500 font-bold px-2 py-1 rounded hover:bg-white transition">İptal</button>
            </div>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mevcut Şifre</label><input type="password" required className="w-full p-3 border rounded-lg outline-none focus:border-pink-500 bg-white" placeholder="••••••••" onChange={e => setPasswords({...passwords, oldPass: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yeni Şifre</label><input type="password" required minLength={8} className="w-full p-3 border rounded-lg outline-none focus:border-pink-500 bg-white" onChange={e => setPasswords({...passwords, newPass: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yeni Şifre (Tekrar)</label><input type="password" required minLength={8} className="w-full p-3 border rounded-lg outline-none focus:border-pink-500 bg-white" onChange={e => setPasswords({...passwords, confirmPass: e.target.value})} /></div>
              <button type="submit" className="bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition w-full shadow-md mt-2 active:scale-95">Şifreyi Güncelle</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;