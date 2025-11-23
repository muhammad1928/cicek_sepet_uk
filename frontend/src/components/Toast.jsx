import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

const Toast = () => {
  const { notification, notificationType, closeNotification } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      // Render olduktan hemen sonra animasyonu tetikle (Küçük gecikme şart)
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      // 3 saniye bekle, sonra kapat
      const timer = setTimeout(() => {
        setIsVisible(false); // Önce animasyonla kaybolsun (fade out)
        setTimeout(closeNotification, 300); // Animasyon bitince state'i sil (0.3sn sonra)
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification, closeNotification]);

  if (!notification && !isVisible) return null;

  // Modern Renk Paleti (Saydamlık ve Gölge Ayarlı)
  const styles = {
    success: "bg-emerald-500/90 shadow-emerald-500/30 border-emerald-400/50",
    error:   "bg-rose-500/85    shadow-rose-500/30    border-rose-400/50",
    warning: "bg-amber-500/90   shadow-amber-500/30   border-amber-400/50",
  };

  return (
    <div 
      className={`
        fixed top-24 right-6 z-[1000] 
        pl-3 pr-6 py-2.5
        rounded-3xl border backdrop-blur-md text-white shadow-2xl
        flex items-center gap-3 
        transform transition-all duration-300 ease-out
        pointer-events-none select-none
        ${isVisible 
          ? "translate-y-0 opacity-100 scale-100"   // GÖRÜNÜR (Normal yerinde, tam boy)
          : "-translate-y-4 opacity-0 scale-95"     // GİZLİ (Biraz yukarıda, biraz küçük, şeffaf)
        }
        ${styles[notificationType] || styles.success}
      `}
    >
      {/* İkon Alanı (Yuvarlak) */}
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
        <span className="text-sm font-bold text-white">
          {notificationType === "success" ? "✓" : notificationType === "error" ? "!" : "i"}
        </span>
      </div>

      {/* Mesaj Metni */}
      <div className="font-medium text-sm tracking-wide leading-tight">
        {notification}
      </div>
    </div>
  );
};

export default Toast;