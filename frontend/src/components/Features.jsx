import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiTruck, FiShield, FiGift, FiClock } from 'react-icons/fi';

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      id: 1,
      icon: <FiClock className="text-xl sm:text-3xl text-pink-500" />,
      title: t('features.title1', 'Hızlı Teslimat'),
      desc: t('features.desc1', '18:00\'e kadar sipariş verin.'),
      bg: "bg-pink-50 border-pink-100"
    },
    {
      id: 2,
      icon: <FiShield className="text-xl sm:text-3xl text-purple-500" />,
      title: t('features.title2', 'Güvenli Ödeme'),
      desc: t('features.desc2', '256-bit SSL Koruması'),
      bg: "bg-purple-50 border-purple-100"
    },
    {
      id: 3,
      icon: <FiGift className="text-xl sm:text-3xl text-yellow-500" />,
      title: t('features.title3', 'Özel Paket'),
      desc: t('features.desc3', 'Her sipariş hediye gibidir.'),
      bg: "bg-yellow-50 border-yellow-100"
    },
    {
      id: 4,
      icon: <FiTruck className="text-xl sm:text-3xl text-blue-500" />,
      title: t('features.title4', 'Canlı Takip'),
      desc: t('features.desc4', 'Kuryenizi izleyin.'),
      bg: "bg-blue-50 border-blue-100"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
      
      {/* Scrollbar'ı gizlemek için inline style */}
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* MOBİL: Flex + overflow-x-auto (Yatay Kaydırma)
         MASAÜSTÜ: Grid (4 Sütun)
      */}
      <div className="
        flex overflow-x-auto gap-3 pb-2 hide-scroll snap-x snap-mandatory
        sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0
      ">
        {features.map((item) => (
          <div 
            key={item.id} 
            className={`
              /* MOBİL BOYUTLARI */
              min-w-[100px] w-[28%] flex-shrink-0 snap-center
              
              /* MASAÜSTÜ BOYUTLARI */
              sm:w-auto sm:min-w-0

              /* ORTAK STİLLER */
              ${item.bg} border 
              rounded-xl sm:rounded-2xl 
              p-3 sm:p-5 
              flex flex-col items-center text-center sm:items-start sm:text-left 
              shadow-sm hover:shadow-md 
              transition-all duration-300
              backdrop-blur-sm bg-opacity-90
              justify-center sm:justify-start
            `}
          >
            {/* İkon */}
            <div className="bg-white p-2 sm:p-3 rounded-full shadow-sm mb-2 sm:mb-3">
                {item.icon}
            </div>
            
            {/* Başlık */}
            <h3 className="font-bold text-gray-900 text-[10px] sm:text-lg mb-0 sm:mb-1 leading-tight whitespace-nowrap sm:whitespace-normal">
              {item.title}
            </h3>
            
            {/* Açıklama (Sadece Tablet/Masaüstü) */}
            <p className="text-sm text-gray-500 font-medium hidden sm:block">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;