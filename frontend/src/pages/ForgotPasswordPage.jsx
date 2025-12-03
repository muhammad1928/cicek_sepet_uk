import { useState } from "react";

import { publicRequest } from "../requestMethods";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext"; // Bildirim için
import { useTranslation } from "react-i18next";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notify } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicRequest.post("/auth/forgot-password", { email });
      setSubmitted(true);
      notify({ message: t("forgotPassword.notifyMessageSent") }, "success");
    } catch (err) {
      // HATA BİLDİRİMİ EKLENDİ
      notify(err.response?.data || { message: t("forgotPassword.notifyUserNotFound") }, "error");
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("forgotPassword.passwordForgotten")}</h2>
            <p className="text-gray-500 mb-6 text-sm">{t("forgotPassword.passwordForgottenDesc")}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="email" required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder={t("forgotPassword.emailPlaceholder")}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" disabled={loading} className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition shadow-lg flex justify-center">
                {loading ? t("forgotPassword.sending") : t("forgotPassword.sendResetLink")}
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-fade-in relative z-10">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("forgotPassword.emailSentTitle")}</h2>
            <p className="text-gray-500 mb-6 text-sm">{t("forgotPassword.emailSentDescription1")} <b>{t("forgotPassword.emailSentDescription2")}</b> {t("forgotPassword.emailSentDescription3")}</p>
            <button onClick={() => setSubmitted(false)} className="text-pink-600 font-bold hover:underline">{t("forgotPassword.tryAgain")}</button>
          </div>
        )}

        <div className="mt-6 relative z-10">
          <Link to="/login" className="text-sm text-gray-500 hover:text-pink-600 transition font-bold">{t("forgotPassword.returnToLogin")}</Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;