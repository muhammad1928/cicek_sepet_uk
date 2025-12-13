import React from "react";
import BadgeDisplay from "../BadgeDisplay";
import { ProductSkeleton } from "../Loading"; // İstediğiniz import eklendi
import { FiBox, FiMapPin, FiUser, FiLogOut } from "react-icons/fi";
import { useTranslation } from "react-i18next";

// Performans için MenuButton bileşeni dışarı alındı
const MenuButton = ({ tabName, icon, label, isActive, onClick }) => (
  <button
    onClick={() => onClick(tabName)}
    className={`
      w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition flex items-center gap-3
      ${
        isActive
          ? "bg-pink-600 text-white shadow-md shadow-pink-200"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }
    `}
  >
    <span className="text-lg">{icon}</span> {label}
  </button>
);

const Sidebar = ({ user, orderCount, activeTab, setActiveTab, onLogout }) => {
  const { t } = useTranslation();

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // Kullanıcı verisi henüz gelmediyse "ProductSkeleton" gösterilir.
  // Layout bozulmasın diye 'aside' container'ı korundu.
  // ---------------------------------------------------------------------------
  if (!user) {
    return (
      <aside className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-fit shrink-0 p-4">
        {/* Loading Component'iniz burada çağırılıyor */}
        <ProductSkeleton />
      </aside>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN CONTENT
  // ---------------------------------------------------------------------------
  
  // İsim baş harfi için güvenli erişim (Crash önleyici)
  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : "U";

  // Menü öğeleri yönetimi kolaylaştırmak için diziye alındı
  const menuItems = [
    { name: "orders", icon: <FiBox />, label: t("profilePage.userSidebar.myOrders") },
    { name: "addresses", icon: <FiMapPin />, label: t("profilePage.userSidebar.adressBook") },
    { name: "info", icon: <FiUser />, label: t("profilePage.userSidebar.informationPassword") },
  ];

  return (
    <aside className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-fit shrink-0 sticky top-4">
      
      {/* Profil Özeti */}
      <div className="p-8 border-b border-gray-100 text-center bg-gradient-to-b from-white to-pink-50/30">
        <div className="w-24 h-24 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-inner border-4 border-white relative">
          {initial}
          {/* VIP Badge Kontrolü */}
          {(orderCount || 0) >= 20 && (
            <div className="absolute -top-2 -right-2 text-3xl animate-bounce drop-shadow-md" title="VIP Müşteri">
              👑
            </div>
          )}
        </div>

        <h2 className="font-bold text-gray-800 text-xl mb-1">
          {user.fullName || "Misafir Kullanıcı"}
        </h2>
        <p className="text-xs text-gray-500 mb-4 font-medium">
          {user.email}
        </p>

        <div className="flex justify-center">
          <BadgeDisplay user={user} orderCount={orderCount || 0} />
        </div>
      </div>

      {/* Navigasyon */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => (
          <MenuButton
            key={item.name}
            tabName={item.name}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.name}
            onClick={setActiveTab}
          />
        ))}

        <div className="pt-2 mt-2 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition flex items-center gap-3 group"
          >
            <FiLogOut className="text-lg group-hover:translate-x-1 transition-transform" /> 
            {t("profilePage.userSidebar.logout")}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;