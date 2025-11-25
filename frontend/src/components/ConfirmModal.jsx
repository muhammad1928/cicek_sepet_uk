const ConfirmModal = ({ title, message, onConfirm, onCancel, isDanger = false }) => {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        
        <div className="p-6 text-center">
          {/* İkon */}
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${isDanger ? "bg-red-100" : "bg-blue-100"}`}>
            {isDanger ? (
              <span className="text-3xl">🗑️</span>
            ) : (
              <span className="text-3xl">❓</span>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>

        <div className="flex border-t border-gray-100 bg-gray-50">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-4 text-sm font-bold text-gray-600 hover:bg-gray-100 transition border-r border-gray-200"
          >
            Vazgeç
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-4 py-4 text-sm font-bold text-white transition ${isDanger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isDanger ? "Evet, Sil" : "Evet, Onayla"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;