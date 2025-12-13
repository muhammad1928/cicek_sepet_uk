import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiSearch, FiGlobe, FiHeart, FiLogOut, FiChevronDown, FiX, FiArrowLeft } from "react-icons/fi";
import { FaStore, FaMotorcycle, FaUserShield } from "react-icons/fa";
import { LANGUAGES } from "./constants";
import { useCart } from "../../context/CartContext";
import { publicRequest } from "../../../requestMethods";

const MobileMenu = ({ isOpen, setIsOpen, user, handleLogout }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useCart();
  
  const [suggestions, setSuggestions] = useState([]);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false); // Yeni state

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
  const userInitial = user?.fullName ? user.fullName[0].toUpperCase() : user?.username ? user.username[0].toUpperCase() : "U";

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
    setIsMobileLangOpen(false);
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      setIsSearchMode(true); // Arama modunu aç
    }

    if (value.length > 1) {
      try {
        const res = await publicRequest.get("/products");
        const filtered = res.data.filter(p => 
          p.title.toLowerCase().includes(value.toLowerCase()) && p.isActive && p.stock > 0
        ).slice(0, 5);
        setSuggestions(filtered);
      } catch (err) { console.log(err); }
    } else {
      setSuggestions([]);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setIsSearchMode(false);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setIsOpen(false);
    clearSearch();
  };

  return (
    <div className={`md:hidden absolute top-full left-0 w-full bg-white border-b shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[90vh] overflow-y-auto opacity-100" : "max-h-0 opacity-0"}`}>
      <div className="p-4 flex flex-col gap-4 pb-10">
        
        {/* Mobil Arama */}
        <div className="relative">
          <div className="flex items-center gap-2">
            {isSearchMode && (
              <button 
                onClick={clearSearch}
                className="p-2 text-gray-500 hover:text-pink-600 transition"
              >
                <FiArrowLeft className="text-xl" />
              </button>
            )}
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder={t('navbar.searchPlaceholder')} 
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-pink-500 outline-none transition"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => searchTerm.length > 0 && setIsSearchMode(true)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiSearch /></span>
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
          
          {/* Arama Sonuçları */}
          {searchTerm.length > 1 && suggestions.length > 0 && (
            <div className="mt-2 bg-white rounded-xl border border-gray-100 shadow-sm">
              {suggestions.map((product) => (
                <div 
                  key={`m-${product._id}`} 
                  onClick={() => handleProductClick(product._id)} 
                  className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-none hover:bg-pink-50 cursor-pointer transition"
                >
                  <img src={product.img} alt={product.title} className="w-10 h-10 rounded-lg object-cover border" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800 truncate">{product.title}</div>
                  </div>
                  <span className="text-sm font-bold text-pink-600">£{product.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Arama modunda değilse diğer menü öğelerini göster */}
        {!isSearchMode && (
          <>
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold">{userInitial}</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">{user.fullName || user.username}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                </div>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="mobile-link"><FiGlobe className="mr-2"/> {t('navbar.myAccount')}</Link>
                <Link to="/favorites" onClick={() => setIsOpen(false)} className="mobile-link"><FiHeart className="mr-2"/> Favorilerim</Link>
                {user.role === "admin" && <Link to="/admin" onClick={() => setIsOpen(false)} className="mobile-link text-purple-600"><FaUserShield className="mr-2"/> Admin Panel</Link>}
                {user.role === "vendor" && <Link to="/vendor" onClick={() => setIsOpen(false)} className="mobile-link text-pink-600"><FaStore className="mr-2"/> Mağaza Paneli</Link>}
                {user.role === "courier" && <Link to="/courier" onClick={() => setIsOpen(false)} className="mobile-link text-blue-600"><FaMotorcycle className="mr-2"/> Kurye Paneli</Link>}
                <button onClick={handleLogout} className="mobile-link text-red-500 hover:bg-red-50"><FiLogOut className="mr-2"/> Çıkış Yap</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-3 text-center bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition">{t('navbar.login')}</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="w-full py-3 text-center bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition shadow-lg shadow-pink-200">{t('navbar.register')}</Link>
              </div>
            )}

            {/* Mobil Dil Seçimi */}
            <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">{t('navbar.language')}</div>
                
                <button 
                  onClick={() => setIsMobileLangOpen(!isMobileLangOpen)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition duration-200"
                >
                  <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-700">{currentLang.label}</span>
                  </div>
                  <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${isMobileLangOpen ? 'rotate-180' : ''}`} />
                </button>

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
          </>
        )}

      </div>
      <style>{`
        .mobile-link { display: flex; align-items: center; padding: 12px; border-radius: 12px; font-weight: 600; font-size: 0.95rem; color: #4b5563; transition: all 0.2s; }
        .mobile-link:hover { background-color: #f3f4f6; color: #db2777; }
      `}</style>
    </div>
  );
};

export default MobileMenu;