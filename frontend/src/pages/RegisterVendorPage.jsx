import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import TermsModal from "../components/TermsModal";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";

const RegisterVendorPage = () => {
  // Kayıt Verileri (Giriş yapmamışsa) - username yerine fullName kullanıyoruz
  const [regData, setRegData] = useState({ fullName: "", email: "", password: "", role: "customer" });
  
  // Başvuru Verileri (Giriş yapmışsa)
  const [appData, setAppData] = useState({ companyName: "", taxNumber: "", iban: "", address: "", phone: "" });
  
  // Yüklenen Belge (Vergi Levhası vb.)
  const [docFile, setDocFile] = useState(null); 

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const navigate = useNavigate();
  const { notify } = useCart();
  const user = JSON.parse(localStorage.getItem("user"));

  // Yönlendirme Kontrolleri
  useEffect(() => {
    if (user?.role === 'vendor') navigate("/vendor");
    if (user?.applicationStatus === 'pending') navigate("/partner-application");
  }, [user, navigate]);

  // Input Değişimleri
  const handleRegChange = (e) => setRegData({ ...regData, [e.target.name]: e.target.value });
  const handleAppChange = (e) => setAppData({ ...appData, [e.target.name]: e.target.value });

  // Belge Yükleme Fonksiyonu
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", data);
      setDocFile(res.data);
      notify("Belge başarıyla yüklendi ✅", "success");
    } catch (err) {
      notify("Yükleme hatası oluştu!", "error");
    } finally {
      setUploading(false);
    }
  };

  // Form Gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return notify("Satıcı sözleşmesini onaylamalısınız!", "warning");
    
    setLoading(true);

    try {
      if (user) {
        // SENARYO A: Zaten üye (Müşteri) -> Satıcı Başvurusu Yapıyor
        if (!docFile) {
            setLoading(false);
            return notify("Lütfen Vergi Levhası veya Şirket Belgesi yükleyin.", "warning");
        }

        // Başvuruyu Gönder (requestedRole: vendor)
        await axios.post(`http://localhost:5000/api/users/${user._id}/apply`, {
          ...appData,
          documentImage: docFile, // Yüklenen belgenin linki
          requestedRole: "vendor"
        });
        
        // LocalStorage'ı güncelle (Beklemede durumuna al)
        const updatedUser = { ...user, applicationStatus: 'pending' };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        notify("Başvuru Alındı! 🎉 Onay bekleniyor.", "success");
        setTimeout(() => navigate("/partner-application"), 1500);

      } else {
        // SENARYO B: Yeni Ziyaretçi -> Önce Hesap Oluşturuyor
        // fullName alanını gönderiyoruz, role 'customer' olarak başlıyor
        await axios.post("http://localhost:5000/api/auth/register", { 
            ...regData, 
            role: "customer" 
        });
        
        notify("Hesap Oluşturuldu! 🎉 Lütfen giriş yapıp mağaza belgelerinizi yükleyin.", "success");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setLoading(false);
      notify(err.response?.data?.message || "İşlem başarısız!", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-900 p-4 font-sans relative overflow-hidden pt-20">
      <Seo title="Mağaza Aç" description="ÇiçekSepeti UK'de mağazanızı açın." />
      
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in">
        
        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-full bg-purple-100 text-purple-600 mb-3 text-3xl">🏪</div>
          <h2 className="text-2xl font-extrabold text-gray-800">
            {user ? `Mağaza Başvurusu: ${user.fullName}` : "Mağazanızı Açın"}
          </h2>
          <p className="text-gray-500 text-sm">Binlerce müşteriye ulaşın, satışlarınızı artırın.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- DURUM 1: GİRİŞ YAPMAMIŞSA (KAYIT FORMU) --- */}
          {!user && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Yetkili Ad Soyad</label>
                    <input name="fullName" onChange={handleRegChange} className="w-full p-2 border rounded" placeholder="Ad Soyad" required />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">E-Posta</label>
                    <input name="email" type="email" onChange={handleRegChange} className="w-full p-2 border rounded" required />
                </div>
              </div>
              <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Şifre</label>
                  <input name="password" type="password" onChange={handleRegChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 mb-2">
                💡 Önce hesabınızı oluşturacağız. Giriş yaptıktan sonra mağaza detaylarını ve belgeleri yükleyeceksiniz.
              </div>
            </>
          )}

          {/* --- DURUM 2: GİRİŞ YAPMIŞSA (BAŞVURU FORMU) --- */}
          {user && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
               <h3 className="font-bold text-gray-700 text-sm border-b pb-2 mb-3">Mağaza Detayları</h3>
               
               <input name="companyName" placeholder="Resmi Şirket Adı" onChange={handleAppChange} className="w-full p-2 border rounded text-sm" required />
               
               <div className="grid grid-cols-2 gap-3">
                 <input name="taxNumber" placeholder="Vergi No" onChange={handleAppChange} className="w-full p-2 border rounded text-sm" required />
                 <input name="phone" placeholder="İletişim Telefonu" onChange={handleAppChange} className="w-full p-2 border rounded text-sm" required />
               </div>
               
               <input name="iban" placeholder="IBAN (TR...)" onChange={handleAppChange} className="w-full p-2 border rounded text-sm" required />
               
               <textarea name="address" placeholder="Mağaza / Depo Adresi" onChange={handleAppChange} className="w-full p-2 border rounded text-sm h-16" required />

               {/* BELGE YÜKLEME ALANI */}
               <div className="border-2 border-dashed border-purple-300 p-3 rounded-lg text-center bg-white hover:bg-purple-50 transition">
                   <label className="cursor-pointer block">
                     <span className="text-purple-600 font-bold text-sm">
                        {uploading ? "Yükleniyor..." : "+ Vergi Levhası / Belge Yükle"}
                     </span>
                     <input type="file" className="hidden" onChange={handleUpload} accept="image/*,application/pdf" disabled={uploading} />
                   </label>
                   {docFile && <p className="text-[10px] text-green-600 mt-1 font-bold">Dosya Yüklendi ✅</p>}
                </div>
            </div>
          )}

          {/* SÖZLEŞME VE BUTON */}
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-4 h-4 accent-purple-600 cursor-pointer" />
            <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
              <span className="text-purple-600 font-bold hover:underline mr-1" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>Satıcı Sözleşmesini</span>
              okudum ve kabul ediyorum.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || uploading} 
            className={`w-full text-white font-bold py-3 rounded-xl transition shadow-lg flex justify-center items-center
              ${(loading || uploading) ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 active:scale-95"}`}
          >
            {loading ? "İşleniyor..." : (user ? "Başvuruyu Gönder" : "Hesap Oluştur")}
          </button>

        </form>
        
        {!user && <div className="mt-4 text-center text-xs text-gray-500"><Link to="/login" className="hover:text-purple-600 font-bold">Zaten hesabınız var mı? Giriş Yapın</Link></div>}
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} type="vendor" />}
    </div>
  );
};

export default RegisterVendorPage;