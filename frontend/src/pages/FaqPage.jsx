import { useState } from "react";
import Seo from "../components/Seo";
import { useTranslation } from "react-i18next";
import { FiChevronDown, FiChevronUp, FiHelpCircle } from "react-icons/fi";

const FaqPage = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  // JSON dosyasındaki "items" dizisini çeker
  // returnObjects: true -> JSON içindeki array yapısını bozmadan alır
  const faqs = t("FAQ.items", { returnObjects: true });

  // Eğer çeviri yüklenmediyse veya dizi boşsa hata vermemesi için kontrol
  const faqList = Array.isArray(faqs) ? faqs : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white pt-12 pb-20 px-4 font-sans">
      <Seo title={t("seo.faqPage.faqTitle")} description={t("seo.faqPage.faqDescription")} />
      
      <div className="max-w-3xl mx-auto">
        
        {/* Başlık Alanı */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm text-pink-500 text-3xl mb-6">
            <FiHelpCircle />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
            {t("FAQ.faqTitle")}
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            {t("FAQ.faqDescription")}
          </p>
        </div>
        
        {/* Accordion Listesi */}
        <div className="space-y-4 animate-fade-in">
          {faqList.map((faq, i) => (
            <div 
              key={i} 
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                ${openIndex === i ? 'shadow-lg border-pink-200 ring-1 ring-pink-100' : 'shadow-sm border-gray-100 hover:border-pink-100'}
              `}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-6 flex justify-between items-center group"
              >
                <span className={`font-bold text-lg transition-colors ${openIndex === i ? 'text-pink-600' : 'text-gray-800 group-hover:text-pink-600'}`}>
                  {faq.q}
                </span>
                <span className={`p-2 rounded-full transition-colors ${openIndex === i ? 'bg-pink-100 text-pink-600' : 'bg-gray-50 text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-500'}`}>
                  {openIndex === i ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-dashed border-gray-100 mt-2">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alt Destek Mesajı */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            {t("contact.infoTest") || "Can't find the answer you're looking for?"}{" "}
            <a href="/contact" className="text-pink-600 font-bold hover:underline">
              {t("contact.contactUs")}
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default FaqPage;