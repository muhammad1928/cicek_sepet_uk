import { useEffect, useState } from "react";
import { createPortal } from "react-dom"; 
import { FiX, FiCheck, FiFileText } from "react-icons/fi";

const TermsModal = ({ onClose, type, onAccept }) => {
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
      title: "Mesafeli Satış ve Hizmet Sözleşmesi",
      body: (
        <div className="space-y-6 text-gray-800 font-sans text-sm leading-relaxed">
          <div>
            <h4 className="font-bold text-black uppercase mb-2">1. TARAFLAR</h4>
            <p>İşbu sözleşme, ÇiçekSepeti UK (Platform) ile siteye üye olan veya sipariş veren ALICI arasında akdedilmiştir.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-black uppercase mb-2">2. KONU</h4>
            <p>İşbu sözleşmenin konusu, ALICI'nın Platform üzerinden sipariş verdiği ürünlerin satışı ve teslimi ile ilgili hak ve yükümlülüklerin belirlenmesidir.</p>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">3. CAYMA HAKKI VE İADE</h4>
            <p>6502 sayılı Tüketicinin Korunması Kanunu uyarınca;</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>"Çabuk bozulabilen veya son kullanma tarihi geçebilecek malların teslimine ilişkin sözleşmelerde" cayma hakkı kullanılamaz. (Canlı Çiçek, Çikolata vb.)</li>
              <li>Ürün teslimat anında hasarlı, solmuş veya kusurlu ise, ALICI teslimatı kabul etmeyip iade talep edebilir.</li>
              <li>Teslim alındıktan sonraki şikayetlerde görsel ile başvuru zorunludur.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">4. KİŞİSEL VERİLER</h4>
            <p>Ad, soyad, telefon ve adres bilgileriniz; siparişin ifası amacıyla ilgili Satıcı ve Kurye ile paylaşılacaktır.</p>
          </div>
        </div>
      )
    },

    // 2. KURYE (TESLİMATÇI) SÖZLEŞMESİ
    courier: {
      title: "Bağımsız Kurye Hizmet Sözleşmesi",
      body: (
        <div className="space-y-6 text-gray-800 font-sans text-sm leading-relaxed">
          <div>
            <h4 className="font-bold text-black uppercase mb-2">1. HİZMETİN TANIMI</h4>
            <p>Kurye, Platform üzerinden kendisine yönlendirilen paketleri, Mağaza'dan eksiksiz teslim alıp, belirtilen sürede Müşteri'ye ulaştırmayı kabul eder.</p>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">2. ÖDEME VE HAKEDİŞ</h4>
            <p>Kurye, tamamladığı her başarılı teslimat başına belirlenen ücreti hak eder. Ödemeler haftalık periyotlarla IBAN adresine yapılır.</p>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">3. SORUMLULUKLAR</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Kurye, taşıma sırasında ürünün formunu korumakla yükümlüdür.</li>
              <li>Müşteri ile iletişimde profesyonel dil kullanılmalıdır.</li>
              <li>Müşteri adres ve telefon bilgileri, teslimat harici hiçbir amaçla kullanılamaz.</li>
            </ul>
          </div>
        </div>
      )
    },

    // 3. SATICI (VENDOR) SÖZLEŞMESİ
    vendor: {
      title: "Satıcı İş Ortaklığı Sözleşmesi",
      body: (
        <div className="space-y-6 text-gray-800 font-sans text-sm leading-relaxed">
          <div>
            <h4 className="font-bold text-black uppercase mb-2">1. TARAFLAR VE AMAÇ</h4>
            <p>Bu sözleşme, ürünlerini ÇiçekSepeti UK üzerinde listelemek isteyen Satıcı ile Platform arasındadır.</p>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">2. KOMİSYON VE ÖDEME</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Platform, gerçekleşen her satıştan %10 Komisyon bedeli tahsil eder.</li>
              <li>Ödemeler, sipariş tamamlandıktan 7 gün sonra Satıcı hesabına aktarılır.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase mb-2">3. ÜRÜN STANDARTLARI</h4>
            <p>Satıcı, platforma yüklediği görsel ile birebir aynı kalitede ve tazelikte ürün hazırlamakla yükümlüdür. Ayıplı ürünlerde ücret iadesi Satıcı'dan kesilir.</p>
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
            <p>Son Güncelleme: {new Date().toLocaleDateString()}</p>
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
              <FiCheck /> Okudum, Kabul Ediyorum
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default TermsModal;