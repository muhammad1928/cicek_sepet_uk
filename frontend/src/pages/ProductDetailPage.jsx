import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicRequest } from "../requestMethods";
import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";
import { FiArrowLeft } from "react-icons/fi";

// YENİ EKLENEN BİLEŞENLER (productDetails klasöründen)
import Seo from "../components/Seo"; 
import Features from "../components/Features";
import ProductGallery from "../components/productDetails/ProductGallery"; 
import ProductInfo from "../components/productDetails/ProductInfo";
import ProductActions from "../components/productDetails/ProductActions";
import ProductReviews from "../components/productDetails/ProductReviews";
import RelatedProducts from "../components/productDetails/RelatedProducts";

import { CATEGORY_KEY_MAP } from "../data/categoryData"; 

const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, favorites, notify } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await publicRequest.get(`/products/${id}`);
      setProduct(res.data);
      setSelectedVariant(null);
      setQuantity(1);
    } catch (err) { 
      console.log(err); 
    } finally { 
      setLoading(false); 
    }
  };

  // Çeviri Mantığı
  const getTranslatedTitle = () => {

    // if (!product) return "";
    // const categoryKey = product.category;
    // const parentCat = Object.keys(CATEGORY_KEY_MAP).find(key => CATEGORY_KEY_MAP[key] === categoryKey) || 'flowers';

    // henuz ceviri yoksa orijinal başlığı döner
    return product.title; 
  };
  const displayTitle = getTranslatedTitle();

  // İşlemler
  const handleAddToCart = () => {
      const hasVariants = product.variants && product.variants.length > 0;
      if (hasVariants && !selectedVariant) {
          setErrorMsg(t('product.selectVariantError') || "Please select an option!");
          return;
      }
      addToCart(product, quantity, selectedVariant);
      setErrorMsg(""); 
      notify(t('product.addedToCart') || "Added to Cart", "success");
  };

  const handleVariantSelect = (v) => {
      setSelectedVariant(v);
      setQuantity(1); 
      setErrorMsg(""); 
  };

  const handleQuantityChange = (type) => {
      const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
      if (type === "dec") {
          setQuantity(prev => Math.max(1, prev - 1));
      } else {
          if (quantity < currentStock) setQuantity(prev => prev + 1);
          else notify(t('cartContext.maxStockReached'), "warning");
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-pink-600 text-xl animate-pulse">{t("common.loading")}</div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><h2 className="text-2xl font-bold text-gray-800">{t("home.notFound")}</h2><button onClick={() => navigate("/")} className="text-blue-600 underline">{t("common.backToHome")}</button></div>;

  const isFav = favorites.includes(product._id);
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
  const vendorName = product.vendor?.username || "Fesfu Flowers UK";

  return (
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-white min-h-screen font-sans animate-fade-in">
      
      <Seo 
        title={`${displayTitle} | Fesfu UK`} 
        description={product.desc ? product.desc.substring(0, 160) : `${displayTitle} - Fast delivery.`}
        image={product.img}
        keywords={`${displayTitle}, ${product.category}, fesfu`}
      />

      {/* Google Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": displayTitle,
          "description": product.desc,
          "sku": product._id,
          "brand": { "@type": "Brand", "name": vendorName },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "GBP",
            "price": product.price,
            "availability": displayStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        })}
      </script>

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto relative z-10">
            
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 font-bold transition group w-fit">
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform"/> {t("common.goBack")}
            </button>

            <div className="bg-white rounded-[2rem] shadow-xl border border-white/60 overflow-hidden flex flex-col lg:flex-row gap-0">
                {/* SOL: Galeri */}
                <ProductGallery 
                  key={product._id}
                  product={product} 
                  isFav={isFav} 
                  toggleFavorite={toggleFavorite} 
                  t={t} 
                />

                {/* SAĞ: Bilgi ve Aksiyonlar */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col bg-white">
                    <ProductInfo 
                      product={product} 
                      t={t} 
                      displayTitle={displayTitle} 
                    />
                    
                    <ProductActions 
                      product={product} 
                      t={t}
                      selectedVariant={selectedVariant}
                      handleVariantSelect={handleVariantSelect}
                      quantity={quantity}
                      handleQuantityChange={handleQuantityChange}
                      handleAddToCart={handleAddToCart}
                      errorMsg={errorMsg}
                    />
                </div>
            </div>

            {/* Güven Bandı */}
            <div className="mt-16">
               <Features />
            </div>

            {/* Yorumlar */}
            <ProductReviews 
              product={product} 
              user={user} 
              t={t} 
              notify={notify} 
              onReviewSubmit={fetchProduct} 
            />

            {/* Benzer Ürünler */}
            <RelatedProducts currentProduct={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;