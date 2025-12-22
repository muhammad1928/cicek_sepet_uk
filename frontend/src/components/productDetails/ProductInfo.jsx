import { useState } from "react";
import { Link } from "react-router-dom";
import { FiInfo, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaStore, FaStar } from "react-icons/fa";
// DİKKAT: Veri yolunu kendi projenize göre kontrol edin (bir üst klasöre çıkış sayısı değişebilir)
import { CATEGORY_KEY_MAP } from "../../data/categoryData"; 

const ProductInfo = ({ product, t, displayTitle }) => {
  const [showAllTags, setShowAllTags] = useState(false);

  const getCatLabel = (key) => {
    const mappedKey = CATEGORY_KEY_MAP[key] || key;
    return t(`home.categories1.${mappedKey}`);
  };

  const isFood = ['edible', 'snack', 'chocolate', 'cake', 'cookies'].includes(product.category) || product.foodDetails?.ingredients?.length > 0;
  const vendorName = product.vendor?.username || "Fesfu Flowers UK";
  
  const visibleTags = showAllTags ? product.tags : product.tags?.slice(0, 3);
  const remainingTagsCount = (product.tags?.length || 0) - 3;

  return (
    <div className="flex flex-col">
      {/* Kategori ve Taglar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link to={`/?category=${product.category}`} className="bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-pink-200 transition">
          {getCatLabel(product.category)}
        </Link>
        
        <div className="w-px h-4 bg-gray-300 mx-1"></div>

        {visibleTags && visibleTags.map(tag => (
          <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-200 uppercase">
            {getCatLabel(tag)}
          </span>
        ))}

        {product.tags?.length > 3 && (
          <button 
            onClick={() => setShowAllTags(!showAllTags)}
            className="text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md transition"
          >
            {showAllTags ? <><FiChevronUp /> {t('common.showLess')}</> : <><FiChevronDown /> +{remainingTagsCount} {t('common.more')}</>}
          </button>
        )}
      </div>

      <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-3 mt-1 capitalize">{displayTitle}</h1>
      
      <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
          <FaStar /> <span className="font-bold text-gray-700">{product.averageRating || "New"}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaStore className="text-pink-500"/>
          {product.vendor ? (
            <Link to={`/store/${product.vendor._id}`} className="hover:text-pink-600 transition underline decoration-dotted font-bold text-gray-700">{vendorName}</Link>
          ) : (
            <span>{vendorName}</span>
          )}
        </div>
      </div>

      {isFood && product.foodDetails && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6 animate-fade-in">
          <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
            <FiInfo/> {t('admin.food.title')}
          </h4>
          {product.foodDetails.calories > 0 && <div className="text-sm text-orange-700 mb-1"><strong>{t('admin.food.calories')}:</strong> {product.foodDetails.calories} kcal</div>}
          {product.foodDetails.ingredients?.length > 0 && (
            <div className="text-sm text-orange-700 leading-relaxed">
              <strong>{t('admin.food.ingredients')}:</strong> {product.foodDetails.ingredients.join(", ")}
            </div>
          )}
        </div>
      )}

      <p className="text-gray-600 leading-relaxed mb-8 text-lg">{product.desc}</p>
    </div>
  );
};

export default ProductInfo;