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
}

export interface SubCategory {
  key: string;
  name: string;
  icon: string;
  g1: string;
  g2: string;
}

export type ListingKind = 'product' | 'car' | 'estate';

export type AdStatus = 'pending' | 'approved' | 'rejected';

export type AccountType = 'merchant' | 'individual';

export interface Spec {
  label: string;
  value: string;
}

export interface Listing {
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
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number | null;
  description: string;
  images: string[];
  governorate?: string;
  createdAt: number;
}

export interface User {
  id: string;
  phone: string;
  accountType: AccountType;
  storeId?: string;
  isAdmin: boolean;
  blocked?: boolean;
  createdAt: number;
}

export interface Subscription {
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
  id: string;
  storeId: string;
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
}

export interface Pharmacy {
  name: string;
  gov: string;
  area: string;
  phone: string;
  hours: string;
}

export interface Lab {
  name: string;
  gov: string;
  area: string;
  phone: string;
  hours: string;
}
