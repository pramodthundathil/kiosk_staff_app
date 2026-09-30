import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { CategoryDetailScreen } from '../screens/Categories/CategoryDetailScreen';
import { SubCategoryProductsScreen } from '../screens/Categories/SubCategoryProductsScreen';
import { ProductDetailScreen } from '../screens/Product/ProductDetailScreen';
import { SearchScreen } from '../screens/Search/SearchScreen';
import { SharedHistoryScreen } from '../screens/Shared/SharedHistoryScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { NavigationRail } from './NavigationRail';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { CategoriesScreen } from '../screens/Categories/CategoriesScreen';
import { useResponsiveLayout } from '../utils/responsive';
import { colors } from '../theme';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const layout = useResponsiveLayout();

  const [activeRailTab, setActiveRailTab] = useState<string>('HomeTab');

  const handleRailTabSelect = (tabName: string) => {
    setActiveRailTab(tabName);
    // Navigate back to main tab root so stack screens reset
    if (navigationRef.isReady()) {
      navigationRef.navigate('MainTabs');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentBlue} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {!isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      ) : layout.isTablet && layout.isLandscape ? (
        /* Tablet Landscape Layout with NavigationRail & Stack Reset */
        <View style={styles.tabletLandscapeLayout}>
          <NavigationRail
            currentTab={activeRailTab}
            onSelectTab={handleRailTabSelect}
          />

          <View style={styles.tabletMainArea}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {activeRailTab === 'HomeTab' && (
                <Stack.Screen name="MainTabs" component={HomeScreen} />
              )}
              {activeRailTab === 'CategoriesTab' && (
                <Stack.Screen name="MainTabs" component={CategoriesScreen} />
              )}
              {activeRailTab === 'SearchTab' && (
                <Stack.Screen name="MainTabs" component={SearchScreen} />
              )}
              {activeRailTab === 'SharedTab' && (
                <Stack.Screen name="MainTabs" component={SharedHistoryScreen} />
              )}
              {activeRailTab === 'ProfileTab' && (
                <Stack.Screen name="MainTabs" component={ProfileScreen} />
              )}

              <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
              <Stack.Screen name="SubCategoryProducts" component={SubCategoryProductsScreen} />
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="SharedHistory" component={SharedHistoryScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
          </View>
        </View>
      ) : (
        /* Mobile & Portrait Layout with BottomTabNavigator */
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
          <Stack.Screen name="SubCategoryProducts" component={SubCategoryProductsScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="SharedHistory" component={SharedHistoryScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabletLandscapeLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  tabletMainArea: {
    flex: 1,
  },
});
