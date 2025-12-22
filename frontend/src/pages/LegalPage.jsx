import { useParams, Link } from "react-router-dom";
import Seo from "../components/Seo";
import { FiFileText, FiShield, FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const LegalPage = () => {
  const { t } = useTranslation();
  const { type } = useParams(); // url'den 'privacy-policy', 'terms-of-use', 'cookie-policy' alır

  const content = {
    // 1. GİZLİLİK POLİTİKASI (GÜNCELLENDİ)
    "privacy-policy": {
      title: t("legal.privacyPolicy.legalPageContentTitle"),
      icon: <FiShield />,
      body: (
        <div className="space-y-8">
          {/* 1. Veri Sorumlusu */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{t("legal.privacyPolicy.first")}</h3>
            <p className="text-gray-600">{t("legal.privacyPolicy.firstDesc")}</p>
          </section>

          {/* 2. Toplanan Veriler (Liste) */}
          <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t("legal.privacyPolicy.second")}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="bg-blue-200 text-blue-700 p-1 rounded-full text-xs mt-1"><FiInfo /></span>
                <span>{t("legal.privacyPolicy.secondDesc.part1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-200 text-blue-700 p-1 rounded-full text-xs mt-1"><FiInfo /></span>
                <span>{t("legal.privacyPolicy.secondDesc.part2")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-200 text-blue-700 p-1 rounded-full text-xs mt-1"><FiInfo /></span>
                <span>{t("legal.privacyPolicy.secondDesc.part3")}</span>
              </li>
            </ul>
          </section>

          {/* 3. Ödeme Güvenliği */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{t("legal.privacyPolicy.third")}</h3>
            <p className="text-gray-600">{t("legal.privacyPolicy.thirdDesc")}</p>
          </section>
        </div>
      )
    },

    // 2. MESAFELİ SATIŞ SÖZLEŞMESİ (HİBRİT İADE SİSTEMİ EKLENDİ)
    "terms-of-use": {
      title: t("legal.termsOfUse.title"),
      icon: <FiFileText />,
      body: (
        <div className="space-y-8">
          {/* 1. Taraflar */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{t("legal.termsOfUse.first")}</h3>
            <p className="text-gray-600">{t("legal.termsOfUse.firstDesc")}</p>
          </section>

          {/* 2. CAYMA HAKKI (ÖNEMLİ DEĞİŞİKLİK) */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t("legal.termsOfUse.second")}</h3>
            <p className="mb-4 font-medium text-gray-700">{t("legal.termsOfUse.secondDesc")}</p>
            
            <div className="grid gap-4 md:grid-cols-2">
                {/* A) Bozulabilir Ürünler (Çiçek/Gıda) - İade YOK */}
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-red-600 text-6xl"><FiAlertCircle /></div>
                    <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                        <FiAlertCircle /> Perishable Goods
                    </h4>
                    <p className="text-sm text-red-800 leading-relaxed">
                        {t("legal.termsOfUse.secondDesc_part2")}
                    </p>
                </div>

                {/* B) Dayanıklı Ürünler (Elektronik/Kitap) - İade VAR */}
                <div className="bg-green-50 p-5 rounded-2xl border border-green-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-green-600 text-6xl"><FiCheckCircle /></div>
                    <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                        <FiCheckCircle /> Durable Goods
                    </h4>
                    <p className="text-sm text-green-800 leading-relaxed">
                        {t("legal.termsOfUse.secondDesc_part3")}
                    </p>
                </div>
            </div>
          </section>

          {/* 3. Teslimat */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{t("legal.termsOfUse.third")}</h3>
            <p className="text-gray-600">{t("legal.termsOfUse.thirdDesc")}</p>
          </section>
        </div>
      )
    },

    // 3. ÇEREZ POLİTİKASI
    "cookie-policy": {
      title: t("legal.termsOfCookies.title"),
      icon: <span className="text-2xl">🍪</span>,
      body: (
        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{t("legal.termsOfCookies.firstTerm")}</h3>
            <p className="text-gray-600">{t("legal.termsOfCookies.firstTermDesc")}</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t("legal.termsOfCookies.secondTerm")}</h3>
            <div className="grid gap-4 md:grid-cols-3">
               {/* Essential Cookies */}
               <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-pink-600 text-sm uppercase mb-2">
                    {t("legal.termsOfCookies.secondTermDesc.first")}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t("legal.termsOfCookies.secondTermDesc.firstDesc")}
                  </p>
               </div>
               
               {/* Functional Cookies */}
               <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-blue-600 text-sm uppercase mb-2">
                    {t("legal.termsOfCookies.secondTermDesc.second")}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t("legal.termsOfCookies.secondTermDesc.firstDesc")} {/* Not: JSON'da burası aynı key olabilir, kontrol edip 'secondDesc' yapabilirsiniz */}
                  </p>
               </div>

               {/* Analytics Cookies */}
               <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-purple-600 text-sm uppercase mb-2">
                     {t("legal.termsOfCookies.secondTermDesc.third")}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                     {t("legal.termsOfCookies.secondTermDesc.thirdDesc")}
                  </p>
               </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{t("legal.termsOfCookies.thirdTerm")}</h3>
            <p className="text-gray-600">{t("legal.termsOfCookies.thirdTermDesc")}</p>
          </section>
        </div>
      )
    }
  };

  // Eğer url yanlışsa veya içerik yoksa
  const data = content[type] || { 
    title: t("legal.pageNotFound"), 
    body: t("legal.pageNotFoundDesc"), 
    icon: <FiAlertCircle /> 
  };


  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pt-12 pb-24 px-4">
      {/* SEO */}
      <Seo 
        title={data.title} 
        description={`${data.title} - ${t("legal.legalPage.hakkindaDetayliBilgi") || 'Fesfu Legal Information'}`} 
      />
      
      <div className="max-w-4xl mx-auto">
        
        {/* Başlık Kartı */}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
           <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0">
              {data.icon}
           </div>
           <div>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">{data.title}</h1>
              <p className="text-gray-400 text-sm mt-2 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {t("common.lastUpdated") || "Last Updated"}: {new Date().toLocaleDateString()}
              </p>
           </div>
        </div>

        {/* İçerik Alanı */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-gray-600 leading-7 text-[15px]">
          {data.body}

          {/* Alt Linkler */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
             <Link to="/" className="text-gray-900 font-bold hover:text-pink-600 transition-colors flex items-center gap-2">
                {t("legal.backToHome")}
             </Link>
             <p className="text-xs text-gray-300 font-medium tracking-wide">
                {t("legal.backToHome2") || "Fesfu Legal Team"}
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LegalPage;