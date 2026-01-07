import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import Seo from "../components/Seo";
import { ProductSkeleton } from "../components/Loading";
import ConfirmModal from "../components/ConfirmModal";
import { publicRequest } from "../requestMethods"; 
import { useTranslation } from "react-i18next";
import CategoryNav from "../components/CategoryNav";
import Features from "../components/Features";
import { CATEGORY_KEY_MAP } from "../data/categoryData"; 

// --- YENİ BİLEŞENLER ---
import HeroSection from "../components/homepage/HeroSection";
import EmptyState from "../components/homepage/EmptyState";
import ProductGrid from "../components/homepage/ProductGrid";

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); 
  const [searchParams, setSearchParams] = useSearchParams(); 
  
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  };

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await publicRequest.get("/products");
        const active = res.data.filter(p => p.stock > 0 && p.isActive === true);
        setProducts(active);
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
    if (products.length === 0) return;

    let result = products;

    if (categoryParam !== "all") {
      result = result.filter(p => p.category === categoryParam);
    }

    if (searchParam) {
        setSearchTerm(searchParam); 
        result = result.filter(p => {
            const cleanTitle = decodeHtml(p.title).toLowerCase();
            return cleanTitle.includes(searchParam.toLowerCase());
        });
    }

    setFilteredProducts(result);
  }, [categoryParam, searchParam, products, setSearchTerm]);

  return (
    <div className="min-h-screen bg-pink-100 font-sans text-gray-800 relative">
      <Seo title={`${t('seo.homePage.homeTitle')} ${t('seo.homePage.locationTitle')}`} description={t('seo.homeDescription')} />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shine {
            to {
                background-position: 200% center;
            }
        }
        .animate-shine {
            animation: shine 3s linear infinite;
        }
      `}</style>

      {/* COMPONENT: HERO */}
      <HeroSection />

      <Features />

      <CategoryNav 
        activeCategory={categoryParam} 
        onSelectCategory={handleCategorySelect} 
      />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pb-24 pt-4">
        {loading ? (
          <ProductSkeleton /> 
        ) : filteredProducts.length === 0 ? (
          
          /* COMPONENT: EMPTY STATE */
          <EmptyState searchParam={searchParam} />

        ) : (
          /* COMPONENT: PRODUCT GRID */
          <ProductGrid 
            products={filteredProducts}
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
        )}
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