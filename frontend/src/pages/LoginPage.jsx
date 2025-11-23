import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false); // Yükleniyor durumu

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(false);
    setLoading(true); // İşlem başladı

    try {
      // Localhost'a istek atıyoruz
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      // Kullanıcıyı hafızaya kaydet
      localStorage.setItem("user", JSON.stringify(res.data));
      
      // Rolüne göre yönlendir
      // (window.location.href kullanıyoruz ki sayfa yenilensin ve Navbar güncellensin)
      if (res.data.role === "admin") {
        window.location.href = "/admin";
      } else if (res.data.role === "courier") {
        window.location.href = "/courier";
      } else {
        window.location.href = "/";
      }

    } catch (err) {
      setError(true);
      setLoading(false); // Hata olursa yükleniyor'u kapat
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-200 p-4 font-sans">
      
      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl animate-fade-in relative overflow-hidden">
        
        {/* Süsleme Çemberi (Arka Plan) */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-100 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-xl"></div>

        {/* Başlık */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-2 tracking-tight">Hoşgeldiniz</h2>
          <p className="text-gray-500">ÇiçekSepeti UK dünyasına giriş yapın</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Kullanıcı Adı</label>
            <div className="flex items-center border-2 border-gray-100 rounded-xl bg-gray-50 focus-within:border-pink-400 focus-within:bg-white transition overflow-hidden">
              <span className="pl-4 text-gray-400">👤</span>
              <input 
                type="text" 
                className="w-full px-4 py-3 outline-none bg-transparent text-gray-700 font-medium"
                placeholder="Kullanıcı adınız"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Şifre</label>
            <div className="flex items-center border-2 border-gray-100 rounded-xl bg-gray-50 focus-within:border-pink-400 focus-within:bg-white transition overflow-hidden">
              <span className="pl-4 text-gray-400">🔒</span>
              <input 
                type="password" 
                className="w-full px-4 py-3 outline-none bg-transparent text-gray-700 font-medium"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 animate-shake">
              <span>⚠️</span> Kullanıcı adı veya şifre yanlış!
            </div>
          )}

          {/* Giriş Butonu */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2 text-lg 
              ${loading 
                ? "bg-pink-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-pink-500/30 active:scale-95"
              }`}
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
        <div className="mt-8 text-center relative z-10">
          <p className="text-sm text-gray-500">
            Hesabınız yok mu?{" "}
            <Link to="/register" className="text-pink-600 font-bold hover:underline hover:text-pink-700 transition">
              Hemen Kayıt Ol
            </Link>
          </p>
          <div className="mt-4">
             <Link to="/" className="text-gray-400 text-xs hover:text-gray-600 transition">← Ana Sayfaya Dön</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;