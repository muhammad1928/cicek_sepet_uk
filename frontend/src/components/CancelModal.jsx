import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiAlertTriangle } from "react-icons/fi";

const CancelModal = ({ onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const modalRoot = document.getElementById("modal-root") || document.body;

  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!isMounted) return null;

  const handleSubmit = () => {
    if (reason.trim().length < 5) {
      alert("Lütfen geçerli bir sebep belirtin.");
      return;
    }
    onConfirm(reason); // Sebebi üst bileşene gönder
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-slide-in-up">
        
        {/* Kapat Butonu */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition p-2">
          <FiX size={24} />
        </button>

        <div className="p-8 text-center">
          
          {/* İkon */}
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
            <FiAlertTriangle />
          </div>

          <h3 className="text-2xl font-extrabold text-gray-800 mb-2">İptal Talebi</h3>
          <p className="text-sm text-gray-500 mb-6">
            Siparişinizi iptal etmek üzeresiniz. Lütfen bize sebebini kısaca açıklayın.
          </p>

          {/* Textarea */}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:bg-orange-50/20 outline-none h-32 resize-none text-sm text-gray-700 transition placeholder-gray-400"
            placeholder="Örn: Yanlış ürün seçtim, adres değişikliği..."
          />

          {/* Butonlar */}
          <div className="flex gap-3 mt-6">
            <button 
              onClick={onClose} 
              className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
            >
              Vazgeç
            </button>
            <button 
              onClick={handleSubmit} 
              className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-200 transition transform active:scale-95"
            >
              Talebi Gönder
            </button>
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default CancelModal;