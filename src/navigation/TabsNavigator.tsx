import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text } from 'react-native';
import { AccountScreen } from '../screens/AccountScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SectionsScreen } from '../screens/SectionsScreen';
import { colors } from '../theme';
import { TabsParamList } from './types';

const Tab = createBottomTabNavigator<TabsParamList>();

const ICONS: Record<string, string> = {
  Home: '🏠',
  Sections: '🗂️',
  Favorites: '❤️',
  Account: '👤',
};

const LABELS: Record<string, string> = {
  Home: 'الرئيسية',
  Sections: 'الأقسام',
  Favorites: 'المفضلة',
  Account: 'حسابي',
};

export function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabel: LABELS[route.name],
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{ICONS[route.name]}</Text>
        ),
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sections" component={SectionsScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
