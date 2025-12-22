import { useState } from "react";
import Seo from "../components/Seo";
import { useTranslation } from "react-i18next";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa'; // İkonları ekledim daha şık durması için

const ContactPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simülasyon
    setTimeout(() => {
      setSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    // ARKA PLAN GÜNCELLENDİ: Anasayfa ile uyumlu Gradient yapı
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white font-sans pt-10 pb-20 px-4">
      <Seo title={t("seo.contactPage.contactTitle")} description={t("seo.contactPage.contactDescription")} />

      <div className="max-w-6xl mx-auto">
        
        {/* Başlık Alanı */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 inline-block">
            {t("contact.contactUs")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t("contact.infoTest")}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-0 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 animate-fade-in">
          
          {/* SOL: İletişim Bilgileri (Koyu Tema) */}
          <div className="lg:col-span-2 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Dekoratif Arka Plan Efekti */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-screen filter blur-[80px] opacity-20 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 space-y-10">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">
                  {t("contact.hqAddress") || "Head Office"}
                </h3>
                
                {/* Adres */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-pink-500 shrink-0">
                    <FaMapMarkerAlt />
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Soon to Come,<br/>
                    London,<br/>
                    United Kingdom
                  </p>
                </div>

                {/* İletişim */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-pink-500 shrink-0">
                    <FaEnvelope />
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-400 text-xs mb-1 uppercase font-bold tracking-wider">{t("contact.contactTxt")}</p>
                    <p className="text-white font-medium hover:text-pink-400 transition cursor-pointer">info@fesfu.com</p>
                    <p className="text-white font-medium mt-1 hover:text-pink-400 transition cursor-pointer">+44 74 6642 8290</p>
                  </div>
                </div>

                {/* Çalışma Saatleri */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-pink-500 shrink-0">
                    <FaClock />
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-400 text-xs mb-1 uppercase font-bold tracking-wider">{t("contact.workingHours")}</p>
                    <p className="text-gray-300">Mon - Fri: 09:00 - 18:00</p>
                    <p className="text-gray-300">Weekend: 10:00 - 15:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alt Sosyal Mesaj */}
            <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
              <p className="text-slate-400 text-xs italic">
                "We reply to all messages within 24 hours."
              </p>
            </div>
          </div>

          {/* SAĞ: İletişim Formu (Beyaz Tema) */}
          <div className="lg:col-span-3 p-10 md:p-14 bg-white">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t("common.fullName")}</label>
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 bg-gray-50 transition-all font-medium" 
                      placeholder="John Doe"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t("common.email")}</label>
                    <input 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 bg-gray-50 transition-all font-medium" 
                      placeholder="john@example.com"
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t("contact.subject")}</label>
                  <div className="relative">
                    <select 
                      name="subject" 
                      value={formData.subject} 
                      onChange={handleChange} 
                      className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 bg-gray-50 transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="">{t("common.dropdownOpt")}</option>
                      <option value="siparis">{t("contact.dropdownOpt1")}</option>
                      <option value="iade">{t("contact.dropdownOpt2")}</option>
                      <option value="diger">{t("contact.dropdownOpt3")}</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t("contact.message")}</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 bg-gray-50 transition-all font-medium h-40 resize-none" 
                    placeholder="How can we help you today?"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/30 transition transform active:scale-[0.98]"
                >
                  {t("contact.sendMessage")}
                </button>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in py-10">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm border border-green-100">
                  ✓
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">{t("contact.successMessage")}</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">{t("contact.successSubMessage")}</p>
                <button 
                  onClick={() => setSent(false)} 
                  className="px-8 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition"
                >
                  {t("contact.newMessage")}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;