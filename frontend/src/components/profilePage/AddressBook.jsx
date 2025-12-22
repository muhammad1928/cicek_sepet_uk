import { useState, useEffect } from "react";
import { userRequest } from "../../requestMethods";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const AddressBook = ({ user }) => {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Düzenleme State'leri
  const [editingId, setEditingId] = useState(null); 
  const initialAddress = { 
      title: "", 
      recipientName: "", 
      recipientPhone: "", 
      address: "", 
      buildingNo: "", // Yeni
      floor: "",      // Yeni
      apartment: "",  // Yeni
      city: "London", 
      postcode: "" 
  };
  const [addressData, setAddressData] = useState(initialAddress);
  
  const [confirmData, setConfirmData] = useState(null);
  const { notify } = useCart();

  const fetchAddresses = async () => { 
    try { 
      const res = await userRequest.get(`/users/${user._id}/addresses`); 
      setAddresses(res.data); 
    } catch(e){} 
  };

  useEffect(() => { fetchAddresses(); }, [user]);

  // Formu Aç
  const openForm = (addr = null) => {
    if (addr) { 
      setAddressData(addr); 
      setEditingId(addr._id); 
    } else { 
      setAddressData(initialAddress); 
      setEditingId(null); 
    }
    setShowForm(true);
  };

  // Formu Kapat ve Temizle (İptal İşlemi)
  const handleCancel = () => {
    setAddressData(initialAddress);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // address alanı yerine street ve buildingNo kontrolü yapabiliriz veya address hala backendde birleştiriliyorsa ona göre.
    // Ancak yeni yapıda street ve buildingNo ayrı. address alanını 'street' olarak kullanıyorsan sorun yok.
    if (!addressData.title || !addressData.address) return notify("Eksik bilgi!", "warning");
    try {
      // Backend'e gönderirken yeni alanları da gönderdiğinden emin ol (Backend modelini güncellemiştik)
      if (editingId) { 
        await userRequest.put(`/users/${user._id}/addresses/${editingId}`, addressData); 
        notify(`${t("profilePage.adressBook.adressUpdated")} ✅`, "success"); 
      } else { 
        await userRequest.post(`/users/${user._id}/addresses`, addressData); 
        notify(`${t("profilePage.adressBook.adressAdded")} ✅`, "success"); 
      }
      handleCancel(); 
      fetchAddresses();
    } catch(e){ notify(`${t("common.error")}`, "error"); }
  };

  const handleDeleteRequest = (id, title) => {
    setConfirmData({
      isOpen: true,
      title: t("profilePage.adressBook.qDeteleAdress"),
      message: `"${title}" ${t("profilePage.adressBook.deleteAdressLabel")}`,
      isDanger: true,
      action: async () => {
        try {
          await userRequest.delete(`/users/${user._id}/addresses/${id}`);
          notify(t("profilePage.adressBook.adressDeleted"), "success");
          fetchAddresses();
        } catch { notify(t("common.error"), "error"); }
        setConfirmData(null);
      }
    });
  };

  return (
    <div className="animate-fade-in p-1 ">
      
      {/* BAŞLIK VE MODERN BUTON */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {t("profilePage.adressBook.myAdresses")}
        </h2>
        
        <button 
          onClick={() => showForm ? handleCancel() : openForm()} 
          className={`
            px-6 py-2.5 rounded-xl font-bold shadow-lg transition transform active:scale-95 flex items-center gap-2
            ${showForm 
              ? "bg-gray-200 text-gray-600 hover:bg-gray-300" 
              : "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:shadow-pink-500/40"
            }
          `}
        >
          {showForm ? <><FiX /> {t("profilePage.adressBook.cancel")}</> : <><FiPlus /> {t("profilePage.adressBook.addNewAdress")}</>}
        </button>
      </div>

      {/* FORM ALANI */}
      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8 relative animate-fade-in-down">
            
            <div className="mb-6 border-b border-gray-100 pb-4">
               <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                 {editingId ? <FiEdit className="text-blue-500"/> : <FiPlus className="text-green-500"/>}
                 {editingId ? t("profilePage.adressBook.editAdress") : t("profilePage.adressBook.newAdressInfo")}
               </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t("profilePage.adressBook.addressTitle")}</label>
                   <input placeholder="Ev, İş vb." className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition" value={addressData.title} onChange={e=>setAddressData({...addressData, title:e.target.value})} required />
                </div>
                
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t("profilePage.adressBook.recipientName")}</label>
                   <input className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition" placeholder="Ad Soyad" value={addressData.recipientName} onChange={e=>setAddressData({...addressData, recipientName:e.target.value})} />
                </div>
                
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t("profilePage.adressBook.receipentPhone")}</label>
                   <input className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition" value={addressData.recipientPhone} onChange={e=>setAddressData({...addressData, recipientPhone:e.target.value})} />
                </div>

                {/* --- DETAYLI ADRES ALANLARI --- */}
                <div className="md:col-span-2">
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t("cartSidebarComponents.CheckoutForm.street") || "Street / Road"}</label>
                   {/* 'address' alanını street olarak kullanıyoruz */}
                   <input placeholder="Baker Street" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition" value={addressData.address} onChange={e=>setAddressData({...addressData, address:e.target.value})} required />
                </div>

                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t("cartSidebarComponents.CheckoutForm.buildingNo") || "Building No"}</label>
                   <input className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition" value={addressData.buildingNo} onChange={e=>setAddressData({...addressData, buildingNo:e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t("cartSidebarComponents.CheckoutForm.floor") || "Floor"}</label>
                        <input className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition" value={addressData.floor} onChange={e=>setAddressData({...addressData, floor:e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t("cartSidebarComponents.CheckoutForm.apartment") || "Flat No"}</label>
                        <input className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition" value={addressData.apartment} onChange={e=>setAddressData({...addressData, apartment:e.target.value})} />
                    </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t("profilePage.adressBook.city")}</label>
                   <input className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition" value={addressData.city} onChange={e=>setAddressData({...addressData, city:e.target.value})} />
                </div>
                
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">{t("profilePage.adressBook.postCode")}</label>
                   <input className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition" value={addressData.postcode} onChange={e=>setAddressData({...addressData, postcode:e.target.value})} />
                </div>
                
                {/* BUTONLAR */}
                <div className="md:col-span-2 flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      type="button" 
                      onClick={handleCancel} 
                      className="flex-1 py-3.5 border-2 border-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition"
                    >
                      {t("profilePage.adressBook.cancel")}
                    </button>
                    <button 
                      type="submit" 
                      className="flex-[2] py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition transform active:scale-95"
                    >
                      {editingId ? t("profilePage.adressBook.saveChanges") : t("profilePage.adressBook.addAdress")}
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* Adres Listesi */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4 opacity-20">📍</div>
            <p className="text-gray-400 font-medium">{t("profilePage.adressBook.noSavedAdresses")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div key={addr._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition group relative overflow-hidden">
              
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-pink-500 to-purple-500"></div>
              
              <div className="pl-4 pr-8">
                 <div className="font-extrabold text-gray-800 flex items-center gap-2 mb-2 text-lg">
                    {addr.title}
                 </div>
                 <p className="text-sm text-gray-600 font-bold mb-1">{addr.recipientName}</p>
                 <p className="text-xs text-gray-400 mb-3">{addr.recipientPhone}</p>
                 
                 <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200 leading-relaxed">
                    {/* ADRES DETAY GÖSTERİMİ */}
                    <span className="font-bold">{addr.address}</span> 
                    {addr.buildingNo ? ` No: ${addr.buildingNo}` : ''}
                    <br/>
                    {addr.floor ? `Kat: ${addr.floor}` : ''} {addr.apartment ? ` Daire: ${addr.apartment}` : ''}
                    <br/>
                    <span className="font-bold text-pink-600">{addr.city}, {addr.postcode}</span>
                 </div>
              </div>
              
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={() => openForm(addr)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition" title={t('profilePage.adressBook.edit')}>
                    <FiEdit size={16} />
                  </button>
                  <button onClick={() => handleDeleteRequest(addr._id, addr.title)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition" title={t('profilePage.adressBook.delete')}>
                    <FiTrash2 size={16} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Silme Onay Modalı */}
      {confirmData && (
        <ConfirmModal 
          title={confirmData.title} 
          message={confirmData.message} 
          isDanger={confirmData.isDanger} 
          onConfirm={confirmData.action} 
          onCancel={() => setConfirmData(null)} 
        />
      )}
    </div>
  );
};

export default AddressBook;