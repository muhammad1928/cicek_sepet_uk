// 1. MODERN SPINNER (Tam Sayfa Geçişleri İçin)
export const LoadingSpinner = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center relative">
      {/* Dış Halka */}
      <div className="w-20 h-20 rounded-full border-4 border-pink-100 border-t-pink-600 animate-spin shadow-lg"></div>
      {/* Orta İkon */}
      <div className="absolute text-2xl animate-pulse drop-shadow-md">🌸</div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-md flex items-center justify-center transition-all duration-500 animate-fade-in">
        {content}
      </div>
    );
  }

  return <div className="py-20 flex justify-center w-full">{content}</div>;
};

// 2. İSKELET KART (HomePage Ürünleri İçin - GÜNCELLENDİ)
export const ProductSkeleton = () => {
  return (
    // Gerçek liste ile aynı Grid yapısı
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-fade-in">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div 
          key={i} 
          // Kart yüksekliği (h-[380px]) ve şekli (rounded-2xl) gerçek kartla aynı
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-[380px] flex flex-col relative"
        >
          
          {/* Resim Alanı İskeleti */}
          <div className="h-56 bg-gray-100 animate-pulse relative overflow-hidden">
            {/* Parlama Efekti (Shimmer) */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>

          {/* İçerik İskeleti */}
          <div className="p-4 flex-1 flex flex-col justify-between">
            
            {/* Başlık ve Açıklama */}
            <div className="space-y-3">
              <div className="h-6 bg-gray-100 rounded-lg w-3/4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded-lg w-full animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded-lg w-2/3 animate-pulse"></div>
              </div>
            </div>

            {/* Alt Kısım (Fiyat ve Buton) */}
            <div className="flex justify-between items-end mt-4">
              <div className="h-7 w-16 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-9 w-28 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>
          
          </div>
        </div>
      ))}
    </div>
  );
};

// 3. İSKELET TABLO (Sipariş Listeleri İçin)
export const TableSkeleton = () => {
  return (
    <div className="space-y-4 w-full animate-fade-in">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between gap-4 shadow-sm relative overflow-hidden">
          
          {/* Shimmer Efekti */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-50/50 to-transparent"></div>

          <div className="space-y-3 w-full md:w-1/3">
             <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
             <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></div>
          </div>
          <div className="h-10 w-24 bg-gray-100 rounded-lg animate-pulse self-end md:self-center"></div>
        </div>
      ))}
    </div>
  );
};