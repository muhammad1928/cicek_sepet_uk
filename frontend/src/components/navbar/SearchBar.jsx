import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { useCart } from "../../context/CartContext"; 
import { publicRequest } from "../../requestMethods"; 
import { useTranslation } from "react-i18next";

const SearchBar = ({ className }) => {
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm } = useCart();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Loglama Fonksiyonu
  const logSearchQuery = async (term) => {
    if (!term || term.trim().length < 2) return;
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const config = {};
      if (currentUser && currentUser.accessToken) {
        config.headers = { token: `Bearer ${currentUser.accessToken}` };
      }
      await publicRequest.post("/logs/activity", {
        action: "search_query",
        metadata: { searchTerm: term.trim() }
      }, config);
    } catch (err) {
      console.error("Search log error:", err);
    }
  };

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
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
       logSearchQuery(searchTerm);
       setShowSuggestions(false);
       
       // DÜZELTME: category yerine 'search' parametresi ve /products rotası
       navigate(`/products?search=${searchTerm}`); 
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedTerm && debouncedTerm.length > 2) {
        logSearchQuery(debouncedTerm);
    }
  }, [debouncedTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <input 
          type="text" 
          placeholder={t('navbar.searchPlaceholder')} 
          className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition text-sm"
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
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
            <div 
              key={product._id} 
              onClick={() => { 
                logSearchQuery(searchTerm); 
                navigate(`/product/${product._id}`); 
                setShowSuggestions(false); 
                setSearchTerm(""); 
              }} 
              className="flex items-center gap-3 p-3 hover:bg-pink-50 cursor-pointer border-b border-gray-50 last:border-none transition"
            >
              <img src={product.img} alt={product.title} className="w-10 h-10 rounded-lg object-cover border" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-800 truncate">{product.title}</div>
                <div className="text-xs text-gray-500">{product.category}</div>
              </div>
              <span className="text-sm font-bold text-pink-600">£{product.price}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;