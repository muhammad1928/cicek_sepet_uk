import { useState } from "react";
import { publicRequest } from "../requestMethods";
import { useNavigate, Link } from "react-router-dom";
import TermsModal from "../components/TermsModal";
import { useCart } from "../context/CartContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", role: "customer" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Şifre Güvenlik State'leri
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

  // Şifre Kuralları
  const [rules, setRules] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

  const navigate = useNavigate();
  const { notify } = useCart();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

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

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    if (field === "password" && !passwordValid && formData.password.length > 0) {
       notify("Şifreniz yeterince güçlü değil!", "warning");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setTouchedFields({ fullName: true, email: true, password: true });

    if (!passwordValid) return notify("Lütfen şifre kurallarını sağlayın!", "error");
    if (!acceptedTerms) return notify("Lütfen sözleşmeyi onaylayın! ⚠️", "warning");
    
    setLoading(true);
    try {
      await publicRequest.post("/auth/register", formData);
      notify("Kayıt Başarılı! 🎉 Lütfen mailinizi onaylayın.", "success");
      
      // --- GÜNCELLEME: Navigate ile mail verisini gönderiyoruz ---
      setTimeout(() => {
        navigate("/verification-pending", { state: { email: formData.email } }); 
      }, 2000);
      // -------------------------

    } catch (err) {
      setLoading(false);
      notify(err.response?.data?.message || "Kayıt başarısız!", "error");
    }
  };

  // Stil Yardımcıları
  const getInputClass = (field) => {
    const base = "w-full px-3 py-2.5 outline-none bg-transparent text-gray-700 font-medium placeholder-gray-400 text-sm transition";
    if (touchedFields[field] && !formData[field]) return `${base} text-red-600 placeholder-red-300`;
    return base;
  };

  const getContainerClass = (field) => {
    const base = "flex items-center border rounded-lg transition overflow-hidden bg-white";
    if (touchedFields[field]) {
       if (!formData[field]) return `${base} border-red-400 ring-1 ring-red-100 animate-shake`;
       if (field === "password" && !passwordValid) return `${base} border-orange-300 ring-1 ring-orange-50`;
    }
    return `${base} border-gray-200 focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/10`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-200 p-4 font-sans relative overflow-hidden">
      
      {/* Arka Plan */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-10 right-10 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Kart */}
      <div className="bg-white/80 backdrop-blur-xl w-full max-w-md p-6 rounded-2xl shadow-2xl border border-white/60 relative z-10 animate-fade-in">
        
        <div className="text-center mb-5">
          <div className="inline-block p-2 rounded-full bg-pink-100 text-pink-600 mb-2 text-2xl shadow-inner">🚀</div>
          <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Aramıza Katılın</h2>
          <p className="text-gray-500 text-xs mt-1">Hızlıca hesap oluşturun</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          
          {/* Ad Soyad */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Ad Soyad</label>
            <div className={getContainerClass("fullName")}>
              <span className="pl-3 text-gray-400">📝</span>
              <input name="fullName" type="text" className={getInputClass("fullName")} placeholder="Adınız Soyadınız" onChange={handleChange} onBlur={() => handleBlur("fullName")} />
            </div>
          </div>

          {/* E-Posta */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">E-Posta</label>
            <div className={getContainerClass("email")}>
              <span className="pl-3 text-gray-400">✉️</span>
              <input name="email" type="email" className={getInputClass("email")} placeholder="mail@site.com" onChange={handleChange} onBlur={() => handleBlur("email")} />
            </div>
          </div>

          {/* Şifre ALANI VE DİNAMİK LİSTE */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Şifre</label>
            <div className={getContainerClass("password")}>
              <span className="pl-3 text-gray-400">🔒</span>
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                className={getInputClass("password")}
                placeholder="••••••••" 
                onChange={handleChange} 
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => { setPasswordFocused(false); handleBlur("password"); }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="pr-3 text-gray-400 hover:text-pink-600 transition outline-none text-sm">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* --- AKILLI ŞİFRE KURALLARI LİSTESİ (DİNAMİK KAYBOLMA) --- */}
            {(passwordFocused || (formData.password && !passwordValid)) && (
              <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-lg transition-all duration-300 text-[11px]">
                
                <p className="font-bold text-gray-400 mb-2 uppercase tracking-wider text-[10px]">Güvenlik Gereksinimleri:</p>
                
                <div className="flex flex-col">
                  <RuleItem label="Min 8 karakter" valid={rules.length} />
                  <RuleItem label="1 Büyük Harf" valid={rules.upper} />
                  <RuleItem label="1 Küçük Harf" valid={rules.lower} />
                  <RuleItem label="1 Rakam" valid={rules.number} />
                  <RuleItem label="1 Özel Karakter (!@#$)" valid={rules.special} />
                </div>

                {passwordValid && (
                  <div className="text-green-600 font-bold flex items-center gap-1 animate-bounce mt-1 pt-2 border-t border-gray-100">
                    <span>✅</span> Şifre Mükemmel!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- SÖZLEŞME KISMI (DÜZELTİLDİ) --- */}
          <div className="flex items-center gap-2 pt-1 px-1">
            <input 
              type="checkbox" 
              id="terms" 
              checked={acceptedTerms} 
              onChange={(e) => setAcceptedTerms(e.target.checked)} 
              className="w-3.5 h-3.5 accent-pink-600 cursor-pointer rounded" 
            />
            <label htmlFor="terms" className="text-[11px] text-gray-600 select-none cursor-pointer">
              <span 
                className="text-pink-600 font-bold hover:underline mr-1" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  setShowTerms(true); 
                  // DÜZELTME: Otomatik setAcceptedTerms(true) SİLİNDİ.
                  // Sadece modal açılacak, onayı oradaki buton yapacak.
                }}
              >
                Kullanıcı Sözleşmesini
              </span>
              okudum ve kabul ediyorum.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || (touchedFields.password && !passwordValid)}
            className={`w-full text-white font-bold py-2.5 rounded-xl transition shadow-md flex justify-center items-center gap-2 text-sm transform active:scale-95 
              ${(loading || (touchedFields.password && !passwordValid)) ? "bg-gray-400 cursor-not-allowed opacity-70" : "bg-pink-600 hover:bg-pink-700"}`} 
          >
            {loading ? "Kaydediliyor..." : "Hesap Oluştur"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">
            Zaten hesabınız var mı? <Link to="/login" className="text-pink-600 font-bold hover:underline hover:text-purple-600 transition">Giriş Yap</Link>
          </p>
        </div>

      </div>

      {/* Modal Bağlantısı */}
      {showTerms && (
        <TermsModal 
          onClose={() => setShowTerms(false)} 
          onAccept={() => setAcceptedTerms(true)} // Modal içindeki 'Kabul Ediyorum' butonuna basınca çalışır
          type="user" 
        />
      )}

    </div>
  );
};

// Dinamik Kural Bileşeni (Yardımcı)
const RuleItem = ({ label, valid }) => (
  <div 
    className={`
      flex items-center gap-1 overflow-hidden transition-all duration-500 ease-in-out
      ${valid 
        ? "max-h-0 opacity-0 -translate-y-2"  // Sağlandıysa gizle
        : "max-h-6 opacity-100 translate-y-0" // Sağlanmadıysa göster
      }
    `}
  >
    <span className="text-red-500 font-bold text-xs">•</span> 
    <span className="text-gray-600 font-medium">{label}</span>
  </div>
);

export default RegisterPage;