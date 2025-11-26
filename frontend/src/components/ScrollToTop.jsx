import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Tarayıcının otomatik scroll hatırlama özelliğini KAPAT
    // Bu sayede F5 atıldığında tarayıcı aşağıya indirmeye çalışmaz.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Sayfa değiştiğinde veya yüklendiğinde tepeye çık
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;