import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext"; // Bildirim sistemi
import Seo from "../components/Seo";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Global Bildirim
  const { notify } = useCart(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      // Kullanıcıyı kaydet
      localStorage.setItem("user", JSON.stringify(res.data));
      
      // Yeşil Bildirim
      notify(`Hoşgeldin ${res.data.username}! 👋`, "success");

      // Yönlendirme (1 saniye bekleyip sayfayı yenileyerek git)
      setTimeout(() => {
        const u = res.data;
        
        // Eğer Kurye/Satıcı ise ve Onaylı Değilse -> Başvuruya Git
        if ((u.role === "vendor" || u.role === "courier") && u.applicationStatus !== "approved") {
           window.location.href = "/partner-application";
        } 
        else if (u.role === "admin") window.location.href = "/admin";
        else if (u.role === "courier") window.location.href = "/courier";
        else if (u.role === "vendor") window.location.href = "/vendor";
        else window.location.href = "/";
      }, 1000);

    } catch (err) {
      setLoading(false);
      // Hata Bildirimi
      const errorMessage = err.response?.data?.message || "Kullanıcı adı veya şifre yanlış!";
      notify(errorMessage, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-200 p-4 font-sans relative overflow-hidden">
      <Seo 
        title="Giriş Yap" 
        description="Hesabınıza giriş yapın." 
      />
      {/* --- ARKA PLAN DEKORASYONLARI --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg w-full max-w-md p-10 rounded-3xl shadow-2xl border border-white/20 relative z-10 animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-pink-100 text-pink-600 mb-4 text-3xl">🔐</div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight">Hoşgeldiniz</h2>
          <p className="text-gray-500 text-sm">Hesabınıza giriş yapın ve alışverişe başlayın</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Kullanıcı Adı Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Kullanıcı Adı</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10 transition overflow-hidden">
              <span className="pl-4 text-gray-400 text-lg">👤</span>
              <input 
                type="text" 
                className="w-full px-4 py-3 outline-none bg-transparent text-gray-700 font-medium placeholder-gray-400" 
                placeholder="Kullanıcı adınız" 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Şifre Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Şifre</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10 transition overflow-hidden">
              <span className="pl-4 text-gray-400 text-lg">🔒</span>
              <input 
                type="password" 
                className="w-full px-4 py-3 outline-none bg-transparent text-gray-700 font-medium placeholder-gray-400" 
                placeholder="••••••••" 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Şifremi Unuttum */}
          <div className="text-right">
            <Link to="/forgot-password" class="text-xs text-gray-500 hover:text-pink-600 font-bold transition underline decoration-transparent hover:decoration-pink-600 underline-offset-2">
              Şifremi unuttum?
            </Link>
          </div>

          {/* Giriş Butonu */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-pink-500/40 flex justify-center items-center gap-2 text-lg transform active:scale-95
              ${loading ? "bg-pink-400 cursor-not-allowed" : "bg-gradient-to-r from-pink-600 to-purple-600"}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Giriş Yapılıyor...
              </>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

        {/* Alt Linkler */}
        <div className="mt-8 text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Hesabınız yok mu?{" "}
            <Link to="/register" className="text-pink-600 font-bold hover:underline hover:text-purple-600 transition">
              Hemen Kayıt Ol
            </Link>
          </p>
          <div className="mt-4">
             <Link to="/" className="text-gray-400 text-xs hover:text-gray-600 transition font-medium">← Ana Sayfaya Dön</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;