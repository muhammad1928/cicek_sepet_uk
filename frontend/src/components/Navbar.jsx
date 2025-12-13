import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { FiSearch, FiX, FiMenu } from "react-icons/fi";

// Alt Bileşenler
import SearchBar from "./navbar/SearchBar";
import UserActions from "./navbar/UserActions";
import LanguageSelector from "./navbar/LanguageSelector";
import CartIcon from "./navbar/CartIcon";
import MobileMenu from "./navbar/MobileMenu";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigate = useNavigate();
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

  const handleLogout = () => {
    clearCart();
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user-change"));
    navigate("/");
    setIsMobileMenuOpen(false);
    window.location.reload();
  };

  return (
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
             <UserActions user={user} handleLogout={handleLogout} />
          </div>

          <CartIcon />

          <LanguageSelector />

          {/* HAMBURGER BUTONU */}
          {/* DEĞİŞİKLİK: 'ml-2' silindi, 'mr-2' eklendi. Sağdan boşluk vererek sola (içeri) ittik. */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-2 text-gray-600 hover:text-pink-600 transition z-50"
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
  );
};

export default Navbar;