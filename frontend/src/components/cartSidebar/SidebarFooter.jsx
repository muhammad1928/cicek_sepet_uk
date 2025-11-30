import { FiLock } from "react-icons/fi";

const SidebarFooter = ({ 
    view, cartLength, couponApplied, couponCode, setCouponCode, discount, 
    handleApplyCoupon, setDiscount, setCouponApplied, setCouponData, couponData,
    totalPrice, discountAmount, deliveryFee, finalPrice, formData,
    handleCheckoutClick, isProcessing, isCheckoutReady, proceedToPayment
}) => {

  return (
    <div className="border-t bg-white p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-30">
      {view === "cart" && (
         <div className="mb-4">
           {!couponApplied ? (
             <div className="flex gap-2">
               <input type="text" placeholder="İndirim Kodu" className="flex-1 border-b-2 border-gray-200 p-2 text-sm uppercase outline-none focus:border-pink-500 bg-transparent font-bold tracking-wider" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
               <button onClick={handleApplyCoupon} className="text-sm font-bold text-pink-600 hover:text-pink-800 transition px-2">UYGULA</button>
             </div>
           ) : (
             <div className="flex justify-between items-center bg-green-50 p-3 rounded-xl border border-green-200 text-green-700 text-xs font-bold shadow-sm">
               <span>🎟️ {couponCode} (-%{discount}) {couponData?.includeDelivery && "+ Kargo Bedava"}</span>
               <button onClick={() => {setDiscount(0); setCouponApplied(false); setCouponCode(""); setCouponData(null);}} className="text-red-500 hover:underline">Kaldır</button>
             </div>
           )}
         </div>
      )}

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between text-gray-500"><span>Ara Toplam</span><span>£{totalPrice.toFixed(2)}</span></div>
        {couponApplied && <div className="flex justify-between text-green-600"><span>İndirim</span><span>-£{discountAmount.toFixed(2)}</span></div>}
        <div className="flex justify-between text-blue-600">
             <span>Teslimat ({formData.deliveryType === 'same-day' ? 'Premium' : formData.deliveryType === 'next-day' ? 'Hızlı' : 'Standart'})</span>
             <span>{deliveryFee === 0 ? "Ücretsiz" : `£${deliveryFee.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-xl font-extrabold text-gray-800 pt-2 border-t border-gray-100 mt-2"><span>Toplam</span><span className="text-pink-600">£{finalPrice.toFixed(2)}</span></div>
      </div>

      {view === "cart" ? (
        <button 
            type="button" 
            onClick={handleCheckoutClick} 
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition shadow-lg transform active:scale-95"
        >
            Sepeti Onayla
        </button>
      ) : (
        <button 
            type="button" // Formun dışındayız, o yüzden type=button. proceedToPayment elle çağrılır.
            onClick={proceedToPayment} 
            disabled={!isCheckoutReady || isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg transition transform flex justify-center items-center gap-2
               ${(!isCheckoutReady || isProcessing) ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:shadow-xl active:scale-95'}
            `}
        >
           {isProcessing ? "İşleniyor..." : !isCheckoutReady ? <span>Lütfen Bekleyin... <FiLock className="inline"/></span> : <><span>Öde ve Bitir</span> <span>💳</span></>}
        </button>
      )}
    </div>
  );
};

export default SidebarFooter;