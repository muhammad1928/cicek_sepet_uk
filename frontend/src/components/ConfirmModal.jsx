import { useEffect, useState } from "react";
import { createPortal } from "react-dom"; // Portal için gerekli
import { FiAlertTriangle, FiTrash2, FiCheckCircle, FiX } from "react-icons/fi";

const ConfirmModal = ({ title, message, onConfirm, onCancel, isDanger = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Portal hedefi (index.html içinde 'modal-root' veya direkt 'body')
  const modalRoot = document.getElementById("modal-root") || document.body;

  useEffect(() => {
    setIsMounted(true);
    
    // Animasyonun tetiklenmesi için küçük bir gecikme
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
    
    // Arka planı kilitle (Scroll yapılmasın)
    document.body.style.overflow = 'hidden';

    // Temizlik
    return () => {
      document.body.style.overflow = 'unset';
      setIsMounted(false);
    };
  }, []);

  const handleClose = (callback) => {
    setIsVisible(false); // Kapanış animasyonunu başlat
    // Animasyon bitince (300ms) asıl fonksiyonu çalıştır
    setTimeout(() => {
      if (callback) callback();
    }, 300);
  };

  // Eğer bileşen henüz mount olmadıysa render etme
  if (!isMounted) return null;

  // --- MODAL İÇERİĞİ ---
  const modalContent = (
    <div 
      className={`
        fixed inset-0 z-[99999] 
        flex items-center justify-center 
        p-4 
        transition-all duration-300 ease-out
        ${isVisible ? "bg-black/60 backdrop-blur-sm opacity-100" : "bg-transparent opacity-0 pointer-events-none"}
      `}
    >
      
      {/* Tıklanabilir Arka Plan (Kapatmak için) */}
      <div className="absolute inset-0" onClick={() => handleClose(onCancel)}></div>

      {/* Modal Kartı */}
      <div 
        className={`
          bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10
          flex flex-col items-center text-center p-8 transform transition-all duration-300
          ${isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}
        `}
      >
        
        {/* Kapat Butonu (Sağ Üst) */}
        <button 
          onClick={() => handleClose(onCancel)} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100"
        >
          <FiX size={20} />
        </button>
        
        {/* İkon Alanı */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${isDanger ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"}`}>
          {isDanger ? (
            <FiTrash2 className="text-4xl animate-bounce-short" />
          ) : (
            <FiAlertTriangle className="text-4xl animate-pulse" />
          )}
        </div>

        {/* Başlık ve Mesaj */}
        <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed px-4 mb-8">
          {message}
        </p>

        {/* Butonlar */}
        <div className="flex gap-3 w-full">
          <button 
            onClick={() => handleClose(onCancel)}
            className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition transform active:scale-95"
          >
            Vazgeç
          </button>
          
          <button 
            onClick={() => handleClose(onConfirm)}
            className={`
              flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2
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

  // React Portal ile 'modal-root' div'ine render ediyoruz
  return createPortal(modalContent, modalRoot);
};

export default ConfirmModal;