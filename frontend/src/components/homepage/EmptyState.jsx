import React from 'react';
import { useTranslation } from 'react-i18next';

const EmptyState = ({ searchParam }) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center items-center py-16 animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 sm:p-12 text-center max-w-lg w-full relative overflow-hidden">
        <div className="mb-6 flex justify-center">
          <span className="text-6xl drop-shadow-sm filter">🌸</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4 tracking-tight">
          {t('home.greatFlowersComing', 'Great Flowers Are Coming!')}
        </h3>
        <p className="text-gray-500 text-base leading-relaxed font-medium">
          {searchParam 
            ? t('home.searchNotFoundDesc', 'We couldn\'t find exactly what you\'re looking for, but our designers are preparing fresh gifts just for you.')
            : t('home.categoryEmptyDesc', 'This collection was so loved that it sold out! Our designers are currently preparing the most special products and fresh gifts just for you.')
          }
        </p>
      </div>
    </div>
  );
};

export default EmptyState;