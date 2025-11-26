import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiLogOut } from "react-icons/fi";

const Navbar = () => {
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
        const res = await axios.get("http://localhost:5000/api/products");
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user-change"));
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav 
      className={`fixed w-full z-[50] top-0 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-md shadow-md border-b border-white/20 py-2" 
          : "bg-white shadow-sm py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center gap-4">
        
        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition shrink-0">
          🌸 ÇiçekSepeti UK
        </Link>

        {/* ARAMA (ORTA) */}
        <div className="flex-1 max-w-xl relative hidden md:block" ref={searchRef}>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Çiçek, Çikolata, Hediye ara..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition text-sm"
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            {searchTerm && (
              <button onClick={() => { setSearchTerm(""); setShowSuggestions(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">✕</button>
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-down">
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

        {/* SAĞ TARAF */}
        <div className="flex gap-3 items-center shrink-0">
          <button className="md:hidden text-gray-600 text-xl">🔍</button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/profile" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-pink-600 transition border border-gray-200 px-3 py-1.5 rounded-full hover:bg-pink-50">
                👤 <span className="max-w-[80px] truncate">{user.fullName}</span>
              </Link>
              {user.role === "admin" && <Link to="/admin" title="Yönetim" className="text-lg">⚙️</Link>}
              {user.role === "vendor" && <Link to="/vendor" title="Mağaza" className="text-lg">🏪</Link>}
              {user.role === "courier" && <Link to="/courier" title="Kurye" className="text-lg">🛵</Link>}
              <Link to="/favorites" className="relative p-2 hover:scale-110 transition text-2xl">❤️</Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition" title="Çıkış Yap"><FiLogOut className="text-lg" /><span className="hidden sm:inline">Çıkış</span></button>
            </div>
          ) : (
            <div className="flex items-center">
              {location.pathname === "/login" ? (
                <Link to="/register" className="text-sm font-bold text-gray-600 hover:text-purple-600 transition px-3 py-2">Kayıt Ol</Link>
              ) : location.pathname === "/register" ? (
                <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-pink-600 transition px-3 py-2">Giriş Yap</Link>
              ) : (
                <div className="flex gap-2 text-sm font-medium items-center">
                  <Link to="/login" className="text-gray-600 hover:text-pink-600 transition px-2">Giriş</Link>
                  <span className="text-gray-300">|</span>
                  {/* DÜZELTİLDİ: Pembe arka plan kaldırıldı, sadece link oldu */}
                  <Link to="/register" className="text-gray-600 hover:text-pink-600 transition px-2">Kayıt Ol</Link>
                </div>
              )}
            </div>
          )}

          {/* SEPET */}
          <button onClick={() => setIsCartOpen(true)} className="bg-pink-600 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-pink-700 transition shadow-md relative flex items-center gap-2 active:scale-95">
            <span className="text-lg">🛒</span>
            {cart.length > 0 && (<span className="bg-white text-pink-600 px-1.5 py-0.5 rounded-full text-xs font-extrabold shadow-sm min-w-[18px] text-center">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>)}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;