import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { publicRequest } from "../../requestMethods";
import { useCart } from "../../context/CartContext";
// Anasayfadaki lüks kartı buradan çağırıyoruz
import ProductCard from "../homepage/ProductCard"; 
import { CATEGORY_KEY_MAP } from "../../data/categoryData";

const RelatedProducts = ({ currentProduct }) => {
  const { t } = useTranslation();
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- CART CONTEXT ENTEGRASYONU ---
  // ProductCard bileşeni sepet ve favori işlemlerini yönetmek için bu fonksiyonlara ihtiyaç duyar
  const { 
    cart, 
    addToCart, 
    increaseQuantity, 
    decreaseQuantity, 
    updateItemQuantity, 
    removeFromCart, 
    favorites, 
    toggleFavorite 
  } = useCart();
  
  // Kart içi animasyonlar için state (Stok uyarısı vb.)
  const [maxAlertProd, setMaxAlertProd] = useState(null);
  
  // --- YARDIMCI FONKSİYONLAR ---
  
  const getCartItem = (id) => cart.find(item => item._id === id);
  
  const triggerMaxAlert = (id) => { 
    setMaxAlertProd(id); 
    setTimeout(() => setMaxAlertProd(null), 1000); 
  };

  const handleDecrease = (e, product, currentQty) => { 
    e.stopPropagation(); 
    if (currentQty > 1) decreaseQuantity(product._id, product.title); 
    else removeFromCart(product._id, product.title);
  };

  const handleIncrease = (e, product) => { 
    e.stopPropagation(); 
    const qty = getCartItem(product._id)?.quantity || 0; 
    // displayProduct içinde stok güncellenmiş olacak
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

  // HTML Karakter Temizliği (Örn: &amp; -> &)
  const decodeHtml = (html) => {
    if (!html) return "";
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  // Kategori Çevirisi
  const getCatLabel = (key) => {
    const mappedKey = CATEGORY_KEY_MAP[key] || key;
    return t(`home.categories1.${mappedKey}`);
  };

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetchRelated = async () => {
      if (!currentProduct) return;
      
      try {
        setLoading(true);
        const res = await publicRequest.get("/products");
        
        // Filtreleme Mantığı:
        // 1. Aynı kategoride veya etiketlerde (tags) eşleşen
        // 2. Mevcut görüntülenen ürün HARİÇ (p._id !== currentProduct._id)
        const filtered = res.data
            .filter(p => (
                (p.category === currentProduct.category || p.tags?.includes(currentProduct.category)) 
                && p._id !== currentProduct._id
                && p.stock > 0     // Stokta olmayanları gösterme (opsiyonel)
                && p.isActive      // Aktif olmayanları gösterme
            ))
            .slice(0, 4); // Sadece 4 tane göster

        setRelated(filtered);
      } catch (err) {
        console.error("Related fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [currentProduct]);

  if (loading || related.length === 0) return null;

  return (
    <div className="mt-24 pt-12 border-t border-gray-100 relative z-10">
      <div className="flex items-center justify-center mb-10">
        <h3 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 drop-shadow-sm">
            {t("productDetail.similarProducts") || "You may also like"}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {related.map((item, index) => {
          
          // ÖNEMLİ: ProductCard 'img' prop'unu kullanır. 
          // Eğer veritabanınızda resim 'imgs' array'inde ise ve 'img' boşsa,
          // burada veriyi mapleyerek karta doğru görseli gönderiyoruz.
          const displayProduct = {
            ...item,
            img: (item.imgs && item.imgs.length > 0) ? item.imgs[0] : (item.img || "https://placehold.co/400")
          };

          return (
            <ProductCard
              key={item._id}
              index={index}
              product={displayProduct}
              cartItem={getCartItem(item._id)}
              isFav={favorites.includes(item._id)}
              toggleFavorite={handleToggleFavorite}
              handleAddToCart={handleAddToCart}
              handleDecrease={handleDecrease}
              handleIncrease={handleIncrease}
              handleInput={handleInput}
              maxAlertProd={maxAlertProd}
              decodeHtml={decodeHtml}
              getCatLabel={getCatLabel}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;