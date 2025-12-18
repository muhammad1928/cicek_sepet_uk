import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { userRequest } from "../requestMethods";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { t } = useTranslation();

  // --- 1. STATE TANIMLARI (Lazy Initialization ile Performans Artışı) ---
  // LocalStorage her render'da okunmaz, sadece ilk yüklemede okunur.
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("LocalStorage Cart Error:", error);
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const savedFavs = localStorage.getItem("favorites");
      return savedFavs ? JSON.parse(savedFavs) : [];
    } catch (error) {
      console.error("LocalStorage Favorites Error:", error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState("success");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  // --- 2. KULLANICI SENKRONİZASYONU ---
  useEffect(() => {
    const syncUserData = async () => {
      try {
        const storedUserRaw = localStorage.getItem("user");
        const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
        setUser(storedUser);

        if (storedUser && storedUser._id) {
          try {
            const res = await userRequest.get(`/users/${storedUser._id}/favorites`);
            setFavorites(res.data);
            localStorage.setItem("favorites", JSON.stringify(res.data));
          } catch (err) {
            // Önemli Loglama Kısımı
            if (err.response && err.response.status === 401) {
              console.warn("Session expired for favorites (Token Invalid).");
            } else {
              console.error("Favorites Sync Failed:", err);
            }
          }
        }
      } catch (err) {
        console.error("User Sync Parse Error:", err);
      }
    };

    syncUserData();
    
    // Kullanıcı giriş/çıkış yaptığında tetiklenmesi için event listener
    window.addEventListener('user-change', syncUserData);
    return () => window.removeEventListener('user-change', syncUserData);
  }, []);

  // --- 3. KALICILIK (LOCALSTORAGE) ---
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    // Geliştirme aşamasında sepeti konsolda görmek istersen:
    // console.log("Sepet Güncellendi:", cart); 
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // --- 4. YARDIMCI FONKSİYONLAR ---
  
  // Varyantlı ve Varyantsız Ürün ID Yönetimi
  const generateCartItemId = (product, variant) => {
    if (variant) {
      // Örnek ID: 64a...f12-M-Red
      return `${product._id}-${variant.size}-${variant.color}`;
    }
    return product._id;
  };

  const notify = (msg, type = "success") => {
    setNotification(msg);
    setNotificationType(type);
    
    // Bildirimi 3 saniye sonra otomatik temizle (Opsiyonel)
    // setTimeout(() => setNotification(null), 3000);
  };
  
  const closeNotification = () => setNotification(null);

  // Toplam Fiyat Hesaplama (Güvenli)
  const totalPrice = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  }, [cart]);

  // --- 5. CART AKSİYONLARI ---

  // EKLEME
  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    const cartItemId = generateCartItemId(product, selectedVariant);
    
    // Stok Kontrolü: Varyant stoğu öncelikli, yoksa ürün stoğu, o da yoksa sonsuz.
    const itemStock = selectedVariant?.stock ?? product.stock ?? Infinity;

    const existingItem = cart.find(item => item.cartItemId === cartItemId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > itemStock) {
        notify(`${t('cartContext.maxStockReached')}: ${itemStock}`, 'error');
        return;
      }
      
      setCart(prev => prev.map(item => 
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      ));
    } else {
      if (quantity > itemStock) {
        notify(`${t('cartContext.maxStockReached')}: ${itemStock}`, 'error');
        return;
      }

      setCart(prev => [...prev, {
        ...product,
        cartItemId, // Kritik Benzersiz ID
        quantity,
        selectedVariant // Backend sipariş oluştururken lazım olabilir
      }]);
    }
    notify(`${product.title} ${t('cartContext.added')}`, 'success');
  };

  // SİLME
  const removeFromCart = (cartItemId, title) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    if (title) notify(`${title} ${t('cartContext.removed')}`, 'error');
  };

  // TEMİZLEME
  const clearCart = () => {
    setCart([]);
    notify(t('cartContext.cartEmpty'), 'warning');
  };

  // MİKTAR ARTIRMA
  const increaseQuantity = (cartItemId, title, stock) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        if (item.quantity + 1 > stock) {
          notify(`${t('cartContext.maxLimitReached')}`, 'error');
          return item;
        }
        notify(`${title} ${t('cartContext.increased')}`, 'success');
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    }));
  };

  // MİKTAR AZALTMA
  const decreaseQuantity = (cartItemId, title) => {
    // Önce bildirimi verelim
    notify(`${title} ${t('cartContext.decreased')}`, 'warning');
    
    setCart(prev => {
      // Önce azalt, sonra 0 veya altındakileri filtrele
      return prev.map(item => 
        item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item
      ).filter(item => item.quantity > 0);
    });
  };

  // MANUEL GÜNCELLEME (Input ile)
  const updateItemQuantity = (cartItemId, newQuantity, stock, title) => {
    let quantityToSet = parseInt(newQuantity);

    if (isNaN(quantityToSet)) return; // Sayı değilse işlem yapma

    if (quantityToSet > stock) {
      notify(`${t('cartContext.maxStockReached')} ${stock}`, 'error');
      quantityToSet = stock;
    }

    if (quantityToSet <= 0) {
      removeFromCart(cartItemId, title);
      return;
    }

    notify(`${title} ${t('cartContext.updated')}: ${quantityToSet}`, 'success');
    setCart(prev => prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, quantity: quantityToSet } : item
    ));
  };

  // --- 6. FAVORİ İŞLEMLERİ ---
  const toggleFavorite = async (productId) => {
    const isCurrentlyFav = favorites.includes(productId);
    let updatedFavorites;

    // Optimistic UI Update (Anlık tepki için önce state'i güncelle)
    if (isCurrentlyFav) {
      updatedFavorites = favorites.filter(id => id !== productId);
    } else {
      updatedFavorites = [...favorites, productId];
    }
    setFavorites(updatedFavorites); // State hemen güncellendi

    const msg = isCurrentlyFav ? t('cartContext.deletedFromFavorites') : t('cartContext.addedToFavorites');
    const type = isCurrentlyFav ? "error" : "success";
    notify(msg, type);

    // Eğer kullanıcı giriş yapmışsa Backend'e gönder
    if (user && user._id) {
      try {
        await userRequest.put(`/users/${user._id}/favorites`, { productId });
        // Başarılı olursa zaten state güncel, bir şey yapmaya gerek yok.
      } catch (e) {
        console.error("Favorite Toggle Error:", e);
        // Hata olursa işlemi geri al (Rollback)
        setFavorites(favorites); 
        notify(t('cartContext.favoritesNotUpdated'), "error");
      }
    }
  };

  const isFavorite = (productId) => favorites.includes(productId);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        updateItemQuantity,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        notify,
        notification,
        notificationType,
        closeNotification,
        favorites,
        toggleFavorite,
        isFavorite,
        searchTerm,
        setSearchTerm,
        user,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);