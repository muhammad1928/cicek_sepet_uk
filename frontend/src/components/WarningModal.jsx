import { useCart } from "../context/CartContext";

const WarningModal = () => {
  const { notification, notificationType, closeNotification } = useCart();

  if (!notification) return null;

  // Tipe göre renk ve ikon belirle
  const config = {
    success: {
      bg: "bg-green-100",
      iconColor: "text-green-600",
      btnColor: "bg-green-600 hover:bg-green-700",
      title: "Başarılı",
      iconPath: "M5 13l4 4L19 7"
    },
    error: {
      bg: "bg-red-100",
      iconColor: "text-red-600",
      btnColor: "bg-red-600 hover:bg-red-700",
      title: "Hata",
      iconPath: "M6 18L18 6M6 6l12 12"
    },
    warning: {
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
      btnColor: "bg-pink-600 hover:bg-pink-700",
      title: "Dikkat",
      iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    }
  };

  const current = config[notificationType] || config.warning;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={closeNotification}></div>

      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative z-10 text-center transform transition-all scale-100">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${current.bg} mb-4`}>
          <svg className={`h-6 w-6 ${current.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={current.iconPath} />
          </svg>
        </div>

        <h3 className="text-lg leading-6 font-bold text-gray-900 mb-2">{current.title}</h3>
        <p className="text-sm text-gray-500 mb-6">{notification}</p>

        <button
          onClick={closeNotification}
          className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none transition ${current.btnColor}`}
        >
          Tamam
        </button>
      </div>
    </div>
  );
};

export default WarningModal;