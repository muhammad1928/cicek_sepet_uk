import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { notify } = useCart(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      localStorage.setItem("user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("user-change")); 

      notify(`Hoşgeldin ${res.data.username}! 👋`, "success");

      setTimeout(() => {
        if (res.data.role === "admin") window.location.href = "/admin";
        else if (res.data.role === "courier") window.location.href = "/courier";
        else if (res.data.role === "vendor") window.location.href = "/vendor";
        else window.location.href = "/";
      }, 1000);

    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || "Kullanıcı adı veya şifre yanlış!";
      notify(errorMessage, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-200 p-4 font-sans relative overflow-hidden pt-24">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* DÜZELTME: p-10 -> p-8 (Kutu içi boşluk azaldı) */}
      <div className="bg-white/80 backdrop-blur-lg w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/20 relative z-10 animate-fade-in-up">
        
        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-full bg-pink-100 text-pink-600 mb-3 text-2xl">🔐</div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-1 tracking-tight">Hoşgeldiniz</h2>
          <p className="text-gray-500 text-xs">Hesabınıza giriş yapın ve alışverişe başlayın</p>
        </div>

        {/* DÜZELTME: space-y-5 -> space-y-4 */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Kullanıcı Adı</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10 transition overflow-hidden">
              <span className="pl-4 text-gray-400 text-base">👤</span>
              {/* DÜZELTME: py-3 -> py-2.5 */}
              <input 
                type="text" 
                className="w-full px-4 py-2.5 outline-none bg-transparent text-gray-700 font-medium placeholder-gray-400 text-sm" 
                placeholder="Kullanıcı adınız" 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Şifre</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10 transition overflow-hidden relative">
              <span className="pl-4 text-gray-400 text-base">🔒</span>
              {/* DÜZELTME: py-3 -> py-2.5 */}
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-2.5 outline-none bg-transparent text-gray-700 font-medium placeholder-gray-400 text-sm" 
                placeholder="••••••••" 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-pink-600 transition outline-none text-sm"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" class="text-[10px] text-gray-500 hover:text-pink-600 font-bold transition underline decoration-transparent hover:decoration-pink-600 underline-offset-2">
              Şifremi unuttum?
            </Link>
          </div>

          {/* DÜZELTME: py-4 -> py-3 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-xl transition shadow-lg hover:shadow-pink-500/40 flex justify-center items-center gap-2 text-md transform active:scale-95
              ${loading ? "bg-pink-400 cursor-not-allowed" : "bg-gradient-to-r from-pink-600 to-purple-600"}`}
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">
            Hesabınız yok mu?{" "}
            <Link to="/register" className="text-pink-600 font-bold hover:underline hover:text-purple-600 transition">
              Hemen Kayıt Ol
            </Link>
          </p>
          <div className="mt-3">
             <Link to="/" className="text-gray-400 text-[10px] hover:text-gray-600 transition font-medium">← Ana Sayfaya Dön</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;