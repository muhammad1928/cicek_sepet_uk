import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { publicRequest } from "../../requestMethods";

const RelatedProducts = ({ currentProduct }) => {
  const { t } = useTranslation();
  const [related, setRelated] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await publicRequest.get("/products");
        const filtered = res.data
            .filter(p => (p.category === currentProduct.category || p.tags?.includes(currentProduct.category)) && p._id !== currentProduct._id)
            .slice(0, 4);
        setRelated(filtered);
      } catch (err) { console.log(err); }
    };
    if (currentProduct) fetchRelated();
  }, [currentProduct]);

  if (related.length === 0) return null;

  return (
    <div className="mt-24 pt-12 border-t border-gray-200">
      <h3 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">{t("productDetail.similarProducts") || "You may also like"}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {related.map((item) => {
            const itemImg = (item.imgs && item.imgs.length > 0) ? item.imgs[0] : (item.img || "https://placehold.co/400");
            return (
                <div 
                    key={item._id} 
                    className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 shadow-sm"
                    onClick={() => { navigate(`/product/${item._id}`); window.scrollTo(0, 0); }}
                >
                    <div className="h-56 overflow-hidden relative bg-gray-50">
                        <img src={itemImg} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={item.title} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-500"></div>
                    </div>
                    <div className="p-5">
                        <h4 className="font-bold text-gray-900 text-sm truncate mb-2 group-hover:text-pink-600 transition">{item.title}</h4>
                        <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">£{item.price}</div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;