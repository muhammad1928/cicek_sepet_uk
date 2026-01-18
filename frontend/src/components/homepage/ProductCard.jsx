import React from "react";
import { FaRegHeart, FaHeart, FaStore } from "react-icons/fa";
import { FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProductCard = ({ 
  product, 
  cartItem, 
  isFav, 
  toggleFavorite, 
  handleAddToCart, 
  handleDecrease, 
  handleIncrease, 
  handleInput, 
  maxAlertProd,
  decodeHtml,
  getCatLabel,
  index 
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  let vendorName = product.vendor?.fullName || product.vendor?.username || "Fesfu Flowers UK";
  vendorName = decodeHtml(vendorName);
  const cleanTitle = decodeHtml(product.title);

  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)} 
      className="
        relative 
        aspect-[4/5] 
        bg-gray-100 
        rounded-xl sm:rounded-[1.5rem] 
        shadow-sm hover:shadow-2xl 
        transition-all duration-500 
        border border-gray-200 
        overflow-hidden 
        group 
        flex flex-col 
        cursor-pointer 
        hover:-translate-y-1 
        animate-fade-in-up 
        transform-gpu
      " 
      style={{ 
        animationDelay: `${index * 0.05}s`
      }}
    >
      {/* --- TAM EKRAN RESİM --- */}
      {/* Zoom efekti (scale) ve transition tamamen kaldırıldı. Resim sabit. */}
      <img 
        src={product.img || "https://placehold.co/400"} 
        alt={cleanTitle} 
        loading="lazy"   
        decoding="async" 
        className="
            absolute inset-0 w-full h-full 
            object-cover object-center 
            z-0
        "
      />
        
      {/* --- SOL ÜST: KATEGORİ ETİKETİ --- */}
      {product.category && (
        <div className="absolute top-3 left-3 z-20">
          <div className="
            relative 
            bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-600
            px-3 py-1 
            rounded-md 
            shadow-[0_4px_12px_rgba(0,0,0,0.3)] 
            border-t border-white/40 border-b border-yellow-800/20
            text-[9px] sm:text-[10px] 
            font-black 
            uppercase 
            tracking-[0.2em] 
            text-white 
            drop-shadow-sm
          ">
            {getCatLabel(product.category)}
          </div>
        </div>
      )}

      {/* --- SAĞ ÜST: FAVORİ BUTONU --- */}
      <button 
        onClick={(e) => toggleFavorite(e, product._id)} 
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 w-7 h-7 sm:w-10 sm:h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition group/heart"
      >
        <span className={`text-sm sm:text-xl transition ${isFav ? "scale-110 text-red-500 drop-shadow-sm" : "scale-100 text-gray-600 group-hover/heart:text-red-400"}`}>
          {isFav ? <FaHeart/> : <FaRegHeart/>}
        </span>
      </button>

      {/* --- ALT PANEL --- */}
      <div className="
            absolute bottom-0 left-0 right-0 z-10 
            bg-white/60 backdrop-blur-lg border-t border-white/20
            px-3 sm:px-4 pb-3 sm:pb-4 pt-3
            flex flex-col justify-end 
            /* Varsayılan (İniş): 1.3s | Hover (Çıkış): 0.7s */
            transition-all ease-in-out duration-[1300ms] group-hover:duration-[700ms]
      ">
        
        {/* 1. KISIM: BAŞLIK VE SATICI */}
        <div>
            <div className="text-[7px] sm:text-[9px] text-gray-700 font-bold uppercase tracking-wider mb-1 flex items-center gap-1 opacity-80">
              <FaStore className="text-gray-600 text-[8px]" /> 
              <span className="truncate">{vendorName}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 truncate leading-tight group-hover:text-pink-800 transition-colors drop-shadow-sm" title={cleanTitle}>
                {cleanTitle}
              </h3>

              {cartItem && cartItem.quantity > 0 && (
                 <span className="ml-2 bg-pink-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-fade-in lg:group-hover:hidden">
                    x{cartItem.quantity}
                 </span>
              )}
            </div>
        </div>
        
        {/* 2. KISIM: FİYAT VE BUTONLAR */}
        <div className="
            overflow-hidden 
            /* Varsayılan (Kapanış/İniş): 1.3s */
            transition-all ease-in-out duration-[1300ms]
            max-h-24 opacity-100 mt-2
            
            /* Desktop Başlangıç (Gizli) */
            lg:max-h-0 lg:opacity-0 lg:mt-0
            
            /* Desktop Hover (Açılış/Çıkış): 0.7s */
            lg:group-hover:duration-[700ms] 
            lg:group-hover:max-h-24 lg:group-hover:opacity-100 lg:group-hover:mt-2
        ">
          
          <div className="flex flex-row justify-between items-center gap-2 pt-1">
            <div className="flex flex-col">
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 drop-shadow-sm">
                  £{product.price}
                </span>
            </div>
            
            {!cartItem ? (
              <button 
                onClick={(e) => handleAddToCart(e, product)} 
                className="bg-gray-900/90 hover:bg-pink-600 text-white border border-transparent px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 group/btn shrink-0 backdrop-blur-sm"
              >
                <FiShoppingCart className="text-sm group-hover/btn:animate-bounce"/> 
                <span>{t('common.addToCart') || 'Add'}</span>
              </button>
            ) : (
              <div className="flex items-center bg-white/40 border-2 border-pink-200/50 backdrop-blur-md rounded-lg sm:rounded-xl overflow-hidden shadow-sm h-8 sm:h-10 w-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                 <button onClick={(e) => handleDecrease(e, product, cartItem.quantity)} className="w-8 sm:w-10 h-full flex items-center justify-center text-gray-800 hover:text-pink-700 hover:bg-white/50 transition font-bold">
                   <FiMinus size={14} />
                 </button>
                 <div className="h-full flex items-center justify-center border-x border-pink-100/30 px-1 min-w-[1.5rem]">
                  {maxAlertProd === product._id ? (
                    <span className="text-red-600 text-[9px] sm:text-[10px] font-black animate-pulse px-1">MAX</span>
                  ) : (
                    <input type="number" value={cartItem.quantity} onClick={(e) => e.stopPropagation()} onChange={(e) => handleInput(e, product)} className="w-8 text-center font-black text-pink-800 bg-transparent outline-none text-sm appearance-none" />
                  )}
                 </div>
                 <button onClick={(e) => handleIncrease(e, product)} className="w-8 sm:w-10 h-full flex items-center justify-center text-gray-800 hover:text-pink-700 hover:bg-white/50 transition font-bold">
                   <FiPlus size={14} />
                 </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;