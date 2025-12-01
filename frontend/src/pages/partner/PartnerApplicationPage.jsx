import { useState, useEffect } from "react";
import { userRequest } from "../requestMethods";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const PartnerApplicationPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  
  // Status: loading | pending | approved | rejected | form
  const [viewStatus, setViewStatus] = useState("loading"); 
  const [uploading, setUploading] = useState(false);
  const { notify } = useCart();

  useEffect(() => {
    const checkStatus = async () => {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (!localUser) { navigate("/login"); return; }

      try {
        // 1. Backend'den EN GÜNCEL kullanıcı verisini çek
        const res = await userRequest.get(`/users/${localUser._id}`);
        const currentUser = res.data;

        // 2. State'i ve LocalStorage'ı güncelle (Senkronize et)
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));

        // 3. Duruma göre ekranı ayarla
        if (currentUser.applicationStatus === 'approved') {
          // Onaylanmışsa panele postala
          navigate(currentUser.role === 'vendor' ? '/vendor' : '/courier');
        } else if (currentUser.applicationStatus === 'pending') {
          setViewStatus("pending");
        } else if (currentUser.applicationStatus === 'rejected') {
          setViewStatus("rejected"); // <--- ARTIK REDDEDİLDİ EKRANINA DÜŞECEK
        } else {
          setViewStatus("form");
        }
      } catch (err) {
        console.log("Veri çekilemedi, local veri kullanılıyor.");
        setUser(localUser); // Hata olursa eskisiyle devam et
      }
    };

    checkStatus();
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); const data = new FormData(); data.append("file", file);
    try { const res = await userRequest.post("/upload", data); setFormData({ ...formData, licenseImage: res.data, documentImage: res.data }); notify("Dosya yüklendi ✅", "success"); } 
    catch { notify("Hata!", "error"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userRequest.post(`/users/${user._id}/apply`, formData);
      
      // LocalStorage Güncelle
      const updatedUser = { ...user, applicationStatus: 'pending' };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setViewStatus("pending");
      notify("Başvuru gönderildi! 🚀", "success");
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  // --- EKRAN 1: ONAY BEKLİYOR ---
  if (viewStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border-l-4 border-yellow-400 animate-fade-in">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">İnceleme Sürüyor</h2>
          <p className="text-gray-600">
            Başvurunuz yöneticilerimiz tarafından incelenmektedir. Sonuçlandığında e-posta ile bilgilendirileceksiniz.
          </p>
          <button onClick={() => {
              localStorage.removeItem("user");
              window.dispatchEvent(new Event("user-change")); // <--- EKLENDİ
              navigate("/");
          }} className="mt-6 text-gray-400 hover:text-red-500 text-sm font-bold">Çıkış Yap</button>
        </div>
      </div>
    );
  }

  // --- EKRAN 2: REDDEDİLDİ (YENİ) ---
  if (viewStatus === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border-l-4 border-red-500 animate-shake">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Başvuru Reddedildi</h2>
          <p className="text-gray-600 mb-4">
            Üzgünüz, başvurunuz onaylanamadı.
          </p>
          
          {user.applicationData?.rejectionReason && (
            <div className="bg-red-50 p-3 rounded border border-red-100 text-red-800 text-sm font-bold mb-6">
              " {user.applicationData.rejectionReason} "
            </div>
          )}

          <button 
            onClick={() => setViewStatus("form")} // Formu tekrar aç
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg"
          >
            Bilgileri Düzenle ve Tekrar Gönder ↻
          </button>
        </div>
      </div>
    );
  }

  // --- EKRAN 3: BAŞVURU FORMU ---
  if (viewStatus === "form" && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans pt-24">
        <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            {user.role === 'vendor' ? '🏪 Mağaza Başvurusu' : '🛵 Kurye Başvurusu'}
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">Eksik veya hatalı bilgileri düzeltip tekrar gönderin.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ORTAK ALAN: TELEFON */}
            <input name="phone" placeholder="Cep Telefonu" onChange={handleChange} className="w-full p-3 border rounded bg-gray-50 focus:bg-white transition" required />

            {/* KURYE ÖZEL */}
            {(user.role === 'courier' || user.applicationData?.requestedRole === 'courier') && (
              <>
                <select name="vehicleType" onChange={handleChange} className="w-full p-3 border rounded bg-white" required>
                  <option value="">Araç Tipi Seçiniz...</option>
                  <option value="motor">Motosiklet</option>
                  <option value="car">Otomobil</option>
                </select>
                <input name="plateNumber" placeholder="Plaka No" onChange={handleChange} className="w-full p-3 border rounded" required />
                
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center hover:bg-gray-50 transition cursor-pointer">
                   <label className="cursor-pointer block">
                     <span className="text-blue-600 font-bold">{uploading ? "Yükleniyor..." : "+ Ehliyet Fotoğrafı (Yenile)"}</span>
                     <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                   </label>
                   {formData.licenseImage && <p className="text-xs text-green-600 mt-2 font-bold">Yeni Dosya Seçildi ✅</p>}
                </div>
              </>
            )}

            {/* SATICI ÖZEL */}
            {(user.role === 'vendor' || user.applicationData?.requestedRole === 'vendor') && (
               <>
                <input name="companyName" placeholder="Şirket Adı" onChange={handleChange} className="w-full p-3 border rounded" required />
                <div className="grid grid-cols-2 gap-3">
                   <input name="taxNumber" placeholder="Vergi No" onChange={handleChange} className="w-full p-3 border rounded" required />
                   <input name="iban" placeholder="IBAN" onChange={handleChange} className="w-full p-3 border rounded" required />
                </div>
                <textarea name="address" placeholder="Mağaza Adresi" onChange={handleChange} className="w-full p-3 border rounded h-20" required />
                
                <div className="border-2 border-dashed border-purple-300 p-3 rounded-lg text-center hover:bg-purple-50 transition">
                   <label className="cursor-pointer block">
                     <span className="text-purple-600 font-bold text-sm">{uploading ? "Yükleniyor..." : "+ Belge Yükle (Yenile)"}</span>
                     <input type="file" className="hidden" onChange={handleUpload} accept="image/*,application/pdf" />
                   </label>
                   {formData.documentImage && <p className="text-[10px] text-green-600 mt-1 font-bold">Yeni Dosya Seçildi ✅</p>}
                </div>
               </>
            )}

            <button type="submit" disabled={uploading} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg transform active:scale-95">
              {uploading ? "Yükleniyor..." : "Başvuruyu Güncelle ve Gönder"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <div className="text-center pt-40">Yükleniyor...</div>;
};

export default PartnerApplicationPage;