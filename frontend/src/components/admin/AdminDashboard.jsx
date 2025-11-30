import { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stats");
        setStats(res.data);
      } catch (err) { console.log(err); }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="text-center mt-20 font-bold text-gray-400">Veriler Yükleniyor...</div>;

  const statusCounts = {};
  stats.orderStatusStats.forEach(item => { statusCounts[item._id] = item.count; });

  return (
    <div className="space-y-8 pt-2 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Genel Bakış</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="💷" title="Toplam Ciro" value={`£${stats.totalRevenue.toLocaleString()}`} color="green" />
        <StatCard icon="📦" title="Toplam Sipariş" value={stats.totalOrders} color="blue" />
        <StatCard icon="🌸" title="Aktif Ürün" value={stats.totalProducts} color="pink" />
        <StatCard icon="👥" title="Kayıtlı Üye" value={stats.totalUsers} color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-6">Sipariş Durumları</h3>
          <div className="space-y-4">
            {['Sipariş Alındı', 'Hazırlanıyor', 'Yola Çıktı', 'Teslim Edildi', 'İptal'].map(s => (
              <Statusbar key={s} label={s} count={statusCounts[s] || 0} total={stats.totalOrders} color={s === 'Teslim Edildi' ? 'bg-green-500' : s === 'İptal' ? 'bg-red-500' : 'bg-blue-500'} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({icon, title, value, color}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
    <div className={`w-12 h-12 bg-${color}-100 text-${color}-600 rounded-full flex items-center justify-center text-2xl`}>{icon}</div>
    <div><div className="text-sm text-gray-500 font-bold uppercase">{title}</div><div className="text-2xl font-extrabold text-gray-800">{value}</div></div>
  </div>
);
const Statusbar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-gray-600 mb-1"><span>{label}</span><span>{count} ({percentage}%)</span></div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div></div>
    </div>
  );
};

export default AdminDashboard;