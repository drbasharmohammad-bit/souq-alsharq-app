import { NavigatorScreenParams } from '@react-navigation/native';

export type TabsParamList = {
  Home: undefined;
  Sections: undefined;
  Favorites: undefined;
  Account: undefined;
  AdminTab: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabsParamList>;
  SubCategories: { sectionKey: string };
  Listings: { sectionKey: string; subKey?: string; title: string };
  Detail: { listingId: string };
  StoreDetail: { storeId: string };
  AdDetail: { listingId?: string; productId?: string };
  Medical: undefined;
  DoctorRegister: undefined;
  Search: { q?: string } | undefined;
  // الحسابات — الدخول بحساب جوجل
  GoogleLogin: undefined;
  CompleteProfile: undefined;
  CreateStore: undefined;
  // المرحلة 2: النشر
  PublishSection: undefined;
  PublishSub: { sectionKey: string };
  PublishForm: { sectionKey: string; subKey: string };
  PublishSuccess: undefined;
  MyAds: undefined;
  // منتجات التاجر
  StoreProducts: undefined;
  AddProduct: undefined;
  EditStore: undefined;
  // المرحلة 2: الاشتراك والإدارة
  Subscription: undefined;
  Admin: undefined;
  AdminDashboard: undefined;
  AdminStores: undefined;
  AdminReview: undefined;
  AdminMedical: undefined;
  AdminSubs: undefined;
  AdminUsers: undefined;
  AdminAnnouncements: undefined;
  AdminBanners: undefined;
  AdminFeatured: undefined;
  AdminFeaturedSettings: undefined;
  Announcements: undefined;
  // التاجر: إعلان مميز
  FeaturedAd: undefined;
};
