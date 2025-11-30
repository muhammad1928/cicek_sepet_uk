import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";
import { FiMinus, FiPlus, FiShoppingCart, FiHeart, FiShare2, FiArrowLeft } from "react-icons/fi";
import { FaStore, FaCheckCircle, FaTruck } from "react-icons/fa";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, favorites, notify } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); // Adet state'i

  // Yorum Formu State'leri
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    window.scrollTo(0, 0); // Sayfa değişince en üste at
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      // Backend'den ürünü ve vendor bilgisini çekiyoruz (populate yapılmış olmalı)
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(res.data);
    } catch (err) { console.log(err); } 
    finally { setLoading(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return notify("Yorum yapmak için giriş yapmalısınız!", "warning");
    if (!reviewText.trim()) return notify("Lütfen bir yorum yazın.", "warning");

    try {
      await axios.post(`http://localhost:5000/api/products/${id}/reviews`, {
        user: user.fullName || user.username, // Kullanıcı adı
        rating, 
        comment: reviewText
      });
      notify("Yorumunuz başarıyla eklendi! 🌸", "success");
      setReviewText("");
      fetchProduct(); // Yorumları güncellemek için ürünü tekrar çek
    } catch (err) {
      const message = err.response?.data?.message || "Hata oluştu.";
      notify(message, "error");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-pink-600 text-xl animate-pulse">Yükleniyor...</div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><h2 className="text-2xl font-bold text-gray-800">Ürün Bulunamadı</h2><button onClick={() => navigate("/")} className="text-blue-600 underline">Ana Sayfaya Dön</button></div>;

  const isFav = favorites.includes(product._id);
  
  // Satıcı İsmi Kontrolü
  const vendorName = product.vendor?.fullName || product.vendor?.username || "ÇiçekSepeti UK";

  // Sepete Ekleme Fonksiyonu
  const handleAddToCart = () => {
      addToCart(product, quantity);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-28 pb-20 px-4 relative overflow-hidden">
      
      <Seo 
        title={`${product.title} | ÇiçekSepeti UK`}
        description={`${product.title} sadece £${product.price}. ${product.desc.substring(0, 100)}...`} 
        image={product.img}
      />

      {/* Arka Plan Dekoru */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-100/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Geri Dön */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 font-bold transition group w-fit">
           <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
        </button>

        {/* --- ÜRÜN KARTI --- */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Sol: Resim */}
          <div className="w-full lg:w-1/2 h-[400px] lg:h-auto bg-gray-100 relative group overflow-hidden">
            <img src={product.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={product.title} />
            
            {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-3xl font-bold backdrop-blur-sm">TÜKENDİ</div>
            )}
            
            {/* Favori Butonu */}
            <button onClick={() => toggleFavorite(product._id)} className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-xl shadow-lg hover:scale-110 transition z-20">
               <FiHeart className={isFav ? "fill-red-500 text-red-500" : "text-gray-400"} />
            </button>

            {/* Kategori */}
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold text-gray-800 uppercase tracking-widest shadow-sm">
               {product.category}
            </div>
          </div>

          {/* Sağ: Bilgiler */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
            
            {/* Başlık ve Değerlendirme */}
            <div className="flex justify-between items-start mb-4">
               <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight flex-1 mr-4">{product.title}</h1>
               <div className="flex items-center bg-yellow-50 text-yellow-600 px-3 py-1 rounded-lg font-bold shadow-sm">
                  <span className="text-lg mr-1">★</span> {product.averageRating || "0.0"}
               </div>
            </div>
            
            {/* Satıcı ve Stok Bilgisi */}
            <div className="flex flex-wrap gap-3 mb-8 text-sm">
               <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100 font-bold">
                  <FaStore /> 
                  {product.vendor ? (
                      <Link to={`/store/${product.vendor._id}`} className="hover:underline">Satıcı: {vendorName}</Link>
                  ) : (
                      <span>Satıcı: {vendorName}</span>
                  )}
               </div>
               <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100 font-bold">
                  <FaCheckCircle /> <span>Stok: {product.stock}</span>
               </div>
               <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 font-bold">
                  <FaTruck /> <span>Hızlı Teslimat</span>
               </div>
            </div>

            <p className="text-gray-600 text-base mb-8 leading-relaxed">{product.desc}</p>
            
            {/* Fiyat ve Sepet */}
            <div className="mt-auto pt-8 border-t border-gray-100">
               <div className="flex flex-col sm:flex-row gap-5 items-center">
                  
                  <div className="text-4xl font-extrabold text-pink-600 mr-auto">£{product.price}</div>

                  {product.stock > 0 && (
                    <>
                        {/* Adet Seçici */}
                        <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                            <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-pink-600 transition font-bold text-lg"><FiMinus/></button>
                            <span className="w-12 text-center font-bold text-lg text-gray-800">{quantity}</span>
                            <button onClick={() => setQuantity(q => Math.min(product.stock, q+1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-pink-600 transition font-bold text-lg"><FiPlus/></button>
                        </div>

                        {/* Sepete Ekle */}
                        <button 
                            onClick={handleAddToCart}
                            className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl hover:bg-black transition transform active:scale-95 flex items-center gap-3"
                        >
                            <FiShoppingCart /> Sepete Ekle
                        </button>
                    </>
                  )}
               </div>
            </div>

          </div>
        </div>

        {/* --- YORUMLAR VE FORM --- */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Yorum Formu */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 inline-block border-pink-500">Değerlendirme Yap</h3>
            {user ? (
              <form onSubmit={submitReview} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Puanınız</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setRating(star)} className={`text-4xl transition transform hover:scale-110 ${star <= rating ? "text-yellow-400 drop-shadow-sm" : "text-gray-200"}`}>★</button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Yorumunuz</label>
                  <textarea 
                    value={reviewText} 
                    onChange={(e) => setReviewText(e.target.value)} 
                    className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-pink-400 focus:bg-white bg-gray-50 outline-none h-32 resize-none transition text-gray-700" 
                    placeholder="Ürün hakkında ne düşünüyorsunuz?" 
                  />
                </div>
                <button type="submit" className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition shadow-lg w-full transform active:scale-95">Yorumu Gönder</button>
              </form>
            ) : (
              <div className="bg-blue-50 p-8 rounded-3xl text-blue-800 border border-blue-100 text-center">
                <p className="text-lg">Yorum yapmak için <span className="font-bold cursor-pointer underline hover:text-blue-900" onClick={() => navigate("/login")}>Giriş Yapmalısınız</span>.</p>
              </div>
            )}
          </div>

          {/* Yorum Listesi */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Yorumlar <span className="text-gray-400 text-lg font-normal">({product.reviews.length})</span></h3>
            <div className="space-y-4 h-[500px] overflow-y-auto pr-2 custom-scroll">
              {product.reviews.length === 0 ? <div className="text-gray-400 italic p-4 border-2 border-dashed rounded-2xl text-center">Henüz yorum yapılmamış. İlk yorumu sen yap!</div> : 
                product.reviews.slice().reverse().map((review, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold text-lg">{review.user[0].toUpperCase()}</div>
                        <div>
                            <span className="font-bold text-gray-800 block">{review.user}</span>
                            <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex text-yellow-400 text-sm bg-yellow-50 px-2 py-1 rounded-lg">
                        {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed pl-14">"{review.comment}"</p>
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
  );
};

// Benzer Ürünler Bileşeni
const RelatedProducts = ({ currentProduct }) => {
  const [related, setRelated] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        // Aynı kategoride ama kendisi olmayan ürünleri al (İlk 4 tane)
        const filtered = res.data.filter(p => p.category === currentProduct.category && p._id !== currentProduct._id).slice(0, 4);
        setRelated(filtered);
      } catch (err) { console.log(err); }
    };
    fetchRelated();
  }, [currentProduct]);

  if (related.length === 0) return null;

  return (
    <div className="mt-20 pt-10 border-t border-gray-200 mb-10">
      <h3 className="text-2xl font-bold text-gray-800 mb-8">Bunları da Beğenebilirsiniz</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {related.map((item) => (
          <div 
            key={item._id} 
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            onClick={() => { navigate(`/product/${item._id}`); window.scrollTo(0, 0); }}
          >
            <div className="h-48 overflow-hidden relative bg-gray-50">
              <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={item.title} />
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-800 text-sm truncate mb-1">{item.title}</h4>
              <div className="text-pink-600 font-extrabold">£{item.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetailPage;