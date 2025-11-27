import { useEffect, useState } from "react";
import { FiAlertTriangle, FiTrash2, FiCheckCircle } from "react-icons/fi";

const ConfirmModal = ({ title, message, onConfirm, onCancel, isDanger = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monte edildiğinde animasyonu başlat
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = (callback) => {
    setIsVisible(false); // Kapanış animasyonunu başlat
    setTimeout(callback, 300); // Animasyon bitince (300ms) işlemi yap
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? "bg-black/60 backdrop-blur-sm" : "bg-transparent pointer-events-none"}`}>
      
      {/* Modal Kartı */}
      <div 
        className={`
          bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300
          flex flex-col items-center text-center p-6 relative
          ${isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-4"}
        `}
      >
        
        {/* İkon Alanı (Daire) */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-inner ${isDanger ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"}`}>
          {isDanger ? (
            <FiTrash2 className="text-4xl animate-bounce-short" /> // Silme için Çöp Kutusu
          ) : (
            <FiAlertTriangle className="text-4xl" /> // Diğerleri için Uyarı
          )}
        </div>

        {/* Başlık ve Mesaj */}
        <h3 className="text-xl font-extrabold text-gray-800 mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed px-2 mb-8">
          {message}
        </p>

        {/* Butonlar (Yan Yana ve Modern) */}
        <div className="flex gap-3 w-full">
          <button 
            onClick={() => handleClose(onCancel)}
            className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition transform active:scale-95"
          >
            Vazgeç
          </button>
          
          <button 
            onClick={() => handleClose(onConfirm)}
            className={`
              flex-1 py-3.5 rounded-2xl font-bold text-white shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2
              ${isDanger 
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-500/30" 
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-500/30"}
            `}
          >
            {isDanger ? "Evet, Sil" : "Onayla"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;