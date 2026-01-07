import { useState, useRef } from "react";
import { FiHeart } from "react-icons/fi";

const ProductGallery = ({ product, isFav, toggleFavorite, t }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const displayImage = selectedImage || 
                       (product?.imgs && product.imgs.length > 0 ? product.imgs[0] : product?.img) || 
                       "https://placehold.co/600";

  const displayStock = product?.stock;

  // --- NEBULA / PARALLAX EFFECT ---
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !imgRef.current) return;
    
    cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) - 0.5;
        const y = ((e.clientY - top) / height) - 0.5;
        
        // Resmi mouse'un tersine hafifçe kaydır (Object-contain olduğu için çok abartmıyoruz)
        imgRef.current.style.transform = `scale(1.05) translate(${-x * 30}px, ${-y * 30}px)`;
    });
  };

  const handleMouseLeave = () => {
    if (!imgRef.current) return;
    cancelAnimationFrame(rafRef.current);
    imgRef.current.style.transform = `scale(1.0) translate(0px, 0px)`;
  };

  return (
    <div className="w-full lg:w-1/2 p-4 lg:p-6 bg-gray-50/50 flex flex-col justify-center">
      
      {/* --- BÜYÜK ANA RESİM --- */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="h-[400px] lg:h-[600px] w-full bg-white rounded-2xl overflow-hidden relative shadow-sm border border-gray-100 group mb-4 flex items-center justify-center cursor-crosshair transform-gpu"
      >
        
        <img 
          ref={imgRef}
          src={displayImage} 
          loading="eager"
          className="max-w-full max-h-full object-contain p-4 transition-transform duration-500 ease-out will-change-transform z-10" 
          alt={product?.title || "Product"} 
        />
        
        {/* SOLD OUT BADGE */}
        {displayStock <= 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-30">
            <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-xl rotate-12 shadow-2xl border-4 border-white">
              {t('product.soldOut') || "SOLD OUT"}
            </span>
          </div>
        )}
        
        {/* FAVORİ BUTONU */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            toggleFavorite(product._id);
          }} 
          className="absolute top-4 right-4 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 transition z-30 group/heart"
        >
          <FiHeart className={isFav ? "fill-red-500 text-red-500 text-xl" : "text-gray-400 text-xl group-hover/heart:text-pink-500 transition-colors"} />
        </button>
      </div>

      {/* --- KÜÇÜK RESİMLER --- */}
      {product?.imgs && product.imgs.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scroll justify-center lg:justify-start px-1">
          {product.imgs.map((img, idx) => (
            <div 
                key={idx}
                className={`
                   relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 flex-shrink-0 bg-white shadow-sm
                   ${displayImage === img ? 'border-pink-500 ring-2 ring-pink-100 scale-105' : 'border-gray-100 opacity-70 hover:opacity-100 hover:border-pink-300'}
                `}
                onClick={() => setSelectedImage(img)}
            >
                <img 
                  src={img} 
                  className="w-full h-full object-contain p-1"
                  alt={`thumb-${idx}`}
                />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;