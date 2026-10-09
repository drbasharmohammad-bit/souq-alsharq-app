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
  Doctor,
  Lab,
  Listing,
  Pharmacy,
  Product,
  Store,
  Subscription,
  User,
} from '../types';
import {
  DoctorEntry,
  LabEntry,
  ListingFilter,
  NewListingInput,
  NewProductInput,
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
export class LocalRepo implements Repository {
  private listings: Listing[];
  private stores: Store[];
  private users: User[] = [];
  private doctors: DoctorEntry[];
  private pharmacies: PharmacyEntry[];
  private labs: LabEntry[];
  private subscriptions: Subscription[] = [];
  private products: Product[] = [];

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
    this.doctors = DOCTORS.map((d, i) => ({ ...d, id: `doc${i}` }));
    this.pharmacies = PHARMS.map((p, i) => ({ ...p, id: `ph${i}` }));
    this.labs = LABS.map((l, i) => ({ ...l, id: `lab${i}` }));
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

  // ——— متاجر ———
  getStores(): Store[] {
    return [...this.stores];
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

  // ——— مستخدمون ———
  getUserByPhone(phone: string): User | undefined {
    return this.users.find(u => u.phone === phone);
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

  // ——— الدليل الطبي ———
  getDoctors(): DoctorEntry[] {
    return [...this.doctors];
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
      this.emit();
    }
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
}
