// src/components/admin/AdmindashboardComponents/UserAnalysisSection.jsx
import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import ChartContainer from './ChartContainer';

const UserAnalysisSection = ({ userRoleChartData, userGrowthChartData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartContainer title="Kullanıcı Rol Dağılımı">
         {userRoleChartData ? (
           <Doughnut data={userRoleChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
         ) : <p className="text-center text-gray-400 mt-10">Veri Yok</p>}
      </ChartContainer>

      <ChartContainer title="Yeni Kayıt Akışı">
         {userGrowthChartData ? (
           <Bar data={userGrowthChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
         ) : <p className="text-center text-gray-400 mt-10">Veri Yok</p>}
      </ChartContainer>
    </div>
  );
};

export default UserAnalysisSection;