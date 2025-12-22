import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CookieBanner = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Marka ismini düzelttik: ciceksepeti -> fesfu
    const consent = localStorage.getItem("fesfu_uk_consent");
    
    // Eğer tercih yapılmadıysa 1 saniye sonra göster
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // --- MANTIK ---
  const handleAccept = () => {
    localStorage.setItem("fesfu_uk_consent", "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("fesfu_uk_consent", "false");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{ 
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "#1e293b", // Slate-800 (Senin kodundaki renk)
        color: "#fff", 
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "15px",
        boxShadow: "0 -4px 10px rgba(0,0,0,0.1)"
      }}
      className="flex-col md:flex-row gap-4 md:gap-0 animate-slide-up"
    >
      
      {/* İÇERİK KISMI */}
      <div className="flex flex-col md:flex-row items-center gap-3 flex-1 justify-center md:justify-start max-w-7xl w-full">
        <span className="text-2xl">🍪</span>
        <div className="text-center md:text-left">
          {t("cookieBanner.cookiesAgreement")}
          <Link 
            to="/legal/cookie-policy" 
            className="text-pink-400 hover:text-pink-300 underline ml-2 font-bold transition-colors"
          >
            {t("cookieBanner.detailedInfo")}
          </Link>
        </div>
      </div>

      {/* BUTONLAR */}
      <div className="flex items-center gap-3 mt-4 md:mt-0">
        {/* Reddet Butonu */}
        <button
          onClick={handleDecline}
          style={{
            background: "transparent",
            border: "1px solid #94a3b8",
            color: "#cbd5e1",
            fontSize: "12px",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
          className="hover:bg-slate-700 transition"
        >
          {t("common.decline")}
        </button>

        {/* Kabul Et Butonu */}
        <button
          onClick={handleAccept}
          style={{ 
            background: "#db2777", // Pink-600
            color: "white", 
            fontSize: "14px", 
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "10px 24px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 5px rgba(219, 39, 119, 0.4)"
          }}
          className="hover:bg-pink-700 transition"
        >
          {t("common.accept")}
        </button>
      </div>

    </div>
  );
};

export default CookieBanner;