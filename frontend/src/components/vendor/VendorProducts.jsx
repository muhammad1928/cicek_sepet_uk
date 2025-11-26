import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";

const CATEGORIES = ["Doğum Günü", "Yıldönümü", "İç Mekan", "Yenilebilir Çiçek", "Tasarım Çiçek"];

const VendorProducts = ({ user }) => {
  const { notify } = useCart();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  
  const initialForm = { title: "", price: "", desc: "", img: "", stock: 10, category: "Doğum Günü" };
  const [formData, setFormData] = useState(initialForm);

  const fetchProducts = async () => {
    try { const res = await axios.get(`http://localhost:5000/api/products/vendor/${user._id}`); setProducts(res.data); } 
    catch (err) { console.log(err); }
  };
  useEffect(() => { fetchProducts(); }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); const data = new FormData(); data.append("file", file);
    try { const res = await axios.post("http://localhost:5000/api/upload", data); setFormData((prev) => ({ ...prev, img: res.data })); notify("Resim yüklendi! 🖼️", "success"); } 
    catch (err) { notify("Yüklenemedi", "error"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/products", { ...formData, vendor: user._id, isActive: true });
      notify("Ürün eklendi! 🌸", "success"); setShowForm(false); fetchProducts();
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  const handleDeleteRequest = (id) => {
    setConfirmData({
      isOpen: true, title: "Ürünü Sil?", message: "Bu ürün mağazanızdan silinecek.", isDanger: true,
      action: async () => {
        try { await axios.delete(`http://localhost:5000/api/products/${id}`); notify("Silindi", "success"); fetchProducts(); }
        catch { notify("Hata", "error"); }
        setConfirmData(null);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Ürünlerim ({products.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className={`px-4 py-2 rounded-lg font-bold text-white transition ${showForm ? 'bg-gray-500' : 'bg-pink-600 hover:bg-pink-700'}`}>{showForm ? "Kapat" : "+ Yeni Ürün Ekle"}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-pink-100 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 animate-fade-in-down">
           <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ürün Adı</label><input name="title" onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-pink-500" required /></div>
           <div className="flex gap-2">
             <div className="flex-1"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fiyat</label><input name="price" type="number" onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-pink-500" required /></div>
             <div className="flex-1"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stok</label><input name="stock" type="number" onChange={handleChange} placeholder="10" className="w-full p-2 border rounded outline-none focus:border-pink-500" /></div>
           </div>
           <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori</label><select name="category" onChange={handleChange} className="w-full p-2 border rounded bg-white outline-none focus:border-pink-500">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Görsel</label>
             <div className="flex items-center gap-2 border p-2 rounded bg-gray-50">
                <label className="cursor-pointer bg-white border hover:bg-gray-100 px-3 py-1 rounded text-xs font-bold text-gray-600 shadow-sm">{uploading?"...":"📷 Seç"}<input type="file" className="hidden" onChange={handleUpload} /></label>
                <input name="img" value={formData.img} onChange={handleChange} placeholder="URL" className="flex-1 bg-transparent outline-none text-xs" />
             </div>
           </div>
           <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</label><textarea name="desc" onChange={handleChange} className="w-full p-2 border rounded h-20 outline-none focus:border-pink-500" /></div>
           <button type="submit" disabled={uploading} className="bg-green-600 text-white py-2 rounded font-bold md:col-span-2 hover:bg-green-700 shadow-lg disabled:opacity-50">Kaydet ve Yayınla</button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => (
          <div key={p._id} className="bg-white border rounded-xl overflow-hidden group hover:shadow-md transition flex flex-col relative">
            {p.stock<=0 && <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow z-10">TÜKENDİ</div>}
            <div className="h-40 relative bg-gray-100"><img src={p.img} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
            <div className="p-3 flex-1 flex flex-col">
              <div className="font-bold truncate text-gray-800 mb-1">{p.title}</div>
              <div className="font-bold text-pink-600 text-sm">£{p.price}</div>
              <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center mb-2"><span className="text-[10px] font-bold text-gray-400 uppercase">Hızlı Stok</span><QuickStockUpdate product={p} refresh={fetchProducts} /></div>
              <button onClick={() => handleDeleteRequest(p._id)} className="w-full bg-red-50 text-red-600 text-xs py-1.5 rounded font-bold hover:bg-red-100 border border-red-100">Sil</button>
            </div>
          </div>
        ))}
      </div>
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

const QuickStockUpdate = ({ product, refresh }) => {
  const [stock, setStock] = useState(product.stock);
  const [loading, setLoading] = useState(false);
  const { notify } = useCart();
  const handleUpdate = async () => { if (Number(stock) === product.stock) return; setLoading(true); try { await axios.put(`http://localhost:5000/api/products/${product._id}`, { ...product, stock: Number(stock) }); notify("Stok güncellendi", "success"); refresh(); } catch(e){ notify("Hata", "error"); } finally { setLoading(false); } };
  return (<div className="flex items-center gap-1"><input type="number" value={stock} onChange={e=>setStock(e.target.value)} className="w-10 p-1 border rounded text-center text-xs font-bold outline-none focus:border-pink-500" /><button onClick={handleUpdate} disabled={loading || Number(stock)===product.stock} className={`text-xs px-2 py-1 rounded font-bold transition ${Number(stock)!==product.stock?"bg-green-100 text-green-600":"bg-gray-100 text-gray-300"}`}>{loading?"..":"✓"}</button></div>);
};

export default VendorProducts;