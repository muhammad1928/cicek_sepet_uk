import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(false);
    try {
      // Backend'e kayıt isteği
      await axios.post("https://ciceksepeti-api-m8ir.onrender.com/api/auth/register", {
        username,
        email,
        password,
        role: "courier"
      });
      
      alert("Kayıt Başarılı! Şimdi giriş yapabilirsiniz.");
      navigate("/login"); // Login sayfasına yönlendir
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl animate-fade-in">
        
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">Aramıza Katılın 🌸</h2>
        <p className="text-center text-gray-500 mb-8">Hızlıca hesap oluşturun</p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kullanıcı Adı</label>
            <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none bg-gray-50" placeholder="Adınız" onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-posta</label>
            <input type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none bg-gray-50" placeholder="ornek@mail.com" onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Şifre</label>
            <input type="password" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none bg-gray-50" placeholder="******" onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm text-center font-bold">
              Bir hata oluştu! (Kullanıcı adı veya mail kullanılıyor olabilir)
            </div>
          )}

          <button type="submit" className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition transform active:scale-95 shadow-lg">
            Kayıt Ol
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Zaten hesabınız var mı?{" "}
          <Link to="/login" className="text-pink-600 font-bold hover:underline">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;