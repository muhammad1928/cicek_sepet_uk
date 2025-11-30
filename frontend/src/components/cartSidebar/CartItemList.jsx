import { FiTrash2 } from "react-icons/fi";

const CartItemList = ({ cart, increaseQuantity, decreaseQuantity, updateItemQuantity, removeFromCart, setItemToDelete }) => {
  
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 opacity-60">
        <span className="text-6xl mb-4">🛒</span>
        <p>Sepetiniz henüz boş.</p>
      </div>
    );
  }

  const handleQuantityInput = (e, item) => {
    const val = e.target.value;
    if (val === "") {
      updateItemQuantity(item._id, 1, item.stock, item.title);
      return;
    }
    const numVal = parseInt(val);
    if (!isNaN(numVal)) {
      updateItemQuantity(item._id, numVal, item.stock, item.title);
    }
  };

  return (
    <div className="space-y-4">
      {cart.map((item) => (
        <div key={item._id} className="flex gap-4 items-center bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:shadow-md transition group">
          
          <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
            <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
            <div className="text-pink-600 font-extrabold mt-1">£{item.price * item.quantity}</div>
            
            <div className="flex items-center gap-2 mt-2">
               <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                 <button onClick={() => {if(item.quantity===1) setItemToDelete(item); else decreaseQuantity(item._id, item.title)}} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition font-bold">-</button>
                 <input type="number" value={item.quantity} onChange={(e) => handleQuantityInput(e, item)} className="w-8 h-7 text-center bg-transparent font-bold text-sm outline-none" />
                 <button onClick={() => increaseQuantity(item._id, item.title, item.stock)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition font-bold">+</button>
               </div>
            </div>
          </div>
          
          <button onClick={() => setItemToDelete(item)} className="text-gray-300 hover:text-red-500 transition p-2">
            <FiTrash2 size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CartItemList;