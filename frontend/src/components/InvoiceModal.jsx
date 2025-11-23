import { useEffect } from "react";

const InvoiceModal = ({ order, onClose }) => {
  if (!order) return null;

  // Yazdır Fonksiyonu
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      
      {/* Fatura Kağıdı (A4 Görünümü) */}
      <div className="bg-white w-full max-w-2xl min-h-[600px] p-8 rounded-lg shadow-2xl relative print:w-full print:h-full print:fixed print:inset-0 print:z-[3000] print:rounded-none">
        
        {/* Kapat Butonu (Yazdırırken gizlenir) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl font-bold print:hidden"
        >
          ✕
        </button>

        {/* --- FATURA İÇERİĞİ --- */}
        <div id="invoice-content">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">ÇiçekSepeti UK</h1>
              <p className="text-sm text-gray-500 mt-1">Londra'nın En Taze Çiçekleri</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">FATURA</h2>
              <p className="text-sm font-mono text-gray-600 mt-1">#{order._id.slice(-8).toUpperCase()}</p>
              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Adresler */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Gönderen (Satıcı)</h3>
              <p className="font-bold text-gray-800">ÇiçekSepeti UK Ltd.</p>
              <p className="text-sm text-gray-600">123 Oxford Street</p>
              <p className="text-sm text-gray-600">London, W1D 1BS</p>
              <p className="text-sm text-gray-600">United Kingdom</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Alıcı (Müşteri)</h3>
              <p className="font-bold text-gray-800">{order.recipient.name}</p>
              <p className="text-sm text-gray-600">{order.recipient.phone}</p>
              <p className="text-sm text-gray-600">{order.recipient.address}</p>
              <p className="text-sm text-gray-600">{order.recipient.postcode}, {order.recipient.city}</p>
            </div>
          </div>

          {/* Tablo */}
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                <th className="p-3 border-b">Ürün</th>
                <th className="p-3 border-b text-center">Adet</th>
                <th className="p-3 border-b text-right">Birim Fiyat</th>
                <th className="p-3 border-b text-right">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="text-sm border-b border-gray-100">
                  <td className="p-3 font-medium text-gray-800">{item.title}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">£{item.price}</td>
                  <td className="p-3 text-right font-bold">£{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Toplam */}
          <div className="flex justify-end mb-12">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Ara Toplam:</span>
                <span>£{order.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 border-b pb-2">
                <span>Kargo:</span>
                <span>£0.00</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
                <span>GENEL TOPLAM:</span>
                <span>£{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Notlar */}
          {order.delivery.cardMessage && (
            <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Hediye Notu:</h4>
              <p className="italic text-gray-700">"{order.delivery.cardMessage}"</p>
            </div>
          )}

          <div className="text-center text-xs text-gray-400 mt-12">
            Teşekkür ederiz! Sorularınız için destek@ciceksepeti.uk
          </div>

        </div>

        {/* Yazdır Butonu (Yazdırırken gizlenir) */}
        <div className="mt-8 text-right print:hidden border-t pt-6">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 font-bold hover:bg-gray-50 mr-4"
          >
            Kapat
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2 inline-flex"
          >
            <span>🖨️</span> Yazdır
          </button>
        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;