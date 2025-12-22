import { 
  FaClipboardList, // Sipariş Alındı
  FaCogs,          // Hazırlanıyor
  FaBoxOpen,       // Hazır
  FaMotorcycle,    // Kurye Yolda (Mağazaya)
  FaMapMarkedAlt,  // Dağıtımda (Müşteriye)
  FaHome,          // Teslim Edildi
  FaTimes,         // İptal
  FaShippingFast   // Genel Yolda
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

const OrderTracker = ({ status }) => {
  const { t } = useTranslation();   
  
  // 1. HANGİ ADIMDAYIZ? (0-3 Arası)
  // Backend'deki Türkçe statülere göre eşleştirme
  const getStepIndex = (s) => {
    switch(s) {
      case "Sipariş Alındı": return 0;
      
      case "Hazırlanıyor": 
      case "Hazır":           
        return 1;

      case "Kurye Yolda":     
      case "Dağıtımda":       
      case "Yola Çıktı": // (Eski veri uyumluluğu için)
        return 2;

      case "Teslim Edildi": return 3;
      
      // İptal durumları için özel işlem return etmiyoruz, aşağıda handle ediyoruz
      default: return 0;
    }
  };

  const currentStep = getStepIndex(status);

  // 2. DİNAMİK ADIMLAR
  const steps = [
    { 
      label: t("status.orderReceived") || "Sipariş Alındı", 
      icon: <FaClipboardList /> 
    },
    { 
      // Durum "Hazır" ise Kutu İkonu, değilse Çark İkonu
      label: status === "Hazır" ? (t("status.ready") || "Hazır") : (t("status.preparing") || "Hazırlanıyor"), 
      icon: status === "Hazır" ? <FaBoxOpen /> : <FaCogs className={status === 'Hazırlanıyor' ? "animate-spin-slow" : ""} /> 
    },
    { 
      // Kurye durumuna göre detaylı bilgi
      label: status === "Kurye Yolda" 
        ? (t("status.courierOnWay") || "Kurye Yolda") 
        : (status === "Dağıtımda" ? (t("status.outForDelivery") || "Dağıtımda") : (t("status.onTheWay") || "Yola Çıktı")), 
      icon: status === "Kurye Yolda" ? <FaMotorcycle /> : (status === "Dağıtımda" ? <FaMapMarkedAlt /> : <FaShippingFast />)
    },
    { 
      label: t("status.delivered") || "Teslim Edildi", 
      icon: <FaHome /> 
    }
  ];

  // 3. İPTAL DURUMU (ÖZEL GÖSTERİM)
  if (status === "İptal" || status === "İptal Talebi") {
    return (
      <div className={`border-l-4 p-4 rounded-r-lg flex items-center gap-4 animate-fade-in shadow-sm ${status === "İptal" ? "bg-red-50 border-red-500" : "bg-orange-50 border-orange-500"}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${status === "İptal" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
          {status === "İptal" ? <FaTimes /> : <FaClipboardList />}
        </div>
        <div>
          <h4 className={`font-bold ${status === "İptal" ? "text-red-800" : "text-orange-800"}`}>
            {status === "İptal Talebi" ? (t("status.cancelRequest") || "İptal Talebi") : (t("status.cancelled") || "İptal Edildi")}
          </h4>
          <p className={`text-sm ${status === "İptal" ? "text-red-600" : "text-orange-600"}`}>
            {status === "İptal Talebi" ? (t("status.cancelReqPending") || "Talebiniz inceleniyor...") : (t("status.orderCancelledMsg") || "Siparişiniz iptal edildi.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-2 animate-fade-in select-none">
      <div className="relative flex justify-between items-center">
        
        {/* Gri Arka Plan Çizgisi */}
        <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 -z-10 rounded-full -translate-y-1/2"></div>
        
        {/* Yeşil İlerleme Çizgisi (Animasyonlu) */}
        <div 
          className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-green-400 to-green-600 -z-10 rounded-full transition-all duration-1000 ease-out -translate-y-1/2 shadow-sm"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Adımlar */}
        {steps.map((step, i) => {
          const isActive = i <= currentStep; // Geçilen adımlar
          const isCurrent = i === currentStep; // Şu anki adım

          return (
            <div key={i} className="relative flex flex-col items-center group">
              
              {/* 1. İkon Dairesi */}
              <div 
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-xl border-4 transition-all duration-500 bg-white z-10
                  ${isActive 
                    ? "border-green-500 text-green-600 shadow-lg scale-110" 
                    : "border-gray-200 text-gray-300 scale-100"}
                  ${isCurrent ? "ring-4 ring-green-100 animate-pulse" : ""}
                `}
              >
                {step.icon}
              </div>
              
              {/* 2. Yazı Etiketi (Hizalı ve Dinamik) */}
              <div 
                className={`
                  absolute top-14 left-1/2 -translate-x-1/2 w-40 text-center
                  text-xs font-bold transition-all duration-500 leading-tight
                  ${isActive ? "text-gray-800 translate-y-0 opacity-100" : "text-gray-400 translate-y-1 opacity-80"}
                  ${isCurrent ? "text-green-700 scale-105" : ""}
                `}
              >
                {step.label}
              </div>

            </div>
          );
        })}
      </div>
      
      {/* Alt boşluk (Yazıların sığması için) */}
      <div className="h-8"></div>
    </div>
  );
};

export default OrderTracker;