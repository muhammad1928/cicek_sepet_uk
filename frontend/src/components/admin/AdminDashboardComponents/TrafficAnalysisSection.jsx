// src/components/admin/AdmindashboardComponents/TrafficAnalysisSection.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { FiTrendingUp, FiMousePointer } from "react-icons/fi";
import ChartContainer from './ChartContainer';

const TrafficAnalysisSection = ({ trafficChartData, topProducts }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Trafik Grafiği */}
      <ChartContainer title="Haftalık Sistem Trafiği (Aksiyon)" icon={<FiTrendingUp className="text-green-500" />}>
         {trafficChartData ? (
           <Line data={trafficChartData} options={{ maintainAspectRatio: false }} />
         ) : <p className="text-center text-gray-400 mt-10">Veri Yok</p>}
      </ChartContainer>

      {/* En Çok İncelenen Ürünler Listesi */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
              <FiMousePointer className="text-pink-500" /> En Çok İncelenen Ürünler
            </h3>
          </div>
          <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
              {topProducts.map(([name, count], index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-pink-50 transition rounded-2xl group">
                      <div className="flex items-center gap-4">
                          <span className="w-8 h-8 bg-white border border-gray-200 text-gray-500 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
                            {index + 1}
                          </span>
                          <span className="font-bold text-gray-700 group-hover:text-pink-600 transition truncate max-w-[150px] lg:max-w-[200px]" title={name}>
                            {name}
                          </span>
                      </div>
                      <div className="text-right">
                        <div className="text-pink-600 font-black text-lg">{count}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Görüntülenme</div>
                      </div>
                  </div>
              ))}
              {topProducts.length === 0 && <p className="text-center py-10 text-gray-400 italic">Henüz ürün etkileşimi kaydedilmedi.</p>}
          </div>
      </div>
    </div>
  );
};

export default TrafficAnalysisSection;