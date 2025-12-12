import { useEffect, useState, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom"; 
import Seo from "../components/Seo";
import { ProductSkeleton } from "../components/Loading";
import ConfirmModal from "../components/ConfirmModal";
import { FaRegHeart, FaHeart, FaStore } from "react-icons/fa";
import { FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi";
import { publicRequest } from "../requestMethods"; 
import { useTranslation } from "react-i18next";


const HomePage = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [loading, setLoading] = useState(true);
  const [maxAlertProd, setMaxAlertProd] = useState(null); 

  const CATEGORIES = [t('home.categories1.all'), t('home.categories1.birthday'), t('home.categories1.anniversary'), t('home.categories1.indoor'), t('home.categories1.eadible'), t('home.categories1.designFlowers'), t('home.categories1.rose'), t('home.categories1.orchid'), t('home.categories1.daisy')];

  const getCategoryIcon = (category) => {
  const icons = { [t('home.categories1.birthday')]: "🎂", [t('home.categories1.anniversary')]: "💍", [t('home.categories1.indoor')]: "🪴", [t('home.categories1.eadible')]: "🍫", [t('home.categories1.designFlowers')]: "✨", [t('home.categories1.rose')]: "🌹", [t('home.categories1.orchid')]: "🌸", [t('home.categories1.daisy')]: "🌼" };
  return icons[category] || "💐";
};


  const [showCategoryBar, setShowCategoryBar] = useState(true);
  const lastScrollY = useRef(0);
  
  const categoryContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const navigate = useNavigate(); 
  const { cart, addToCart, increaseQuantity, decreaseQuantity, updateItemQuantity, removeFromCart, favorites, toggleFavorite, searchTerm } = useCart();
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await publicRequest.get("/products");
        const active = res.data.filter(p => p.stock > 0 && p.isActive === true);
        setProducts(active);
        setFilteredProducts(active);
      } catch (err) { console.error("Ürün hatası:", err); } 
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 60) {
        setShowCategoryBar(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
        setShowCategoryBar(currentScrollY < lastScrollY.current);
        lastScrollY.current = currentScrollY;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let result = products;
    if (selectedCategory !== "Tümü") result = result.filter(p => p.category === selectedCategory);
    if (searchTerm) result = result.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, products]);

  // Drag Functions
  const handleMouseDown = (e) => { setIsDragging(true); setStartX(e.pageX - categoryContainerRef.current.offsetLeft); setScrollLeft(categoryContainerRef.current.scrollLeft); };
  const handleMouseLeave = () => { setIsDragging(false); };
  const handleMouseUp = () => { setIsDragging(false); };
  const handleMouseMove = (e) => { if (!isDragging) return; e.preventDefault(); const x = e.pageX - categoryContainerRef.current.offsetLeft; const walk = (x - startX) * 1; categoryContainerRef.current.scrollLeft = scrollLeft - walk; };

  const getCartItem = (id) => cart.find(item => item._id === id);
  const triggerMaxAlert = (id) => { setMaxAlertProd(id); setTimeout(() => setMaxAlertProd(null), 1000); };
  const handleDecrease = (e, product, currentQty) => { e.stopPropagation(); if (currentQty === 1) setItemToDelete(product); else decreaseQuantity(product._id, product.title); };
  const handleIncrease = (e, product) => { e.stopPropagation(); const qty = getCartItem(product._id)?.quantity || 0; if (qty >= product.stock) { triggerMaxAlert(product._id); return; } increaseQuantity(product._id, product.title, product.stock); };
  const handleInput = (e, product) => { e.stopPropagation(); const val = parseInt(e.target.value); if (isNaN(val) || val < 1) return; if (val > product.stock) { triggerMaxAlert(product._id); updateItemQuantity(product._id, product.stock, product.stock, product.title); } else { updateItemQuantity(product._id, val, product.stock, product.title); } };
  const handleAddToCart = (e, product) => { e.stopPropagation(); addToCart(product, 1); };
  const handleToggleFavorite = (e, id) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(id); };
  const confirmDelete = () => { if (itemToDelete) { removeFromCart(itemToDelete._id, itemToDelete.title); setItemToDelete(null); } };

  return (
    // DEĞİŞİKLİK BURADA YAPILDI: bg-gray-50 yerine bg-gray-100 kullanıldı (daha belirgin gri)
    <div className="min-h-screen bg-pink-100 font-sans text-gray-800 relative">
      <Seo title={`${t('seo.homePage.homeTitle')} ${t('seo.homePage.locationTitle')}`} description={t('seo.homeDescription')} />

      <style>{` .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>

      {/* HERO */}
      {/* DEĞİŞİKLİK: Gradient bitişi 'to-gray-100' yapıldı ki arka planla bütünleşsin */}
      <div className="pt-40 pb-12 text-center bg-gradient-to-b from-pink-50 via-white to-purple-100 px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight animate-fade-in drop-shadow-sm">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">{t('home.heroTitle')}</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto animate-fade-in delay-100 font-medium leading-relaxed">
          {t('home.heroSubtitle')}
        </p>
      </div>

      {/* --- KATEGORİ (STICKY & DRAGGABLE & RESPONSIVE) --- */}
      <div 
        className={`fixed left-0 right-0 z-40 py-3 transition-all duration-500 ease-in-out transform ${showCategoryBar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}
        style={{ top: "60px" }} 
      >
        <div className="absolute inset-0 bg-white/60 backdrop-blur-md border-b border-gray-100 shadow-sm"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
            <div 
              ref={categoryContainerRef}
              className="flex gap-3 overflow-x-auto no-scrollbar pb-1 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
            >
            {CATEGORIES.map((cat) => (
                <button 
                key={cat} 
                onClick={() => !isDragging && setSelectedCategory(cat)}
                // RESPONSIVE STİL: text-xs (mobil) -> text-sm (desktop) | px-4 (mobil) -> px-6 (desktop)
                className={`
                    px-2 py-1 md:px-6 md:py-2.5 rounded-full 
                    text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 border flex-shrink-0 select-none
                    ${selectedCategory === cat 
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md border-transparent scale-105" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-pink-200 hover:text-pink-600 hover:shadow-sm"
                    }
                `}
                >
                <span className="text-lg pointer-events-none">{getCategoryIcon(cat)}</span> 
                <span className="pointer-events-none">{cat}</span>
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* LİSTE ALANI */}
      <div className="max-w-7xl mx-auto px-4 pb-24 pt-4">
        {loading ? <ProductSkeleton /> : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-400 py-24 animate-fade-in bg-white rounded-3xl border-2 border-dashed border-gray-200 mx-auto max-w-lg">
             <div className="text-6xl mb-4 opacity-50 grayscale">🥀</div>
             <p className="text-lg font-medium text-gray-500">{t('home.notFound')}</p>
             <button onClick={() => {setSelectedCategory("Tümü")}} className="mt-6 text-white bg-gray-800 px-6 py-2 rounded-full font-bold hover:bg-black transition shadow-lg">{t('home.showAll')}</button>
          </div>
        ) : (
          // GRID: 1 (Mobil) -> 2 (Tablet) -> 3 -> 4 (Desktop)
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const cartItem = getCartItem(product._id);
              const isFav = favorites.includes(product._id);
              const vendorName = product.vendor?.fullName || product.vendor?.username || "Fesfu Flowers UK"; // Default vendor name

              return (
                <div 
                    key={product._id} 
                    onClick={() => navigate(`/product/${product._id}`)} 
                    // DÜZELTME: Sabit yükseklik (h-[420px]) KALDIRILDI. h-full kullanıldı.
                    className="bg-white rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col relative h-full animate-fade-in-up cursor-pointer hover:-translate-y-1" 
                    style={{ animationDelay: `${index * 0.05}s` }}
                >
                  
                  {/* Resim Alanı (Orantılı) */}
                  <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden flex-shrink-0">
                    <img 
                        src={product.img || "https://placehold.co/400"} 
                        alt={product.title} 
                        className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700" 
                    />
                    {product.category && <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold uppercase text-gray-600 shadow-sm tracking-wider">{product.category}</div>}
                  </div>

                  <button onClick={(e) => handleToggleFavorite(e, product._id)} className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 transition group/heart">
                    <span className={`text-xl transition ${isFav ? "scale-110 text-red-500 drop-shadow-sm" : "scale-100 text-gray-300 group-hover/heart:text-red-400"}`}>{isFav ? <FaHeart/> : <FaRegHeart/>}</span>
                  </button>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <FaStore className="text-gray-300" /> {vendorName}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1 truncate leading-tight group-hover:text-pink-600 transition-colors" title={product.title}>{product.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 min-h-[2.5em] leading-relaxed">{product.desc}</p>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4 relative border-t border-gray-50 pt-3">
                      <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{t('common.price')}</span>

                          {/* burada fiyat birimi duzenlenmeli */}
                          <span className="text-xl font-black text-gray-900">£{product.price}</span>
                      </div>
                      
                      {!cartItem ? (
                        <button onClick={(e) => handleAddToCart(e, product)} className="bg-white border-2 border-gray-100 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold hover:border-pink-500 hover:bg-pink-50 hover:text-pink-600 transition-all active:scale-95 shadow-sm flex items-center gap-1.5 group/btn">
                          <FiShoppingCart className="text-sm group-hover/btn:animate-bounce"/> {t('home.homeAddToCart')}
                        </button>
                      ) : (
                        <div className="flex items-center bg-gray-50 border border-pink-200 rounded-xl overflow-hidden shadow-inner h-9 w-28 justify-between px-0.5" onClick={(e) => e.stopPropagation()}>
                           <button onClick={(e) => handleDecrease(e, product, cartItem.quantity)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-white rounded-lg transition font-bold"><FiMinus size={14}/></button>
                           {maxAlertProd === product._id ? <span className="text-red-600 text-[10px] font-black animate-pulse">MAX</span> : <input type="number" value={cartItem.quantity} onClick={(e) => e.stopPropagation()} onChange={(e) => handleInput(e, product)} className="w-8 text-center font-bold text-pink-700 bg-transparent outline-none text-sm appearance-none" />}
                           <button onClick={(e) => handleIncrease(e, product)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-white rounded-lg transition font-bold"><FiPlus size={14}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {itemToDelete && <ConfirmModal title={`${itemToDelete.title.toUpperCase()} ÇIKARILSIN MI?`} message={`"${itemToDelete.title}" sepetten silinecek.`} isDanger={true} onConfirm={confirmDelete} onCancel={() => setItemToDelete(null)} />}
    </div>
  );
};

export default HomePage;