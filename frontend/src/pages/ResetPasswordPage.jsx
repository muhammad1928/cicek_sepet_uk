import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

const ResetPasswordPage = () => {
  const { token } = useParams(); // URL'deki token'ı al
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notify } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return notify("Şifreler uyuşmuyor!", "error");
    if (password.length < 6) return notify("Şifre en az 6 karakter olmalı.", "warning");

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        newPassword: password
      });
      notify("Şifreniz başarıyla değişti! Giriş yapabilirsiniz.", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      notify(err.response?.data || "Link geçersiz veya süresi dolmuş.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-200 font-sans p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl animate-fade-in text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Yeni Şifre Belirle</h2>
        <p className="text-gray-500 mb-6 text-sm">Lütfen yeni ve güçlü bir şifre girin.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Yeni Şifre" onChange={(e) => setPassword(e.target.value)} />
          <input type="password" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Yeni Şifre (Tekrar)" onChange={(e) => setConfirmPassword(e.target.value)} />
          <button type="submit" disabled={loading} className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition shadow-lg flex justify-center">
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;