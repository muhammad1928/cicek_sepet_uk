import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

const FavoritesPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, toggleFavorite, favorites, notify } = useCart(); // Context'ten çektik
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchFavorites = async () => {
      try {
        // Backend'deki populate edilmiş favori rotasını çağırıyoruz
        const res = await axios.get(`https://ciceksepeti-api-m8ir.onrender.com/api/users/${user._id}/favorites`);
        setProducts(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [navigate, favorites]); // favorites değişince (silince) sayfa güncellensin

  if (loading) return <div className="min-h-screen flex items-center justify-center text-pink-600 font-bold">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Favorilerim ❤️</h1>
        <p className="text-gray-500 mb-8">{products.length} adet ürün favorilerinizde.</p>

        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-bold text-gray-700">Favori Listeniz Boş</h3>
            <p className="text-gray-400 mt-2 mb-6">Beğendiğiniz çiçekleri kalp ikonuna basarak buraya ekleyebilirsiniz.</p>
            <Link to="/" className="bg-pink-600 text-white px-6 py-3 rounded-full font-bold hover:bg-pink-700 transition">Alışverişe Başla</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              // Ürün sepette mi kontrolü
              const isInCart = cart.find(item => item._id === product._id);

              return (
                <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 overflow-hidden relative group">
                  
                  {/* Silme Butonu (X) */}
                  <button 
                    onClick={() => toggleFavorite(product._id)}
                    className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-md transition font-bold"
                    title="Listeden Çıkar"
                  >
                    ✕
                  </button>

                  {/* Resim */}
                  <Link to={`/product/${product._id}`}>
                    <div className="h-48 overflow-hidden bg-gray-100 relative">
                      <img src={product.img} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                  </Link>

                  {/* Bilgi */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{product.title}</h3>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xl font-extrabold text-gray-900">£{product.price}</span>
                      
                      {isInCart ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Sepette Var</span>
                      ) : (
                        <button 
                          onClick={() => addToCart(product)}
                          className="text-pink-600 border border-pink-200 hover:bg-pink-50 px-3 py-1 rounded-lg text-xs font-bold transition"
                        >
                          Sepete Ekle
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;