import { useState, useEffect } from "react";
import { userRequest } from "../../requestMethods";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import AdminPanelHeader from "./adminComponents/AdminPanelHeader";
import { FiEdit, FiTrash2, FiCamera, FiRefreshCw, FiSearch, FiPlus, FiX } from "react-icons/fi";


const CATEGORIES = ["All", "Birthday", "Anniversary", "Indoor Flowers", "Edible Gifts", "Designer Flowers", "Roses", "Orchids"];

const AdminProducts = () => {
  const { notify } = useCart();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Filtreleme ve Modal State'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  
  const initialForm = { title: "", price: "", desc: "", img: "", stock: 10, isActive: true, category: "Doğum Günü" };
  const [formData, setFormData] = useState(initialForm);

  // Veri Çekme
  const fetchProducts = async () => {
    try {
      // Vendor ve isBlocked bilgisini çekiyoruz (Admin Products)
      const res = await userRequest.get("/products"); 
      setProducts(res.data);
    } catch (err) { console.log(err); }
  };
  useEffect(() => { fetchProducts(); }, []);

  // --- TOGGLE FONKSİYONU ---
  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.isActive; // Mevcut durumun tersi
      
      // Backend'e gönder
      await userRequest.put(`/products/${product._id}`, { 
        isActive: newStatus 
      });

      notify(`Product ${newStatus ? 'Active' : 'Inactive'}`, "success");
      
      // Listeyi anında güncelle (Sayfa yenilemeden görmek için)
      setProducts(prev => prev.map(p => 
        p._id === product._id ? { ...p, isActive: newStatus } : p
      ));

    } catch (err) {
      notify("Status could not be changed!", "error");
    }
  };

  // --- FIX 2: GÜNCEL FORM DEĞİŞİMİ (CHECKBOX DAHİL) ---
  const handleChange = (e) => { 
    const { name, type, checked, value } = e.target;
    // Checkbox'lar için 'checked' (boolean), diğerleri için 'value' (string) alıyoruz
    const finalValue = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: finalValue }); 
  };
  
  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); const data = new FormData(); data.append("file", file);
    try { const res = await userRequest.post("/upload", data); setFormData((prev) => ({ ...prev, img: res.data })); notify("Image uploaded!", "success"); } 
    catch { notify("Error", "error"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return notify("Missing information", "warning");
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const payload = { ...formData, vendor: user._id }; 

      if (editMode) await userRequest.put(`/products/${editMode}`, payload);
      else await userRequest.post("/products", payload);
      
      notify("Operation Successful!", "success"); 
      setFormData(initialForm); setShowForm(false); setEditMode(null); fetchProducts();
    } catch { notify("Error", "error"); }
  };

  const handleEditClick = (p) => { 
    // isActive değeri direkt product objesinden alınır, bu da formdaki checkbox'ı doğru bağlar
    setFormData({ ...p, category: p.category || "Birthday" }); 
    setEditMode(p._id); setShowForm(true); window.scrollTo(0,0); 
  };

  const handleDeleteRequest = (id) => {
    setConfirmData({
      isOpen: true, title: "Delete Product?", message: "This action cannot be undone.", isDanger: true,
      action: async () => { try { await userRequest.delete(`/products/${id}`); notify("Deleted", "success"); fetchProducts(); } catch { notify("Error", "error"); } setConfirmData(null); }
    });
  };

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(term);
    const vendorMatch = p.vendor?.username?.toLowerCase().includes(term) || false;
    return (titleMatch || vendorMatch);
  });

  return (
    <div className="space-y-6 pt-2 max-w-7xl mx-auto animate-fade-in">
      {/* Üst Bar */}
      <AdminPanelHeader title="Ürünler" count={products.length}>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search Product or Vendor..." 
            className="px-4 py-2 border rounded-lg w-full md:w-64 outline-none focus:border-pink-500" 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button 
            onClick={() => { setShowForm(!showForm); setEditMode(null); setFormData(initialForm); }} 
            className={`px-4 py-2 rounded-lg font-bold text-white flex items-center gap-1 transition ${showForm ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"}`}
          >
            {showForm ? <><FiX /> Close</> : <><FiPlus /> Add</>}
          </button>
        </div>
      </AdminPanelHeader>
      

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6 animate-fade-in-down">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">{editMode ? "Düzenle" : "Yeni Ekle"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-2 gap-6">
            <div><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Name</label><input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" /></div>
            <div className="flex gap-2">
                <div className="flex-1"><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Price</label><input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                <div className="flex-1"><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Stock</label><input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded" /></div>
            </div>
            <div><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded bg-white">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Image</label><div className="flex gap-2 border p-2 rounded bg-gray-50"><label className="cursor-pointer flex items-center gap-2 bg-white border px-3 py-1 rounded text-xs font-bold text-gray-600 transition shadow-sm"><FiCamera /> {uploading?"...":"Select"}<input type="file" className="hidden" onChange={handleUpload} disabled={uploading}/></label><input name="img" value={formData.img} onChange={handleChange} className="flex-1 text-xs outline-none bg-transparent" placeholder="URL" /></div></div>
            <div className="md:col-span-2"><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Description</label><textarea name="desc" value={formData.desc} onChange={handleChange} className="w-full p-2 border rounded h-20" /></div>
            
            {/* CHECKBOX DÜZELTİLDİ: 'checked' property'si doğru bind edildi. */}
            <div className="md:col-span-2 flex items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="active" className="w-5 h-5 accent-pink-600 cursor-pointer" />
                <label htmlFor="active" className="cursor-pointer font-bold text-gray-700 text-sm select-none">Is this product active for sale?</label>
            </div>
            
            <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-bold md:col-span-2 hover:bg-blue-700 transition shadow-md">Save</button>
          </form>
        </div>
      )}

      {/* Ürün Listesi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const isVendorBlocked = product.vendor?.isBlocked;

          return (
            <div key={product._id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col group hover:shadow-md transition relative ${isVendorBlocked ? "border-4 border-red-500 bg-red-50" : "border-gray-200"}`}>
              
              {/* HIZLI DURUM DEĞİŞTİRME (TOGGLE) */}
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
                {isVendorBlocked ? (
                    <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold animate-pulse cursor-not-allowed">⛔ VENDOR BLOCKED</span>
                ) : (
                    <button 
                        onClick={() => handleToggleStatus(product)}
                        className={`text-[10px] px-3 py-1 rounded-full font-bold shadow-sm transition transform active:scale-95 ${product.isActive ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-500 text-white hover:bg-gray-600"}`}
                        title="Click to Change Status"
                    >
                        {product.isActive ? "🟢 Active" : "⚫ Hidden"}
                    </button>
                )}
                
                {product.stock <= 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold shadow">Sold Out</span>}
              </div>

              <div className="h-40 bg-gray-100 relative">
                <img src={product.img || "https://placehold.co/400"} className={`w-full h-full object-cover object-top transition duration-500 ${!product.isActive ? "grayscale" : "group-hover:scale-105"}`} />
                <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow">{product.category}</span>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">🏪 {product.vendor?.username || "Fesfu Flowers UK"}</div>
                <h4 className="font-bold text-gray-800 mb-1 truncate" title={product.title}>{product.title}</h4>
                <div className="flex justify-between items-center mb-3"><span className="text-lg font-bold text-pink-600">£{product.price}</span><span className="text-xs text-gray-500 font-mono">ID: {product._id.slice(-4)}</span></div>

                <div className="mt-auto pt-2 border-t border-gray-200 flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase">STOCK</span>
                  <QuickStockUpdate product={product} refresh={fetchProducts} />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleEditClick(product)} className="flex items-center justify-center gap-1 bg-blue-50 text-blue-600 text-xs py-2 rounded font-bold border border-blue-100 hover:bg-blue-100 transition"><FiEdit /> Edit</button>
                  <button onClick={() => handleDeleteRequest(product._id)} className="flex items-center justify-center gap-1 bg-red-50 text-red-600 text-xs py-2 rounded font-bold border border-red-100 hover:bg-red-100 transition"><FiTrash2 /> Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

// YARDIMCI BİLEŞEN: HIZLI STOK GÜNCELLEME
const QuickStockUpdate = ({ product, refresh }) => {
  const [stock, setStock] = useState(product.stock);
  const [loading, setLoading] = useState(false);
  const { notify } = useCart();
  const handleUpdate = async () => {
    if (Number(stock) === product.stock) return;
    setLoading(true);
    try { await userRequest.put(`/products/${product._id}`, { ...product, stock: Number(stock) }); notify("Stok güncellendi", "success"); refresh(); } 
    catch { notify("Hata", "error"); } finally { setLoading(false); }
  };
  return (
    <div className="flex items-center gap-1">
      <input type="number" value={stock} onChange={e=>setStock(e.target.value)} className="w-12 p-1 border rounded text-center text-xs font-bold outline-none focus:border-pink-500 bg-gray-50" />
      <button onClick={handleUpdate} disabled={loading || Number(stock)===product.stock} className={`text-xs px-2 py-1 rounded font-bold transition ${Number(stock)!==product.stock ? "bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer" : "bg-gray-100 text-gray-300 cursor-default"}`}>{loading?<FiRefreshCw className="animate-spin" />:"✓"}</button>
    </div>
  );
};

export default AdminProducts;