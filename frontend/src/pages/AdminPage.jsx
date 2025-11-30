import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiGrid, FiFileText, FiPackage, FiTruck, FiUsers, FiTag, FiMessageSquare } from "react-icons/fi";

// --- MODÜLLERİ ÇAĞIRIYORUZ ---
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
    window.dispatchEvent(new Event("user-change"));
    navigate("/login");
  };

  return (
    // pt-20: Navbar yüksekliği kadar boşluk (Navbar fixed olduğu için)
    <div className="min-h-screen flex bg-gray-100 font-sans ">
      
      {/* --- SIDEBAR (SOL MENÜ) --- */}
      {/* fixed: Sayfa kaydırılsa bile yerinde durur */}
      {/* top-20: Navbar'ın hemen altından başlar */}
      {/* h-[calc(100vh-80px)]: Ekranın kalanını tam kaplar */}
      <aside className="w-64 bg-slate-900 pt-4 text-white flex flex-col shadow-xl z-30 fixed h-full left-0 overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-slate-700">
        
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent" >
            Admin Panel
          </h2>
          <p className="text-xs text-gray-500 mt-1">Yönetim Merkezi</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarBtn 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")} 
            icon={<FiGrid />} 
            label="Genel Bakış" 
          />
          <SidebarBtn 
            active={activeTab === "applications"} 
            onClick={() => setActiveTab("applications")} 
            icon={<FiFileText />} 
            label="Başvurular" 
          />
          <SidebarBtn 
            active={activeTab === "users"} 
            onClick={() => setActiveTab("users")} 
            icon={<FiUsers />} 
            label="Kullanıcılar" 
          />
          <SidebarBtn 
            active={activeTab === "products"} 
            onClick={() => setActiveTab("products")} 
            icon={<FiPackage />} 
            label="Ürün Yönetimi" 
          />
          <SidebarBtn 
            active={activeTab === "orders"} 
            onClick={() => setActiveTab("orders")} 
            icon={<FiTruck />} 
            label="Siparişler" 
          />
          <SidebarBtn 
            active={activeTab === "coupons"} 
            onClick={() => setActiveTab("coupons")} 
            icon={<FiTag />} 
            label="Kuponlar" 
          />
          <SidebarBtn 
            active={activeTab === "reviews"} 
            onClick={() => setActiveTab("reviews")} 
            icon={<FiMessageSquare />} 
            label="Yorumlar" 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white py-3 rounded-xl text-sm font-bold transition border border-red-600/20"
          >
            <FiLogOut /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* --- SAĞ İÇERİK ALANI --- */}
      {/* ml-64: Sidebar kadar soldan boşluk bırakır */}
      <main className="flex-1 p-8 ml-64 w-full">
        <div className="max-w-7xl mx-auto animate-fade-in pb-20">
          {activeTab === "dashboard" && <AdminDashboard />}
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

// Yardımcı Buton Bileşeni
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