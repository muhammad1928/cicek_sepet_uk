import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicRequest } from "../requestMethods";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import Confetti from "react-confetti";
import { useTranslation } from "react-i18next";

const VerifyEmailPage = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  
  // Token yoksa baştan error state'i ile başla
  const [status, setStatus] = useState(() => token ? "loading" : "error");
  const [message, setMessage] = useState(() => 
    token ? t("verifyEmail.verifying") : t("verifyEmail.tokenNotFound")
  );

  useEffect(() => {
    // Token yoksa çık, zaten error state'indeyiz
    if (!token) return;

    const verifyAccount = async () => {
      try {
        await publicRequest.post("/auth/verify", { token });
        
        setStatus("success");
        setMessage(t("verifyEmail.messageVerified"));
        
        setTimeout(() => navigate("/login"), 3000);

      } catch (err) {
        setStatus("error");
        const errorKey = err.response?.data?.message;
        if (errorKey && (errorKey.startsWith('auth.') || errorKey.startsWith('verify.'))) {
          setMessage(t(errorKey));
        } else {
          setMessage(errorKey || t("verifyEmail.invalidOrExpired"));
        }
      }
    };

    verifyAccount();
  }, [token, navigate, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 p-4 font-sans relative overflow-hidden pt-20">
      
      {/* Konfeti (Sadece Başarılıysa) */}
      {status === "success" && <Confetti numberOfPieces={200} recycle={false} />}

      <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full animate-fade-in-up relative z-10">
        
        {/* --- YÜKLENİYOR --- */}
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-6">
              <FiLoader className="text-5xl text-blue-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">{t("verifyEmail.verifying")}</h2>
            <p className="text-gray-500">{t("verifyEmail.pleaseWait")}</p>
          </>
        )}

        {/* --- BAŞARILI --- */}
        {status === "success" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl shadow-inner animate-bounce">
                <FiCheckCircle />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("verifyEmail.great")} 🎉</h2>
            <p className="text-green-600 font-medium mb-6">{message}</p>
            <button 
              onClick={() => navigate("/login")} 
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
            >
              {t("verifyEmail.login")}
            </button>
          </>
        )}

        {/* --- HATALI --- */}
        {status === "error" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-5xl shadow-inner">
                <FiXCircle />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("common.error")}</h2>
            <p className="text-red-500 font-medium mb-6">{message}</p>
            <button 
              onClick={() => navigate("/")} 
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-lg"
            >
              {t("common.backToHome")}
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;