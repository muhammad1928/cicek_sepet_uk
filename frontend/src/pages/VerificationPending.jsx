import { Link, useLocation } from "react-router-dom";
import { FaEnvelopeOpenText, FaArrowLeft, FaExclamationCircle } from "react-icons/fa";

const VerificationPending = () => {
  const location = useLocation();
  const email = location.state?.email; 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-200 p-4 font-sans relative overflow-hidden pt-20">
      
      {/* --- ARKA PLAN DEKORASYONLARI (Soft & Uyumlu) --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* --- ANA KART --- */}
      <div className="bg-white/80 backdrop-blur-lg w-full max-w-lg p-8 md:p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10 animate-fade-in text-center">
        
        {/* İkon Animasyonu */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-pink-200 rounded-full blur-lg opacity-60 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-5xl text-white shadow-lg transform transition hover:scale-110 duration-500">
            <FaEnvelopeOpenText />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 tracking-tight">E-Postanızı Kontrol Edin</h2>
        
        {/* --- BİRLEŞTİRİLMİŞ BİLGİ KARTI (Soft Tasarım) --- */}
        <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/80 shadow-sm mb-8 relative overflow-hidden">
          
          {/* 1. Giriş Metni */}
          <p className="text-gray-700 text-sm leading-relaxed mb-6 font-medium">
            Hesap güvenliğiniz için doğrulama bağlantısını gönderdik. Aramıza katılmanıza çok az kaldı! 🚀
          </p>

          {/* 2. E-Posta Gösterimi (Vurgulu) */}
          {email && (
            <div className="mb-6 p-4 bg-pink-50/50 rounded-xl border border-pink-100/80">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gönderilen Adres</p>
              <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 break-all">
                {email}
              </div>
            </div>
          )}

          {/* İnce Ayırıcı Çizgi */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>

          {/* 3. Spam Uyarısı (Nazik) */}
           <div className="flex flex-col items-center gap-2 text-sm">
              <div className="flex items-center gap-2 font-bold text-gray-700">
                 <FaExclamationCircle className="text-pink-500" />
                 <span>Mail gelmedi mi?</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Lütfen <b>"Spam"</b> veya <b>"Gereksiz"</b> klasörünü kontrol etmeyi unutmayın.
              </p>
            </div>

        </div>
        {/* ------------------------------------------------- */}

        {/* Aksiyon Butonları */}
        <div className="space-y-4">
          <Link 
            to="/login" 
            className="block w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/30 transform active:scale-95 transition flex items-center justify-center gap-2"
          >
            Giriş Sayfasına Git <FaArrowLeft className="text-sm rotate-180" />
          </Link>
          
          {/* --- ÇIKIŞ YAP BUTONU --- */}
          <button 
            onClick={() => {
              localStorage.removeItem("user"); // 1. Sil
              window.dispatchEvent(new Event("user-change")); // 2. Navbar'a Haber Ver (KRİTİK NOKTA)
              window.location.href = "/login"; // 3. Yönlendir
            }} 
            className="text-xs text-gray-400 hover:text-red-600 font-medium transition underline decoration-transparent hover:decoration-red-600 underline-offset-4"
          >
            Farklı Bir Hesapla Giriş Yap (Çıkış)
          </button>
          {/* ------------------------ */}
        </div>

      </div>
    </div>
  );
};

export default VerificationPending;