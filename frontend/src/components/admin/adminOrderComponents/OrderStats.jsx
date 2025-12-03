import { FiDollarSign, FiClock, FiAlertCircle, FiCheckCircle, FiTrendingDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const OrderStats = ({ stats, setStatusFilter }) => {
  const { t } = useTranslation();
  
  // Ortak Kart Stili (Tıklanabilir olması için cursor-pointer ekledik)
  const cardClass = "p-5 rounded-2xl shadow-sm border flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition cursor-pointer active:scale-95";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      
      {/* 1. Ciro (Tıklayınca Filtreyi Temizle - Tümü) */}
      <div 
        onClick={() => setStatusFilter("Tümü")}
        className={`${cardClass} bg-white border-gray-200`}
      >
        <div className="absolute right-0 bottom-0 text-indigo-50 opacity-50 group-hover:scale-110 transition duration-500"><FiDollarSign size={80}/></div>
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl z-10"><FiDollarSign size={24}/></div>
        <div className="z-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('adminComponents.adminOrderComp.OrderStats.revenue')}</p>
          <p className="text-2xl font-extrabold text-gray-800">£{stats.totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* 2. Bekleyen (Tıklayınca 'Sipariş Alındı' filtrele) */}
      {/* Not: Bekleyenler genelde 'Sipariş Alındı' veya 'Hazırlanıyor'dur. İlk aşamayı seçiyoruz. */}
      <div 
        onClick={() => setStatusFilter("Sipariş Alındı")}
        className={`${cardClass} bg-white border-gray-200`}
      >
        <div className="absolute right-0 bottom-0 text-yellow-50 opacity-50 group-hover:scale-110 transition duration-500"><FiClock size={80}/></div>
        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl z-10"><FiClock size={24}/></div>
        <div className="z-10">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('adminComponents.adminOrderComp.OrderStats.waiting')}</p>
           <p className="text-2xl font-extrabold text-gray-800">{stats.pendingCount}</p>
        </div>
      </div>

      {/* 3. İptal Talebi VEYA Zarar (Duruma göre değişen kart) */}
      {stats.totalLoss > 0 ? (
        <div 
          onClick={() => setStatusFilter("Zarar Edenler")} 
          className={`${cardClass} bg-white border-red-100`}
          title="Zarar edenleri filtrele"
        >
           <div className="absolute right-0 bottom-0 text-red-50 opacity-50 group-hover:scale-110 transition duration-500"><FiTrendingDown size={80}/></div>
           <div className="p-3 bg-red-100 text-red-600 rounded-xl z-10"><FiTrendingDown size={24}/></div>
           <div className="z-10">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">{t('adminComponents.adminOrderComp.OrderStats.promoCost')}</p>
              <p className="text-2xl font-extrabold text-red-600">-£{stats.totalLoss.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
           </div>
        </div>
      ) : (
        <div 
          onClick={() => setStatusFilter("İptal Talebi")}
          className={`${cardClass} ${stats.cancelRequestCount > 0 ? 'bg-orange-50 border-orange-200 animate-pulse-slow' : 'bg-white border-gray-200'}`}
        >
          <div className={`absolute right-0 bottom-0 opacity-50 group-hover:scale-110 transition duration-500 ${stats.cancelRequestCount > 0 ? 'text-orange-200' : 'text-gray-100'}`}><FiAlertCircle size={80}/></div>
          <div className={`p-3 rounded-xl z-10 ${stats.cancelRequestCount > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}><FiAlertCircle size={24}/></div>
          <div className="z-10">
             <p className={`text-xs font-bold uppercase tracking-wider ${stats.cancelRequestCount > 0 ? 'text-orange-800' : 'text-gray-400'}`}>{t('adminComponents.adminOrderComp.OrderStats.cancelRequest')}</p>
             <p className={`text-2xl font-extrabold ${stats.cancelRequestCount > 0 ? 'text-orange-600' : 'text-gray-800'}`}>{stats.cancelRequestCount}</p>
          </div>
        </div>
      )}

      {/* 4. Tamamlanan (Tıklayınca 'Teslim Edildi' filtrele) */}
      <div 
        onClick={() => setStatusFilter("Teslim Edildi")}
        className={`${cardClass} bg-white border-gray-200`}
      >
        <div className="absolute right-0 bottom-0 text-green-50 opacity-50 group-hover:scale-110 transition duration-500"><FiCheckCircle size={80}/></div>
        <div className="p-3 bg-green-100 text-green-600 rounded-xl z-10"><FiCheckCircle size={24}/></div>
        <div className="z-10">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('adminComponents.adminOrderComp.OrderStats.completed')}</p>
           <p className="text-2xl font-extrabold text-gray-800">{stats.completedCount}</p>
        </div>
      </div>

    </div>
  );
};

export default OrderStats;