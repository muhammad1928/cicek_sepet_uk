import { FiShield } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const OrderMetadata = ({ meta }) => {
  const { t } = useTranslation();
  if (!meta) return <div className="text-xs text-gray-400 italic mt-2">{t('adminComponents.adminOrderComp.OrderMetadata.metaDataNotAvailable')}</div>;

  return (
    <div className="mt-6 bg-slate-800 text-slate-300 p-5 rounded-xl font-mono text-xs shadow-inner animate-fade-in">
      <h4 className="font-bold text-white border-b border-slate-600 pb-2 mb-3 flex items-center gap-2">
        <FiShield className="text-green-400" /> {t('adminComponents.adminOrderComp.OrderMetadata.securityAndMetadata')}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-6">
        <div><span className="text-slate-500 block mb-1">IP Adresi:</span> <span className="text-white bg-slate-700 px-2 py-0.5 rounded">{meta.ip || "Bilinmiyor"}</span></div>
        <div><span className="text-slate-500 block mb-1">Device & OS:</span> {meta.deviceType} / {meta.osName}</div>
        <div><span className="text-slate-500 block mb-1">Engine:</span> {meta.browserName}</div>
        <div><span className="text-slate-500 block mb-1">Screen:</span> {meta.screenResolution}</div>
        <div><span className="text-slate-500 block mb-1">Language / Region:</span> {meta.language} / {meta.timeZone}</div>
        <div><span className="text-slate-500 block mb-1">Connection:</span> {meta.connectionType || "Unknown"}</div>
      </div>
    </div>
  );
};

export default OrderMetadata;