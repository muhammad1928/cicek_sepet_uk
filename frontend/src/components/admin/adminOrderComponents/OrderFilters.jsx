import { FiSearch, FiFilter } from "react-icons/fi";

const OrderFilters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
  const statusOptions = ["Sipariş Alındı", "Hazırlanıyor", "Hazır", "Yola Çıktı", "Teslim Edildi", "İptal"];

  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3 justify-between items-center mb-6">
      
      {/* Arama */}
      <div className="relative w-full md:w-80">
         <input 
           type="text" 
           placeholder="Sipariş No veya Alıcı Ara..." 
           className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 shadow-sm focus:bg-white focus:border-pink-500 outline-none transition text-sm" 
           value={searchTerm} 
           onChange={(e) => setSearchTerm(e.target.value)}
         />
         <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Filtre */}
      <div className="flex items-center gap-2 w-full md:w-auto">
         <FiFilter className="text-gray-400"/>
         <select 
           className={`p-2.5 rounded-xl border bg-gray-50 outline-none focus:border-pink-500 cursor-pointer font-bold text-gray-700 text-sm w-full md:w-auto ${statusFilter === 'Zarar Edenler' ? 'border-red-400 text-red-600 bg-red-50' : 'border-gray-300'}`} 
           value={statusFilter} 
           onChange={e => setStatusFilter(e.target.value)}
         >
           <option value="Tümü">Tüm Durumlar</option>
           <option value="Zarar Edenler">📉 Zarar Edenler (İndirimli)</option>
           <option value="İptal Talebi">⚠️ İptal Talepleri</option>
           {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
         </select>
      </div>
    </div>
  );
};

export default OrderFilters;