import { FiPlus, FiX, FiSearch } from "react-icons/fi";
// AdminPanelHeader'ın yolu: admin/adminProductsComponent -> admin -> components -> adminComponents
import AdminPanelHeader from "../../adminComponents/AdminPanelHeader"; 

const ProductFilters = ({ 
  productsCount, 
  searchTerm, 
  setSearchTerm, 
  showForm, 
  onToggleForm 
}) => {
  return (
    <AdminPanelHeader title="Products Management" count={productsCount}>
      <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
        <div className="relative">
             <input 
                type="text" 
                placeholder="Search..." 
                className="px-4 py-2 pl-9 border rounded-lg w-full md:w-64 outline-none focus:border-pink-500" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
             />
             <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        </div>
        
        <button 
            onClick={onToggleForm} 
            className={`px-4 py-2 rounded-lg font-bold text-white flex items-center gap-1 transition ${showForm ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"}`}
        >
          {showForm ? <><FiX /> Close</> : <><FiPlus /> Add New</>}
        </button>
      </div>
    </AdminPanelHeader>
  );
};

export default ProductFilters;