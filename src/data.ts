import { Doctor, Lab, Listing, Pharmacy, Section, Store, SubCategory } from './types';

// بيانات البذور — الـRepository يضيف الحقول التشغيلية (status/createdAt)
type SeedListing = Omit<Listing, 'status' | 'createdAt'>;

export const GOVS = ['الكل', 'الحسكة', 'القامشلي', 'دير الزور', 'الرقة'];

export const SECTIONS: Section[] = [
  { key: 'estate', name: 'عقارات', icon: 'home', g1: '#0E6B4A', g2: '#2E9E6B', image: require('../assets/sections/estate.jpg') },
  { key: 'medical', name: 'طبي', icon: 'stethoscope', g1: '#1E6FA3', g2: '#4FB0E3', image: require('../assets/sections/medical.jpg') },
  { key: 'cars', name: 'سيارات', icon: 'car', g1: '#3A3F4B', g2: '#7A8494', image: require('../assets/sections/cars.jpg') },
  { key: 'food', name: 'مطاعم ومأكولات', icon: 'silverware-fork-knife', g1: '#A33E2A', g2: '#E07B4F', image: require('../assets/sections/food.jpg') },
  { key: 'malls', name: 'مولات ومتاجر', icon: 'storefront', g1: '#7A4A1F', g2: '#D9A441', image: require('../assets/sections/malls.jpg') },
  { key: 'services', name: 'خدمات وحرف', icon: 'tools', g1: '#5B4A8A', g2: '#9A8AD1', image: require('../assets/sections/services.jpg') },
];

export const SUBCATS: Record<string, SubCategory[]> = {
  cars: [
    { key: 'sale', name: 'سيارات للبيع', icon: 'car', g1: '#3A3F4B', g2: '#7A8494', image: require('../assets/sections/subs/sale.jpg') },
    { key: 'rent', name: 'سيارات للإيجار', icon: 'key', g1: '#1E6FA3', g2: '#4FB0E3', image: require('../assets/sections/subs/rent.jpg') },
    { key: 'moto', name: 'دراجات نارية', icon: 'motorbike', g1: '#6B4A12', g2: '#C9963B', image: require('../assets/sections/subs/moto.jpg') },
    { key: 'parts', name: 'قطع غيار', icon: 'cog', g1: '#5C5C5C', g2: '#9A9A9A', image: require('../assets/sections/subs/parts.jpg') },
  ],
  estate: [
    { key: 'apt-sale', name: 'شقق للبيع', icon: 'home', g1: '#0E6B4A', g2: '#2E9E6B', image: require('../assets/sections/subs/apt-sale.jpg') },
    { key: 'apt-rent', name: 'شقق للإيجار', icon: 'home-city', g1: '#1E6FA3', g2: '#4FB0E3', image: require('../assets/sections/subs/apt-rent.jpg') },
    { key: 'villa', name: 'فلل', icon: 'home-modern', g1: '#5B4A8A', g2: '#9A8AD1', image: require('../assets/sections/subs/villa.jpg') },
    { key: 'shop', name: 'محلات تجارية', icon: 'store', g1: '#7A4A1F', g2: '#D9A441', image: require('../assets/sections/subs/shop.jpg') },
    { key: 'land', name: 'أراضٍ', icon: 'terrain', g1: '#4A6B1E', g2: '#8AB83B', image: require('../assets/sections/subs/land.jpg') },
  ],
  medical: [
    { key: 'doctors', name: 'أطباء', icon: 'doctor', g1: '#1E6FA3', g2: '#4FB0E3', image: require('../assets/sections/subs/doctors.jpg') },
    { key: 'pharms', name: 'صيدليات', icon: 'pill', g1: '#C9A227', g2: '#8A6D14', image: require('../assets/sections/subs/pharms.jpg') },
    { key: 'labs', name: 'مخابر تحاليل', icon: 'test-tube', g1: '#0F4C5C', g2: '#2E9E9E', image: require('../assets/sections/subs/labs.jpg') },
  ],
  food: [
    { key: 'mashawi', name: 'مشاوي', icon: 'food-drumstick', g1: '#A33E2A', g2: '#E07B4F', image: require('../assets/sections/subs/mashawi.jpg') },
    { key: 'sharqi', name: 'شرقي', icon: 'pot', g1: '#8A5A14', g2: '#D9A441', image: require('../assets/sections/subs/sharqi.jpg') },
    { key: 'fast', name: 'فاست فود', icon: 'hamburger', g1: '#B25A1E', g2: '#E8A54B', image: require('../assets/sections/subs/fast.jpg') },
    { key: 'sweets', name: 'حلويات ومعجنات', icon: 'candy', g1: '#8A4A7A', g2: '#D18AC9', image: require('../assets/sections/subs/sweets.jpg') },
    { key: 'cafe', name: 'مقاهي', icon: 'coffee', g1: '#5C3A21', g2: '#A87B4F', image: require('../assets/sections/subs/cafe.jpg') },
  ],
  malls: [
    { key: 'clothes', name: 'ألبسة', icon: 'tshirt-crew', g1: '#7A2A4A', g2: '#D16A9A', image: require('../assets/sections/subs/clothes.jpg') },
    { key: 'electronics', name: 'إلكترونيات وموبايلات', icon: 'cellphone', g1: '#22262E', g2: '#5A6270', image: require('../assets/sections/subs/electronics.jpg') },
    { key: 'grocery', name: 'مواد غذائية', icon: 'basket', g1: '#4A6B1E', g2: '#8AB83B', image: require('../assets/sections/subs/grocery.jpg') },
    { key: 'furniture', name: 'أثاث ومفروشات', icon: 'sofa', g1: '#7A4A1F', g2: '#D9A441', image: require('../assets/sections/subs/furniture.jpg') },
    { key: 'perfume', name: 'عطور وتجميل', icon: 'flower', g1: '#8A4A7A', g2: '#D18AC9', image: require('../assets/sections/subs/perfume.jpg') },
  ],
  services: [
    { key: 'plumb', name: 'سباكة', icon: 'wrench', g1: '#0F4C5C', g2: '#2E9E9E', image: require('../assets/sections/subs/plumb.jpg') },
    { key: 'elect', name: 'كهرباء', icon: 'lightbulb', g1: '#9A6B12', g2: '#E8B93B', image: require('../assets/sections/subs/elect.jpg') },
    { key: 'ac', name: 'تكييف وتبريد', icon: 'snowflake', g1: '#1E6FA3', g2: '#7AC4E8', image: require('../assets/sections/subs/ac.jpg') },
    { key: 'carp', name: 'نجارة', icon: 'hammer', g1: '#6B4A12', g2: '#C9963B', image: require('../assets/sections/subs/carp.jpg') },
    { key: 'mobfix', name: 'صيانة موبايلات', icon: 'tools', g1: '#5B4A8A', g2: '#9A8AD1', image: require('../assets/sections/subs/mobfix.jpg') },
  ],
};

export const SPECS = ['عام', 'باطنية', 'أطفال', 'نسائية وتوليد', 'عظمية', 'جلدية', 'عيون', 'أسنان'];

export const STORES: Store[] = [
  // بلا بيانات تجريبية — المتاجر الحقيقية فقط (v15)
];

export const LISTINGS: SeedListing[] = [
  // بلا بيانات تجريبية — الإعلانات الحقيقية فقط (v15)
];

export const DOCTORS: Doctor[] = [
  // بلا بذر — الأطباء بالتسجيل الذاتي والموافقة فقط (v14)
];

export const PHARMS: Pharmacy[] = [
  { name: 'صيدلية الشفاء', gov: 'الحسكة', area: 'المفتي - الشارع العام', phone: '0933123456', hours: '24 ساعة' },
  { name: 'صيدلية النور', gov: 'القامشلي', area: 'الوسطى', phone: '0933654321', hours: '8 صباحًا - 12 ليلًا' },
  { name: 'صيدلية الفرات', gov: 'دير الزور', area: 'الجورة', phone: '0933987654', hours: '24 ساعة' },
  { name: 'صيدلية الرحمة', gov: 'الرقة', area: 'المشلب', phone: '0933765432', hours: '8 صباحًا - 11 ليلًا' },
];

export const LABS: Lab[] = [
  { name: 'مخبر الشرق للتحاليل', gov: 'الحسكة', area: 'المفتي - الشارع العام', phone: '0933123987', hours: '8 صباحًا - 8 مساءً' },
  { name: 'مخبر الدقة التخصصي', gov: 'دير الزور', area: 'الجورة', phone: '0933987123', hours: '8 صباحًا - 10 ليلًا' },
  { name: 'مخبر الشفاء', gov: 'الرقة', area: 'المشلب', phone: '0933765987', hours: 'يوميًا' },
];

export function formatPrice(price: number | null, priceNote?: string): string {
  if (priceNote) return priceNote;
  if (price === null) return '';
  return price.toLocaleString('en-US') + ' ل.س';
}

export function sectionName(key: string): string {
  return SECTIONS.find(s => s.key === key)?.name ?? '';
}
