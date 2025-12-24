// src/components/admin/AdmindashboardComponents/ChartContainer.jsx
import React from 'react';

const ChartContainer = ({ title, children, icon }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-80 flex flex-col">
    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
      {icon} {title}
    </h3>
    <div className="flex-1 relative">
      {children}
    </div>
  </div>
);

export default ChartContainer;