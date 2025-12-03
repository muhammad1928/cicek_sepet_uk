import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { useTranslation } from "react-i18next";

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <Seo title="Sayfa Bulunamadı" noindex={true} />
      
      <div className="text-9xl font-extrabold text-pink-200 select-none">404</div>
      <h1 className="text-3xl font-bold text-gray-800 -mt-12 mb-4 relative z-10">{t("notFound.title")}</h1>
      <p className="text-gray-500 max-w-md mb-8">
        {t("notFound.description")}
      </p>
      <Link 
        to="/"
        className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition shadow-lg hover:shadow-pink-500/30"
      >
        {t("common.backToHome")}
      </Link>
    </div>
  );
};

export default NotFoundPage;