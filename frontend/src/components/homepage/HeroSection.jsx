import React from 'react';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-24 pb-12 text-center bg-gradient-to-b from-pink-50 via-white to-purple-100 px-4">
      <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight animate-fade-in drop-shadow-sm">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
          {t('home.heroTitle')}
        </span>
      </h1>
      <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto animate-fade-in delay-100 font-medium leading-relaxed">
        {t('home.heroSubtitle')}
      </p>
    </div>
  );
};

export default HeroSection;