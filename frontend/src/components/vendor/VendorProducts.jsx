import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import { FiEdit, FiTrash2, FiCamera, FiRefreshCw, FiSearch, FiPlus, FiX } from "react-icons/fi";

const CATEGORIES = ["Doğum Günü", "Yıldönümü", "İç Mekan", "Yenilebilir Çiçek", "Tasarım Çiçek"];

const VendorProducts = ({ user }) => {
  const { notify } = useCart();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Filtreleme ve Modal State'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  
  const initialForm = { title: "", price: "", desc: "", img: "", stock: 10, category: "Doğum Günü", isActive: true };
  const [formData, setFormData] = useState(initialForm);

  // RENK KONTROLÜ (STOK)
  const getCardStyle = (stock, isActive) => {
    if (!isActive) return "border-gray-200 opacity-60 grayscale"; // Pasif
    if (stock <= 0) return "border-red-500 bg-red-50"; // Tükenmiş
    if (stock < 5) return "border-yellow-400 bg-yellow-50"; // Kritik
    return "border-gray-200 hover:border-pink-300"; // Normal
  };

  // Ürünleri Çek
  const fetchProducts = async () => {
    try { 
      const res = await axios.get(`http://localhost:5000/api/products/vendor/${user._id}`); 
      setProducts(res.data); 
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchProducts(); }, [user]);

  // --- TOGGLE FONKSİYONU ---
  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.isActive; // Mevcut durumun tersi
      
      // Backend'e gönder
      await axios.put(`http://localhost:5000/api/products/${product._id}`, { 
        isActive: newStatus 
      });

      notify(`Ürün ${newStatus ? 'Aktif' : 'Pasif'} yapıldı`, "success");
      
      // Listeyi anında güncelle (Sayfa yenilemeden görmek için)
      setProducts(prev => prev.map(p => 
        p._id === product._id ? { ...p, isActive: newStatus } : p
      ));

    } catch (err) {
      notify("Durum değiştirilemedi!", "error");
    }
  };

  // Form İşlemleri
  const handleChange = (e) => { 
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value; 
    setFormData({ ...formData, [e.target.name]: value }); 
  };
  
  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); const data = new FormData(); data.append("file", file);
    try { const res = await axios.post("http://localhost:5000/api/upload", data); setFormData((prev) => ({ ...prev, img: res.data })); notify("Resim yüklendi! 🖼️", "success"); } 
    catch { notify("Yüklenemedi", "error"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return notify("Eksik bilgi", "warning");
    try {
      // Vendor ID'sini ekle
      const payload = { ...formData, vendor: user._id, isActive: true};
      
      if(editMode) await axios.put(`http://localhost:5000/api/products/${editMode}`, payload);
      else await axios.post("http://localhost:5000/api/products", payload);

      notify("İşlem Başarılı! 🌸", "success"); 
      setShowForm(false); setEditMode(null); setFormData(initialForm); fetchProducts();
      setFormData(initialForm);
    } catch (err) {
      // Hata detayını göster
      const msg = err.response?.data?.message || "Ürün eklenirken hata oluştu.";
      notify(msg, "error");
     }
  };

  const handleEditClick = (p) => { 
    setFormData({ ...p, category: p.category || "Doğum Günü" }); 
    setEditMode(p._id); setShowForm(true); window.scrollTo(0,0); 
  };

  // Yeni Ekle / İptal Butonu
  const handleAddNewClick = () => {
    if (showForm) {
      // Formu kapatıyorsa temizle
      setShowForm(false);
      setEditMode(null);
      setFormData(initialForm);
    } else {
      // Formu açıyorsa temizle (Garanti olsun)
      setFormData(initialForm); 
      setEditMode(null);
      setShowForm(true);
    }
  };

  // SİLME (MODAL İLE)
  const handleDeleteRequest = (id) => {
    setConfirmData({
      isOpen: true, title: "Ürünü Sil?", message: "Bu işlem geri alınamaz. Emin misiniz?", isDanger: true,
      action: async () => {
        try { await axios.delete(`http://localhost:5000/api/products/${id}`); notify("Silindi", "success"); fetchProducts(); }
        catch { notify("Hata", "error"); }
        setConfirmData(null);
      }
    });
  };

  // Arama Filtresi
  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* --- ÜST BAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-20 z-20 gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          Ürünlerim <span className="text-sm bg-pink-100 text-pink-600 px-2 py-1 rounded-full">{filteredProducts.length}</span>
        </h2>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input 
              type="text" 
              placeholder="Ürün Ara..." 
              className="pl-9 pr-4 py-2 border rounded-lg w-full outline-none focus:border-pink-500 transition"
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* DÜZELTİLEN BUTON FONKSİYONU */}
          <button 
            onClick={handleAddNewClick} 
            className={`px-4 py-2 rounded-lg font-bold text-white flex items-center gap-2 transition ${showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-pink-600 hover:bg-pink-700'}`}
          >
            {showForm ? <><FiX /> İptal</> : <><FiPlus /> Yeni Ekle</>}
          </button>
        </div>
      </div>

      {/* --- FORM ALANI --- */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-100 animate-fade-in-down mb-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
             <h3 className="font-bold text-lg text-gray-700">{editMode ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Ürün Adı</label><input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-pink-500" required /></div>
             <div className="flex gap-2">
               <div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase mb-1">Fiyat (£)</label><input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-pink-500" required /></div>
               <div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase mb-1">Stok</label><input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-pink-500" /></div>
             </div>
             <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Kategori</label><select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded bg-white outline-none focus:border-pink-500">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase mb-1">Görsel</label>
               <div className="flex items-center gap-2 border p-2 rounded bg-gray-50 border-dashed border-gray-300 hover:border-pink-400 transition">
                  <label className="cursor-pointer flex items-center gap-2 bg-white border px-3 py-1 rounded text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-100">
                    <FiCamera /> {uploading?"...":"Yükle"}
                    <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
                  </label>
                  <input name="img" value={formData.img} onChange={handleChange} placeholder="veya URL yapıştır" className="flex-1 bg-transparent outline-none text-xs" />
                  {formData.img && <img src={formData.img} className="w-8 h-8 rounded object-cover border" alt="önizleme" />}
               </div>
             </div>
             <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</label><textarea name="desc" value={formData.desc} onChange={handleChange} className="w-full p-2 border rounded h-24 outline-none focus:border-pink-500" /></div>
             
             {/* Durum Checkbox */}
             <div className="md:col-span-2 flex items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                 <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="active" className="w-5 h-5 accent-pink-600 cursor-pointer" />
                 <label htmlFor="active" className="cursor-pointer font-bold text-gray-700 text-sm select-none">Bu ürün satışa açık olsun</label>
             </div>

             <button type="submit" disabled={uploading} className="bg-green-600 text-white py-3 rounded-lg font-bold md:col-span-2 hover:bg-green-700 shadow-lg transition disabled:opacity-50">
               {editMode ? "Değişiklikleri Kaydet" : "Ürünü Yayınla"}
             </button>
          </form>
        </div>
      )}

      {/* --- ÜRÜN LİSTESİ --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(p => {
          // Kart Rengi Mantığı (Stok Durumuna Göre)
          let cardBorderClass = "border-gray-200 hover:border-pink-300"; // Varsayılan
          if (!p.isActive) cardBorderClass = "border-gray-200 opacity-75 grayscale bg-gray-50"; // Pasif
          else if (p.stock <= 0) cardBorderClass = "border-red-500 bg-red-50 ring-2 ring-red-100"; // Tükenmiş (Kırmızı)
          else if (p.stock < 5) cardBorderClass = "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-100"; // Kritik (Sarı)

          return (
            <div key={p._id} className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 group relative flex flex-col ${cardBorderClass}`}>
              
              {/* --- DURUM ROZETLERİ (SAĞ ÜST) --- */}
              <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
                {/* Yayında / Gizli Butonu */}
                <button 
                  onClick={() => handleToggleStatus(p)} 
                  className={`text-[10px] px-3 py-1 rounded-full font-bold shadow-md transition transform active:scale-95 flex items-center gap-1 ${p.isActive ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-800 text-white hover:bg-black"}`}
                >
                   {p.isActive ? "🟢 Yayında" : "⚫ Gizli"}
                </button>
                
                {/* Stok Uyarıları */}
                {p.stock <= 0 && (
                  <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md animate-pulse">
                    ⛔ TÜKENDİ
                  </span>
                )}
                {p.stock > 0 && p.stock < 5 && (
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                    ⚠️ SON {p.stock}
                  </span>
                )}
              </div>

              {/* --- RESİM ALANI --- */}
              <div className="h-48 relative bg-gray-200 overflow-hidden">
                <img 
                  src={p.img || "https://placehold.co/400"} 
                  className={`w-full h-full object-cover transition duration-700 ${!p.isActive ? "grayscale" : "group-hover:scale-110"}`} 
                  alt={p.title}
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                   <span className="text-white text-[10px] font-bold bg-black/30 backdrop-blur-md px-2 py-1 rounded border border-white/20">
                     {p.category}
                   </span>
                </div>
              </div>

              {/* --- İÇERİK ALANI --- */}
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-bold text-gray-800 mb-1 truncate text-lg" title={p.title}>
                  {p.title}
                </h4>
                
                <div className="flex justify-between items-end mb-4">
                   <span className="text-xl font-extrabold text-pink-600">£{p.price}</span>
                   <span className="text-xs text-gray-400 font-mono">ID: {p._id.slice(-4)}</span>
                </div>

                {/* Hızlı Stok Güncelleme */}
                <div className="mt-auto pt-3 border-t border-gray-200/60 flex justify-between items-center mb-4">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hızlı Stok</span>
                   <QuickStockUpdate product={p} refresh={fetchProducts} />
                </div>

                {/* Aksiyon Butonları */}
                <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => handleEditClick(p)} 
                     className="flex items-center justify-center gap-1 bg-blue-50 text-blue-600 text-xs py-2.5 rounded-xl font-bold hover:bg-blue-100 transition border border-blue-100"
                   >
                     <FiEdit /> Düzenle
                   </button>
                   <button 
                     onClick={() => handleDeleteRequest(p._id)} 
                     className="flex items-center justify-center gap-1 bg-red-50 text-red-600 text-xs py-2.5 rounded-xl font-bold hover:bg-red-100 transition border border-red-100"
                   >
                     <FiTrash2 /> Sil
                   </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ONAY MODALI */}
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

// Hızlı Stok Bileşeni
const QuickStockUpdate = ({ product, refresh }) => {
  const [stock, setStock] = useState(product.stock);
  const [loading, setLoading] = useState(false);
  const { notify } = useCart();

  const handleUpdate = async () => {
    if (Number(stock) === product.stock) return;
    setLoading(true);
    try { await axios.put(`http://localhost:5000/api/products/${product._id}`, { ...product, stock: Number(stock) }); notify("Stok güncellendi", "success"); refresh(); } 
    catch (err) { notify("Hata", "error"); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-1">
      <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-12 p-1 border rounded text-center text-sm font-bold outline-none focus:border-pink-500 bg-gray-50" />
      <button onClick={handleUpdate} disabled={loading || Number(stock)===product.stock} className={`text-xs px-2 py-1 rounded font-bold transition ${Number(stock)!==product.stock ? "bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer" : "bg-gray-100 text-gray-300 cursor-default"}`}>
        {loading ? <FiRefreshCw className="animate-spin" /> : "✓"}
      </button>
    </div>
  );
};

export default VendorProducts;