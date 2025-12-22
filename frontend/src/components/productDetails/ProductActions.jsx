import { FiMinus, FiPlus, FiShoppingCart, FiAlertCircle } from "react-icons/fi";
import { FaCheckCircle, FaTruck } from "react-icons/fa";

const ProductActions = ({ 
  product, 
  t, 
  selectedVariant, 
  handleVariantSelect, 
  quantity, 
  handleQuantityChange, 
  handleAddToCart, 
  errorMsg 
}) => {
  
  const hasVariants = product.variants && product.variants.length > 0;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;

  return (
    <>
      {hasVariants && (
        <div className="mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-inner">
          <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            {t('product.options')} <span className="text-pink-600">*</span>
          </h4>
          <div className="flex flex-wrap gap-3">
            {product.variants.map((variant, idx) => {
              const isSelected = selectedVariant === variant;
              const hasStock = variant.stock > 0;
              return (
                <button
                  key={idx}
                  disabled={!hasStock}
                  onClick={() => handleVariantSelect(variant)}
                  className={`
                    px-4 py-3 rounded-xl border text-sm font-bold transition flex flex-col items-center min-w-[80px] relative overflow-hidden
                    ${isSelected ? 'border-pink-600 bg-white text-pink-700 ring-2 ring-pink-100 shadow-md transform scale-105' : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300 hover:bg-pink-50'}
                    ${!hasStock ? 'opacity-50 cursor-not-allowed bg-gray-100 grayscale' : ''}
                  `}
                >
                  <span className="text-base">{variant.size}</span>
                  <span className="text-[10px] font-normal opacity-75 uppercase">{variant.color}</span>
                  {!hasStock && <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 text-red-500 text-[10px] font-black rotate-12 border-2 border-red-500/20">SOLD</div>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-bold animate-shake border border-red-100 shadow-sm">
          <FiAlertCircle className="text-xl shrink-0"/> {errorMsg}
        </div>
      )}

      <div className="mt-auto">
        <div className="flex items-end gap-3 mb-6">
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            £{product.price}
          </span>
          {displayStock > 0 && displayStock < 5 && (
            <span className="text-xs text-red-600 font-bold mb-2 animate-bounce bg-red-100 px-2 py-1 rounded border border-red-200">
              Hurry! Only {displayStock} left
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3 sm:w-1/3 border border-transparent hover:border-gray-300 transition">
            <button onClick={() => handleQuantityChange("dec")} className="text-gray-500 hover:text-pink-600 transition disabled:opacity-30 p-2" disabled={quantity <= 1}><FiMinus /></button>
            <span className="font-bold text-xl w-8 text-center text-gray-800">{quantity}</span>
            <button onClick={() => handleQuantityChange("inc")} className="text-gray-500 hover:text-pink-600 transition disabled:opacity-30 p-2" disabled={quantity >= displayStock}><FiPlus /></button>
          </div>

          <button 
            onClick={handleAddToCart} 
            disabled={displayStock <= 0}
            className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition transform active:scale-95 ${displayStock > 0 ? "bg-gradient-to-r from-gray-900 to-black text-white hover:shadow-2xl hover:-translate-y-1" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          >
            <FiShoppingCart className="text-xl" /> 
            {displayStock > 0 ? (t("product.addToCart")) : (t("product.outOfStock"))}
          </button>
        </div>
        
        <div className="flex gap-6 mt-8 text-[11px] text-gray-400 font-bold uppercase tracking-widest justify-center sm:justify-start border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2"><FaCheckCircle className="text-green-500 text-lg"/> Secure Payment</div>
          <div className="flex items-center gap-2"><FaTruck className="text-blue-500 text-lg"/> Fast Delivery</div>
        </div>
      </div>
    </>
  );
};

export default ProductActions;