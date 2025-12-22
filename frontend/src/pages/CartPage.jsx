import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag, FiShield, FiCreditCard, FiCheckCircle } from "react-icons/fi";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart(); // Context'ten gelen veriler
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Kargo ücreti mantığı (Örnek: 50£ üzeri bedava)
  const shippingCost = cartTotal > 50 ? 0 : 4.99;
  const finalTotal = cartTotal + shippingCost;

  // Sayfa açıldığında en üste kaydır
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- BOŞ SEPET DURUMU ---
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <Seo title="My Cart | Fesfu UK" description="View your shopping cart." />
        
        <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[2.5rem] shadow-2xl border border-white/60 max-w-lg w-full">
          <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FiShoppingBag className="text-4xl text-pink-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">{t("cart.emptyTitle") || "Your Cart is Empty"}</h2>
          <p className="text-gray-500 mb-8 text-lg leading-relaxed">
            {t("cart.emptySub") || "Looks like you haven't added anything to your cart yet. Discover our fresh flowers and gifts!"}
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-pink-500/30 transition transform hover:-translate-y-1 w-full"
          >
            {t("cart.startShopping") || "Start Shopping"} <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  // --- DOLU SEPET ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white font-sans pt-28 pb-20 px-4">
      <Seo title="My Cart | Fesfu UK" description="Review your items and proceed to checkout." />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
             {t("cart.title") || "Shopping Cart"}
          </span>
          <span className="text-lg font-medium text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            {cart.length} {t("common.items") || "Items"}
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* --- SOL TARA: ÜRÜN LİSTESİ --- */}
          <div className="flex-1 space-y-6">
            {cart.map((item, index) => {
               // Resim kontrolü (placeholder)
               const itemImg = item.img || (item.imgs && item.imgs[0]) || "https://placehold.co/150";
               
               return (
                <div key={`${item._id}-${index}`} className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-white/60 flex flex-col sm:flex-row items-center gap-6 hover:shadow-xl transition duration-300 group">
                  
                  {/* Resim */}
                  <div className="w-full sm:w-32 h-32 shrink-0 bg-gray-50 rounded-2xl overflow-hidden relative">
                    <img src={itemImg} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  </div>

                  {/* Bilgiler */}
                  <div className="flex-1 text-center sm:text-left w-full">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-gray-900 text-lg leading-tight">
                         <Link to={`/product/${item._id}`} className="hover:text-pink-600 transition">{item.title}</Link>
                       </h3>
                       <button onClick={() => removeFromCart(item._id, item.variant)} className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full">
                         <FiTrash2 className="text-xl" />
                       </button>
                    </div>

                    {/* Varyant Bilgisi (Varsa) */}
                    {item.variant && (
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2 justify-center sm:justify-start">
                        {item.variant.size && <span className="bg-gray-100 px-2 py-1 rounded">Size: {item.variant.size}</span>}
                        {item.variant.color && <span className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1">Color: <span className="w-3 h-3 rounded-full border border-gray-300" style={{backgroundColor: item.variant.color}}></span></span>}
                      </div>
                    )}

                    {/* Fiyat ve Miktar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                      <div className="flex items-center bg-gray-100 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1, item.variant)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-pink-600 font-bold transition disabled:opacity-50" disabled={item.quantity <= 1}><FiMinus/></button>
                        <span className="w-10 text-center font-bold text-gray-800">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1, item.variant)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-pink-600 font-bold transition"><FiPlus/></button>
                      </div>
                      
                      <div className="text-xl font-black text-gray-900">
                        £{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
               );
            })}
          </div>

          {/* --- SAĞ TARAF: ÖZET KARTI --- */}
          <div className="w-full lg:w-96 shrink-0">
             <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-white/60 sticky top-28">
                <h2 className="text-2xl font-black text-gray-900 mb-6">{t("cart.orderSummary") || "Order Summary"}</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-600">
                    <span>{t("cart.subtotal") || "Subtotal"}</span>
                    <span className="font-bold">£{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t("cart.shipping") || "Shipping"}</span>
                    <span className="font-bold">{shippingCost === 0 ? <span className="text-green-500">FREE</span> : `£${shippingCost}`}</span>
                  </div>
                  {shippingCost > 0 && (
                     <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg text-center">
                        Add <strong>£{(50 - cartTotal).toFixed(2)}</strong> more for free shipping!
                     </div>
                  )}
                  <div className="h-px bg-gray-100 my-2"></div>
                  <div className="flex justify-between text-2xl font-black text-gray-900">
                    <span>{t("cart.total") || "Total"}</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">£{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate("/checkout")} // Ödeme sayfasına yönlendirir (henüz yoksa oluşturacağız)
                  className="w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-pink-200 bg-gradient-to-r from-pink-600 to-purple-600 text-white flex items-center justify-center gap-2 hover:shadow-2xl hover:-translate-y-1 transition duration-300"
                >
                  {t("cart.checkout") || "Proceed to Checkout"} <FiArrowRight />
                </button>

                {/* Güvenlik Rozetleri */}
                <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-gray-400 font-bold uppercase tracking-wider text-center">
                   <div className="flex flex-col items-center gap-2 bg-gray-50 p-3 rounded-xl">
                      <FiShield className="text-xl text-purple-500" /> Secure
                   </div>
                   <div className="flex flex-col items-center gap-2 bg-gray-50 p-3 rounded-xl">
                      <FiCheckCircle className="text-xl text-green-500" /> Guaranteed
                   </div>
                </div>
                
                <div className="mt-6 text-center">
                   <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                     <FiCreditCard /> We accept all major cards
                   </p>
                </div>

             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;