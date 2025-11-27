import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { ProductSkeleton } from "../components/Loading";
import ConfirmModal from "../components/ConfirmModal"; // <--- YENİ MODAL İMPORTU

// KATEGORİLER VE İKONLARI
const CATEGORIES = ["Tümü", "Doğum Günü", "Yıldönümü", "İç Mekan", "Yenilebilir Çiçek", "Tasarım Çiçek"];

const getCategoryIcon = (category) => {
  const icons = {
    "Doğum Günü": "🎂", "Yıldönümü": "💍", "İç Mekan": "🪴", 
    "Yenilebilir Çiçek": "🍫", "Tasarım Çiçek": "✨"
  };
  return icons[category] || "🌸";
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [loading, setLoading] = useState(true);

  const { 
    cart, addToCart, increaseQuantity, decreaseQuantity, updateItemQuantity, 
    removeFromCart, favorites, toggleFavorite, searchTerm 
  } = useCart();

  // Silinecek ürün state'i (Modalı tetikler)
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleImageError = (e) => { e.target.src = "https://placehold.co/400x300?text=Resim+Yok"; };

  // 1. ÜRÜNLERİ ÇEK
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        const active = res.data.filter(p => p.stock > 0 && p.isActive === true);
        setProducts(active);
        setFilteredProducts(active);
      } catch (err) { console.log(err); } 
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  // 2. FİLTRELEME
  useEffect(() => {
    let result = products;
    if (selectedCategory !== "Tümü") {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchTerm) {
      result = result.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, products]);

  const getCartItem = (id) => cart.find(item => item._id === id);
  
  // Miktar azaltma (1 ise silme onayı iste)
  const handleDecrease = (product, currentQty) => { 
    if (currentQty === 1) {
      setItemToDelete(product); // Modalı açar
    } else {
      decreaseQuantity(product._id, product.title); 
    }
  };

  // Onaylanırsa sil
  const confirmDelete = () => { 
    if (itemToDelete) { 
      removeFromCart(itemToDelete._id, itemToDelete.title); 
      setItemToDelete(null); 
    } 
  };
  
  const handleInputChange = (e, product) => {
    const val = e.target.value;
    if (val === "") { updateItemQuantity(product._id, 1, product.stock, product.title); return; }
    const numVal = parseInt(val);
    if (!isNaN(numVal)) updateItemQuantity(product._id, numVal, product.stock, product.title);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative">
      <Seo title="Ana Sayfa - En Taze Çiçekler" description="Londra'nın çiçekçisi." keywords="çiçek" />

      {/* HERO */}
      <div className="pt-16 pb-10 text-center bg-gradient-to-b from-pink-50 to-white px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight animate-fade-in">
          Sevdiklerinizi <span className="text-pink-600">Mutlu Edin</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto animate-fade-in delay-100">
          Londra'nın en taze çiçekleri ve en özel hediyelerini aynı gün kapınıza getiriyoruz.
        </p>
      </div>

      {/* KATEGORİ */}
      <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 mb-10 py-4 overflow-x-auto no-scrollbar transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 flex gap-3">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${selectedCategory === cat ? "bg-pink-600 text-white shadow-lg transform scale-105" : "bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-600"}`}><span>{getCategoryIcon(cat)}</span> {cat}</button>
          ))}
        </div>
      </div>

      {/* LİSTE ALANI */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        
        {loading ? (
          <ProductSkeleton />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-400 py-20 animate-fade-in">
             <div className="text-6xl mb-4">🥀</div>
             <p>Aradığınız kriterde ürün bulunamadı.</p>
             <button onClick={() => {setSelectedCategory("Tümü")}} className="mt-4 text-pink-600 font-bold hover:underline">Filtreleri Temizle</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => {
              const cartItem = getCartItem(product._id);
              const isFav = favorites.includes(product._id);

              return (
                <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col relative h-[380px] animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  
                  <Link to={`/product/${product._id}`}>
                    <div className="h-56 overflow-hidden relative bg-gray-100 flex-shrink-0 cursor-pointer">
                      <img src={product.img || "https://placehold.co/400"} alt={product.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" onError={handleImageError} />
                      {product.category && <div className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-lg" title={product.category}>{getCategoryIcon(product.category)}</div>}
                    </div>
                  </Link>

                  <button onClick={(e) => { e.preventDefault(); toggleFavorite(product._id); }} className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition">
                    <span className={`text-lg transition ${isFav ? "scale-125" : "scale-100"}`}>{isFav ? "❤️" : "🤍"}</span>
                  </button>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                       <h3 className="text-lg font-bold text-gray-900 mb-1 truncate" title={product.title}>{product.title}</h3>
                       <p className="text-sm text-gray-500 line-clamp-2 h-10">{product.desc}</p>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4 relative">
                      <span className="text-xl font-extrabold text-gray-900 mb-1">£{product.price}</span>
                      
                      {!cartItem ? (
                        <button onClick={() => addToCart(product, 1)} className="bg-white border border-pink-600 text-pink-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-pink-600 hover:text-white transition-colors active:scale-95 shadow-sm">Sepete Ekle</button>
                      ) : (
                        <div className="flex items-center bg-white/90 border border-pink-200 rounded-full overflow-hidden shadow-sm h-9 absolute right-0 bottom-0 animate-fade-in">
                           <button onClick={() => handleDecrease(product, cartItem.quantity)} className="w-8 h-full flex items-center justify-center text-pink-600 hover:bg-pink-50 font-bold border-r border-pink-100">-</button>
                           <input type="number" value={cartItem.quantity} onChange={(e) => handleInputChange(e, product)} className="w-10 h-full text-center font-bold text-pink-700 bg-transparent outline-none text-sm" />
                           <button onClick={() => increaseQuantity(product._id, product.title, product.stock)} className="w-8 h-full flex items-center justify-center text-pink-600 hover:bg-pink-50 font-bold border-l border-pink-100">+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODERN ONAY MODALI (ESKİSİ SİLİNDİ, YENİSİ EKLENDİ) --- */}
      {itemToDelete && (
        <ConfirmModal 
          title={`"${itemToDelete.title}" Çıkar?`} 
          message={`"${itemToDelete.title}" sepetten silinecek.`}
          isDanger={true}
          onConfirm={confirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}

    </div>
  );
};

export default HomePage;