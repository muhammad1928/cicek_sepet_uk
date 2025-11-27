import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import TermsModal from "../components/TermsModal";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";

// Araç Tipleri Listesi
const VEHICLE_TYPES = [
  { value: "motor", label: "Motosiklet 🏍️" },
  { value: "car", label: "Otomobil 🚗" },
  { value: "van", label: "Ticari Araç (Van) 🚐" },
  { value: "bicycle", label: "Bisiklet 🚲" }
];

const RegisterCourierPage = () => {
  // Kayıt Verileri (Giriş yapmamışsa) - username yerine fullName
  const [regData, setRegData] = useState({ fullName: "", email: "", password: "", role: "customer" });
  
  // Başvuru Verileri (Giriş yapmışsa)
  const [appData, setAppData] = useState({ phone: "", vehicleType: "", plateNumber: "", licenseNumber: "", address: "", taxNumber: "", iban: "" });
  
  // Yüklenen Ehliyet Dosyası
  const [licenseFile, setLicenseFile] = useState(null);
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const navigate = useNavigate();
  const { notify } = useCart();
  const user = JSON.parse(localStorage.getItem("user"));

  // Yönlendirme Kontrolleri
  useEffect(() => {
    if (user?.role === 'courier') navigate("/courier");
    if (user?.applicationStatus === 'pending') navigate("/partner-application");
  }, [user, navigate]);

  const handleRegChange = (e) => setRegData({ ...regData, [e.target.name]: e.target.value });
  const handleAppChange = (e) => setAppData({ ...appData, [e.target.name]: e.target.value });

  // --- GÜVENLİ RESİM YÜKLEME ---
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try { 
        // Backend üzerinden yükleme (Güvenli)
        const res = await axios.post("http://localhost:5000/api/upload", data); 
        setLicenseFile(res.data); 
        notify("Ehliyet yüklendi ✅", "success"); 
    } catch (err) { 
        notify("Yükleme hatası oluştu!", "error"); 
    } finally { 
        setUploading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return notify("Sözleşmeyi onaylayın!", "warning");
    setLoading(true);

    try {
      if (user) {
        // SENARYO A: Zaten üye -> Başvuru Yap (Upgrade)
        if (!licenseFile) { setLoading(false); return notify("Lütfen ehliyet yükleyin.", "warning"); }
        
        await axios.post(`http://localhost:5000/api/users/${user._id}/apply`, {
          ...appData,
          licenseImage: licenseFile,
          requestedRole: "courier"
        });
        
        // LocalStorage güncelle
        const updatedUser = { ...user, applicationStatus: 'pending' };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        notify("Başvuru Alındı! 🎉 Onay bekleniyor.", "success");
        setTimeout(() => navigate("/partner-application"), 1500);

      } else {
        // SENARYO B: Yeni Kayıt -> Hesap Oluştur (fullName ile)
        await axios.post("http://localhost:5000/api/auth/register", { 
            fullName: regData.fullName, // <--- DÜZELTİLDİ
            email: regData.email,
            password: regData.password,
            role: "customer" 
        });
        
        notify("Hesap Oluşturuldu! 🎉 Lütfen giriş yapıp belgelerinizi yükleyin.", "success");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setLoading(false);
      notify(err.response?.data?.message || "Hata!", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-700 p-4 font-sans pt-20">
      <Seo title="Kurye Ol" description="ÇiçekSepeti UK kurye ekibine katılın." />
      
      {/* Arka Plan */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl animate-fade-in relative z-10 h-[85vh] overflow-y-auto scrollbar-hide">
        
        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-full bg-blue-100 text-blue-600 mb-3 text-3xl">🛵</div>
          <h2 className="text-2xl font-extrabold text-gray-800">{user ? `Kurye Başvurusu: ${user.fullName}` : "Kuryemiz Olun"}</h2>
          <p className="text-gray-500 text-xs">Kendi işinin patronu ol, teslim ettikçe kazan.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- DURUM 1: GİRİŞ YAPMAMIŞSA (KAYIT FORMU) --- */}
          {!user && (
             <div className="space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Ad Soyad</label>
                    <input name="fullName" onChange={handleRegChange} className="w-full p-2 border rounded" placeholder="Ad Soyad" required />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">E-Posta</label>
                    <input name="email" type="email" onChange={handleRegChange} className="w-full p-2 border rounded" placeholder="Email" required />
                 </div>
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Şifre</label>
                  <input name="password" type="password" onChange={handleRegChange} className="w-full p-2 border rounded" placeholder="Şifre" required />
               </div>
               <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 mb-2">💡 Önce hesabınızı oluşturacağız. Giriş yaptıktan sonra araç ve ehliyet bilgilerini gireceksiniz.</div>
             </div>
          )}

          {/* --- DURUM 2: GİRİŞ YAPMIŞSA (BAŞVURU FORMU) --- */}
          {user && (
             <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
               <h3 className="font-bold text-gray-700 text-sm border-b pb-2 mb-3">Araç ve Belge Bilgileri</h3>
               
               <input name="phone" placeholder="Cep Telefonu" onChange={handleAppChange} className="w-full p-2 border rounded text-sm" required />
               
               <div className="grid grid-cols-2 gap-3">
                 <select name="vehicleType" onChange={handleAppChange} className="w-full p-2 border rounded bg-white text-sm" required>
                   <option value="">Araç Tipi...</option>
                   {VEHICLE_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                 </select>
                 
                 <input name="plateNumber" placeholder="Plaka No" onChange={handleAppChange} className="w-full p-2 border rounded text-sm" required />
               </div>

               <input name="licenseNumber" placeholder="TC / Ehliyet No" onChange={handleAppChange} className="w-full p-2 border rounded text-sm" required />
               
               {/* EK ALANLAR: VERGİ NO VE IBAN */}
               <div className="grid grid-cols-2 gap-3">
                  <input name="taxNumber" placeholder="Vergi No (Varsa)" onChange={handleAppChange} className="w-full p-2 border rounded text-sm" />
                  <input name="iban" placeholder="IBAN (TR...)" onChange={handleAppChange} className="w-full p-2 border rounded text-sm" required />
               </div>

               {/* ADRES (TEXTAREA - Haritasız) */}
               <textarea 
                 name="address" 
                 placeholder="İkamet Adresi (Fatura ve yasal işlemler için)" 
                 onChange={handleAppChange} 
                 className="w-full p-2 border rounded text-sm h-16" 
                 required 
               />
               
               {/* BELGE YÜKLEME */}
               <div className="border-2 border-dashed border-gray-300 p-3 rounded-lg text-center bg-white hover:bg-gray-50 transition cursor-pointer">
                   <label className="cursor-pointer block">
                     <span className="text-blue-600 font-bold text-sm">{uploading ? "Yükleniyor..." : "+ Ehliyet Fotoğrafı Yükle"}</span>
                     <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
                   </label>
                   {licenseFile && <p className="text-[10px] text-green-600 mt-1 font-bold">Dosya Yüklendi ✅</p>}
                </div>
             </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
            <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
              <span className="text-blue-600 font-bold hover:underline mr-1" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>Kurye Sözleşmesini</span>
              okudum ve kabul ediyorum.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || uploading} 
            className={`w-full text-white bg-blue-600 hover:bg-blue-700 font-bold py-3 rounded-xl transition shadow-lg flex justify-center items-center gap-2
              ${(loading || uploading) ? "bg-blue-400 cursor-not-allowed" : ""}`}
          >
            {loading ? "İşleniyor..." : (user ? "Başvuruyu Gönder" : "Hesap Oluştur")}
          </button>

        </form>
        
        {!user && <div className="mt-4 text-center text-xs text-gray-500"><Link to="/login" className="hover:text-blue-600 font-bold">Zaten hesabınız var mı? Giriş Yapın</Link></div>}
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} type="courier" />}
    </div>
  );
};

export default RegisterCourierPage;