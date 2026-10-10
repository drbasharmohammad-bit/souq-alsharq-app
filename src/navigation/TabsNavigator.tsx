import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { AppIcon } from '../components/AppIcon';
import { useAuth } from '../context/AuthContext';
import { AccountScreen } from '../screens/AccountScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SectionsScreen } from '../screens/SectionsScreen';
import { colors } from '../theme';
import { TabsParamList } from './types';

const Tab = createBottomTabNavigator<TabsParamList>();

const ICONS: Record<string, string> = {
  Home: 'home',
  Sections: 'view-grid',
  Favorites: 'heart',
  Account: 'account',
  AdminTab: 'shield-account',
};

const LABELS: Record<string, string> = {
  Home: 'الرئيسية',
  Sections: 'الأقسام',
  Favorites: 'المفضلة',
  Account: 'حسابي',
  AdminTab: 'الإدارة',
};

export function TabsNavigator() {
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabel: LABELS[route.name],
        tabBarIcon: ({ focused, color }) => (
          <AppIcon name={ICONS[route.name]} size={24} color={focused ? colors.primary : color} />
        ),
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sections" component={SectionsScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
      {isAdmin && <Tab.Screen name="AdminTab" component={AdminDashboardScreen} />}
    </Tab.Navigator>
  );
}
