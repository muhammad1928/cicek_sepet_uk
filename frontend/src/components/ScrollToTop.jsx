import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // Şu anki sayfa adresini (pathname) dinle
  const { pathname } = useLocation();

  useEffect(() => {
    // Adres her değiştiğinde sayfanın en tepesine (0, 0) git
    window.scrollTo(0, 0);
  }, [pathname]); // pathname değişince çalışır

  return null; // Ekrana bir şey çizmez, sadece iş yapar
};

export default ScrollToTop;