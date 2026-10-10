export type SectionKey =
  | 'estate'
  | 'medical'
  | 'cars'
  | 'food'
  | 'malls'
  | 'services';

export interface Section {
  key: SectionKey;
  name: string;
  icon: string;
  g1: string;
  g2: string;
  image?: number;
}

export interface SubCategory {
  key: string;
  name: string;
  icon: string;
  g1: string;
  g2: string;
  image?: number;
}

export type ListingKind = 'product' | 'car' | 'estate';

export type AdStatus = 'pending' | 'approved' | 'rejected';

export type AccountType = 'merchant' | 'individual';

export interface Spec {
  label: string;
  value: string;
}

export interface Listing {
  ownerUid?: string; // Firebase Auth uid للمالك
  id: string;
  kind: ListingKind;
  name: string;
  price: number | null;
  priceNote?: string;
  gov: string;
  area: string;
  sec: SectionKey;
  sub?: string;
  icon: string;
  g1: string;
  g2: string;
  desc: string;
  seller: string;
  sellerType: 'store' | 'individual';
  phone?: string;
  advertiserName?: string;
  status: AdStatus;
  userId?: string;
  createdAt: number;
  specs?: Spec[];
  images?: string[];
  featuredUntil?: number; // تمييز مدفوع سارٍ حتى هذا التاريخ (millis) — v15
}

export interface Product {
  ownerUid?: string; // Firebase Auth uid للمالك
  id: string;
  storeId: string;
  categoryId?: string; // تصنيف داخل المتجر ينشئه التاجر (v8)
  name: string;
  price: number | null;
  description: string;
  images: string[];
  governorate?: string;
  createdAt: number;
}

/** تصنيف داخل منتجات المتجر — ينشئه التاجر بنفسه (v8) */
export interface StoreCategory {
  ownerUid?: string; // Firebase Auth uid للمالك
  id: string;
  storeId: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface User {
  id: string;
  uid?: string; // Firebase Auth uid — هوية الدخول الأساسية (Google Sign-In)
  email?: string;
  displayName?: string;
  phone: string; // رقم التواصل — ثانوي للعرض فقط
  accountType: AccountType;
  storeId?: string;
  isAdmin: boolean;
  blocked?: boolean;
  createdAt: number;
}

export interface Subscription {
  ownerUid?: string; // Firebase Auth uid للمالك
  id: string;
  userId: string;
  storeId?: string;
  plan: 'free' | 'monthly';
  status: 'active' | 'pending' | 'expired' | 'rejected';
  receiptUri?: string;
  createdAt: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: number;
}

export type BannerTargetType = 'section' | 'store' | 'announcement' | null;

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUri: string;
  targetType?: BannerTargetType;
  targetId?: string;
  governorate?: string; // 'all' أو اسم محافظة — الافتراضي 'all'
  active: boolean;
  createdAt: number;
}

export type FeaturedRequestStatus = 'pending' | 'active' | 'rejected' | 'expired';

export interface FeaturedRequest {
  ownerUid?: string; // Firebase Auth uid للمالك
  id: string;
  storeId?: string; // طلب بانر (وضع التاجر)
  listingId?: string; // طلب تمييز إعلان (v15)
  userId: string;
  imageUri: string;
  receiptUri?: string;
  status: FeaturedRequestStatus;
  startDate?: number;
  endDate?: number;
  createdAt: number;
}

export interface FeaturedSettings {
  price: number;
  durationDays: number;
}

export interface Store {
  ownerUid?: string; // Firebase Auth uid للمالك
  id: string;
  name: string;
  sec: string;
  gov: string;
  area: string;
  icon: string;
  g1: string;
  g2: string;
  phone?: string;
  hours?: string;
  description?: string;
  coverImage?: string; // صورة الغلاف — يرفعها التاجر (v8)
  logoImage?: string; // شعار المتجر — يرفعه التاجر (v8)
  verified?: boolean;
  featured?: boolean;
}

export interface Review {
  id: string;
  storeId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: number;
}

export interface Doctor {
  name: string;
  spec: string;
  gov: string;
  area: string;
  phone: string;
  days: string;
  icon: string;
  photo?: string; // صورة — ترفعها الإدارة (v8)
  status?: 'pending' | 'approved' | 'rejected'; // حالة الطلب — التسجيل الذاتي (v14)
  ownerUid?: string; // مقدم الطلب
}

export interface Pharmacy {
  name: string;
  gov: string;
  area: string;
  phone: string;
  hours: string;
  photo?: string; // صورة — ترفعها الإدارة (v8)
}

export interface Lab {
  name: string;
  gov: string;
  area: string;
  phone: string;
  hours: string;
  photo?: string; // صورة — ترفعها الإدارة (v8)
}
