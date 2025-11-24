import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, favorites, notify } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Yorum Formu
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  
  // Kullanıcı Kontrolü
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    window.scrollTo(0, 0); // Sayfa değişince en üste at
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(res.data);
    } catch (err) { console.log(err); } 
    finally { setLoading(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return notify("Giriş yapmalısınız!", "warning");
    if (!reviewText) return notify("Yorum yazın.", "warning");

    try {
      await axios.post(`http://localhost:5000/api/products/${id}/reviews`, {
        user: user.username, rating, comment: reviewText
      });
      notify("Yorum eklendi! 🌸", "success");
      setReviewText("");
      fetchProduct(); // Yorumları güncelle
    } catch (err) {
      const message = err.response?.data?.message || "Hata oluştu.";
      notify(message, "error");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-pink-600">Yükleniyor...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Ürün bulunamadı.</div>;

  const isFav = favorites.includes(product._id);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-10 px-4">
      
      {/* SEO AYARLARI */}
      <Seo 
        title={`${product.title} | ÇiçekSepeti UK`}
        description={`${product.title} sadece £${product.price}. ${product.desc.substring(0, 100)}...`} 
        keywords={`${product.category}, ${product.title}, çiçek siparişi`}
      />

      <div className="max-w-6xl mx-auto">
        
        {/* --- ÜRÜN KARTI --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Sol: Resim */}
          <div className="w-full md:w-1/2 h-[400px] md:h-[500px] bg-gray-100 relative group">
            <img src={product.img} className="w-full h-full object-cover" alt={product.title} />
            {product.stock <= 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-3xl font-bold backdrop-blur-sm">TÜKENDİ</div>}
          </div>

          {/* Sağ: Bilgiler */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            
            <div className="flex justify-between items-start">
              <span className="text-sm text-pink-600 font-bold uppercase tracking-wider mb-2 bg-pink-50 px-2 py-1 rounded">{product.category || "Genel"}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                  <span className="text-lg mr-1">★</span>
                  <span className="font-bold text-gray-800">{product.averageRating || "0.0"}</span>
                  <span className="text-gray-400 text-xs ml-1">({product.reviews.length})</span>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-800 mb-2 mt-2">{product.title}</h1>
            
            {/* Satıcı Linki */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">Satıcı:</span>
              {product.vendor ? (
                <Link 
                  to={`/store/${product.vendor._id}`} 
                  className="text-sm font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded transition"
                >
                  {product.vendor.username} ↗
                </Link>
              ) : (
                <span className="text-sm font-bold text-gray-400">ÇiçekSepeti UK</span>
              )}
            </div>

            <p className="text-gray-600 text-lg mb-6 leading-relaxed">{product.desc}</p>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-extrabold text-gray-900">£{product.price}</span>
              {product.stock > 0 ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">Stokta Var ({product.stock})</span>
              ) : (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">Stokta Yok</span>
              )}
            </div>

            {/* AKSİYON BUTONLARI */}
            {product.stock > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  {/* Adet Seçici */}
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-32">
                    <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="px-3 py-3 hover:bg-gray-100 font-bold text-gray-600 w-full">-</button>
                    <span className="px-2 font-bold text-gray-800 w-full text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => q < product.stock ? q + 1 : q)} className="px-3 py-3 hover:bg-gray-100 font-bold text-gray-600 w-full">+</button>
                  </div>
                  
                  {/* Sepete Ekle */}
                  <button 
                    onClick={() => addToCart(product, quantity)}
                    className="flex-1 bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 transition shadow-lg hover:shadow-pink-500/30 active:scale-95"
                  >
                    Sepete Ekle
                  </button>
                </div>

                {/* FAVORİ BUTONU */}
                <button 
                  onClick={async () => {
                    await toggleFavorite(product._id);
                    fetchProduct(); // Tıklayınca sayıyı güncellemek için yeniden çekiyoruz
                  }}
                  className={`w-full py-3 rounded-xl font-bold border-2 transition flex items-center justify-center gap-2 ${isFav ? "border-red-200 bg-red-50 text-red-600" : "border-gray-200 text-gray-500 hover:border-pink-200 hover:text-pink-500"}`}
                >
                  <span className="text-xl">{isFav ? "❤️" : "🤍"}</span>
                  <span>{isFav ? "Favorilerimden Çıkar" : "Favorilere Ekle"}</span>
                  <span className="ml-1 text-xs opacity-70">({product.favoritesCount || 0} kişi beğendi)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- YORUMLAR VE FORM --- */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Yorum Formu */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Değerlendirme Yap</h3>
            {user ? (
              <form onSubmit={submitReview} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Puanınız</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setRating(star)} className={`text-3xl transition ${star <= rating ? "text-yellow-400 scale-110" : "text-gray-200"}`}>★</button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Yorumunuz</label>
                  <textarea 
                    value={reviewText} 
                    onChange={(e) => setReviewText(e.target.value)} 
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none h-32 bg-gray-50" 
                    placeholder="Ürün hakkında ne düşünüyorsunuz?" 
                  />
                </div>
                <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition w-full">Yorumu Gönder</button>
              </form>
            ) : (
              <div className="bg-blue-50 p-6 rounded-xl text-blue-800 border border-blue-100 text-center">
                <p>Yorum yapmak için <span className="font-bold cursor-pointer underline" onClick={() => navigate("/login")}>Giriş Yapmalısınız</span>.</p>
              </div>
            )}
          </div>

          {/* Yorum Listesi */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Yorumlar ({product.reviews.length})</h3>
            <div className="space-y-4">
              {product.reviews.length === 0 ? <p className="text-gray-400 italic">Henüz yorum yapılmamış. İlk yorumu sen yap!</p> : 
                product.reviews.slice().reverse().map((review, index) => (
                  <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-gray-800 block">{review.user}</span>
                        <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-yellow-400 text-sm">{"★".repeat(review.rating)}</div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
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
        const filtered = res.data.filter(p => p.category === currentProduct.category && p._id !== currentProduct._id);
        setRelated(filtered.slice(0, 4));
      } catch (err) { console.log(err); }
    };
    fetchRelated();
  }, [currentProduct]);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 border-t pt-10 mb-10">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Bunları da Beğenebilirsiniz</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {related.map((item) => (
          <div 
            key={item._id} 
            className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition group"
            onClick={() => { navigate(`/product/${item._id}`); window.scrollTo(0, 0); }}
          >
            <div className="h-40 overflow-hidden relative">
              <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
            </div>
            <div className="p-3">
              <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
              <div className="text-pink-600 font-bold mt-1">£{item.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetailPage;