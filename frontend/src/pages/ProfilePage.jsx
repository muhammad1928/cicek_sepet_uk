import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("info"); // info, password, addresses
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Şifre Değiştirme State'leri
  const [passwords, setPasswords] = useState({ newPass: "", confirmPass: "" });
  
  const navigate = useNavigate();
  const { notify } = useCart();

  // Kullanıcı Verilerini Çek
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
    fetchAddresses(storedUser._id);
  }, [navigate]);

  const fetchAddresses = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}/addresses`);
      setAddresses(res.data);
    } catch (err) { console.log(err); } 
    finally { setLoading(false); }
  };

  // Şifre Güncelleme
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) {
      notify("Şifreler uyuşmuyor!", "error");
      return;
    }
    if (passwords.newPass.length < 6) {
      notify("Şifre en az 6 karakter olmalı", "warning");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/users/${user._id}`, {
        password: passwords.newPass
      });
      notify("Şifreniz başarıyla güncellendi! Lütfen tekrar giriş yapın.", "success");
      localStorage.removeItem("user");
      setTimeout(() => {
          window.location.href = "/login";
      }, 2000);
    } catch (err) {
      notify("Güncelleme başarısız.", "error");
    }
  };

  // Adres Silme
  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Bu adresi silmek istiyor musunuz?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${user._id}/addresses/${addressId}`);
      notify("Adres silindi.", "success");
      fetchAddresses(user._id); // Listeyi yenile
    } catch (err) {
      notify("Hata oluştu.", "error");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Hesabım</h1>

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* SOL MENÜ */}
          <aside className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
            <div className="p-6 border-b border-gray-100 text-center">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {user?.username[0].toUpperCase()}
              </div>
              <h2 className="font-bold text-gray-800">{user?.username}</h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <nav className="p-2">
              <button onClick={() => setActiveTab("info")} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition ${activeTab === "info" ? "bg-pink-50 text-pink-600" : "text-gray-600 hover:bg-gray-50"}`}>👤 Profil Bilgileri</button>
              <button onClick={() => setActiveTab("password")} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition ${activeTab === "password" ? "bg-pink-50 text-pink-600" : "text-gray-600 hover:bg-gray-50"}`}>🔒 Şifre Değiştir</button>
              <button onClick={() => setActiveTab("addresses")} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition ${activeTab === "addresses" ? "bg-pink-50 text-pink-600" : "text-gray-600 hover:bg-gray-50"}`}>📍 Kayıtlı Adresler</button>
            </nav>
          </aside>

          {/* SAĞ İÇERİK */}
          <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
            
            {/* --- PROFİL BİLGİLERİ --- */}
            {activeTab === "info" && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Profil Bilgileri</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Kullanıcı Adı</label>
                    <div className="p-3 bg-gray-50 rounded border text-gray-700 font-medium">{user.username}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">E-Posta</label>
                    <div className="p-3 bg-gray-50 rounded border text-gray-700 font-medium">{user.email}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Rol</label>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full inline-block mt-1">{user.role.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* --- ŞİFRE DEĞİŞTİR --- */}
            {activeTab === "password" && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Şifre Değiştir</h3>
                <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Yeni Şifre</label>
                    <input 
                      type="password" required minLength={6}
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-pink-500 outline-none"
                      onChange={(e) => setPasswords({...passwords, newPass: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Yeni Şifre (Tekrar)</label>
                    <input 
                      type="password" required minLength={6}
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-pink-500 outline-none"
                      onChange={(e) => setPasswords({...passwords, confirmPass: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-700 transition">Güncelle</button>
                </form>
              </div>
            )}

            {/* --- ADRESLER --- */}
            {activeTab === "addresses" && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Kayıtlı Adreslerim ({addresses.length})</h3>
                
                {addresses.length === 0 ? (
                  <p className="text-gray-400">Henüz kayıtlı adresiniz yok. Sipariş verirken otomatik kaydedilir.</p>
                ) : (
                  <div className="grid gap-4">
                    {addresses.map((addr) => (
                      <div key={addr._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition flex justify-between items-start">
                        <div>
                          <div className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-xl">🏠</span> {addr.title || "Adresim"}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{addr.recipientName} - {addr.recipientPhone}</p>
                          <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded inline-block">
                            {addr.address}, {addr.city}, {addr.postcode}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;