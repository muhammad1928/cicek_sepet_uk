import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- MODÜLLERİ ÇAĞIR ---
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminProducts from "../components/admin/AdminProducts";
import AdminOrders from "../components/admin/AdminOrders";
import AdminUsers from "../components/admin/AdminUsers";
import AdminCoupons from "../components/admin/AdminCoupons";
import AdminReviews from "../components/admin/AdminReviews";
import AdminApplications from "../components/admin/AdminApplications";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  // Güvenlik Kontrolü
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans pt-20">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 fixed h-full top-20 left-0 overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="p-6 text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent border-b border-slate-800">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} label="📊 Genel Bakış" />
          <SidebarButton active={activeTab === "applications"} onClick={() => setActiveTab("applications")} label="📝 Başvurular" />
          <SidebarButton active={activeTab === "users"} onClick={() => setActiveTab("users")} label="👥 Kullanıcılar" />
          <SidebarButton active={activeTab === "products"} onClick={() => setActiveTab("products")} label="📦 Ürün Yönetimi" />
          <SidebarButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")} label="🚚 Siparişler" />
          <SidebarButton active={activeTab === "coupons"} onClick={() => setActiveTab("coupons")} label="🎟️ Kuponlar" />
          <SidebarButton active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} label="💬 Yorumlar" />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white py-2 rounded text-sm font-bold transition border border-red-600/20">
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* --- İÇERİK --- */}
      <main className="flex-1 p-8 ml-64">
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "applications" && <AdminApplications />}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "coupons" && <AdminCoupons />}
        {activeTab === "reviews" && <AdminReviews />}
      </main>
    </div>
  );
};

// Yardımcı Sidebar Butonu
const SidebarButton = ({ active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${active ? "bg-pink-600 text-white shadow-lg shadow-pink-500/30" : "text-gray-400 hover:bg-slate-800 hover:text-white"}`}
  >
    {label}
  </button>
);

export default AdminPage;