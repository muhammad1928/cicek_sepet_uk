import { useState } from "react";
import Seo from "../components/Seo";

const FAQS = [
  { q: "Siparişimi nasıl takip edebilirim?", a: "Üye girişi yaptıktan sonra 'Siparişlerim' menüsünden anlık durumunu görebilirsiniz." },
  { q: "Hangi bölgelere gönderim var?", a: "Şu an için sadece Londra içi (Zone 1-6) teslimat yapmaktayız." },
  { q: "Aynı gün teslimat var mı?", a: "Evet, saat 18:00'a kadar verilen siparişler aynı gün teslim edilir." },
  { q: "Çiçekler taze mi?", a: "Evet, her sabah mezattan günlük olarak taze çiçekler temin edilir." },
  { q: "Ödeme yöntemleri nelerdir?", a: "Kredi kartı (Stripe güvencesiyle) ile ödeme yapabilirsiniz." }
];

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-4 font-sans">
      <Seo title="Sıkça Sorulan Sorular" description="Merak ettikleriniz." />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Sıkça Sorulan Sorular</h1>
        
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-5 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <span className="font-bold text-gray-700">{faq.q}</span>
                <span className="text-pink-600 text-xl">{openIndex === i ? "−" : "+"}</span>
              </button>
              {openIndex === i && (
                <div className="p-5 pt-0 text-gray-600 text-sm leading-relaxed animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FaqPage;