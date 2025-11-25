import { Link } from "react-router-dom";
import Seo from "../components/Seo";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <Seo title="Sayfa Bulunamadı" noindex={true} />
      
      <div className="text-9xl font-extrabold text-pink-200 select-none">404</div>
      <h1 className="text-3xl font-bold text-gray-800 -mt-12 mb-4 relative z-10">Aradığınız Sayfa Bulunamadı</h1>
      <p className="text-gray-500 max-w-md mb-8">
        Gitmeye çalıştığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı olabilir.
      </p>
      <Link 
        to="/"
        className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition shadow-lg hover:shadow-pink-500/30"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default NotFoundPage;