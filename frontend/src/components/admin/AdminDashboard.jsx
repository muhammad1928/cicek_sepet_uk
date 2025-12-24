import { useEffect, useState } from "react";
import { publicRequest, userRequest } from "../../requestMethods";

// --- BİLEŞENLER (Klasör ismi düzeltildi: AdminDashboardcomponents) ---
import DashboardHeader from "./AdminDashboardComponents/DashboardHeader";
import StatsGrid from "./AdminDashboardComponents/StatsGrid";
import OrderAnalysisSection from "./AdminDashboardComponents/OrderAnalysisSection";
import TrafficAnalysisSection from "./AdminDashboardComponents/TrafficAnalysisSection";
import UserAnalysisSection from "./AdminDashboardComponents/UserAnalysisSection";
import SearchAnalysisSection from "./AdminDashboardComponents/SearchAnalysisSection"; // YENİ EKLENDİ

// --- CHART.JS KONFIGURASYONU ---
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
  Title,
  Filler
} from 'chart.js';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale, 
  BarElement, PointElement, LineElement, Title, Filler
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  
  // --- STATE'LER ---
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0, totalProducts: 0 });
  
  // Grafik Verileri State'leri
  const [statusChartData, setStatusChartData] = useState(null);
  const [revenueChartData, setRevenueChartData] = useState(null);
  const [userRoleChartData, setUserRoleChartData] = useState(null);
  const [userGrowthChartData, setUserGrowthChartData] = useState(null);
  const [trafficChartData, setTrafficChartData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  
  // YENİ: Arama Analizi State'leri
  const [searchChartData, setSearchChartData] = useState(null);
  const [topSearchTerms, setTopSearchTerms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. TÜM VERİLERİ ÇEK
        const [usersRes, ordersRes, productsRes, logsRes] = await Promise.all([
          userRequest.get("/users"),
          userRequest.get("/orders"),
          publicRequest.get("/products"),
          userRequest.get("/logs")
        ]);

        const users = usersRes.data;
        const orders = ordersRes.data;
        const products = productsRes.data;
        const logs = logsRes.data;

        // --- İSTATİSTİK HESAPLAMALARI ---
        const revenue = orders.reduce((acc, o) => acc + (o.status !== "İptal" ? o.totalAmount : 0), 0);
        setStats({
          totalUsers: users.length,
          totalOrders: orders.length,
          totalRevenue: revenue,
          totalProducts: products.length
        });

        // --- TARİH HELPER (Son 7 Gün) ---
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toLocaleDateString('tr-TR');
        }).reverse();

        // -------------------------------------------------
        // A) SİPARİŞ DURUM DAĞILIMI
        // -------------------------------------------------
        const statusCounts = { "Sipariş Alındı": 0, "Hazırlanıyor": 0, "Yola Çıktı": 0, "Teslim Edildi": 0, "İptal": 0 };
        orders.forEach(order => {
           if (order.status === "Sipariş Alındı") statusCounts["Sipariş Alındı"]++;
           else if (["Hazırlanıyor", "Hazır"].includes(order.status)) statusCounts["Hazırlanıyor"]++;
           else if (["Yola Çıktı", "Dağıtımda", "Kurye Yolda"].includes(order.status)) statusCounts["Yola Çıktı"]++;
           else if (order.status === "Teslim Edildi") statusCounts["Teslim Edildi"]++;
           else if (["İptal", "İptal Talebi"].includes(order.status)) statusCounts["İptal"]++;
        });

        setStatusChartData({
          labels: Object.keys(statusCounts),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#3b82f6', '#eab308', '#a855f7', '#22c55e', '#ef4444'],
            borderWidth: 0,
          }],
        });

        // -------------------------------------------------
        // B) GÜNLÜK CİRO
        // -------------------------------------------------
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
              backgroundColor: 'rgba(219, 39, 119, 0.1)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#db2777'
            }]
        });

        // -------------------------------------------------
        // C) TRAFİK VE ÜRÜN ANALİZİ (LOGLARDAN)
        // -------------------------------------------------
        const dailyTraffic = last7Days.map(date => {
            return logs.filter(l => new Date(l.createdAt).toLocaleDateString('tr-TR') === date).length;
        });

        setTrafficChartData({
            labels: last7Days,
            datasets: [{
                label: 'Sistem Aksiyonu',
                data: dailyTraffic,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4
            }]
        });

        const productViews = {};
        logs.filter(l => l.action === 'view_product').forEach(l => {
            const name = l.metadata?.productName || "Bilinmeyen Ürün";
            productViews[name] = (productViews[name] || 0) + 1;
        });
        const sortedProducts = Object.entries(productViews).sort((a, b) => b[1] - a[1]).slice(0, 5);
        setTopProducts(sortedProducts);

        // -------------------------------------------------
        // D) ARAMA ANALİZİ (YENİ EKLENDİ)
        // -------------------------------------------------
        const searchTerms = {};
        logs.filter(l => l.action === 'search_query').forEach(l => {
            const term = l.metadata?.searchTerm?.toLowerCase() || "bilinmiyor";
            searchTerms[term] = (searchTerms[term] || 0) + 1;
        });
        
        // En çok aranan 5 kelimeyi al
        const sortedSearchTerms = Object.entries(searchTerms)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        setTopSearchTerms(sortedSearchTerms);

        setSearchChartData({
            labels: sortedSearchTerms.map(([term]) => term),
            datasets: [{
                label: 'Aranma Sayısı',
                data: sortedSearchTerms.map(([, count]) => count),
                backgroundColor: '#a855f7',
                borderRadius: 4,
                barThickness: 20,
                indexAxis: 'y' // Yatay bar grafiği için
            }]
        });

        // -------------------------------------------------
        // E) KULLANICI ANALİZİ
        // -------------------------------------------------
        const roleCounts = { customer: 0, vendor: 0, courier: 0, admin: 0 };
        users.forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });

        setUserRoleChartData({
            labels: ['Müşteri', 'Satıcı', 'Kurye', 'Yönetici'],
            datasets: [{
                data: [roleCounts.customer, roleCounts.vendor, roleCounts.courier, roleCounts.admin],
                backgroundColor: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'],
                borderWidth: 0,
            }]
        });

        const dailyNewUsers = last7Days.map(date => {
            return users.filter(u => new Date(u.createdAt).toLocaleDateString('tr-TR') === date).length;
        });

        setUserGrowthChartData({
            labels: last7Days,
            datasets: [{
                label: 'Yeni Kayıt',
                data: dailyNewUsers,
                backgroundColor: '#8b5cf6',
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
    return <div className="p-10 text-center animate-pulse text-gray-500 font-bold">Veriler Analiz Ediliyor...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto">
      
      {/* 1. Header */}
      <DashboardHeader />

      {/* 2. Kartlar */}
      <StatsGrid stats={stats} />

      {/* 3. Sipariş Analizi */}
      <OrderAnalysisSection 
        statusChartData={statusChartData} 
        revenueChartData={revenueChartData} 
      />

      {/* 4. Trafik ve Ürün Analizi */}
      <TrafficAnalysisSection 
        trafficChartData={trafficChartData} 
        topProducts={topProducts} 
      />

      {/* 5. Arama Analizi (YENİ) */}
      <SearchAnalysisSection 
        searchChartData={searchChartData} 
        topSearchTerms={topSearchTerms} 
      />

      {/* 6. Kullanıcı Analizi */}
      <UserAnalysisSection 
        userRoleChartData={userRoleChartData} 
        userGrowthChartData={userGrowthChartData} 
      />

    </div>
  );
};

export default AdminDashboard;