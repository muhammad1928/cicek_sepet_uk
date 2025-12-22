import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import { CartProvider } from "./context/CartContext";
import { HelmetProvider } from "react-helmet-async";
import axios from "axios"; // Axios importu gerekli


// --- BİLEŞENLER ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartSidebar from "./components/CartSidebar"; // index.jsx'i otomatik alır
import Toast from "./components/Toast";
import Chatbot from "./components/Chatbot";
import ScrollToTop from "./components/ScrollToTop";
import CookieBanner from "./components/CookieBanner";

// --- SAYFALAR ---
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import FavoritesPage from "./pages/FavoritesPage";
import SuccessPage from "./pages/SuccessPage";
import ProfilePage from "./pages/ProfilePage";
import VerificationPending from "./components/VerificationPending";
import StorePage from "./pages/StorePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import LegalPage from "./pages/LegalPage";
import AboutPage from "./pages/AboutPage"; 
import RegisterVendorPage from "./pages/RegisterVendorPage";
import RegisterCourierPage from "./pages/RegisterCourierPage";
import PartnerApplicationPage from "./pages/partner/PartnerApplicationPage";
import VendorPage from "./pages/partner/VendorPage";
import CourierPage from "./pages/partner/CourierPage";
import AdminPage from "./pages/AdminPage";
import VerifyEmailPage from "./pages/VerifyEmailPage"; 
import CartPage from "./pages/CartPage";

// Bu ayar, tüm isteklerde (login, refresh, sync-favorites vb.) 
// tarayıcının cookie'leri backend'e otomatik göndermesini sağlar.
axios.defaults.withCredentials = true;

function App() {

  // --- YENİ: AXIOS INTERCEPTOR (GÜVENLİK BEKÇİSİ) ---
  useEffect(() => {
    // Her gelen yanıtı (response) dinle
    const interceptor = axios.interceptors.response.use(
      (response) => response, // Başarılıysa devam et
      (error) => {
        // Eğer hata 401 (Unauthorized) veya 403 (Forbidden) ise
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          
          // 1. Mevcut oturumu sil
          localStorage.removeItem("user");
          
          // 2. Navbar'ı güncelle (Olay tetikle)
          window.dispatchEvent(new Event("user-change"));

          // 3. Eğer kullanıcı zaten Login sayfasında değilse, Login'e at
          if (window.location.pathname !== "/login") {
             window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    // Temizlik (Unmount)
    return () => axios.interceptors.response.eject(interceptor);
  }, []);
  // ---------------------------------------------------

  return (
    <HelmetProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          
          <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans relative z-0">
            <Navbar />
            <CartSidebar />
            <Toast />
            <Chatbot />
            
            <div className="flex-1 pt-8 relative z-0">
              <Routes>
                {/* Müşteri Rotaları */}
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/store/:id" element={<StorePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verification-pending" element={<VerificationPending />} />
                <Route path="/verify/:token" element={<VerifyEmailPage />} />
                
                {/* Kullanıcı Özel */}
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Şifre İşlemleri */}
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                {/* Kurumsal */}
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/legal/:type" element={<LegalPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* İş Ortaklığı */}
                <Route path="/become-seller" element={<RegisterVendorPage />} />
                <Route path="/become-courier" element={<RegisterCourierPage />} />
                <Route path="/partner-application" element={<PartnerApplicationPage />} />
                
                {/* Paneller */}
                <Route path="/vendor" element={<VendorPage />} />
                <Route path="/courier" element={<CourierPage />} />
                <Route path="/admin" element={<AdminPage />} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
            
            <Footer />
            <CookieBanner />
            
          </div>
        </Router>
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;