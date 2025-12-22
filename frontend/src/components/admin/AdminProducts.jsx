import { useState, useEffect, useMemo } from "react";
import { userRequest } from "../../requestMethods";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import AdminPanelHeader from "./adminComponents/AdminPanelHeader";
import { FiEdit, FiTrash2, FiCamera, FiRefreshCw, FiSearch, FiPlus, FiX, FiMinusCircle, FiPlusCircle, FiCheckSquare, FiSquare, FiLink, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { CATEGORY_GROUPS, CATEGORY_KEY_MAP } from "../../data/categoryData"; 

const AdminProducts = () => {
  const { t } = useTranslation();
  const { notify } = useCart();
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

  const fetchProducts = async () => {
    try {
      const res = await userRequest.get("/products"); 
      setProducts(res.data);
    } catch (err) { console.log(err); }
  };
  useEffect(() => { fetchProducts(); }, []);

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

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.isActive;
      await userRequest.put(`/products/${product._id}`, { isActive: newStatus });
      notify(`${t('common.success')}`, "success");
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: newStatus } : p));
    } catch (err) { notify(t('common.error'), "error"); }
  };

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
    if (formData.imgs.length >= 5) return notify("Max 5 images!", "warning");

    setUploading(true); 
    const data = new FormData(); 
    data.append("file", file);
    try { 
        const res = await userRequest.post("/upload", data); 
        // Düzeltme: Yeni resmi diziye eklerken spread operatörünü güvenli kullanıyoruz
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

  // Düzeltme: Filter fonksiyonu doğru, ancak render kısmındaki 'key' prop'u önemli.
  const removeImage = (index) => {
    setFormData(prev => {
        const newImgs = prev.imgs.filter((_, i) => i !== index);
        return { ...prev, imgs: newImgs };
    });
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
    if (!formData.title || !formData.price) return notify("Missing Info", "warning");
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const payload = { ...formData, vendor: user._id }; 
      delete payload.tempIngredient;
      
      // Eğer imgs dizisi boşsa, backend'e boş dizi gittiğinden emin olalım.
      if (!payload.imgs || payload.imgs.length === 0) {
          payload.imgs = []; 
      }

      if (editMode) await userRequest.put(`/products/${editMode}`, payload);
      else await userRequest.post("/products", payload);
      
      notify(t('common.success'), "success"); 
      setFormData(initialForm); setShowForm(false); setEditMode(null); fetchProducts();
    } catch { notify(t('common.error'), "error"); }
  };

  const handleEditClick = (p) => { 
    // Düzeltme: imgs dizisini kopyalayarak alıyoruz (referans hatasını önlemek için)
    // Eğer imgs yoksa ama tekil img varsa onu diziye çeviriyoruz.
    let currentImgs = [];
    if (p.imgs && p.imgs.length > 0) {
        currentImgs = [...p.imgs];
    } else if (p.img) {
        currentImgs = [p.img];
    }

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

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    return p.title.toLowerCase().includes(term) || (p.vendor?.username?.toLowerCase() || "").includes(term);
  });

  const toggleGroup = (label) => {
      setOpenCategoryGroup(openCategoryGroup === label ? null : label);
  };

  return (
    <div className="space-y-6 pt-2 max-w-7xl mx-auto animate-fade-in">
      <AdminPanelHeader title="Products Management" count={products.length}>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <input type="text" placeholder="Search..." className="px-4 py-2 border rounded-lg w-full md:w-64 outline-none focus:border-pink-500" onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={() => { setShowForm(!showForm); setEditMode(null); setFormData(initialForm); }} className={`px-4 py-2 rounded-lg font-bold text-white flex items-center gap-1 transition ${showForm ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"}`}>
            {showForm ? <><FiX /> Close</> : <><FiPlus /> Add New</>}
          </button>
        </div>
      </AdminPanelHeader>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6 animate-fade-in-down">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">{editMode ? "Edit Product" : "Add New Product"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Name</label><input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" /></div>
            <div className="flex gap-2">
                <div className="flex-1"><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Price (£)</label><input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                <div className="flex-1"><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Stock</label><input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded" /></div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Main Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded bg-white font-medium text-gray-700">
                {CATEGORY_GROUPS.map((group, idx) => (
                    <optgroup key={idx} label={group.label}>
                        {group.options.map(optKey => (
                            <option key={optKey} value={optKey}>{getCatLabel(optKey)}</option>
                        ))}
                    </optgroup>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 border rounded-lg p-4 bg-gray-50">
               <label className="block text-xs font-bold mb-3 uppercase text-gray-500">Additional Tags / Categories</label>
               <div className="space-y-2">
                  {CATEGORY_GROUPS.map((group, grpIdx) => {
                      const isOpen = openCategoryGroup === group.label;
                      const selectedCount = group.options.filter(opt => formData.tags?.includes(opt)).length;

                      return (
                          <div key={grpIdx} className="bg-white border rounded-lg overflow-hidden transition-all">
                              <div 
                                onClick={() => toggleGroup(group.label)}
                                className={`flex items-center justify-between p-3 cursor-pointer select-none transition ${isOpen ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
                              >
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm">{group.label}</span>
                                      {selectedCount > 0 && (
                                          <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                              {selectedCount} Selected
                                          </span>
                                      )}
                                  </div>
                                  <div className="text-gray-400">
                                      {isOpen ? <FiChevronUp/> : <FiChevronDown/>}
                                  </div>
                              </div>
                              
                              {isOpen && (
                                  <div className="p-3 border-t bg-gray-50/50 animate-fade-in">
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                          {group.options.map(optKey => {
                                              const isMain = optKey === formData.category;
                                              const isChecked = formData.tags?.includes(optKey);
                                              if(isMain) return null;
                                              return (
                                                  <div key={optKey} onClick={() => handleTagChange(optKey)} className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer transition select-none text-sm ${isChecked ? 'bg-blue-100 border-blue-300' : 'bg-white hover:border-blue-300'}`}>
                                                      <div className={isChecked ? 'text-blue-600' : 'text-gray-300'}>{isChecked ? <FiCheckSquare/> : <FiSquare/>}</div>
                                                      <span className={`truncate ${isChecked ? 'font-bold text-blue-800' : 'text-gray-600'}`}>{getCatLabel(optKey)}</span>
                                                  </div>
                                              )
                                          })}
                                      </div>
                                  </div>
                              )}
                          </div>
                      );
                  })}
               </div>
            </div>

            <div>
                <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Images (Max 5)</label>
                <div className="flex gap-2 mb-2">
                   <input type="text" placeholder="Or paste image URL..." value={imgUrlInput} onChange={(e) => setImgUrlInput(e.target.value)} className="flex-1 p-2 border rounded text-xs outline-none focus:border-pink-500" />
                   <button type="button" onClick={handleAddImageUrl} disabled={!imgUrlInput} className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-bold hover:bg-gray-700 disabled:opacity-50">Add URL</button>
                </div>
                <div className="flex gap-2 border p-2 rounded bg-gray-50 overflow-x-auto">
                    {formData.imgs.length < 5 && (
                        <label className="cursor-pointer flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center bg-white border border-dashed border-gray-400 rounded hover:bg-blue-50">
                            {uploading ? <FiRefreshCw className="animate-spin"/> : <FiCamera size={20} className="text-gray-500"/>}
                            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading}/>
                        </label>
                    )}
                    {/* Düzeltme: key olarak sadece index değil, resim URL'ini de kullanıyoruz */}
                    {formData.imgs.map((img, idx) => (
                        <div key={`${img}-${idx}`} className="relative w-16 h-16 flex-shrink-0 group">
                            <img src={img} alt="p" className="w-full h-full object-cover rounded border" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><FiX size={12}/></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="md:col-span-2"><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Description</label><textarea name="desc" value={formData.desc} onChange={handleChange} className="w-full p-2 border rounded h-20" /></div>
            
            <div className="md:col-span-2 flex items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="active" className="w-5 h-5 accent-pink-600 cursor-pointer" />
                <label htmlFor="active" className="cursor-pointer font-bold text-gray-700 text-sm select-none">Active for sale?</label>
            </div>

            {isFood && (
                <div className="md:col-span-2 bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-orange-700 mb-2 text-sm uppercase">Food Details</h4>
                    <div className="mb-3">
                        <label className="block text-xs font-bold mb-1 text-orange-800">Calories</label>
                        <input name="calories" type="number" value={formData.foodDetails.calories} onChange={handleChange} className="w-full p-2 border border-orange-200 rounded" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1 text-orange-800">Ingredients</label>
                        <div className="flex gap-2 mb-2">
                            <input value={formData.tempIngredient} onChange={(e) => setFormData({...formData, tempIngredient: e.target.value})} className="w-full p-2 border border-orange-200 rounded" placeholder="Add ingredient..." />
                            <button type="button" onClick={addIngredient} className="bg-orange-600 text-white px-3 rounded font-bold text-xs">Add</button>
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

            {isClothing && (
                <div className="md:col-span-2 bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-purple-700 text-sm uppercase">Variants</h4>
                        <button type="button" onClick={addVariant} className="text-xs bg-purple-600 text-white px-3 py-1 rounded flex items-center gap-1"><FiPlusCircle/> Add</button>
                    </div>
                    {formData.variants.map((variant, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-center">
                            <input placeholder="Size" value={variant.size} onChange={(e) => updateVariant(idx, 'size', e.target.value)} className="w-1/3 p-2 border rounded text-xs" />
                            <input placeholder="Color" value={variant.color} onChange={(e) => updateVariant(idx, 'color', e.target.value)} className="w-1/3 p-2 border rounded text-xs" />
                            <input type="number" placeholder="Stk" value={variant.stock} onChange={(e) => updateVariant(idx, 'stock', e.target.value)} className="w-20 p-2 border rounded text-xs" />
                            <button type="button" onClick={() => removeVariant(idx)} className="text-red-500"><FiMinusCircle size={18}/></button>
                        </div>
                    ))}
                    {formData.variants.length === 0 && <p className="text-xs text-gray-500 italic">No variants.</p>}
                </div>
            )}
            
            <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-bold md:col-span-2 hover:bg-blue-700 shadow-md">Save Product</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const mainImage = (product.imgs && product.imgs.length > 0) ? product.imgs[0] : (product.img || "https://placehold.co/400");
          return (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition relative">
              <div className="absolute top-2 right-2 z-10">
                 <button onClick={() => handleToggleStatus(product)} className={`text-[10px] px-3 py-1 rounded-full font-bold shadow-sm ${product.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}>
                    {product.isActive ? "Active" : "Passive"}
                 </button>
              </div>
              <div className="h-40 bg-gray-100 relative">
                <img src={mainImage} className={`w-full h-full object-cover object-top transition duration-500 ${!product.isActive ? "grayscale" : "group-hover:scale-105"}`} alt={product.title} />
                <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                  {getCatLabel(product.category)}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">🏪 {product.vendor?.username}</div>
                <h4 className="font-bold text-gray-800 mb-1 truncate">{product.title}</h4>
                <div className="flex justify-between items-center mb-3"><span className="text-lg font-bold text-pink-600">£{product.price}</span></div>
                <div className="mt-auto pt-2 border-t border-gray-200 flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase">STOCK</span>
                  <QuickStockUpdate product={product} refresh={fetchProducts} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleEditClick(product)} className="flex items-center justify-center gap-1 bg-blue-50 text-blue-600 text-xs py-2 rounded font-bold border border-blue-100 hover:bg-blue-100 transition"><FiEdit /> Edit</button>
                  <button onClick={() => handleDeleteRequest(product._id)} className="flex items-center justify-center gap-1 bg-red-50 text-red-600 text-xs py-2 rounded font-bold border border-red-100 hover:bg-red-100 transition"><FiTrash2 /> Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

const QuickStockUpdate = ({ product, refresh }) => {
  const [stock, setStock] = useState(product.stock);
  const [loading, setLoading] = useState(false);
  const { notify } = useCart();
  const handleUpdate = async () => {
    if (Number(stock) === product.stock) return;
    setLoading(true);
    try { await userRequest.put(`/products/${product._id}`, { ...product, stock: Number(stock) }); notify("Stock updated", "success"); refresh(); } 
    catch { notify("Error", "error"); } finally { setLoading(false); }
  };
  return (
    <div className="flex items-center gap-1">
      <input type="number" value={stock} onChange={e=>setStock(e.target.value)} className="w-12 p-1 border rounded text-center text-xs font-bold outline-none focus:border-pink-500 bg-gray-50" />
      <button onClick={handleUpdate} disabled={loading || Number(stock)===product.stock} className={`text-xs px-2 py-1 rounded font-bold transition ${Number(stock)!==product.stock ? "bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer" : "bg-gray-100 text-gray-300 cursor-default"}`}>{loading?<FiRefreshCw className="animate-spin" />:"✓"}</button>
    </div>
  );
};

export default AdminProducts;