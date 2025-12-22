import { useEffect, useState } from "react"; // State gerekebilir
import { FiTruck, FiCalendar } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { REGIONS } from "../../data/regions"; // Yeni bölge verisini çekiyoruz

const CheckoutForm = ({ 
  formData, handleInputChange, 
  savedAddresses, handleAddressSelect, 
  user, saveAddress, setSaveAddress,
  errors, todayStr, getAvailableTimeSlots,
  priceAfterDiscount, PRICES
}) => {
  const { t } = useTranslation();
  
  // Stil sınıfı
  const inputClass = (name) => `w-full p-3 border rounded-xl outline-none transition text-sm ${errors[name] ? "border-red-500 bg-red-50 animate-shake" : "border-gray-200 focus:border-pink-500 focus:bg-white bg-gray-50"}`;

  const currentHour = new Date().getHours();

  // --- BÖLGE MANTIĞI ---
  // Sadece aktif olan ülkeleri filtrele
  const activeCountries = REGIONS.filter(r => r.isActive);
  
  // Şu an seçili ülkeye göre aktif şehirleri bul
  // (formData.country, "United Kingdom" gibi string geliyor varsayıyoruz)
  const currentRegion = REGIONS.find(r => r.name === formData.country) || activeCountries[0];
  const availableCities = currentRegion?.cities.filter(c => c.isActive) || [];

  return (
    <form id="checkout-form" className="space-y-6 animate-fade-in">
      
      {/* 1. İLETİŞİM (GÖNDERİCİ) */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">1. {t("cartSidebarComponents.CheckoutForm.contact")}</h3>
        <div className="space-y-3">
          <input name="senderName" value={formData.senderName} onChange={handleInputChange} className={inputClass("senderName")} placeholder={t("cartSidebarComponents.CheckoutForm.nameSurname")} />
          <div className="grid grid-cols-2 gap-3">
              <input name="senderPhone" value={formData.senderPhone} onChange={handleInputChange} className={inputClass("senderPhone")} placeholder={t("cartSidebarComponents.CheckoutForm.phoneNumber")} />
              <input name="senderEmail" value={formData.senderEmail} onChange={handleInputChange} className={inputClass("senderEmail")} placeholder={t("cartSidebarComponents.CheckoutForm.emailAddress")} />
          </div>
        </div>
      </div>

      {/* 2. ALICI & ADRES (GÜNCELLENDİ) */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-3">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">2. {t("cartSidebarComponents.CheckoutForm.recipientAddress")}</h3>
           {savedAddresses.length > 0 && (
              <select onChange={handleAddressSelect} className="text-xs border-b border-pink-300 text-pink-600 bg-transparent outline-none cursor-pointer font-bold py-1 max-w-[150px]">
                <option value="">📍 {t("cartSidebarComponents.CheckoutForm.savedAddressSelect")}</option>
                {savedAddresses.map((addr, i) => (<option key={i} value={i}>{addr.title}</option>))}
              </select>
           )}
        </div>
        
        <div className="space-y-3">
          {/* Alıcı Adı / Tel */}
          <div className="grid grid-cols-2 gap-3">
              <input name="recipientName" value={formData.recipientName} onChange={handleInputChange} className={inputClass("recipientName")} placeholder={t("cartSidebarComponents.CheckoutForm.recipientName")} />
              <input name="recipientPhone" value={formData.recipientPhone} onChange={handleInputChange} className={inputClass("recipientPhone")} placeholder={t("cartSidebarComponents.CheckoutForm.recipientPhone")} />
          </div>

          {/* Ülke ve Şehir (KİLİTLİ/OTOMATİK SEÇİM) */}
          <div className="grid grid-cols-2 gap-3">
             <div className="relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Country</label>
                <select 
                    name="country" 
                    value={formData.country} 
                    onChange={handleInputChange} 
                    disabled={activeCountries.length === 1} // Tek seçenek varsa kilitle
                    className={`${inputClass("country")} appearance-none bg-gray-100 cursor-not-allowed`}
                >
                    {activeCountries.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
             </div>
             <div className="relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">City</label>
                <select 
                    name="city" 
                    value={formData.city} 
                    onChange={handleInputChange}
                    disabled={availableCities.length === 1} // Tek seçenek varsa kilitle
                    className={`${inputClass("city")} appearance-none bg-gray-100 cursor-not-allowed`}
                >
                    {availableCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
             </div>
          </div>

          {/* Sokak ve Posta Kodu */}
          <div className="grid grid-cols-3 gap-3">
             <div className="col-span-1">
                <input name="postcode" value={formData.postcode} onChange={handleInputChange} className={inputClass("postcode")} placeholder={t("cartSidebarComponents.CheckoutForm.deliveryPostcode") || "Postcode"} />
             </div>
             <div className="col-span-2">
                <input name="street" value={formData.street} onChange={handleInputChange} className={inputClass("street")} placeholder={t("cartSidebarComponents.CheckoutForm.street") || "Street Name"} />
             </div>
          </div>

          {/* Bina / Kat / Daire (YENİ DETAYLAR) */}
          <div className="grid grid-cols-3 gap-3">
             <input name="buildingNo" value={formData.buildingNo} onChange={handleInputChange} className={inputClass("buildingNo")} placeholder={t("cartSidebarComponents.CheckoutForm.buildingNo") || "Building No"} />
             <input name="floor" value={formData.floor} onChange={handleInputChange} className={inputClass("floor")} placeholder={t("cartSidebarComponents.CheckoutForm.floor") || "Floor (Opt)"} />
             <input name="apartment" value={formData.apartment} onChange={handleInputChange} className={inputClass("apartment")} placeholder={t("cartSidebarComponents.CheckoutForm.apartment") || "Flat No (Opt)"} />
          </div>
          
          {user && (
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="saveAddr" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="accent-pink-600 w-4 h-4 cursor-pointer" />
              <label htmlFor="saveAddr" className="text-xs font-bold text-gray-600 cursor-pointer select-none">{t("cartSidebarComponents.CheckoutForm.saveAdress")}</label>
            </div>
          )}
        </div>
      </div>

      {/* 3. TESLİMAT & ZAMAN (MEVCUT YAPI) */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">3. {t("cartSidebarComponents.CheckoutForm.deliveryOptions")}</h3>
        
        {/* Kargo Tipi */}
        <div className="space-y-2 mb-4">
              <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${formData.deliveryType==='standart' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                    <input type="radio" name="deliveryType" value="standart" checked={formData.deliveryType==='standart'} onChange={handleInputChange} className="accent-blue-600"/>
                    <span className="text-sm font-bold text-gray-700">{t("cartSidebarComponents.CheckoutForm.opt1")}</span>
                </div>
                <span className="text-xs font-bold text-gray-500">{priceAfterDiscount >= PRICES.threshold ? t("cartSidebarComponents.CheckoutForm.free") : `£${PRICES.standart}`}</span>
              </label>

              <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${formData.deliveryType==='next-day' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                    <input type="radio" name="deliveryType" value="next-day" checked={formData.deliveryType==='next-day'} onChange={handleInputChange} className="accent-purple-600"/>
                    <span className="text-sm font-bold text-gray-700">{t("cartSidebarComponents.CheckoutForm.opt2")}</span>
                </div>
                <span className="text-xs font-bold text-purple-600">£{PRICES.nextDay}</span>
              </label>

              {currentHour < 18 && (
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${formData.deliveryType==='same-day' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <input type="radio" name="deliveryType" value="same-day" checked={formData.deliveryType==='same-day'} onChange={handleInputChange} className="accent-pink-600"/>
                        <span className="text-sm font-bold text-gray-700">[{t("cartSidebarComponents.CheckoutForm.opt3")}]</span>
                    </div>
                    <span className="text-xs font-bold text-pink-600">£{PRICES.sameDay}</span>
                </label>
              )}
        </div>

        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><FiCalendar/> {t("cartSidebarComponents.CheckoutForm.deliveryTime")}</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input type="date" name="deliveryDate" min={currentHour >= 18 ? new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0] : todayStr} value={formData.deliveryDate} onChange={handleInputChange} className={inputClass("deliveryDate")} />
          <select name="timeSlot" value={formData.timeSlot} onChange={handleInputChange} className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm font-medium outline-none">
            {!formData.deliveryDate ? <option value="">{t("cartSidebarComponents.CheckoutForm.selectDateFirst")}</option> : getAvailableTimeSlots().length===0 ? <option>{t("cartSidebarComponents.CheckoutForm.noAvailableTime")}</option> : getAvailableTimeSlots().map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        
        <textarea name="cardMessage" value={formData.cardMessage} onChange={handleInputChange} className="w-full p-3 rounded-xl border-2 border-pink-100 bg-pink-50/30 text-sm outline-none h-24 placeholder-pink-400/60 mb-3" placeholder={`💌 ${t("cartSidebarComponents.CheckoutForm.deliveryNote")}`} />
        <input name="courierNote" value={formData.courierNote} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none" placeholder={`⚠️ ${t("cartSidebarComponents.CheckoutForm.noteToCourier")}`} />
        <div className="flex items-center gap-2 mt-3 ml-1"><input type="checkbox" name="isAnonymous" checked={formData.isAnonymous} onChange={handleInputChange} className="accent-pink-600" /><label className="text-sm text-gray-600">{t("cartSidebarComponents.CheckoutForm.sendWithoutName")}</label></div>
      </div>

    </form>
  );
};

export default CheckoutForm;