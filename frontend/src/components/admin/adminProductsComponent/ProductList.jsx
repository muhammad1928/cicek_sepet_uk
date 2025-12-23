import ProductCard from "./ProductCard";

const ProductList = ({ products, onEdit, onDelete, onToggleStatus, refreshProducts }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
       {products.map((product) => (
          <ProductCard 
            key={product._id} 
            product={product} 
            onEdit={onEdit} 
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            refreshProducts={refreshProducts}
          />
       ))}
       {products.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
             Ürün bulunamadı.
          </div>
       )}
    </div>
  );
};

export default ProductList;