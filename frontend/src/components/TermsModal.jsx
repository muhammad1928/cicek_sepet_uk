const TermsModal = ({ onClose, type }) => {
  const content = {
    // 1. MÜŞTERİ SÖZLEŞMESİ
    customer: {
      title: "Mesafeli Satış & Gizlilik Sözleşmesi",
      text: `
        1. TARAFLAR
        İşbu sözleşme ÇiçekSepeti UK ile kullanıcı arasında akdedilmiştir.

        2. KİŞİSEL VERİLERİN KORUNMASI (GDPR)
        Kullanıcının adı, adresi ve iletişim bilgileri, siparişin teslimi amacıyla kurye ve satıcı ile paylaşılabilir.
        Verileriniz 3. taraf reklam şirketleriyle asla paylaşılmaz.

        3. İADE VE İPTAL
        Canlı çiçeklerde iade, ürün solmuş veya hasarlı geldiyse teslimat anında yapılmalıdır.
        ...
      `
    },
    // 2. KURYE SÖZLEŞMESİ
    courier: {
      title: "Kurye İş Ortaklığı ve Sorumluluk Sözleşmesi",
      text: `
        1. TESLİMAT SORUMLULUĞU
        Kurye, teslim aldığı ürünü hasarsız ve zamanında teslim etmekle yükümlüdür.
        Teslimat sırasında oluşacak hasarlardan kurye sorumlu tutulabilir.

        2. ÖDEME
        Hakedişler, tamamlanan sipariş başına hesaplanır ve haftalık olarak ödenir.
        
        3. GİZLİLİK
        Kurye, müşterinin adres ve iletişim bilgilerini teslimat harici kullanamaz.
      `
    },
    // 3. SATICI (VENDOR) SÖZLEŞMESİ
    vendor: {
      title: "Satıcı / Mağaza Ortaklık Sözleşmesi",
      text: `
        1. ÜRÜN KALİTESİ
        Satıcı, sitede sergilediği görsel ile birebir aynı ve taze ürün göndermekle yükümlüdür.
        Solmuş veya ayıplı ürünlerde ücret iadesi satıcıdan kesilir.

        2. ÖDEME
        Satışlardan %10 komisyon kesilir. Kalan tutar haftalık olarak hesaba yatırılır.
      `
    },
    // Varsayılan (User)
    user: { title: "Kullanıcı Sözleşmesi", text: "Genel kullanım şartları..." }
  };

  // Gelen 'type' parametresine göre metni seç (customer, courier, vendor)
  const data = content[type] || content.customer;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">{data.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 text-2xl font-bold">✕</button>
        </div>

        <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed whitespace-pre-line font-mono bg-gray-50/50">
          {data.text}
        </div>

        <div className="p-5 border-t bg-gray-50 text-right">
          <button 
            onClick={onClose}
            className="bg-pink-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-pink-700 transition shadow-lg"
          >
            Okudum, Kabul Ediyorum
          </button>
        </div>

      </div>
    </div>
  );
};

export default TermsModal;