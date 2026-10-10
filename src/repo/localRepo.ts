import {
  DOCTORS,
  LABS,
  LISTINGS,
  PHARMS,
  STORES,
} from '../data';
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
  Store,
  StoreCategory,
  Subscription,
  User,
} from '../types';
import {
  DoctorEntry,
  LabEntry,
  ListingFilter,
  NewAnnouncementInput,
  NewBannerInput,
  NewFeaturedRequestInput,
  NewListingInput,
  NewProductInput,
  NewReviewInput,
  NewStoreCategoryInput,
  NewStoreInput,
  NewSubscriptionInput,
  NewUserInput,
  PharmacyEntry,
  Repository,
} from './types';

let seq = 1000;
const nid = (p: string) => `${p}${seq++}`;

// التطبيق المحلي — ذاكرة + بيانات البذور.
// يُستبدل لاحقًا بتطبيق Firebase دون تغيير أي شاشة.

// صورة حقيقية = رابط بعيد واحد على الأقل (ليس URI محليًا)
function hasRealImage(uris?: string[]): boolean {
  return !!uris?.some(u => typeof u === 'string' && u.startsWith('http'));
}

export class LocalRepo implements Repository {
  private listings: Listing[];
  private stores: Store[];
  private users: User[] = [];
  private doctors: DoctorEntry[];
  private pharmacies: PharmacyEntry[];
  private labs: LabEntry[];
  private subscriptions: Subscription[] = [];
  private products: Product[] = [];
  private categories: StoreCategory[] = [];
  private announcements: Announcement[] = [];
  private banners: Banner[] = [];
  private featured: FeaturedRequest[] = [];
  private reviews: Review[] = [];
  private featuredSettings: FeaturedSettings = { price: 0, durationDays: 7 };

  private listeners = new Set<() => void>();
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  private emit() {
    this.listeners.forEach(fn => fn());
  }

  constructor() {
    const now = Date.now();
    this.listings = LISTINGS.map(l => ({
      ...l,
      status: 'approved' as AdStatus,
      createdAt: now,
    }));
    this.stores = [...STORES];
    this.doctors = []; // بلا بذر — الأطباء بالتسجيل الذاتي والموافقة فقط (v14)
    this.pharmacies = PHARMS.map((p, i) => ({ ...p, id: `ph${i}` }));
    this.labs = LABS.map((l, i) => ({ ...l, id: `lab${i}` }));
    // تقييمات تجريبية لأحد المتاجر
    this.reviews = [
      { id: 'rev1', storeId: 's2', userName: 'أبو محمد', rating: 5, text: 'أطيب مشاوي بالحسكة، والخدمة سريعة. أنصح فيه بقوة.', createdAt: now - 86400000 * 2 },
      { id: 'rev2', storeId: 's2', userName: 'لينا خالد', rating: 4, text: 'الأكل طيب والأسعار مناسبة، بس الازدحام بالمسا كبير.', createdAt: now - 86400000 * 5 },
    ];
  }

  // ——— إعلانات ———
  getListings(filter: ListingFilter = {}): Listing[] {
    return this.listings
      .filter(
        l =>
          (!filter.sec || l.sec === filter.sec) &&
          (!filter.sub || l.sub === filter.sub) &&
          (!filter.gov || filter.gov === 'الكل' || l.gov === filter.gov) &&
          (!filter.status || l.status === filter.status) &&
          (!filter.query ||
            l.name.includes(filter.query) ||
            l.desc.includes(filter.query) ||
            l.seller.includes(filter.query)),
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getListingById(id: string): Listing | undefined {
    return this.listings.find(l => l.id === id);
  }

  addListing(input: NewListingInput): Listing {
    const listing: Listing = {
      ...input,
      id: nid('u'),
      status: 'pending',
      createdAt: Date.now(),
    };
    this.listings.unshift(listing);
    this.emit();
    return listing;
  }

  updateListingStatus(id: string, status: AdStatus): void {
    const l = this.listings.find(x => x.id === id);
    if (l) {
      l.status = status;
      this.emit();
    }
  }

  getUserListings(userId: string): Listing[] {
    return this.listings
      .filter(l => l.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  deleteListing(id: string): void {
    this.listings = this.listings.filter(l => l.id !== id);
    this.emit();
  }

  // ——— متاجر ———
  getStores(gov?: string): Store[] {
    return this.stores.filter(s => !gov || gov === 'الكل' || s.gov === gov);
  }

  getStoreById(id: string): Store | undefined {
    return this.stores.find(s => s.id === id);
  }

  addStore(input: NewStoreInput): Store {
    const store: Store = { ...input, id: nid('st') };
    this.stores.unshift(store);
    this.emit();
    return store;
  }

  updateStore(id: string, patch: Partial<Store>): void {
    const s = this.stores.find(x => x.id === id);
    if (s) {
      Object.assign(s, patch);
      this.emit();
    }
  }

  deleteStore(id: string): void {
    this.stores = this.stores.filter(s => s.id !== id);
    this.products = this.products.filter(p => p.storeId !== id);
    this.categories = this.categories.filter(c => c.storeId !== id);
    this.emit();
  }

  /** نسخة محلية: لا رفع سحابي — تُعيد الـURIs كما هي. */
  async uploadImages(uris: string[]): Promise<string[]> {
    return [...uris];
  }

  // ——— تصنيفات داخل المتجر (v8) ———
  getCategoriesByStore(storeId: string): StoreCategory[] {
    return this.categories
      .filter(c => c.storeId === storeId)
      .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
  }

  addCategory(input: NewStoreCategoryInput): StoreCategory {
    const siblings = this.categories.filter(c => c.storeId === input.storeId);
    const maxOrder = siblings.reduce((m, c) => Math.max(m, c.order), -1);
    const cat: StoreCategory = {
      ...input,
      id: nid('cat'),
      order: maxOrder + 1,
      createdAt: Date.now(),
    };
    this.categories.push(cat);
    this.emit();
    return cat;
  }

  updateCategory(id: string, name: string): void {
    const c = this.categories.find(x => x.id === id);
    if (c) {
      c.name = name;
      this.emit();
    }
  }

  deleteCategory(id: string): void {
    const c = this.categories.find(x => x.id === id);
    if (!c) return;
    this.products.forEach(p => {
      if (p.storeId === c.storeId && p.categoryId === id) delete p.categoryId;
    });
    this.categories = this.categories.filter(x => x.id !== id);
    this.emit();
  }

  assignProductCategory(productId: string, categoryId?: string): void {
    const p = this.products.find(x => x.id === productId);
    if (p) {
      if (categoryId) p.categoryId = categoryId;
      else delete p.categoryId;
      this.emit();
    }
  }

  // ——— تقييمات المتاجر ———
  getReviews(storeId: string): Review[] {
    return this.reviews
      .filter(r => r.storeId === storeId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  addReview(input: NewReviewInput): Review {
    const r: Review = { ...input, id: nid('rev'), createdAt: Date.now() };
    this.reviews.unshift(r);
    this.emit();
    return r;
  }

  // ——— مستخدمون ———
  getUserByPhone(phone: string): User | undefined {
    return this.users.find(u => u.phone === phone);
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getUsers(): User[] {
    return [...this.users].sort((a, b) => b.createdAt - a.createdAt);
  }

  setUserBlocked(id: string, blocked: boolean): void {
    const u = this.users.find(x => x.id === id);
    if (u) {
      u.blocked = blocked;
      this.emit();
    }
  }

  addUser(input: NewUserInput, isAdmin: boolean): User {
    const user: User = {
      ...input,
      id: nid('usr'),
      isAdmin,
      createdAt: Date.now(),
    };
    this.users.push(user);
    this.emit();
    return user;
  }

  linkStoreToUser(phone: string, storeId: string): void {
    const u = this.users.find(x => x.phone === phone);
    if (u) {
      u.storeId = storeId;
      this.emit();
    }
  }

  // ——— الدليل الطبي — التسجيل الذاتي + موافقة الإدارة (v14) ———
  getDoctors(): DoctorEntry[] {
    // المعتمدون فقط
    return this.doctors.filter(d => (d.status ?? 'approved') === 'approved');
  }
  async getDoctorRequests(): Promise<DoctorEntry[]> {
    return this.doctors.filter(d => d.status === 'pending');
  }
  addDoctor(d: Doctor): DoctorEntry {
    const e = { ...d, id: nid('doc') };
    this.doctors.unshift(e);
    this.emit();
    return e;
  }
  updateDoctor(id: string, d: Doctor): void {
    const i = this.doctors.findIndex(x => x.id === id);
    if (i >= 0) {
      this.doctors[i] = { ...d, id };
    } else {
      this.doctors.unshift({ ...d, id });
    }
    this.emit();
  }
  deleteDoctor(id: string): void {
    this.doctors = this.doctors.filter(x => x.id !== id);
    this.emit();
  }

  getPharmacies(): PharmacyEntry[] {
    return [...this.pharmacies];
  }
  addPharmacy(p: Pharmacy): PharmacyEntry {
    const e = { ...p, id: nid('ph') };
    this.pharmacies.unshift(e);
    this.emit();
    return e;
  }
  updatePharmacy(id: string, p: Pharmacy): void {
    const i = this.pharmacies.findIndex(x => x.id === id);
    if (i >= 0) {
      this.pharmacies[i] = { ...p, id };
      this.emit();
    }
  }
  deletePharmacy(id: string): void {
    this.pharmacies = this.pharmacies.filter(x => x.id !== id);
    this.emit();
  }

  getLabs(): LabEntry[] {
    return [...this.labs];
  }
  addLab(l: Lab): LabEntry {
    const e = { ...l, id: nid('lab') };
    this.labs.unshift(e);
    this.emit();
    return e;
  }
  updateLab(id: string, l: Lab): void {
    const i = this.labs.findIndex(x => x.id === id);
    if (i >= 0) {
      this.labs[i] = { ...l, id };
      this.emit();
    }
  }
  deleteLab(id: string): void {
    this.labs = this.labs.filter(x => x.id !== id);
    this.emit();
  }

  // ——— اشتراكات ———
  getSubscriptions(): Subscription[] {
    return [...this.subscriptions].sort((a, b) => b.createdAt - a.createdAt);
  }
  addSubscription(s: NewSubscriptionInput): Subscription {
    const sub: Subscription = { ...s, id: nid('sub'), createdAt: Date.now() };
    this.subscriptions.unshift(sub);
    this.emit();
    return sub;
  }
  updateSubscriptionStatus(id: string, status: Subscription['status']): void {
    const s = this.subscriptions.find(x => x.id === id);
    if (s) {
      s.status = status;
      this.emit();
    }
  }
  getUserSubscription(userId: string): Subscription | undefined {
    return this.subscriptions.find(s => s.userId === userId);
  }

  // ——— منتجات المتاجر ———
  getProductsByStore(storeId: string): Product[] {
    return this.products
      .filter(p => p.storeId === storeId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  addProduct(input: NewProductInput): Product {
    const product: Product = {
      ...input,
      id: nid('prod'),
      createdAt: Date.now(),
    };
    this.products.unshift(product);
    this.emit();
    return product;
  }

  deleteProduct(id: string): void {
    this.products = this.products.filter(p => p.id !== id);
    this.emit();
  }

  // ——— إعلانات إدارية ———
  getAnnouncements(): Announcement[] {
    return [...this.announcements].sort((a, b) => b.createdAt - a.createdAt);
  }

  addAnnouncement(input: NewAnnouncementInput): Announcement {
    const a: Announcement = { ...input, id: nid('ann'), createdAt: Date.now() };
    this.announcements.unshift(a);
    this.emit();
    return a;
  }

  deleteAnnouncement(id: string): void {
    this.announcements = this.announcements.filter(a => a.id !== id);
    this.emit();
  }

  // ——— بانرات الواجهة ———
  getBanners(): Banner[] {
    return [...this.banners].sort((a, b) => b.createdAt - a.createdAt);
  }

  getActiveBanners(): Banner[] {
    return this.banners
      .filter(b => b.active)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  addBanner(input: NewBannerInput): Banner {
    const b: Banner = { ...input, id: nid('bnr'), active: true, createdAt: Date.now() };
    this.banners.unshift(b);
    this.emit();
    return b;
  }

  toggleBanner(id: string): void {
    const b = this.banners.find(x => x.id === id);
    if (b) {
      b.active = !b.active;
      this.emit();
    }
  }

  deleteBanner(id: string): void {
    this.banners = this.banners.filter(b => b.id !== id);
    this.emit();
  }

  // ——— إعلانات مميزة مدفوعة ———
  getFeaturedRequests(): FeaturedRequest[] {
    return [...this.featured].sort((a, b) => b.createdAt - a.createdAt);
  }

  getActiveFeatured(): FeaturedRequest[] {
    const now = Date.now();
    let changed = false;
    this.featured.forEach(f => {
      if (f.status === 'active' && f.endDate && f.endDate <= now) {
        f.status = 'expired';
        changed = true;
      }
    });
    if (changed) this.emit();
    return this.featured
      .filter(f => f.status === 'active' && (!f.endDate || f.endDate > now))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  addFeaturedRequest(input: NewFeaturedRequestInput): FeaturedRequest {
    // قاعدة: طلب التمييز لا يُقبل بلا صورة حقيقية
    if (!hasRealImage(input.imageUri ? [input.imageUri] : undefined)) {
      throw new Error('featured request requires a real image');
    }
    const f: FeaturedRequest = {
      ...input,
      id: nid('feat'),
      status: 'pending',
      createdAt: Date.now(),
    };
    this.featured.unshift(f);
    this.emit();
    return f;
  }

  updateFeaturedRequestStatus(
    id: string,
    status: FeaturedRequestStatus,
    startDate?: number,
    endDate?: number,
  ): void {
    const f = this.featured.find(x => x.id === id);
    if (f) {
      f.status = status;
      if (startDate !== undefined) f.startDate = startDate;
      if (endDate !== undefined) f.endDate = endDate;
      this.emit();
    }
  }

  getFeaturedSettings(): FeaturedSettings {
    return { ...this.featuredSettings };
  }

  updateFeaturedSettings(s: FeaturedSettings): void {
    this.featuredSettings = { ...s };
    this.emit();
  }
}
