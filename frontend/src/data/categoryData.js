// src/data/categoryData.js

export const CATEGORY_KEY_MAP = {
  // Flowers
  bouquet: "flowers.bouquet",
  special: "flowers.special",
  rose: "flowers.rose",
  orchid: "flowers.orchid",
  daisy: "flowers.daisy",
  tulip: "flowers.tulip",
  designFlowers: "flowers.designFlowers",
  indoor_flowers: "flowers.indoor_flowers",
  unique: "flowers.unique",

  // Women
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

  // Men
  men: "clothes.men",
  shirts: "clothes.men_clothes.shirts",
  suits: "clothes.men_clothes.suits",
  hoodies: "clothes.men_clothes.hoodies",
  bag_men: "clothes.men_clothes.bag_men",
  parfume_men: "clothes.men_clothes.parfume_men",
  underwear: "clothes.men_clothes.underwear",
  Stiller: "clothes.men_clothes.Stiller",

  // Baby & Kids
  baby: "clothes.baby",
  kids: "clothes.kids",
  bodysuits: "clothes.baby_clothes.bodysuits",
  rompers: "clothes.baby_clothes.rompers",
  outerwear: "clothes.baby_clothes.outerwear",
  shoes: "clothes.baby_clothes.shoes",
  accessories: "clothes.baby_clothes.accessories",
  
  // Kids Specifics
  kids_clothes: "clothes.kids_clothes",
  jackets: "clothes.kids_clothes.jackets",
  tshirts: "clothes.kids_clothes.tshirts",

  // Edible
  edible: "edible.edible",
  cake: "edible.cake",
  cookies: "edible.cookies",
  drinks: "edible.drinks",
  chocolate: "edible.chocolate",
  fruit_basket: "edible.fruit_basket",
  chocolate_box: "edible.chocolate_box",
  snack: "edible.snack",

  // Gifts
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

  // Others
  other: "others.other",
  others: "others",
  proteinPowder: "others.proteinPowder",
  tech: "others.tech",
  home_decor: "others.home_decor",
  stationery: "others.stationery",
  sports: "others.sports"
};

export const CATEGORY_GROUPS = [
  {
    label: "Flowers & Plants",
    type: "flower",
    options: ["bouquet", "special", "rose", "orchid", "daisy", "tulip", "designFlowers", "indoor_flowers", "unique"]
  },
  {
    label: "Women's Fashion",
    type: "clothing",
    options: [
        "women", "dresses", "tops", "bottoms", "skirts", "tshirt", "pants", "shorts", "casual", 
        "formal", "lingerines", "sleepwear", "activeWear", "hats", "watches", "jacket", "styles", "bag_women", "parfume_women", "accessory", "shirt"
    ]
  },
  {
    label: "Men's Fashion",
    type: "clothing",
    options: ["men", "shirts", "suits", "hoodies", "bag_men", "parfume_men", "underwear", "Stiller", "pants", "shorts", "casual", "formal", "tops", "bottoms", "activeWear", "jacket", "sleepwear", "hats", "watches"]
  },
  {
    label: "Kids & Baby",
    type: "clothing",
    options: ["baby", "kids", "bodysuits", "rompers", "outerwear", "shoes", "accessories", "jackets", "tshirts", "dresses", "tops", "bottoms", "pants", "shorts", "activeWear", "sleepwear"]
  },
  {
    label: "Edible & Food",
    type: "food",
    options: ["cake", "cookies", "drinks", "chocolate", "fruit_basket", "chocolate_box", "snack"]
  },
  {
    label: "Gifts & Occasions",
    type: "gift",
    options: ["for_him", "for_her", "for_kids", "personalized", "books", "crypto", "giftcard", "birthday", "anniversary"]
  },
  {
    label: "Other",
    type: "other",
    options: ["proteinPowder", "tech", "home_decor", "stationery", "sports"]
  }
];