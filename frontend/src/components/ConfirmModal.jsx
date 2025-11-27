import { useEffect, useState } from "react";

const ConfirmModal = ({ title, message, onConfirm, onCancel, isDanger = false }) => {
  // Açılış animasyonu için state
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true); // Render olunca görünür yap (Fade in)
  }, []);

  const handleClose = (callback) => {
    setShow(false); // Önce gizle (Fade out)
    setTimeout(callback, 300); // Sonra işlemi yap
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}>
      
      {/* Arka Plan (Backdrop) */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => handleClose(onCancel)}></div>

      {/* Modal Kartı */}
      <div className={`bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 z-10 ${show ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
        
        <div className="p-6 text-center">
          {/* İkon */}
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${isDanger ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"}`}>
            {isDanger ? (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            ) : (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>

        {/* Butonlar */}
        <div className="flex border-t border-gray-100 bg-gray-50">
          <button 
            onClick={() => handleClose(onCancel)}
            className="flex-1 px-4 py-4 text-sm font-bold text-gray-600 hover:bg-gray-100 transition border-r border-gray-200 focus:outline-none"
          >
            Vazgeç
          </button>
          <button 
            onClick={() => handleClose(onConfirm)}
            className={`flex-1 px-4 py-4 text-sm font-bold text-white transition focus:outline-none ${isDanger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isDanger ? "Evet, Sil" : "Evet, Onayla"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;