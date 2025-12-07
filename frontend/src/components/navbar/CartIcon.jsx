import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../../context/CartContext";

const CartIcon = () => {
  const { cart, setIsCartOpen } = useCart();

  return (
    <div className="group relative">
      <button onClick={() => setIsCartOpen(true)} className="custom-btn p-2 flex items-center justify-center">
        <FiShoppingCart className="text-lg group-hover:rotate-12 transition" />
      </button>
      {cart.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-20 pointer-events-none animate-bounce-short">
          {cart.reduce((acc, item) => acc + item.quantity, 0)}
        </span>
      )}
    </div>
  );
};

export default CartIcon;