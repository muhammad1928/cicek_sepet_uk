import { useEffect, useState, useRef, useCallback } from "react"; // useCallback EKLENDİ
import { useCart } from "../context/CartContext";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import Seo from "../components/Seo";
import { ProductSkeleton } from "../components/Loading";
import ConfirmModal from "../components/ConfirmModal";
import { publicRequest } from "../requestMethods"; 
import { useTranslation } from "react-i18next";
import CategoryNav from "../components/CategoryNav";
import Features from "../components/Features";
import { CATEGORY_KEY_MAP, getRelatedCategories } from "../data/categoryData"; 
import { FiRefreshCw } from "react-icons/fi";

import HeroSection from "../components/homepage/HeroSection";
import EmptyState from "../components/homepage/EmptyState";
import ProductGrid from "../components/homepage/ProductGrid";

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); 
  const [searchParams, setSearchParams] = useSearchParams(); 
  
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [maxAlertProd, setMaxAlertProd] = useState(null); 
  const [itemToDelete, setItemToDelete] = useState(null);

  const { cart, addToCart, increaseQuantity, decreaseQuantity, updateItemQuantity, removeFromCart, favorites, toggleFavorite, setSearchTerm } = useCart();

  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("search") || "";

  // --- YARDIMCI FONKSİYONLAR ---
  const decodeHtml = (html) => {
    if (!html) return "";
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const getCatLabel = (key) => {
    const mappedKey = CATEGORY_KEY_MAP[key] || key;
    return t(`home.categories1.${mappedKey}`);
  };

  const triggerMaxAlert = (id) => { 
    setMaxAlertProd(id); 
    setTimeout(() => setMaxAlertProd(null), 1000); 
  };

  const confirmDelete = () => { 
    if (itemToDelete) { 
      removeFromCart(itemToDelete._id, itemToDelete.title); 
      setItemToDelete(null); 
    } 
  };

  const handleCategorySelect = (catKey) => {
    if (catKey === 'all') {
        navigate('/'); 
    } else {
        setSearchParams({ category: catKey });
    }
    setPage(1);
    setProducts([]);
    setHasMore(true);
  };

  // --- VERİ ÇEKME FONKSİYONU ---
  const fetchProducts = async (currentPage, isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      let url = `/products?page=${currentPage}&limit=8`; 
      
      if (categoryParam !== "all") {
          const targetCategories = getRelatedCategories(categoryParam);
          url += `&categories=${targetCategories.join(',')}`;
      }

      if (searchParam) {
          url += `&search=${searchParam}`;
      }

      const res = await publicRequest.get(url);
      
      const incomingProducts = res.data.products; 
      const totalItems = res.data.totalItems;

      if (isLoadMore) {
          setProducts(prev => [...prev, ...incomingProducts]);
      } else {
          setProducts(incomingProducts);
      }

      if (incomingProducts.length === 0 || (products.length + incomingProducts.length >= totalItems)) {
          setHasMore(false);
      } else {
          setHasMore(true);
      }

    } catch (err) { 
      console.error("Ürün hatası:", err); 
      setHasMore(false);
    } finally { 
      setLoading(false); 
      setLoadingMore(false);
    }
  };

  // --- EFFECT: URL Değişince Çalışır ---
  useEffect(() => {
    if (searchParam) {
        setSearchTerm(searchParam);
    } else {
        setSearchTerm("");
    }
    setPage(1);
    setHasMore(true);
    setProducts([]); 
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryParam, searchParam]);

  // --- HANDLER: Load More ---
  const handleLoadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
  };

  // ============================================================
  // --- INFINITE SCROLL (Otomatik Yükleme) ---
  // ============================================================
  const observer = useRef();
  
  // Bu fonksiyon, "Daha Fazla Yükle" butonunu takip eder.
  // Buton ekrana girdiği an (isIntersecting) otomatik tetiklenir.
  const lastElementRef = useCallback(node => {
    if (loading || loadingMore) return; // Zaten yükleniyorsa dur
    if (observer.current) observer.current.disconnect(); // Eski takibi bırak

    observer.current = new IntersectionObserver(entries => {
      // Eğer buton ekranda görünüyorsa VE daha yüklenecek veri varsa
      if (entries[0].isIntersecting && hasMore) {
        handleLoadMore(); // Sanki butona basılmış gibi çalıştır
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, page]); // page dependency eklendi

  return (
    <div className="min-h-screen bg-pink-100 font-sans text-gray-800 relative">
      <Seo title={`${t('seo.homePage.homeTitle')} ${t('seo.homePage.locationTitle')}`} description={t('seo.homeDescription')} />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shine { to { background-position: 200% center; } }
        .animate-shine { animation: shine 3s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      <HeroSection />

      <CategoryNav 
        activeCategory={categoryParam} 
        onSelectCategory={handleCategorySelect} 
      />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pb-24 pt-4">
        {loading && products.length === 0 ? (
          <ProductSkeleton /> 
        ) : products.length === 0 ? (
          <EmptyState searchParam={searchParam} />
        ) : (
          <>
            <ProductGrid 
                key={categoryParam}
                products={products}
                cart={cart}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                addToCart={addToCart}
                decreaseQuantity={decreaseQuantity}
                increaseQuantity={increaseQuantity}
                updateItemQuantity={updateItemQuantity}
                removeFromCart={removeFromCart}
                maxAlertProd={maxAlertProd}
                setItemToDelete={setItemToDelete}
                triggerMaxAlert={triggerMaxAlert}
                decodeHtml={decodeHtml}
                getCatLabel={getCatLabel}
            />

            {/* --- LOAD MORE BUTONU (Otomatik + Manuel) --- */}
            {hasMore && (
                // ref={lastElementRef} sayesinde bu div ekrana girince otomatik yükler
                <div 
                    ref={lastElementRef} 
                    className="flex justify-center mt-10 mb-6"
                >
                    <button 
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="
                            group flex items-center gap-2 px-8 py-3 rounded-full 
                            bg-white border border-pink-200 shadow-md hover:shadow-lg
                            text-pink-600 font-bold transition-all hover:-translate-y-1 active:scale-95
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        {loadingMore ? (
                            <>
                                <FiRefreshCw className="animate-spin" />
                                <span>{t('common.loading') || 'Loading...'}</span>
                            </>
                        ) : (
                            <>
                                <span>{t('common.loadMore') || 'Load More'}</span>
                                <FiRefreshCw className="group-hover:rotate-180 transition-transform duration-500" />
                            </>
                        )}
                    </button>
                </div>
            )}
            
            {!hasMore && products.length > 0 && (
                 <div className="text-center mt-10 mb-6 text-gray-400 text-sm font-medium">
                    {t('common.endOfResults') || "You've reached the end of the list"}
                 </div>
            )}
          </>
        )}
      </div>
      
      <div className="py-8">
        <Features />
      </div>

      {itemToDelete && (
        <ConfirmModal 
          title={`${t('home.questionRemove')} ${decodeHtml(itemToDelete.title).toUpperCase()} `} 
          message={`"${decodeHtml(itemToDelete.title)}" ${t('home.questionRemoveDesc')}`} 
          isDanger={true} 
          onConfirm={confirmDelete} 
          onCancel={() => setItemToDelete(null)} 
        />
      )}
    </div>
  );
};

export default HomePage;