export type FleetCategory = "Executive" | "Family" | "Group" | "Desert" | "Accessible";
export type VehicleImage = { src: string; label: string };

export type Vehicle = {
  id: string;
  name: string;
  arabicName: string;
  category: FleetCategory;
  label: string;
  description: string;
  arabicDescription: string;
  seats: string;
  luggage: string;
  price: number;
  bestFor: string;
  arabicBestFor: string;
  fuel: string;
  arabicFuel: string;
  images: VehicleImage[];
  features: string[];
  arabicFeatures: string[];
};

const standardGallery = (prefix: string): VehicleImage[] => [
  { src: `/vehicles/${prefix}-front.webp`, label: "Front three-quarter" },
  { src: `/vehicles/${prefix}-rear.webp`, label: "Rear three-quarter" },
  { src: `/vehicles/${prefix}-side.webp`, label: "Full side profile" },
  { src: `/vehicles/${prefix}-interior.webp`, label: "Passenger cabin" },
  { src: `/vehicles/${prefix}-luggage.webp`, label: "Luggage space" },
];

const xpanderGallery: VehicleImage[] = [
  { src: "/vehicles/branded/xpander-front.png", label: "Front three-quarter" },
  { src: "/vehicles/branded/xpander-rear.png", label: "Rear three-quarter" },
  { src: "/vehicles/branded/xpander-side.png", label: "Full side profile" },
  { src: "/vehicles/branded/xpander-interior.png", label: "Passenger cabin" },
  { src: "/vehicles/branded/xpander-luggage.png", label: "Luggage space" },
];

const hiaceGallery: VehicleImage[] = [
  { src: "/vehicles/branded/hiace-front.png", label: "Front three-quarter" },
  { src: "/vehicles/branded/hiace-rear.png", label: "Rear three-quarter" },
  { src: "/vehicles/branded/hiace-side.png", label: "Full side profile" },
  { src: "/vehicles/branded/hiace-rear-side.png", label: "Rear side profile" },
  { src: "/vehicles/branded/hiace-front-side.png", label: "Alternate front" },
];

export const vehicles: Vehicle[] = [
  {
    id: "executive-sedan",
    name: "Nile Executive Sedan",
    arabicName: "سيدان النيل التنفيذية",
    category: "Executive",
    label: "Quiet luxury for the city",
    description: "A polished private sedan for airport arrivals, hotel transfers and unhurried city days with a little more room to breathe.",
    arabicDescription: "سيارة سيدان خاصة وهادئة للاستقبال من المطار والتنقل بين الفنادق والجولات داخل المدينة براحة وأناقة.",
    seats: "Up to 3 guests",
    luggage: "2 large bags",
    price: 55,
    bestFor: "Airport arrivals, couples and city routes",
    arabicBestFor: "استقبال المطار، الأزواج والجولات داخل المدينة",
    fuel: "Comfort-tuned petrol",
    arabicFuel: "بنزين مهيأ للراحة",
    images: standardGallery("executive-sedan"),
    features: ["Air conditioning", "Bottled water", "Phone charging", "Professional driver", "Door-to-door pickup"],
    arabicFeatures: ["تكييف هواء", "مياه معدنية", "شحن الهاتف", "سائق محترف", "استقبال من الباب إلى الباب"],
  },
  {
    id: "toyota-hiace",
    name: "Toyota Hiace",
    arabicName: "تويوتا هاي إيس",
    category: "Group",
    label: "A calm cabin for larger groups",
    description: "A real AlpNile group van for airport runs, family journeys and full-day tours, with easy boarding and generous room for luggage.",
    arabicDescription: "فان حقيقي من أسطول AlpNile للمجموعات والعائلات، مناسب للمطارات والرحلات اليومية مع مساحة واسعة للركاب والأمتعة.",
    seats: "Up to 12 guests",
    luggage: "8 large bags",
    price: 85,
    bestFor: "Groups, airport transfers and full-day tours",
    arabicBestFor: "المجموعات، استقبال المطار والرحلات اليومية",
    fuel: "Long-range diesel",
    arabicFuel: "ديزل اقتصادي للرحلات الطويلة",
    images: hiaceGallery,
    features: ["High-roof cabin", "USB charging", "Climate control", "Large luggage bay", "Flexible route timing"],
    arabicFeatures: ["مقصورة مرتفعة", "شحن USB", "تحكم في المناخ", "مساحة أمتعة كبيرة", "مرونة في توقيت الرحلة"],
  },
  {
    id: "desert-suv",
    name: "Desert Trail 4×4",
    arabicName: "دفع رباعي لمسارات الصحراء",
    category: "Desert",
    label: "Ready for the road beyond the road",
    description: "A capable 4×4 for desert tracks, oases and open landscapes, with the comfort and local support needed for a full day out.",
    arabicDescription: "سيارة دفع رباعي للطرق الصحراوية والواحات والمساحات المفتوحة، مع راحة ودعم محلي طوال اليوم.",
    seats: "Up to 4 guests",
    luggage: "4 large bags",
    price: 95,
    bestFor: "Desert safaris, oases and remote viewpoints",
    arabicBestFor: "السفاري، الواحات والنقاط البعيدة",
    fuel: "All-terrain diesel",
    arabicFuel: "ديزل للطرق الوعرة",
    images: standardGallery("desert-suv"),
    features: ["High-clearance drive", "Cooler box", "Desert-ready tires", "Sun protection", "Experienced local driver"],
    arabicFeatures: ["ارتفاع مناسب للطرق الوعرة", "صندوق تبريد", "إطارات صحراوية", "حماية من الشمس", "سائق محلي خبير"],
  },
  {
    id: "mitsubishi-xpander",
    name: "Mitsubishi Xpander",
    arabicName: "ميتسوبيشي إكسباندر",
    category: "Family",
    label: "The family car from our real fleet",
    description: "A real AlpNile family vehicle with comfortable seating, easy loading and the flexibility to move from airport pickup to a full day of exploring.",
    arabicDescription: "سيارة عائلية حقيقية من أسطول AlpNile بمقاعد مريحة وتحميل سهل، مناسبة من لحظة الاستقبال وحتى يوم كامل من الاستكشاف.",
    seats: "Up to 6 guests",
    luggage: "4 large bags",
    price: 72,
    bestFor: "Families, airport transfers and city-to-city routes",
    arabicBestFor: "العائلات، استقبال المطار والتنقل بين المدن",
    fuel: "Efficient petrol",
    arabicFuel: "بنزين اقتصادي",
    images: xpanderGallery,
    features: ["Comfortable family cabin", "Child-seat request", "Wide rear doors", "Air conditioning", "Flexible stops"],
    arabicFeatures: ["مقصورة عائلية مريحة", "إمكانية طلب مقعد أطفال", "أبواب خلفية واسعة", "تكييف هواء", "توقفات مرنة"],
  },
  {
    id: "accessible-minibus",
    name: "Accessible Nile Shuttle",
    arabicName: "حافلة النيل المجهزة",
    category: "Accessible",
    label: "Thoughtful access, without compromise",
    description: "A spacious accessible vehicle with a discreet ramp, clear boarding space and a team ready to shape the route around your needs.",
    arabicDescription: "سيارة واسعة ومجهزة لسهولة الوصول، مع منحدر عملي ومساحة صعود واضحة وفريق يراعي احتياجات الرحلة.",
    seats: "Up to 6 guests + 1 wheelchair",
    luggage: "4 large bags",
    price: 90,
    bestFor: "Accessible routes, families and assisted travel",
    arabicBestFor: "الرحلات المجهزة، العائلات والسفر بمساعدة",
    fuel: "Smooth diesel",
    arabicFuel: "ديزل سلس",
    images: standardGallery("accessible-minibus"),
    features: ["Side wheelchair ramp", "Low-step boarding", "Wide aisle", "Trained support team", "Route accessibility review"],
    arabicFeatures: ["منحدر جانبي للكرسي المتحرك", "صعود منخفض", "ممر واسع", "فريق مدرب", "مراجعة سهولة المسار"],
  },
];

export const fleetCategories: (FleetCategory | "All")[] = ["All", "Executive", "Family", "Group", "Desert", "Accessible"];

export function getVehicle(id: string) {
  return vehicles.find((vehicle) => vehicle.id === id);
}
