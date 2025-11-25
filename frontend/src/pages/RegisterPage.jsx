import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import TermsModal from "../components/TermsModal";
import { useCart } from "../context/CartContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ fullName: "", username: "", email: "", password: "", role: "customer" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [rules, setRules] = useState({ length: false, upper: false, lower: false, number: false, special: false });

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
    setTouchedFields({ fullName: true, username: true, email: true, password: true });

    if (!passwordValid) return notify("Lütfen şifre kurallarını sağlayın!", "error");
    if (!acceptedTerms) return notify("Lütfen sözleşmeyi onaylayın! ⚠️", "warning");
    
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      notify("Kayıt Başarılı! 🎉 Lütfen mailinizi onaylayın.", "success");
      setTimeout(() => { navigate("/verification-pending"); }, 2000);
    } catch (err) {
      setLoading(false);
      notify(err.response?.data?.message || "Kayıt başarısız!", "error");
    }
  };

  // Stil Yardımcıları (Daha da kompakt)
  const getInputClass = (field) => {
    // DÜZELTME: py-2.5 -> py-2 (Daha kısa inputlar)
    const base = "w-full px-3 py-2 outline-none bg-transparent text-gray-700 font-medium placeholder-gray-400 text-xs transition";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-200 p-4 font-sans relative overflow-hidden pt-20">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* DÜZELTME: max-w-lg -> max-w-md ve p-8 -> p-6 (Kutu küçüldü) */}
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-md p-6 rounded-2xl shadow-2xl border border-white/40 relative z-10 animate-fade-in">
        
        <div className="text-center mb-5">
          <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Aramıza Katılın 🚀</h2>
          <p className="text-gray-500 text-xs mt-1">Hızlıca hesap oluşturun</p>
        </div>

        {/* DÜZELTME: space-y-4 -> space-y-3 (Boşluklar azaldı) */}
        <form onSubmit={handleRegister} className="space-y-3">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Ad Soyad</label>
              <div className={getContainerClass("fullName")}>
                <span className="pl-3 text-sm text-gray-400">📝</span>
                <input name="fullName" type="text" className={getInputClass("fullName")} placeholder="Ad Soyad" onChange={handleChange} onBlur={() => handleBlur("fullName")} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Kullanıcı Adı</label>
              <div className={getContainerClass("username")}>
                <span className="pl-3 text-sm text-gray-400">👤</span>
                <input name="username" type="text" className={getInputClass("username")} placeholder="Kullanıcı Adı" onChange={handleChange} onBlur={() => handleBlur("username")} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">E-Posta</label>
            <div className={getContainerClass("email")}>
              <span className="pl-3 text-sm text-gray-400">✉️</span>
              <input name="email" type="email" className={getInputClass("email")} placeholder="mail@site.com" onChange={handleChange} onBlur={() => handleBlur("email")} />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Şifre</label>
            <div className={getContainerClass("password")}>
              <span className="pl-3 text-sm text-gray-400">🔒</span>
              <input name="password" type={showPassword ? "text" : "password"} className={getInputClass("password")} placeholder="••••••••" onChange={handleChange} onFocus={() => setPasswordFocused(true)} onBlur={() => { setPasswordFocused(false); handleBlur("password"); }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="pr-3 text-gray-400 hover:text-pink-600 transition outline-none text-sm">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
            {(passwordFocused || (touchedFields.password && !passwordValid)) && (
              <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200 shadow-lg absolute z-20 w-full text-[10px]">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <RuleItem label="Min 8 karakter" valid={rules.length} />
                  <RuleItem label="1 Büyük Harf" valid={rules.upper} />
                  <RuleItem label="1 Küçük Harf" valid={rules.lower} />
                  <RuleItem label="1 Rakam" valid={rules.number} />
                  <RuleItem label="1 Özel (!@#$)" valid={rules.special} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 px-1">
            <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-3.5 h-3.5 accent-pink-600 cursor-pointer rounded" />
            <label htmlFor="terms" className="text-[11px] text-gray-600 select-none cursor-pointer">
              <span className="text-pink-600 font-bold hover:underline mr-1" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>Kullanıcı Sözleşmesini</span>
              kabul ediyorum.
            </label>
          </div>

          {/* DÜZELTME: py-3 -> py-2.5 (Buton kısaldı) */}
          <button
            type="submit"
            disabled={loading || (touchedFields.password && !passwordValid)}
            className={`w-full text-white font-bold py-2.5 rounded-xl transition shadow-md flex justify-center items-center gap-2 text-sm transform active:scale-95 
              ${(loading || (touchedFields.password && !passwordValid)) ? "bg-gray-400 cursor-not-allowed opacity-70" : "bg-pink-600 hover:bg-pink-700"}`} 
          >
            {loading ? "Kaydediliyor..." : "Hesap Oluştur"}
          </button>
        </form>

        <div className="mt-5 text-center border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-500">
            Zaten hesabınız var mı? <Link to="/login" className="text-pink-600 font-bold hover:underline hover:text-purple-600 transition">Giriş Yap</Link>
          </p>
        </div>

      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} type="user" />}

    </div>
  );
};

const RuleItem = ({ label, valid }) => (
  <div className={`flex items-center gap-1 transition-all ${valid ? "text-green-600 opacity-50" : "text-red-500 font-medium"}`}>
    <span>{valid ? "✓" : "•"}</span> {label}
  </div>
);

export default RegisterPage;