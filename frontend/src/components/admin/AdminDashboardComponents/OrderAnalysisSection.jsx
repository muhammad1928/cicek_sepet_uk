// src/components/admin/AdmindashboardComponents/OrderAnalysisSection.jsx
import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import ChartContainer from './ChartContainer';

const OrderAnalysisSection = ({ statusChartData, revenueChartData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartContainer title="Sipariş Durum Dağılımı">
         {statusChartData ? (
           <Doughnut data={statusChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
         ) : <p className="text-center text-gray-400 mt-10">Veri Yok</p>}
      </ChartContainer>

      <ChartContainer title="Son 7 Günlük Ciro (£)">
         {revenueChartData ? (
           <Line data={revenueChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
         ) : <p className="text-center text-gray-400 mt-10">Veri Yok</p>}
      </ChartContainer>
    </div>
  );
};

export default OrderAnalysisSection;