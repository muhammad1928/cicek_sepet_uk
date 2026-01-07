import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiGrid, FiChevronRight, FiChevronLeft, FiArrowLeft } from "react-icons/fi";
import { MENU_STRUCTURE } from "../data/categoryData";
import { useScrollContainer } from "../hooks/useScrollContainer";
import CategoryButton from "./nav/CategoryButton";

const CategoryNav = ({ onSelectCategory, activeCategory }) => {
  const { t } = useTranslation();
  const isMainView = activeCategory === 'all';
  
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);
  const isNavHiddenRef = useRef(false);

  const [selectedSubGroup, setSelectedSubGroup] = useState(null);

  // GÜNCELLEME: Hook'a [selectedSubGroup] gönderiyoruz.
  // Böylece alt menü açıldığı AN okların durumu tekrar hesaplanıyor.
  const mainScroll = useScrollContainer([isMainView]); 
  const subScroll = useScrollContainer([selectedSubGroup, isMainView]);

  const activeGroup = MENU_STRUCTURE.find(group => 
    group.id === activeCategory || group.subItems.some(sub => sub.key === activeCategory || (sub.children && sub.children.some(child => child.key === activeCategory)))
  );

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowNav(false);
        isNavHiddenRef.current = true;
      } else if (currentScrollY < lastScrollY.current) {
        setShowNav(true);
        if (isNavHiddenRef.current && currentScrollY > 50 && !isMainView) {
            handleBack();
        }
        isNavHiddenRef.current = false;
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMainView, onSelectCategory]); 


  const handleSelection = (item) => {
    if (mainScroll.isDragging || subScroll.isDragging) return; 
    if (item.isGroup) {
        setSelectedSubGroup(item);
    } else {
        onSelectCategory(item.key);
    }
  };

  const handleMainGroupClick = (group) => {
    if (mainScroll.isDragging) return;
    onSelectCategory(group.id);
    setSelectedSubGroup(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
      if (selectedSubGroup) {
          setSelectedSubGroup(null);
      } else {
          onSelectCategory('all');
      }
  };

  const itemsDisplay = selectedSubGroup 
        ? selectedSubGroup.children 
        : activeGroup?.subItems || [];
  
  useEffect(() => {
    if (!isMainView && subScroll.ref.current) {
       subScroll.ref.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [activeGroup, isMainView, selectedSubGroup]);

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shine { 100% { left: 125%; } }
        .animate-shine-effect {
            position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: shine 2s infinite;
        }
      `}</style>

      {/* NAVBAR CONTAINER */}
      <div 
        className={`fixed left-0 right-0 z-40 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) 
                    bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm
            ${showNav ? "translate-y-0" : "-translate-y-[150%]"} 
        `}
        style={{ top: "60px" }} 
      >
        <div className="relative w-full max-w-[1400px] mx-auto">
            
            {/* --- MAIN MENU --- */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden relative ${isMainView ? "max-h-[90px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4 pointer-events-none"}`}>
                
                {/* GÜNCELLEME: pulse={true} ile sağ oka dikkat çekiyoruz.
                   Eğer canScrollRight=true ise kullanıcı buranın kaydırılabilir olduğunu hemen anlar.
                */}
                <ScrollArrow direction="left" show={mainScroll.canScrollLeft} onClick={() => mainScroll.scrollBy('left')} />
                <ScrollArrow direction="right" show={mainScroll.canScrollRight} onClick={() => mainScroll.scrollBy('right')} pulse={true} />

                {/* LIST: px-10 md:px-14 ile okların altına buton girmesini engelledik */}
                <div 
                    {...mainScroll.handlers}
                    ref={mainScroll.ref}
                    className="flex items-center gap-3 overflow-x-auto hide-scrollbar px-10 md:px-14 py-3 scroll-smooth cursor-grab active:cursor-grabbing"
                >
                    <button 
                        onClick={() => !mainScroll.isDragging && onSelectCategory("all")}
                        className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm md:text-base font-bold transition-all duration-300 flex-shrink-0 shadow-md shadow-pink-300/40 hover:shadow-lg hover:scale-[1.02] overflow-hidden bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 text-white border border-transparent ring-2 ring-transparent hover:ring-pink-200`}
                    >
                        <div className="animate-shine-effect"></div>
                        <FiGrid className="text-white relative z-10 opacity-90" size={18}/>
                        <span className="whitespace-nowrap relative z-10">{t('home.allProducts')}</span>
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1 flex-shrink-0 hidden md:block opacity-50"></div>

                    {MENU_STRUCTURE.map((item) => (
                        <CategoryButton 
                            key={item.id}
                            item={item}
                            isActive={activeCategory === item.id}
                            onClick={() => !mainScroll.isDragging && handleMainGroupClick(item)}
                            t={t}
                        />
                    ))}
                    <div className="w-2 flex-shrink-0"></div>
                </div>
            </div>

            {/* --- SUB MENU --- */}
            <div className={`transition-all duration-500 ease-in-out ${!isMainView ? "max-h-[90px] opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-4 pointer-events-none"}`}>
                <div className="relative">
                    
                    {/* Alt menü okları */}
                    <ScrollArrow direction="left" show={subScroll.canScrollLeft} onClick={() => subScroll.scrollBy('left')} isSub={true} />
                    <ScrollArrow direction="right" show={subScroll.canScrollRight} onClick={() => subScroll.scrollBy('right')} isSub={true} pulse={true} />

                     <div 
                        {...subScroll.handlers}
                        ref={subScroll.ref}
                        // GÜNCELLEME: px değerleri artırıldı
                        className="flex items-center gap-3 overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing px-10 md:px-14 py-3 scroll-smooth"
                     >
                        <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-pink-300 hover:text-pink-600 hover:shadow-md active:scale-95 transition-all shadow-sm flex-shrink-0 group">
                            <div className="bg-gray-100 p-1 rounded-full group-hover:bg-pink-100 transition-colors">
                                <FiArrowLeft size={14} className="text-slate-500 group-hover:text-pink-500"/>
                            </div>
                            <span className="tracking-wide whitespace-nowrap">{selectedSubGroup ? t('common.back') || 'BACK' : 'MENU'}</span>
                        </button>

                        {selectedSubGroup && (
                            <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm font-medium animate-fade-in flex-shrink-0 px-2">
                                <span className="text-slate-300">|</span>
                                <span className={activeGroup?.itemColor}>{selectedSubGroup.icon}</span>
                                <span className="whitespace-nowrap uppercase tracking-wider text-xs font-bold">{t(selectedSubGroup.label)}</span>
                                <span className="text-slate-300">|</span>
                            </div>
                        )}

                        {itemsDisplay.map((sub) => (
                             <CategoryButton 
                                key={sub.key}
                                item={sub}
                                isActive={activeCategory === sub.key}
                                onClick={() => !subScroll.isDragging && handleSelection(sub)}
                                activeGroup={activeGroup}
                                t={t}
                            />
                        ))}
                        <div className="w-2 flex-shrink-0"></div>
                     </div>
                </div>
            </div>

        </div>
      </div>
    </>
  );
};

// GÜNCELLEME: Oklar daha geniş ve belirgin
const ScrollArrow = ({ direction, show, onClick, isSub, pulse }) => {
    const isLeft = direction === 'left';
    return (
        <div className={`
            absolute top-0 bottom-0 z-[60] flex items-center transition-all duration-300 pointer-events-none
            ${isLeft ? 'left-0 pl-3 bg-gradient-to-r' : 'right-0 pr-3 justify-end bg-gradient-to-l'} 
            from-white via-white/80 to-transparent w-20 md:w-24
            ${show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
        `}>
            <button 
                onClick={onClick} 
                className={`
                    pointer-events-auto w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 hover:scale-110 active:scale-95 hover:bg-gray-50 transition-all
                    ${isSub ? 'text-pink-600' : 'text-slate-600'}
                    /* Sağ ok görünüyorsa hafifçe yanıp sönerek dikkat çeker */
                    ${!isLeft && pulse && show ? 'animate-pulse ring-2 ring-pink-100' : ''}
                `}
            >
                {isLeft ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
            </button>
        </div>
    )
}

export default CategoryNav;