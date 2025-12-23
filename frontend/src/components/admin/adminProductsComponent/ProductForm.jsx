import { useMemo } from "react";
import { FiCamera, FiRefreshCw, FiX, FiCheckSquare, FiSquare, FiChevronUp, FiChevronDown, FiPlusCircle, FiMinusCircle } from "react-icons/fi";
import { CATEGORY_GROUPS, CATEGORY_KEY_MAP } from "../../../data/categoryData";
import { useTranslation } from "react-i18next";

const ProductForm = ({ 
    formData, 
    setFormData, 
    handleSubmit, 
    editMode, 
    handleUpload, 
    uploading, 
    imgUrlInput, 
    setImgUrlInput, 
    handleAddImageUrl, 
    removeImage,
    openCategoryGroup,
    setOpenCategoryGroup
}) => {
    const { t } = useTranslation();

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

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6 animate-fade-in-down">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">{editMode ? "Edit Product" : "Add New Product"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Temel Bilgiler */}
            <div><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Name</label><input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
            <div className="flex gap-2">
                <div className="flex-1"><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Price (£)</label><input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                <div className="flex-1"><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Stock</label><input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
            </div>

            {/* Kategori Seçimi */}
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

            {/* Etiket Seçimi (Akordiyon) */}
            <div className="md:col-span-2 border rounded-lg p-4 bg-gray-50">
               <label className="block text-xs font-bold mb-3 uppercase text-gray-500">Additional Tags / Categories</label>
               <div className="space-y-2">
                  {CATEGORY_GROUPS.map((group, grpIdx) => {
                      const isOpen = openCategoryGroup === group.label;
                      const selectedCount = group.options.filter(opt => formData.tags?.includes(opt)).length;
                      return (
                          <div key={grpIdx} className="bg-white border rounded-lg overflow-hidden transition-all">
                              <div onClick={() => setOpenCategoryGroup(isOpen ? null : group.label)} className={`flex items-center justify-between p-3 cursor-pointer select-none transition ${isOpen ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}>
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm">{group.label}</span>
                                      {selectedCount > 0 && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{selectedCount} Selected</span>}
                                  </div>
                                  <div className="text-gray-400">{isOpen ? <FiChevronUp/> : <FiChevronDown/>}</div>
                              </div>
                              {isOpen && (
                                  <div className="p-3 border-t bg-gray-50/50 animate-fade-in">
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                          {group.options.map(optKey => {
                                              if(optKey === formData.category) return null;
                                              const isChecked = formData.tags?.includes(optKey);
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

            {/* Resim Yükleme */}
            <div className="md:col-span-2">
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
                    {formData.imgs.map((img, idx) => (
                        <div key={`${img}-${idx}`} className="relative w-16 h-16 flex-shrink-0 group">
                            <img src={img} alt="p" className="w-full h-full object-cover rounded border" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><FiX size={12}/></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="md:col-span-2"><label className="block text-xs font-bold mb-1 uppercase text-gray-500">Description</label><textarea name="desc" value={formData.desc} onChange={handleChange} className="w-full p-2 border rounded h-20" /></div>
            
            {/* Aktif/Pasif */}
            <div className="md:col-span-2 flex items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="active" className="w-5 h-5 accent-pink-600 cursor-pointer" />
                <label htmlFor="active" className="cursor-pointer font-bold text-gray-700 text-sm select-none">Active for sale?</label>
            </div>

            {/* Yemek Detayları */}
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

            {/* Kıyafet Varyantları */}
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
    );
};

export default ProductForm;