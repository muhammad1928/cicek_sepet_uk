import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Confetti from "react-confetti"; // <-- EKLENDİ

const SuccessPage = () => {
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearCart, notify } = useCart();
  const navigate = useNavigate();
  
  // Çift işlem olmasın diye ref kullanıyoruz (React 18+ Strict Mode için)
  const processedRef = useRef(false);

  useEffect(() => {
    const createOrder = async () => {
      if (processedRef.current) return; // Zaten işlendiyse dur
      
      // 1. Geçici veriyi al
      const data = localStorage.getItem("tempOrderData");
      
      if (!data) {
        setLoading(false);
        return; // Veri yoksa (belki kullanıcı direkt linke tıkladı) işlem yapma
      }

      processedRef.current = true; // İşlendi olarak işaretle

      try {
        const orderData = JSON.parse(data);
        
        // 2. Backend'e kaydet
        const res = await axios.post("http://localhost:5000/api/orders", orderData);
        
        if (res.status === 200) {
          setOrderId(res.data.order._id);
          
          // 3. Temizlik
          clearCart(); // Context'teki sepeti boşalt
          localStorage.removeItem("tempOrderData"); // Geçici veriyi sil
          notify("Siparişiniz başarıyla alındı! 🎉", "success");
        }
      } catch (err) {
        console.error(err);
        notify("Sipariş kaydedilirken bir sorun oluştu. Lütfen destek ile iletişime geçin.", "error");
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 font-sans p-4 pt-20 relative overflow-hidden">
      
      {/* Konfeti Efekti (Başarılıysa) */}
      {!loading && orderId && (
        <Confetti 
          width={window.innerWidth} 
          height={window.innerHeight} 
          recycle={false} 
          numberOfPieces={300} 
        />
      )}

      <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-lg w-full border-t-8 border-green-500 animate-fade-in-up relative z-10">
        
        {loading ? (
          <div className="py-10">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-600">Ödemeniz Doğrulanıyor...</h2>
            <p className="text-sm text-gray-400">Siparişiniz oluşturuluyor, lütfen bekleyin.</p>
          </div>
        ) : orderId ? (
          <>
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner animate-bounce">
              ✓
            </div>
            
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Teşekkürler!</h1>
            <p className="text-gray-600 text-lg font-medium">Siparişiniz Başarıyla Alındı.</p>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6 mb-8 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Sipariş Numarası</p>
              <p className="text-2xl font-mono font-bold text-pink-600 tracking-widest">#{orderId.slice(-8).toUpperCase()}</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => navigate("/my-orders")} 
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg transform active:scale-95"
              >
                Siparişimi Takip Et
              </button>
              <button 
                onClick={() => navigate("/")} 
                className="w-full text-gray-500 font-bold hover:text-gray-800 transition text-sm py-2"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </>
        ) : (
          <div className="py-10">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800">Bir Sorun Oluştu</h2>
            <p className="text-gray-600 mt-2 mb-6">Sipariş verisi bulunamadı veya ödeme tamamlanamadı.</p>
            <button onClick={() => navigate("/")} className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-pink-700 transition">Alışverişe Dön</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SuccessPage;