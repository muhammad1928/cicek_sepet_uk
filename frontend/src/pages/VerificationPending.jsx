import { Link } from "react-router-dom";

const VerificationPending = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md animate-fade-in">
        
        {/* İkon */}
        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 animate-pulse">
          ✉️
        </div>

        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">E-Posta Onayı Gerekli</h2>
        
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          Kaydınız alındı! Hesabınızı aktifleştirmek için lütfen e-posta kutunuza gönderdiğimiz bağlantıya tıklayın.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left mb-8">
          <p className="text-sm text-yellow-800 font-bold">⚠️ Dikkat:</p>
          <p className="text-xs text-yellow-700 mt-1">Mail gelmediyse "Spam" veya "Gereksiz" klasörünü kontrol etmeyi unutmayın.</p>
        </div>

        <Link 
          to="/login" 
          className="inline-block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30"
        >
          Giriş Sayfasına Dön
        </Link>

      </div>
    </div>
  );
};

export default VerificationPending;