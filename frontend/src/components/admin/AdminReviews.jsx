import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";

const AdminReviews = () => {
  const [allReviews, setAllReviews] = useState([]);
  const { notify } = useCart();

  const fetchReviews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      let gatheredReviews = [];
      
      res.data.forEach(product => {
        product.reviews.forEach(review => {
          gatheredReviews.push({
            ...review,
            productId: product._id,
            productName: product.title,
            productImg: product.img
          });
        });
      });

      gatheredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllReviews(gatheredReviews);

    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDeleteReview = async (productId, reviewId) => {
    if(!confirm("Bu yorumu silmek istediğine emin misin?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}/reviews/${reviewId}`);
      notify("Yorum silindi 🗑️", "success");
      fetchReviews();
    } catch (err) {
      notify("Silinemedi", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Yorumlar <span className="text-sm bg-gray-100 px-2 py-1 rounded-full ml-2">{allReviews.length}</span>
        </h2>
        <button onClick={fetchReviews} className="text-blue-600 hover:underline text-sm font-bold">🔄 Yenile</button>
      </div>

      <div className="grid gap-4">
        {allReviews.length === 0 ? <div className="text-center py-10 text-gray-400">Henüz hiç yorum yok.</div> : 
          allReviews.map((review) => (
            <div key={review._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition">
              
              <img src={review.productImg} className="w-16 h-16 rounded-lg object-cover border" alt="Ürün" />

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{review.user}</h4>
                    <div className="text-xs text-gray-500">Ürün: <span className="font-semibold">{review.productName}</span></div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                
                <div className="mt-2">
                  <div className="text-yellow-400 text-xs mb-1">{"★".repeat(review.rating)}</div>
                  <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded italic border border-gray-100">
                    "{review.comment}"
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <button 
                  onClick={() => handleDeleteReview(review.productId, review._id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition"
                  title="Yorumu Sil"
                >
                  🗑️
                </button>
              </div>

            </div>
          ))
        }
      </div>
    </div>
  );
};

export default AdminReviews;