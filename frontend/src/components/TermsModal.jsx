import { useEffect, useState } from "react";
import { createPortal } from "react-dom"; 
import { FiX, FiCheck, FiFileText } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const TermsModal = ({ onClose, type, onAccept }) => {
  const { t } = useTranslation(); 
  const [isMounted, setIsMounted] = useState(false);
  const modalRoot = document.getElementById("modal-root") || document.body;

  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleAccept = () => {
    if (onAccept) onAccept();
    onClose();
  };

  // --- SADELEŞTİRİLMİŞ SÖZLEŞME METİNLERİ ---
  const content = {
    
    // 1. MÜŞTERİ (ALICI) SÖZLEŞMESİ
    customer: {
      title: t("termsModal.customers.title"),
      body: (
        <div className="space-y-6 text-gray-800 font-sans text-sm leading-relaxed">
          <div>
            <h4 className="font-bold text-black uppercase mb-2">{t("termsModal.customers.first.title")}</h4>
            <p>{t("termsModal.customers.first.desc")}</p>
          </div>
          
          <div>
            <h4 className="font-bold text-black uppercase mb-2">{t("termsModal.customers.second.title")}</h4>
            <p>{t("termsModal.customers.second.desc")}</p>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">{t("termsModal.customers.third.title")}</h4>
            <div dangerouslySetInnerHTML={{ __html: t("termsModal.customers.third.desc") }} />
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">{t("termsModal.customers.fifth.title")}</h4>
            <p>{t("termsModal.customers.fifth.desc")}</p>
          </div>
        </div>
      )
    },

    // 2. KURYE (TESLİMATÇI) SÖZLEŞMESİ
    courier: {
      title: t("termsModal.courierAgreement.title"),
      body: (
        <div className="space-y-6 text-gray-800 font-sans text-sm leading-relaxed">
          <div>
            <h4 className="font-bold text-black uppercase mb-2">{t("termsModal.courierAgreement.first.title")}</h4>
            <p>{t("termsModal.courierAgreement.first.desc")}</p>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">{t("termsModal.courierAgreement.second.title")}</h4>
            <p>{t("termsModal.courierAgreement.second.desc")}</p>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">{t("termsModal.courierAgreement.third.title")}</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>{t("termsModal.courierAgreement.third.titlesub")}</li>
              <li>{t("termsModal.courierAgreement.third.desc")}</li>
            </ul>
          </div>
        </div>
      )
    },

    // 3. SATICI (VENDOR) SÖZLEŞMESİ
    vendor: {
      title: t("termsModal.vendorAgreement.title"),
      body: (
        <div className="space-y-6 text-gray-800 font-sans text-sm leading-relaxed">
          <div>
            <h4 className="font-bold text-black uppercase mb-2">{t("termsModal.vendorAgreement.first.title")}</h4>
            <p>{t("termsModal.vendorAgreement.first.desc")}</p>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">{t("termsModal.vendorAgreement.second.title")}</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>{t("termsModal.vendorAgreement.second.desc")}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">{t("termsModal.vendorAgreement.third.title")}</h4>
            <p>{t("termsModal.vendorAgreement.third.desc")}</p>
          </div>

           <div>
            <h4 className="font-bold text-black uppercase mb-2">{t("termsModal.vendorAgreement.fourth.title")}</h4>
            <p>{t("termsModal.vendorAgreement.fourth.desc")}</p>
          </div>
        </div>
      )
    }
  };

  const activeContent = content[type] || content.customer;

  if (!isMounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      
      <div className="bg-white w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden animate-slide-in-up border border-gray-300">
        
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-gray-200 text-gray-700 p-2 rounded-lg"><FiFileText size={24} /></div>
             <h3 className="text-lg font-bold text-gray-800">{activeContent.title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition p-1"><FiX size={24} /></button>
        </div>

        {/* İçerik */}
        <div className="p-8 overflow-y-auto flex-1 bg-white">
          {activeContent.body}
          <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-400 text-center">
            <p>{t("common.lastUpdated")}: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-4 shrink-0">
          {/* Eğer onay fonksiyonu varsa (Kayıt sayfası) butonu göster */}
          {onAccept && (
            <button 
              onClick={handleAccept} 
              className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition transform active:scale-95 flex items-center gap-2"
            >
              <FiCheck /> {t("termsModal.agree")}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default TermsModal;