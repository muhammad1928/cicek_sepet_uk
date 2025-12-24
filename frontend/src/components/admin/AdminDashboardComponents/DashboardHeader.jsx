// src/components/admin/AdmindashboardComponents/DashboardHeader.jsx
import React from 'react';

const DashboardHeader = () => {
  return (
    <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-end">
      <div>
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Dashboard</h2>
        <p className="text-gray-500 text-sm">Gerçek zamanlı platform verileri ve kullanıcı analizi.</p>
      </div>
      <div className="text-xs font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> CANLI AKIŞ AKTİF
      </div>
    </div>
  );
};

export default DashboardHeader;