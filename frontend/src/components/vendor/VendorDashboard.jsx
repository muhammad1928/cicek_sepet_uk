import { useState, useEffect } from "react";
import { userRequest } from "../../requestMethods";
import { useTranslation } from "react-i18next";

const VendorDashboard = ({ user }) => {
  const { t } = useTranslation();
  // State yapısını backend'den gelecek yeni veri formatına hazırladık
  const [stats, setStats] = useState({ 
      totalSales: 0, 
      orderCount: 0, 
      productCount: 0,
      totalEarnings: 0 // Yeni eklenen (Net Kazanç)
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ürün Sayısı (Eski yöntem devam ediyor, sorun yok)
        const prodRes = await userRequest.get(`/products/vendor/${user._id}`);
        
        // 2. İstatistikler (YENİ ENDPOINT)
        // Backend'de yazdığımız '/vendor-summary' endpointi, satıcının sadece kendi ürünlerini
        // toplayarak net ciroyu ve sipariş sayısını hesaplayıp döndürüyor.
        const statsRes = await userRequest.get(`/stats/vendor-summary/${user._id}`);
        
        setStats({
          totalSales: statsRes.data.totalEarnings, // Backend doğru hesaplayıp gönderiyor
          orderCount: statsRes.data.totalOrders,   // Sipariş sayısı
          productCount: prodRes.data.length,       // Ürün sayısı
          totalEarnings: statsRes.data.totalEarnings
        });

      } catch (err) { console.log(err); }
    };
    if (user?._id) fetchData();
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
    {/* Tailwind dinamik class'ları bazen derlemede sorun olabilir, garanti olsun diye inline style veya tam class adı yazılabilir ama senin yapını bozmuyorum */}
    <div className={`w-14 h-14 bg-${color}-100 text-${color}-600 rounded-full flex items-center justify-center text-2xl`}>{icon}</div>
    <div>
      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{title}</div>
      <div className="text-2xl font-extrabold text-gray-800">{value}</div>
    </div>
  </div>
);

export default VendorDashboard;