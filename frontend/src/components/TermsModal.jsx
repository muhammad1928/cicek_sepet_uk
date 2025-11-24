const TermsModal = ({ onClose, type }) => {
  const content = {
    user: {
      title: "Kullanıcı Sözleşmesi & Gizlilik",
      text: `1. TARAFLAR\nİşbu sözleşme ÇiçekSepeti UK ile kullanıcı arasında...\n\n2. KULLANIM KOŞULLARI\nSitemizi kullanarak aşağıdaki şartları kabul etmiş sayılırsınız...\n\n3. GİZLİLİK\nVerileriniz 3. şahıslarla paylaşılmayacaktır...`
    },
    courier: {
      title: "Kurye İş Ortaklığı Sözleşmesi",
      text: `1. SORUMLULUKLAR\nKurye, teslim aldığı ürünü hasarsız teslim etmekle yükümlüdür...\n\n2. ÖDEME\nÖdemeler haftalık olarak yapılacaktır...`
    }
  };

  const data = content[type] || content.user;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">{data.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 text-2xl font-bold">✕</button>
        </div>
        <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {data.text}
        </div>
        <div className="p-5 border-t bg-gray-50 text-right">
          <button onClick={onClose} className="bg-pink-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-700 transition">
            Okudum, Anladım
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;