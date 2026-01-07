import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
  products, 
  cart, 
  favorites, 
  toggleFavorite, 
  addToCart, 
  decreaseQuantity, 
  increaseQuantity, 
  updateItemQuantity, 
  removeFromCart, 
  maxAlertProd, 
  setItemToDelete, 
  triggerMaxAlert,
  decodeHtml,
  getCatLabel 
}) => {

  const getCartItem = (id) => cart.find(item => item._id === id);

  const handleDecrease = (e, product, currentQty) => { 
    e.stopPropagation(); 
    if (currentQty === 1) setItemToDelete(product); 
    else decreaseQuantity(product._id, product.title); 
  };

  const handleIncrease = (e, product) => { 
    e.stopPropagation(); 
    const qty = getCartItem(product._id)?.quantity || 0; 
    if (qty >= product.stock) { 
      triggerMaxAlert(product._id); 
      return; 
    } 
    increaseQuantity(product._id, product.title, product.stock); 
  };

  const handleInput = (e, product) => { 
    e.stopPropagation(); 
    const val = parseInt(e.target.value); 
    if (isNaN(val) || val < 1) return; 
    if (val > product.stock) { 
      triggerMaxAlert(product._id); 
      updateItemQuantity(product._id, product.stock, product.stock, product.title); 
    } else { 
      updateItemQuantity(product._id, val, product.stock, product.title); 
    } 
  };

  const handleAddToCart = (e, product) => { 
    e.stopPropagation(); 
    addToCart(product, 1); 
  };

  const handleToggleFavorite = (e, id) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    toggleFavorite(id); 
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product._id}
          index={index}
          product={product}
          cartItem={getCartItem(product._id)}
          isFav={favorites.includes(product._id)}
          toggleFavorite={handleToggleFavorite}
          handleAddToCart={handleAddToCart}
          handleDecrease={handleDecrease}
          handleIncrease={handleIncrease}
          handleInput={handleInput}
          maxAlertProd={maxAlertProd}
          decodeHtml={decodeHtml}
          getCatLabel={getCatLabel}
        />
      ))}
    </div>
  );
};

export default ProductGrid;