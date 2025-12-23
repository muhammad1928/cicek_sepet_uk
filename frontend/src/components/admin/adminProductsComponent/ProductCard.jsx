import { useState } from "react";
import { FiEdit, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { userRequest } from "../../../requestMethods";
import { useCart } from "../../../context/CartContext";
import { CATEGORY_KEY_MAP } from "../../../data/categoryData";
import { useTranslation } from "react-i18next";

const ProductCard = ({ product, onEdit, onDelete, onToggleStatus, refreshProducts }) => {
  const { t } = useTranslation();

  const getCatLabel = (key) => {
    const mappedKey = CATEGORY_KEY_MAP[key] || key;
    return t(`home.categories1.${mappedKey}`);
  };

  const mainImage = (product.imgs && product.imgs.length > 0) ? product.imgs[0] : (product.img || "https://placehold.co/400");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition relative">
      <div className="absolute top-2 right-2 z-10">
         <button onClick={() => onToggleStatus(product)} className={`text-[10px] px-3 py-1 rounded-full font-bold shadow-sm ${product.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}>
            {product.isActive ? "Active" : "Passive"}
         </button>
      </div>
      <div className="h-40 bg-gray-100 relative">
        <img src={mainImage} className={`w-full h-full object-cover object-top transition duration-500 ${!product.isActive ? "grayscale" : "group-hover:scale-105"}`} alt={product.title} />
        <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow">
          {getCatLabel(product.category)}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">🏪 {product.vendor?.username}</div>
        <h4 className="font-bold text-gray-800 mb-1 truncate">{product.title}</h4>
        <div className="flex justify-between items-center mb-3"><span className="text-lg font-bold text-pink-600">£{product.price}</span></div>
        <div className="mt-auto pt-2 border-t border-gray-200 flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-gray-500 uppercase">STOCK</span>
          <QuickStockUpdate product={product} refresh={refreshProducts} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onEdit(product)} className="flex items-center justify-center gap-1 bg-blue-50 text-blue-600 text-xs py-2 rounded font-bold border border-blue-100 hover:bg-blue-100 transition"><FiEdit /> Edit</button>
          <button onClick={() => onDelete(product._id)} className="flex items-center justify-center gap-1 bg-red-50 text-red-600 text-xs py-2 rounded font-bold border border-red-100 hover:bg-red-100 transition"><FiTrash2 /> Delete</button>
        </div>
      </div>
    </div>
  );
};

const QuickStockUpdate = ({ product, refresh }) => {
  const [stock, setStock] = useState(product.stock);
  const [loading, setLoading] = useState(false);
  const { notify } = useCart();

  const handleUpdate = async () => {
    if (Number(stock) === product.stock) return;
    setLoading(true);
    try { 
        await userRequest.put(`/products/${product._id}`, { ...product, stock: Number(stock) }); 
        notify("Stock updated", "success"); 
        refresh(); 
    } 
    catch { notify("Error", "error"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-1">
      <input type="number" value={stock} onChange={e=>setStock(e.target.value)} className="w-12 p-1 border rounded text-center text-xs font-bold outline-none focus:border-pink-500 bg-gray-50" />
      <button onClick={handleUpdate} disabled={loading || Number(stock)===product.stock} className={`text-xs px-2 py-1 rounded font-bold transition ${Number(stock)!==product.stock ? "bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer" : "bg-gray-100 text-gray-300 cursor-default"}`}>
        {loading ? <FiRefreshCw className="animate-spin" /> : "✓"}
      </button>
    </div>
  );
};

export default ProductCard;