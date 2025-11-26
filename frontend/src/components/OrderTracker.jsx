import { FaCheck, FaBoxOpen, FaMotorcycle, FaHome, FaTimes } from "react-icons/fa";

const OrderTracker = ({ status }) => {
  // Adımlar ve İkonları
  const steps = [
    { label: "Sipariş Alındı", icon: <FaCheck /> },
    { label: "Hazırlanıyor", icon: <FaBoxOpen /> },
    { label: "Yola Çıktı", icon: <FaMotorcycle /> },
    { label: "Teslim Edildi", icon: <FaHome /> },
  ];

  // İptal Durumu Özel
  if (status === "İptal") {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 animate-fade-in">
        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl">
          <FaTimes />
        </div>
        <div>
          <h4 className="font-bold text-red-700">Sipariş İptal Edildi</h4>
          <p className="text-sm text-red-600">Bu sipariş iptal edilmiştir. Detaylar için bizimle iletişime geçebilirsiniz.</p>
        </div>
      </div>
    );
  }

  // Aktif adımın indeksini bul
  const activeIndex = steps.findIndex((s) => s.label === status);
  // Eğer durum listede yoksa (örn: "Hazır" gibi ara durumlar), Hazırlanıyor'u baz al
  const currentStep = activeIndex === -1 ? 1 : activeIndex;

  return (
    <div className="w-full py-6 px-2 animate-fade-in">
      <div className="relative flex justify-between items-center">
        
        {/* Gri Arka Plan Çizgisi */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        
        {/* Yeşil İlerleme Çizgisi */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Adımlar */}
        {steps.map((step, i) => {
          const isActive = i <= currentStep;
          const isCurrent = i === currentStep;

          return (
            <div key={i} className="flex flex-col items-center gap-2 bg-white px-2">
              {/* Daire */}
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg border-4 transition-all duration-500
                  ${isActive 
                    ? "bg-green-500 border-green-500 text-white scale-110" 
                    : "bg-white border-gray-200 text-gray-300"}
                  ${isCurrent ? "ring-4 ring-green-100 animate-pulse" : ""}
                `}
              >
                {step.icon}
              </div>
              
              {/* Yazı */}
              <span 
                className={`
                  text-xs font-bold transition-colors duration-300 absolute -bottom-8 w-24 text-center
                  ${isActive ? "text-gray-800" : "text-gray-400"}
                `}
                style={{ left: `${(i / (steps.length - 1)) * 100}%`, transform: "translateX(-50%)" }} // Yazıyı ortala
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Boşluk (Yazılar için) */}
      <div className="h-6"></div> 
    </div>
  );
};

export default OrderTracker;