import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiLogOut, FiHeart, FiShoppingCart, FiSearch, FiX } from "react-icons/fi";
import { FaStore, FaMotorcycle, FaUserShield } from "react-icons/fa";

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

    // 1. Öneri Mantığı
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
    
    // Ana sayfaya yönlendirme (Dikkat: Bu input odağını kaybettirebilir)
    if (location.pathname !== "/") navigate("/");

    // --- ANALİTİK GÖNDERİMİ (DÜZELTİLDİ) ---
    const user = JSON.parse(localStorage.getItem("user"));
    
    // DÜZELTME: 'searchTerm' yerine 'value' kullanıyoruz. 
    // Çünkü setSearchTerm asenkron çalışır, değer hemen güncellenmez.
    if (user && value.length > 2) {
        try {
             // Her harfte istek atmamak için basit bir kontrol eklenebilir ama şimdilik böyle:
             // İleride burayı useEffect ile 'debounce' yapmak daha sağlıklı olur.
             await axios.post("http://localhost:5000/api/users/log-activity", { 
                action: 'search', 
                details: { query: value } // <--- DÜZELTME BURADA
             }, { headers: { token: `Bearer ${user.accessToken}` } });
        } catch(e) {
            // Loglama hatası kullanıcıyı etkilemesin
            console.error("Log hatası:", e); 
        }
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
    navigate("/login");
    window.location.reload();
  };

  // Kullanıcı Baş Harfi
  const userInitial = user?.fullName ? user.fullName[0].toUpperCase() : user?.username ? user.username[0].toUpperCase() : "U";

  return (
    <nav 
      className={`fixed w-full z-[50] top-0 transition-all duration-300 border-b ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-md shadow-md border-white/20 py-2" 
          : "bg-white shadow-sm border-transparent py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center gap-4">
        
        {/* --- LOGO (ANİMASYONLU) --- */}
        {/* hover:hue-rotate-60 -> Rengi mor/maviye kaydırır */}
        {/* duration-500 -> Renk değişimi yavaş olur */}
        {/* active:scale-95 -> Tıklayınca küçülür */}
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

        {/* ARAMA (ORTA) */}
        <div className="flex-1 max-w-xl relative hidden md:block" ref={searchRef}>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Çiçek, Çikolata, Hediye ara..." 
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
          <button className="md:hidden text-gray-600 text-xl"><FiSearch /></button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* --- PROFİL BUTONU (YAVAŞ GEÇİŞLİ & TIKLAMA EFEKTLİ) --- */}
              <Link 
                to="/profile" 
                className="
                  group relative w-9 h-9 flex items-center justify-center rounded-full bg-pink-100 border border-pink-200 text-pink-600 font-bold text-sm shadow-sm transition-all duration-500 ease-out hover:bg-pink-600 hover:text-white hover:border-pink-600 hover:shadow-md hover:scale-105 hover:brightness-110 active:scale-90 active:bg-pink-700

                "
                title="Hesabım"
              >
                {userInitial}
              </Link>
              
              {/* Rol Butonları */}
              {user.role === "admin" && (
                <Link to="/admin" className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded-full transition" title="Yönetim Paneli">
                  <FaUserShield className="text-xl" />
                </Link>
              )}
              {user.role === "vendor" && (
                <Link to="/vendor" className="text-pink-600 hover:text-pink-800 hover:bg-pink-50 p-2 rounded-full transition" title="Mağaza Paneli">
                  <FaStore className="text-xl" />
                </Link>
              )}
              {user.role === "courier" && (
                <Link to="/courier" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition" title="Kurye Paneli">
                  <FaMotorcycle className="text-xl" />
                </Link>
              )}

              {/* Favoriler */}
            <Link 
              to="/favorites" 
              className="relative group p-2 flex items-center justify-center"
              title="Favorilerim"
              >
              {/* Gri Heart (kaybolan) */}
              <FiHeart 
                className="text-2xl text-gray-400 absolute transition-all duration-300 
                          group-hover:opacity-0 group-hover:scale-75 group-hover:blur-sm" 
              />

              {/* Gradient Heart (beliren) */}
              <svg
                stroke="url(#heart-gradient)"
                fill="url(#heart-gradient)"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-2xl opacity-0 transition-all duration-300 
                          group-hover:opacity-100 group-hover:scale-110 heart-anim"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop stopColor="#db2777" offset="0%" />
                    <stop stopColor="#9333ea" offset="100%" />
                  </linearGradient>
                </defs>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              </Link>
              
              {/* Çıkış */}
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 border border-transparent hover:border-red-100 px-2 py-1.5 rounded-lg hover:bg-red-50 transition" title="Çıkış Yap"><FiLogOut className="text-xl" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium">
              <Link to="/login" className="text-gray-600 hover:text-pink-600 transition px-3 py-1 hover:bg-gray-50 rounded-lg">Giriş</Link>
              <span className="text-gray-300">|</span>
              <Link to="/register" className="text-gray-600 hover:text-pink-600 transition px-2">Kayıt Ol</Link>
            </div>
          )}

          {/* SEPET */}
          <div className="group relative">
            {/* 1. Sepet Butonu (Sadece İkon) */}
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="custom-btn p-2 flex items-center justify-center"
              title="Sepeti Görüntüle"
            >
              <FiShoppingCart className="text-lg group-hover:rotate-12 transition" />
            </button>
            {/* 2. Sayaç (Badge) - Butonun Dışında, Sağ Üst Köşeye Yapışık */}
            {cart.length > 0 && (
              <span 
                className="
                  absolute -top-1 -right-1 
                  bg-pink-600 text-white text-[10px] font-bold 
                  h-5 min-w-[20px] px-1
                  flex items-center justify-center 
                  rounded-full border-2 border-white shadow-sm 
                  z-20 pointer-events-none
                  animate-bounce-short
                "
              >
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;