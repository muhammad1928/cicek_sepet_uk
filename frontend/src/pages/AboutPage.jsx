import Seo from "../components/Seo";
import { useTranslation } from "react-i18next";
import { FiAward, FiHeart, FiStar, FiCheckCircle } from "react-icons/fi"; 
import Features from "../components/Features"; 

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white font-sans pt-12 pb-20 px-4 overflow-x-hidden">
      <Seo title={t("seo.aboutUsPage.aboutTitle")} description={t("seo.aboutUsPage.aboutDescription")} />
      
      {/* Dekoratif Arka Plan */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* --- 1. BAŞLIK ALANI --- */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-pink-100 to-white border border-pink-200 rounded-2xl flex items-center justify-center shadow-lg hover:rotate-6 transition duration-500">
                <FiHeart className="text-3xl md:text-4xl text-pink-500 fill-pink-500/20" />
            </div>
            
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 drop-shadow-sm">
              {t("about.ourStory")}
            </span>
          </h1>
          
          <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            {t("about.ourMission")}
          </p>
        </div>

        {/* --- 2. ANA İÇERİK KARTI --- */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/60 animate-fade-in mb-12 relative overflow-visible"> 
          
          {/* Banner Resim */}
          <div className="h-96 md:h-[500px] bg-cover bg-fixed bg-center relative rounded-t-[2.5rem] overflow-hidden group" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=1000&auto=format&fit=crop')" }}>
            
            {/* DÜZELTME BURADA YAPILDI: 'items-end' yerine 'items-center' kullanıldı. 
                Böylece yazı ortada duruyor ve alttaki kartlar yazıyı kapatmıyor. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center p-8 md:p-16">
              
              <div className="text-white transform group-hover:-translate-y-2 transition duration-700 max-w-3xl">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 mb-6 shadow-lg">
                  <FiStar className="text-yellow-400 fill-yellow-400" /> Since 2024
                </div>
                <h2 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-2xl">
                  London's Newest <br/> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                    Digital Marketplace
                  </span>
                </h2>
              </div>

            </div>
          </div>

          {/* --- 3. FEATURES (Özellikler Bandı) --- */}
          <div className="relative z-20 -mt-24 md:-mt-32 px-4 md:px-12">
             <div className="transform hover:-translate-y-1 transition duration-500">
                <Features />
             </div>
          </div>

          {/* Metin İçeriği */}
          <div className="p-8 md:p-16 space-y-16">
            
            {/* Hikaye */}
            <section className="prose prose-lg prose-pink text-gray-700 max-w-4xl mx-auto leading-loose text-center md:text-left">
              <p className="first-letter:text-6xl first-letter:font-black first-letter:text-transparent first-letter:bg-clip-text first-letter:bg-gradient-to-br first-letter:from-pink-600 first-letter:to-purple-600 first-letter:mr-4 first-letter:float-left">
                {t("about.ourHistory")}
              </p>
            </section>

            {/* İstatistikler Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-gradient-to-br from-purple-50 to-white rounded-3xl border border-purple-100 hover:shadow-xl hover:border-purple-200 transition duration-300 group">
                <div className="w-14 h-14 bg-white shadow-sm text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition duration-300">
                  <FiAward />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">{t("about.freshnessGuarantee")}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{t("about.freshnessGuaranteeSub")}</p>
              </div>

              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-3xl border border-blue-100 hover:shadow-xl hover:border-blue-200 transition duration-300 group">
                <div className="w-14 h-14 bg-white shadow-sm text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition duration-300">
                  <FiCheckCircle />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">Customer First Policy</h3>
                <p className="text-gray-600 leading-relaxed font-medium">We don't just sell products; we deliver experiences. If you're not happy, neither are we.</p>
              </div>
            </div>

            {/* Alt Koyu Kutu */}
            <section className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="p-5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shrink-0">
                    <FiHeart className="text-4xl text-pink-400 fill-pink-400/20" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-4">{t("about.whyChooseUs")}</h2>
                    <p className="text-slate-300 leading-relaxed text-lg opacity-90 max-w-2xl">
                      {t("about.whyChooseUsSub")}
                    </p>
                  </div>
               </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;