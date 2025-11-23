import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate(); // Sayfa değiştirmek için kullanacağız

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(false);

    try {
      // 1. Backend'e istek at (Port 5000)
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      // 2. Gelen bileti (Token) ve bilgileri kaydet
      // localStorage: Tarayıcı kapanana kadar veriyi tutar
      localStorage.setItem("user", JSON.stringify(res.data));
      
      // 3. Rolüne göre yönlendir
      if (res.data.role === "admin") {
        alert("Hoşgeldin Patron! Admin paneline gidiyorsun...");
        navigate("/admin");
      } else {
        alert("Hoşgeldin " + res.data.username);
        navigate("/");
      }

    } catch (err) {
      // Backend hata dönerse (400, 404 vs)
      setError(true);
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
        
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">Tekrar Hoşgeldiniz</h2>
        <p className="text-center text-gray-500 mb-8">Hesabınıza giriş yapın</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition bg-gray-50"
              placeholder="Örn: superadmin"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition bg-gray-50"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
              <p className="font-bold">Hata!</p>
              <p>Kullanıcı adı veya şifre yanlış.</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition transform active:scale-95 shadow-lg"
          >
            Giriş Yap
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Hesabınız yok mu?{" "}
          <Link to="/register" className="text-pink-600 font-bold hover:underline">
            Kayıt Ol (Yakında)
          </Link>
        </div>
        
        <div className="mt-4 text-center">
           <Link to="/" className="text-gray-400 text-xs hover:text-gray-600">← Ana Sayfaya Dön</Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;