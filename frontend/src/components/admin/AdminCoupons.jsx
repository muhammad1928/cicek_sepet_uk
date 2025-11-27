import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import { FiTrash2, FiPlus, FiTag, FiCalendar, FiPercent, FiTruck } from "react-icons/fi";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({ code: "", discountRate: "", expiryDate: "", includeDelivery: false });
  const [confirmData, setConfirmData] = useState(null); // Silme Modalı State
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
    if (!formData.code || !formData.discountRate) return notify("Lütfen zorunlu alanları doldurun", "warning");
    
    // %100 SINIRI KONTROLÜ
    if (Number(formData.discountRate) > 100) return notify("İndirim oranı %100'den fazla olamaz!", "warning");
    if (Number(formData.discountRate) < 1) return notify("Geçersiz indirim oranı", "warning");

    try {
      await axios.post("http://localhost:5000/api/coupons", {
        code: formData.code.toUpperCase(),
        discountRate: Number(formData.discountRate),
        expiryDate: formData.expiryDate,
        includeDelivery: formData.includeDelivery
      });
      notify("Kupon başarıyla oluşturuldu! 🎉", "success");
      setFormData({ code: "", discountRate: "", expiryDate: "", includeDelivery: false });
      fetchCoupons();
    } catch (err) { notify("Hata oluştu (Kod zaten var olabilir)", "error"); }
  };

  // MODALLI SİLME İŞLEMİ
  const handleDeleteRequest = (id) => {
    setConfirmData({
      isOpen: true,
      title: "Kuponu Sil?",
      message: "Bu kupon kalıcı olarak silinecek ve artık kullanılamayacak.",
      isDanger: true,
      action: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/coupons/${id}`);
          notify("Kupon silindi.", "success");
          fetchCoupons();
        } catch (err) { notify("Silinemedi", "error"); }
        setConfirmData(null);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      
      {/* BAŞLIK */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
          <FiTag size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">İndirim Kuponları</h2>
          <p className="text-sm text-gray-500">Müşteriler için kampanya kodları oluşturun.</p>
        </div>
      </div>

      {/* FORM ALANI */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FiPlus className="text-green-600" /> Yeni Kupon Oluştur
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          
          {/* Kod Input */}
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><FiTag /> Kupon Kodu</label>
            <input 
              value={formData.code} 
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
              className="w-full p-3 border rounded-lg outline-none focus:border-green-500 font-mono uppercase tracking-wide font-bold" 
              placeholder="YAZ2024" 
            />
          </div>
          
          {/* Yüzde Input */}
          <div className="w-full md:w-32">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><FiPercent /> İndirim</label>
            <input 
              type="number" 
              max="100" 
              min="1" 
              value={formData.discountRate} 
              onChange={(e) => setFormData({...formData, discountRate: e.target.value})} 
              className="w-full p-3 border rounded-lg outline-none focus:border-green-500 text-center font-bold" 
              placeholder="10" 
            />
          </div>
          
          {/* Tarih Input */}
          <div className="w-full md:w-48">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><FiCalendar /> Son Tarih</label>
            <input 
              type="date" 
              value={formData.expiryDate} 
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} 
              className="w-full p-3 border rounded-lg outline-none focus:border-green-500 text-sm text-gray-600" 
            />
          </div>

          {/* Checkbox (Kargo Dahil) */}
          <div className="flex items-center gap-2 h-12 pb-1 bg-gray-50 px-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition" onClick={() => setFormData({...formData, includeDelivery: !formData.includeDelivery})}>
             <input 
               type="checkbox" 
               id="delivery" 
               checked={formData.includeDelivery} 
               onChange={(e) => setFormData({...formData, includeDelivery: e.target.checked})}
               className="w-5 h-5 accent-green-600 cursor-pointer pointer-events-none" // pointer-events-none çünkü div onClick yönetiyor
             />
             <label htmlFor="delivery" className="text-xs font-bold text-gray-600 cursor-pointer select-none leading-tight w-20 pointer-events-none">
               Kargo Ücretini Kapsa
             </label>
          </div>

          <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg w-full md:w-auto active:scale-95">
            Oluştur
          </button>
        </form>
      </div>

      {/* LİSTE ALANI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(coupon => (
          <div key={coupon._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center group hover:shadow-md transition relative overflow-hidden">
            
            {/* Dekoratif Sol Çizgi */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-500"></div>
            
            <div>
              <div className="text-xl font-bold text-gray-800 font-mono tracking-wider">{coupon.code}</div>
              <div className="text-sm font-bold text-green-600 flex items-center gap-1 mt-1">
                <FiPercent /> {coupon.discountRate} İndirim
                {coupon.includeDelivery && <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ml-2"><FiTruck /> Kargo</span>}
              </div>
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <FiCalendar size={10} />
                {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "Süresiz"}
              </div>
            </div>

            <button 
              onClick={() => handleDeleteRequest(coupon._id)} 
              className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-3 rounded-full transition"
              title="Sil"
            >
              <FiTrash2 size={20} />
            </button>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
            <FiTag className="mx-auto text-4xl mb-2 opacity-20" />
            <p>Henüz aktif bir kupon yok.</p>
          </div>
        )}
      </div>
      
      {/* ONAY MODALI */}
      {confirmData && (
        <ConfirmModal 
          title={confirmData.title} 
          message={confirmData.message} 
          isDanger={confirmData.isDanger} 
          onConfirm={confirmData.action} 
          onCancel={() => setConfirmData(null)} 
        />
      )}

    </div>
  );
};

export default AdminCoupons;