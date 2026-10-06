import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { CategoriesScreen } from '../screens/Categories/CategoriesScreen';
import { CategoryDetailScreen } from '../screens/Categories/CategoryDetailScreen';
import { SubCategoryProductsScreen } from '../screens/Categories/SubCategoryProductsScreen';
import { ProductDetailScreen } from '../screens/Product/ProductDetailScreen';
import { SearchScreen } from '../screens/Search/SearchScreen';
import { SharedHistoryScreen } from '../screens/Shared/SharedHistoryScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../theme';
import { Home, Layers, Search, Send, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeStackNav = createNativeStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} />
      <HomeStackNav.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <HomeStackNav.Screen name="SubCategoryProducts" component={SubCategoryProductsScreen} />
      <HomeStackNav.Screen name="ProductDetail" component={ProductDetailScreen} />
      <HomeStackNav.Screen name="Search" component={SearchScreen} />
      <HomeStackNav.Screen name="SharedHistory" component={SharedHistoryScreen} />
      <HomeStackNav.Screen name="Profile" component={ProfileScreen} />
    </HomeStackNav.Navigator>
  );
}

const CategoriesStackNav = createNativeStackNavigator();
function CategoriesStackScreen() {
  return (
    <CategoriesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <CategoriesStackNav.Screen name="CategoriesMain" component={CategoriesScreen} />
      <CategoriesStackNav.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <CategoriesStackNav.Screen name="SubCategoryProducts" component={SubCategoryProductsScreen} />
      <CategoriesStackNav.Screen name="ProductDetail" component={ProductDetailScreen} />
      <CategoriesStackNav.Screen name="Search" component={SearchScreen} />
      <CategoriesStackNav.Screen name="SharedHistory" component={SharedHistoryScreen} />
      <CategoriesStackNav.Screen name="Profile" component={ProfileScreen} />
    </CategoriesStackNav.Navigator>
  );
}

const SearchStackNav = createNativeStackNavigator();
function SearchStackScreen() {
  return (
    <SearchStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SearchStackNav.Screen name="SearchMain" component={SearchScreen} />
      <SearchStackNav.Screen name="ProductDetail" component={ProductDetailScreen} />
      <SearchStackNav.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <SearchStackNav.Screen name="SubCategoryProducts" component={SubCategoryProductsScreen} />
    </SearchStackNav.Navigator>
  );
}

const SharedStackNav = createNativeStackNavigator();
function SharedStackScreen() {
  return (
    <SharedStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SharedStackNav.Screen name="SharedMain" component={SharedHistoryScreen} />
      <SharedStackNav.Screen name="ProductDetail" component={ProductDetailScreen} />
    </SharedStackNav.Navigator>
  );
}

const ProfileStackNav = createNativeStackNavigator();
function ProfileStackScreen() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} />
    </ProfileStackNav.Navigator>
  );
}

export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  // Safe bottom padding for Android system navigation (3-button or gesture bar) and iOS home indicator
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8);
  const tabHeight = 56 + safeBottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentBlue,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: tabHeight,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: safeBottom,
          paddingTop: 8,
          ...shadows.card,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesStackScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size }) => <Layers size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStackScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => <Search size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="SharedTab"
        component={SharedStackScreen}
        options={{
          tabBarLabel: 'Shared Logs',
          tabBarIcon: ({ color, size }) => <Send size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
