import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  FiLogOut, FiHeart, FiShoppingCart, FiSearch, FiX, FiGlobe, FiChevronDown, FiMenu 
} from "react-icons/fi";
import { FaStore, FaMotorcycle, FaUserShield } from "react-icons/fa";
import { userRequest, publicRequest } from "../../requestMethods";

// 1. DİLLER VE BAYRAKLAR (Eksik olan bayrakları ekledim)
const LANGUAGES = [
  { code: 'en', label: 'English'},
  { code: 'de', label: 'Deutsch'},
  { code: 'tr', label: 'Türkçe'},
  { code: 'fr', label: 'Français'},
  { code: 'es', label: 'Español'},
  { code: 'it', label: 'Italiano'},
  { code: 'nl', label: 'Nederlands'},
  { code: 'sv', label: 'Svenska'},
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  
  // Masaüstü dil menüsü state'i
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mobil Menü GENEL State'i
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Mobil DİL Menüsü Açık/Kapalı State'i
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);

  // Mevcut dili bul
  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  // Dili Değiştir
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);         // Masaüstü menüyü kapat
    // setIsMobileMenuOpen(false); // İstersen mobilde dil seçince menüyü kapatabilirsin, şimdilik açık bırakıyorum ki seçimi görsün.
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const { cart, setIsCartOpen, searchTerm, setSearchTerm } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const [suggestions, setSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false); 
  const searchRef = useRef(null); 

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

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
      try {
        const res = await publicRequest.get("/products");
        const filtered = res.data.filter(p => 
          p.title.toLowerCase().includes(value.toLowerCase()) && p.isActive && p.stock > 0
        ).slice(0, 5);
        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch (err) { console.log(err); }
    } else {
      setShowSuggestions(false);
    }
    
    if (location.pathname !== "/") navigate("/");

    const user = JSON.parse(localStorage.getItem("user"));
    if (user && value.length > 2) {
        try {
             await userRequest.post("/users/log-activity", { 
               action: 'search', 
               details: { query: value } 
             });
        } catch(e) { console.error("Log hatası:", e); }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { clearCart } = useCart();

  const handleLogout = () => {
    clearCart();
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user-change"));
    navigate("/homepage");
    setIsMobileMenuOpen(false);
    window.location.reload();
  };

  const userInitial = user?.fullName ? user.fullName[0].toUpperCase() : user?.username ? user.username[0].toUpperCase() : "U";

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
          🌸 <span className="tracking-tight">ÇiçekSepeti UK</span>
        </Link>

        {/* --- MASAÜSTÜ ARAMA --- */}
        <div className="flex-1 max-w-xl relative hidden md:block" ref={searchRef}>
          <div className="relative">
            <input 
              type="text" 
              placeholder={t('navbar.searchPlaceholder')} 
              className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition text-sm"
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"><FiSearch /></span>
            {searchTerm && (
              <button onClick={() => { setSearchTerm(""); setShowSuggestions(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition">
                <FiX />
              </button>
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-down z-[60]">
              {suggestions.map((product) => (
                <div key={product._id} onClick={() => { navigate(`/product/${product._id}`); setShowSuggestions(false); setSearchTerm(""); }} className="flex items-center gap-3 p-3 hover:bg-pink-50 cursor-pointer border-b border-gray-50 last:border-none transition">
                  <img src={product.img} alt={product.title} className="w-10 h-10 rounded-lg object-cover border" />
                  <div className="flex-1 min-w-0"><div className="text-sm font-bold text-gray-800 truncate">{product.title}</div><div className="text-xs text-gray-500">{product.category}</div></div>
                  <span className="text-sm font-bold text-pink-600">£{product.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- SAĞ TARAF --- */}
        <div className="flex gap-2 sm:gap-3 items-center shrink-0">
          
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-600 text-xl p-2">
             <FiSearch />
          </button>

          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                 <Link 
                  to="/profile" 
                  className="group relative w-9 h-9 flex items-center justify-center rounded-full bg-pink-100 border border-pink-200 text-pink-600 font-bold text-sm shadow-sm transition-all duration-500 ease-out hover:bg-pink-600 hover:text-white hover:border-pink-600 hover:shadow-md hover:scale-105 hover:brightness-110 active:scale-90 active:bg-pink-700"
                  title={t('navbar.myAccount')}
                >
                  {userInitial}
                </Link>
                {user.role === "admin" && <Link to="/admin" className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded-full transition"><FaUserShield className="text-xl" /></Link>}
                {user.role === "vendor" && <Link to="/vendor" className="text-pink-600 hover:text-pink-800 hover:bg-pink-50 p-2 rounded-full transition"><FaStore className="text-xl" /></Link>}
                {user.role === "courier" && <Link to="/courier" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition"><FaMotorcycle className="text-xl" /></Link>}

                <Link to="/favorites" className="relative group p-2 flex items-center justify-center">
                  <FiHeart className="text-2xl text-gray-400 absolute transition-all duration-300 group-hover:opacity-0 group-hover:scale-75 group-hover:blur-sm" />
                  <svg stroke="url(#heart-gradient)" fill="url(#heart-gradient)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-2xl opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110 heart-anim" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <defs><linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop stopColor="#db2777" offset="0%" /><stop stopColor="#9333ea" offset="100%" /></linearGradient></defs>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition"><FiLogOut className="text-xl" /></button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium">
                <Link to="/login" className="text-gray-600 hover:text-pink-600 transition px-3 py-1 hover:bg-gray-50 rounded-lg">{t('navbar.login')}</Link>
                <span className="text-gray-300">|</span>
                <Link to="/register" className="text-gray-600 hover:text-pink-600 transition px-2">{t('navbar.register')}</Link>
              </div>
            )}
          </div>

          {/* SEPET */}
          <div className="group relative">
            <button onClick={() => setIsCartOpen(true)} className="custom-btn p-2 flex items-center justify-center">
              <FiShoppingCart className="text-lg group-hover:rotate-12 transition" />
            </button>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-20 pointer-events-none animate-bounce-short">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </div>

          {/* DİL SEÇİMİ (Masaüstü) */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-xs font-bold text-gray-700">
              <FiGlobe className="text-xl mb-1" />
              
              <span className="text-xs font-bold uppercase tracking-wider">{currentLang.code}</span>
              <FiChevronDown className={`text-xs transition-transform duration-500 ${isOpen ? "rotate-180 text-pink-500" : "text-gray-400"}`} />
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-2 z-50 animate-fade-in-up overflow-hidden ring-1 ring-black/5">
                <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100/50 mb-1 flex justify-between items-center">
                    <span>{t('navbar.language')}</span><FiGlobe />
                </div>
                <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-1">
                  {LANGUAGES.map((lang) => (
                    <button key={lang.code} onClick={() => changeLanguage(lang.code)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${i18n.language === lang.code ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100/80"}`}>
                      
                      <span className="flex-1 text-left">{lang.label}</span>
                      {i18n.language === lang.code && <span className="bg-white/20 p-1 rounded-full animate-pulse"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* HAMBURGER BUTONU */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-2 text-gray-600 hover:text-pink-600 transition"
          >
            {isMobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* --- MOBİL MENÜ --- */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white border-b shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? "max-h-[90vh] overflow-y-auto opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="p-4 flex flex-col gap-4 pb-10">
          
          <div className="relative">
            <input 
              type="text" 
              placeholder={t('navbar.searchPlaceholder')} 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-pink-500 outline-none transition"
              value={searchTerm}
              onChange={handleSearch}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiSearch /></span>
            {searchTerm.length > 1 && suggestions.length > 0 && (
              <div className="mt-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                {suggestions.map((product) => (
                  <div key={`m-${product._id}`} onClick={() => { navigate(`/product/${product._id}`); setIsMobileMenuOpen(false); setSearchTerm(""); }} className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-none">
                    <img src={product.img} alt={product.title} className="w-8 h-8 rounded object-cover" />
                    <div className="flex-1 truncate text-sm font-medium">{product.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                 <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold">{userInitial}</div>
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">{user.fullName || user.username}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                 </div>
              </div>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link"><FiGlobe className="mr-2"/> {t('navbar.myAccount')}</Link>
              <Link to="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link"><FiHeart className="mr-2"/> Favorilerim</Link>
              {user.role === "admin" && <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link text-purple-600"><FaUserShield className="mr-2"/> Admin Panel</Link>}
              {user.role === "vendor" && <Link to="/vendor" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link text-pink-600"><FaStore className="mr-2"/> Mağaza Paneli</Link>}
              {user.role === "courier" && <Link to="/courier" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link text-blue-600"><FaMotorcycle className="mr-2"/> Kurye Paneli</Link>}
              <button onClick={handleLogout} className="mobile-link text-red-500 hover:bg-red-50"><FiLogOut className="mr-2"/> Çıkış Yap</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 text-center bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition">{t('navbar.login')}</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 text-center bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition shadow-lg shadow-pink-200">{t('navbar.register')}</Link>
            </div>
          )}

          {/* --- MOBİL DİL SEÇİMİ (Masaüstü Tasarımıyla Güncellendi) --- */}
          <div className="border-t border-gray-100 pt-4 mt-2">
             <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">{t('navbar.language')}</div>
             
             {/* Açılır Kapanır Buton */}
             <button 
                onClick={() => setIsMobileLangOpen(!isMobileLangOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition duration-200"
             >
                <div className="flex items-center gap-3">
                  
                    <span className="font-bold text-gray-700">{currentLang.label}</span>
                </div>
                <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${isMobileLangOpen ? 'rotate-180' : ''}`} />
             </button>

             {/* Dil Listesi */}
             <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileLangOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-2 pl-1">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={`mob-lang-${lang.code}`}
                            onClick={() => changeLanguage(lang.code)}
                            className={`flex items-center gap-3 p-3 rounded-xl w-full text-left transition-all duration-200 shadow-sm ${
                                i18n.language === lang.code 
                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md border-transparent' 
                                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                            }`}
                        >
                            
                            <span className="font-bold flex-1">{lang.label}</span>
                            
                            {/* Aktif dil beyaz nokta animasyonu */}
                            {i18n.language === lang.code && (
                                <span className="bg-white/20 p-1 rounded-full animate-pulse">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </span>
                            )}
                        </button>
                    ))}
                </div>
             </div>
          </div>

        </div>
      </div>
      
      <style>{`
        .mobile-link { display: flex; align-items: center; padding: 12px; border-radius: 12px; font-weight: 600; font-size: 0.95rem; color: #4b5563; transition: all 0.2s; }
        .mobile-link:hover { background-color: #f3f4f6; color: #db2777; }
      `}</style>

    </nav>
  );
};

export default Navbar;