import { FiMoreHorizontal } from "react-icons/fi";
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
  GiSkirt, GiShirt, GiStarsStack,
  GiRunningShoe, GiTie
} from "react-icons/gi";
import { LuFlower2 } from "react-icons/lu";
import { PiFlowerLotusDuotone } from "react-icons/pi";

// MEVCUT MAP (Sizin gönderdiğiniz)
export const CATEGORY_KEY_MAP = {
  bouquet: "flowers.bouquet",
  special: "flowers.special",
  rose: "flowers.rose",
  orchid: "flowers.orchid",
  daisy: "flowers.daisy",
  tulip: "flowers.tulip",
  designFlowers: "flowers.designFlowers",
  indoor_flowers: "flowers.indoor_flowers",
  unique: "flowers.unique",
  women: "clothes.women",
  dresses: "clothes.women_clothes.dresses",
  tops: "clothes.women_clothes.tops",
  bottoms: "clothes.women_clothes.bottoms",
  skirts: "clothes.women_clothes.skirts",
  tshirt: "clothes.women_clothes.tshirt",
  pants: "clothes.women_clothes.pants",
  shorts: "clothes.women_clothes.shorts",
  casual: "clothes.women_clothes.casual",
  formal: "clothes.women_clothes.formal",
  lingerines: "clothes.women_clothes.lingerines",
  sleepwear: "clothes.women_clothes.sleepwear",
  activeWear: "clothes.women_clothes.activeWear",
  hats: "clothes.women_clothes.hats",
  watches: "clothes.women_clothes.watches",
  shirt: "clothes.women_clothes.shirt",
  jacket: "clothes.women_clothes.jacket",
  styles: "clothes.women_clothes.styles",
  bag_women: "clothes.women_clothes.bag_women",
  parfume_women: "clothes.women_clothes.parfume_women",
  accessory: "clothes.women_clothes.accessory",
  men: "clothes.men",
  shirts: "clothes.men_clothes.shirts",
  suits: "clothes.men_clothes.suits",
  hoodies: "clothes.men_clothes.hoodies",
  bag_men: "clothes.men_clothes.bag_men",
  parfume_men: "clothes.men_clothes.parfume_men",
  underwear: "clothes.men_clothes.underwear",
  Stiller: "clothes.men_clothes.Stiller",
  baby: "clothes.baby",
  kids: "clothes.kids",
  bodysuits: "clothes.baby_clothes.bodysuits",
  rompers: "clothes.baby_clothes.rompers",
  outerwear: "clothes.baby_clothes.outerwear",
  shoes: "clothes.baby_clothes.shoes",
  accessories: "clothes.baby_clothes.accessories",
  kids_clothes: "clothes.kids_clothes",
  jackets: "clothes.kids_clothes.jackets",
  tshirts: "clothes.kids_clothes.tshirts",
  edible: "edible.edible",
  cake: "edible.cake",
  cookies: "edible.cookies",
  drinks: "edible.drinks",
  chocolate: "edible.chocolate",
  fruit_basket: "edible.fruit_basket",
  chocolate_box: "edible.chocolate_box",
  snack: "edible.snack",
  gift: "gifts.gift",
  gifts: "gifts",
  for_him: "gifts.for_him",
  for_her: "gifts.for_her",
  for_kids: "gifts.for_kids",
  personalized: "gifts.personalized",
  books: "gifts.books",
  crypto: "gifts.crypto",
  giftcard: "gifts.giftcard",
  birthday: "gifts.birthday",
  anniversary: "gifts.anniversary",
  other: "others.other",
  others: "others",
  proteinPowder: "others.proteinPowder",
  tech: "others.tech",
  home_decor: "others.home_decor",
  stationery: "others.stationery",
  sports: "others.sports"
};

// MEVCUT GRUPLAR (Sizin gönderdiğiniz)
export const CATEGORY_GROUPS = [
 // ... (Boş bırakmıştınız, burayı değiştirmedim) ...
];

// YENİ EKLENEN: MENU_STRUCTURE (Görsel Navigasyon Verisi)
export const MENU_STRUCTURE = [
  {
    id: 'flowers',
    label: 'home.nav.flowers',
    icon: <IoFlowerOutline />, 
    activeGradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
    itemColor: 'text-pink-600',
    theme: { bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-600', hoverBorder: 'hover:border-pink-300', iconBg: 'bg-pink-100', activeRing: 'ring-pink-200' },
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
    theme: { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-600', hoverBorder: 'hover:border-sky-300', iconBg: 'bg-sky-100', activeRing: 'ring-sky-200' },
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
    theme: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600', hoverBorder: 'hover:border-orange-300', iconBg: 'bg-orange-100', activeRing: 'ring-orange-200' },
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
    theme: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', hoverBorder: 'hover:border-purple-300', iconBg: 'bg-purple-100', activeRing: 'ring-purple-200' },
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
    theme: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-600', hoverBorder: 'hover:border-slate-300', iconBg: 'bg-slate-100', activeRing: 'ring-slate-200' },
    subItems: [
      { key: 'home_decor', label: 'home.categories1.others.home_decor', icon: <FaHome/> },
      { key: 'tech', label: 'home.categories1.others.tech', icon: <FaCreditCard/> },
      { key: 'sports', label: 'home.categories1.others.sports', icon: <FaDumbbell/> },
      { key: 'stationery', label: 'home.categories1.others.stationery', icon: <FaBook/> },
      { key: 'protein', label: 'home.categories1.others.proteinPowder', icon: <FaDumbbell/> },
    ]
  }
];

// --- HİYERARŞİ VE YARDIMCI FONKSİYONLAR (HomePage için) ---

// 1. Kategori Ağacı (Hangi ana başlık altında neler var?)
export const CATEGORY_HIERARCHY = {
  flowers: ['flowers', 'designFlowers', 'rose', 'bouquet', 'orchid', 'special', 'daisy', 'tulip', 'indoor_flowers', 'unique'],
  gifts: ['gifts', 'gift', 'personalized', 'birthday', 'anniversary', 'for_her', 'for_him', 'for_kids', 'giftcard', 'books', 'crypto'],
  edible: ['edible', 'chocolate_box', 'fruit_basket', 'cake', 'cookies', 'snack', 'chocolate', 'drinks'],
  clothing: [
    'clothing', 
    'women', 'w_dresses', 'w_bag', 'w_perfume', 'w_accessory', 'w_tops', 'w_skirts', 'w_pants', 'w_sleep', 'w_active',
    'men', 'm_shirts', 'm_suits', 'm_bag', 'm_perfume', 'm_hoodies', 'm_pants', 'm_active',
    'baby', 'b_body', 'b_rompers', 'b_shoes', 'b_acc',
    'kids', 'k_tops', 'k_dresses', 'k_active', 'k_shoes'
  ],
  other: ['other', 'home_decor', 'tech', 'sports', 'stationery', 'proteinPowder']
};

// 2. Yardımcı Fonksiyon: Bir anahtar kelime verildiğinde, onunla ilişkili tüm alt kategorileri bulur.
// Örn: getRelatedCategories('edible') -> ['edible', 'cake', 'cookies', ...]
export const getRelatedCategories = (key) => {
  if (!key || key === 'all') return [];
  
  // Ana kategori mi? (Örn: edible)
  if (CATEGORY_HIERARCHY[key]) {
    return CATEGORY_HIERARCHY[key];
  }

  // Değilse, belki bir alt gruptur veya tekil kategoridir, kendisini dizi içinde dön.
  return [key];
};