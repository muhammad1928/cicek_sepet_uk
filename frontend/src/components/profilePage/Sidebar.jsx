import BadgeDisplay from "../BadgeDisplay";
import { FiBox, FiMapPin, FiUser, FiLogOut } from "react-icons/fi";

const Sidebar = ({ user, orderCount, activeTab, setActiveTab, onLogout }) => {
  
  const MenuButton = ({ tabName, icon, label }) => (
    <button 
      onClick={() => setActiveTab(tabName)} 
      className={`
        w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition flex items-center gap-3
        ${activeTab === tabName ? "bg-pink-600 text-white shadow-md shadow-pink-200" : "text-gray-600 hover:bg-gray-50"}
      `}
    >
      <span className="text-lg">{icon}</span> {label}
    </button>
  );

  return (
    <aside className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-fit shrink-0">
      
      {/* Profil Özeti */}
      <div className="p-8 border-b border-gray-100 text-center bg-gradient-to-b from-white to-pink-50/30">
        <div className="w-24 h-24 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-inner border-4 border-white relative">
          {user.fullName ? user.fullName[0].toUpperCase() : "U"}
          {orderCount >= 20 && <div className="absolute -top-2 -right-2 text-3xl animate-bounce" title="VIP Müşteri">👑</div>}
        </div>
        
        <h2 className="font-bold text-gray-800 text-xl mb-1">{user.fullName}</h2>
        <p className="text-xs text-gray-500 mb-4">{user.email}</p>
        
        <div className="flex justify-center">
          <BadgeDisplay user={user} orderCount={orderCount} />
        </div>
      </div>

      {/* Navigasyon */}
      <nav className="p-3 space-y-1">
        <MenuButton tabName="orders" icon={<FiBox />} label="Siparişlerim" />
        <MenuButton tabName="addresses" icon={<FiMapPin />} label="Adres Defteri" />
        <MenuButton tabName="info" icon={<FiUser />} label="Bilgilerim & Şifre" />
        
        <div className="pt-2 mt-2 border-t border-gray-100">
          <button 
            onClick={onLogout} 
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition flex items-center gap-3"
          >
            <FiLogOut className="text-lg" /> Çıkış Yap
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;