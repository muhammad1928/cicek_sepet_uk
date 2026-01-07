import { useRef, useState, useEffect } from 'react';

// dependencies parametresi: Bu değerler değişirse (örn: kategori değişirse) scroll durumunu tekrar kontrol et
export const useScrollContainer = (dependencies = []) => {
  const ref = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const checkScroll = () => {
    if (ref.current) {
        const { scrollLeft, scrollWidth, clientWidth } = ref.current;
        
        // Sol ok: Eğer en başta değilsek (scrollLeft > 0) göster
        // Hassasiyeti artırmak için 0 yerine 1-2px tolerans tanıdık
        setCanScrollLeft(scrollLeft > 2); 
        
        // Sağ ok: Eğer içerik ekrandan genişse VE sona gelmediysek göster
        // Math.ceil ve -1 toleransı ile 'pixel-perfect' hatalarını önledik
        const hasOverflow = scrollWidth > clientWidth;
        const isAtEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 1;
        
        setCanScrollRight(hasOverflow && !isAtEnd);
    }
  };

  // Bağımlılıklar değiştiğinde (örn: alt menü açıldığında) tekrar kontrol et
  useEffect(() => {
    checkScroll();
    
    // DOM'un render edilmesi bazen milisaniyeler sürer, garantiye almak için gecikmeli kontrol:
    const t1 = setTimeout(checkScroll, 50);
    const t2 = setTimeout(checkScroll, 300);

    window.addEventListener('resize', checkScroll);
    return () => {
        window.removeEventListener('resize', checkScroll);
        clearTimeout(t1);
        clearTimeout(t2);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]); // Burası önemli: Kategori değişince tetiklenir

  const scrollBy = (direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      // Kaydırma işlemi bittikten sonra okları güncelle (300ms animasyon süresi kadar bekle)
      setTimeout(checkScroll, 350);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };
  
  const handleMouseLeave = () => {
      setIsDragging(false);
  };
  
  const handleMouseUp = () => {
      setIsDragging(false);
      // Sürükleme bitince okları tekrar kontrol et
      checkScroll(); 
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2; // Kaydırma hızı çarpanı
    ref.current.scrollLeft = scrollLeft - walk;
    checkScroll();
  };

  return {
    ref,
    canScrollLeft,
    canScrollRight,
    isDragging,
    scrollBy,
    handlers: {
        onScroll: checkScroll, // Kullanıcı eliyle kaydırırsa da tetikle
        onMouseDown: handleMouseDown,
        onMouseLeave: handleMouseLeave,
        onMouseUp: handleMouseUp,
        onMouseMove: handleMouseMove
    }
  };
};