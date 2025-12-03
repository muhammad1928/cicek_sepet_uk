import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicRequest } from "../requestMethods";
import { useCart } from "../context/CartContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const ResetPasswordPage = () => {
  const { t } = useTranslation();
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
    if (!passwordValid) return notify(t("resetPassword.passwordInvalid"), "warning");

    setLoading(true);
    try {
      await publicRequest.post("/auth/reset-password", { token, newPassword: password });
      notify(t("resetPassword.resetPasswordSuccess"), "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setIsTokenValid(false); // Link geçersiz
      notify(err.response?.data || t("resetPassword.invalidLink"), "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isTokenValid) return (
      <div className="min-h-screen flex items-center justify-center text-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">{t("resetPassword.invalidLinkTitle")}⚠️</h2>
            <p className="text-gray-600">{t("resetPassword.linkTimeLimit")}</p>
            <button onClick={() => navigate("/forgot-password")} className="mt-4 text-blue-600 underline">{t("resetPassword.resend")}</button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("resetPassword.setNewPassword")}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative text-left">
                <label className="text-xs font-bold text-gray-500 ml-1">{t("resetPassword.newPassword")}</label>
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
                    <span className={rules.length ? "text-green-600" : "text-gray-400"}>• {t("resetPassword.passwordRules.rule1")}</span>
                    <span className={rules.upper ? "text-green-600" : "text-gray-400"}>• {t("resetPassword.passwordRules.rule2")}</span>
                    <span className={rules.lower ? "text-green-600" : "text-gray-400"}>• {t("resetPassword.passwordRules.rule3")}</span>
                    <span className={rules.number ? "text-green-600" : "text-gray-400"}>• {t("resetPassword.passwordRules.rule4")}</span>
                    <span className={rules.special ? "text-green-600" : "text-gray-400"}>• {t("resetPassword.passwordRules.rule5")}</span>
                </div>
            </div>

            <button type="submit" disabled={!passwordValid || loading} className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50">
                {loading ? t("resetPassword.resettingPassword") : t("resetPassword.resetPassword")}
            </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;