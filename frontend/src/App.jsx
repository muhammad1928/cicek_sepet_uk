import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./components/CartSidebar";
import Toast from "./components/Toast";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Footer from "./components/Footer"; // <--- 1. İMPORT

// ... Sayfa importları aynı ...
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CourierPage from "./pages/CourierPage";
import SuccessPage from "./pages/SuccessPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import VerifyPage from "./pages/VerifyPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VendorPage from "./pages/VendorPage";
import AboutPage from "./pages/AboutPage";
import RegisterVendorPage from "./pages/RegisterVendorPage"; 
import RegisterCourierPage from "./pages/RegisterCourierPage";
import PartnerApplicationPage from "./pages/PartnerApplicationPage";
import StorePage from "./pages/StorePage";

function App() {
  return (
    <CartProvider>
      <Router>
        
        {/* 2. FLEX YAPISI KURUYORUZ (Footer en alta yapışsın diye) */}
        <div className="flex flex-col min-h-screen">
          
          <Navbar />
          <CartSidebar />
          <Toast />
          <Chatbot />
          
          {/* 3. İÇERİK ALANI (Büyüyebildiği kadar büyüsün) */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/courier" element={<CourierPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/verify/:token" element={<VerifyPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/vendor" element={<VendorPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/become-seller" element={<RegisterVendorPage />} />
              <Route path="/become-courier" element={<RegisterCourierPage />} />
              <Route path="/partner-application" element={<PartnerApplicationPage />} />
              <Route path="/store/:vendorId" element={<StorePage />} />
            </Routes>
          </div>

          {/* 4. FOOTER EN ALTTA */}
          <Footer />

        </div>

      </Router>
    </CartProvider>
  );
}

export default App;