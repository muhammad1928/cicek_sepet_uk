import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // URL'den ID okumak için
import axios from "axios";
import { useCart } from "../context/CartContext";

const ProductDetailPage = () => {
  const { id } = useParams(); // URL'deki :id kısmını al
  const navigate = useNavigate();
  const { addToCart, notify } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Yorum State'leri
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const user = JSON.parse(localStorage.getItem("user"));
  // --- YENİ BİLEŞEN: BENZER ÜRÜNLER ---
  const RelatedProducts = ({ currentProduct }) => {
    const [related, setRelated] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchRelated = async () => {
        try {
          const res = await axios.get("https://ciceksepeti-api-m8ir.onrender.com/api/products");
          // Mantık: Aynı kategorideki ürünleri bul, ama şu an baktığım ürünü hariç tut.
          const filtered = res.data.filter(
            p => p.category === currentProduct.category && p._id !== currentProduct._id
          );
          // Sadece ilk 4 tanesini al
          setRelated(filtered.slice(0, 4));
        } catch (err) { console.log(err); }
      };
      fetchRelated();
    }, [currentProduct]);

    if (related.length === 0) return null;

    return (
      <div className="mt-16 border-t pt-10">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Bunları da Beğenebilirsiniz</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related.map((item) => (
            <div 
              key={item._id} 
              className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition group"
              onClick={() => {
                navigate(`/product/${item._id}`);
                window.scrollTo(0, 0); // Sayfa başına git
              }}
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
  // Ürünü Çek
  const fetchProduct = async () => {
    try {
      const res = await axios.get(`https://ciceksepeti-api-m8ir.onrender.com/api/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  // Yorum Gönder
  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return notify("Giriş yapmalısınız!", "warning");
    if (!reviewText) return notify("Yorum yazın.", "warning");

    try {
      await axios.post(`https://ciceksepeti-api-m8ir.onrender.com/api/products/${id}/reviews`, {
        user: user.username,
        rating,
        comment: reviewText
      });
      notify("Yorum eklendi! 🌸", "success");
      setReviewText("");
      fetchProduct();
    } catch (err) {
      // --- HATA MESAJINI BACKEND'DEN ALIYORUZ ---
      // Backend "Uygunsuz içerik" derse onu gösteririz
      const message = err.response?.data?.message || "Hata oluştu.";
      notify(message, "error");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Ürün bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* --- ÜST KISIM: ÜRÜN DETAYI --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Sol: Resim */}
          <div className="w-full md:w-1/2 h-[400px] md:h-[500px] bg-gray-100 relative">
            <img src={product.img} className="w-full h-full object-cover" alt={product.title} />
            {product.stock <= 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-3xl font-bold">TÜKENDİ</div>}
          </div>

          {/* Sağ: Bilgiler */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            <span className="text-sm text-pink-600 font-bold uppercase tracking-wider mb-2">{product.category || "Genel"}</span>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.title}</h1>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">{product.desc}</p>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-extrabold text-gray-900">£{product.price}</span>
              {product.stock > 0 ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">Stokta Var ({product.stock})</span>
              ) : (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">Stokta Yok</span>
              )}
            </div>

            {/* Sepet Kontrolleri */}
            {product.stock > 0 && (
              <div className="flex gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="px-4 py-3 hover:bg-gray-100 font-bold text-gray-600">-</button>
                  <span className="px-4 font-bold text-gray-800 w-12 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q < product.stock ? q + 1 : q)} className="px-4 py-3 hover:bg-gray-100 font-bold text-gray-600">+</button>
                </div>
                <button 
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 transition shadow-lg hover:shadow-pink-500/30"
                >
                  Sepete Ekle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- ALT KISIM: YORUMLAR --- */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Yorum Yap Formu */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Değerlendirme Yap</h3>
            {user ? (
              <form onSubmit={submitReview} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Puanınız</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} type="button" 
                        onClick={() => setRating(star)}
                        className={`text-2xl transition ${star <= rating ? "text-yellow-400 scale-110" : "text-gray-300"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Yorumunuz</label>
                  <textarea 
                    value={reviewText} 
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none h-32"
                    placeholder="Ürün nasıldı?"
                  />
                </div>
                <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
                  Yorumu Gönder
                </button>
              </form>
            ) : (
              <div className="bg-blue-50 p-6 rounded-xl text-blue-800 border border-blue-100">
                Yorum yapmak için <span className="font-bold cursor-pointer underline" onClick={() => navigate("/login")}>Giriş Yapmalısınız</span>.
              </div>
            )}
          </div>

          {/* Yorum Listesi */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Yorumlar ({product.reviews.length})</h3>
            <div className="space-y-4">
              {product.reviews.length === 0 ? (
                <p className="text-gray-400 italic">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
              ) : (
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
              )}
            </div>
          </div>

        </div>
        <RelatedProducts currentProduct={product} />
      </div>
    </div>
  );
};

export default ProductDetailPage;