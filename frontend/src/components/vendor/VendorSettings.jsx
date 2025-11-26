import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";

const VendorSettings = ({ user }) => {
  const { notify } = useCart();
  const [formData, setFormData] = useState({
    logo: "",
    banner: "",
    description: "",
    phone: ""
  });
  const [uploading, setUploading] = useState(false);

  // Mevcut bilgileri çek
  useEffect(() => {
    if (user.storeSettings) {
      setFormData(user.storeSettings);
    }
  }, [user]);

  // Resim Yükleme (Logo veya Banner)
  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", data);
      setFormData(prev => ({ ...prev, [field]: res.data }));
      notify(`${field === 'logo' ? 'Logo' : 'Banner'} yüklendi!`, "success");
    } catch (err) {
      notify("Yükleme hatası", "error");
    } finally {
      setUploading(false);
    }
  };

  // Kaydet
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // User güncelleme rotasını kullanıyoruz (Backend'de users.js içindeki PUT /:id)
      // Mevcut user verilerini koruyup sadece storeSettings'i güncelliyoruz
      await axios.put(`http://localhost:5000/api/users/${user._id}`, {
        storeSettings: formData
      });
      
      // LocalStorage'ı güncelle ki sayfa yenilenince gitmesin
      const updatedUser = { ...user, storeSettings: formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      notify("Mağaza ayarları kaydedildi! 🎉", "success");
    } catch (err) {
      notify("Hata oluştu", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mağaza Görünümü</h2>

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Banner Alanı */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Kapak Fotoğrafı (Banner)</label>
            <div className="relative h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-pink-400 transition group">
              {formData.banner ? (
                <img src={formData.banner} className="w-full h-full object-cover" alt="Banner" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">Görsel Yok</div>
              )}
              
              {/* Yükleme Butonu */}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white font-bold">
                {uploading ? "Yükleniyor..." : "📷 Değiştir"}
                <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'banner')} accept="image/*" disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Logo Alanı */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-bold text-gray-700 mb-2">Logo</label>
              <div className="relative w-32 h-32 bg-gray-100 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-pink-400 transition group mx-auto md:mx-0">
                {formData.logo ? (
                  <img src={formData.logo} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-2xl">🏪</div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-xs font-bold">
                  {uploading ? "..." : "Değiştir"}
                  <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'logo')} accept="image/*" disabled={uploading} />
                </label>
              </div>
            </div>

            {/* Bilgi Alanları */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mağaza Açıklaması</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-xl outline-none focus:border-pink-500 h-24"
                  placeholder="Müşterilerinize mağazanızı anlatın..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">İletişim Telefonu</label>
                <input 
                  type="text"
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border rounded-xl outline-none focus:border-pink-500"
                  placeholder="0555..."
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
             <button 
               type="submit" 
               className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition shadow-lg"
               disabled={uploading}
             >
               Ayarları Kaydet
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default VendorSettings;