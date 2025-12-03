import { useParams, Link } from "react-router-dom";
import Seo from "../components/Seo";
import { FiFileText, FiShield, FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const LegalPage = () => {
  const { t } = useTranslation();
  const { type } = useParams(); // url'den 'privacy-policy', 'terms-of-use', 'cookie-policy' alır

  const content = {
    // 1. GİZLİLİK POLİTİKASI
    "privacy-policy": {
      title: t("legal.privacyPolicy.legalPageContentTitle"),
      icon: <FiShield />,
      body: (
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("legal.privacyPolicy.first")}</h3>
            <p>{t("legal.privacyPolicy.firstDesc")}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("legal.privacyPolicy.second")}</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>{t("legal.privacyPolicy.secondDesc.part1")}</strong></li>
              <li><strong>{t("legal.privacyPolicy.secondDesc.part2")}</strong></li>
              <li><strong>{t("legal.privacyPolicy.secondDesc.part3")}</strong></li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("legal.privacyPolicy.third")}</h3>
            <p>{t("legal.privacyPolicy.thirdDesc")}</p>
          </section>
        </div>
      )
    },

    // 2. MESAFELİ SATIŞ SÖZLEŞMESİ
    "terms-of-use": {
      title: t("legal.termsOfUse.title"),
      icon: <FiFileText />,
      body: (
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("legal.termsOfUse.first")}</h3>
            <p>{t("legal.termsOfUse.firstDesc")}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">2. Cayma Hakkı İstisnası (Önemli)</h3>
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 flex gap-3">
               <FiAlertCircle className="text-xl shrink-0 mt-0.5" />
               <div>
                 <strong>{t("legal.termsOfUse.second")}</strong>
               </div>
            </div>
            <p className="mt-3">{t("legal.termsOfUse.secondDesc_part2")}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("legal.termsOfUse.third")}</h3>
            <p>{t("legal.termsOfUse.thirdDesc")}</p>
          </section>
        </div>
      )
    },

    // 3. ÇEREZ POLİTİKASI (GÜNCELLENMİŞ)
    "cookie-policy": {
      title: t("legal.legalTitle"),
      icon: <span className="text-2xl">🍪</span>,
      body: (
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("legal.termsOfCookies.firstTerm")}</h3>
            <p>{t("legal.termsOfCookies.firstTermDesc")}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("legal.termsOfCookies.secondTerm")}</h3>
            <div className="grid gap-4">
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-pink-600 text-sm uppercase mb-1">{t("legal.termsOfCookies.secondTermDesc.first")}</h4>
                  <p className="text-xs">{t("legal.termsOfCookies.secondTermDesc.firstTermDesc")}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-blue-600 text-sm uppercase mb-1">{t("legal.termsOfCookies.secondTermDesc.second")}</h4>
                  <p className="text-xs">{t("legal.termsOfCookies.secondTermDesc.secondTermDesc")}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-purple-600 text-sm uppercase mb-1">{t("legal.termsOfCookies.secondTermDesc.third")}</h4>
                  <p className="text-xs">{t("legal.termsOfCookies.secondTermDesc.thirdTermDesc")}</p>
               </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("legal.termsOfCookies.thirdTerm")}</h3>
            <p>{t("legal.termsOfCookies.thirdTermDesc")}</p>
          </section>
        </div>
      )
    }
  };

  const data = content[type] || { title: t("legal.pageNotFound"), body: t("legal.pageNotFoundDesc"), icon: <FiAlertCircle /> };


  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-10 pb-20 px-4">
      <Seo title={data.title} description={`${data.title} ${t("legal.legalPage.hakkindaDetayliBilgi")}`} />
      
      <div className="max-w-4xl mx-auto">
        
        {/* Başlık Kartı */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 mb-8 flex items-center gap-6">
           <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
              {data.icon}
           </div>
           <div>
              <h1 className="text-3xl font-black text-gray-800">{data.title}</h1>
              <p className="text-gray-500 text-sm mt-1">{t("common.lastUpdated")}: {new Date().toLocaleDateString()}</p>
           </div>
        </div>

        {/* İçerik Alanı */}
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200 text-gray-600 leading-relaxed text-sm">
          {typeof data.body === 'string' ? <p>{data.body}</p> : data.body}

          <div className="mt-10 pt-10 border-t border-gray-100 flex justify-between items-center">
             <Link to="/" className="text-gray-500 font-bold hover:text-black transition">{t("legal.backToHome")}</Link>
             <p className="text-xs text-gray-400">{t("legal.backToHome2")}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LegalPage;