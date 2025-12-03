import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiArrowLeft, FiCheck, FiXCircle, FiMaximize, FiZoomIn, FiZoomOut, FiRotateCw } from "react-icons/fi";
import SecureImage from "../SecureImage"; // Bir üst klasörde olduğunu varsayıyorum
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ApplicationDetailsModal = ({ application, onClose, onApprove, onReject }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null); // Zoom için state

  // Portal Hedefi
  const modalRoot = document.getElementById("modal-root") || document.body;

  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; setIsMounted(false); };
  }, []);

  if (!isMounted || !application) return null;

  const getImageUrl = (appData) => appData?.licenseImage || appData?.documentImage;

  // --- MODAL İÇERİĞİ ---
  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      
      {/* Ana Kutu */}
      <div className="bg-white w-[95%] h-[90vh] max-w-6xl rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Başvuru Detayı</h3>
            <p className="text-sm text-blue-600 font-bold">{application.fullName} ({application.role === 'vendor' ? 'Satıcı' : 'Kurye'})</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-4xl font-bold transition leading-none p-2 rounded-full hover:bg-gray-200">
            <FiX />
          </button>
        </div>

        {/* İçerik (Scroll Edilebilir) */}
        <div className="p-8 overflow-y-auto flex-1 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">
            
            {/* Sol: Bilgiler */}
            <div className="space-y-4 h-fit bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="text-lg font-bold text-gray-700 uppercase border-b pb-2 mb-4">Kimlik & İletişim</h4>
              {application.applicationData && Object.entries(application.applicationData).map(([key, value]) => {
                // Resim ve teknik alanları gizle
                if (key === 'licenseImage' || key === 'documentImage' || key === 'requestedRole' || key === 'rejectionReason') return null; 
                return (
                  <div key={key} className="flex justify-between py-4 border-b border-gray-200 last:border-0">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-bold text-gray-900 text-right text-lg break-all pl-6">{value}</span>
                  </div>
                );
              })}
            </div>

            {/* Sağ: Belge Görseli */}
            <div className="flex flex-col h-full">
              <h4 className="text-lg font-bold text-gray-700 uppercase border-b pb-2 mb-4">Yüklenen Belge</h4>
              {getImageUrl(application.applicationData) ? (
                <div 
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 flex items-center justify-center group cursor-zoom-in hover:border-blue-400 transition relative min-h-[400px]"
                  onClick={() => setZoomedImage(getImageUrl(application.applicationData))}
                >
                  <SecureImage 
                    src={getImageUrl(application.applicationData)} 
                    className="max-h-full max-w-full object-contain rounded shadow-sm" 
                    alt="Belge"
                  />
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-2 rounded-lg pointer-events-none flex items-center gap-2 font-bold shadow-lg">
                    <FiMaximize /> Tıkla & Büyüt
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl text-gray-400 border border-dashed text-xl font-bold">Belge Yüklenmemiş.</div>
              )}
            </div>

          </div>
        </div>

        {/* Footer (Sabit Alt Bar) */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-4 shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
           <button 
             onClick={onClose} 
             className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-100 mr-auto shadow-sm"
           >
             <FiArrowLeft /> Geri Dön
           </button>

           <button 
             onClick={() => onReject(application._id)} 
             className="flex items-center gap-2 px-8 py-4 bg-red-50 text-red-600 border-2 border-red-200 font-bold text-lg rounded-xl hover:bg-red-100 shadow-sm"
           >
             <FiXCircle /> Reddet
           </button>
           
           <button 
             onClick={() => onApprove(application)} 
             className="flex items-center gap-2 px-10 py-4 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition transform active:scale-95"
           >
             <FiCheck /> Onayla
           </button>
        </div>

      </div>

      {/* --- İÇ ZOOM MODALI (Portal İçinde Portal Olmaz, Div Olarak Ekliyoruz) --- */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100000] bg-black/95 flex items-center justify-center overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setZoomedImage(null)} className="absolute top-5 right-5 text-white/70 hover:text-white text-5xl z-[100002] cursor-pointer transition bg-white/10 rounded-full p-2"><FiX /></button>
          
          <TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit={true}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100002] flex gap-6 bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => zoomIn()} className="text-white p-3 hover:bg-white/20 rounded-full transition"><FiZoomIn size={32} /></button>
                  <button onClick={() => zoomOut()} className="text-white p-3 hover:bg-white/20 rounded-full transition"><FiZoomOut size={32} /></button>
                  <button onClick={() => resetTransform()} className="text-white p-3 hover:bg-white/20 rounded-full transition"><FiRotateCw size={32} /></button>
                </div>
                <TransformComponent wrapperClass="w-screen h-screen flex items-center justify-center" contentClass="flex items-center justify-center w-full h-full">
                  <SecureImage src={zoomedImage} className="max-w-none max-h-[90vh] object-contain shadow-2xl cursor-grab active:cursor-grabbing" alt="Zoom Belge" />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      )}

    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default ApplicationDetailsModal;