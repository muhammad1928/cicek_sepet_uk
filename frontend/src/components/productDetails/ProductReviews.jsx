import { useState } from "react";
import { Link } from "react-router-dom";
import { FiInfo } from "react-icons/fi";
import { publicRequest } from "../../requestMethods"; 

const ProductReviews = ({ product, user, t, notify, onReviewSubmit }) => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return notify(t("productDetail.loginBeforeComment"), "warning");
    if (!reviewText.trim()) return notify("Review cannot be empty", "warning");

    try {
      await publicRequest.post(`/products/${product._id}/reviews`, { 
        user: user.fullName || user.username, 
        rating, 
        comment: reviewText 
      });
      notify(t("productDetail.commentSubmitSuccess"), "success"); 
      setReviewText("");
      if (onReviewSubmit) onReviewSubmit(); 
    } catch (err) { 
      const msg = err.response?.data?.message || "Error occurred";
      notify(msg, "error"); 
    }
  };

  return (
    <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Yorum Formu */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 text-lg shadow-sm">✍️</span>
          {t("productDetail.submitReviewAlt")}
        </h3>
        {user ? (
          <form onSubmit={submitReview} className="bg-white p-8 rounded-3xl shadow-lg border border-white/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t("productDetail.yourRating")}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setRating(star)} className={`text-3xl transition hover:scale-110 transform ${star <= rating ? "text-yellow-400 drop-shadow-sm" : "text-gray-200"}`}>★</button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t("productDetail.yourReview")}</label>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-pink-500 focus:bg-white transition h-32 resize-none shadow-inner" placeholder={t("productDetail.placeholder")} />
            </div>
            <button type="submit" className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/30 transition w-full transform active:scale-95">{t("productDetail.submitReview")}</button>
          </form>
        ) : (
          <div className="bg-blue-50 p-10 rounded-3xl text-blue-800 border border-blue-100 text-center flex flex-col items-center justify-center h-full shadow-sm">
            <FiInfo className="text-4xl mb-3 opacity-50"/>
            <p className="text-lg">
              <Link to="/login" className="font-bold underline hover:text-blue-600 transition">{t("productDetail.loginTocomment1")}</Link> {t("productDetail.loginTocomment2")}
            </p>
          </div>
        )}
      </div>

      {/* Yorum Listesi */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg shadow-sm">💬</span>
          {t("common.reviews")} <span className="text-gray-400 text-lg font-normal">({product.reviews.length})</span>
        </h3>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scroll">
          {product.reviews.length === 0 ? <div className="text-gray-400 italic text-center p-10 border-2 border-dashed rounded-3xl bg-gray-50/50">{t("productDetail.firstComment")}</div> : 
            product.reviews.slice().reverse().map((review, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold shadow-inner border border-white">{review.user[0].toUpperCase()}</div>
                    <div>
                      <span className="font-bold text-gray-900 block">{review.user}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-yellow-400 text-sm bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 font-bold tracking-widest">{"★".repeat(review.rating)}</div>
                </div>
                <p className="text-gray-600 text-sm pl-14 leading-relaxed">{review.comment}</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;