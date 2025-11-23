import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react"; // <--- useState BURADA ÇAĞRILMALI

const Navbar = () => {
  const { cart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  
  // --- İŞTE KIRMIZI HATAYI ÇÖZEN SATIR BU ---
  const [user, setUser] = useState(null); 
  // ----------------------------------------

  // Sayfa yüklendiğinde kullanıcıyı hafızadan çek
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="fixed w-full z-40 bg-white/90 backdrop-blur shadow-sm top-0 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* --- LOGO --- */}
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition">
          🌸 ÇiçekSepeti UK
        </Link>

        {/* --- SAĞ TARAF --- */}
        <div className="flex gap-4 items-center">
          
          {/* KULLANICI VARSA */}
          {user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* İsim */}
              <Link to="/profile" className="text-sm font-semibold text-gray-700 hover:text-pink-600 transition hidden md:block border border-gray-200 px-3 py-1 rounded-full hover:bg-pink-50">
                👤 {user.username}
              </Link>
              
              {/* A) MÜŞTERİ LİNKİ */}
              {user.role === "customer" && (
                <Link to="/my-orders" className="text-sm font-bold text-gray-600 hover:text-pink-600 transition hidden sm:block">
                  Siparişlerim
                </Link>
              )}

              {/* B) KURYE LİNKİ */}
              {user.role === "courier" && (
                <Link to="/courier" className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1 rounded-full bg-blue-50 transition">
                  🛵 Kurye Paneli
                </Link>
              )}
              
              {/* C) ADMİN LİNKİ */}
              {user.role === "admin" && (
                <Link to="/admin" className="text-xs sm:text-sm font-bold text-purple-600 hover:text-purple-800 border border-purple-200 px-3 py-1 rounded-full bg-purple-50 transition">
                  Yönetim Paneli
                </Link>
              )}
              <Link to="/favorites" className="relative group p-2">
                <span className="text-2xl transition hover:scale-110 display-block">❤️</span>
                {/* Tooltip (İsteğe bağlı) */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  Favorilerim
                </span>
              </Link>
              {/* ÇIKIŞ */}
              <button 
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 font-bold border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50 transition"
              >
                Çıkış
              </button>
            </div>
          ) : (
            /* KULLANICI YOKSA (MİSAFİR) */
            <div className="flex gap-3 text-sm font-medium items-center">
              <Link to="/login" className="text-gray-600 hover:text-pink-600 transition">Giriş</Link>
              <span className="text-gray-300">|</span>
              <Link to="/register" className="text-gray-600 hover:text-pink-600 transition">Kayıt Ol</Link>
            </div>
          )}

          {/* --- SEPET BUTONU (HERKES GÖREBİLİR) --- */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-pink-600 text-white px-4 sm:px-5 py-2 rounded-full hover:bg-pink-700 transition shadow-md relative flex items-center gap-2 active:scale-95"
          >
            <span className="text-lg">🛒</span>
            <span className="font-bold hidden sm:inline">Sepetim</span>
            
            {/* Kırmızı Bildirim Balonu */}
            {cart.length > 0 && (
              <span className="bg-white text-pink-600 px-2 py-0.5 rounded-full text-xs font-extrabold shadow-sm min-w-[20px] text-center">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;