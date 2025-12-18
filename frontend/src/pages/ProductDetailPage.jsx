import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { publicRequest } from "../requestMethods";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FiMinus, FiPlus, FiShoppingCart, FiHeart, FiArrowLeft, FiAlertCircle, FiInfo } from "react-icons/fi";
import { FaStore, FaCheckCircle, FaTruck, FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, favorites, notify } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  
  // --- VARYANT STATE'LERİ ---
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Yorum State'leri
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  
  const user = JSON.parse(localStorage.getItem("user"));

  // Sayfa açılınca en üste git ve ürünü çek
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await publicRequest.get(`/products/${id}`);
      setProduct(res.data);
      
      // İlk resmi ana resim olarak ayarla
      const firstImg = (res.data.imgs && res.data.imgs.length > 0) ? res.data.imgs[0] : (res.data.img || "https://placehold.co/600");
      setMainImage(firstImg);
      
      // Varyantları ve miktarı sıfırla
      setSelectedVariant(null);
      setQuantity(1);
    } catch (err) { 
      console.log(err); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- SEPETE EKLEME MANTIĞI ---
  const handleAddToCart = () => {
      // DÜZELTME: Kategoriye bakmaksızın, ürünün varyantı varsa seçim zorunlu olsun.
      // Bu sayede "Ev Dekor" kategorisinde bir ürüne renk eklersen de çalışır.
      const hasVariants = product.variants && product.variants.length > 0;
      
      if (hasVariants && !selectedVariant) {
          setErrorMsg(t('product.selectVariantError') || "Lütfen bir seçenek belirleyin!");
          return;
      }

      // 2. Sepete Ekle (Context'e varyantı da gönderiyoruz)
      addToCart(product, quantity, selectedVariant);
      setErrorMsg(""); 
      notify(t('product.addedToCart') || "Sepete Eklendi", "success");
  };

  // Varyant Seçimi
  const handleVariantSelect = (v) => {
      setSelectedVariant(v);
      setQuantity(1); // Varyant değişince miktarı sıfırla
      setErrorMsg(""); 
  };

  // Miktar Değişimi
  const handleQuantityChange = (type) => {
      // Geçerli stok: Varyant seçiliyse onun stoğu, yoksa ana stok
      const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

      if (type === "dec") {
          setQuantity(prev => Math.max(1, prev - 1));
      } else {
          if (quantity < currentStock) {
              setQuantity(prev => prev + 1);
          } else {
              notify(t('cartContext.maxStockReached') || "Maksimum stoğa ulaşıldı", "warning");
          }
      }
  };

  // Yorum Gönderme
  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return notify(t("productDetail.loginBeforeComment") || "Yorum yapmak için giriş yapın", "warning");
    if (!reviewText.trim()) return notify("Yorum boş olamaz", "warning");

    try {
        await publicRequest.post(`/products/${id}/reviews`, { 
            user: user.fullName || user.username, 
            rating, 
            comment: reviewText 
        });
        notify(t("productDetail.commentSubmitSuccess") || "Yorum gönderildi", "success"); 
        fetchProduct(); // Yorumları güncellemek için ürünü tekrar çek
        setReviewText("");
    } catch (err) { 
        const msg = err.response?.data?.message || "Hata oluştu";
        notify(msg, "error"); 
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-pink-600 text-xl animate-pulse">{t("common.loading") || "Yükleniyor..."}</div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><h2 className="text-2xl font-bold text-gray-800">{t("home.notFound")}</h2><button onClick={() => navigate("/")} className="text-blue-600 underline">{t("common.backToHome")}</button></div>;

  // Yardımcı Değişkenler
  const isFav = favorites.includes(product._id);
  // DÜZELTME: isClothing yerine genel varyant kontrolü (Display için)
  const hasVariants = product.variants && product.variants.length > 0;
  const isFood = ['edible', 'snack', 'chocolate', 'cake', 'cookies'].includes(product.category) || product.foodDetails?.ingredients?.length > 0;
  
  // Stok Gösterimi (Varyant seçiliyse varyant stoğu, değilse toplam stok)
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
  const vendorName = product.vendor?.username || "Fesfu Flowers UK";

  return (
    <div className="bg-gray-50 min-h-screen font-sans animate-fade-in">
      <Navbar />
      <Seo title={product.title} description={product.desc} image={mainImage} />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto relative z-10">
            
            {/* Geri Dön Butonu */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 font-bold transition group w-fit">
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform"/> {t("common.goBack") || "Geri Dön"}
            </button>

            <div className="bg-white rounded-[2rem] shadow-xl border border-white/50 overflow-hidden flex flex-col lg:flex-row gap-0">
            
            {/* --- SOL TARA: GALERİ --- */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8 bg-gray-50">
                <div className="aspect-[4/3] w-full bg-white rounded-2xl overflow-hidden relative shadow-sm border border-gray-200 group mb-4">
                    <img src={mainImage} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt={product.title} />
                    
                    {displayStock <= 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                            <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-xl rotate-12 shadow-2xl border-4 border-white">
                                {t('product.soldOut') || "Tükendi"}
                            </span>
                        </div>
                    )}
                    
                    <button onClick={() => toggleFavorite(product._id)} className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition z-20">
                        <FiHeart className={isFav ? "fill-red-500 text-red-500 text-xl" : "text-gray-400 text-xl"} />
                    </button>
                </div>

                {/* Küçük Resimler (Thumbnail) */}
                {product.imgs && product.imgs.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scroll">
                        {product.imgs.map((img, idx) => (
                            <img 
                                key={idx} 
                                src={img} 
                                onClick={() => setMainImage(img)} 
                                className={`w-20 h-20 rounded-xl object-cover cursor-pointer border-2 transition ${mainImage === img ? 'border-pink-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`} 
                                alt="thumb"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- SAĞ TARA: DETAYLAR --- */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col bg-white">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {t(`home.categories1.${product.category}`) || product.category}
                    </span>
                    {/* Ek Kategoriler (Tags) */}
                    {product.tags && product.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full uppercase">
                            {t(`home.categories1.${tag}`) || tag}
                        </span>
                    ))}
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-3 mt-2">{product.title}</h1>
                
                {/* Değerlendirme ve Satıcı */}
                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                        <FaStar /> <span className="font-bold text-gray-700">{product.averageRating || "New"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaStore className="text-pink-500"/>
                        {product.vendor ? (
                            <Link to={`/store/${product.vendor._id}`} className="hover:text-pink-600 transition underline decoration-dotted">{vendorName}</Link>
                        ) : (
                            <span>{vendorName}</span>
                        )}
                    </div>
                </div>

                {/* Yiyecek İçeriği */}
                {isFood && product.foodDetails && (
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6 animate-fade-in">
                        <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <FiInfo/> {t('admin.food.title') || "Product Info"}
                        </h4>
                        {product.foodDetails.calories > 0 && <div className="text-sm text-orange-700 mb-1"><strong>{t('admin.food.calories') || "Calories"}:</strong> {product.foodDetails.calories} kcal</div>}
                        {product.foodDetails.ingredients?.length > 0 && (
                            <div className="text-sm text-orange-700 leading-relaxed">
                                <strong>{t('admin.food.ingredients') || "Ingredients"}:</strong> {product.foodDetails.ingredients.join(", ")}
                            </div>
                        )}
                    </div>
                )}

                <p className="text-gray-600 leading-relaxed mb-8">{product.desc}</p>

                {/* --- VARYANT SEÇİMİ (DİNAMİK) --- */}
                {hasVariants && (
                    <div className="mb-8">
                        <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">{t('product.options') || "Select Option"}:</h4>
                        <div className="flex flex-wrap gap-3">
                            {product.variants.map((variant, idx) => {
                                const isSelected = selectedVariant === variant;
                                const hasStock = variant.stock > 0;
                                return (
                                    <button
                                        key={idx}
                                        disabled={!hasStock}
                                        onClick={() => handleVariantSelect(variant)}
                                        className={`
                                            px-4 py-2 rounded-xl border text-sm font-bold transition flex flex-col items-center min-w-[80px] relative overflow-hidden
                                            ${isSelected ? 'border-pink-600 bg-pink-50 text-pink-700 ring-1 ring-pink-600' : 'border-gray-200 text-gray-600 hover:border-pink-300 hover:bg-gray-50'}
                                            ${!hasStock ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                                        `}
                                    >
                                        <span>{variant.size}</span>
                                        <span className="text-[10px] font-normal opacity-75">{variant.color}</span>
                                        {!hasStock && <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 text-red-500 text-[10px] font-black rotate-12">SOLD</div>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Hata Mesajı */}
                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 flex items-center gap-2 text-sm font-bold animate-pulse">
                        <FiAlertCircle className="text-lg"/> {errorMsg}
                    </div>
                )}

                {/* Fiyat ve Aksiyonlar */}
                <div className="mt-auto">
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-extrabold text-gray-900">£{product.price}</span>
                        {displayStock > 0 && displayStock < 5 && <span className="text-xs text-red-500 font-bold mb-2 animate-bounce">Running low! Only {displayStock} left</span>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Miktar */}
                        <div className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3 sm:w-1/3">
                            <button onClick={() => handleQuantityChange("dec")} className="text-gray-500 hover:text-pink-600 transition disabled:opacity-30" disabled={quantity <= 1}><FiMinus /></button>
                            <span className="font-bold text-lg w-8 text-center text-gray-800">{quantity}</span>
                            <button onClick={() => handleQuantityChange("inc")} className="text-gray-500 hover:text-pink-600 transition disabled:opacity-30" disabled={quantity >= displayStock}><FiPlus /></button>
                        </div>

                        {/* Ekle Butonu */}
                        <button 
                            onClick={handleAddToCart} 
                            disabled={displayStock <= 0}
                            className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition transform active:scale-95 ${displayStock > 0 ? "bg-gray-900 text-white hover:bg-black hover:shadow-2xl" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                        >
                            <FiShoppingCart className="text-xl" /> 
                            {displayStock > 0 ? (t("product.addToCart") || "Add to Cart") : (t("product.outOfStock") || "Out of Stock")}
                        </button>
                    </div>
                    
                    {/* Güvenlik Rozetleri */}
                    <div className="flex gap-4 mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest justify-center sm:justify-start">
                        <div className="flex items-center gap-1"><FaCheckCircle className="text-green-500"/> Secure Payment</div>
                        <div className="flex items-center gap-1"><FaTruck className="text-blue-500"/> Fast Delivery</div>
                    </div>
                </div>
            </div>
            </div>
            
            

            {/* --- YORUMLAR BÖLÜMÜ --- */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Form */}
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{t("productDetail.submitReviewAlt") || "Leave a Review"}</h3>
                    {user ? (
                        <form onSubmit={submitReview} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t("productDetail.yourRating") || "Rating"}</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} type="button" onClick={() => setRating(star)} className={`text-3xl transition hover:scale-110 ${star <= rating ? "text-yellow-400" : "text-gray-200"}`}>★</button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t("productDetail.yourReview") || "Review"}</label>
                                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-pink-500 h-32 resize-none" placeholder={t("productDetail.placeholder") || "Write your thoughts..."} />
                            </div>
                            <button type="submit" className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition w-full">{t("productDetail.submitReview") || "Submit"}</button>
                        </form>
                    ) : (
                        <div className="bg-blue-50 p-8 rounded-3xl text-blue-800 border border-blue-100 text-center">
                            <Link to="/login" className="font-bold underline">{t("productDetail.loginTocomment1") || "Login"}</Link> {t("productDetail.loginTocomment2") || "to leave a review."}
                        </div>
                    )}
                </div>

                {/* Yorumlar Listesi */}
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{t("common.reviews") || "Reviews"} ({product.reviews.length})</h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scroll">
                        {product.reviews.length === 0 ? <div className="text-gray-400 italic text-center p-8 border-2 border-dashed rounded-2xl">{t("productDetail.firstComment") || "No reviews yet."}</div> : 
                            product.reviews.slice().reverse().map((review, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">{review.user[0].toUpperCase()}</div>
                                            <div>
                                                <span className="font-bold text-gray-900 block">{review.user}</span>
                                                <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-yellow-400 text-sm">{"★".repeat(review.rating)}</div>
                                    </div>
                                    <p className="text-gray-600 text-sm pl-12 leading-relaxed">{review.comment}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* --- BENZER ÜRÜNLER --- */}
            <RelatedProducts currentProduct={product} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Benzer Ürünler Bileşeni (Aynı kaldı)
const RelatedProducts = ({ currentProduct }) => {
  const { t } = useTranslation();
  const [related, setRelated] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await publicRequest.get("/products");
        const filtered = res.data
            .filter(p => (p.category === currentProduct.category || p.tags?.includes(currentProduct.category)) && p._id !== currentProduct._id)
            .slice(0, 4);
        setRelated(filtered);
      } catch (err) { console.log(err); }
    };
    if (currentProduct) fetchRelated();
  }, [currentProduct]);

  if (related.length === 0) return null;

  return (
    <div className="mt-20 pt-10 border-t border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-8">{t("productDetail.similarProducts") || "You may also like"}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {related.map((item) => {
            const itemImg = (item.imgs && item.imgs.length > 0) ? item.imgs[0] : (item.img || "https://placehold.co/400");
            return (
                <div 
                    key={item._id} 
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                    onClick={() => { navigate(`/product/${item._id}`); window.scrollTo(0, 0); }}
                >
                    <div className="h-48 overflow-hidden relative bg-gray-50">
                        <img src={itemImg} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={item.title} />
                    </div>
                    <div className="p-4">
                        <h4 className="font-bold text-gray-800 text-sm truncate mb-1">{item.title}</h4>
                        <div className="text-pink-600 font-extrabold">£{item.price}</div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default ProductDetailPage;