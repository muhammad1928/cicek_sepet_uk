import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { HelmetProvider } from "react-helmet-async";

// --- BİLEŞENLER ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartSidebar from "./components/CartSidebar";
import Toast from "./components/Toast";
import Chatbot from "./components/Chatbot";
import ScrollToTop from "./components/ScrollToTop";

// --- SAYFALAR (MÜŞTERİ) ---
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
import VerifyEmailPage from "./pages/VerifyEmailPage";

// --- SAYFALAR (AUTH & SİSTEM) ---
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; // Varsa
import NotFoundPage from "./pages/NotFoundPage";

// --- SAYFALAR (KURUMSAL & YASAL) ---
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import LegalPage from "./pages/LegalPage";
import AboutPage from "./pages/AboutPage"; 

// --- SAYFALAR (İŞ ORTAKLIĞI & PANELLER) ---
import RegisterVendorPage from "./pages/RegisterVendorPage";
import RegisterCourierPage from "./pages/RegisterCourierPage";
import PartnerApplicationPage from "./pages/partner/PartnerApplicationPage";
import VendorPage from "./pages/partner/VendorPage";
import CourierPage from "./pages/partner/CourierPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <Router>
          <ScrollToTop /> 
          
          {/* DÜZELTME: 
             Flex yapısı ve z-index yönetimi ile içeriğin tıklanabilir olmasını sağla.
             relative ve z-0 içeriğin en altta kalmamasını sağlar.
          */}
          <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans relative z-0">
            
            {/* Navbar en üstte (z-50) */}
            <Navbar />
            
            {/* Sepet Sidebar ve Toast en en üstte (z-50 üzeri) */}
            <CartSidebar />
            <Toast />
            
            {/* Chatbot da üstte */}
            <Chatbot />
            
            {/* İÇERİK ALANI */}
            {/* pt-20: Navbar yüksekliği kadar boşluk (Navbar fixed olduğu için) */}
            <div className="flex-1 pt-10 relative z-0">
              <Routes>
                {/* MÜŞTERİ ROTALARI */}
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/store/:id" element={<StorePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verification-pending" element={<VerificationPending />} />
                
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/legal/:type" element={<LegalPage />} />
                <Route path="/about" element={<AboutPage />} />

                <Route path="/become-seller" element={<RegisterVendorPage />} />
                <Route path="/become-courier" element={<RegisterCourierPage />} />
                <Route path="/partner-application" element={<PartnerApplicationPage />} />
                <Route path="/verify/:token" element={<VerifyEmailPage />} />
                <Route path="/vendor" element={<VendorPage />} />
                <Route path="/courier" element={<CourierPage />} />
                <Route path="/admin" element={<AdminPage />} />

                <Route path="*" element={<NotFoundPage />} />
                
              </Routes>
            </div>
            
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;