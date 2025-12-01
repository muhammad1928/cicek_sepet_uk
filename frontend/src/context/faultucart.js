import { createContext, useContext, useState, useEffect } from "react";
import {  userRequest } from "../requestMethods";
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  
  // 1. SEPET YÜKLEME
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch { return []; }
  });

  // 2. FAVORİLERİ YÜKLEME
  const [favorites, setFavorites] = useState(() => {
    try {
      const storedFavs = localStorage.getItem("favorites");
      return storedFavs ? JSON.parse(storedFavs) : [];
    } catch { return []; }
  });

  // GLOBAL STATE'LER
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(""); 

  // --- BİLDİRİM STATE'İ (SENİN YAPINLA UYUMLU) ---
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState("success");

  // Kaydetme (Persistence)
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); setCart(prev => prev.filter(item => item.quantity > 0)); }, [cart]);
  useEffect(() => { localStorage.setItem("favorites", JSON.stringify(favorites)); }, [favorites]);

  // --- BİLDİRİM FONKSİYONU (SENİN YAPINLA UYUMLU) ---
  const notify = (msg, type = "success") => {
    setNotification(msg);
    setNotificationType(type);
  };
  
  const closeNotification = () => setNotification(null);

  // --- SEPET İŞLEMLERİ ---
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item._id === product._id);
    const itemStock = product.stock || Infinity;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > itemStock) return notify(`Stok yetersiz! Max: ${itemStock}`, "error");
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: newQuantity } : item));
    } else {
      if (quantity > itemStock) return notify("Stok yetersiz!", "error");
      setCart([...cart, { ...product, quantity }]);
    }
    notify(`${product.title} sepete eklendi!`, "success");
  };

  const removeFromCart = (id, title) => {
    setCart(cart.filter(item => item._id !== id));
    if(title) notify(`${title} silindi.`, "warning");
  };

  const clearCart = () => {
    setCart([]);
    // notify("Sepet temizlendi.", "warning"); // İstersen açabilirsin
  };

  const increaseQuantity = (id, title, stock) => {
    setCart(cart.map(item => {
      if (item._id === id) {
        if (item.quantity + 1 > stock) { notify("Maksimum stok!", "error"); return item; }
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    }));
  };

  const decreaseQuantity = (id, title) => {
    setCart(cart.map(item => item._id === id ? { ...item, quantity: item.quantity - 1 } : item).filter(item => item.quantity > 0));
  };

  const updateItemQuantity = (id, amount, stock, title) => {
     if (amount > stock) { notify("Stok yetersiz", "error"); amount = stock; }
     if (amount < 1) return removeFromCart(id, title);
     setCart(cart.map(item => item._id === id ? { ...item, quantity: amount } : item));
  };
  
  const toggleFavorite = async (productId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (favorites.includes(productId)) {
      setFavorites(prev => prev.filter(id => id !== productId));
      notify("Favorilerden çıkarıldı", "warning");
      if(user) await userRequest.put(`/users/${user._id}/favorites`, { productId });
    } else {
      setFavorites(prev => [...prev, productId]);
      notify("Favorilere eklendi", "success");
      if(user) await userRequest.put(`/users/${user._id}/favorites`, { productId });
    }
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity, updateItemQuantity,
      totalPrice, isCartOpen, setIsCartOpen, favorites, toggleFavorite, searchTerm, setSearchTerm, 
      
      // Senin Toast bileşeninle uyumlu fonksiyonlar:
      notification, notificationType, notify, closeNotification
    }}>
      {children}
    </CartContext.Provider>
  );
};