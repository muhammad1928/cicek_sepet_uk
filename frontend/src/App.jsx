import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 
import { CartProvider } from "./context/CartContext";
import { HelmetProvider } from "react-helmet-async";
import axios from "axios"; 

// --- BİLEŞENLER (COMPONENTS) ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartSidebar from "./components/CartSidebar"; 
import Toast from "./components/Toast";
import Chatbot from "./components/Chatbot";
import ScrollToTop from "./components/ScrollToTop";
import CookieBanner from "./components/CookieBanner";
import VerificationPending from "./components/VerificationPending";

// --- SAYFALAR (PAGES) ---
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import LegalPage from "./pages/LegalPage";
import AboutPage from "./pages/AboutPage"; 

// Auth
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage"; 
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Kullanıcı Panelleri
import MyOrdersPage from "./pages/MyOrdersPage";
import FavoritesPage from "./pages/FavoritesPage";
import SuccessPage from "./pages/SuccessPage";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";

// İş Ortaklığı
import StorePage from "./pages/StorePage";
import RegisterVendorPage from "./pages/RegisterVendorPage";
import RegisterCourierPage from "./pages/RegisterCourierPage";
import PartnerApplicationPage from "./pages/partner/PartnerApplicationPage";
import VendorPage from "./pages/partner/VendorPage";
import CourierPage from "./pages/partner/CourierPage";

// Admin
import AdminPage from "./pages/AdminPage";
import AdminSystemLogs from "./components/admin/AdminSystemLogs"; 

axios.defaults.withCredentials = true;

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response, 
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("user-change"));
          if (window.location.pathname !== "/login") {
             window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

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
                {/* --- MÜŞTERİ ROTALARI --- */}
                <Route path="/" element={<HomePage />} />
                
                {/* YENİ: Search sonuçları için bu rota HomePage'i kullanacak */}
                <Route path="/products" element={<HomePage />} />

                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/store/:id" element={<StorePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verification-pending" element={<VerificationPending />} />
                <Route path="/verify/:token" element={<VerifyEmailPage />} />
                
                {/* --- KULLANICI ÖZEL --- */}
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* --- ŞİFRE İŞLEMLERİ --- */}
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                {/* --- KURUMSAL SAYFALAR --- */}
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/legal/:type" element={<LegalPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* --- İŞ ORTAKLIĞI --- */}
                <Route path="/become-seller" element={<RegisterVendorPage />} />
                <Route path="/become-courier" element={<RegisterCourierPage />} />
                <Route path="/partner-application" element={<PartnerApplicationPage />} />
                
                {/* --- PANELLER --- */}
                <Route path="/vendor" element={<VendorPage />} />
                <Route path="/courier" element={<CourierPage />} />
                
                {/* Admin Ana Paneli */}
                <Route path="/admin" element={<AdminPage />} />

                <Route 
                  path="/admin/logs" 
                  element={user && user.role === "admin" ? <AdminSystemLogs /> : <Navigate to="/" />} 
                />
                {/* --- 404 NOT FOUND --- */}
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