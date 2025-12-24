import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartContainer from './ChartContainer';
import { FiSearch } from "react-icons/fi";

const SearchAnalysisSection = ({ searchChartData, topSearchTerms }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* 1. Grafiksel Gösterim (Yatay Bar) */}
      <ChartContainer title="En Sık Aranan Kelimeler (Grafik)" icon={<FiSearch className="text-purple-500" />}>
         {searchChartData ? (
           <Bar 
             data={searchChartData} 
             options={{ 
               indexAxis: 'y', // Yatay grafik yapar
               maintainAspectRatio: false, 
               plugins: { legend: { display: false } },
               scales: { x: { beginAtZero: true, grid: { display: false } } }
             }} 
           />
         ) : <p className="text-center text-gray-400 mt-10">Veri Yok</p>}
      </ChartContainer>

      {/* 2. Liste Gösterimi */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 flex items-center gap-2">
            <FiSearch className="text-purple-500" /> Popüler Arama Terimleri
          </h3>
          <div className="space-y-4">
              {topSearchTerms.map(([term, count], index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-white text-purple-600 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                            {index + 1}
                          </span>
                          <span className="font-bold text-gray-700 capitalize">"{term}"</span>
                      </div>
                      <div className="text-purple-600 font-bold text-sm">{count} kez</div>
                  </div>
              ))}
              {topSearchTerms.length === 0 && (
                <p className="text-center py-10 text-gray-400 italic">Henüz arama kaydı yok.</p>
              )}
          </div>
      </div>
    </div>
  );
};

export default SearchAnalysisSection;