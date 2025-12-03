import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiArrowLeft, FiCheck, FiXCircle, FiMaximize, FiZoomIn, FiZoomOut, FiRotateCw, FiActivity, FiFileText, FiClock, FiMapPin, FiMonitor } from "react-icons/fi";
import SecureImage from "../SecureImage"; 
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ApplicationDetailsModal = ({ application, onClose, onApprove, onReject }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  // Sekme Yönetimi (Başvuru vs Geçmiş)
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'logs'

  const modalRoot = document.getElementById("modal-root") || document.body;

  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; setIsMounted(false); };
  }, []);

  if (!isMounted || !application) return null;

  const getImageUrl = (appData) => appData?.licenseImage || appData?.documentImage;
  
  // Logları Sırala
  const logs = application.activityLog ? [...application.activityLog].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

  // Log Yardımcıları (UserActivityModal'dan alındı)
  const getActionLabel = (action) => {
    const labels = { 'login': 'Giriş', 'register': 'Kayıt', 'partner_application': 'Başvuru Yaptı', 'profile_update': 'Profil Güncelleme' };
    return labels[action] || action;
  };
  const getActionColor = (action) => {
    if (action.includes('login') || action.includes('register')) return 'text-green-600 bg-green-50';
    if (action.includes('application')) return 'text-purple-600 bg-purple-50';
    return 'text-blue-600 bg-blue-50';
  };

  // --- MODAL İÇERİĞİ ---
  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      
      <div className="bg-white w-[95%] h-[90vh] max-w-6xl rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Başvuru İnceleme</h3>
            <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase text-white ${application.applicationData?.requestedRole === 'vendor' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                    {application.applicationData?.requestedRole === 'vendor' ? 'Satıcı' : 'Kurye'}
                </span>
                <span className="text-sm font-bold text-gray-600">{application.fullName}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 text-3xl transition p-2 rounded-full hover:bg-gray-200"><FiX /></button>
        </div>

        {/* Sekmeler */}
        <div className="flex border-b border-gray-200 bg-white px-6 pt-2 gap-6">
            <button onClick={() => setActiveTab("details")} className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 ${activeTab === "details" ? "text-purple-600 border-purple-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}>
                <FiFileText /> Başvuru Bilgileri
            </button>
            <button onClick={() => setActiveTab("logs")} className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 ${activeTab === "logs" ? "text-purple-600 border-purple-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}>
                <FiActivity /> Aktivite Geçmişi <span className="bg-gray-100 text-gray-600 px-2 rounded-full text-[10px]">{logs.length}</span>
            </button>
        </div>

        {/* İçerik (Scroll Edilebilir) */}
        <div className="p-8 overflow-y-auto flex-1 bg-white">
          
          {/* --- SEKME 1: DETAYLAR --- */}
          {activeTab === "details" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">
                {/* Sol: Bilgiler */}
                <div className="space-y-4 h-fit bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="text-lg font-bold text-gray-700 uppercase border-b pb-2 mb-4">Kimlik & İletişim</h4>
                {application.applicationData && Object.entries(application.applicationData).map(([key, value]) => {
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
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 flex items-center justify-center group cursor-zoom-in hover:border-blue-400 transition relative min-h-[400px]" onClick={() => setZoomedImage(getImageUrl(application.applicationData))}>
                        <SecureImage src={getImageUrl(application.applicationData)} className="max-h-full max-w-full object-contain rounded shadow-sm" alt="Belge" />
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-2 rounded-lg pointer-events-none flex items-center gap-2 font-bold shadow-lg"><FiMaximize /> Tıkla & Büyüt</div>
                    </div>
                ) : <div className="text-center py-20 bg-gray-50 rounded-xl text-gray-400 border border-dashed text-xl font-bold">Belge Yüklenmemiş.</div>}
                </div>
              </div>
          )}

          {/* --- SEKME 2: AKTİVİTE LOGLARI --- */}
          {activeTab === "logs" && (
              <div className="space-y-4">
                  {logs.length === 0 ? (
                      <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-xl">Henüz kayıtlı aktivite yok.</div>
                  ) : (
                      logs.map((log, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition bg-white">
                            <div className="w-full md:w-40 shrink-0 flex flex-col gap-1">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase w-fit ${getActionColor(log.action)}`}>{getActionLabel(log.action)}</span>
                                <div className="flex items-center gap-1 text-xs text-gray-500 font-mono"><FiClock /> {new Date(log.date).toLocaleString()}</div>
                            </div>
                            <div className="flex-1 text-sm text-gray-700 border-l pl-4">
                                {log.details ? JSON.stringify(log.details) : <span className="italic text-gray-400">Detay yok</span>}
                            </div>
                            <div className="w-full md:w-40 shrink-0 text-[10px] text-gray-400 flex flex-col gap-1 border-l pl-4">
                                <div className="flex items-center gap-1"><FiMonitor/> {log.deviceInfo?.deviceType || 'Unknown'}</div>
                                <div className="flex items-center gap-1"><FiMapPin/> {log.ip}</div>
                            </div>
                        </div>
                      ))
                  )}
              </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
           <button onClick={onClose} className="flex items-center gap-2 px-6 py-3 border bg-white text-gray-600 font-bold rounded-xl hover:bg-gray-100 mr-auto">Geri Dön</button>
           <button onClick={() => onReject(application._id)} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100">Reddet</button>
           <button onClick={() => onApprove(application)} className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg active:scale-95 transition">Onayla</button>
        </div>

      </div>

      {/* Zoom Modalı */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100000] bg-black/95 flex items-center justify-center overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setZoomedImage(null)} className="absolute top-5 right-5 text-white/70 hover:text-white text-5xl z-[100002] cursor-pointer"><FiX /></button>
          <TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit={true}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100002] flex gap-6 bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => zoomIn()} className="text-white p-3 hover:bg-white/20 rounded-full"><FiZoomIn size={32} /></button>
                  <button onClick={() => zoomOut()} className="text-white p-3 hover:bg-white/20 rounded-full"><FiZoomOut size={32} /></button>
                  <button onClick={() => resetTransform()} className="text-white p-3 hover:bg-white/20 rounded-full"><FiRotateCw size={32} /></button>
                </div>
                <TransformComponent wrapperClass="w-screen h-screen flex items-center justify-center" contentClass="flex items-center justify-center w-full h-full">
                  <SecureImage src={zoomedImage} className="max-w-none max-h-[90vh] object-contain cursor-grab active:cursor-grabbing" alt="Zoom" />
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