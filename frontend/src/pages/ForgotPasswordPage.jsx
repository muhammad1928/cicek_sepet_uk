import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext"; // Bildirim için

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notify } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setSubmitted(true);
      notify("E-posta gönderildi! 📩", "success");
    } catch (err) {
      // HATA BİLDİRİMİ EKLENDİ
      notify(err.response?.data || "Kullanıcı bulunamadı", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-200 font-sans p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden">
        
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-100 rounded-full opacity-50 blur-xl"></div>

        {!submitted ? (
          <div className="relative z-10">
            <div className="text-5xl mb-4">🔑</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Şifrenizi mi unuttunuz?</h2>
            <p className="text-gray-500 mb-6 text-sm">E-posta adresinizi girin, size sıfırlama linki gönderelim.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="email" required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="E-posta adresiniz"
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" disabled={loading} className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition shadow-lg flex justify-center">
                {loading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-fade-in relative z-10">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">E-posta Gönderildi!</h2>
            <p className="text-gray-500 mb-6 text-sm">Lütfen <b>{email}</b> adresini (ve spam klasörünü) kontrol edin.</p>
            <button onClick={() => setSubmitted(false)} className="text-pink-600 font-bold hover:underline">Tekrar Dene</button>
          </div>
        )}

        <div className="mt-6 relative z-10">
          <Link to="/login" className="text-sm text-gray-500 hover:text-pink-600 transition font-bold">← Giriş Sayfasına Dön</Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;