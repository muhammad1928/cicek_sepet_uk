import { FaMedal, FaStar, FaUserShield, FaMotorcycle, FaStore, FaCrown, FaGem, FaLeaf } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const BadgeDisplay = ({ user, orderCount = 0 }) => {
  const { t } = useTranslation();
  if (!user) return null;

  const badges = [];

  // --- 1. ROL ROZETLERİ (Kimlik) ---
  if (user.role === 'admin') {
    badges.push({ icon: <FaUserShield />, label: t('badgeDisplay.admin'), color: "bg-purple-100 text-purple-600 border-purple-200" });
  }
  if (user.role === 'courier') {
    badges.push({ icon: <FaMotorcycle />, label: t('badgeDisplay.courier'), color: "bg-blue-100 text-blue-600 border-blue-200" });
  }
  if (user.role === 'vendor') {
    badges.push({ icon: <FaStore />, label: t('badgeDisplay.vendor'), color: "bg-pink-100 text-pink-600 border-pink-200" });
  }

  // --- 2. KIDEM ROZETLERİ (Zaman) ---
  const joinDate = new Date(user.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - joinDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  if (diffDays < 30) {
    badges.push({ icon: <FaLeaf />, label: `${t('badgeDisplay.newUser')} 🌱`, color: "bg-green-50 text-green-600 border-green-200" });
  } else if (diffDays > 365) {
    badges.push({ icon: <FaMedal />, label: t('badgeDisplay.year1User'), color: "bg-yellow-100 text-yellow-700 border-yellow-300" });
  } else if (diffDays > 365 * 3) {
    badges.push({ icon: <FaStar />, label: t('badgeDisplay.loyalUser'), color: "bg-orange-100 text-orange-600 border-orange-200" });
  }else if (diffDays > 365 * 5) {
    badges.push({ icon: <FaStar />, label: t('badgeDisplay.gigachad'), color: "bg-orange-100 text-orange-600 border-orange-200" });
  }

  // --- 3. AKTİVİTE ROZETLERİ (Sipariş Sayısı) ---
  // Sadece Müşteriler için
  if (user.role === 'customer') {
    if (orderCount >= 1) {
      badges.push({ icon: "🛍️", label: t('badgeDisplay.firstOrder'), color: "bg-gray-100 text-gray-600 border-gray-200" });
    }
    if (orderCount >= 5) {
      badges.push({ icon: "🥉", label: t('badgeDisplay.fifthOrder'), color: "bg-orange-50 text-orange-800 border-orange-200" });
    }
    if (orderCount >= 10) {
      badges.push({ icon: "🥈", label: t('badgeDisplay.tenthOrder'), color: "bg-gray-200 text-gray-700 border-gray-300" });
    }
    if (orderCount >= 20) {
      badges.push({ icon: "🥇", label: t('badgeDisplay.twentyfifthOrder'), color: "bg-yellow-200 text-yellow-800 border-yellow-400" });
    }
    if (orderCount >= 50) {
      badges.push({ icon: <FaCrown />, label: t('badgeDisplay.fiftythOrder'), color: "bg-purple-600 text-white border-purple-700 shadow-md" });
    }
    if (orderCount >= 100) {
      badges.push({ icon: <FaGem />, label: t('badgeDisplay.100thOrder'), color: "bg-blue-500 text-white border-blue-600 shadow-lg animate-pulse" });
    }
  }

  // --- 4. SATICI ROZETLERİ (Satış Sayısına Göre - Opsiyonel) ---
  // orderCount burada satıcı için "tamamlanan sipariş" olarak da kullanılabilir
  if (user.role === 'vendor') {
     if (orderCount > 50) badges.push({ icon: "🏆", label: t('badgeDisplay.bestSeller'), color: "bg-red-100 text-red-600 border-red-200" });
     if (orderCount > 100) badges.push({ icon: "🌟", label: t('badgeDisplay.starStore'), color: "bg-yellow-100 text-yellow-600 border-yellow-300" });
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4 justify-center animate-fade-in">
      {badges.map((b, i) => (
        <span 
          key={i} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm transition hover:scale-105 cursor-help ${b.color}`}
          title={b.label}
        >
          <span className="text-sm">{b.icon}</span> {b.label}
        </span>
      ))}
    </div>
  );
};

export default BadgeDisplay;