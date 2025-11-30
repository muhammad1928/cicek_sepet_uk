import React from 'react';
import { FiRefreshCw } from "react-icons/fi";
const PageHeader = ({ 
  title, 
  count, 
  countLabel,
  countColor = "orange",
  onRefresh, 
  refreshLabel = "Yenile",
  showRefresh = true,
  children // Sağ tarafta özel içerik için
}) => {
  const countColorClasses = {
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    pink: "bg-pink-100 text-pink-600",
    red: "bg-red-100 text-red-600"
  };

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 whitespace-nowrap">
        {title}
        {count !== undefined && (
          <span className={`ml-2 text-sm ${countColorClasses[countColor]} px-2 py-1 rounded-full`}>
            {countLabel || count}
          </span>
        )}
      </h2>
      
      {/* Eğer children varsa onu göster, yoksa refresh butonunu göster */}
      {children ? (
        children
      ) : (
        showRefresh && onRefresh && (
          <button 
            onClick={onRefresh} 
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-2 transition">
              <FiRefreshCw /> {refreshLabel}

          </button>
        )
      )}
    </div>
  );
};

export default PageHeader;