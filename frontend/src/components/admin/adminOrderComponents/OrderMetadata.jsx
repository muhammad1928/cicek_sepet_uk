import { FiShield, FiGlobe, FiSmartphone, FiMonitor, FiCpu, FiWifi } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const OrderMetadata = ({ meta }) => {
  const { t } = useTranslation();
  
  if (!meta) return (
    <div className="text-xs text-gray-400 italic mt-2 p-2 border border-dashed border-gray-300 rounded">
        {t('adminComponents.adminOrderComp.OrderMetadata.metaDataNotAvailable') || "Metadata unavailable"}
    </div>
  );

  return (
    <div className="mt-6 bg-slate-800 text-slate-300 p-5 rounded-xl font-mono text-xs shadow-inner animate-fade-in">
      <h4 className="font-bold text-white border-b border-slate-600 pb-2 mb-3 flex items-center gap-2">
        <FiShield className="text-green-400" /> {t('adminComponents.adminOrderComp.OrderMetadata.securityAndMetadata') || "SECURITY & METADATA"}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
        
        {/* IP & Lokasyon */}
        <div>
            <span className="text-slate-500 block mb-1 font-bold">IP & Location:</span> 
            <div className="flex items-center gap-2">
                <span className="text-white bg-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <FiGlobe className="text-blue-400"/> {meta.ip || "Unknown"}
                </span>
            </div>
        </div>

        {/* Cihaz */}
        <div>
            <span className="text-slate-500 block mb-1 font-bold">Device Info:</span> 
            <div className="flex items-center gap-1">
                {meta.deviceType === 'mobile' ? <FiSmartphone className="text-pink-400"/> : <FiMonitor className="text-blue-400"/>}
                <span>{meta.osName} / {meta.browserName}</span>
            </div>
        </div>

        {/* Ekran & Dil */}
        <div>
            <span className="text-slate-500 block mb-1 font-bold">Screen & Lang:</span> 
            <span>{meta.screenResolution} - {meta.language}</span>
        </div>

        {/* Bağlantı */}
        <div>
            <span className="text-slate-500 block mb-1 font-bold">Connection:</span> 
            <span className="flex items-center gap-1"><FiWifi/> {meta.connectionType || "Unknown"}</span>
        </div>

        {/* Zaman Dilimi */}
        <div>
            <span className="text-slate-500 block mb-1 font-bold">Timezone:</span> 
            <span>{meta.timeZone || "-"}</span>
        </div>

        {/* User Agent (Kısaltılmış) */}
        <div className="lg:col-span-3 border-t border-slate-700 pt-2 mt-1">
            <span className="text-slate-600 block mb-1 text-[10px] uppercase">Raw User Agent:</span> 
            <span className="text-[10px] text-slate-500 break-all">{meta.userAgent}</span>
        </div>

      </div>
    </div>
  );
};

export default OrderMetadata;