import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiHeart, FiLogOut, FiLoader } from "react-icons/fi"; // FiLoader ekledik
import { FaStore, FaMotorcycle, FaUserShield } from "react-icons/fa";

const UserActions = ({ user, handleLogout }) => {
  const { t } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Loading state

  const onLogoutClick = async () => {
      setIsLoggingOut(true);
      // Kullanıcıya hissettirmek için minimal gecikme (isteğe bağlı)
      // await new Promise(resolve => setTimeout(resolve, 500)); 
      
      // Asıl logout fonksiyonunu çağır
      await handleLogout(); 
      // isLoggingOut(false) yapmaya gerek yok çünkü sayfa yönlenecek/yenilenecek
  };

  const userInitial = user?.fullName ? user.fullName[0].toUpperCase() : user?.username ? user.username[0].toUpperCase() : "U";

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium">
        <Link to="/login" className="text-gray-600 hover:text-pink-600 transition px-3 py-1 hover:bg-gray-50 rounded-lg">{t('navbar.login')}</Link>
        <span className="text-gray-300">|</span>
        <Link to="/register" className="text-gray-600 hover:text-pink-600 transition px-2">{t('navbar.register')}</Link>
      </div>
    );
  }

  return (
    <>
      <Link 
        to="/profile" 
        className="group relative w-9 h-9 flex items-center justify-center rounded-full bg-pink-100 border border-pink-200 text-pink-600 font-bold text-sm shadow-sm transition-all duration-500 ease-out hover:bg-pink-600 hover:text-white hover:border-pink-600 hover:shadow-md hover:scale-105 hover:brightness-110 active:scale-90 active:bg-pink-700"
        title={t('navbar.myAccount')}
      >
        {userInitial}
      </Link>
      {user.role === "admin" && <Link to="/admin" className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded-full transition"><FaUserShield className="text-xl" /></Link>}
      {user.role === "vendor" && <Link to="/vendor" className="text-pink-600 hover:text-pink-800 hover:bg-pink-50 p-2 rounded-full transition"><FaStore className="text-xl" /></Link>}
      {user.role === "courier" && <Link to="/courier" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition"><FaMotorcycle className="text-xl" /></Link>}

      <Link to="/favorites" className="relative group p-2 flex items-center justify-center">
        <FiHeart className="text-2xl text-gray-400 absolute transition-all duration-300 group-hover:opacity-0 group-hover:scale-75 group-hover:blur-sm" />
        <svg stroke="url(#heart-gradient)" fill="url(#heart-gradient)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-2xl opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110 heart-anim" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop stopColor="#db2777" offset="0%" /><stop stopColor="#9333ea" offset="100%" /></linearGradient></defs>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </Link>
      
      <button 
        onClick={onLogoutClick} 
        disabled={isLoggingOut}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoggingOut ? <FiLoader className="text-xl animate-spin text-red-500" /> : <FiLogOut className="text-xl" />}
      </button>
    </>
  );
};

export default UserActions;