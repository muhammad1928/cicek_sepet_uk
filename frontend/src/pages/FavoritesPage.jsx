import { useState, useEffect } from "react";
import { publicRequest, userRequest } from "../requestMethods";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from "react-icons/fi";

const FavoritesPage = () => {
  const [favProducts, setFavProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite, addToCart } = useCart();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (favorites.length === 0) {
        setFavProducts([]);
        setLoading(false);
        return;
      }

      try {
        const res = await publicRequest.get("/products");
        const filtered = res.data.filter(p => favorites.includes(p._id));
        setFavProducts(filtered);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favorites]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-10 pb-20 px-4 relative overflow-hidden">
      <Seo title="Favorilerim" description="Beğendiğiniz ürünler." />
      
      {/* Arka Plan Süslemesi */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden bg-gradient-to-b from-pink-50 to-white pointer-events-none">
         <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-gradient-to-b from-pink-200/30 to-transparent rounded-full blur-3xl"></div>
         <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-gradient-to-b from-purple-200/30 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="flex items-center gap-4 mb-10">
            <div className="bg-white p-3 rounded-2xl shadow-sm text-pink-600 text-2xl"><FiHeart /></div>
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Favorilerim</h1>
                <p className="text-gray-500 text-sm">Beğendiğiniz ürünleri burada saklıyoruz.</p>
            </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
             {[1,2,3,4].map(i => <div key={i} className="h-80 bg-gray-200 rounded-3xl animate-pulse"></div>)}
          </div>
        ) : favProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="bg-white p-8 rounded-full shadow-xl mb-6 border border-pink-50">
                <span className="text-6xl opacity-80">💔</span>
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Listeniz Boş Görünüyor</h2>
             <p className="text-gray-500 max-w-md mb-8">Henüz favori listenize bir ürün eklemediniz. En taze çiçekleri ve hediyeleri keşfetmeye ne dersiniz?</p>
             <Link to="/" className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:-translate-y-1 active:translate-y-0 duration-300">
               Ürünleri Keşfet <FiArrowRight />
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {favProducts.map((product, index) => (
              <div 
                key={product._id} 
                className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden group flex flex-col relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                
                {/* Resim Alanı */}
                <Link to={`/product/${product._id}`}>
                  <div className="h-64 overflow-hidden relative bg-gray-50">
                    <img 
                      src={product.img} 
                      alt={product.title} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                    />
                    
                    {/* Silme Butonu (Hover'da çıkar) */}
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleFavorite(product._id); }}
                      className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                      title="Listeden Çıkar"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>

                    {/* Kategori Etiketi */}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold text-gray-600 uppercase shadow-sm">
                        {product.category}
                    </div>
                  </div>
                </Link>

                {/* İçerik */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 truncate text-lg" title={product.title}>{product.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{product.desc}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-bold uppercase">Fiyat</span>
                        <span className="text-xl font-extrabold text-gray-900">£{product.price}</span>
                    </div>
                    
                    <button 
                      onClick={() => addToCart(product)}
                      className="bg-pink-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-pink-700 transition shadow-lg shadow-pink-200 active:scale-90"
                      title="Sepete Ekle"
                    >
                      <FiShoppingCart />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;