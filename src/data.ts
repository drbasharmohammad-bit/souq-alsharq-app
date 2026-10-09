import { Doctor, Lab, Listing, Pharmacy, Section, Store, SubCategory } from './types';

// بيانات البذور — الـRepository يضيف الحقول التشغيلية (status/createdAt)
type SeedListing = Omit<Listing, 'status' | 'createdAt'>;

export const GOVS = ['الكل', 'الحسكة', 'القامشلي', 'دير الزور', 'الرقة'];

export const SECTIONS: Section[] = [
  { key: 'estate', name: 'عقارات', icon: 'home', g1: '#0E6B4A', g2: '#2E9E6B' },
  { key: 'medical', name: 'طبي', icon: 'stethoscope', g1: '#1E6FA3', g2: '#4FB0E3' },
  { key: 'cars', name: 'سيارات', icon: 'car', g1: '#3A3F4B', g2: '#7A8494' },
  { key: 'food', name: 'مطاعم ومأكولات', icon: 'silverware-fork-knife', g1: '#A33E2A', g2: '#E07B4F' },
  { key: 'malls', name: 'مولات ومتاجر', icon: 'storefront', g1: '#7A4A1F', g2: '#D9A441' },
  { key: 'services', name: 'خدمات وحرف', icon: 'tools', g1: '#5B4A8A', g2: '#9A8AD1' },
];

export const SUBCATS: Record<string, SubCategory[]> = {
  cars: [
    { key: 'sale', name: 'سيارات للبيع', icon: 'car', g1: '#3A3F4B', g2: '#7A8494' },
    { key: 'rent', name: 'سيارات للإيجار', icon: 'key', g1: '#1E6FA3', g2: '#4FB0E3' },
    { key: 'moto', name: 'دراجات نارية', icon: 'motorbike', g1: '#6B4A12', g2: '#C9963B' },
    { key: 'parts', name: 'قطع غيار', icon: 'cog', g1: '#5C5C5C', g2: '#9A9A9A' },
  ],
  estate: [
    { key: 'apt-sale', name: 'شقق للبيع', icon: 'home', g1: '#0E6B4A', g2: '#2E9E6B' },
    { key: 'apt-rent', name: 'شقق للإيجار', icon: 'home-city', g1: '#1E6FA3', g2: '#4FB0E3' },
    { key: 'villa', name: 'فلل', icon: 'home-modern', g1: '#5B4A8A', g2: '#9A8AD1' },
    { key: 'shop', name: 'محلات تجارية', icon: 'store', g1: '#7A4A1F', g2: '#D9A441' },
    { key: 'land', name: 'أراضٍ', icon: 'terrain', g1: '#4A6B1E', g2: '#8AB83B' },
  ],
  medical: [
    { key: 'doctors', name: 'أطباء', icon: 'doctor', g1: '#1E6FA3', g2: '#4FB0E3' },
    { key: 'pharms', name: 'صيدليات', icon: 'pill', g1: '#C9A227', g2: '#8A6D14' },
    { key: 'labs', name: 'مخابر تحاليل', icon: 'test-tube', g1: '#0F4C5C', g2: '#2E9E9E' },
  ],
  food: [
    { key: 'mashawi', name: 'مشاوي', icon: 'food-drumstick', g1: '#A33E2A', g2: '#E07B4F' },
    { key: 'sharqi', name: 'شرقي', icon: 'pot', g1: '#8A5A14', g2: '#D9A441' },
    { key: 'fast', name: 'فاست فود', icon: 'hamburger', g1: '#B25A1E', g2: '#E8A54B' },
    { key: 'sweets', name: 'حلويات ومعجنات', icon: 'candy', g1: '#8A4A7A', g2: '#D18AC9' },
    { key: 'cafe', name: 'مقاهي', icon: 'coffee', g1: '#5C3A21', g2: '#A87B4F' },
  ],
  malls: [
    { key: 'clothes', name: 'ألبسة', icon: 'tshirt-crew', g1: '#7A2A4A', g2: '#D16A9A' },
    { key: 'electronics', name: 'إلكترونيات وموبايلات', icon: 'cellphone', g1: '#22262E', g2: '#5A6270' },
    { key: 'grocery', name: 'مواد غذائية', icon: 'basket', g1: '#4A6B1E', g2: '#8AB83B' },
    { key: 'furniture', name: 'أثاث ومفروشات', icon: 'sofa', g1: '#7A4A1F', g2: '#D9A441' },
    { key: 'perfume', name: 'عطور وتجميل', icon: 'flower', g1: '#8A4A7A', g2: '#D18AC9' },
  ],
  services: [
    { key: 'plumb', name: 'سباكة', icon: 'wrench', g1: '#0F4C5C', g2: '#2E9E9E' },
    { key: 'elect', name: 'كهرباء', icon: 'lightbulb', g1: '#9A6B12', g2: '#E8B93B' },
    { key: 'ac', name: 'تكييف وتبريد', icon: 'snowflake', g1: '#1E6FA3', g2: '#7AC4E8' },
    { key: 'carp', name: 'نجارة', icon: 'hammer', g1: '#6B4A12', g2: '#C9963B' },
    { key: 'mobfix', name: 'صيانة موبايلات', icon: 'tools', g1: '#5B4A8A', g2: '#9A8AD1' },
  ],
};

export const SPECS = ['عام', 'باطنية', 'أطفال', 'نسائية وتوليد', 'عظمية', 'جلدية', 'عيون', 'أسنان'];

export const STORES: Store[] = [
  { id: 's1', name: 'مفروشات الشرق', sec: 'مولات ومتاجر', gov: 'الحسكة', area: 'الصالحية', icon: 'sofa', g1: '#7A4A1F', g2: '#D9A441' },
  { id: 's2', name: 'مطعم بيت المشاوي', sec: 'مطاعم ومأكولات', gov: 'الحسكة', area: 'المفتي', icon: 'food-drumstick', g1: '#A33E2A', g2: '#E07B4F' },
  { id: 's3', name: 'معرض النور للسيارات', sec: 'سيارات', gov: 'دير الزور', area: 'الجورة', icon: 'car', g1: '#3A3F4B', g2: '#7A8494' },
  { id: 's4', name: 'ماركت البركة', sec: 'مولات ومتاجر', gov: 'الرقة', area: 'المشلب', icon: 'storefront', g1: '#0E6B4A', g2: '#2E9E6B' },
  { id: 's5', name: 'حلويات الشرق', sec: 'مطاعم ومأكولات', gov: 'القامشلي', area: 'الوسطى', icon: 'candy', g1: '#8A4A7A', g2: '#D18AC9' },
];

export const LISTINGS: SeedListing[] = [
  // منتجات
  { id: 'p1', kind: 'product', name: 'براد هاي لايف 18 قدم', price: 3850000, gov: 'الحسكة', area: 'الصالحية', sec: 'malls', sub: 'electronics', icon: 'snowflake', g1: '#1E6FA3', g2: '#7AC4E8', desc: 'براد جديد بالكرتونة، تبريد ممتاز وموفر للكهرباء، مع كفالة سنة كاملة.', seller: 'مفروشات الشرق', sellerType: 'store', phone: '0933111000' },
  { id: 'p2', kind: 'product', name: 'غسالة أوتوماتيك 8 كغ', price: 4200000, gov: 'الحسكة', area: 'المفتي', sec: 'malls', sub: 'electronics', icon: 'washing-machine', g1: '#5B4A8A', g2: '#9A8AD1', desc: 'غسالة بحالة ممتازة، 12 برنامج غسيل، صوت هادئ.', seller: 'مفروشات الشرق', sellerType: 'store', phone: '0933111000' },
  { id: 'p3', kind: 'product', name: 'طقم كنب 7 مقاعد', price: 6500000, gov: 'القامشلي', area: 'الوسطى', sec: 'malls', sub: 'furniture', icon: 'sofa', g1: '#7A4A1F', g2: '#D9A441', desc: 'كنب عربي فاخر، قماش مقاوم للبقع، تفصيل حسب الطلب.', seller: 'مفروشات الشرق', sellerType: 'store', phone: '0933111000' },
  { id: 'p4', kind: 'product', name: 'هاتف ذكي 256 غيغا', price: 5900000, gov: 'دير الزور', area: 'الجورة', sec: 'malls', sub: 'electronics', icon: 'cellphone', g1: '#22262E', g2: '#5A6270', desc: 'جهاز جديد مختوم، بطارية 5000، كاميرا 108 ميغا.', seller: 'ماركت البركة', sellerType: 'store', phone: '0933444000' },
  { id: 'p5', kind: 'product', name: 'وجبة مشاوي مشكلة', price: 185000, gov: 'الحسكة', area: 'المفتي', sec: 'food', sub: 'mashawi', icon: 'food-drumstick', g1: '#A33E2A', g2: '#E07B4F', desc: 'كباب وشقف وفروج مشوي على الفحم، تقدم مع المقبلات والخبز الساخن.', seller: 'مطعم بيت المشاوي', sellerType: 'store', phone: '0933222000' },
  { id: 'p6', kind: 'product', name: 'بيتزا خضار كبيرة', price: 95000, gov: 'القامشلي', area: 'العنترية', sec: 'food', sub: 'fast', icon: 'pizza', g1: '#B25A1E', g2: '#E8A54B', desc: 'عجينة رقيقة، جبنة موزاريلا، خضار طازجة من السوق.', seller: 'مطعم بيت المشاوي', sellerType: 'store', phone: '0933222000' },
  { id: 'p7', kind: 'product', name: 'حلويات مشكلة 1 كغ', price: 220000, gov: 'القامشلي', area: 'الوسطى', sec: 'food', sub: 'sweets', icon: 'candy', g1: '#8A4A7A', g2: '#D18AC9', desc: 'بقلاوة ومعمول وبرازق بالسمن العربي، تحضير يومي.', seller: 'حلويات الشرق', sellerType: 'store', phone: '0933555000' },
  { id: 'p8', kind: 'product', name: 'عسل طبيعي 1 كغ', price: 450000, gov: 'القامشلي', area: 'العنترية', sec: 'malls', sub: 'grocery', icon: 'package', g1: '#9A6B12', g2: '#E8B93B', desc: 'عسل جبلي طبيعي 100% من مناحل الجزيرة، مضمون.', seller: 'ماركت البركة', sellerType: 'store', phone: '0933444000' },
  { id: 'p9', kind: 'product', name: 'زيت زيتون بكر 5 لتر', price: 780000, gov: 'دير الزور', area: 'القصور', sec: 'malls', sub: 'grocery', icon: 'oil', g1: '#4A6B1E', g2: '#8AB83B', desc: 'زيت زيتون بكر عصرة أولى، من أجود المعاصر.', seller: 'ماركت البركة', sellerType: 'store', phone: '0933444000' },
  { id: 'p10', kind: 'product', name: 'صيانة مكيفات منزلية', price: 150000, gov: 'الحسكة', area: 'النشوة', sec: 'services', sub: 'ac', icon: 'tools', g1: '#0F4C5C', g2: '#2E9E9E', desc: 'صيانة وتنظيف وتعبئة غاز لجميع أنواع المكيفات، خدمة منزلية.', seller: 'ورشة أبو أحمد', sellerType: 'individual', phone: '0933666000' },
  { id: 'p11', kind: 'product', name: 'نجارة — تفصيل غرف نوم', price: null, priceNote: 'حسب الاتفاق', gov: 'الرقة', area: 'الدرعية', sec: 'services', sub: 'carp', icon: 'hammer', g1: '#6B4A12', g2: '#C9963B', desc: 'تفصيل أبواب وغرف نوم بخشب سويدي، دقة والتزام بالمواعيد.', seller: 'نجار أبو فادي', sellerType: 'individual', phone: '0933777000' },
  { id: 'p12', kind: 'product', name: 'لحم غنم طازج 1 كغ', price: 310000, gov: 'الرقة', area: 'الدرعية', sec: 'malls', sub: 'grocery', icon: 'food-steak', g1: '#A33E2A', g2: '#E07B4F', desc: 'ذبح يومي، لحم طازج من مراعي الفرات.', seller: 'ملحمة الفرات', sellerType: 'store', phone: '0933888000' },
  // سيارات
  { id: 'c1', kind: 'car', name: 'كيا ريو 2016', price: 145000000, gov: 'دير الزور', area: 'الجورة', sec: 'cars', sub: 'sale', icon: 'car', g1: '#3A3F4B', g2: '#7A8494', desc: 'سيارة نظيفة، محرك ممتاز، دهان أساسي ما عدا رفرف، جاهزة للفراغ.', seller: 'معرض النور للسيارات', sellerType: 'store', phone: '0933555123', specs: [{ label: 'النوع', value: 'سيدان' }, { label: 'الوقود', value: 'بنزين' }, { label: 'الممشى', value: '120 ألف كم' }] },
  { id: 'c2', kind: 'car', name: 'هيونداي أفانتي 2012', price: 118000000, gov: 'الحسكة', area: 'الصالحية', sec: 'cars', sub: 'sale', icon: 'car', g1: '#1E3A5C', g2: '#4A7AB8', desc: 'اقتصادية بالبنزين، مكيف شغال، دواليب جديدة.', seller: 'أبو محمد', sellerType: 'individual', phone: '0933777888', specs: [{ label: 'النوع', value: 'سيدان' }, { label: 'الوقود', value: 'بنزين' }, { label: 'الممشى', value: '160 ألف كم' }] },
  { id: 'c3', kind: 'car', name: 'تويوتا هايلوكس 2019', price: 265000000, gov: 'القامشلي', area: 'الوسطى', sec: 'cars', sub: 'sale', icon: 'car-pickup', g1: '#4A5C1E', g2: '#8AB83B', desc: 'غمارتين، دفع رباعي، مخصصة للطرق الزراعية، حالة الوكالة.', seller: 'معرض الجزيرة', sellerType: 'store', phone: '0933999000', specs: [{ label: 'النوع', value: 'بيك آب' }, { label: 'الوقود', value: 'ديزل' }, { label: 'الممشى', value: '90 ألف كم' }] },
  { id: 'c4', kind: 'car', name: 'مرسيدس شبح 2000', price: 96000000, gov: 'الرقة', area: 'الدرعية', sec: 'cars', sub: 'sale', icon: 'car', g1: '#22262E', g2: '#5A6270', desc: 'فخامة ألمانية، جلد طبيعي، تحتاج بعض الصيانة البسيطة.', seller: 'أبو خالد', sellerType: 'individual', phone: '0933111222', specs: [{ label: 'النوع', value: 'سيدان' }, { label: 'الوقود', value: 'بنزين' }, { label: 'الممشى', value: '210 ألف كم' }] },
  { id: 'c5', kind: 'car', name: 'كيا سبورتاج 2018', price: 198000000, gov: 'الحسكة', area: 'المفتي', sec: 'cars', sub: 'sale', icon: 'car', g1: '#5C1E3A', g2: '#B84A7A', desc: 'فل أوبشن، فتحة سقف، شاشة وكاميرا خلفية.', seller: 'معرض النور للسيارات', sellerType: 'store', phone: '0933555123', specs: [{ label: 'النوع', value: 'دفع رباعي' }, { label: 'الوقود', value: 'بنزين' }, { label: 'الممشى', value: '110 ألف كم' }] },
  { id: 'c6', kind: 'car', name: 'شاحنة انترناش 2015', price: 340000000, gov: 'دير الزور', area: 'القصور', sec: 'cars', sub: 'sale', icon: 'truck', g1: '#6B4A12', g2: '#C9963B', desc: 'صندوق مغلق، صالحة للنقل بين المحافظات، أوراق نظامية.', seller: 'شركة الفرات للنقل', sellerType: 'store', phone: '0933444555', specs: [{ label: 'النوع', value: 'شاحنة' }, { label: 'الوقود', value: 'ديزل' }, { label: 'الممشى', value: '300 ألف كم' }] },
  // عقارات
  { id: 'e1', kind: 'estate', name: 'شقة 130 م² طابق ثالث', price: 520000000, gov: 'الحسكة', area: 'الصالحية', sec: 'estate', sub: 'apt-sale', icon: 'home', g1: '#0E6B4A', g2: '#2E9E6B', desc: 'شقة مشمسة، إكساء ممتاز، قبو وموقف خاص، قريبة من السوق.', seller: 'مكتب الشرق العقاري', sellerType: 'store', phone: '0933666777', advertiserName: 'مكتب الشرق العقاري', specs: [{ label: 'التفاصيل', value: '3 غرف + صالون' }] },
  { id: 'e2', kind: 'estate', name: 'محل تجاري 45 م²', price: 380000000, gov: 'الحسكة', area: 'المفتي', sec: 'estate', sub: 'shop', icon: 'store', g1: '#7A4A1F', g2: '#D9A441', desc: 'موقع تجاري مميز على الشارع العام، مناسب لجميع الأنشطة.', seller: 'مكتب الشرق العقاري', sellerType: 'store', phone: '0933666777', advertiserName: 'مكتب الشرق العقاري', specs: [{ label: 'التفاصيل', value: 'واجهة 6 م' }] },
  { id: 'e3', kind: 'estate', name: 'أرض زراعية 2 دونم', price: 240000000, gov: 'القامشلي', area: 'الريف الجنوبي', sec: 'estate', sub: 'land', icon: 'terrain', g1: '#4A6B1E', g2: '#8AB83B', desc: 'أرض خصبة مع بئر ارتوازي، صالحة لجميع الزراعات.', seller: 'أبو حسن', sellerType: 'individual', phone: '0933888999', advertiserName: 'حسن المحمد العلي', specs: [{ label: 'التفاصيل', value: 'سقي' }] },
  { id: 'e4', kind: 'estate', name: 'شقة 95 م² طابق ثانٍ', price: 310000000, gov: 'دير الزور', area: 'الجورة', sec: 'estate', sub: 'apt-sale', icon: 'home', g1: '#1E6FA3', g2: '#4FB0E3', desc: 'قريبة من الخدمات والمدارس، إكساء جيد.', seller: 'مكتب الفرات', sellerType: 'store', phone: '0933000111', advertiserName: 'مكتب الفرات العقاري', specs: [{ label: 'التفاصيل', value: 'غرفتان + صالون' }] },
  { id: 'e5', kind: 'estate', name: 'فيلا 300 م² مع حديقة', price: 1150000000, gov: 'القامشلي', area: 'العنترية', sec: 'estate', sub: 'villa', icon: 'home-modern', g1: '#5B4A8A', g2: '#9A8AD1', desc: 'فيلا فاخرة، تشطيب سوبر ديلوكس، حديقة ومسبح خاص.', seller: 'مكتب الجزيرة', sellerType: 'store', phone: '0933222333', advertiserName: 'مكتب الجزيرة العقاري', specs: [{ label: 'التفاصيل', value: '5 غرف + مسبح' }] },
  { id: 'e6', kind: 'estate', name: 'أرض سكنية 600 م²', price: 420000000, gov: 'الرقة', area: 'المشلب', sec: 'estate', sub: 'land', icon: 'map', g1: '#8A6D14', g2: '#D9B93B', desc: 'قطعة مميزة في مخطط سكني جديد، شوارع معبدة.', seller: 'مكتب الرقة العقاري', sellerType: 'store', phone: '0933444777', advertiserName: 'مكتب الرقة العقاري', specs: [{ label: 'التفاصيل', value: 'طابو أخضر' }] },
];

export const DOCTORS: Doctor[] = [
  { name: 'د. أحمد الحسن', spec: 'باطنية', gov: 'الحسكة', area: 'النشوة - شارع المشفى', phone: '052 222 3456', days: 'السبت - الخميس', icon: 'doctor' },
  { name: 'د. سميرة العلي', spec: 'أطفال', gov: 'الحسكة', area: 'الصالحية - جانب السوق', phone: '052 222 7890', days: 'يوميًا', icon: 'doctor' },
  { name: 'د. خالد المحمد', spec: 'عظمية', gov: 'القامشلي', area: 'الوسطى - شارع الكورنيش', phone: '052 431 2233', days: 'السبت - الأربعاء', icon: 'doctor' },
  { name: 'د. مريم الخلف', spec: 'نسائية وتوليد', gov: 'القامشلي', area: 'العنترية', phone: '052 431 8899', days: 'يوميًا عدا الجمعة', icon: 'doctor' },
  { name: 'د. يوسف الجاسم', spec: 'عام', gov: 'دير الزور', area: 'الجورة - شارع التكايا', phone: '051 221 4455', days: 'السبت - الخميس', icon: 'doctor' },
  { name: 'د. ليلى الحسين', spec: 'جلدية', gov: 'دير الزور', area: 'القصور', phone: '051 221 9900', days: 'الأحد - الخميس', icon: 'doctor' },
  { name: 'د. عمر الفارس', spec: 'أسنان', gov: 'الرقة', area: 'المشلب - الشارع العام', phone: '053 222 1122', days: 'يوميًا', icon: 'doctor' },
  { name: 'د. نور الهدى', spec: 'عيون', gov: 'الرقة', area: 'الدرعية', phone: '053 222 3344', days: 'السبت - الأربعاء', icon: 'doctor' },
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
