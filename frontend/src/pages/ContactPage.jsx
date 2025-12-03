import { useState } from "react";
import Seo from "../components/Seo";
import { useTranslation } from "react-i18next";

const ContactPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Burada normalde backend'e POST isteği atılır (/api/contact)
    // Şimdilik simülasyon yapıyoruz
    setTimeout(() => {
      setSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-12 px-4">
      <Seo title={t("seo.contactPage.contactTitle")} description={t("seo.contactPage.contactDescription")} />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{t("contact.contactUs")}</h1>
          <p className="text-gray-600">{t("contact.infoTest")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden">
          
          {/* Sol: Bilgiler */}
          <div className="bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Dekorasyon */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-pink-500 mb-2">{t("contact.hqAddress")}</h3>
                <p className="text-gray-300 leading-relaxed">123 Oxford Street,<br/>London, W1D 1BS,<br/>United Kingdom</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-pink-500 mb-2">{t("contact.contactTxt")}</h3>
                <p className="text-gray-300">destek@ciceksepeti.uk</p>
                <p className="text-gray-300">+44 20 7946 0000</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-pink-500 mb-2">{t("contact.workingHours")}</h3>
                <p className="text-gray-300">Pzt - Cum: 09:00 - 18:00</p>
                <p className="text-gray-300">Hafta Sonu: 10:00 - 15:00</p>
              </div>
            </div>
          </div>

          {/* Sağ: Form */}
          <div className="p-10">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t("common.fullName")}</label>
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-pink-500 bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t("common.email")}</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-pink-500 bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t("contact.subject")}</label>
                  <select name="subject" value={formData.subject} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-pink-500 bg-gray-50">
                    <option value="">{t("common.dropdownOpt")}</option>
                    <option value="siparis">{t("contact.dropdownOpt1")}</option>
                    <option value="iade">{t("contact.dropdownOpt2")}</option>
                    <option value="diger">{t("contact.dropdownOpt3")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t("contact.message")}</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-pink-500 bg-gray-50 h-32" required></textarea>
                </div>
                <button type="submit" className="w-full bg-pink-600 text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition shadow-lg">{t("contact.sendMessage")}</button>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6">✓</div>
                <h3 className="text-2xl font-bold text-gray-800">{t("contact.successMessage")}</h3>
                <p className="text-gray-500 mt-2">{t("contact.successSubMessage")}</p>
                <button onClick={() => setSent(false)} className="mt-8 text-pink-600 font-bold hover:underline">{t("contact.newMessage")}</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;