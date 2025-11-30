import { useEffect, useState } from "react";
import axios from "axios";
import { FiUsers, FiShoppingBag, FiBox, FiActivity } from "react-icons/fi";

// --- GRAFİK KÜTÜPHANELERİ ---
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

// Chart.js Kaydı
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  // --- GRAFİK STATE'LERİ ---
  const [statusChartData, setStatusChartData] = useState(null); // Sipariş Durumu (Pasta)
  const [revenueChartData, setRevenueChartData] = useState(null); // Ciro (Çizgi)
  const [userRoleChartData, setUserRoleChartData] = useState(null); // Kullanıcı Rolleri (Pasta)
  const [userGrowthChartData, setUserGrowthChartData] = useState(null); // Yeni Üyeler (Bar)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes, productsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users"),
          axios.get("http://localhost:5000/api/orders"),
          axios.get("http://localhost:5000/api/products")
        ]);

        const users = usersRes.data;
        const orders = ordersRes.data;
        const revenue = orders.reduce((acc, o) => acc + (o.status !== "İptal" ? o.totalAmount : 0), 0);

        setStats({
          totalUsers: users.length,
          totalOrders: orders.length,
          totalRevenue: revenue,
          totalProducts: productsRes.data.length
        });

        // =================================================
        // 1. SİPARİŞ GRAFİKLERİ (MEVCUT)
        // =================================================
        
        // A) Durum Dağılımı
        const statusCounts = { "Sipariş Alındı": 0, "Hazırlanıyor": 0, "Yola Çıktı": 0, "Teslim Edildi": 0, "İptal": 0 };
        orders.forEach(order => {
           if (order.status === "Sipariş Alındı") statusCounts["Sipariş Alındı"]++;
           else if (order.status === "Hazırlanıyor" || order.status === "Hazır") statusCounts["Hazırlanıyor"]++;
           else if (order.status === "Yola Çıktı" || order.status === "Dağıtımda" || order.status === "Kurye Yolda") statusCounts["Yola Çıktı"]++;
           else if (order.status === "Teslim Edildi") statusCounts["Teslim Edildi"]++;
           else if (order.status === "İptal" || order.status === "İptal Talebi") statusCounts["İptal"]++;
        });

        setStatusChartData({
          labels: ['Sipariş Alındı', 'Hazırlanıyor', 'Yola Çıktı', 'Teslim Edildi', 'İptal'],
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#3b82f6', '#eab308', '#a855f7', '#22c55e', '#ef4444'],
            borderWidth: 0,
          }],
        });

        // B) Günlük Ciro (Son 7 Gün)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('tr-TR');
        }).reverse();

        const dailyRevenue = last7Days.map(date => {
            return orders
                .filter(o => new Date(o.createdAt).toLocaleDateString('tr-TR') === date && o.status !== 'İptal')
                .reduce((acc, curr) => acc + curr.totalAmount, 0);
        });

        setRevenueChartData({
            labels: last7Days,
            datasets: [{
              label: 'Günlük Ciro (£)',
              data: dailyRevenue,
              borderColor: '#db2777',
              backgroundColor: 'rgba(219, 39, 119, 0.2)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#fff',
              pointBorderColor: '#db2777',
              pointRadius: 5
            }]
        });

        // =================================================
        // 2. KULLANICI GRAFİKLERİ (YENİ EKLENDİ) 🚀
        // =================================================

        // C) Rol Dağılımı (Müşteri vs Satıcı vs Kurye)
        const roleCounts = { customer: 0, vendor: 0, courier: 0, admin: 0 };
        users.forEach(u => {
            if (roleCounts[u.role] !== undefined) roleCounts[u.role]++;
        });

        setUserRoleChartData({
            labels: ['Müşteri', 'Satıcı (Mağaza)', 'Kurye', 'Yönetici'],
            datasets: [{
                data: [roleCounts.customer, roleCounts.vendor, roleCounts.courier, roleCounts.admin],
                backgroundColor: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'], // Mavi, Pembe, Turuncu, Yeşil
                borderWidth: 0,
            }]
        });

        // D) Yeni Üye Katılımı (Son 7 Gün - Bar Grafik)
        const dailyNewUsers = last7Days.map(date => {
            return users.filter(u => new Date(u.createdAt).toLocaleDateString('tr-TR') === date).length;
        });

        setUserGrowthChartData({
            labels: last7Days,
            datasets: [{
                label: 'Yeni Kayıt',
                data: dailyNewUsers,
                backgroundColor: '#8b5cf6', // Mor Çubuklar
                borderRadius: 6,
            }]
        });


      } catch (err) {
        console.error("Dashboard hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-gray-500 font-bold">Veriler Yükleniyor...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* BAŞLIK */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Genel Bakış</h2>
        <p className="text-gray-500 text-sm">Platformun anlık performans özeti ve analizleri.</p>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Toplam Kullanıcı" value={stats.totalUsers} icon={<FiUsers />} color="blue" />
        <StatCard title="Toplam Sipariş" value={stats.totalOrders} icon={<FiShoppingBag />} color="purple" />
        <StatCard title="Aktif Ürünler" value={stats.totalProducts} icon={<FiBox />} color="yellow" />
        <StatCard title="Toplam Ciro" value={`£${stats.totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 0 })}`} icon={<FiActivity />} color="green" />
      </div>

      {/* --- 1. SATIR: SİPARİŞ ANALİZİ --- */}
      <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4 border-l-4 border-pink-500 pl-3">Sipariş Analizi</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sipariş Durumu (Pasta) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center h-80">
          <h3 className="text-sm font-bold text-gray-500 uppercase w-full text-left mb-2">Sipariş Durum Dağılımı</h3>
          <div className="w-full h-full flex justify-center items-center relative">
            {statusChartData ? (
              <Doughnut 
                data={statusChartData} 
                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 15, font: { size: 11 } } } } }} 
              />
            ) : <p className="text-gray-400">Veri yok.</p>}
          </div>
        </div>

        {/* Ciro Grafiği (Çizgi) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-80">
           <h3 className="text-sm font-bold text-gray-500 uppercase w-full text-left mb-2">Son 7 Günlük Kazanç</h3>
           <div className="w-full h-full relative">
             {revenueChartData ? (
                <Line 
                  data={revenueChartData} 
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } } }}
                />
             ) : <p className="text-gray-400 text-center mt-20">Veri yok.</p>}
           </div>
        </div>

      </div>

      {/* --- 2. SATIR: KULLANICI ANALİZİ --- */}
      <h3 className="text-xl font-bold text-gray-800 mt-10 mb-4 border-l-4 border-blue-500 pl-3">Kullanıcı Analizi</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Kullanıcı Rolleri (Pasta) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center h-80">
          <h3 className="text-sm font-bold text-gray-500 uppercase w-full text-left mb-2">Kullanıcı Rol Dağılımı</h3>
          <div className="w-full h-full flex justify-center items-center relative">
            {userRoleChartData ? (
              <Doughnut 
                data={userRoleChartData} 
                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 15, font: { size: 11 } } } } }} 
              />
            ) : <p className="text-gray-400">Veri yok.</p>}
          </div>
        </div>

        {/* Büyüme Grafiği (Bar) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-80">
           <h3 className="text-sm font-bold text-gray-500 uppercase w-full text-left mb-2">Yeni Üye Katılımı (Son 7 Gün)</h3>
           <div className="w-full h-full relative">
             {userGrowthChartData ? (
                <Bar 
                  data={userGrowthChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } }
                  }}
                />
             ) : <p className="text-gray-400 text-center mt-20">Veri yok.</p>}
           </div>
        </div>

      </div>

    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = { blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600", yellow: "bg-yellow-50 text-yellow-600", green: "bg-green-50 text-green-600" };
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-lg transition-all duration-300 group">
      <div className={`p-4 rounded-2xl text-2xl ${colors[color]} group-hover:scale-110 transition`}>{icon}</div>
      <div><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p><h4 className="text-2xl font-black text-gray-800">{value}</h4></div>
    </div>
  );
};

export default AdminDashboard;