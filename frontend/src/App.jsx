import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Router burada
import { CartProvider } from "./context/CartContext";
import { HelmetProvider } from "react-helmet-async";

// --- BİLEŞENLER ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartSidebar from "./components/cartSidebar";
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
import VerificationPending from "./pages/VerificationPending";
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
// VerifyEmailPage sayfasını da eklemeyi unutmayalım (Önceki adımlarda yapmıştık)
import VerifyEmailPage from "./pages/VerifyEmailPage"; 

function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        {/* TEK VE ANA ROUTER BURADA BAŞLAR */}
        <Router>
          <ScrollToTop /> {/* Sayfa değişince yukarı kaydırır */}
          
          <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans">
            <Navbar />
            <CartSidebar />
            <Toast />
            <Chatbot />
            
            {/* Navbar yüksekliği kadar boşluk (Navbar fixed olduğu için) */}
            <div className="flex-1 pt-10 relative z-0">
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
        {/* ROUTER BURADA BİTER */}
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;