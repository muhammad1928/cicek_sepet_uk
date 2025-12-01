import { useState, useEffect } from "react";
import axios from "axios";
import { publicRequest, userRequest } from "../requestMethods";
import { useNavigate, Link } from "react-router-dom";
import TermsModal from "../components/TermsModal";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";
import LocationPicker from "../components/LocationPicker"; // Harita Bileşeni
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterVendorPage = () => {
  // --- STATE TANIMLARI ---
  
  // 1. Kayıt Verileri (Giriş yapmamışsa)
  const [regData, setRegData] = useState({ fullName: "", email: "", password: "", role: "customer" });
  
  // 2. Başvuru Verileri (Giriş yapmışsa)
  const [appData, setAppData] = useState({ companyName: "", taxNumber: "", iban: "", address: "", phone: "" });
  
  // 3. Dosya ve Yükleme Durumları
  const [docFile, setDocFile] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // 4. Sözleşme ve Modal
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // 5. Şifre Güvenlik (Göz İkonu ve Kurallar)
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [rules, setRules] = useState({ length: false, upper: false, lower: false, number: false, special: false });

  const navigate = useNavigate();
  const { notify } = useCart();
  
  // Mevcut Kullanıcıyı Kontrol Et
  const user = JSON.parse(localStorage.getItem("user"));

  // Yönlendirme Kontrolleri
  useEffect(() => {
    if (user?.role === 'vendor') navigate("/vendor");
    if (user?.applicationStatus === 'pending') navigate("/partner-application");
  }, [user, navigate]);

  // --- INPUT HANDLERS ---

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegData({ ...regData, [name]: value });

    // Şifre Kuralları
    if (name === "password") {
      const newRules = {
        length: value.length >= 8,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      };
      setRules(newRules);
      setPasswordValid(Object.values(newRules).every(Boolean));
    }
  };

  const handleAppChange = (e) => setAppData({ ...appData, [e.target.name]: e.target.value });

  // Haritadan Adres Seçimi (Otomatik Doldurma)
  const handleLocationSelect = (addressText) => {
    setAppData(prev => ({ ...prev, address: addressText }));
    notify("Konum adrese işlendi 📍", "success");
  };

  // Güvenli Resim Yükleme (Backend Üzerinden)
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await publicRequest.post("/upload", data);
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
    
    // Şifre kontrolü (Sadece yeni kayıt ise)
    if (!user && !passwordValid) return notify("Şifreniz yeterince güçlü değil!", "error");

    setLoading(true);

    try {
      if (user) {
        // SENARYO A: Zaten üye -> Başvuru Yap (Upgrade)
        if (!docFile) { setLoading(false); return notify("Lütfen Vergi Levhası/Belge yükleyin.", "warning"); }
        
        await userRequest.post(`/users/${user._id}/apply`, {
          ...appData,
          documentImage: docFile,
          requestedRole: "vendor"
        });
        
        // LocalStorage güncelle
        const updatedUser = { ...user, applicationStatus: 'pending' };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        notify("Başvuru Alındı! 🎉 Onay bekleniyor.", "success");
        setTimeout(() => navigate("/partner-application"), 1500);

      } else {
        // SENARYO B: Yeni Kayıt -> Hesap Oluştur
        await publicRequest.post("/auth/register", { 
            fullName: regData.fullName,
            email: regData.email,
            password: regData.password,
            role: "customer" // Önce müşteri olarak başlar
        });
        
        notify("Hesap Oluşturuldu! 🎉 Lütfen giriş yapıp mağaza detaylarını girin.", "success");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setLoading(false);
      notify(err.response?.data?.message || "İşlem başarısız!", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-900 p-4 font-sans relative overflow-hidden pt-2">
      <Seo title="Mağaza Aç" description="ÇiçekSepeti UK'de mağazanızı açın." />
      
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      {/* --- MODERN SCROLLBAR STİLİ --- */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.4);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>

      {/* Kart Yapısı */}
      <div className="bg-white w-full max-w-3xl p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in h-auto max-h-[85vh] flex flex-col">
        
       <div className="flex items-center justify-center space-x-6 mb-6">
        <div className="inline-block p-3 rounded-full bg-purple-100 text-purple-600 text-3xl">🏪</div>
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-800">
            {user ? `Mağaza Başvurusu: ${user.fullName}` : "Mağazanızı Açın"}
          </h2>
          <p className="text-gray-500 text-sm">Binlerce müşteriye ulaşın, satışlarınızı artırın.</p>
        </div>
      </div>

        {/* SCROLL ALANI */}
        <div className="overflow-y-auto flex-1 pr-2 custom-scroll">
          <form onSubmit={handleSubmit} className="space-y-5 pb-2">
            
            {/* --- DURUM 1: GİRİŞ YAPMAMIŞSA (KAYIT FORMU) --- */}
            {!user && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Yetkili Ad Soyad</label>
                      <input name="fullName" onChange={handleRegChange} className="w-full p-3 border rounded outline-none focus:border-purple-500" placeholder="Ad Soyad" required />
                  </div>
                  <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">E-Posta</label>
                      <input name="email" type="email" onChange={handleRegChange} className="w-full p-3 border rounded outline-none focus:border-purple-500" required />
                  </div>
                </div>

                <div className="relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Şifre</label>
                    <div className="flex items-center border rounded bg-white overflow-hidden relative">
                      <input 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        onChange={handleRegChange} 
                        className="w-full p-3 outline-none" 
                        required 
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 text-gray-400 hover:text-purple-600 transition">
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {/* Dinamik Kural Listesi */}
                    {(passwordFocused || (regData.password && !passwordValid)) && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-[10px] transition-all duration-300">
                        <p className="font-bold text-gray-400 mb-1 uppercase">Gereksinimler:</p>
                        <div className="flex flex-col gap-1">
                          <RuleItem label="En az 8 karakter" valid={rules.length} />
                          <RuleItem label="1 Büyük Harf" valid={rules.upper} />
                          <RuleItem label="1 Küçük Harf" valid={rules.lower} />
                          <RuleItem label="1 Rakam" valid={rules.number} />
                          <RuleItem label="1 Özel Karakter (!@#$)" valid={rules.special} />
                        </div>
                        {passwordValid && <div className="text-green-600 font-bold mt-1">✅ Şifre Güçlü!</div>}
                      </div>
                    )}
                </div>

                <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 mb-2">
                  💡 Önce hesap oluşturacağız. Giriş yaptıktan sonra mağaza detaylarını gireceksiniz.
                </div>
              </>
            )}

            {/* --- DURUM 2: GİRİŞ YAPMIŞSA (BAŞVURU FORMU) --- */}
            {user && (
              <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                 <h3 className="font-bold text-gray-700 text-sm border-b pb-3 mb-2">Mağaza Detayları</h3>
                 
                 <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Şirket Adı</label>
                    <input name="companyName" placeholder="Resmi Şirket Adı" onChange={handleAppChange} className="w-full p-3 border rounded text-sm outline-none focus:border-purple-500 bg-white" required />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Vergi No</label>
                      <input name="taxNumber" placeholder="Vergi No" onChange={handleAppChange} className="w-full p-3 border rounded text-sm outline-none focus:border-purple-500 bg-white" required />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Telefon</label>
                      <input name="phone" placeholder="İletişim Telefonu" onChange={handleAppChange} className="w-full p-3 border rounded text-sm outline-none focus:border-purple-500 bg-white" required />
                   </div>
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">IBAN (TR...)</label>
                    <input name="iban" placeholder="IBAN" onChange={handleAppChange} className="w-full p-3 border rounded text-sm outline-none focus:border-purple-500 bg-white" required />
                 </div>

                 {/* Harita */}
                 <LocationPicker onSelect={handleLocationSelect} />
                 
                 <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Adres (Düzenlenebilir)</label>
                    <textarea 
                      name="address" 
                      placeholder="Mağaza Adresi (Haritadan seçin veya elle yazın)" 
                      value={appData.address} 
                      onChange={handleAppChange} 
                      className="w-full p-3 border rounded text-sm h-24 resize-none outline-none focus:border-purple-500 bg-white" 
                      required 
                    />
                 </div>

                 {/* Belge Yükleme */}
                 <div className="border-2 border-dashed border-purple-300 p-4 rounded-lg text-center bg-white hover:bg-purple-50 transition cursor-pointer group">
                     <label className="cursor-pointer block w-full h-full">
                       <span className="text-purple-600 font-bold text-sm group-hover:text-purple-800 transition">{uploading ? "Yükleniyor..." : "+ Vergi Levhası / Belge Yükle"}</span>
                       <input type="file" className="hidden" onChange={handleUpload} accept="image/*,application/pdf" disabled={uploading} />
                     </label>
                     {docFile && <p className="text-[10px] text-green-600 mt-2 font-bold">Dosya Başarıyla Yüklendi ✅</p>}
                  </div>
              </div>
            )}

            {/* Sözleşme Onayı */}
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-4 h-4 accent-purple-600 cursor-pointer" />
              <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
                <span 
                  className="text-purple-600 font-bold hover:underline mr-1" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    setShowTerms(true); 
                    // Otomatik tikleme YOK. Sadece modal açılır.
                  }}
                >
                  Satıcı Sözleşmesini
                </span>
                okudum ve kabul ediyorum.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading || uploading || (!user && !passwordValid)} 
              className={`w-full text-white bg-purple-600 hover:bg-purple-700 font-bold py-3.5 rounded-xl transition shadow-lg flex justify-center items-center
                ${(loading || uploading || (!user && !passwordValid)) ? "bg-purple-400 cursor-not-allowed" : "active:scale-95"}`}
            >
              {loading ? "İşleniyor..." : (user ? "Başvuruyu Gönder" : "Hesap Oluştur")}
            </button>

          </form>
        </div>
        
        {!user && <div className="mt-4 text-center text-xs text-gray-500 flex-shrink-0"><Link to="/login" className="hover:text-purple-600 font-bold">Zaten hesabınız var mı? Giriş Yapın</Link></div>}
      </div>

      {/* Sözleşme Modalı */}
      {showTerms && (
        <TermsModal 
          onClose={() => setShowTerms(false)} 
          onAccept={() => setAcceptedTerms(true)} // Butona basınca onayla
          type="vendor" 
        />
      )}
    </div>
  );
};

// Yardımcı Bileşen
const RuleItem = ({ label, valid }) => (
  <div className={`flex items-center gap-1 overflow-hidden transition-all duration-500 ease-in-out ${valid ? "max-h-0 opacity-0 -translate-y-2" : "max-h-6 opacity-100 translate-y-0"}`}>
    <span className="text-red-500 font-bold text-xs">•</span> 
    <span className="text-gray-600 font-medium">{label}</span>
  </div>
);

export default RegisterVendorPage;