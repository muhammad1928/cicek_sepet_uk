import { FiChevronLeft, FiShoppingBag, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const SidebarHeader = ({ view, setView, cartCount, onClose, setShowClearConfirm }) => {
  const { t } = useTranslation();
  return (
    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
      <div className="flex items-center gap-3">
        {view === "checkout" && (
          <button onClick={() => setView("cart")} className="text-gray-500 hover:text-pink-600 transition text-xl">
            <FiChevronLeft />
          </button>
        )}
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {view === "cart" ? <><FiShoppingBag /> {t("cartSidebarComponents.sidebarHeader.myCart")} ({cartCount})</> : t("cartSidebarComponents.sidebarHeader.deliveryInfo")}
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        {view === "cart" && cartCount > 0 && (
            <button onClick={() => setShowClearConfirm(true)} className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition">{t("cartSidebarComponents.sidebarHeader.clear")}</button>
        )}
        <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl transition"><FiX /></button>
      </div>
    </div>
  );
};

export default SidebarHeader;