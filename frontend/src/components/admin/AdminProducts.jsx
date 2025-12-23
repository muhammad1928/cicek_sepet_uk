import { useState, useEffect } from "react";
import { userRequest } from "../../requestMethods";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../ConfirmModal";

// Alt Bileşenleri Buradan Çağırıyoruz
import ProductFilters from "./adminProductsComponent/ProductFilters";
import ProductForm from "./adminProductsComponent/ProductForm";
import ProductList from "./adminProductsComponent/ProductList";

const AdminProducts = () => {
  const { t } = useTranslation();
  const { notify } = useCart();
  
  // States
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [imgUrlInput, setImgUrlInput] = useState("");
  const [openCategoryGroup, setOpenCategoryGroup] = useState(null);

  const initialForm = { 
    title: "", price: "", desc: "", 
    imgs: [], 
    stock: 10, isActive: true, 
    category: "birthday",
    variants: [], 
    tags: [], 
    foodDetails: { calories: "", ingredients: [] },
    tempIngredient: "" 
  };
  
  const [formData, setFormData] = useState(initialForm);

  // API Call
  const fetchProducts = async () => {
    try {
      const res = await userRequest.get("/products"); 
      setProducts(res.data);
    } catch (err) { console.log(err); }
  };
  
  useEffect(() => { fetchProducts(); }, []);

  // --- HANDLERS (Mantık) ---

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.isActive;
      await userRequest.put(`/products/${product._id}`, { isActive: newStatus });
      notify(`${t('common.success')}`, "success");
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: newStatus } : p));
    } catch (err) { notify(t('common.error'), "error"); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (formData.imgs.length >= 5) return notify("Max 5 images!", "warning");

    setUploading(true); 
    const data = new FormData(); 
    data.append("file", file);
    try { 
        const res = await userRequest.post("/upload", data); 
        const newImgUrl = res.data;
        setFormData((prev) => ({ ...prev, imgs: [...prev.imgs, newImgUrl] })); 
        notify("Image uploaded", "success"); 
    } catch { notify(t('common.error'), "error"); } finally { setUploading(false); }
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!imgUrlInput) return;
    if (formData.imgs.length >= 5) return notify("Max 5 images!", "warning");
    setFormData(prev => ({ ...prev, imgs: [...prev.imgs, imgUrlInput] }));
    setImgUrlInput("");
    notify("URL Image added", "success");
  };

  const removeImage = (index) => {
    setFormData(prev => {
        const newImgs = prev.imgs.filter((_, i) => i !== index);
        return { ...prev, imgs: newImgs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return notify("Missing Info", "warning");
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const payload = { ...formData, vendor: user._id }; 
      delete payload.tempIngredient;
      if (!payload.imgs || payload.imgs.length === 0) payload.imgs = []; 

      if (editMode) await userRequest.put(`/products/${editMode}`, payload);
      else await userRequest.post("/products", payload);
      
      notify(t('common.success'), "success"); 
      setFormData(initialForm); setShowForm(false); setEditMode(null); fetchProducts();
    } catch { notify(t('common.error'), "error"); }
  };

  const handleEditClick = (p) => { 
    let currentImgs = [];
    if (p.imgs && p.imgs.length > 0) currentImgs = [...p.imgs];
    else if (p.img) currentImgs = [p.img];

    setFormData({ 
        ...initialForm, ...p, 
        category: p.category || "birthday",
        tags: p.tags || [],
        imgs: currentImgs,
        foodDetails: p.foodDetails || { calories: "", ingredients: [] },
        variants: p.variants || []
    }); 
    setEditMode(p._id); setShowForm(true); window.scrollTo(0,0); 
  };

  const handleDeleteRequest = (id) => {
    setConfirmData({
      isOpen: true, title: "Delete?", message: "Sure?", isDanger: true,
      action: async () => { try { await userRequest.delete(`/products/${id}`); notify("Deleted", "success"); fetchProducts(); } catch { notify("Error", "error"); } setConfirmData(null); }
    });
  };

  // Filter
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    return p.title.toLowerCase().includes(term) || (p.vendor?.username?.toLowerCase() || "").includes(term);
  });

  return (
    <div className="space-y-6 pt-2 max-w-7xl mx-auto animate-fade-in">
      
      {/* 1. Üst Kısım */}
      <ProductFilters 
        productsCount={products.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showForm={showForm}
        onToggleForm={() => { setShowForm(!showForm); setEditMode(null); setFormData(initialForm); }}
      />

      {/* 2. Form */}
      {showForm && (
        <ProductForm 
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            editMode={editMode}
            handleUpload={handleUpload}
            uploading={uploading}
            imgUrlInput={imgUrlInput}
            setImgUrlInput={setImgUrlInput}
            handleAddImageUrl={handleAddImageUrl}
            removeImage={removeImage}
            openCategoryGroup={openCategoryGroup}
            setOpenCategoryGroup={setOpenCategoryGroup}
        />
      )}

      {/* 3. Liste */}
      <ProductList 
        products={filteredProducts}
        onEdit={handleEditClick}
        onDelete={handleDeleteRequest}
        onToggleStatus={handleToggleStatus}
        refreshProducts={fetchProducts}
      />

      {/* 4. Onay Modalı */}
      {confirmData && (
        <ConfirmModal 
            title={confirmData.title} 
            message={confirmData.message} 
            isDanger={confirmData.isDanger} 
            onConfirm={confirmData.action} 
            onCancel={() => setConfirmData(null)} 
        />
      )}
    </div>
  );
};

export default AdminProducts;