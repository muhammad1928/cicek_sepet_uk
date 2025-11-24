import { useEffect } from "react";

const InvoiceModal = ({ order, onClose }) => {
  if (!order) return null;

  // --- VERGİ VE ALT TOPLAM HESABI ---
  // İngiltere KDV (VAT) oranı genelde %20'dir.
  // Formül: Toplam Tutar = Ara Toplam + (Ara Toplam * 0.20)
  // Tersen gidersek: Ara Toplam = Toplam Tutar / 1.20
  const vatRate = 0.20;
  const subTotal = order.totalAmount / (1 + vatRate);
  const vatAmount = order.totalAmount - subTotal;

  const handlePrint = () => {
    window.print();
  };

  return (
    // DIŞ KAPSAYICI: Ekranı kaplar, ortalar
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      
      {/* MODAL KUTUSU: Max yükseklik ekranın %90'ı, taşarsa scroll olur */}
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl relative flex flex-col print:w-full print:h-full print:max-h-none print:fixed print:inset-0 print:rounded-none">
        
        {/* ÜST BAR (SABİT): Kapat butonu burada */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-xl print:hidden sticky top-0 z-10">
          <h3 className="font-bold text-gray-700">Fatura Önizleme</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-red-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* --- FATURA İÇERİĞİ (SCROLL EDİLEBİLİR ALAN) --- */}
        <div id="invoice-content" className="p-8 overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">ÇiçekSepeti UK</h1>
              <p className="text-sm text-gray-500 mt-1">London's Fresh Flowers</p>
              <p className="text-xs text-gray-400 mt-1">VAT No: GB123456789</p> {/* Örnek Vergi No */}
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">INVOICE</h2>
              <p className="text-sm font-mono text-gray-600 mt-1">#{order._id.slice(-8).toUpperCase()}</p>
              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Adresler */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Satıcı (From)</h3>
              <p className="font-bold text-gray-800">ÇiçekSepeti UK Ltd.</p>
              <p className="text-sm text-gray-600">123 Oxford Street</p>
              <p className="text-sm text-gray-600">London, W1D 1BS</p>
              <p className="text-sm text-gray-600">United Kingdom</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Alıcı (To)</h3>
              <p className="font-bold text-gray-800">{order.recipient.name}</p>
              <p className="text-sm text-gray-600">{order.recipient.phone}</p>
              <p className="text-sm text-gray-600">{order.recipient.address}</p>
              <p className="text-sm text-gray-600">{order.recipient.postcode}, {order.recipient.city}</p>
            </div>
          </div>

          {/* Ürün Tablosu */}
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                <th className="p-3 border-b">Ürün / Hizmet</th>
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
                  <td className="p-3 text-right">£{item.price.toFixed(2)}</td>
                  <td className="p-3 text-right font-bold">£{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* --- HESAP ÖZETİ (VERGİ DAHİL) --- */}
          <div className="flex justify-end mb-12">
            <div className="w-64 space-y-2">
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Ara Toplam (Subtotal):</span>
                <span>£{subTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>KDV (%20 VAT):</span>
                <span>£{vatAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 border-b pb-2">
                <span>Kargo:</span>
                <span>£0.00</span>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
                <span>GENEL TOPLAM:</span>
                <span>£{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notlar */}
          {order.delivery.cardMessage && (
            <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4 print:border-black">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Hediye Notu:</h4>
              <p className="italic text-gray-700 font-serif">"{order.delivery.cardMessage}"</p>
            </div>
          )}

          <div className="text-center text-xs text-gray-400 mt-12 pt-8 border-t">
            Thank you for your business! • support@ciceksepeti.uk • +44 20 7946 0000
          </div>

        </div>

        {/* ALT BAR (YAZDIR BUTONU) */}
        <div className="p-4 border-t bg-gray-50 text-right rounded-b-xl print:hidden sticky bottom-0 z-10">
          <button 
            onClick={handlePrint}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2 ml-auto"
          >
            <span>🖨️</span> Yazdır / PDF Kaydet
          </button>
        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;