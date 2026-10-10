import { getAuth } from '@react-native-firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import {
  DOCTORS,
  LABS,
  LISTINGS,
  PHARMS,
  STORES,
} from '../data';
import {
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
  Spec,
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
import { isLocalUri, uploadImage } from './storage';
import { ADMIN_EMAIL } from '../config';

// ——— المجموعات ———
const C = {
  users: 'users',
  stores: 'stores',
  products: 'products',
  storeCategories: 'store_categories',
  listings: 'listings',
  reviews: 'reviews',
  subscriptions: 'subscriptions',
  banners: 'banners',
  announcements: 'announcements',
  featuredRequests: 'featured_requests',
  doctors: 'doctors',
  pharmacies: 'pharmacies',
  labs: 'labs',
  featuredSettings: 'featured_settings',
} as const;

const FEATURED_SETTINGS_DOC = 'settings';
const DEFAULT_FEATURED_SETTINGS: FeaturedSettings = { price: 0, durationDays: 7 };

// ——— أدوات تحويل ———

/** يحوّل Timestamp أو millis أو أي قيمة إلى millis. */
function toMillis(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (
    v !== null &&
    typeof v === 'object' &&
    typeof (v as { toMillis?: unknown }).toMillis === 'function'
  ) {
    return (v as { toMillis(): number }).toMillis();
  }
  return Date.now();
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function numOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** يزيل الحقول ذات القيمة undefined (يرفضها Firestore) — نسخة نظيفة للكتابة. */
function clean<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(clean) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = clean(v);
    }
    return out as T;
  }
  return obj;
}

/** نسخة من الكيان بدون حقل id (المعرّف هو اسم المستند). */
function stripId<T extends { id: string }>(e: T): Omit<T, 'id'> {
  const copy = { ...e } as Record<string, unknown>;
  delete copy.id;
  return copy as Omit<T, 'id'>;
}

/** uid المالك الحالي للكتابات المملوكة. */
function currentOwnerUid(): string {
  return getAuth().currentUser?.uid ?? 'anonymous';
}

/** هل المستخدم الحالي هو المدير (مطابق لقواعد Firestore). */
function isCurrentAdmin(): boolean {
  const email = getAuth().currentUser?.email ?? '';
  return email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
}

function logWriteErr(what: string, err: unknown): void {
  console.warn(`[FirestoreRepo] ${what} failed`, err);
}

// ——— محوّلات المستندات (Firestore -> كيانات) ———

function mapUser(id: string, d: Record<string, unknown>): User {
  return {
    id,
    uid: str(d.uid),
    email: str(d.email),
    displayName: str(d.displayName),
    phone: String(d.phone ?? ''),
    accountType: d.accountType === 'individual' ? 'individual' : 'merchant',
    storeId: str(d.storeId),
    isAdmin: d.isAdmin === true,
    blocked: d.blocked === true,
    createdAt: toMillis(d.createdAt),
  };
}

function mapStore(id: string, d: Record<string, unknown>): Store {
  return {
    id,
    ownerUid: str(d.ownerUid),
    name: String(d.name ?? ''),
    sec: String(d.sec ?? ''),
    gov: String(d.gov ?? ''),
    area: String(d.area ?? ''),
    icon: String(d.icon ?? ''),
    g1: String(d.g1 ?? ''),
    g2: String(d.g2 ?? ''),
    phone: str(d.phone),
    hours: str(d.hours),
    description: str(d.description),
    coverImage: str(d.coverImage),
    logoImage: str(d.logoImage),
    verified: d.verified === true,
    featured: d.featured === true,
  };
}

function mapProduct(id: string, d: Record<string, unknown>): Product {
  return {
    id,
    ownerUid: str(d.ownerUid),
    storeId: String(d.storeId ?? ''),
    categoryId: str(d.categoryId),
    name: String(d.name ?? ''),
    price: numOrNull(d.price),
    description: String(d.description ?? ''),
    images: Array.isArray(d.images)
      ? d.images.filter(x => typeof x === 'string')
      : [],
    governorate: str(d.governorate),
    createdAt: toMillis(d.createdAt),
  };
}

function mapStoreCategory(id: string, d: Record<string, unknown>): StoreCategory {
  return {
    id,
    ownerUid: str(d.ownerUid),
    storeId: String(d.storeId ?? ''),
    name: String(d.name ?? ''),
    order: typeof d.order === 'number' ? d.order : 0,
    createdAt: toMillis(d.createdAt),
  };
}

function mapSpecs(v: unknown): Spec[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.map(s => ({
    label: String((s as Record<string, unknown>)?.label ?? ''),
    value: String((s as Record<string, unknown>)?.value ?? ''),
  }));
}

function mapListing(id: string, d: Record<string, unknown>): Listing {
  return {
    id,
    ownerUid: str(d.ownerUid),
    kind: d.kind === 'car' || d.kind === 'estate' ? d.kind : 'product',
    name: String(d.name ?? ''),
    price: numOrNull(d.price),
    priceNote: str(d.priceNote),
    gov: String(d.gov ?? ''),
    area: String(d.area ?? ''),
    sec: (d.sec as SectionKey) ?? 'malls',
    sub: str(d.sub),
    icon: String(d.icon ?? ''),
    g1: String(d.g1 ?? ''),
    g2: String(d.g2 ?? ''),
    desc: String(d.desc ?? ''),
    seller: String(d.seller ?? ''),
    sellerType: d.sellerType === 'individual' ? 'individual' : 'store',
    phone: str(d.phone),
    advertiserName: str(d.advertiserName),
    status: (d.status as AdStatus) ?? 'pending',
    userId: str(d.userId),
    createdAt: toMillis(d.createdAt),
    specs: mapSpecs(d.specs),
    images: Array.isArray(d.images)
      ? d.images.filter(x => typeof x === 'string')
      : undefined,
    featuredUntil:
      typeof d.featuredUntil === 'number' && Number.isFinite(d.featuredUntil)
        ? d.featuredUntil
        : undefined,
  };
}

function mapReview(id: string, d: Record<string, unknown>): Review {
  return {
    id,
    storeId: String(d.storeId ?? ''),
    userName: String(d.userName ?? ''),
    rating: typeof d.rating === 'number' ? d.rating : 0,
    text: String(d.text ?? ''),
    createdAt: toMillis(d.createdAt),
  };
}

function mapSubscription(id: string, d: Record<string, unknown>): Subscription {
  const status = d.status;
  return {
    id,
    ownerUid: str(d.ownerUid),
    userId: String(d.userId ?? ''),
    storeId: str(d.storeId),
    plan: d.plan === 'monthly' ? 'monthly' : 'free',
    status:
      status === 'active' ||
      status === 'pending' ||
      status === 'expired' ||
      status === 'rejected'
        ? status
        : 'pending',
    receiptUri: str(d.receiptUri),
    createdAt: toMillis(d.createdAt),
  };
}

function mapAnnouncement(id: string, d: Record<string, unknown>): Announcement {
  return {
    id,
    title: String(d.title ?? ''),
    body: String(d.body ?? ''),
    createdAt: toMillis(d.createdAt),
  };
}

function mapBanner(id: string, d: Record<string, unknown>): Banner {
  const targetType = d.targetType;
  return {
    id,
    title: String(d.title ?? ''),
    subtitle: str(d.subtitle),
    imageUri: String(d.imageUri ?? ''),
    targetType:
      targetType === 'section' ||
      targetType === 'store' ||
      targetType === 'announcement'
        ? targetType
        : null,
    targetId: str(d.targetId),
    governorate: str(d.governorate),
    active: d.active !== false,
    createdAt: toMillis(d.createdAt),
  };
}

function mapFeaturedRequest(
  id: string,
  d: Record<string, unknown>,
): FeaturedRequest {
  return {
    id,
    ownerUid: str(d.ownerUid),
    storeId: str(d.storeId),
    listingId: str(d.listingId),
    userId: String(d.userId ?? ''),
    imageUri: String(d.imageUri ?? ''),
    receiptUri: str(d.receiptUri),
    status: (d.status as FeaturedRequestStatus) ?? 'pending',
    startDate: typeof d.startDate === 'number' ? d.startDate : undefined,
    endDate: typeof d.endDate === 'number' ? d.endDate : undefined,
    createdAt: toMillis(d.createdAt),
  };
}

function mapDoctor(id: string, d: Record<string, unknown>): DoctorEntry {
  return {
    id,
    name: String(d.name ?? ''),
    spec: String(d.spec ?? ''),
    gov: String(d.gov ?? ''),
    area: String(d.area ?? ''),
    phone: String(d.phone ?? ''),
    days: String(d.days ?? ''),
    icon: String(d.icon ?? ''),
    photo: str(d.photo),
    status: (d.status === 'pending' || d.status === 'rejected' ? d.status : 'approved') as DoctorEntry['status'],
    ownerUid: str(d.ownerUid),
  };
}

function mapPharmacy(id: string, d: Record<string, unknown>): PharmacyEntry {
  return {
    id,
    name: String(d.name ?? ''),
    gov: String(d.gov ?? ''),
    area: String(d.area ?? ''),
    phone: String(d.phone ?? ''),
    hours: String(d.hours ?? ''),
    photo: str(d.photo),
  };
}

function mapLab(id: string, d: Record<string, unknown>): LabEntry {
  return {
    id,
    name: String(d.name ?? ''),
    gov: String(d.gov ?? ''),
    area: String(d.area ?? ''),
    phone: String(d.phone ?? ''),
    hours: String(d.hours ?? ''),
    photo: str(d.photo),
  };
}

/**
 * التطبيق الهجين — Offline-first فوق Firestore.
 *
 * - الكاش يُبذَر من بيانات src/data.ts (نفس منطق LocalRepo تمامًا).
 * - عند الإقلاع: hydrate() تجلب كل مجموعة من Firestore وتستبدل الكاش
 *   (للمجموعات التي لها مستندات بعيدة فقط — الفارغة تُبقي البذر المحلي).
 * - كل دوال القراءة متزامنة وتقرأ من الكاش (نفس الفلاتر والترتيب).
 * - كل دوال الكتابة: تحديث متفائل للكاش + emit() فورًا، ثم كتابة
 *   Firestore في الخلفية مع تسجيل الخطأ.
 * - الصور المحلية تُرفع في الخلفية عبر storage.ts ثم يُحدَّث الكاش
 *   والمستند بروابط التحميل.
 */

// صورة حقيقية = رابط بعيد واحد على الأقل (ليس URI محليًا)
function hasRealImage(uris?: string[]): boolean {
  return !!uris?.some(u => typeof u === 'string' && u.startsWith('http'));
}

export class FirestoreRepo implements Repository {
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
  private featuredSettings: FeaturedSettings = { ...DEFAULT_FEATURED_SETTINGS };

  private get db() {
    return getFirestore();
  }

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
    // بذر محلي — نفس منطق LocalRepo تمامًا
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
    // بلا تقييمات تجريبية — التقييمات الحقيقية فقط (v15)
    this.reviews = [];
    // مزامنة أولية من Firestore في الخلفية — عند الفشل يبقى البذر المحلي
    this.hydrate();
  }

  // ——— المزامنة ———

  private async loadCollection<T>(
    collName: string,
    map: (id: string, data: Record<string, unknown>) => T,
    apply: (items: T[]) => void,
  ): Promise<void> {
    try {
      const snap = await getDocs(collection(this.db, collName));
      if (snap.docs.length === 0) return; // لا مستندات بعيدة — يُبقي البذر المحلي
      apply(
        snap.docs.map(d => map(d.id, d.data() as Record<string, unknown>)),
      );
    } catch (err) {
      // تجاوز صامت لأخطاء الصلاحية (مجموعات مقيدة) — يُبقي الكاش المحلي
      console.warn(`[FirestoreRepo] loadCollection ${collName} skipped`, err);
    }
  }

  // ——— المجموعات المقيدة (قواعد ما قبل الإطلاق) ———

  /** المستخدمون: الإدارة فقط تحمّل الكل — العادي مستنده يُجلب مباشرة في AuthContext. */
  private async loadUsers(): Promise<void> {
    if (!isCurrentAdmin()) return;
    await this.loadCollection(C.users, mapUser, v => {
      this.users = v;
    });
  }

  /** الاشتراكات: الإدارة تحمّل الكل — العادي اشتراكاته فقط (ownerUid). */
  private async loadSubscriptions(): Promise<void> {
    if (isCurrentAdmin()) {
      await this.loadCollection(C.subscriptions, mapSubscription, v => {
        this.subscriptions = v;
      });
      return;
    }
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    try {
      const snap = await getDocs(
        query(collection(this.db, C.subscriptions), where('ownerUid', '==', uid)),
      );
      const remote = snap.docs.map(d =>
        mapSubscription(d.id, d.data() as Record<string, unknown>),
      );
      // دمج: تحديث الموجود وإضافة الجديد، بلا مسح (الكاش يحمل المضاف محليًا)
      const byId = new Map(this.subscriptions.map(s => [s.id, s]));
      remote.forEach(s => byId.set(s.id, s));
      this.subscriptions = [...byId.values()];
    } catch (err) {
      console.warn('[FirestoreRepo] loadSubscriptions skipped', err);
    }
  }

  /**
   * طلبات التمييز: الإدارة تحمّل الكل — العادي:
   * النشطة (كاروسيل الرئيسية العامة) + طلباته الخاصة (لمنع التكرار وإظهار الحالة).
   */
  private async loadFeaturedRequests(): Promise<void> {
    if (isCurrentAdmin()) {
      await this.loadCollection(C.featuredRequests, mapFeaturedRequest, v => {
        this.featured = v;
      });
      return;
    }
    const seen = new Map<string, FeaturedRequest>();
    // دمج الحالي (طلبات أُنشئت محليًا قبل المزامنة)
    this.featured.forEach(f => seen.set(f.id, f));
    try {
      const snap = await getDocs(
        query(
          collection(this.db, C.featuredRequests),
          where('status', '==', 'active'),
        ),
      );
      snap.docs.forEach(d =>
        seen.set(d.id, mapFeaturedRequest(d.id, d.data() as Record<string, unknown>)),
      );
    } catch (err) {
      console.warn('[FirestoreRepo] loadFeaturedRequests(active) skipped', err);
    }
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      try {
        const snap = await getDocs(
          query(
            collection(this.db, C.featuredRequests),
            where('ownerUid', '==', uid),
          ),
        );
        snap.docs.forEach(d =>
          seen.set(d.id, mapFeaturedRequest(d.id, d.data() as Record<string, unknown>)),
        );
      } catch (err) {
        console.warn('[FirestoreRepo] loadFeaturedRequests(own) skipped', err);
      }
    }
    this.featured = [...seen.values()];
  }

  // تحميل الأطباء المعتمدين فقط — والمجموعة الفارغة تعني قائمة فارغة (بلا بذر)
  private async loadDoctors(): Promise<void> {
    const snap = await getDocs(
      query(collection(this.db, C.doctors), where('status', '==', 'approved')),
    );
    this.doctors = snap.docs.map(d => mapDoctor(d.id, d.data() as Record<string, unknown>));
    this.emit();
  }

  private async hydrate(): Promise<void> {
    try {
      await Promise.all([
        this.loadCollection(C.listings, mapListing, v => {
          this.listings = v;
        }),
        this.loadCollection(C.stores, mapStore, v => {
          this.stores = v;
        }),
        this.loadUsers(),
        this.loadDoctors(),
        this.loadCollection(C.pharmacies, mapPharmacy, v => {
          this.pharmacies = v;
        }),
        this.loadCollection(C.labs, mapLab, v => {
          this.labs = v;
        }),
        this.loadSubscriptions(),
        this.loadCollection(C.products, mapProduct, v => {
          this.products = v;
        }),
        this.loadCollection(C.storeCategories, mapStoreCategory, v => {
          this.categories = v;
        }),
        this.loadCollection(C.announcements, mapAnnouncement, v => {
          this.announcements = v;
        }),
        this.loadCollection(C.banners, mapBanner, v => {
          this.banners = v;
        }),
        this.loadFeaturedRequests(),
        this.loadCollection(C.reviews, mapReview, v => {
          this.reviews = v;
        }),
        (async () => {
          const sref = doc(this.db, C.featuredSettings, FEATURED_SETTINGS_DOC);
          const ssnap = await getDoc(sref);
          if (ssnap.exists()) {
            const d = ssnap.data() as Record<string, unknown>;
            this.featuredSettings = {
              price: typeof d.price === 'number' ? d.price : 0,
              durationDays:
                typeof d.durationDays === 'number' ? d.durationDays : 7,
            };
          }
        })(),
      ]);
      this.emit();
    } catch (err) {
      console.warn('[FirestoreRepo] hydrate failed — keeping local seed', err);
    }
  }

  /** إعادة التحميل من Firestore (تُستخدم لـ pull-to-refresh). */
  async refresh(): Promise<void> {
    await this.hydrate();
  }

  // ——— كتابة خلفية ———

  private bg(p: Promise<unknown>, what: string): void {
    p.catch(err => logWriteErr(what, err));
  }

  private userDocId(u: User): string {
    return u.uid ?? u.id;
  }

  /**
   * يرفع حقول الصور المحلية في الخلفية ثم يحدّث الكاش والمستند
   * بروابط التحميل. الكاش يعرض الـURI المحلية فورًا (تعمل أوفلاين).
   */
  private syncImages<T extends { id: string }>(
    coll: string,
    cache: T[],
    id: string,
    fields: Partial<Record<keyof T, 'single' | 'array'>>,
    folder: string,
  ): void {
    const entity = cache.find(e => e.id === id) as
      | (Record<string, unknown> & { id: string })
      | undefined;
    if (!entity) return;
    this.syncImagesAsync(coll, entity, id, fields, folder);
  }

  private async syncImagesAsync<T extends { id: string }>(
    coll: string,
    entity: Record<string, unknown> & { id: string },
    id: string,
    fields: Partial<Record<keyof T, 'single' | 'array'>>,
    folder: string,
  ): Promise<void> {
    try {
      const patch: Record<string, unknown> = {};
      for (const [key, kind] of Object.entries(fields)) {
        const value = entity[key];
        if (kind === 'array') {
          if (!Array.isArray(value)) continue;
          const urls: string[] = [];
          let changed = false;
          for (const uri of value) {
            if (typeof uri === 'string' && isLocalUri(uri)) {
              urls.push(await uploadImage(uri, folder));
              changed = true;
            } else if (typeof uri === 'string') {
              urls.push(uri);
            }
          }
          if (changed) {
            entity[key] = urls;
            patch[key] = urls;
          }
        } else if (typeof value === 'string' && isLocalUri(value)) {
          const url = await uploadImage(value, folder);
          entity[key] = url;
          patch[key] = url;
        }
      }
      if (Object.keys(patch).length > 0) {
        await updateDoc(doc(this.db, coll, entity.id), patch);
        this.emit();
      }
    } catch (err) {
      logWriteErr(`image sync ${coll}/${id}`, err);
    }
  }

  /**
   * يرفع صورًا محلية إلى Cloudinary وينتظر اكتمال الرفع — للاستخدام مع
   * await من الشاشات قبل الحفظ. الروابط https تُمرَّر كما هي بلا إعادة
   * رفع. يرمي خطأً واضحًا عند الفشل (لا فشل صامت).
   */
  async uploadImages(uris: string[], folder: string): Promise<string[]> {
    const urls: string[] = [];
    for (const uri of uris) {
      urls.push(isLocalUri(uri) ? await uploadImage(uri, folder) : uri);
    }
    return urls;
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
    const refDoc = doc(collection(this.db, C.listings));
    const listing: Listing = {
      ...input,
      id: refDoc.id,
      ownerUid: currentOwnerUid(),
      status: 'pending',
      createdAt: Date.now(),
    };
    this.listings.unshift(listing);
    this.emit();
    this.bg(
      setDoc(refDoc, clean(stripId(listing))),
      `addListing ${listing.id}`,
    );
    this.syncImages(C.listings, this.listings, listing.id, { images: 'array' }, 'listings');
    return listing;
  }

  updateListingStatus(id: string, status: AdStatus): void {
    const l = this.listings.find(x => x.id === id);
    if (l) {
      l.status = status;
      this.emit();
      this.bg(
        updateDoc(doc(this.db, C.listings, id), { status }),
        `updateListingStatus ${id}`,
      );
    }
  }

  getUserListings(userId: string): Listing[] {
    return this.listings
      .filter(l => l.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // تمييز مدفوع على مستوى الإعلان (v15) — الإدارة فقط
  setListingFeatured(id: string, until?: number): void {
    const l = this.listings.find(x => x.id === id);
    if (l) {
      l.featuredUntil = until;
      this.emit();
      this.bg(
        updateDoc(doc(this.db, C.listings, id), { featuredUntil: until ?? null }),
        `setListingFeatured ${id}`,
      );
    }
  }

  // الإعلانات المميزة السارية (الأحدث تمييزًا أولًا)
  getFeaturedListings(gov?: string): Listing[] {
    const now = Date.now();
    return this.listings
      .filter(
        l =>
          l.status === 'approved' &&
          l.featuredUntil !== undefined &&
          l.featuredUntil > now &&
          (!gov || gov === 'الكل' || l.gov === gov),
      )
      .sort((a, b) => (b.featuredUntil ?? 0) - (a.featuredUntil ?? 0));
  }

  deleteListing(id: string): void {
    this.listings = this.listings.filter(l => l.id !== id);
    this.emit();
    this.bg(deleteDoc(doc(this.db, C.listings, id)), `deleteListing ${id}`);
  }

  // ——— متاجر ———
  getStores(gov?: string): Store[] {
    return this.stores.filter(s => !gov || gov === 'الكل' || s.gov === gov);
  }

  getStoreById(id: string): Store | undefined {
    return this.stores.find(s => s.id === id);
  }

  addStore(input: NewStoreInput): Store {
    const refDoc = doc(collection(this.db, C.stores));
    const store: Store = {
      ...input,
      id: refDoc.id,
      ownerUid: currentOwnerUid(),
    };
    this.stores.unshift(store);
    this.emit();
    this.bg(setDoc(refDoc, clean(stripId(store))), `addStore ${store.id}`);
    return store;
  }

  updateStore(id: string, patch: Partial<Store>): void {
    const s = this.stores.find(x => x.id === id);
    if (!s) return;
    // فصل حقول الصور عن النصوص: Firestore لا يستقبل أبدًا URI محليًا
    // (file://) — الكاش وحده يعرض الصورة المختارة فورًا على هذا الجهاز،
    // وروابط https تُكتب في Firestore فورًا، والمحلية تُرفع بالخلفية.
    // ملاحظة: الغلاف (coverImage) أُلغي من الواجهة بقرار الإدارة — يبقى
    // الحقل في البيانات القديمة بصمت دون عرض أو تعديل.
    const { id: _id, ownerUid: _ou, logoImage, ...textPatch } = patch;
    Object.assign(s, textPatch);
    this.emit();
    // id وownerUid لا يُكتبان — الملكية ثابتة
    const cleanText = clean(textPatch);
    if (Object.keys(cleanText).length > 0) {
      this.bg(
        updateDoc(doc(this.db, C.stores, id), cleanText),
        `updateStore ${id}`,
      );
    }
    if (logoImage !== undefined) {
      s.logoImage = logoImage;
      this.emit();
      if (!isLocalUri(logoImage)) {
        this.bg(
          updateDoc(doc(this.db, C.stores, id), clean({ logoImage })),
          `updateStore images ${id}`,
        );
      }
      this.syncImages(C.stores, this.stores, id, { logoImage: 'single' }, 'stores');
    }
  }

  deleteStore(id: string): void {
    this.stores = this.stores.filter(s => s.id !== id);
    // حذف المنتجات والتصنيفات المرتبطة لتفادي السجلات اليتيمة
    const prodIds = this.products.filter(p => p.storeId === id).map(p => p.id);
    const catIds = this.categories.filter(c => c.storeId === id).map(c => c.id);
    this.products = this.products.filter(p => p.storeId !== id);
    this.categories = this.categories.filter(c => c.storeId !== id);
    this.emit();
    this.bg(deleteDoc(doc(this.db, C.stores, id)), `deleteStore ${id}`);
    prodIds.forEach(pid =>
      this.bg(deleteDoc(doc(this.db, C.products, pid)), `deleteStore product ${pid}`),
    );
    catIds.forEach(cid =>
      this.bg(deleteDoc(doc(this.db, C.storeCategories, cid)), `deleteStore category ${cid}`),
    );
  }

  // ——— تصنيفات داخل المتجر (v8) ———
  getCategoriesByStore(storeId: string): StoreCategory[] {
    return this.categories
      .filter(c => c.storeId === storeId)
      .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
  }

  addCategory(input: NewStoreCategoryInput): StoreCategory {
    const refDoc = doc(collection(this.db, C.storeCategories));
    const siblings = this.categories.filter(c => c.storeId === input.storeId);
    const maxOrder = siblings.reduce((m, c) => Math.max(m, c.order), -1);
    const cat: StoreCategory = {
      ...input,
      id: refDoc.id,
      ownerUid: currentOwnerUid(),
      order: maxOrder + 1,
      createdAt: Date.now(),
    };
    this.categories.push(cat);
    this.emit();
    this.bg(
      setDoc(refDoc, clean(stripId(cat))),
      `addCategory ${cat.id}`,
    );
    return cat;
  }

  updateCategory(id: string, name: string): void {
    const c = this.categories.find(x => x.id === id);
    if (c) {
      c.name = name;
      this.emit();
      this.bg(
        updateDoc(doc(this.db, C.storeCategories, id), { name }),
        `updateCategory ${id}`,
      );
    }
  }

  deleteCategory(id: string): void {
    const c = this.categories.find(x => x.id === id);
    if (!c) return;
    // منتجات التصنيف المحذوف تعود إلى «عام» (بلا تصنيف)
    this.products.forEach(p => {
      if (p.storeId === c.storeId && p.categoryId === id) {
        delete p.categoryId;
        this.bg(
          updateDoc(doc(this.db, C.products, p.id), { categoryId: null }),
          `deleteCategory unassign ${p.id}`,
        );
      }
    });
    this.categories = this.categories.filter(x => x.id !== id);
    this.emit();
    this.bg(
      deleteDoc(doc(this.db, C.storeCategories, id)),
      `deleteCategory ${id}`,
    );
  }

  assignProductCategory(productId: string, categoryId?: string): void {
    const p = this.products.find(x => x.id === productId);
    if (p) {
      if (categoryId) p.categoryId = categoryId;
      else delete p.categoryId;
      this.emit();
      this.bg(
        updateDoc(doc(this.db, C.products, productId), {
          categoryId: categoryId ?? null,
        }),
        `assignProductCategory ${productId}`,
      );
    }
  }

  // ——— تقييمات المتاجر ———
  getReviews(storeId: string): Review[] {
    return this.reviews
      .filter(r => r.storeId === storeId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  addReview(input: NewReviewInput): Review {
    const refDoc = doc(collection(this.db, C.reviews));
    const r: Review = { ...input, id: refDoc.id, createdAt: Date.now() };
    this.reviews.unshift(r);
    this.emit();
    this.bg(
      setDoc(refDoc, clean({ ...stripId(r), ownerUid: currentOwnerUid() })),
      `addReview ${r.id}`,
    );
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
      this.bg(
        updateDoc(doc(this.db, C.users, this.userDocId(u)), { blocked }),
        `setUserBlocked ${id}`,
      );
    }
  }

  addUser(input: NewUserInput, isAdmin: boolean): User {
    const user: User = {
      ...input,
      id: '',
      isAdmin,
      createdAt: Date.now(),
    };
    if (input.uid) {
      // معرّف المستند هو الـuid نفسه (مطلوب لقواعد users/{uid})
      user.id = input.uid;
      this.users.push(user);
      this.emit();
      this.bg(
        setDoc(doc(this.db, C.users, input.uid), clean(stripId(user))),
        `addUser ${user.id}`,
      );
    } else {
      const refDoc = doc(collection(this.db, C.users));
      user.id = refDoc.id;
      this.users.push(user);
      this.emit();
      this.bg(
        setDoc(refDoc, clean(stripId(user))),
        `addUser ${user.id}`,
      );
    }
    return user;
  }

  linkStoreToUser(idOrPhone: string, storeId: string): void {
    const u = this.users.find(
      x => x.phone === idOrPhone || x.id === idOrPhone || x.uid === idOrPhone,
    );
    if (u) {
      u.storeId = storeId;
      this.emit();
      this.bg(
        updateDoc(doc(this.db, C.users, this.userDocId(u)), { storeId }),
        `linkStoreToUser ${u.id}`,
      );
    }
  }

  // ——— الدليل الطبي — التسجيل الذاتي + موافقة الإدارة (v14) ———
  getDoctors(): DoctorEntry[] {
    // المعتمدون فقط (القديم بلا حالة يُعامل كمعتمد للتوافق)
    return this.doctors.filter(d => (d.status ?? 'approved') === 'approved');
  }
  async getDoctorRequests(): Promise<DoctorEntry[]> {
    const snap = await getDocs(
      query(collection(this.db, C.doctors), where('status', '==', 'pending')),
    );
    return snap.docs.map(d => mapDoctor(d.id, d.data() as Record<string, unknown>));
  }
  addDoctor(d: Doctor): DoctorEntry {
    const refDoc = doc(collection(this.db, C.doctors));
    const e: DoctorEntry = { ...d, id: refDoc.id };
    this.doctors.unshift(e);
    this.emit();
    this.bg(setDoc(refDoc, clean(stripId(e))), `addDoctor ${e.id}`);
    this.syncImages(C.doctors, this.doctors, e.id, { photo: 'single' }, 'medical');
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
    this.bg(
      setDoc(doc(this.db, C.doctors, id), clean(d)),
      `updateDoctor ${id}`,
    );
    this.syncImages(C.doctors, this.doctors, id, { photo: 'single' }, 'medical');
  }
  deleteDoctor(id: string): void {
    this.doctors = this.doctors.filter(x => x.id !== id);
    this.emit();
    this.bg(deleteDoc(doc(this.db, C.doctors, id)), `deleteDoctor ${id}`);
  }

  getPharmacies(): PharmacyEntry[] {
    return [...this.pharmacies];
  }
  addPharmacy(p: Pharmacy): PharmacyEntry {
    const refDoc = doc(collection(this.db, C.pharmacies));
    const e: PharmacyEntry = { ...p, id: refDoc.id };
    this.pharmacies.unshift(e);
    this.emit();
    this.bg(setDoc(refDoc, clean(stripId(e))), `addPharmacy ${e.id}`);
    this.syncImages(C.pharmacies, this.pharmacies, e.id, { photo: 'single' }, 'medical');
    return e;
  }
  updatePharmacy(id: string, p: Pharmacy): void {
    const i = this.pharmacies.findIndex(x => x.id === id);
    if (i >= 0) {
      this.pharmacies[i] = { ...p, id };
      this.emit();
      this.bg(
        setDoc(doc(this.db, C.pharmacies, id), clean(p)),
        `updatePharmacy ${id}`,
      );
      this.syncImages(C.pharmacies, this.pharmacies, id, { photo: 'single' }, 'medical');
    }
  }
  deletePharmacy(id: string): void {
    this.pharmacies = this.pharmacies.filter(x => x.id !== id);
    this.emit();
    this.bg(deleteDoc(doc(this.db, C.pharmacies, id)), `deletePharmacy ${id}`);
  }

  getLabs(): LabEntry[] {
    return [...this.labs];
  }
  addLab(l: Lab): LabEntry {
    const refDoc = doc(collection(this.db, C.labs));
    const e: LabEntry = { ...l, id: refDoc.id };
    this.labs.unshift(e);
    this.emit();
    this.bg(setDoc(refDoc, clean(stripId(e))), `addLab ${e.id}`);
    this.syncImages(C.labs, this.labs, e.id, { photo: 'single' }, 'medical');
    return e;
  }
  updateLab(id: string, l: Lab): void {
    const i = this.labs.findIndex(x => x.id === id);
    if (i >= 0) {
      this.labs[i] = { ...l, id };
      this.emit();
      this.bg(setDoc(doc(this.db, C.labs, id), clean(l)), `updateLab ${id}`);
      this.syncImages(C.labs, this.labs, id, { photo: 'single' }, 'medical');
    }
  }
  deleteLab(id: string): void {
    this.labs = this.labs.filter(x => x.id !== id);
    this.emit();
    this.bg(deleteDoc(doc(this.db, C.labs, id)), `deleteLab ${id}`);
  }

  // ——— اشتراكات ———
  getSubscriptions(): Subscription[] {
    return [...this.subscriptions].sort((a, b) => b.createdAt - a.createdAt);
  }
  addSubscription(s: NewSubscriptionInput): Subscription {
    const refDoc = doc(collection(this.db, C.subscriptions));
    const sub: Subscription = {
      ...s,
      id: refDoc.id,
      ownerUid: currentOwnerUid(),
      createdAt: Date.now(),
    };
    this.subscriptions.unshift(sub);
    this.emit();
    this.bg(
      setDoc(refDoc, clean(stripId(sub))),
      `addSubscription ${sub.id}`,
    );
    this.syncImages(
      C.subscriptions,
      this.subscriptions,
      sub.id,
      { receiptUri: 'single' },
      'subscriptions',
    );
    return sub;
  }
  updateSubscriptionStatus(id: string, status: Subscription['status']): void {
    const s = this.subscriptions.find(x => x.id === id);
    if (s) {
      s.status = status;
      this.emit();
      this.bg(
        updateDoc(doc(this.db, C.subscriptions, id), { status }),
        `updateSubscriptionStatus ${id}`,
      );
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
    const refDoc = doc(collection(this.db, C.products));
    const product: Product = {
      ...input,
      id: refDoc.id,
      ownerUid: currentOwnerUid(),
      createdAt: Date.now(),
    };
    this.products.unshift(product);
    this.emit();
    this.bg(
      setDoc(refDoc, clean(stripId(product))),
      `addProduct ${product.id}`,
    );
    this.syncImages(C.products, this.products, product.id, { images: 'array' }, 'products');
    return product;
  }

  deleteProduct(id: string): void {
    this.products = this.products.filter(p => p.id !== id);
    this.emit();
    this.bg(deleteDoc(doc(this.db, C.products, id)), `deleteProduct ${id}`);
  }

  // ——— إعلانات إدارية ———
  getAnnouncements(): Announcement[] {
    return [...this.announcements].sort((a, b) => b.createdAt - a.createdAt);
  }

  addAnnouncement(input: NewAnnouncementInput): Announcement {
    const refDoc = doc(collection(this.db, C.announcements));
    const a: Announcement = {
      ...input,
      id: refDoc.id,
      createdAt: Date.now(),
    };
    this.announcements.unshift(a);
    this.emit();
    this.bg(
      setDoc(refDoc, clean(stripId(a))),
      `addAnnouncement ${a.id}`,
    );
    return a;
  }

  deleteAnnouncement(id: string): void {
    this.announcements = this.announcements.filter(a => a.id !== id);
    this.emit();
    this.bg(
      deleteDoc(doc(this.db, C.announcements, id)),
      `deleteAnnouncement ${id}`,
    );
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
    const refDoc = doc(collection(this.db, C.banners));
    const b: Banner = {
      ...input,
      id: refDoc.id,
      active: true,
      createdAt: Date.now(),
    };
    this.banners.unshift(b);
    this.emit();
    this.bg(setDoc(refDoc, clean(stripId(b))), `addBanner ${b.id}`);
    this.syncImages(C.banners, this.banners, b.id, { imageUri: 'single' }, 'banners');
    return b;
  }

  toggleBanner(id: string): void {
    const b = this.banners.find(x => x.id === id);
    if (b) {
      b.active = !b.active;
      this.emit();
      this.bg(
        updateDoc(doc(this.db, C.banners, id), { active: b.active }),
        `toggleBanner ${id}`,
      );
    }
  }

  deleteBanner(id: string): void {
    this.banners = this.banners.filter(b => b.id !== id);
    this.emit();
    this.bg(deleteDoc(doc(this.db, C.banners, id)), `deleteBanner ${id}`);
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
    const refDoc = doc(collection(this.db, C.featuredRequests));
    const f: FeaturedRequest = {
      ...input,
      id: refDoc.id,
      ownerUid: currentOwnerUid(),
      status: 'pending',
      createdAt: Date.now(),
    };
    this.featured.unshift(f);
    this.emit();
    this.bg(
      setDoc(refDoc, clean(stripId(f))),
      `addFeaturedRequest ${f.id}`,
    );
    this.syncImages(
      C.featuredRequests,
      this.featured,
      f.id,
      { imageUri: 'single', receiptUri: 'single' },
      'featured',
    );
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
      const patch: Record<string, unknown> = { status };
      if (startDate !== undefined) patch.startDate = startDate;
      if (endDate !== undefined) patch.endDate = endDate;
      this.bg(
        updateDoc(doc(this.db, C.featuredRequests, id), patch),
        `updateFeaturedRequestStatus ${id}`,
      );
    }
  }

  getFeaturedSettings(): FeaturedSettings {
    return { ...this.featuredSettings };
  }

  updateFeaturedSettings(s: FeaturedSettings): void {
    this.featuredSettings = { ...s };
    this.emit();
    this.bg(
      setDoc(doc(this.db, C.featuredSettings, FEATURED_SETTINGS_DOC), clean({ ...s })),
      'updateFeaturedSettings',
    );
  }
}
