import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom"; 
import Seo from "../components/Seo";
import { ProductSkeleton } from "../components/Loading";
import ConfirmModal from "../components/ConfirmModal";
import { FaRegHeart, FaHeart, FaStore } from "react-icons/fa";
import { FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi";
import { publicRequest } from "../requestMethods"; 
import { useTranslation } from "react-i18next";
import CategoryNav from "../components/CategoryNav";
import Features from "../components/Features"; // <-- YENİ IMPORT

// --- DÜZELTME 1: HARİTA VERİSİNİ IMPORT ET ---
import { CATEGORY_KEY_MAP } from "../data/categoryData"; 

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); 
  
  // --- STATE TANIMLAMALARI ---
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  
  const [maxAlertProd, setMaxAlertProd] = useState(null); 
  const [itemToDelete, setItemToDelete] = useState(null);

  const { cart, addToCart, increaseQuantity, decreaseQuantity, updateItemQuantity, removeFromCart, favorites, toggleFavorite, searchTerm } = useCart();

  // --- DÜZELTME 2: ÇEVİRİ YARDIMCI FONKSİYONU ---
  const getCatLabel = (key) => {
    // Eğer key haritada varsa yolunu al, yoksa kendisini kullan
    const mappedKey = CATEGORY_KEY_MAP[key] || key;
    return t(`home.categories1.${mappedKey}`);
  };

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await publicRequest.get("/products");
        const active = res.data.filter(p => p.stock > 0 && p.isActive === true);
        setProducts(active);
        setFilteredProducts(active);
      } catch (err) { 
        console.error("Ürün hatası:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchProducts();
  }, []);

  // --- FİLTRELEME MANTIĞI ---
  useEffect(() => {
    let result = products;

    if (selectedCategory !== "all") {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, products]);

  // --- YARDIMCI FONKSİYONLAR ---
  const getCartItem = (id) => cart.find(item => item._id === id);
  
  const triggerMaxAlert = (id) => { 
    setMaxAlertProd(id); 
    setTimeout(() => setMaxAlertProd(null), 1000); 
  };

  const handleDecrease = (e, product, currentQty) => { 
    e.stopPropagation(); 
    if (currentQty === 1) setItemToDelete(product); 
    else decreaseQuantity(product._id, product.title); 
  };

  const handleIncrease = (e, product) => { 
    e.stopPropagation(); 
    const qty = getCartItem(product._id)?.quantity || 0; 
    if (qty >= product.stock) { 
      triggerMaxAlert(product._id); 
      return; 
    } 
    increaseQuantity(product._id, product.title, product.stock); 
  };

  const handleInput = (e, product) => { 
    e.stopPropagation(); 
    const val = parseInt(e.target.value); 
    if (isNaN(val) || val < 1) return; 
    
    if (val > product.stock) { 
      triggerMaxAlert(product._id); 
      updateItemQuantity(product._id, product.stock, product.stock, product.title); 
    } else { 
      updateItemQuantity(product._id, val, product.stock, product.title); 
    } 
  };

  const handleAddToCart = (e, product) => { 
    e.stopPropagation(); 
    addToCart(product, 1); 
  };

  const handleToggleFavorite = (e, id) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    toggleFavorite(id); 
  };

  const confirmDelete = () => { 
    if (itemToDelete) { 
      removeFromCart(itemToDelete._id, itemToDelete.title); 
      setItemToDelete(null); 
    } 
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
  };

  return (
    <div className="min-h-screen bg-pink-100 font-sans text-gray-800 relative">
      <Seo title={`${t('seo.homePage.homeTitle')} ${t('seo.homePage.locationTitle')}`} description={t('seo.homeDescription')} />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HERO SECTION */}
      <div className="pt-24 pb-12 text-center bg-gradient-to-b from-pink-50 via-white to-purple-100 px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight animate-fade-in drop-shadow-sm">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">{t('home.heroTitle')}</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto animate-fade-in delay-100 font-medium leading-relaxed">
          {t('home.heroSubtitle')}
        </p>
      </div>

      <Features />

      {/* ÖZELLİKLER BÖLÜMÜ - YENİ EKLENEN KISIM */}  
      <CategoryNav 
        activeCategory={selectedCategory} 
        onSelectCategory={handleCategorySelect} 
      />

      {/* ÜRÜN LİSTESİ */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pb-24 pt-4">
        {loading ? (
          <ProductSkeleton /> 
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 sm:py-24 px-4 flex justify-center animate-fade-in">
            <div className="bg-white rounded-[2rem] shadow-xl p-8 sm:p-12 text-center max-w-2xl border border-pink-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 rounded-full blur-[60px] opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-100 rounded-full blur-[60px] opacity-50"></div>
              <div className="relative z-10">
                <div className="text-6xl sm:text-7xl mb-6 animate-bounce-slow inline-block drop-shadow-md">🌸</div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                  {searchTerm ? (
                    <span>{t('home.searchNotFoundTitle', 'Gizli Bir Hazine mi?')} 🕵️‍♀️</span>
                  ) : (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                      {t('home.categoryEmptyTitle', 'Harika Şeyler Yolda!')}
                    </span>
                  )}
                </h3>
                <p className="text-gray-500 text-base sm:text-lg mb-8 leading-relaxed font-medium max-w-lg mx-auto">
                  {searchTerm 
                    ? t('home.searchNotFoundDesc', 'Aradığınız kelimeyle eşleşen bir ürün bulamadık.') 
                    : t('home.categoryEmptyDesc', 'Bu koleksiyon tükendi! Yeni ürünler hazırlanıyor.')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product, index) => {
              const cartItem = getCartItem(product._id);
              const isFav = favorites.includes(product._id);
              const vendorName = product.vendor?.fullName || product.vendor?.username || "Fesfu Flowers UK";

              return (
                <div 
                    key={product._id} 
                    onClick={() => navigate(`/product/${product._id}`)} 
                    className="bg-white rounded-xl sm:rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col relative h-full animate-fade-in-up cursor-pointer hover:-translate-y-1" 
                    style={{ animationDelay: `${index * 0.05}s` }}
                >
                  
                  {/* Ürün Görseli */}
                  <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden flex-shrink-0">
                    <img 
                        src={product.img || "https://placehold.co/400"} 
                        alt={product.title} 
                        className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700" 
                    />
                    
                    {/* --- DÜZELTME 3: KATEGORİ İSMİNİ GETCATLABEL İLE AL --- */}
                    {product.category && (
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[7px] sm:text-[10px] font-bold uppercase text-gray-600 shadow-sm tracking-wider">
                      {getCatLabel(product.category)}
                    </div>
                  )}
                  </div>

                  <button 
                    onClick={(e) => handleToggleFavorite(e, product._id)} 
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 w-7 h-7 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 transition group/heart"
                  >
                    <span className={`text-sm sm:text-xl transition ${isFav ? "scale-110 text-red-500 drop-shadow-sm" : "scale-100 text-gray-300 group-hover/heart:text-red-400"}`}>
                      {isFav ? <FaHeart/> : <FaRegHeart/>}
                    </span>
                  </button>

                  <div className="p-2 sm:p-4 lg:p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="text-[7px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5 sm:mb-1.5 flex items-center gap-0.5 sm:gap-1">
                          <FaStore className="text-gray-300 text-[8px] sm:text-xs" /> 
                          <span className="truncate">{vendorName}</span>
                        </div>
                        
                        <h3 className="text-[11px] sm:text-sm lg:text-base font-bold text-gray-900 mb-0.5 sm:mb-1 truncate leading-tight group-hover:text-pink-600 transition-colors" title={product.title}>
                          {product.title}
                        </h3>
                        
                        <p className="hidden sm:block text-xs text-gray-500 line-clamp-2 min-h-[2.5em] leading-relaxed">
                          {product.desc}
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-2 sm:mt-4 relative border-t border-gray-50 pt-2 sm:pt-3 gap-1.5 sm:gap-0">
                      <div className="flex flex-col">
                          <span className="text-[7px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            {t('common.price')}
                          </span>
                          <span className="text-sm sm:text-lg lg:text-xl font-black text-gray-900">
                            £{product.price}
                          </span>
                      </div>
                      
                      {!cartItem ? (
                        <button 
                          onClick={(e) => handleAddToCart(e, product)} 
                          className="w-full sm:w-auto bg-white border-2 border-gray-100 text-gray-800 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold hover:border-pink-500 hover:bg-pink-50 hover:text-pink-600 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1 sm:gap-1.5 group/btn"
                        >
                          <FiShoppingCart className="text-xs sm:text-sm group-hover/btn:animate-bounce"/> 
                          <span className="hidden xs:inline sm:inline">{t('home.homeAddToCart')}</span>
                          <span className="xs:hidden sm:hidden">{t('common.add') || 'Add'}</span>
                        </button>
                      ) : (
                        <div className="flex items-center bg-gray-50 border border-pink-200 rounded-lg sm:rounded-xl overflow-hidden shadow-inner h-7 sm:h-9 w-full sm:w-28 justify-between px-0.5" onClick={(e) => e.stopPropagation()}>
                           <button onClick={(e) => handleDecrease(e, product, cartItem.quantity)} className="w-7 sm:w-8 h-6 sm:h-8 flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-white rounded-md sm:rounded-lg transition font-bold">
                             <FiMinus size={12} className="sm:w-3.5 sm:h-3.5"/>
                           </button>
                           {maxAlertProd === product._id ? (
                             <span className="text-red-600 text-[9px] sm:text-[10px] font-black animate-pulse">MAX</span>
                           ) : (
                             <input type="number" value={cartItem.quantity} onClick={(e) => e.stopPropagation()} onChange={(e) => handleInput(e, product)} className="w-6 sm:w-8 text-center font-bold text-pink-700 bg-transparent outline-none text-xs sm:text-sm appearance-none" />
                           )}
                           <button onClick={(e) => handleIncrease(e, product)} className="w-7 sm:w-8 h-6 sm:h-8 flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-white rounded-md sm:rounded-lg transition font-bold">
                             <FiPlus size={12} className="sm:w-3.5 sm:h-3.5"/>
                           </button>
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

      {itemToDelete && (
        <ConfirmModal 
          title={`${itemToDelete.title.toUpperCase()} ${t('home.questionRemove')}`} 
          message={`"${itemToDelete.title}" ${t('home.questionRemoveDesc')}`} 
          isDanger={true} 
          onConfirm={confirmDelete} 
          onCancel={() => setItemToDelete(null)} 
        />
      )}
    </div>
  );
};

export default HomePage;