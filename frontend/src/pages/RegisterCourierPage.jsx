import { useState, useEffect } from "react";
import { publicRequest, userRequest } from "../requestMethods";
import { useNavigate, Link } from "react-router-dom";
import TermsModal from "../components/TermsModal";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Araç Tipleri
const VEHICLE_TYPES = [
  { value: "motor", label: "Motosiklet 🏍️" },
  { value: "car", label: "Otomobil 🚗" },
  { value: "van", label: "Ticari Araç (Van) 🚐" },
  { value: "bicycle", label: "Bisiklet 🚲" }
];

const RegisterCourierPage = () => {
  // --- STATE TANIMLARI ---

  // 1. Kayıt Verileri (Giriş yapmamışsa)
  const [regData, setRegData] = useState({ fullName: "", email: "", password: "", role: "courier" });
  
  // 2. Başvuru Verileri (Giriş yapmışsa)
  const [appData, setAppData] = useState({ phone: "", vehicleType: "", plateNumber: "", licenseNumber: "", address: "", taxNumber: "", iban: "" });
  
  // 3. Dosya
  const [licenseFile, setLicenseFile] = useState(null);
  
  // 4. UI State
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // 5. Şifre Güvenlik
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [rules, setRules] = useState({ length: false, upper: false, lower: false, number: false, special: false });
  
  const navigate = useNavigate();
  const { notify } = useCart();
  const user = JSON.parse(localStorage.getItem("user"));

  // Yönlendirme
  useEffect(() => {
    if (user?.role === 'courier') navigate("/courier");
    if (user?.applicationStatus === 'pending') navigate("/partner-application");
  }, [user, navigate]);

  // --- HANDLERS ---

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegData({ ...regData, [name]: value });

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

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); const data = new FormData(); data.append("file", file);
    try { const res = await publicRequest.post("/upload", data); setLicenseFile(res.data); notify("Ehliyet yüklendi ✅", "success"); } 
    catch { notify("Yükleme hatası", "error"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return notify("Kurye sözleşmesini onaylamalısınız!", "warning");
    if (!user && !passwordValid) return notify("Şifre kurallara uymuyor!", "error");

    setLoading(true);
    try {
      if (user) {
        if (!licenseFile) { setLoading(false); return notify("Lütfen ehliyet fotoğrafı yükleyin.", "warning"); }
        
        await userRequest.post(`/users/${user._id}/apply`, {
          ...appData,
          licenseImage: licenseFile,
          requestedRole: "courier"
        });
        
        const updatedUser = { ...user, applicationStatus: 'pending' };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        notify("Başvuru Alındı! 🎉 Onay bekleniyor.", "success");
        setTimeout(() => navigate("/partner-application"), 1500);
      } else {
        await publicRequest.post("/auth/register", { 
            fullName: regData.fullName,
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-700 p-4 font-sans relative overflow-hidden pt-2">
      <Seo title="Kurye Ol" description="ÇiçekSepeti UK kurye ekibine katılın." />
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      {/* --- MODERN SCROLLBAR --- */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.4); border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.7); }
      `}</style>

      {/* KART YAPISI */}
      <div className="bg-white w-full max-w-2xl p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in h-auto max-h-[85vh] flex flex-col">
        
        <div className="flex items-center justify-center space-x-4 mb-2">
          <div className="inline-block p-3 rounded-full bg-blue-100 text-blue-600 mb-3 text-3xl">🛵</div>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-800">{user ? `Kurye Başvurusu: ${user.fullName}` : "Kuryemiz Olun"}</h2>
            <p className="text-gray-500 text-sm">Kendi işinin patronu ol, teslim ettikçe kazan.</p>
          </div>
        </div>

        {/* SCROLL ALANI */}
        <div className="overflow-y-auto flex-1 pr-2 custom-scroll">
          <form onSubmit={handleSubmit} className="space-y-5 pb-2">
            
            {/* --- DURUM 1: GİRİŞ YAPMAMIŞSA --- */}
            {!user && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Ad Soyad</label><input name="fullName" onChange={handleRegChange} className="w-full p-3 border rounded outline-none focus:border-blue-500" placeholder="Adınız Soyadınız" required /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">E-Posta</label><input name="email" type="email" onChange={handleRegChange} className="w-full p-3 border rounded outline-none focus:border-blue-500" placeholder="Email" required /></div>
                </div>
                
                <div className="relative">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Şifre</label>
                    <div className="flex items-center border rounded bg-white overflow-hidden relative">
                      <input name="password" type={showPassword ? "text" : "password"} onChange={handleRegChange} className="w-full p-3 outline-none" required onFocus={()=>setPasswordFocused(true)} onBlur={()=>setPasswordFocused(false)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4 text-gray-400 hover:text-blue-600 transition">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                    </div>
                    {(passwordFocused || (regData.password && !passwordValid)) && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-[10px]">
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
                <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 mb-2">💡 Önce hesabınızı oluşturacağız. Giriş yaptıktan sonra araç bilgilerini gireceksiniz.</div>
              </>
            )}

            {/* --- DURUM 2: GİRİŞ YAPMIŞSA --- */}
            {user && (
              <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                 <h3 className="font-bold text-gray-700 text-sm border-b pb-3 mb-2">Araç ve Belge Bilgileri</h3>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Cep Telefonu</label><input name="phone" placeholder="Telefon" onChange={handleAppChange} className="w-full p-3 border rounded text-sm outline-none focus:border-blue-500 bg-white" required /></div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Araç Tipi</label>
                        <select name="vehicleType" onChange={handleAppChange} className="w-full p-3 border rounded text-sm bg-white outline-none focus:border-blue-500 cursor-pointer" required>
                          <option value="">Seçiniz...</option>
                          {VEHICLE_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Plaka No</label><input name="plateNumber" placeholder="Plaka" onChange={handleAppChange} className="w-full p-3 border rounded text-sm outline-none focus:border-blue-500 bg-white" required /></div>
                   <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Ehliyet / TC No</label><input name="licenseNumber" placeholder="Ehliyet No" onChange={handleAppChange} className="w-full p-3 border rounded text-sm outline-none focus:border-blue-500 bg-white" required /></div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Vergi No (Opsiyonel)</label><input name="taxNumber" placeholder="Vergi No" onChange={handleAppChange} className="w-full p-3 border rounded text-sm outline-none focus:border-blue-500 bg-white" /></div>
                    <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">IBAN</label><input name="iban" placeholder="IBAN" onChange={handleAppChange} className="w-full p-3 border rounded text-sm outline-none focus:border-blue-500 bg-white" required /></div>
                 </div>

                 <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">İkamet Adresi</label>
                    <textarea name="address" placeholder="Adres" onChange={handleAppChange} className="w-full p-3 border rounded text-sm h-24 resize-none outline-none focus:border-blue-500 bg-white" required />
                 </div>
                 
                 <div className="border-2 border-dashed border-blue-300 p-4 rounded-lg text-center bg-white hover:bg-blue-50 transition cursor-pointer group">
                     <label className="cursor-pointer block w-full h-full">
                       <span className="text-blue-600 font-bold text-sm group-hover:text-blue-800 transition">{uploading ? "Yükleniyor..." : "+ Ehliyet Fotoğrafı Yükle"}</span>
                       <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
                     </label>
                     {licenseFile && <p className="text-[10px] text-green-600 mt-2 font-bold">Dosya Hazır ✅</p>}
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
              disabled={loading || uploading || (!user && !passwordValid)} 
              className={`w-full text-white bg-blue-600 hover:bg-blue-700 font-bold py-3.5 rounded-xl transition shadow-lg flex justify-center items-center gap-2 text-lg ${(!user && !passwordValid) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            >
              {loading ? "İşleniyor..." : (user ? "Başvuruyu Gönder" : "Hesap Oluştur")}
            </button>

          </form>
        </div>
        
        {!user && <div className="mt-4 text-center text-xs text-gray-500 flex-shrink-0"><Link to="/login" className="hover:text-blue-600 font-bold">Zaten hesabınız var mı? Giriş Yapın</Link></div>}
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} type="courier" onAccept={() => setAcceptedTerms(true)} />}
    </div>
  );
};

const RuleItem = ({ label, valid }) => (<div className={`flex items-center gap-1 overflow-hidden transition-all duration-500 ease-in-out ${valid ? "max-h-0 opacity-0 -translate-y-2" : "max-h-6 opacity-100 translate-y-0"}`}><span className="text-red-500 font-bold text-xs">•</span><span className="text-gray-600 font-medium">{label}</span></div>);

export default RegisterCourierPage;