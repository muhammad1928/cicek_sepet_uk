import React from 'react';
import { FiChevronRight } from "react-icons/fi";

const CategoryButton = ({ item, isActive, onClick, activeGroup, t }) => {
  // Eğer item bir ana grup ise kendi temasını kullan, değilse üst grubun temasını kullan
  const theme = item.theme || activeGroup?.theme || {
     border: 'border-gray-100',
     hoverBorder: 'hover:border-gray-300',
     iconBg: 'bg-gray-100',
     text: 'text-gray-600',
     activeRing: 'ring-gray-200'
  };

  const gradient = item.activeGradient || activeGroup?.activeGradient || 'from-gray-500 to-slate-500';
  const itemColor = item.itemColor || activeGroup?.itemColor || 'text-gray-600';

  return (
    <button
        onClick={onClick}
        className={`
            group relative flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm md:text-base font-bold transition-all duration-300 select-none flex-shrink-0 overflow-hidden
            border backdrop-blur-sm
            ${isActive
                ? `bg-gradient-to-r ${gradient} text-white shadow-lg shadow-pink-500/30 scale-105 border-transparent ring-2 ring-offset-1 ring-white`
                : `bg-white/50 hover:bg-white ${theme.border} text-slate-600 ${theme.hoverBorder} hover:shadow-md hover:-translate-y-0.5`
            }
        `}
    >
        {/* Hover Gradient Background (Sadece Pasifken) */}
        {!isActive && (
             <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
        )}

        {/* Shine Effect (Sadece Aktifken) */}
        {isActive && <div className="animate-shine-effect rounded-full"></div>}
        
        <div className={`
            w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors duration-300
            ${isActive ? "bg-white/20 text-white" : `${theme.iconBg} ${theme.text} group-hover:scale-110`}
        `}>
            {item.icon}
        </div>

        <span className={`relative z-10 whitespace-nowrap ${!isActive ? 'group-hover:text-gray-900' : ''}`}>
            {t(item.label)}
        </span>

        {item.isGroup && (
             <FiChevronRight className={`ml-1 opacity-50 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        )}
    </button>
  );
};

export default CategoryButton;