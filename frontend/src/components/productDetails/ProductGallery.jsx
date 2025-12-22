import { useState } from "react"; // useEffect silindi
import { FiHeart } from "react-icons/fi";

const ProductGallery = ({ product, isFav, toggleFavorite, t }) => {
  // Sadece kullanıcının manuel seçtiği resmi tutuyoruz. Başlangıçta NULL.
  const [selectedImage, setSelectedImage] = useState(null);

  // --- GÖRÜNTÜLENECEK RESMİ HESAPLAMA (Render Anında) ---
  // useEffect yerine, resmi anlık hesaplıyoruz. Bu çok daha hızlıdır.
  // 1. Kullanıcı seçtiyse -> selectedImage
  // 2. Seçmediyse -> Listenin ilk resmi
  // 3. O da yoksa -> Ana resim (img)
  // 4. Hiçbiri yoksa -> Placeholder
  const displayImage = selectedImage || 
                       (product?.imgs && product.imgs.length > 0 ? product.imgs[0] : product?.img) || 
                       "https://placehold.co/600";

  const displayStock = product?.stock;

  return (
    <div className="w-full lg:w-1/2 p-6 lg:p-8 bg-gray-50/50">
      
      {/* --- BÜYÜK ANA RESİM --- */}
      <div className="aspect-[4/3] w-full bg-white rounded-2xl overflow-hidden relative shadow-sm border border-gray-200 group mb-4">
        <img 
          src={displayImage} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
          alt={product?.title || "Product"} 
        />
        
        {displayStock <= 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
            <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-xl rotate-12 shadow-2xl border-4 border-white">
              {t('product.soldOut') || "SOLD OUT"}
            </span>
          </div>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            toggleFavorite(product._id);
          }} 
          className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition z-20"
        >
          <FiHeart className={isFav ? "fill-red-500 text-red-500 text-xl" : "text-gray-400 text-xl"} />
        </button>
      </div>

      {/* --- KÜÇÜK RESİMLER --- */}
      {product?.imgs && product.imgs.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scroll">
          {product.imgs.map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              onClick={() => setSelectedImage(img)} 
              className={`
                w-20 h-20 rounded-xl object-cover cursor-pointer border-2 transition 
                ${displayImage === img ? 'border-pink-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}
              `} 
              alt={`thumb-${idx}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;