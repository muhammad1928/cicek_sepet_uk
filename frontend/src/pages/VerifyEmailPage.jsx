import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import Confetti from "react-confetti";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("Doğrulanıyor...");

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        // Backend'e token'ı gönder
        await axios.post("http://localhost:5000/api/auth/verify", { token });
        
        setStatus("success");
        setMessage("Hesabınız başarıyla doğrulandı! Giriş yapabilirsiniz.");
        
        // 3 Saniye sonra login'e yönlendir
        setTimeout(() => navigate("/login"), 3000);

      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Geçersiz veya süresi dolmuş bağlantı.");
      }
    };

    if (token) {
      verifyAccount();
    } else {
        setStatus("error");
        setMessage("Token bulunamadı.");
    }
  }, [token, navigate]);

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
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Doğrulanıyor...</h2>
            <p className="text-gray-500">Lütfen bekleyin, hesabınız aktifleştiriliyor.</p>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Harika! 🎉</h2>
            <p className="text-green-600 font-medium mb-6">{message}</p>
            <button 
              onClick={() => navigate("/login")} 
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
            >
              Giriş Yap
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Hata Oluştu</h2>
            <p className="text-red-500 font-medium mb-6">{message}</p>
            <button 
              onClick={() => navigate("/")} 
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-lg"
            >
              Ana Sayfaya Dön
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;