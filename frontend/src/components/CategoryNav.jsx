import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiGrid, FiChevronRight, FiChevronLeft, FiArrowLeft, FiMoreHorizontal } from "react-icons/fi";
import { IoFlowerOutline } from "react-icons/io5";
import { 
  FaTshirt, FaFemale, FaMale, FaChild, FaGem, 
  FaBirthdayCake, FaGift, 
  FaCookieBite, FaCookie, FaBook, FaBitcoin, FaCreditCard, 
  FaDumbbell, FaShoppingBag, FaGlassCheers,
  FaBaby, FaRunning, FaHome
} from "react-icons/fa";
import { 
  GiFlowers, GiLipstick, GiHoodie, GiTrousers, 
  GiChocolateBar, GiFruitBowl, GiDress,
  GiRose, GiFlowerPot,
  GiCakeSlice, GiSkirt, GiShirt, GiStarsStack,
  GiRunningShoe, GiTie
} from "react-icons/gi";
import { LuFlower2 } from "react-icons/lu";
import { PiFlowerLotusDuotone } from "react-icons/pi";

// --- MENÜ VERİSİ ---
const MENU_STRUCTURE = [
  {
    id: 'flowers',
    label: 'home.nav.flowers',
    icon: <IoFlowerOutline />, 
    activeGradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
    itemColor: 'text-pink-600',
    theme: {
        bg: 'bg-pink-50',
        border: 'border-pink-100',
        text: 'text-pink-600',
        hoverBorder: 'hover:border-pink-300',
        iconBg: 'bg-pink-100',
        activeRing: 'ring-pink-200'
    },
    subItems: [
      { key: 'designFlowers', label: 'home.categories1.flowers.designFlowers', icon: <GiStarsStack/> },
      { key: 'rose', label: 'home.categories1.flowers.rose', icon: <GiRose/> }, 
      { key: 'bouquet', label: 'home.categories1.flowers.bouquet', icon: <PiFlowerLotusDuotone /> },
      { key: 'orchid', label: 'home.categories1.flowers.orchid', icon: <LuFlower2 /> }, 
      { key: 'special', label: 'home.categories1.flowers.special', icon: <GiFlowers/> },
      { key: 'daisy', label: 'home.categories1.flowers.daisy', icon: <IoFlowerOutline /> },
      { key: 'tulip', label: 'home.categories1.flowers.tulip', icon: <LuFlower2 /> },
      { key: 'indoor_flowers', label: 'home.categories1.flowers.indoor_flowers', icon: <GiFlowerPot /> }, 
      { key: 'unique', label: 'home.categories1.flowers.unique', icon: <FaGem /> }, 
    ]
  },
  {
    id: 'gifts',
    label: 'home.nav.gift',
    icon: <FaGift />, 
    activeGradient: 'from-cyan-500 via-sky-500 to-blue-600',
    itemColor: 'text-sky-600',
    theme: {
        bg: 'bg-sky-50',
        border: 'border-sky-100',
        text: 'text-sky-600',
        hoverBorder: 'hover:border-sky-300',
        iconBg: 'bg-sky-100',
        activeRing: 'ring-sky-200'
    },
    subItems: [
      { key: 'personalized', label: 'home.categories1.gifts.personalized', icon: <FaGem/> },
      { key: 'birthday', label: 'home.categories1.gifts.birthday', icon: <FaBirthdayCake/> },
      { key: 'anniversary', label: 'home.categories1.gifts.anniversary', icon: <GiStarsStack/> },
      { key: 'for_her', label: 'home.categories1.gifts.for_her', icon: <FaFemale/> },
      { key: 'for_him', label: 'home.categories1.gifts.for_him', icon: <FaMale/> },
      { key: 'for_kids', label: 'home.categories1.gifts.for_kids', icon: <FaChild/> },
      { key: 'giftcard', label: 'home.categories1.gifts.giftcard', icon: <FaCreditCard/> },
      { key: 'books', label: 'home.categories1.gifts.books', icon: <FaBook/> },
      { key: 'crypto', label: 'home.categories1.gifts.crypto', icon: <FaBitcoin/> },
    ]
  },
  {
    id: 'edible',
    label: 'home.nav.edible',
    icon: <FaCookieBite />, 
    activeGradient: 'from-orange-500 via-amber-500 to-yellow-500',
    itemColor: 'text-amber-600',
    theme: {
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        text: 'text-orange-600',
        hoverBorder: 'hover:border-orange-300',
        iconBg: 'bg-orange-100',
        activeRing: 'ring-orange-200'
    },
    subItems: [
      { key: 'chocolate_box', label: 'home.categories1.edible.chocolate_box', icon: <GiChocolateBar/> },
      { key: 'fruit_basket', label: 'home.categories1.edible.fruit_basket', icon: <GiFruitBowl/> },
      { key: 'cake', label: 'home.categories1.edible.cake', icon: <FaBirthdayCake/> }, 
      { key: 'cookies', label: 'home.categories1.edible.cookies', icon: <FaCookie/> },
      { key: 'snack', label: 'home.categories1.edible.snack', icon: <FaCookieBite/> },
      { key: 'chocolate', label: 'home.categories1.edible.chocolate', icon: <GiChocolateBar/> },
      { key: 'drinks', label: 'home.categories1.edible.drinks', icon: <FaGlassCheers/> }, 
    ]
  },
  {
    id: 'clothing',
    label: 'home.nav.fashion',
    icon: <FaTshirt />, 
    activeGradient: 'from-violet-600 via-purple-600 to-indigo-600',
    itemColor: 'text-purple-600',
    theme: {
        bg: 'bg-purple-50',
        border: 'border-purple-100',
        text: 'text-purple-600',
        hoverBorder: 'hover:border-purple-300',
        iconBg: 'bg-purple-100',
        activeRing: 'ring-purple-200'
    },
    subItems: [
        { 
            key: 'women', 
            label: 'home.categories1.clothes.women', 
            icon: <FaFemale/>,
            isGroup: true,
            children: [
                { key: 'w_dresses', label: 'home.categories1.clothes.women_clothes.dresses', icon: <GiDress/> },
                { key: 'w_bag', label: 'home.categories1.clothes.women_clothes.bag_women', icon: <FaShoppingBag/> },
                { key: 'w_perfume', label: 'home.categories1.clothes.women_clothes.parfume_women', icon: <GiLipstick/> },
                { key: 'w_accessory', label: 'home.categories1.clothes.women_clothes.accessory', icon: <FaGem/> },
                { key: 'w_tops', label: 'home.categories1.clothes.women_clothes.tops', icon: <FaTshirt/> },
                { key: 'w_skirts', label: 'home.categories1.clothes.women_clothes.skirts', icon: <GiSkirt/> },
                { key: 'w_pants', label: 'home.categories1.clothes.women_clothes.pants', icon: <GiTrousers/> },
                { key: 'w_sleep', label: 'home.categories1.clothes.women_clothes.sleepwear', icon: <FaFemale/> },
                { key: 'w_active', label: 'home.categories1.clothes.women_clothes.activeWear', icon: <FaRunning/> },
            ]
        },
        { 
            key: 'men', 
            label: 'home.categories1.clothes.men', 
            icon: <FaMale/>,
            isGroup: true,
            children: [
                { key: 'm_shirts', label: 'home.categories1.clothes.men_clothes.shirts', icon: <GiShirt/> },
                { key: 'm_suits', label: 'home.categories1.clothes.men_clothes.suits', icon: <GiTie/> },
                { key: 'm_bag', label: 'home.categories1.clothes.men_clothes.bag_men', icon: <FaShoppingBag/> },
                { key: 'm_perfume', label: 'home.categories1.clothes.men_clothes.parfume_men', icon: <GiLipstick/> },
                { key: 'm_hoodies', label: 'home.categories1.clothes.men_clothes.hoodies', icon: <GiHoodie/> },
                { key: 'm_pants', label: 'home.categories1.clothes.men_clothes.pants', icon: <GiTrousers/> },
                { key: 'm_active', label: 'home.categories1.clothes.men_clothes.activeWear', icon: <FaRunning/> },
            ]
        },
        { 
            key: 'baby', 
            label: 'home.categories1.clothes.baby', 
            icon: <FaBaby/>,
            isGroup: true,
            children: [
                { key: 'b_body', label: 'home.categories1.clothes.baby_clothes.bodysuits', icon: <FaBaby/> },
                { key: 'b_rompers', label: 'home.categories1.clothes.baby_clothes.rompers', icon: <FaChild/> },
                { key: 'b_shoes', label: 'home.categories1.clothes.baby_clothes.shoes', icon: <GiRunningShoe/> },
                { key: 'b_acc', label: 'home.categories1.clothes.baby_clothes.accessories', icon: <FaGem/> },
            ]
        },
        { 
            key: 'kids', 
            label: 'home.categories1.clothes.kids', 
            icon: <FaChild/>,
            isGroup: true,
            children: [
                { key: 'k_tops', label: 'home.categories1.clothes.kids_clothes.tops', icon: <FaTshirt/> },
                { key: 'k_dresses', label: 'home.categories1.clothes.kids_clothes.dresses', icon: <GiDress/> },
                { key: 'k_active', label: 'home.categories1.clothes.kids_clothes.activeWear', icon: <FaRunning/> },
                { key: 'k_shoes', label: 'home.categories1.clothes.kids_clothes.shoes', icon: <GiRunningShoe/> },
            ]
        },
    ]
  },
  {
    id: 'other',
    label: 'home.nav.other',
    icon: <FiMoreHorizontal />, 
    activeGradient: 'from-gray-500 via-slate-500 to-zinc-600',
    itemColor: 'text-slate-600',
    theme: {
        bg: 'bg-slate-50',
        border: 'border-slate-100',
        text: 'text-slate-600',
        hoverBorder: 'hover:border-slate-300',
        iconBg: 'bg-slate-100',
        activeRing: 'ring-slate-200'
    },
    subItems: [
      { key: 'home_decor', label: 'home.categories1.others.home_decor', icon: <FaHome/> },
      { key: 'tech', label: 'home.categories1.others.tech', icon: <FaCreditCard/> },
      { key: 'sports', label: 'home.categories1.others.sports', icon: <FaDumbbell/> },
      { key: 'stationery', label: 'home.categories1.others.stationery', icon: <FaBook/> },
      { key: 'protein', label: 'home.categories1.others.proteinPowder', icon: <FaDumbbell/> },
    ]
  }
];

const CategoryNav = ({ onSelectCategory, activeCategory }) => {
  const { t } = useTranslation();
  const isMainView = activeCategory === 'all';
  
  // State
  const [showNav, setShowNav] = useState(true);
  const [selectedSubGroup, setSelectedSubGroup] = useState(null);
  const lastScrollY = useRef(0);
  const isNavHiddenRef = useRef(false);

  // Scroll Refs
  const mainCategoryRef = useRef(null);
  const subCategoryRef = useRef(null);
  
  // Arrow Visibility States
  const [canScrollMainLeft, setCanScrollMainLeft] = useState(false);
  const [canScrollMainRight, setCanScrollMainRight] = useState(false);
  const [canScrollSubLeft, setCanScrollSubLeft] = useState(false);
  const [canScrollSubRight, setCanScrollSubRight] = useState(false);

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const activeGroup = MENU_STRUCTURE.find(group => 
    group.id === activeCategory || group.subItems.some(sub => sub.key === activeCategory || (sub.children && sub.children.some(child => child.key === activeCategory)))
  );

  // --- SCROLL HIDE/SHOW LOGIC ---
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


  // --- GENERIC CHECK SCROLL FUNCTION ---
  const checkScroll = (ref, setLeft, setRight) => {
    if (ref.current) {
        const { scrollLeft, scrollWidth, clientWidth } = ref.current;
        setLeft(scrollLeft > 10);
        setRight(scrollLeft < scrollWidth - clientWidth - 2); 
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    checkScroll(mainCategoryRef, setCanScrollMainLeft, setCanScrollMainRight);
    window.addEventListener('resize', () => checkScroll(mainCategoryRef, setCanScrollMainLeft, setCanScrollMainRight));
    return () => window.removeEventListener('resize', () => checkScroll(mainCategoryRef, setCanScrollMainLeft, setCanScrollMainRight));
  }, []);

  useEffect(() => {
    if (!isMainView) {
        setTimeout(() => checkScroll(subCategoryRef, setCanScrollSubLeft, setCanScrollSubRight), 100);
        window.addEventListener('resize', () => checkScroll(subCategoryRef, setCanScrollSubLeft, setCanScrollSubRight));
        return () => window.removeEventListener('resize', () => checkScroll(subCategoryRef, setCanScrollSubLeft, setCanScrollSubRight));
    }
  }, [isMainView, activeGroup, selectedSubGroup]);

  useEffect(() => {
    if (!isMainView && subCategoryContainerRef.current) {
       subCategoryContainerRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [activeGroup, isMainView, selectedSubGroup]);


  // --- HANDLERS ---
  const scrollContainer = (ref, direction, e) => {
    if(e) e.stopPropagation(); 

    if (ref.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(() => {
        if(ref === mainCategoryRef) checkScroll(mainCategoryRef, setCanScrollMainLeft, setCanScrollMainRight);
        else checkScroll(subCategoryRef, setCanScrollSubLeft, setCanScrollSubRight);
      }, 300);
    }
  };

  const handleMouseDown = (e, ref) => {
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e, ref, checkFn) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2;
    ref.current.scrollLeft = scrollLeft - walk;
    checkFn();
  };

  const handleSelection = (item) => {
    if (isDragging) return; 
    if (item.isGroup) {
        setSelectedSubGroup(item);
    } else {
        onSelectCategory(item.key);
    }
  };

  const handleMainGroupClick = (group) => {
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
  
  const subCategoryContainerRef = useRef(null); 

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* NAVBAR CONTAINER */}
      <div 
        className={`fixed left-0 right-0 z-40 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-white/95 backdrop-blur-2xl border-b border-gray-100/60 shadow-sm
            ${showNav ? "translate-y-0" : "-translate-y-[150%]"} 
        `}
        style={{ top: "60px" }} 
      >
        <div className="relative w-full max-w-[1400px] mx-auto">
            
            {/* VIEW 1: ANA MENÜ */}
            <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden relative
                    ${isMainView ? "max-h-[90px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4 pointer-events-none"}
                `}
            >
                {/* SOL OK (Main) */}
                <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/90 to-transparent z-[60] transition-opacity duration-300 flex items-center pl-1 pointer-events-none ${canScrollMainLeft ? 'opacity-100' : 'opacity-0'}`}>
                    <button 
                        onClick={(e) => scrollContainer(mainCategoryRef, 'left', e)} 
                        className="pointer-events-auto p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-slate-600 hover:scale-110 active:scale-95"
                    >
                        <FiChevronLeft size={18} />
                    </button>
                </div>

                {/* SAĞ OK (Main) */}
                <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/90 to-transparent z-[60] transition-opacity duration-300 flex items-center justify-end pr-1 pointer-events-none ${canScrollMainRight ? 'opacity-100' : 'opacity-0'}`}>
                    <button 
                        onClick={(e) => scrollContainer(mainCategoryRef, 'right', e)} 
                        className="pointer-events-auto p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-slate-600 hover:scale-110 active:scale-95"
                    >
                        <FiChevronRight size={18} />
                    </button>
                </div>

                {/* SCROLLABLE LIST */}
                <div 
                    ref={mainCategoryRef}
                    onScroll={() => checkScroll(mainCategoryRef, setCanScrollMainLeft, setCanScrollMainRight)}
                    onMouseDown={(e) => handleMouseDown(e, mainCategoryRef)}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={(e) => handleMouseMove(e, mainCategoryRef, () => checkScroll(mainCategoryRef, setCanScrollMainLeft, setCanScrollMainRight))}
                    className="flex items-center gap-2 overflow-x-auto hide-scrollbar px-4 py-3 scroll-smooth cursor-grab active:cursor-grabbing"
                >
                    <button 
                        onClick={() => !isDragging && onSelectCategory("all")}
                        className={`
                            flex items-center gap-2 px-5 py-2 rounded-full text-sm md:text-base font-bold transition-all duration-300 flex-shrink-0 shadow-md shadow-pink-200/40 hover:shadow-lg hover:scale-[1.02]
                            bg-gradient-to-r from-[#d91897] to-[#9b2fe1] text-white border border-transparent
                        `}
                    >
                        <FiGrid className="text-white" size={18}/>
                        <span className="whitespace-nowrap">{t('home.allProducts')}</span>
                    </button>

                    <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0 hidden md:block"></div>

                    {MENU_STRUCTURE.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => !isDragging && handleMainGroupClick(item)}
                            className={`
                                group relative flex items-center gap-2.5 px-5 py-2 rounded-full text-sm md:text-base font-bold transition-all duration-300 select-none flex-shrink-0 border overflow-hidden
                                bg-white border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md
                            `}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${item.activeGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                            <span className={`relative z-10 text-xl transition-transform duration-300 group-hover:scale-110 ${item.itemColor}`}>
                                {item.icon}
                            </span>
                            <span className="relative z-10 text-slate-700 group-hover:text-pink-600 tracking-tight transition-colors whitespace-nowrap">
                                {t(item.label)}
                            </span>
                        </button>
                    ))}
                    <div className="w-2 flex-shrink-0"></div>
                </div>
            </div>

            {/* VIEW 2: ALT MENÜ */}
            <div 
                className={`transition-all duration-500 ease-in-out
                    ${!isMainView ? "max-h-[90px] opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-4 pointer-events-none"}
                `}
            >
                {/* DEĞİŞİKLİK BURADA: 
                    Artık 'flex' yapısını tek bir div içinde tuttuk. 
                    Sabit duran sol kısım (Back button) artık scroll container'ın İÇİNDE.
                */}
                <div className="relative px-4 py-3">

                    {/* SOL OK (Sub) */}
                    <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/90 to-transparent z-[60] transition-opacity duration-300 flex items-center pl-1 pointer-events-none ${canScrollSubLeft ? 'opacity-100' : 'opacity-0'}`}>
                        <button 
                            onClick={(e) => scrollContainer(subCategoryRef, 'left', e)} 
                            className="pointer-events-auto p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-pink-600 hover:scale-110 active:scale-95"
                        >
                            <FiChevronLeft size={18} />
                        </button>
                    </div>

                    {/* SAĞ OK (Sub) */}
                    <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/90 to-transparent z-[60] transition-opacity duration-300 flex items-center justify-end pr-1 pointer-events-none ${canScrollSubRight ? 'opacity-100' : 'opacity-0'}`}>
                        <button 
                            onClick={(e) => scrollContainer(subCategoryRef, 'right', e)} 
                            className="pointer-events-auto p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-pink-600 hover:scale-110 active:scale-95"
                        >
                            <FiChevronRight size={18} />
                        </button>
                    </div>

                    {/* TEK SCROLL CONTAINER */}
                    {activeGroup && (
                         <div 
                            ref={subCategoryRef}
                            onScroll={() => checkScroll(subCategoryRef, setCanScrollSubLeft, setCanScrollSubRight)}
                            onMouseDown={(e) => handleMouseDown(e, subCategoryRef)} 
                            onMouseLeave={handleMouseLeave} 
                            onMouseUp={handleMouseUp} 
                            onMouseMove={(e) => handleMouseMove(e, subCategoryRef, () => checkScroll(subCategoryRef, setCanScrollSubLeft, setCanScrollSubRight))}
                            className="flex items-center gap-3 overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing px-2 md:px-4 py-2 scroll-smooth"
                         >
                            {/* 1. ELEMAN: GERİ BUTONU ARTIK BURADA */}
                            <button 
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-pink-300 hover:text-pink-600 hover:shadow-md active:scale-95 transition-all shadow-sm flex-shrink-0 group"
                            >
                                <div className="bg-slate-100 p-1 rounded-full group-hover:bg-pink-100 transition-colors">
                                    <FiArrowLeft size={14} className="text-slate-500 group-hover:text-pink-500"/>
                                </div>
                                <span className="tracking-wide whitespace-nowrap">
                                    {selectedSubGroup ? t('common.back') || 'GERİ' : 'MENU'}
                                </span>
                            </button>

                            {/* 2. ELEMAN: (Varsa) SEÇİLİ GRUP ADI */}
                            {selectedSubGroup && (
                                <div className="hidden md:flex items-center gap-1 text-slate-400 text-sm font-medium animate-fade-in flex-shrink-0">
                                    <span className="text-slate-300">|</span>
                                    <span className={activeGroup?.itemColor}>{selectedSubGroup.icon}</span>
                                    <span className="whitespace-nowrap">{t(selectedSubGroup.label)}</span>
                                </div>
                            )}

                            {/* 3. ELEMAN: AYRAÇ */}
                            <div className="h-6 w-px bg-slate-100 mx-1 hidden md:block flex-shrink-0"></div>

                            {/* 4. ELEMANLAR: KATEGORİLER */}
                            {itemsDisplay.map((sub) => {
                                const isActive = activeCategory === sub.key;
                                return (
                                    <button
                                        key={sub.key}
                                        onClick={() => handleSelection(sub)}
                                        className={`
                                            group relative flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex-shrink-0 select-none border
                                            ${isActive
                                                ? `bg-gradient-to-r ${activeGroup.activeGradient} text-white shadow-md shadow-pink-200/50 scale-105 border-transparent ring-2 ring-offset-1 ${activeGroup.theme.activeRing}`
                                                : `bg-white ${activeGroup.theme.border} text-slate-600 ${activeGroup.theme.hoverBorder} hover:shadow-lg hover:-translate-y-0.5`
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors duration-300
                                            ${isActive ? "bg-white/20 text-white" : `${activeGroup.theme.iconBg} ${activeGroup.theme.text} group-hover:scale-110`}
                                        `}>
                                            {sub.icon}
                                        </div>

                                        <span className="whitespace-nowrap z-10">{t(sub.label)}</span>
                                        
                                        {sub.isGroup && (
                                            <FiChevronRight className={`ml-1 opacity-50 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                        )}
                                    </button>
                                )
                            })}
                            <div className="w-2 flex-shrink-0"></div>
                         </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </>
  );
};

export default CategoryNav;