import {
  AccountType,
  AdStatus,
  Doctor,
  Lab,
  Listing,
  Pharmacy,
  SectionKey,
  Store,
  Subscription,
  User,
} from '../types';

// مدخلات الإنشاء (بدون الحقول المولدة)
export type NewListingInput = Omit<Listing, 'id' | 'status' | 'createdAt'>;
export type NewStoreInput = Omit<Store, 'id'>;
export type NewUserInput = Omit<User, 'id' | 'createdAt' | 'isAdmin'>;
export type NewSubscriptionInput = Omit<Subscription, 'id' | 'createdAt'>;

export type DoctorEntry = Doctor & { id: string };
export type PharmacyEntry = Pharmacy & { id: string };
export type LabEntry = Lab & { id: string };

export interface ListingFilter {
  sec?: SectionKey;
  sub?: string;
  gov?: string;
  status?: AdStatus;
  query?: string;
}

// الواجهة المجردة — كل الشاشات تتعامل معها فقط.
// لاحقًا نستبدل التطبيق المحلي بتطبيق Firebase دون تغيير الشاشات.
export interface Repository {
  // إعلانات
  getListings(filter?: ListingFilter): Listing[];
  getListingById(id: string): Listing | undefined;
  addListing(input: NewListingInput): Listing;
  updateListingStatus(id: string, status: AdStatus): void;
  getUserListings(userId: string): Listing[];

  // متاجر
  getStores(): Store[];
  getStoreById(id: string): Store | undefined;
  addStore(input: NewStoreInput): Store;

  // مستخدمون
  getUserByPhone(phone: string): User | undefined;
  addUser(input: NewUserInput, isAdmin: boolean): User;
  linkStoreToUser(phone: string, storeId: string): void;

  // الدليل الطبي (إدارة حصرًا)
  getDoctors(): DoctorEntry[];
  addDoctor(d: Doctor): DoctorEntry;
  updateDoctor(id: string, d: Doctor): void;
  deleteDoctor(id: string): void;
  getPharmacies(): PharmacyEntry[];
  addPharmacy(p: Pharmacy): PharmacyEntry;
  updatePharmacy(id: string, p: Pharmacy): void;
  deletePharmacy(id: string): void;
  getLabs(): LabEntry[];
  addLab(l: Lab): LabEntry;
  updateLab(id: string, l: Lab): void;
  deleteLab(id: string): void;

  // اشتراكات
  getSubscriptions(): Subscription[];
  addSubscription(s: NewSubscriptionInput): Subscription;
  updateSubscriptionStatus(id: string, status: Subscription['status']): void;
  getUserSubscription(userId: string): Subscription | undefined;
}
