import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicRequest } from "../requestMethods";
import { useCart } from "../context/CartContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true); // Link geçerli mi?
  
  // Şifre Kural State'leri
  const [passwordValid, setPasswordValid] = useState(false);
  const [rules, setRules] = useState({ length: false, upper: false, lower: false, number: false, special: false });

  const navigate = useNavigate();
  const { notify } = useCart();

  // Linkin geçerliliğini başta kontrol et (Opsiyonel ama iyi olur)
  // Backend'de sadece POST var, GET ile kontrol etmek istersen ayrı rota gerekir.
  // Şimdilik hata alınca anlarız.

  const handleChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    const newRules = {
        length: val.length >= 8,
        upper: /[A-Z]/.test(val),
        lower: /[a-z]/.test(val),
        number: /[0-9]/.test(val),
        special: /[!@#$%^&*]/.test(val)
    };
    setRules(newRules);
    setPasswordValid(Object.values(newRules).every(Boolean));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordValid) return notify("Şifre kurallara uymuyor!", "warning");

    setLoading(true);
    try {
      await publicRequest.post("/auth/reset-password", { token, newPassword: password });
      notify("Şifreniz başarıyla değişti! Giriş yapabilirsiniz.", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setIsTokenValid(false); // Link geçersiz
      notify(err.response?.data || "Link geçersiz veya süresi dolmuş.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isTokenValid) return (
      <div className="min-h-screen flex items-center justify-center text-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Bağlantı Geçersiz ⚠️</h2>
            <p className="text-gray-600">Bu şifre sıfırlama linki kullanılmış veya süresi dolmuş.</p>
            <button onClick={() => navigate("/forgot-password")} className="mt-4 text-blue-600 underline">Tekrar Gönder</button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Yeni Şifre Belirle</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative text-left">
                <label className="text-xs font-bold text-gray-500 ml-1">Yeni Şifre</label>
                <div className="flex items-center border rounded-xl overflow-hidden bg-gray-50 mt-1">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full p-3 outline-none bg-transparent" 
                        onChange={handleChange} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 text-gray-400 hover:text-pink-600">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                
                {/* Kurallar */}
                <div className="mt-2 text-[10px] grid grid-cols-2 gap-1">
                    <span className={rules.length ? "text-green-600" : "text-gray-400"}>• Min 8 Karakter</span>
                    <span className={rules.upper ? "text-green-600" : "text-gray-400"}>• 1 Büyük Harf</span>
                    <span className={rules.lower ? "text-green-600" : "text-gray-400"}>• 1 Küçük Harf</span>
                    <span className={rules.number ? "text-green-600" : "text-gray-400"}>• 1 Rakam</span>
                    <span className={rules.special ? "text-green-600" : "text-gray-400"}>• 1 Özel Karakter</span>
                </div>
            </div>

            <button type="submit" disabled={!passwordValid || loading} className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50">
                {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;