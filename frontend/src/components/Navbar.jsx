import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { FiSearch, FiX, FiMenu, FiLogOut } from "react-icons/fi"; // İkonlar eklendi
import { userRequest } from "../requestMethods"; 
import { useTranslation } from "react-i18next";

// Alt Bileşenler
import SearchBar from "./navbar/SearchBar";
import UserActions from "./navbar/UserActions";
import LanguageSelector from "./navbar/LanguageSelector";
import CartIcon from "./navbar/CartIcon";
import MobileMenu from "./navbar/MobileMenu";

const Navbar = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // YENİ: Çıkış işlemi state'i
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const { clearCart } = useCart();

  useEffect(() => {
    const checkUser = () => { const u = JSON.parse(localStorage.getItem("user")); setUser(u); };
    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("user-change", checkUser);
    return () => { window.removeEventListener("storage", checkUser); window.removeEventListener("user-change", checkUser); };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- SMOOTH LOGOUT ---
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // 1. Backend'e logout isteği gönder
      // ÖNEMLİ: withCredentials: true ekleyerek çerezlerin gitmesini garanti ediyoruz
      await userRequest.post("/auth/logout", {}, { withCredentials: true });
      
      // Logun veritabanına yazılması için backend'e zaman tanıyalım
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (err) {
      // Hata olsa bile (token süresi dolmuş olabilir vb.) kullanıcıyı sistemden çıkaracağız
      console.error("Logout backend log error:", err);
    } finally {
      // 2. Yerel Temizlik (Her durumda yapılmalı)
      clearCart();
      localStorage.removeItem("user");
      localStorage.removeItem("favorites");
      
      // Navbar state'ini temizle
      setUser(null);
      setIsMobileMenuOpen(false);

      // 3. Yönlendir
      // location.href kullanımı tüm state'leri sıfırlamak için en temiz yoldur
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* --- YENİ: TAM EKRAN ÇIKIŞ OVERLAY --- */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-500">
           <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center animate-fade-in-up">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 relative">
                 <FiLogOut className="text-3xl" />
                 <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-800">{t("navbar.loggingOut")}</h3>
              <p className="text-gray-500 text-sm mt-2">{t("navbar.byebye")} {user?.fullName?.split(' ')[0]}! 👋</p>
           </div>
        </div>
      )}

      <nav 
        className={`fixed w-full z-[50] top-0 transition-all duration-300 border-b ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-md shadow-md border-white/20 py-2" 
            : "bg-white shadow-sm border-transparent py-2"
        }`}
      >
        <div className="max-w-8xl mx-auto px-4 flex justify-between items-center gap-4">
          
          {/* --- LOGO --- */}
          <Link 
            to="/" 
            className="
              text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent 
              cursor-pointer shrink-0 flex items-center gap-2 select-none
              transition-all duration-500 ease-in-out
              hover:scale-105 hover:hue-rotate-60 hover:drop-shadow-sm
              active:scale-95 active:opacity-80
            "
          >
            🌸 <span className="tracking-tight">Fesfu UK</span>
          </Link>

          {/* --- MASAÜSTÜ ARAMA --- */}
          <SearchBar className="flex-1 max-w-xl hidden md:block" />

          {/* --- SAĞ TARAF --- */}
          <div className="flex gap-2 sm:gap-3 items-center shrink-0">
            
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-600 text-xl p-2">
               <FiSearch />
            </button>

            <div className="hidden md:flex items-center gap-2 sm:gap-3">
               {/* Logout fonksiyonunu buraya geçiyoruz */}
               <UserActions user={user} handleLogout={handleLogout} />
            </div>

            <CartIcon />

            <LanguageSelector />

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-2 text-gray-600 hover:text-pink-600 transition z-50 mr-2"
            >
              {isMobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>

        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          setIsOpen={setIsMobileMenuOpen} 
          user={user} 
          handleLogout={handleLogout} 
        />

      </nav>
    </>
  );
};

export default Navbar;