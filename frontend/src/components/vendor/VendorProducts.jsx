import { useState, useEffect, useMemo } from "react";
import { userRequest } from "../../requestMethods";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import { FiEdit, FiTrash2, FiCamera, FiRefreshCw, FiSearch, FiPlus, FiX, FiMinusCircle, FiPlusCircle, FiCheckSquare, FiSquare, FiLink } from "react-icons/fi";
import { useTranslation } from "react-i18next";

// --- ORTAK VERİYİ IMPORT ET ---
// Dosya yolunu kendi klasör yapına göre ayarla (örn: ../../data/categoryData)
import { CATEGORY_GROUPS, CATEGORY_KEY_MAP } from "../../data/categoryData"; 

const VendorProducts = ({ user }) => {
  const { t } = useTranslation();
  const { notify } = useCart();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  
  // --- YENİ STATE: URL INPUT ---
  const [imgUrlInput, setImgUrlInput] = useState("");

  const initialForm = { 
    title: "", price: "", desc: "", 
    imgs: [], 
    stock: 10, category: "birthday", isActive: true,
    tags: [],
    variants: [], 
    foodDetails: { calories: "", ingredients: [] },
    tempIngredient: "" 
  };
  const [formData, setFormData] = useState(initialForm);

  const getCardStyle = (stock, isActive) => {
    if (!isActive) return "border-gray-200 opacity-75 grayscale bg-gray-50";
    if (stock <= 0) return "border-red-500 bg-red-50 ring-2 ring-red-100";
    if (stock < 5) return "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-100";
    return "border-gray-200 hover:border-pink-300";
  };

  const fetchProducts = async () => {
    try { 
      const res = await userRequest.get(`/products/vendor/${user._id}`); 
      setProducts(res.data); 
    } catch (err) { console.log(err); }
  };
  useEffect(() => { if(user?._id) fetchProducts(); }, [user]);

  const getCategoryType = (catKey) => {
    const group = CATEGORY_GROUPS.find(g => g.options.includes(catKey));
    return group ? group.type : "other";
  };
  
  const getCatLabel = (key) => {
    const mappedKey = CATEGORY_KEY_MAP[key] || key;
    return t(`home.categories1.${mappedKey}`);
  };

  const isFood = useMemo(() => getCategoryType(formData.category) === 'food', [formData.category]);
  const isClothing = useMemo(() => getCategoryType(formData.category) === 'clothing', [formData.category]);

  // --- HANDLERS ---
  const handleChange = (e) => { 
    const { name, type, checked, value } = e.target;
    if (name === 'calories') {
       setFormData(prev => ({...prev, foodDetails: { ...prev.foodDetails, calories: value }}));
    } else {
       const finalValue = type === "checkbox" ? checked : value;
       setFormData({ ...formData, [name]: finalValue }); 
    }
  };
  
  const handleTagChange = (categoryKey) => {
    setFormData(prev => {
        const currentTags = prev.tags || [];
        if (currentTags.includes(categoryKey)) {
            return { ...prev, tags: currentTags.filter(t => t !== categoryKey) };
        } else {
            return { ...prev, tags: [...currentTags, categoryKey] };
        }
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (formData.imgs.length >= 5) return notify(t('admin.errors.maxImage') || "Max 5 images", "warning");

    setUploading(true); 
    const data = new FormData(); 
    data.append("file", file);
    try { 
        const res = await userRequest.post("/upload", data); 
        setFormData((prev) => ({ ...prev, imgs: [...prev.imgs, res.data] })); 
        notify(t('vendorProducts.pictureLoaded') + " 🖼️", "success"); 
    } 
    catch { notify(t('vendorProducts.pictureNotLoaded'), "error"); } 
    finally { setUploading(false); }
  };

  // --- YENİ FONKSİYON: URL EKLEME ---
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!imgUrlInput) return;
    if (formData.imgs.length >= 5) return notify(t('admin.errors.maxImage') || "Max 5 images", "warning");
    
    setFormData(prev => ({ ...prev, imgs: [...prev.imgs, imgUrlInput] }));
    setImgUrlInput("");
    notify(t('vendorProducts.pictureLoaded') + " 🔗", "success"); // Link ikonu
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, imgs: prev.imgs.filter((_, i) => i !== index) }));
  };

  const addIngredient = () => {
    if (!formData.tempIngredient) return;
    setFormData(prev => ({
        ...prev,
        foodDetails: { ...prev.foodDetails, ingredients: [...prev.foodDetails.ingredients, prev.tempIngredient] },
        tempIngredient: ""
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({ ...prev, variants: [...prev.variants, { size: "", color: "", stock: 1 }] }));
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return notify(t('vendorProducts.missingInfo'), "warning");
    try {
      const payload = { ...formData, vendor: user._id };
      delete payload.tempIngredient;
      
      if(editMode) await userRequest.put(`/products/${editMode}`, payload);
      else await userRequest.post("/products", payload);

      notify(t('vendorProducts.reqSuccess') + " 🌸", "success"); 
      setShowForm(false); setEditMode(null); setFormData(initialForm); fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || t('vendorProducts.errorOccurredWhileAdding');
      notify(msg, "error");
     }
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.isActive;
      await userRequest.put(`/products/${product._id}`, { isActive: newStatus });
      notify(`${t('vendorProducts.product')} ${newStatus ? t('vendorProducts.active') : t('vendorProducts.inactive')}`, "success");
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: newStatus } : p));
    } catch (err) { notify(t('vendorProducts.statusNotChanged'), "error"); }
  };

  const handleEditClick = (p) => { 
    setFormData({ 
        ...initialForm, ...p, 
        category: p.category || "birthday",
        tags: p.tags || [],
        imgs: p.imgs && p.imgs.length > 0 ? p.imgs : (p.img ? [p.img] : []),
        foodDetails: p.foodDetails || { calories: "", ingredients: [] },
        variants: p.variants || []
    }); 
    setEditMode(p._id); setShowForm(true); window.scrollTo(0,0); 
  };

  const handleAddNewClick = () => {
    if (showForm) { setShowForm(false); setEditMode(null); setFormData(initialForm); } 
    else { setFormData(initialForm); setEditMode(null); setShowForm(true); }
  };

  const handleDeleteRequest = (id) => {
    setConfirmData({
      isOpen: true, title: t('vendorProducts.deleteProduct'), message: t('vendorProducts.cannotBeUndone'), isDanger: true,
      action: async () => { try { await userRequest.delete(`/products/${id}`); notify(t('vendorProducts.deleted'), "success"); fetchProducts(); } catch { notify(t('common.error'), "error"); } setConfirmData(null); }
    });
  };

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* ÜST BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-20 z-20 gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {t('vendorProducts.myProducts')} <span className="text-sm bg-pink-100 text-pink-600 px-2 py-1 rounded-full">{filteredProducts.length}</span>
        </h2>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input 
              type="text" placeholder={t('vendorProducts.searchPlaceholder')} 
              className="pl-9 pr-4 py-2 border rounded-lg w-full outline-none focus:border-pink-500 transition"
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          
          <button 
            onClick={handleAddNewClick} 
            className={`px-4 py-2 rounded-lg font-bold text-white flex items-center gap-2 transition ${showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-pink-600 hover:bg-pink-700'}`}
          >
            {showForm ? <><FiX /> {t('vendorProducts.cancel')}</> : <><FiPlus /> {t('vendorProducts.addNew')}</>}
          </button>
        </div>
      </div>

      {/* FORM ALANI */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-100 animate-fade-in-down mb-6">
          <h3 className="font-bold text-lg text-gray-700 mb-4 border-b pb-2">{editMode ? t('vendorProducts.editProduct') : t('vendorProducts.addNew')}</h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">{t('vendorProducts.productName')}</label><input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-pink-500" required /></div>
             <div className="flex gap-2">
               <div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase mb-1">{t('vendorProducts.price')} (£)</label><input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-pink-500" required /></div>
               <div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase mb-1">{t('vendorProducts.stock')}</label><input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded outline-none focus:border-pink-500" /></div>
             </div>
             
             {/* KATEGORİ SEÇİMİ */}
             <div className="md:col-span-2">
               <label className="text-xs font-bold text-gray-500 uppercase mb-1">{t('vendorProducts.category')}</label>
               <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded bg-white outline-none focus:border-pink-500 text-gray-700">
                 {CATEGORY_GROUPS.map((group, idx) => (
                    <optgroup key={idx} label={group.label}>
                       {group.options.map(optKey => (
                           <option key={optKey} value={optKey}>{getCatLabel(optKey)}</option>
                       ))}
                    </optgroup>
                 ))}
               </select>
             </div>

             {/* TAG SEÇİMİ */}
             <div className="md:col-span-2 border rounded-lg p-3 bg-pink-50/30">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t('vendorProducts.additionalCategories') || "Tags & Categories"}</label>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                   {CATEGORY_GROUPS.map((group, grpIdx) => (
                      <div key={grpIdx}>
                         <h5 className="text-[11px] font-extrabold text-pink-600 mb-1 uppercase border-b border-pink-100 pb-1">{group.label}</h5>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                           {group.options.map(optKey => {
                             const isMain = optKey === formData.category;
                             const isChecked = formData.tags?.includes(optKey);
                             if(isMain) return null;
                             return (
                                 <div key={optKey} onClick={() => handleTagChange(optKey)} className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer transition select-none text-xs ${isChecked ? 'bg-pink-100 border-pink-300' : 'bg-white hover:border-pink-300'}`}>
                                      <div className={isChecked ? 'text-pink-600' : 'text-gray-300'}>{isChecked ? <FiCheckSquare/> : <FiSquare/>}</div>
                                      <span className={`truncate ${isChecked ? 'font-bold text-pink-800' : 'text-gray-600'}`}>{getCatLabel(optKey)}</span>
                                 </div>
                             )
                           })}
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* --- RESİM YÜKLEME (URL + UPLOAD) --- */}
             <div className="md:col-span-2 border p-3 rounded bg-gray-50 border-dashed border-gray-300">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t('vendorProducts.image')} (Max 5)</label>
                
                {/* URL INPUT */}
                <div className="flex gap-2 mb-3">
                   <div className="relative flex-1">
                        <FiLink className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder={t('vendorProducts.pasteUrl') || "Paste image URL..."}
                            value={imgUrlInput}
                            onChange={(e) => setImgUrlInput(e.target.value)}
                            className="w-full pl-8 p-2 border rounded text-xs outline-none focus:border-pink-500 bg-white"
                        />
                   </div>
                   <button 
                     type="button" 
                     onClick={handleAddImageUrl}
                     disabled={!imgUrlInput}
                     className="px-4 py-1 bg-pink-600 text-white rounded text-xs font-bold hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                   >
                     {t('common.add') || "Add"}
                   </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2">
                    {formData.imgs.length < 5 && (
                        <label className="flex-shrink-0 w-20 h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded cursor-pointer hover:bg-pink-50 transition">
                            {uploading ? <FiRefreshCw className="animate-spin text-pink-500"/> : <FiCamera className="text-gray-400 text-xl"/>}
                            <span className="text-[10px] text-gray-500 mt-1">{t('vendorProducts.upload')}</span>
                            <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
                        </label>
                    )}
                    {formData.imgs.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 flex-shrink-0 group">
                            <img src={img} className="w-full h-full object-cover rounded border" alt="preview" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-80 hover:opacity-100 transition"><FiX size={12}/></button>
                        </div>
                    ))}
                </div>
             </div>

             <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase mb-1">{t('vendorProducts.description')}</label><textarea name="desc" value={formData.desc} onChange={handleChange} className="w-full p-2 border rounded h-24 outline-none focus:border-pink-500" /></div>
             
             {/* DİNAMİK ALANLAR (FOOD) */}
             {isFood && (
                <div className="md:col-span-2 bg-orange-50 p-4 rounded-lg border border-orange-200 animate-fade-in">
                    <h4 className="font-bold text-orange-700 mb-2 text-sm uppercase">{t('admin.food.title') || "Food Details"}</h4>
                    <div className="mb-3">
                        <label className="text-xs font-bold text-orange-800">{t('admin.food.calories') || "Calories"}</label>
                        <input name="calories" type="number" value={formData.foodDetails.calories} onChange={handleChange} className="w-full p-2 border border-orange-200 rounded bg-white" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-orange-800">{t('admin.food.ingredients') || "Ingredients"}</label>
                        <div className="flex gap-2 mb-2">
                            <input value={formData.tempIngredient} onChange={(e) => setFormData({...formData, tempIngredient: e.target.value})} className="w-full p-2 border border-orange-200 rounded" placeholder={t('admin.food.addIngredientPlaceholder') || "Add ingredient..."} />
                            <button type="button" onClick={addIngredient} className="bg-orange-600 text-white px-3 rounded font-bold text-xs">{t('common.add')}</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.foodDetails.ingredients.map((ing, i) => (
                                <span key={i} className="bg-white border border-orange-300 text-orange-800 px-2 py-1 rounded text-xs flex items-center gap-1 shadow-sm">
                                    {ing} <button type="button" onClick={() => setFormData(prev => ({...prev, foodDetails: {...prev.foodDetails, ingredients: prev.foodDetails.ingredients.filter((_, x) => x !== i)}}))}><FiX/></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
             )}

             {/* DİNAMİK ALANLAR (CLOTHING) */}
             {isClothing && (
                <div className="md:col-span-2 bg-purple-50 p-4 rounded-lg border border-purple-200 animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-purple-700 text-sm uppercase">{t('admin.clothing.title') || "Variants"}</h4>
                        <button type="button" onClick={addVariant} className="text-xs bg-purple-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-purple-700 transition"><FiPlusCircle/> {t('common.add')}</button>
                    </div>
                    {formData.variants.map((variant, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-center">
                            <input placeholder={t('admin.clothing.size') || "Size"} value={variant.size} onChange={(e) => updateVariant(idx, 'size', e.target.value)} className="w-1/3 p-2 border rounded text-xs" />
                            <input placeholder={t('admin.clothing.color') || "Color"} value={variant.color} onChange={(e) => updateVariant(idx, 'color', e.target.value)} className="w-1/3 p-2 border rounded text-xs" />
                            <input type="number" placeholder="Stk" value={variant.stock} onChange={(e) => updateVariant(idx, 'stock', e.target.value)} className="w-20 p-2 border rounded text-xs" />
                            <button type="button" onClick={() => removeVariant(idx)} className="text-red-500 hover:text-red-700"><FiMinusCircle size={18}/></button>
                        </div>
                    ))}
                    {formData.variants.length === 0 && <p className="text-xs text-gray-500 italic">{t('admin.clothing.noVariants') || "No variants yet."}</p>}
                </div>
             )}
             
             <div className="md:col-span-2 flex items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                 <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="active" className="w-5 h-5 accent-pink-600 cursor-pointer" />
                 <label htmlFor="active" className="cursor-pointer font-bold text-gray-700 text-sm select-none">{t('vendorProducts.isActive')}</label>
             </div>

             <button type="submit" disabled={uploading} className="bg-green-600 text-white py-3 rounded-lg font-bold md:col-span-2 hover:bg-green-700 shadow-lg transition disabled:opacity-50">
               {editMode ? t('vendorProducts.updateProduct') : t('vendorProducts.publishProduct')}
             </button>
          </form>
        </div>
      )}

      {/* LİSTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(p => (
          <div key={p._id} className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 group relative flex flex-col ${getCardStyle(p.stock, p.isActive)}`}>
            <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
              <button onClick={() => handleToggleStatus(p)} className={`text-[10px] px-3 py-1 rounded-full font-bold shadow-md transition transform active:scale-95 flex items-center gap-1 ${p.isActive ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-800 text-white hover:bg-black"}`}>
                {p.isActive ? `🟢 ${t('vendorProducts.live')}` : `⚫ ${t('vendorProducts.hidden')}`}
              </button>
              {p.stock <= 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md animate-pulse">⛔ {t('vendorProducts.soldOut')}</span>}
            </div>

            <div className="h-48 relative bg-gray-200 overflow-hidden">
              <img src={(p.imgs && p.imgs[0]) || p.img || "https://placehold.co/400"} className={`w-full h-full object-cover transition duration-700 ${!p.isActive ? "grayscale" : "group-hover:scale-110"}`} alt={p.title} />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                <span className="text-white text-[10px] font-bold bg-black/30 backdrop-blur-md px-2 py-1 rounded border border-white/20">
                  {getCatLabel(p.category)}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h4 className="font-bold text-gray-800 mb-1 truncate text-lg" title={p.title}>{p.title}</h4>
              <div className="flex justify-between items-end mb-4"><span className="text-xl font-extrabold text-pink-600">£{p.price}</span></div>
              <div className="mt-auto pt-3 border-t border-gray-200/60 flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('vendorProducts.quickStock')}</span>
                <QuickStockUpdate product={p} refresh={fetchProducts} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleEditClick(p)} className="flex items-center justify-center gap-1 bg-blue-50 text-blue-600 text-xs py-2.5 rounded-xl font-bold hover:bg-blue-100 transition border border-blue-100"><FiEdit /> {t('vendorProducts.edit')}</button>
                <button onClick={() => handleDeleteRequest(p._id)} className="flex items-center justify-center gap-1 bg-red-50 text-red-600 text-xs py-2.5 rounded-xl font-bold hover:bg-red-100 transition border border-red-100"><FiTrash2 /> {t('vendorProducts.delete')}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

const QuickStockUpdate = ({ product, refresh }) => {
  const { t } = useTranslation();
  const [stock, setStock] = useState(product.stock);
  const [loading, setLoading] = useState(false);
  const { notify } = useCart();

  const handleUpdate = async () => {
    if (Number(stock) === product.stock) return;
    setLoading(true);
    try { await userRequest.put(`/products/${product._id}`, { ...product, stock: Number(stock) }); notify(t('vendorProducts.stockUpdated'), "success"); refresh(); } 
    catch (err) { notify(t('vendorProducts.error'), "error"); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-1">
      <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-12 p-1 border rounded text-center text-sm font-bold outline-none focus:border-pink-500 bg-gray-50" />
      <button onClick={handleUpdate} disabled={loading || Number(stock)===product.stock} className={`text-xs px-2 py-1 rounded font-bold transition ${Number(stock)!==product.stock ? "bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer" : "bg-gray-100 text-gray-300 cursor-default"}`}>
        {loading ? <FiRefreshCw className="animate-spin" /> : "✓"}
      </button>
    </div>
  );
};

export default VendorProducts;