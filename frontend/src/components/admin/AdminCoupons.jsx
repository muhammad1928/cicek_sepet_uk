import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import { FiTrash2, FiPlus, FiTag, FiCalendar, FiPercent, FiTruck } from "react-icons/fi";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({ 
    code: "", 
    discountRate: "", 
    expiryDate: "", 
    includeDelivery: false 
  });
  
  const [confirmData, setConfirmData] = useState(null);
  const { notify } = useCart();

  // BUGÜNÜN TARİHİ (YYYY-MM-DD) - Geçmiş tarih seçimi engellemek için
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Kuponları Çek
  const fetchCoupons = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/coupons");
      setCoupons(res.data);
    } catch (err) { console.log(err); }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  // 2. Kupon Oluştur
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.discountRate) return notify("Lütfen kod ve indirim oranını girin.", "warning");
    
    // Ekstra güvenlik kontrolü (Input zaten engelliyor ama yine de kalsın)
    if (Number(formData.discountRate) > 100) return notify("İndirim %100'den fazla olamaz!", "warning");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.accessToken;

      // Tarih Ayarı (Gün Sonu: 23:59:59)
      let finalDate = null;
      if (formData.expiryDate) {
          const dateObj = new Date(formData.expiryDate);
          dateObj.setHours(23, 59, 59, 999);
          finalDate = dateObj;
      }

      const payload = {
        code: formData.code.toUpperCase(),
        discountRate: Number(formData.discountRate),
        expiryDate: finalDate, 
        includeDelivery: formData.includeDelivery
      };

      await axios.post("http://localhost:5000/api/coupons", payload, {
        headers: { token: `Bearer ${token}` }
      });
      
      notify("Kupon başarıyla oluşturuldu! 🎉", "success");
      setFormData({ code: "", discountRate: "", expiryDate: "", includeDelivery: false });
      fetchCoupons();

    } catch (err) { 
      const msg = err.response?.data?.message || "Hata oluştu (Kod zaten var olabilir)";
      notify(msg, "error"); 
    }
  };

  // 3. Kupon Sil
  const handleDeleteRequest = (id) => {
    setConfirmData({
      isOpen: true,
      title: "Kuponu Sil?",
      message: "Bu işlem geri alınamaz. Kupon kalıcı olarak silinecek.",
      isDanger: true,
      action: async () => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const token = user?.accessToken;
          
          await axios.delete(`http://localhost:5000/api/coupons/${id}`, { 
            headers: { token: `Bearer ${token}` } 
          });
          
          notify("Kupon silindi.", "success");
          fetchCoupons();
        } catch (err) { notify("Silinemedi (Yetki hatası olabilir)", "error"); }
        setConfirmData(null);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      
      {/* BAŞLIK */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
          <FiTag size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">İndirim Kuponları</h2>
          <p className="text-sm text-gray-500">Müşteriler için kampanya kodları oluşturun ve yönetin.</p>
        </div>
      </div>

      {/* --- FORM ALANI --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FiPlus className="text-green-600" /> Yeni Kupon Oluştur
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* 1. Kod Input */}
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><FiTag /> Kupon Kodu</label>
            <input 
              value={formData.code} 
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
              className="w-full p-3 border rounded-lg outline-none focus:border-green-500 font-mono uppercase tracking-wide font-bold text-gray-900 placeholder-gray-400" 
              placeholder="YAZ2024" 
            />
          </div>
          
          {/* 2. Yüzde Input (OTOMATİK DÜZELTME EKLENDİ) */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><FiPercent /> İndirim</label>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={formData.discountRate} 
              onChange={(e) => {
                let val = Number(e.target.value);
                if (val > 100) val = 100; // 100'den büyükse 100 yap
                if (val < 0) val = 0;     // 0'dan küçükse 0 yap
                setFormData({...formData, discountRate: val});
              }} 
              className="w-full p-3 border rounded-lg outline-none focus:border-green-500 text-center font-bold text-gray-900" 
              placeholder="10" 
            />
          </div>
          
          {/* 3. Tarih Input (GEÇMİŞ TARİH ENGELLENDİ) */}
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><FiCalendar /> Son Tarih</label>
            <input 
              type="date" 
              min={todayStr} // <--- GEÇMİŞ TARİHLERİ KAPATIR
              value={formData.expiryDate} 
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} 
              className="w-full p-3 border rounded-lg outline-none focus:border-green-500 text-sm text-gray-900 cursor-pointer" 
            />
          </div>

          {/* 4. Kargo Dahil Checkbox */}
          <div 
            className="md:col-span-2 flex items-center justify-center gap-2 h-[46px] bg-gray-50 px-2 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition" 
            onClick={() => setFormData({...formData, includeDelivery: !formData.includeDelivery})}
          >
             <input 
               type="checkbox" 
               id="delivery" 
               checked={formData.includeDelivery} 
               onChange={(e) => setFormData({...formData, includeDelivery: e.target.checked})}
               className="w-4 h-4 accent-green-600 cursor-pointer pointer-events-none" 
             />
             <label htmlFor="delivery" className="text-xs font-bold text-gray-700 cursor-pointer select-none leading-tight pointer-events-none">
               Kargo Dahil
             </label>
          </div>

          {/* 5. Oluştur Butonu */}
          <div className="md:col-span-2">
            <button 
              type="submit" 
              className="w-full bg-green-600 text-white h-[46px] rounded-lg font-bold hover:bg-green-700 transition shadow-lg active:scale-95"
            >
              Oluştur
            </button>
          </div>

        </form>
      </div>

      {/* LİSTE ALANI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(coupon => (
          <div key={coupon._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center group hover:shadow-md transition relative overflow-hidden">
            
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-500"></div>
            
            <div>
              <div className="text-xl font-bold text-gray-800 font-mono tracking-wider">{coupon.code}</div>
              <div className="text-sm font-bold text-green-600 flex items-center gap-1 mt-1">
                <FiPercent /> {coupon.discountRate} İndirim 
                {coupon.includeDelivery && (
                  <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ml-2 border border-blue-200">
                    <FiTruck /> Kargo
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <FiCalendar size={10} /> 
                {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "Süresiz"}
              </div>
            </div>

            <button 
              onClick={() => handleDeleteRequest(coupon._id)} 
              className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-3 rounded-full transition"
              title="Kuponu Sil"
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
      
      {/* Onay Modalı */}
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