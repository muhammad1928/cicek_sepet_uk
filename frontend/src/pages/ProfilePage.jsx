import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useCart } from "../context/CartContext";
import { userRequest } from "../requestMethods";
// Bileşenler
import BadgeDisplay from "../components/BadgeDisplay";
import Sidebar from "../components/profilePage/Sidebar";
// import OrderHistory from "../components/profilePage/OrderHistory";
import AddressBook from "../components/profilePage/AddressBook";
import UserInfo from "../components/profilePage/UserInfo";
import MyOrdersPage from "./MyOrdersPage"; // Gömülü Sipariş Sayfası
import { useTranslation } from "react-i18next";




const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Lazy initialization - useEffect yerine direkt useState içinde
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [activeTab, setActiveTab] = useState("orders");
  const [orderCount, setOrderCount] = useState(0);

  // User yoksa login'e yönlendir
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Order count'u çek
  useEffect(() => {
    if (!user) return;
    
    const fetchCount = async () => {
      try {
        const res = await userRequest.get(`/orders/find/${user._id}`);
        setOrderCount(res.data.length);
      } catch (err) {
        console.error("Order count fetch error:", err);
      }
    };
    fetchCount();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("user-change"));
    navigate("/login");
  };

  if (!user) return null;

  return (
    // --- MODERN ARKAPLAN ---
    <div className="min-h-screen bg-gray-100 font-sans pt-10 pb-20 px-4 relative overflow-hidden">
      
      {/* Dekoratif Arka Plan (Hafif ve Göz Yormayan) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-pink-100/40 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="mb-8">
           <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">{t("profile.title")}</h1>
           <p className="text-gray-500 text-sm mt-2">{t("profile.profileGreetings")}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* --- SOL MENÜ (STICKY) --- */}
          <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-28">
            <Sidebar user={user} orderCount={orderCount} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
            
            {/* Rozetler */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mt-4">
              <h3 className="text-sm font-bold text-gray-500 mb-2 text-center">{t("profile.badges")}</h3>
              <BadgeDisplay user={user} orderCount={orderCount} />
            </div>
          </div>

          {/* --- SAĞ İÇERİK --- */}
          <main className="flex-1 w-full min-w-0">
            
            {/* Sekme İçeriği (Fade Animasyonu ile Gelir) */}
            <div className="animate-fade-in-up pt-3">
                {activeTab === "orders" && (
                    // MyOrdersPage zaten kendi içinde kart yapısına sahip olduğu için ekstra karta gerek yok
                    <MyOrdersPage isEmbedded={true} />
                )}
                
                {activeTab === "addresses" && (
                    <div className="bg-white rounded-3xl shadow-xl border border-white/50 p-1">
                       <AddressBook user={user} />
                    </div>
                )}
                
                {activeTab === "info" && (
                    <div className="bg-white rounded-3xl shadow-xl border border-white/50 p-1">
                       <UserInfo user={user} />
                    </div>
                )}
            </div>

          </main>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;