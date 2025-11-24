import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({ code: "", discountRate: "", expiryDate: "" });
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

    try {
      await axios.post("http://localhost:5000/api/coupons", {
        code: formData.code.toUpperCase(),
        discountRate: Number(formData.discountRate),
        expiryDate: formData.expiryDate
      });
      notify("Kupon oluşturuldu! 🎉", "success");
      setFormData({ code: "", discountRate: "", expiryDate: "" });
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
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Kupon Kodu</label>
            <input 
              value={formData.code} 
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
              className="w-full p-3 border rounded outline-none focus:border-pink-500 font-mono uppercase" 
              placeholder="Örn: YAZ2024" 
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">İndirim (%)</label>
            <input 
              type="number" 
              value={formData.discountRate} 
              onChange={(e) => setFormData({...formData, discountRate: e.target.value})} 
              className="w-full p-3 border rounded outline-none focus:border-pink-500" 
              placeholder="10" 
            />
          </div>
          <div className="w-40">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Son Tarih</label>
            <input 
              type="date" 
              value={formData.expiryDate} 
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} 
              className="w-full p-3 border rounded outline-none focus:border-pink-500" 
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700 transition">
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
              <div className="text-xs text-gray-400 mt-1">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "Süresiz"}</div>
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