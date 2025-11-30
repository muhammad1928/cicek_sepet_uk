import { useEffect, useState } from "react";
import { createPortal } from "react-dom"; 
import { FiX, FiPrinter } from "react-icons/fi";

const InvoiceModal = ({ order, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  const modalRoot = document.getElementById("modal-root") || document.body;

  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
      setIsMounted(false);
    };
  }, []);

  if (!isMounted || !order) return null;

  // --- HESAPLAMALAR ---
  const total = order.totalAmount || 0;
  const deliveryFee = order.deliveryFee || 0;
  const productTotal = total - deliveryFee;
  const vatRate = 0.20; 
  const netAmount = productTotal / (1 + vatRate);
  const vatAmount = productTotal - netAmount;

  const handlePrint = () => {
    window.print();
  };

  // --- TARİH FORMATLAYICI ---
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.toLocaleDateString('tr-TR')} ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
      
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col relative overflow-hidden print:fixed print:inset-0 print:w-full print:h-full print:max-h-none print:rounded-none print:z-[10000] print:overflow-visible border border-gray-200">
        
        {/* HEADER (Yazıcıda Gizli) */}
        <div className="p-5 border-b bg-gray-50 flex justify-between items-center print:hidden shrink-0">
          <h3 className="font-bold text-gray-700 text-lg">Sipariş Faturası</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-red-600 text-3xl font-bold transition leading-none p-1 rounded-full hover:bg-red-50"
            title="Kapat"
          >
            <FiX />
          </button>
        </div>

        {/* FATURA İÇERİĞİ */}
        <div className="p-10 overflow-y-auto flex-1 bg-white text-gray-800 font-mono text-sm print:p-0 print:overflow-visible" id="invoice-content">
          
          {/* Şirket ve Fatura Bilgileri */}
          <div className="flex justify-between items-start mb-10 border-b-2 border-gray-800 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">ÇiçekSepeti UK</h1>
              <p className="text-gray-600">123 Oxford Street</p>
              <p className="text-gray-600">London, W1D 1BS</p>
              <p className="text-gray-600">United Kingdom</p>
              <p className="mt-2 text-xs text-gray-500 font-bold">VAT No: GB123456789</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-widest">INVOICE</h2>
              <p className="mt-2 font-bold text-lg">#{order._id.slice(-8).toUpperCase()}</p>
              
              {/* --- TARİH BİLGİLERİ (GÜNCELLENDİ) --- */}
              <div className="mt-2 text-gray-600 text-xs space-y-1">
                <p>
                  <span className="font-bold">Sipariş Tarihi:</span> <br/>
                  {formatDateTime(order.createdAt)}
                </p>
                <p>
                  <span className="font-bold">Teslimat Tarihi:</span> <br/>
                  {formatDate(order.delivery.date)}
                </p>
              </div>
              {/* --------------------------------------- */}
            </div>
          </div>

          {/* Adresler */}
          <div className="flex justify-between mb-10 gap-8">
            <div className="w-1/2">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Fatura Edilen (Bill To):</h3>
              <p className="font-bold text-base text-gray-900">{order.sender.name}</p>
              <p>{order.sender.email}</p>
              <p>{order.sender.phone}</p>
            </div>
            <div className="w-1/2 text-right">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Teslim Edilen (Ship To):</h3>
              <p className="font-bold text-base text-gray-900">{order.recipient.name}</p>
              <p>{order.recipient.address}</p>
              <p>{order.recipient.city}, {order.recipient.postcode}</p>
              <p>{order.recipient.phone}</p>
            </div>
          </div>

          {/* Ürün Tablosu */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-xs border-b border-gray-300">
                <th className="py-3 px-2 text-left w-1/2">Ürün / Hizmet</th>
                <th className="py-3 px-2 text-center">Adet</th>
                <th className="py-3 px-2 text-right">Birim Fiyat</th>
                <th className="py-3 px-2 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-2 font-medium">{item.title}</td>
                  <td className="py-3 px-2 text-center">{item.quantity}</td>
                  <td className="py-3 px-2 text-right">£{item.price.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right font-bold">£{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Toplamlar */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Ara Toplam (Net):</span>
                <span>£{netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>KDV (%20 VAT):</span>
                <span>£{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-blue-600 font-medium">
                <span>Kargo:</span>
                <span>{deliveryFee === 0 ? "Ücretsiz" : `£${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t-2 border-gray-800 pt-3 mt-3 text-black">
                <span>GENEL TOPLAM:</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Alt Notlar */}
          {order.delivery.cardMessage && (
             <div className="mt-10 p-4 bg-gray-50 border border-gray-200 rounded italic text-center text-gray-600 print:border-gray-300">
               <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Kart Notu</span>
               "{order.delivery.cardMessage}"
             </div>
          )}
          
          <div className="mt-12 pt-8 border-t text-center text-xs text-gray-400">
            <p>Thank you for your business!</p>
            <p>support@ciceksepeti.uk • +44 20 7946 0000</p>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-5 border-t bg-gray-50 flex justify-end print:hidden shrink-0">
          <button 
            onClick={handlePrint} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg hover:shadow-blue-500/30 transition transform active:scale-95"
          >
            <FiPrinter size={20} /> Yazdır / PDF Kaydet
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default InvoiceModal;