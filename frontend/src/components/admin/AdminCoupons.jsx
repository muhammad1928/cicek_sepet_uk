import { useState, useEffect, useCallback } from "react";
import { userRequest } from "../../requestMethods"; 
import { useTranslation } from "react-i18next";

import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import { FiTrash2, FiPlus, FiTag, FiCalendar, FiPercent, FiTruck, FiSearch, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const AdminCoupons = () => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({ code: "", discountRate: "", expiryDate: "", includeDelivery: false });
  const [confirmData, setConfirmData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { notify } = useCart();
  const todayStr = new Date().toISOString().split("T")[0]; 

  // 1. KUPONLARI ÇEK (userRequest ile - Otomatik Token)
  const fetchCoupons = useCallback(async () => {
    try {
      const res = await userRequest.get("/coupons");
      setCoupons(res.data);
    } catch (err) { 
      console.error("Kupon çekme hatası:", err); 
      // 401 hatası gelirse App.jsx'teki interceptor zaten login'e atar.
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  // 2. KUPON OLUŞTUR
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountRate) return notify(t("adminComponents.adminCoupon.discountAmount"), "warning");
    if (Number(formData.discountRate) > 100) return notify(t("adminComponents.adminCoupon.discountAmountMax"), "warning");

    try {
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

      // userRequest kullanıyoruz, header yazmaya gerek yok
      await userRequest.post("/coupons", payload);
      
      notify(t("adminComponents.adminCoupon.couponCreated") + " 🎉", "success");
      setFormData({ code: "", discountRate: "", expiryDate: "", includeDelivery: false });
      fetchCoupons();
    } catch (err) { 
      notify(err.response?.data?.message || t("adminComponents.adminCoupon.errorOccurred"), "error"); 
    }
  };

  // 3. KUPON SİL
  const handleDeleteRequest = (id) => {
    setConfirmData({
      isOpen: true, title: t("adminComponents.adminCoupon.deleteCoupon"), message: t("adminComponents.adminCoupon.cannotBeUndone"), isDanger: true,
      action: async () => {
        try {
          // userRequest kullanıyoruz
          await userRequest.delete(`/coupons/${id}`);
          notify(t("adminComponents.adminCoupon.deleted"), "success");
          fetchCoupons();
        } catch (err) { notify(t("adminComponents.adminCoupon.errorOccurred"), "error"); }
        setConfirmData(null);
      }
    });
  };

  // --- SIRALAMA VE FİLTRELEME ---
  const getProcessedCoupons = () => {
    const now = new Date();
    return coupons
      .filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const dateA = a.expiryDate ? new Date(a.expiryDate) : new Date(9999, 11, 31);
        const dateB = b.expiryDate ? new Date(b.expiryDate) : new Date(9999, 11, 31);
        const isExpiredA = dateA < now;
        const isExpiredB = dateB < now;
        if (isExpiredA && !isExpiredB) return 1;
        if (!isExpiredA && isExpiredB) return -1;
        return dateA - dateB;
      });
  };

  const processedCoupons = getProcessedCoupons();

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <span className="bg-gradient-to-br from-emerald-400 to-green-600 text-white p-2 rounded-xl shadow-lg shadow-green-200"><FiTag /></span>
            {t("adminComponents.adminCoupon.couponsManagement")}
          </h2>
          <p className="text-gray-500 mt-2 font-medium">{t("adminComponents.adminCoupon.couponManagementDesc")}</p>
        </div>
        
        <div className="relative w-full md:w-72">
           <input type="text" placeholder={t("adminComponents.adminCoupon.searchPlaceholder")} className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm focus:shadow-md focus:border-emerald-500 outline-none transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- SOL: KUPON OLUŞTURMA FORMU --- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold text-lg">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><FiPlus /></div>
              {t("adminComponents.adminCoupon.createNewCoupon")}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">{t("adminComponents.adminCoupon.code")}</label>
                <input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition font-mono font-bold text-lg text-gray-800 placeholder-gray-300" placeholder="YAZ2024" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">{t("adminComponents.adminCoupon.discountValue")}</label><div className="relative"><FiPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="number" min="1" max="100" value={formData.discountRate} onChange={(e) => { let v=Number(e.target.value); if(v>100)v=100; if(v<0)v=0; setFormData({...formData, discountRate: v}) }} className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-gray-800" placeholder="10" /></div></div>
                <div><label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">{t("adminComponents.adminCoupon.validUntil")}</label><input type="date" min={todayStr} value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-600 cursor-pointer" /></div>
              </div>
              <div onClick={() => setFormData({...formData, includeDelivery: !formData.includeDelivery})} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${formData.includeDelivery ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-gray-50 hover:border-emerald-200'}`}><span className="text-sm font-bold text-gray-700 flex items-center gap-2"><FiTruck /> {t("adminComponents.adminCoupon.deliveryIncluded")}</span><div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.includeDelivery ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>{formData.includeDelivery && <FiCheckCircle className="text-white text-sm" />}</div></div>
              <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-black hover:shadow-xl transition transform active:scale-95">{t("adminComponents.adminCoupon.create")}</button>
            </form>
          </div>
        </div>

        {/* --- SAĞ: KUPON LİSTESİ (ÇİFTER ÇİFTER) --- */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processedCoupons.length === 0 ? (
              <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                <FiTag className="mx-auto text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">{t("adminComponents.adminCoupon.notFound")}</p>
              </div>
            ) : (
              processedCoupons.map(coupon => {
                const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();

                return (
                  <div 
                    key={coupon._id} 
                    className={`
                      relative p-5 rounded-2xl border transition-all duration-300 group
                      flex flex-col justify-between
                      ${isExpired 
                        ? 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-100' 
                        : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200'
                      }
                    `}
                  >
                    <div className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full ${isExpired ? 'bg-red-400' : 'bg-emerald-400'}`}></div>

                    <div className="pl-4 mb-4">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-xl font-mono font-black text-gray-800 tracking-wider">{coupon.code}</h3>
                        {isExpired ? (
                           <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-1 rounded-full border border-red-200 flex items-center gap-1">
                             <FiAlertCircle /> {t("adminComponents.adminCoupon.expired")}
                           </span>
                        ) : (
                           <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                             <FiCheckCircle /> {t("adminComponents.adminCoupon.active")}
                           </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs mt-2">
                         <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1"><FiPercent/> {coupon.discountRate} İndirim</span>
                         {coupon.includeDelivery && <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1"><FiTruck/> {t("adminComponents.adminCoupon.freeDelivery")}</span>}
                      </div>
                      
                      <div className="text-xs text-gray-400 mt-3 flex items-center gap-1 font-medium border-t pt-2 border-dashed">
                        <FiCalendar /> 
                        {coupon.expiryDate 
                          ? `${t("adminComponents.adminCoupon.last")}: ${new Date(coupon.expiryDate).toLocaleDateString('tr-TR')}` 
                          : t("adminComponents.adminCoupon.noExpiry")
                        }
                      </div>
                    </div>

                    <div className="w-full flex justify-end">
                      <button 
                        onClick={() => handleDeleteRequest(coupon._id)} 
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 w-full flex items-center justify-center gap-2 text-xs font-bold"
                        title={t("adminComponents.adminCoupon.deleteCoupon")}
                      >
                        <FiTrash2 size={16} /> {t("adminComponents.adminCoupon.delete")}
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
      
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

export default AdminCoupons;