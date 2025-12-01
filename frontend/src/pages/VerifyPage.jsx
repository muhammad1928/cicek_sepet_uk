import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { publicRequest } from "../requestMethods";
const VerifyPage = () => {
  const { token } = useParams(); // URL'deki kodu yakala
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Hesabınız doğrulanıyor...");

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        // Backend'e kodu gönder
        const res = await publicRequest.post("/auth/verify", { token });
        
        setStatus("success");
        setMessage(res.data); // "Hesap başarıyla onaylandı"
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data || "Doğrulama başarısız. Link geçersiz veya süresi dolmuş.");
      }
    };

    if (token) {
      verifyAccount();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl text-center animate-fade-in">
        
        {/* --- YÜKLENİYOR --- */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
            <h2 className="text-xl font-bold text-gray-700">Doğrulanıyor...</h2>
            <p className="text-gray-500 text-sm">Lütfen bekleyin, işleminiz yapılıyor.</p>
          </div>
        )}

        {/* --- BAŞARILI --- */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl shadow-sm animate-bounce-slow">
              ✓
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800">Tebrikler! 🎉</h2>
            <p className="text-gray-600 font-medium">{message}</p>
            
            <Link 
              to="/login" 
              className="mt-4 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-green-500/30 active:scale-95"
            >
              Giriş Yap
            </Link>
          </div>
        )}

        {/* --- HATA --- */}
        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl shadow-sm">
              ✕
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800">Hata!</h2>
            <p className="text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100 w-full">
              {message}
            </p>
            
            <Link 
              to="/" 
              className="mt-4 text-gray-500 hover:text-gray-800 font-bold underline"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyPage;