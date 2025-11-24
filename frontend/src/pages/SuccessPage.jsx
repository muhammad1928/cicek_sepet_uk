import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart, notify } = useCart();
  const [isProcessing, setIsProcessing] = useState(true);

  // URL'den session_id'yi alabiliriz ama basitlik için
  // Sepetteki (cart) veriyi localStorage'da geçici tuttuğumuzu varsayarak
  // (Veya CartContext kaybolmamışsa) siparişi oluşturacağız.
  
  // NOT: Gerçek bir projede Stripe Webhook kullanılır ama bu MVP için
  // Müşteri bu sayfaya düştüyse ödeme yapmış sayıyoruz.

  useEffect(() => {
    const createOrder = async () => {
      // Sepet boşsa veya zaten işlendiyse dur
      const storedCart = JSON.parse(localStorage.getItem("tempOrderData"));
      
      if (!storedCart) {
        navigate("/");
        return;
      }

      try {
        // SİPARİŞİ KAYDET (Backend'e Gönder)
        await axios.post("http://localhost:5000/api/orders", storedCart);
        
        notify("Ödeme Başarılı! Siparişiniz alındı 🌸", "success");
        clearCart(); // Context sepetini temizle
        localStorage.removeItem("tempOrderData"); // Geçici veriyi sil
        setIsProcessing(false);
        
      } catch (err) {
        console.log(err);
        notify("Sipariş kaydedilirken hata oluştu. Lütfen bizimle iletişime geçin.", "error");
      }
    };

    createOrder();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 font-sans p-4 text-center">
      <Seo 
        title="Sipariş Alındı" 
        noindex={true} 
      />
      {isProcessing ? (
        <div className="text-2xl font-bold text-green-700 animate-pulse">Siparişiniz Onaylanıyor...</div>
      ) : (
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg animate-fade-in-up">
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Teşekkürler!</h1>
          <p className="text-gray-600 text-lg mb-8">
            Ödemeniz başarıyla alındı. Çiçekleriniz en kısa sürede hazırlanıp yola çıkacak.
          </p>
          <button 
            onClick={() => navigate("/my-orders")}
            className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-green-700 transition shadow-lg hover:shadow-green-500/30"
          >
            Siparişlerimi Gör
          </button>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;