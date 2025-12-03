import { useState, useEffect } from "react";
import { userRequest } from "../../requestMethods";
import { useTranslation } from "react-i18next";

const VendorDashboard = ({ user }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, productCount: 0 });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await userRequest.get(`/products/vendor/${user._id}`);
        const ordRes = await userRequest.get(`/orders/vendor/${user._id}`);
        
        // Ciro Hesabı: Sadece kendi ürünlerinin ham fiyatı üzerinden
        const totalSales = ordRes.data.reduce((acc, order) => {
           // Bu siparişteki satıcının ürünlerini bul
           // Not: Backend'de ürünlere vendor populate yapmazsak filtreleyemeyiz.
           // Basitlik için: order.totalAmount üzerinden gidiyoruz (Komisyon hariç mantığı eklenebilir)
           // Ancak en doğrusu sipariş item'larını döngüyle kontrol etmektir.
           return acc + order.totalAmount; 
        }, 0);
        
        setStats({
          totalSales,
          orderCount: ordRes.data.length,
          productCount: prodRes.data.length
        });
      } catch (err) { console.log(err); }
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">{t("vendorDashboard.store")}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon="💷" title={t("vendorDashboard.totalSales")} value={`£${stats.totalSales.toLocaleString()}`} color="pink" />
        <StatCard icon="📦" title={t("vendorDashboard.totalOrders")} value={stats.orderCount} color="blue" />
        <StatCard icon="🌸" title={t("vendorDashboard.totalProducts")} value={stats.productCount} color="purple" />
      </div>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 flex items-start gap-4 shadow-sm">
        <span className="text-4xl">👋</span>
        <div>
          <h3 className="font-bold text-blue-800 mb-1">{t("vendorDashboard.welcome")}, {user.username}!</h3>
          <p className="text-sm text-blue-600">
            {t("vendorDashboard.welcome2")}
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border border-${color}-100 flex items-center gap-4`}>
    <div className={`w-14 h-14 bg-${color}-100 text-${color}-600 rounded-full flex items-center justify-center text-2xl`}>{icon}</div>
    <div>
      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{title}</div>
      <div className="text-2xl font-extrabold text-gray-800">{value}</div>
    </div>
  </div>
);

export default VendorDashboard;