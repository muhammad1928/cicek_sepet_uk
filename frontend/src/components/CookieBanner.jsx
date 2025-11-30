import CookieConsent from "react-cookie-consent";
import { Link } from "react-router-dom";

const CookieBanner = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Kabul Ediyorum"
      declineButtonText="Reddet"
      enableDeclineButton
      cookieName="ciceksepeti_uk_consent"
      style={{ 
        background: "#1e293b", // Slate-800 (Koyu Gri)
        color: "#fff", 
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        zIndex: 99999 // En üstte görünsün (Modalın altında kalmasın)
      }}
      buttonStyle={{ 
        background: "#db2777", // Pink-600
        color: "white", 
        fontSize: "14px", 
        fontWeight: "bold",
        borderRadius: "8px",
        padding: "10px 24px",
        marginLeft: "20px"
      }}
      declineButtonStyle={{
        background: "transparent",
        border: "1px solid #94a3b8",
        color: "#cbd5e1",
        fontSize: "12px",
        borderRadius: "8px",
        padding: "8px 16px"
      }}
      expires={150} // 150 Gün boyunca sorma
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <span className="text-2xl">🍪</span>
        <span>
          Sizlere daha iyi bir alışveriş deneyimi sunabilmek için çerezleri (cookies) kullanıyoruz. 
          Siteye devam ederek çerez kullanımını kabul etmiş sayılırsınız.
          <Link to="/legal/cookie-policy" className="text-pink-400 hover:text-pink-300 underline ml-2 font-bold">
            Detaylı Bilgi
          </Link>
        </span>
      </div>
    </CookieConsent>
  );
};

export default CookieBanner;