import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  // includeDelivery: false varsayılan
  const [formData, setFormData] = useState({ code: "", discountRate: "", expiryDate: "", includeDelivery: false });
  const { notify } = useCart();

  const fetchCoupons = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/coupons");
      setCoupons(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountRate) return notify("Bilgileri doldurun", "warning");
    
    // --- YENİ: YÜZDE KONTROLÜ ---
    if (Number(formData.discountRate) > 100) return notify("İndirim oranı %100'den fazla olamaz!", "warning");
    if (Number(formData.discountRate) < 1) return notify("Geçersiz indirim oranı", "warning");
    // ----------------------------

    try {
      await axios.post("http://localhost:5000/api/coupons", {
        code: formData.code.toUpperCase(),
        discountRate: Number(formData.discountRate),
        expiryDate: formData.expiryDate,
        includeDelivery: formData.includeDelivery // Checkbox değeri
      });
      notify("Kupon oluşturuldu! 🎉", "success");
      setFormData({ code: "", discountRate: "", expiryDate: "", includeDelivery: false });
      fetchCoupons();
    } catch (err) { notify("Hata oluştu (Kod aynı olabilir)", "error"); }
  };

  const handleDelete = async (id) => {
    if (confirm("Kuponu silmek istiyor musunuz?")) {
      try {
        await axios.delete(`http://localhost:5000/api/coupons/${id}`);
        notify("Kupon silindi.", "success");
        fetchCoupons();
      } catch (err) { notify("Silinemedi", "error"); }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">İndirim Kuponları</h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-700 mb-4">Yeni Kupon Oluştur</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Kupon Kodu</label>
            <input 
              value={formData.code} 
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
              className="w-full p-3 border rounded outline-none focus:border-pink-500 font-mono uppercase" 
              placeholder="Örn: YAZ2024" 
            />
          </div>
          
          <div className="w-full md:w-24">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">İndirim %</label>
            <input 
              type="number" 
              max="100" // HTML tarafında da limit
              min="1"
              value={formData.discountRate} 
              onChange={(e) => setFormData({...formData, discountRate: e.target.value})} 
              className="w-full p-3 border rounded outline-none focus:border-pink-500" 
              placeholder="10" 
            />
          </div>
          
          <div className="w-full md:w-40">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Son Tarih</label>
            <input 
              type="date" 
              value={formData.expiryDate} 
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} 
              className="w-full p-3 border rounded outline-none focus:border-pink-500" 
            />
          </div>

          {/* --- YENİ: CHECKBOX --- */}
          <div className="flex items-center gap-2 h-12 pb-1">
             <input 
               type="checkbox" 
               id="delivery" 
               checked={formData.includeDelivery} 
               onChange={(e) => setFormData({...formData, includeDelivery: e.target.checked})}
               className="w-5 h-5 accent-pink-600 cursor-pointer"
             />
             <label htmlFor="delivery" className="text-xs font-bold text-gray-600 cursor-pointer select-none leading-tight w-20">
               Kargo Ücretini Kapsa
             </label>
          </div>
          {/* -------------------- */}

          <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700 transition w-full md:w-auto">
            Oluştur
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(coupon => (
          <div key={coupon._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center group hover:shadow-md transition relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-pink-500"></div>
            <div>
              <div className="text-xl font-bold text-gray-800 font-mono">{coupon.code}</div>
              <div className="text-sm text-green-600 font-bold">%{coupon.discountRate} İndirim</div>
              <div className="text-xs text-gray-400 mt-1 flex flex-col">
                <span>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "Süresiz"}</span>
                {coupon.includeDelivery && <span className="text-purple-500 font-bold">+ Kargo Dahil</span>}
              </div>
            </div>
            <button onClick={() => handleDelete(coupon._id)} className="text-gray-400 hover:text-red-500 transition p-2">
              🗑️
            </button>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-gray-400 col-span-full text-center">Aktif kupon yok.</p>}
      </div>
    </div>
  );
};

export default AdminCoupons;