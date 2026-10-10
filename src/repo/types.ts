import {
  AccountType,
  AdStatus,
  Announcement,
  Banner,
  Doctor,
  FeaturedRequest,
  FeaturedRequestStatus,
  FeaturedSettings,
  Lab,
  Listing,
  Pharmacy,
  Product,
  Review,
  SectionKey,
  Store,
  StoreCategory,
  Subscription,
  User,
} from '../types';

// مدخلات الإنشاء (بدون الحقول المولدة)
export type NewListingInput = Omit<Listing, 'id' | 'status' | 'createdAt'>;
export type NewStoreInput = Omit<Store, 'id'>;
export type NewUserInput = Omit<User, 'id' | 'createdAt' | 'isAdmin'>;
export type NewSubscriptionInput = Omit<Subscription, 'id' | 'createdAt'>;
export type NewProductInput = Omit<Product, 'id' | 'createdAt'>;
export type NewStoreCategoryInput = Omit<StoreCategory, 'id' | 'createdAt'>;
export type NewAnnouncementInput = Omit<Announcement, 'id' | 'createdAt'>;
export type NewBannerInput = Omit<Banner, 'id' | 'createdAt' | 'active'>;
export type NewFeaturedRequestInput = Omit<
  FeaturedRequest,
  'id' | 'status' | 'startDate' | 'endDate' | 'createdAt'
>;
export type NewReviewInput = Omit<Review, 'id' | 'createdAt'>;

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
  deleteListing(id: string): void;
  getUserListings(userId: string): Listing[];

  // متاجر
  getStores(gov?: string): Store[];
  getStoreById(id: string): Store | undefined;
  addStore(input: NewStoreInput): Store;
  updateStore(id: string, patch: Partial<Store>): void;
  deleteStore(id: string): void;

  // تصنيفات داخل المتجر (ينشئها التاجر) — v8
  getCategoriesByStore(storeId: string): StoreCategory[];
  addCategory(input: NewStoreCategoryInput): StoreCategory;
  updateCategory(id: string, name: string): void;
  deleteCategory(id: string): void;
  assignProductCategory(productId: string, categoryId?: string): void;

  // تقييمات المتاجر
  getReviews(storeId: string): Review[];
  addReview(input: NewReviewInput): Review;

  // مستخدمون
  getUserByPhone(phone: string): User | undefined;
  getUserById(id: string): User | undefined;
  getUsers(): User[];
  addUser(input: NewUserInput, isAdmin: boolean): User;
  linkStoreToUser(phone: string, storeId: string): void;
  setUserBlocked(id: string, blocked: boolean): void;

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

  // منتجات المتاجر
  getProductsByStore(storeId: string): Product[];
  getProductById(id: string): Product | undefined;
  addProduct(input: NewProductInput): Product;
  deleteProduct(id: string): void;

  // إعلانات إدارية
  getAnnouncements(): Announcement[];
  addAnnouncement(input: NewAnnouncementInput): Announcement;
  deleteAnnouncement(id: string): void;

  // بانرات الواجهة
  getBanners(): Banner[];
  getActiveBanners(): Banner[];
  addBanner(input: NewBannerInput): Banner;
  toggleBanner(id: string): void;
  deleteBanner(id: string): void;

  // إعلانات مميزة مدفوعة
  getFeaturedRequests(): FeaturedRequest[];
  getActiveFeatured(): FeaturedRequest[];
  addFeaturedRequest(input: NewFeaturedRequestInput): FeaturedRequest;
  updateFeaturedRequestStatus(
    id: string,
    status: FeaturedRequestStatus,
    startDate?: number,
    endDate?: number,
  ): void;
  getFeaturedSettings(): FeaturedSettings;
  updateFeaturedSettings(s: FeaturedSettings): void;

  /**
   * يرفع صورًا محلية إلى Cloudinary وينتظر اكتمال الرفع.
   * الروابط https تُمرَّر كما هي بلا إعادة رفع.
   * يرمي خطأً واضحًا عند الفشل — لا فشل صامت.
   */
  uploadImages(uris: string[], folder: string): Promise<string[]>;
}
