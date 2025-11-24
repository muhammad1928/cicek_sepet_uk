import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import TermsModal from "../components/TermsModal";
import { useCart } from "../context/CartContext"; // Bildirim sistemi
import Seo from "../components/Seo";

const RegisterPage = () => {
  // Rolü varsayılan olarak 'customer' yapıyoruz
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "customer" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Global Bildirim
  const { notify } = useCart();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 1. Sözleşme Kontrolü
    if (!acceptedTerms) {
      notify("Lütfen kullanıcı sözleşmesini onaylayın! ⚠️", "warning");
      return;
    }
    
    setLoading(true);

    try {
      // 2. Kayıt İsteği (Localhost)
      await axios.post("http://localhost:5000/api/auth/register", formData);
      
      // 3. Başarılı
      notify("Kayıt Başarılı! 🎉 Lütfen mailinizi onaylayın.", "success");
      
      // 4. Yönlendirme
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || "Kayıt başarısız! İsim veya mail alınmış olabilir.";
      notify(errorMsg, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-200 p-4 font-sans relative overflow-hidden">
      <Seo 
        title="Kayıt Ol" 
        description="Hemen üye olun, indirimlerden ve özel fırsatlardan yararlanın." 
        keywords="kayıt ol, üye ol, register"
      />
      {/* --- ARKA PLAN DEKORASYONLARI --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg w-full max-w-md p-10 rounded-3xl shadow-2xl border border-white/20 relative z-10 animate-fade-in">
        
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-purple-100 text-purple-600 mb-4 text-3xl">🚀</div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight">Aramıza Katılın</h2>
          <p className="text-gray-500 text-sm">Hızlıca hesap oluşturun ve avantajlardan yararlanın</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          
          {/* Kullanıcı Adı */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Kullanıcı Adı</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10 transition overflow-hidden">
              <span className="pl-4 text-gray-400">👤</span>
              <input 
                name="username" 
                type="text" 
                className="w-full px-4 py-3 outline-none bg-transparent text-gray-700 font-medium placeholder-gray-400" 
                placeholder="Adınız" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* E-Posta */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">E-Posta</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10 transition overflow-hidden">
              <span className="pl-4 text-gray-400">✉️</span>
              <input 
                name="email" 
                type="email" 
                className="w-full px-4 py-3 outline-none bg-transparent text-gray-700 font-medium placeholder-gray-400" 
                placeholder="ornek@mail.com" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Şifre</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10 transition overflow-hidden">
              <span className="pl-4 text-gray-400">🔒</span>
              <input 
                name="password" 
                type="password" 
                className="w-full px-4 py-3 outline-none bg-transparent text-gray-700 font-medium placeholder-gray-400" 
                placeholder="••••••••" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Sözleşme Onayı */}
          <div className="flex items-start gap-3 pt-2 px-1">
            <input 
              type="checkbox" 
              id="terms" 
              checked={acceptedTerms} 
              onChange={(e) => setAcceptedTerms(e.target.checked)} 
              className="mt-1 w-5 h-5 accent-pink-600 cursor-pointer rounded" 
            />
            <label htmlFor="terms" className="text-sm text-gray-600 select-none cursor-pointer leading-tight">
              <span 
                className="text-pink-600 font-bold hover:underline mr-1" 
                onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
              >
                Kullanıcı Sözleşmesini
              </span>
              okudum ve kabul ediyorum.
            </label>
          </div>

          {/* Kayıt Butonu */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2 text-lg transform active:scale-95 hover:shadow-pink-500/40 
              ${loading 
                ? "bg-pink-400 cursor-not-allowed" 
                : "bg-pink-600 hover:bg-pink-700"}`} 
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </>
            ) : (
              "Hesap Oluştur"
            )}
          </button>
        </form>

        {/* Alt Linkler */}
        <div className="mt-8 text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Zaten hesabınız var mı?{" "}
            <Link to="/login" className="text-pink-600 font-bold hover:underline hover:text-purple-600 transition">
              Giriş Yap
            </Link>
          </p>
        </div>

      </div>

      {/* MODAL (Sadece Müşteri Sözleşmesi) */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} type="user" />}

    </div>
  );
};

export default RegisterPage;