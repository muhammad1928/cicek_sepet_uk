import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";
import { ProductSkeleton } from "../components/Loading";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaStar } from "react-icons/fa";

const StorePage = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products"); // 'products' veya 'about'
  
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

  if (loading) return <div className="pt-32 text-center"><ProductSkeleton /></div>;
  if (!vendor) return <div className="pt-32 text-center text-gray-500">Mağaza bulunamadı.</div>;

  const settings = vendor.storeSettings || {};
  const bannerUrl = settings.banner || "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80";
  const logoUrl = settings.logo;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Seo 
        title={`${vendor.username} - ÇiçekSepeti UK`} 
        description={settings.description || `${vendor.username} mağazasının ürünleri.`} 
      />

      {/* --- BANNER --- */}
      <div className="h-64 md:h-80 w-full bg-cover bg-center relative" style={{ backgroundImage: `url('${bannerUrl}')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative -mt-24 pb-20">
        
        {/* --- MAĞAZA BAŞLIK KARTI --- */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 text-center md:text-left relative z-10">
          
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white flex items-center justify-center shrink-0">
            {logoUrl ? (
              <img src={logoUrl} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <span className="text-5xl font-bold text-pink-600">{vendor.username[0].toUpperCase()}</span>
            )}
          </div>

          <div className="flex-1 pb-2">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{vendor.username}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm font-bold text-gray-600">
              <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full"><FaStar /> Onaylı Satıcı</span>
              <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"><FaCalendarAlt /> Üyelik: {new Date(vendor.createdAt).getFullYear()}</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">📦 {products.length} Ürün</span>
            </div>
          </div>

        </div>

        {/* --- SEKME MENÜSÜ (TABS) --- */}
        <div className="flex gap-6 border-b border-gray-200 mb-8">
          <button 
            onClick={() => setActiveTab("products")}
            className={`pb-3 text-lg font-bold transition ${activeTab === "products" ? "text-pink-600 border-b-4 border-pink-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            Ürünler
          </button>
          <button 
            onClick={() => setActiveTab("about")}
            className={`pb-3 text-lg font-bold transition ${activeTab === "about" ? "text-pink-600 border-b-4 border-pink-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            Mağaza Hakkında
          </button>
        </div>

        {/* --- İÇERİK ALANI --- */}
        
        {/* 1. ÜRÜNLER SEKMESİ */}
        {activeTab === "products" && (
          <div className="animate-fade-in">
            {products.length === 0 ? (
              <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">Henüz ürün eklenmemiş.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                    <Link to={`/product/${product._id}`}>
                      <div className="h-56 relative bg-gray-100 overflow-hidden">
                        <img src={product.img} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
                      </div>
                    </Link>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 truncate mb-1">{product.title}</h3>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xl font-extrabold text-pink-600">£{product.price}</span>
                        <button onClick={() => addToCart(product)} className="bg-pink-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-pink-700 transition">Sepete Ekle</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. HAKKINDA SEKMESİ (YENİ) */}
        {activeTab === "about" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 animate-fade-in">
            
            <div className="grid md:grid-cols-3 gap-12">
              
              {/* Sol: Hikaye */}
              <div className="md:col-span-2 space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-pink-500 pl-3">Biz Kimiz?</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                  {settings.description || "Bu mağaza henüz kendisi hakkında bir açıklama eklememiş."}
                </p>
              </div>

              {/* Sağ: İletişim Kartı */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-fit">
                <h3 className="text-lg font-bold text-gray-800 mb-4">İletişim Bilgileri</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-pink-500 shadow-sm"><FaEnvelope /></div>
                    <span className="text-sm font-medium">{vendor.email}</span>
                  </div>
                  {settings.phone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm"><FaPhone /></div>
                      <span className="text-sm font-medium">{settings.phone}</span>
                    </div>
                  )}
                   <div className="flex items-start gap-3 text-gray-600">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm mt-1"><FaMapMarkerAlt /></div>
                      <span className="text-sm font-medium">Londra, UK<br/><span className="text-xs text-gray-400">(Konum bilgisi satıcı tarafından gizlenmiş olabilir)</span></span>
                    </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StorePage;