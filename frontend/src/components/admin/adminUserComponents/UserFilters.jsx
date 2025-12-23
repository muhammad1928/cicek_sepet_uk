import { FiFilter, FiSearch, FiRefreshCw } from "react-icons/fi";

const UserFilters = ({ 
  totalUsers, 
  filterRole, 
  setFilterRole, 
  searchTerm, 
  setSearchTerm, 
  onRefresh, 
  loading 
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 top-20 z-20 sticky">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        Kullanıcılar <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{totalUsers}</span>
      </h2>

      <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
        {/* Filtre */}
        <div className="relative">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)} 
            className="pl-9 pr-4 py-2 border rounded-lg w-full md:w-40 outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer"
          >
            <option value="all">Tüm Roller</option>
            <option value="customer">Müşteriler</option>
            <option value="vendor">Satıcılar</option>
            <option value="courier">Kuryeler</option>
            <option value="admin">Yöneticiler</option>
          </select>
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Arama */}
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="İsim veya E-posta..." 
            className="pl-9 pr-4 py-2 border rounded-lg w-full outline-none focus:border-blue-500" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Yenile */}
        <button 
          onClick={onRefresh} 
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 flex items-center gap-2 transition" 
          disabled={loading}
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> {loading ? "..." : "Yenile"}
        </button>
      </div>
    </div>
  );
};

export default UserFilters;