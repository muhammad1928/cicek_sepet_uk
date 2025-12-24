// src/components/admin/AdmindashboardComponents/StatsGrid.jsx
import React from 'react';
import { FiUsers, FiShoppingBag, FiBox, FiActivity } from "react-icons/fi";

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600"
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
      <div className={`p-4 rounded-2xl text-2xl ${colors[color]} group-hover:scale-110 transition duration-300`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</p>
        <h4 className="text-2xl font-black text-gray-800">{value}</h4>
      </div>
    </div>
  );
};

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Toplam Kullanıcı" value={stats.totalUsers} icon={<FiUsers />} color="blue" />
      <StatCard title="Toplam Sipariş" value={stats.totalOrders} icon={<FiShoppingBag />} color="purple" />
      <StatCard title="Aktif Ürünler" value={stats.totalProducts} icon={<FiBox />} color="yellow" />
      <StatCard title="Toplam Ciro" value={`£${stats.totalRevenue.toLocaleString('en-GB')}`} icon={<FiActivity />} color="green" />
    </div>
  );
};

export default StatsGrid;