import Seo from "../components/Seo";
import { useTranslation } from "react-i18next";

const AboutPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Seo title={t("seo.aboutUsPage.aboutTitle")} description={t("seo.aboutUsPage.aboutDescription")} />
      
      {/* İçerik Navbar'ın altında kalsın diye pt-24 */}
      <div className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          
          {/* Banner Resim */}
          <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=1000&auto=format&fit=crop')" }}>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{t("about.ourStory")}</h1>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            
            {/* Misyon */}
            <section>
              <h2 className="text-2xl font-bold text-pink-600 mb-4">{t("about.ourMission")}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t("about.ourHistory")}
              </p>
            </section>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-pink-50 rounded-xl">
                <div className="text-3xl mb-2">🚚</div>
                <h3 className="font-bold text-gray-800">{t("about.sameDayDelivery")}</h3>
                <p className="text-xs text-gray-500 mt-1">{t("about.sameDayDeliverySub")}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl mb-2">💐</div>
                <h3 className="font-bold text-gray-800">{t("about.freshnessGuarantee")}</h3>
                <p className="text-xs text-gray-500 mt-1">{t("about.freshnessGuaranteeSub")}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl mb-2">💳</div>
                <h3 className="font-bold text-gray-800">{t("about.securePayment")}</h3>
                <p className="text-xs text-gray-500 mt-1">{t("about.securePaymentSub")}</p>
              </div>
            </div>

            {/* Vizyon */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("about.whyChooseUs")}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t("about.whyChooseUsSub")}
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;