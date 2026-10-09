import { NavigatorScreenParams } from '@react-navigation/native';

export type TabsParamList = {
  Home: undefined;
  Sections: undefined;
  Favorites: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabsParamList>;
  SubCategories: { sectionKey: string };
  Listings: { sectionKey: string; subKey?: string; title: string };
  Detail: { listingId: string };
  Medical: undefined;
  Search: undefined;
  // المرحلة 2: الحسابات
  Phone: undefined;
  Otp: { phone: string };
  AccountType: { phone: string };
  CreateStore: { phone: string };
  // المرحلة 2: النشر
  PublishSection: undefined;
  PublishSub: { sectionKey: string };
  PublishForm: { sectionKey: string; subKey: string };
  PublishSuccess: undefined;
  MyAds: undefined;
  // المرحلة 2: الاشتراك والإدارة
  Subscription: undefined;
  Admin: undefined;
  AdminReview: undefined;
  AdminMedical: undefined;
};
