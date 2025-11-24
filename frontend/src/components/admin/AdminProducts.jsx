import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";

const CATEGORIES = ["Tümü", "Doğum Günü", "Yıldönümü", "İç Mekan", "Yenilebilir Çiçek", "Tasarım Çiçek"];

const AdminProducts = () => {
  const { notify } = useCart();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Hem ürün hem satıcı arar
  const [editMode, setEditMode] = useState(null);
  const [uploading, setUploading] = useState(false);

  const initialForm = { title: "", price: "", desc: "", img: "", stock: 10, isActive: true, category: "Doğum Günü" };
  const [formData, setFormData] = useState(initialForm);

  const fetchProducts = async () => {
    try {
      // Backend'de ürünleri çekerken satıcı bilgisini de (populate) getiriyoruz
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) { console.log(err); }
  };
  useEffect(() => { fetchProducts(); }, []);

  // --- YENİ: FİLTRELEME (Ürün Adı VEYA Satıcı Adı) ---
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(term);
    // p.vendor bir obje ise (populate edildiyse) username'e bak, yoksa direkt ID'ye bak
    const vendorMatch = p.vendor?.username?.toLowerCase().includes(term) || false;
    return titleMatch || vendorMatch;
  });

  // ... (Handle Functions: Upload, Submit, Edit, Delete - Eskisiyle Aynı) ...
  const handleChange = (e) => { const value = e.target.type === "checkbox" ? e.target.checked : e.target.value; setFormData({ ...formData, [e.target.name]: value }); };
  
  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); const data = new FormData(); data.append("file", file);
    try { const res = await axios.post("http://localhost:5000/api/upload", data); setFormData((prev) => ({ ...prev, img: res.data })); notify("Resim yüklendi!", "success"); } 
    catch { notify("Yüklenemedi", "error"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) await axios.put(`http://localhost:5000/api/products/${editMode}`, formData);
      else await axios.post("http://localhost:5000/api/products", formData);
      notify("Başarılı!", "success"); setFormData(initialForm); setShowForm(false); setEditMode(null); fetchProducts();
    } catch { notify("Hata", "error"); }
  };
  
  const handleEditClick = (p) => { setFormData({ ...p, category: p.category || "Doğum Günü" }); setEditMode(p._id); setShowForm(true); window.scrollTo(0,0); };
  const handleDelete = async (id) => { if(confirm("Silinsin mi?")) { await axios.delete(`http://localhost:5000/api/products/${id}`); fetchProducts(); } };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Üst Bar & Arama */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-20 z-20">
        <h2 className="text-2xl font-bold text-gray-800">Ürünler ({products.length})</h2>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Ürün veya Satıcı Ara..." 
            className="px-4 py-2 border rounded-lg w-64 outline-none focus:border-pink-500" 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button onClick={() => { setShowForm(!showForm); setEditMode(null); setFormData(initialForm); }} className={`px-4 py-2 rounded-lg font-bold text-white ${showForm ? "bg-gray-500" : "bg-green-600"}`}>{showForm ? "Kapat" : "+ Ekle"}</button>
        </div>
      </div>

      {/* Form (Kısaltıldı - Mantık aynı) */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
             <input name="title" value={formData.title} onChange={handleChange} placeholder="Ürün Adı" className="p-2 border rounded" />
             <div className="flex gap-2"><input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Fiyat" className="p-2 border rounded w-full" /><input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Stok" className="p-2 border rounded w-full" /></div>
             <select name="category" value={formData.category} onChange={handleChange} className="p-2 border rounded bg-white">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
             <div className="flex gap-2 border p-2 rounded"><label className="cursor-pointer font-bold text-gray-600">{uploading?"...":"📷"}<input type="file" className="hidden" onChange={handleUpload}/></label><input name="img" value={formData.img} onChange={handleChange} placeholder="URL" className="flex-1 text-xs outline-none" /></div>
             <textarea name="desc" value={formData.desc} onChange={handleChange} placeholder="Açıklama" className="p-2 border rounded col-span-2 h-20" />
             <div className="col-span-2 flex gap-2"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} /><label>Satışta mı?</label></div>
             <button className="bg-blue-600 text-white py-2 rounded font-bold col-span-2">Kaydet</button>
          </form>
        </div>
      )}

      {/* Liste */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col group hover:shadow-md transition relative ${product.stock <= 0 ? "border-red-300 opacity-80" : "border-gray-200"}`}>
            
            {/* Satıcı Rozeti (YENİ) */}
            <div className="absolute top-2 left-2 z-10">
               <span className="bg-black/70 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-bold shadow">
                 🏪 {product.vendor?.username || "ÇiçekSepeti"}
               </span>
            </div>

            {/* Durum Rozetleri */}
            <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
               {!product.isActive && <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded">Pasif</span>}
               {product.stock <= 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded">Tükendi</span>}
            </div>

            <div className="h-40 bg-gray-100 relative"><img src={product.img} className="w-full h-full object-cover" /></div>
            
            <div className="p-3 flex-1 flex flex-col">
              <h4 className="font-bold text-gray-800 mb-1 truncate" title={product.title}>{product.title}</h4>
              <div className="flex justify-between items-center mb-2"><span className="text-lg font-bold text-pink-600">£{product.price}</span><span className="text-xs text-gray-500">Stok: {product.stock}</span></div>
              
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <button onClick={() => handleEditClick(product)} className="bg-blue-50 text-blue-600 text-xs py-1.5 rounded font-bold">Düzenle</button>
                <button onClick={() => handleDelete(product._id)} className="bg-red-50 text-red-500 text-xs py-1.5 rounded font-bold">Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;