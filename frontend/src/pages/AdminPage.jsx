import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { FiLogOut, FiGrid, FiFileText, FiPackage, FiTruck, FiUsers, FiTag, FiMessageSquare, FiMenu, FiX, FiActivity } from "react-icons/fi";
import { useTranslation } from "react-i18next";

// --- MODÜLLER ---
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminProducts from "../components/admin/AdminProducts";
import AdminOrders from "../components/admin/AdminOrders";
import AdminUsers from "../components/admin/AdminUsers";
import AdminCoupons from "../components/admin/AdminCoupons";
import AdminApplications from "../components/admin/AdminApplications"; 
import AdminReviews from "../components/admin/AdminReviews"; 
import AdminSystemLogs from "../components/admin/AdminSystemLogs"; 

const AdminPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  const navigate = useNavigate();
  const location = useLocation();

  // --- TEK VE GÜÇLÜ GÜVENLİK + TAB KONTROLÜ ---
  useEffect(() => {
    // 1. Güvenlik Kontrolü (Tek seferde hallediyoruz)
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/");
      return; // Admin değilse aşağıya hiç bakma
    }

    // 2. URL'e Göre Tab Ayarlama
    // Eğer URL /admin/logs ise tabı log yap, değilse dashboard yap
    if (location.pathname.includes("logs")) {
      setActiveTab("logs");
    } else {
      setActiveTab("dashboard");
    }
  }, [navigate, location.pathname]); // Sadece bunlar değiştiğinde çalışır

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("user-change"));
    navigate("/login");
  };

  const handleTabClick = (tabName) => {
    // Eğer logları seçtiysek URL'i manuel güncelliyoruz ki useEffect tetiklensin
    if (tabName === "logs") {
      navigate("/admin/logs");
    } else {
      setActiveTab(tabName);
      navigate("/admin"); // Diğer tablar için ana admin yoluna dön
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans pt-20 relative">
      
      {/* MOBİL MENÜ BUTONU */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-20 left-4 z-50 bg-slate-900 text-white p-3 rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        w-64 bg-slate-900 pt-4 text-white flex flex-col shadow-xl 
        fixed h-[calc(100vh-80px)] top-20 left-0 
        z-40 overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-slate-700
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}>
        
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent" >
            {t("admin.dashboard")}
          </h2>
          <p className="text-xs text-gray-500 mt-1">{t("admin.yonetimMerkezi")}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarBtn active={activeTab === "dashboard"} onClick={() => handleTabClick("dashboard")} icon={<FiGrid />} label={t("admin.genelBakis")} />
          
          {/* LOGLAR BUTONU */}
          <SidebarBtn active={activeTab === "logs"} onClick={() => handleTabClick("logs")} icon={<FiActivity />} label="Canlı Trafik (Loglar)" />
          
          <SidebarBtn active={activeTab === "applications"} onClick={() => handleTabClick("applications")} icon={<FiFileText />} label={t("admin.applications")} />
          <SidebarBtn active={activeTab === "users"} onClick={() => handleTabClick("users")} icon={<FiUsers />} label={t("admin.users")} />
          <SidebarBtn active={activeTab === "products"} onClick={() => handleTabClick("products")} icon={<FiPackage />} label={t("admin.products")} />
          <SidebarBtn active={activeTab === "orders"} onClick={() => handleTabClick("orders")} icon={<FiTruck />} label={t("admin.orders")} />
          <SidebarBtn active={activeTab === "coupons"} onClick={() => handleTabClick("coupons")} icon={<FiTag />} label={t("admin.coupons")} />
          <SidebarBtn active={activeTab === "reviews"} onClick={() => handleTabClick("reviews")} icon={<FiMessageSquare />} label={t("common.reviews")} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white py-3 rounded-xl text-sm font-bold transition border border-red-600/20" >
            <FiLogOut /> {t("common.logout")}
          </button>
        </div>
      </aside>

      {/* SAĞ İÇERİK ALANI */}
      <main className="flex-1 p-4 md:p-8 md:ml-64 ml-0 w-full transition-all duration-300">
        <div className="max-w-7xl mx-auto animate-fade-in pb-20">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "logs" && <AdminSystemLogs />}
          {activeTab === "applications" && <AdminApplications />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "coupons" && <AdminCoupons />}
          {activeTab === "reviews" && <AdminReviews />}
        </div>
      </main>

    </div>
  );
};

const SidebarBtn = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick} 
    className={`
      w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium flex items-center gap-3
      ${active 
        ? "bg-pink-600 text-white shadow-lg shadow-pink-900/20 translate-x-1" 
        : "text-gray-400 hover:bg-slate-800 hover:text-white hover:translate-x-1"}
    `}
  >
    <span className="text-lg">{icon}</span>
    {label}
  </button>
);

export default AdminPage;