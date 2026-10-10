import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { GovProvider } from '../context/GovContext';
import { RepoProvider } from '../repo/RepoContext';
import { OtaProvider } from '../ota/OtaContext';
import { MedicalAdminScreen } from '../screens/admin/MedicalAdminScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminScreen } from '../screens/admin/AdminScreen';
import { AdminStoresScreen } from '../screens/admin/AdminStoresScreen';
import { AnnouncementsAdminScreen } from '../screens/admin/AnnouncementsAdminScreen';
import { BannersAdminScreen } from '../screens/admin/BannersAdminScreen';
import { FeaturedReviewScreen } from '../screens/admin/FeaturedReviewScreen';
import { FeaturedSettingsScreen } from '../screens/admin/FeaturedSettingsScreen';
import { ReviewScreen } from '../screens/admin/ReviewScreen';
import { SubscriptionReviewScreen } from '../screens/admin/SubscriptionReviewScreen';
import { UsersAdminScreen } from '../screens/admin/UsersAdminScreen';
import { AnnouncementsScreen } from '../screens/AnnouncementsScreen';
import { AdDetailScreen } from '../screens/AdDetailScreen';
import { CompleteProfileScreen } from '../screens/auth/CompleteProfileScreen';
import { CreateStoreScreen } from '../screens/auth/CreateStoreScreen';
import { GoogleLoginScreen } from '../screens/auth/GoogleLoginScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { ListingsScreen } from '../screens/ListingsScreen';
import { MedicalScreen } from '../screens/MedicalScreen';
import { DoctorRegisterScreen } from '../screens/DoctorRegisterScreen';
import { AddProductScreen } from '../screens/merchant/AddProductScreen';
import { EditStoreScreen } from '../screens/merchant/EditStoreScreen';
import { FeaturedAdScreen } from '../screens/merchant/FeaturedAdScreen';
import { StoreProductsScreen } from '../screens/merchant/StoreProductsScreen';
import { MyAdsScreen } from '../screens/MyAdsScreen';
import { PublishFormScreen } from '../screens/publish/PublishFormScreen';
import { PublishSectionScreen } from '../screens/publish/PublishSectionScreen';
import { PublishSubScreen } from '../screens/publish/PublishSubScreen';
import { PublishSuccessScreen } from '../screens/publish/PublishSuccessScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { StoreDetailScreen } from '../screens/StoreDetailScreen';
import { SubCategoriesScreen } from '../screens/SubCategoriesScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { colors } from '../theme';
import { TabsNavigator } from './TabsNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const ONBOARDING_KEY = 'sharq_onboarding_seen';

/** الترحيب لمرة واحدة: يظهر فقط عند أول تشغيل ثم لا يظهر أبدًا */
function AppRoot() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then(v => setShowOnboarding(v !== '1'))
      .catch(() => setShowOnboarding(false));
  }, []);

  const done = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    } catch {
      // تجاهل
    }
    setShowOnboarding(false);
  };

  if (showOnboarding === null) return null;
  if (showOnboarding) return <OnboardingScreen onDone={done} />;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
        }}>
              <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
              <Stack.Screen name="SubCategories" component={SubCategoriesScreen} options={{ title: 'التصنيفات' }} />
              <Stack.Screen name="Listings" component={ListingsScreen} options={({ route }) => ({ title: route.params.title })} />
              <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'التفاصيل' }} />
              <Stack.Screen name="AdDetail" component={AdDetailScreen} options={{ headerShown: false }} />
              <Stack.Screen name="StoreDetail" component={StoreDetailScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Medical" component={MedicalScreen} options={{ title: 'القسم الطبي' }} />
              <Stack.Screen name="DoctorRegister" component={DoctorRegisterScreen} options={{ title: 'سجّل عيادتك' }} />
              <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'البحث' }} />
              {/* الحسابات — الدخول بحساب جوجل */}
              <Stack.Screen name="GoogleLogin" component={GoogleLoginScreen} options={{ title: 'تسجيل الدخول' }} />
              <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} options={{ title: 'إكمال البيانات' }} />
              <Stack.Screen name="CreateStore" component={CreateStoreScreen} options={{ title: 'إنشاء متجر' }} />
              {/* النشر */}
              <Stack.Screen name="PublishSection" component={PublishSectionScreen} options={{ title: 'إعلان جديد' }} />
              <Stack.Screen name="PublishSub" component={PublishSubScreen} options={{ title: 'التصنيف' }} />
              <Stack.Screen name="PublishForm" component={PublishFormScreen} options={{ title: 'تفاصيل الإعلان' }} />
              <Stack.Screen name="PublishSuccess" component={PublishSuccessScreen} options={{ title: 'تم الإرسال', headerLeft: () => null }} />
              <Stack.Screen name="MyAds" component={MyAdsScreen} options={{ title: 'إعلاناتي' }} />
              {/* منتجات التاجر */}
              <Stack.Screen name="StoreProducts" component={StoreProductsScreen} options={{ title: 'أصناف المتجر' }} />
              <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'إضافة صنف' }} />
              <Stack.Screen name="EditStore" component={EditStoreScreen} options={{ title: 'تعديل المتجر' }} />
              <Stack.Screen name="FeaturedAd" component={FeaturedAdScreen} options={{ title: 'إعلان مميز' }} />
              {/* الاشتراك والإدارة */}
              <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'الاشتراك' }} />
              <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'لوحة الإدارة' }} />
              <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'لوحة المدير' }} />
              <Stack.Screen name="AdminStores" component={AdminStoresScreen} options={{ title: 'إدارة المتاجر' }} />
              <Stack.Screen name="AdminReview" component={ReviewScreen} options={{ title: 'مراجعة الإعلانات' }} />
              <Stack.Screen name="AdminMedical" component={MedicalAdminScreen} options={{ title: 'الدليل الطبي' }} />
              <Stack.Screen name="AdminSubs" component={SubscriptionReviewScreen} options={{ title: 'مراجعة الإيصالات' }} />
              <Stack.Screen name="AdminUsers" component={UsersAdminScreen} options={{ title: 'إدارة المستخدمين' }} />
              <Stack.Screen name="AdminAnnouncements" component={AnnouncementsAdminScreen} options={{ title: 'الإعلانات الإدارية' }} />
              <Stack.Screen name="AdminBanners" component={BannersAdminScreen} options={{ title: 'بانرات الواجهة' }} />
              <Stack.Screen name="AdminFeatured" component={FeaturedReviewScreen} options={{ title: 'الإعلانات المميزة' }} />
              <Stack.Screen name="AdminFeaturedSettings" component={FeaturedSettingsScreen} options={{ title: 'إعدادات التمييز' }} />
              <Stack.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'إعلانات الإدارة' }} />
            </Stack.Navigator>
    </NavigationContainer>
  );
}

export function RootNavigator() {
  return (
    <OtaProvider>
      <RepoProvider>
        <GovProvider>
        <AuthProvider>
          <FavoritesProvider>
            <AppRoot />
          </FavoritesProvider>
        </AuthProvider>
        </GovProvider>
      </RepoProvider>
    </OtaProvider>
  );
}
