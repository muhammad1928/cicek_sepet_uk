export const REGIONS = [
    {
      id: "uk",
      name: "United Kingdom",
      isActive: true, // ŞU AN SADECE BU AKTİF
      cities: [
        { id: "ldn", name: "London", isActive: true },
        { id: "mcr", name: "Manchester", isActive: false },
        { id: "bhm", name: "Birmingham", isActive: false }
      ]
    },
    {
      id: "de",
      name: "Germany",
      isActive: false, // Gelecekte true yaparsan açılır
      cities: [
        { id: "ber", name: "Berlin", isActive: true },
        { id: "mun", name: "Munich", isActive: true }
      ]
    },
    {
      id: "tr",
      name: "Turkey",
      isActive: false, 
      cities: [
        { id: "ist", name: "Istanbul", isActive: true }
      ]
    }
];