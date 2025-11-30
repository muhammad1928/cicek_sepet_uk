import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";
import { ProductSkeleton } from "../components/Loading";
import { FaCalendarAlt, FaStar, FaStore, FaQuoteRight } from "react-icons/fa";
import { FiShoppingBag, FiInfo, FiMapPin, FiMessageSquare } from "react-icons/fi";

const StorePage = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products"); // 'products' | 'about' | 'reviews'
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Satıcı Profilini Çek
        const vendorRes = await axios.get(`http://localhost:5000/api/users/vendor-profile/${id}`);
        setVendor(vendorRes.data);

        // 2. Satıcının Ürünlerini Çek
        const productsRes = await axios.get(`http://localhost:5000/api/products/vendor/${id}`);
        setProducts(productsRes.data.filter(p => p.isActive && p.stock > 0));
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- HESAPLAMALAR (YORUM HAVUZU) ---
  const { allReviews, averageRating } = useMemo(() => {
    // Tüm ürünlerin yorumlarını tek bir dizide topla
    const reviews = products.flatMap(p => 
      p.reviews.map(r => ({ ...r, productName: p.title, productImage: p.img, productId: p._id }))
    );
    
    // Tarihe göre sırala (En yeni en üstte)
    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Ortalamayı hesapla
    const totalPoints = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = reviews.length > 0 ? (totalPoints / reviews.length).toFixed(1) : "0.0";

    return { allReviews: reviews, averageRating: avg };
  }, [products]);


  if (loading) return <div className="pt-32 text-center"><ProductSkeleton /></div>;
  if (!vendor) return <div className="pt-32 text-center text-gray-500 text-xl">Mağaza bulunamadı.</div>;

  const settings = vendor.storeSettings || {};
  const bannerUrl = settings.banner || "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=1500&q=80";
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Seo 
        title={`${vendor.fullName || vendor.username} - ÇiçekSepeti UK`} 
        description={`${vendor.fullName} mağazasının en özel ürünlerini keşfedin.`} 
      />

      {/* --- 1. BANNER --- */}
      <div className="h-64 md:h-80 w-full bg-cover bg-center relative" style={{ backgroundImage: `url('${bannerUrl}')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative -mt-24 pb-20">
        
        {/* --- 2. MAĞAZA KARTI --- */}
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col md:flex-row items-center md:items-end gap-8 mb-10 text-center md:text-left relative z-10 border border-gray-100">
          
          {/* Logo */}
          <div className="w-36 h-36 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
            {settings.logo ? (
              <img src={settings.logo} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <span className="text-5xl font-bold text-pink-600 flex items-center justify-center w-full h-full bg-pink-50">
                {vendor.fullName ? vendor.fullName[0].toUpperCase() : <FaStore/>}
              </span>
            )}
          </div>

          {/* Bilgiler */}
          <div className="flex-1 pb-2">
            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{vendor.fullName || vendor.username}</h1>
            <p className="text-gray-500 text-sm mb-4 max-w-2xl mx-auto md:mx-0 line-clamp-2">{settings.description || "Bu mağaza için henüz bir açıklama girilmemiş."}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-gray-600">
              <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg border border-yellow-100">
                 <FaStar className="text-yellow-500" /> {averageRating} ({allReviews.length} Değerlendirme)
              </span>
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100"><FiShoppingBag /> {products.length} Ürün</span>
              <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"><FaCalendarAlt /> Üyelik: {new Date(vendor.createdAt).getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* --- 3. SEKME MENÜSÜ --- */}
        <div className="flex justify-center md:justify-start gap-8 border-b border-gray-200 mb-10 overflow-x-auto">
          <button onClick={() => setActiveTab("products")} className={`pb-3 text-lg font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === "products" ? "text-pink-600 border-b-4 border-pink-600" : "text-gray-400 hover:text-gray-600"}`}>
            <FiShoppingBag /> Ürünler
          </button>
          <button onClick={() => setActiveTab("reviews")} className={`pb-3 text-lg font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === "reviews" ? "text-pink-600 border-b-4 border-pink-600" : "text-gray-400 hover:text-gray-600"}`}>
            <FiMessageSquare /> Değerlendirmeler <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full ml-1">{allReviews.length}</span>
          </button>
          <button onClick={() => setActiveTab("about")} className={`pb-3 text-lg font-bold transition flex items-center gap-2 whitespace-nowrap ${activeTab === "about" ? "text-pink-600 border-b-4 border-pink-600" : "text-gray-400 hover:text-gray-600"}`}>
            <FiInfo /> Hakkında
          </button>
        </div>

        {/* --- 4. İÇERİK ALANI --- */}
        
        {/* A) ÜRÜNLER SEKMESİ */}
        {activeTab === "products" && (
          <div className="animate-fade-in-up">
            {products.length === 0 ? (
              <div className="text-center py-24 text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                 <div className="text-6xl mb-4 opacity-30">🥀</div>
                 <p className="text-lg font-medium">Bu mağazada henüz ürün bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden group flex flex-col relative">
                    <Link to={`/product/${product._id}`}>
                      <div className="h-64 relative bg-gray-100 overflow-hidden">
                        <img src={product.img} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" alt={product.title} />
                        {product.category && <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold uppercase text-gray-600 shadow-sm">{product.category}</span>}
                      </div>
                    </Link>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-800 truncate mb-1 text-lg group-hover:text-pink-600 transition">{product.title}</h3>
                      <p className="text-xs text-gray-400 mb-4 line-clamp-2">{product.desc}</p>
                      <div className="mt-auto flex justify-between items-end pt-4 border-t border-gray-50">
                        <span className="text-2xl font-black text-gray-900">£{product.price}</span>
                        <button onClick={() => addToCart(product)} className="bg-pink-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200 hover:bg-pink-700 transition hover:scale-110 active:scale-95" title="Sepete Ekle">
                            <FiShoppingBag />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* B) DEĞERLENDİRMELER SEKMESİ (YENİ) */}
        {activeTab === "reviews" && (
          <div className="animate-fade-in max-w-4xl mx-auto">
             
             {/* Özet Kartı */}
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                   <h3 className="text-2xl font-bold text-gray-800 mb-1">Mağaza Puanı</h3>
                   <div className="text-5xl font-black text-yellow-400 flex items-center justify-center md:justify-start gap-2">
                      {averageRating} <span className="text-lg text-gray-300 font-medium">/ 5</span>
                   </div>
                   <p className="text-sm text-gray-500 mt-2">Toplam {allReviews.length} değerlendirme</p>
                </div>
                <div className="flex gap-1">
                   {[1,2,3,4,5].map(star => (
                      <FaStar key={star} className={`text-3xl ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-200'}`} />
                   ))}
                </div>
             </div>

             {/* Yorum Listesi */}
             <div className="space-y-4">
               {allReviews.length === 0 ? (
                 <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                    <FiMessageSquare className="mx-auto text-4xl mb-2 opacity-30"/>
                    <p>Bu mağaza için henüz yorum yapılmamış.</p>
                 </div>
               ) : (
                 allReviews.map((review, index) => (
                   <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 border border-gray-200">
                               {review.user ? review.user[0].toUpperCase() : "U"}
                            </div>
                            <div>
                               <div className="font-bold text-gray-800">{review.user || "Anonim"}</div>
                               <div className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</div>
                            </div>
                         </div>
                         <div className="flex text-yellow-400 text-sm bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                            {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
                         </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed italic mb-4 pl-14">"{review.comment}"</p>
                      
                      {/* Hangi Ürüne Yapıldı? */}
                      <Link to={`/product/${review.productId}`} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl hover:bg-gray-100 transition ml-14 border border-gray-100 group">
                         <img src={review.productImage} className="w-10 h-10 rounded-lg object-cover border border-white shadow-sm" alt="Ürün" />
                         <div className="text-xs">
                            <span className="block text-gray-400 font-bold uppercase">Değerlendirilen Ürün</span>
                            <span className="font-bold text-gray-800 group-hover:text-pink-600 transition">{review.productName}</span>
                         </div>
                      </Link>
                   </div>
                 ))
               )}
             </div>
          </div>
        )}

        {/* C) HAKKINDA SEKMESİ */}
        {activeTab === "about" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 animate-fade-in max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"><FaStore /></div>
            <h3 className="text-3xl font-black text-gray-900 mb-6">Mağaza Hikayesi</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg mb-10">{settings.description || "Bu mağaza kendisi hakkında henüz detaylı bir bilgi paylaşmamış."}</p>
            <div className="bg-blue-50 p-6 rounded-2xl inline-block border border-blue-100"><p className="text-blue-800 font-bold mb-1">Güvenli Alışveriş</p><p className="text-blue-600 text-sm">Bu mağazadan yapacağınız tüm alışverişler ÇiçekSepeti UK güvencesi altındadır.</p></div>
            {vendor.applicationData?.city && (<div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm"><FiMapPin /> {vendor.applicationData.city}, {vendor.applicationData.address ? "UK" : ""}</div>)}
          </div>
        )}

      </div>
    </div>
  );
};

export default StorePage;