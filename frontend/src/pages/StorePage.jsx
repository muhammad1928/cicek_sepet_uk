import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";

const StorePage = () => {
  const { id } = useParams(); // Satıcı ID'si
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Satıcı Bilgilerini Çek
        const vendorRes = await axios.get(`http://localhost:5000/api/users/vendor-profile/${id}`);
        setVendor(vendorRes.data);

        // 2. Satıcının Ürünlerini Çek
        const productsRes = await axios.get(`http://localhost:5000/api/products/vendor/${id}`);
        // Sadece aktif ürünleri göster
        setProducts(productsRes.data.filter(p => p.isActive && p.stock > 0));
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  if (!vendor) return <div className="min-h-screen flex items-center justify-center">Mağaza bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-10 px-4">
      <Seo 
        title={`${vendor.username} - ÇiçekSepeti UK`} 
        description={`${vendor.username} mağazasının en özel çiçekleri ve hediyelik ürünleri.`} 
      />

      <div className="max-w-7xl mx-auto">
        
        {/* --- MAĞAZA BAŞLIĞI (HEADER) --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8 mb-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-24 h-24 bg-pink-600 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg">
            {vendor.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">{vendor.username}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Onaylı Satıcı ✅</span>
              <span>📅 Üyelik: {new Date(vendor.createdAt).getFullYear()}</span>
              <span>📦 {products.length} Ürün</span>
            </div>
          </div>
        </div>

        {/* --- ÜRÜN LİSTESİ --- */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mağaza Ürünleri</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Bu mağazada henüz ürün yok.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 overflow-hidden group">
                <Link to={`/product/${product._id}`}>
                  <div className="h-56 bg-gray-100 relative overflow-hidden">
                    <img src={product.img} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 truncate">{product.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-extrabold text-pink-600">£{product.price}</span>
                    <button onClick={() => addToCart(product)} className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition">Sepete Ekle</button>
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

export default StorePage;