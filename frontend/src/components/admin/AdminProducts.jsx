import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";

// Kategoriler
const CATEGORIES = ["Tümü", "Doğum Günü", "Yıldönümü", "İç Mekan", "Yenilebilir Çiçek", "Tasarım Çiçek"];

const AdminProducts = () => {
  const { notify } = useCart();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // FİLTRE STATE'LERİ
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tümü");
  
  const [editMode, setEditMode] = useState(null);
  const [uploading, setUploading] = useState(false);

  const initialForm = { title: "", price: "", desc: "", img: "", stock: 10, isActive: true, category: "Doğum Günü" };
  const [formData, setFormData] = useState(initialForm);

  // Veri Çekme
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) { console.log(err); }
  };
  useEffect(() => { fetchProducts(); }, []);

  // --- GELİŞMİŞ FİLTRELEME MANTIĞI ---
  const filteredProducts = products.filter(p => {
    // 1. Arama (Ürün Adı VEYA Satıcı Adı)
    const term = searchTerm.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(term);
    const vendorMatch = p.vendor?.username?.toLowerCase().includes(term) || false; // Satıcı adı araması
    
    // 2. Kategori Filtresi
    const categoryMatch = filterCategory === "Tümü" || p.category === filterCategory;

    return (titleMatch || vendorMatch) && categoryMatch;
  });

  // Form İşlemleri
  const handleChange = (e) => { 
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value; 
    setFormData({ ...formData, [e.target.name]: value }); 
  };
  
  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); const data = new FormData(); data.append("file", file);
    try { const res = await axios.post("http://localhost:5000/api/upload", data); setFormData((prev) => ({ ...prev, img: res.data })); notify("Resim yüklendi!", "success"); } 
    catch { notify("Hata", "error"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return notify("Eksik bilgi", "warning");
    try {
      // Admin olarak eklerken vendor null olabilir veya admin ID'si gidebilir
      // Şimdilik mevcut user ID'sini (Admin) vendor olarak atıyoruz
      const user = JSON.parse(localStorage.getItem("user"));
      const payload = { ...formData, vendor: user._id };

      if (editMode) await axios.put(`http://localhost:5000/api/products/${editMode}`, payload);
      else await axios.post("http://localhost:5000/api/products", payload);
      
      notify("İşlem Başarılı!", "success"); 
      setFormData(initialForm); setShowForm(false); setEditMode(null); fetchProducts();
    } catch { notify("Hata", "error"); }
  };

  const handleEditClick = (p) => { 
    setFormData({ ...p, category: p.category || "Doğum Günü" }); 
    setEditMode(p._id); setShowForm(true); window.scrollTo(0,0); 
  };
  
  const handleDelete = async (id) => { if(confirm("Silinsin mi?")) { try { await axios.delete(`http://localhost:5000/api/products/${id}`); fetchProducts(); } catch(e){} } };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Üst Bar & Filtreler */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-20 z-20 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 whitespace-nowrap">
          Ürünler <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full">{filteredProducts.length}</span>
        </h2>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          
          {/* Kategori Filtresi */}
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg outline-none focus:border-pink-500 bg-white cursor-pointer"
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          {/* Arama Kutusu */}
          <input 
            type="text" 
            placeholder="Ürün veya Satıcı Ara..." 
            className="px-4 py-2 border rounded-lg w-full md:w-64 outline-none focus:border-pink-500" 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />

          {/* Ekle Butonu */}
          <button 
            onClick={() => { setShowForm(!showForm); setEditMode(null); setFormData(initialForm); }} 
            className={`px-4 py-2 rounded-lg font-bold text-white whitespace-nowrap ${showForm ? "bg-gray-500" : "bg-green-600"}`}
          >
            {showForm ? "Kapat" : "+ Ekle"}
          </button>
        </div>
      </div>

      {/* Form (Gizli/Açık) */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">{editMode ? "Düzenle" : "Yeni Ekle"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-xs font-bold mb-1">Ad</label><input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" /></div>
            <div className="flex gap-2">
                <div><label className="block text-xs font-bold mb-1">Fiyat</label><input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                <div><label className="block text-xs font-bold mb-1">Stok</label><input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded" /></div>
            </div>
            <div><label className="block text-xs font-bold mb-1">Kategori</label><select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded bg-white">{CATEGORIES.filter(c=>c!=="Tümü").map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs font-bold mb-1">Görsel</label><div className="flex gap-2 border p-2 rounded"><label className="cursor-pointer font-bold text-gray-500 text-sm">{uploading?"...":"📷 Seç"}<input type="file" className="hidden" onChange={handleUpload}/></label><input name="img" value={formData.img} onChange={handleChange} className="flex-1 text-xs outline-none" /></div></div>
            <div className="md:col-span-2"><label className="block text-xs font-bold mb-1">Açıklama</label><textarea name="desc" value={formData.desc} onChange={handleChange} className="w-full p-2 border rounded h-20" /></div>
            <div className="md:col-span-2 flex items-center gap-2"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} /><label>Satışta mı?</label></div>
            <button type="submit" className="bg-blue-600 text-white py-2 rounded font-bold md:col-span-2">Kaydet</button>
          </form>
        </div>
      )}

      {/* Ürün Listesi (Kartlar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          // Satıcı Engelli mi?
          const isVendorBlocked = product.vendor?.isBlocked;

          return (
            <div 
              key={product._id} 
              className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col group hover:shadow-md transition relative 
                ${isVendorBlocked ? "border-4 border-red-500 bg-red-50" : product.stock <= 0 ? "border-gray-300 opacity-80" : "border-gray-200"}
              `}
            >
              
              {/* Kategori ve Durum Rozetleri */}
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
                {isVendorBlocked && <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold animate-pulse">⛔ SATICI ENGELLİ</span>}
                {!product.isActive && !isVendorBlocked && <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded font-bold">Pasif</span>}
                {product.stock <= 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold">Tükendi</span>}
              </div>

              {/* Resim */}
              <div className="h-40 bg-gray-100 relative">
                <img src={product.img || "https://placehold.co/400"} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                {/* Kategori Rozeti (Sol Alt) */}
                <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                  {product.category}
                </span>
              </div>

              {/* İçerik */}
              <div className="p-3 flex-1 flex flex-col">
                
                {/* Satıcı Bilgisi */}
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                  🏪 {product.vendor?.username || "ÇiçekSepeti"}
                </div>

                <h4 className="font-bold text-gray-800 mb-1 truncate" title={product.title}>{product.title}</h4>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-pink-600">£{product.price}</span>
                  <span className="text-xs text-gray-500 font-mono">ID: {product._id.slice(-4)}</span>
                </div>

                {/* Hızlı Stok (Hata vermemesi için import edildiğini varsayıyoruz veya basit text yapabiliriz) */}
                <div className="mt-auto pt-2 border-t border-gray-200 flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-500">STOK</span>
                  <QuickStockUpdate product={product} refresh={fetchProducts} />
                </div>
                
                {/* Butonlar */}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleEditClick(product)} className="bg-blue-50 text-blue-600 text-xs py-1.5 rounded font-bold border border-blue-100 hover:bg-blue-100">Düzenle</button>
                  <button onClick={() => handleDelete(product._id)} className="bg-red-50 text-red-500 text-xs py-1.5 rounded font-bold border border-red-100 hover:bg-red-100">Sil</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Yardımcı: Hızlı Stok
const QuickStockUpdate = ({ product, refresh }) => {
  const [stock, setStock] = useState(product.stock);
  const [loading, setLoading] = useState(false);
  const { notify } = useCart();
  const handleUpdate = async () => {
    if (Number(stock) === product.stock) return;
    setLoading(true);
    try { await axios.put(`http://localhost:5000/api/products/${product._id}`, { ...product, stock: Number(stock) }); notify("Güncellendi", "success"); refresh(); } 
    catch { notify("Hata", "error"); } finally { setLoading(false); }
  };
  return (
    <div className="flex items-center gap-1">
      <input type="number" value={stock} onChange={e=>setStock(e.target.value)} className="w-12 p-1 border rounded text-center text-xs" />
      <button onClick={handleUpdate} disabled={loading} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 border">{loading?"...":"✓"}</button>
    </div>
  );
};

export default AdminProducts;