import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  Image,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/Header/AppHeader';
import { Input } from '../../components/Common/Input';
import { CategoryCard } from '../../components/Product/CategoryCard';
import { ProductCard } from '../../components/Product/ProductCard';
import { LoadingSkeleton } from '../../components/Common/LoadingSkeleton';
import { fetchCategories } from '../../api/categories';
import { fetchProducts } from '../../api/products';
import { Category } from '../../types/category';
import { Product } from '../../types/product';
import { useResponsiveLayout } from '../../utils/responsive';
import { colors, radii, shadows } from '../../theme';
import { getRecentlyViewedProducts, getCachedCategories, setCachedCategories } from '../../utils/storage';
import { Search, Sparkles, Layers, History, Shield, Zap } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const layout = useResponsiveLayout();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const cached = await getCachedCategories();
      if (cached) setCategories(cached);

      const [catsData, prodsData, recentsData] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        getRecentlyViewedProducts(),
      ]);

      setCategories(catsData);
      setCachedCategories(catsData).catch(() => {});
      setFeaturedProducts(prodsData.slice(0, 8));
      setRecentProducts(recentsData);
    } catch (err) {
      console.warn('Dashboard load notice:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { initialQuery: searchQuery });
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        showSearch={true}
        onSearchPress={() => navigation.navigate('Search')}
        showProfile={true}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboardData(); }} />
        }
      >
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.welcomeSubtitle}>Staff Sales Demonstration Mode</Text>
            <Text style={styles.welcomeTitle}>Welcome back, {user?.username || 'Representative'}</Text>
            <Text style={styles.welcomeDesc}>Demonstrate Excel Earthing products and share specifications instantly.</Text>
          </View>
          <View style={styles.bannerBadge}>
            <Image
              source={require('../../../assets/excel_since_logo.png')}
              style={styles.sinceLogo}
              resizeMode="contain"
            />
          </View>
        </View>


        {/* Global Fast Search Input */}
        <View style={styles.searchSection}>
          <Input
            placeholder="Search by product name, SKU, variant, spec (e.g. Copper Electrode)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            leftIcon={<Search size={18} color={colors.accentBlue} />}
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Main Categories Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleBox}>
            <Layers size={20} color={colors.accentBlue} />
            <Text style={styles.sectionTitle}>Product Categories</Text>
          </View>
        </View>

        {isLoading && categories.length === 0 ? (
          <View style={styles.skeletonGrid}>
            <LoadingSkeleton height={140} borderRadius={radii.lg} style={{ marginBottom: 16 }} />
            <LoadingSkeleton height={140} borderRadius={radii.lg} style={{ marginBottom: 16 }} />
          </View>
        ) : (
          <View style={styles.gridRow}>
            {categories.map((cat) => (
              <View
                key={cat.id}
                style={{
                  width: layout.isTablet ? (layout.isLandscape ? '32%' : '48%') : '100%',
                }}
              >
                <CategoryCard
                  category={cat}
                  onPress={() => navigation.navigate('CategoryDetail', { category: cat })}
                />
              </View>
            ))}
          </View>
        )}

        {/* Featured Catalogue Products */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleBox}>
            <Sparkles size={20} color={colors.amberGold} />
            <Text style={styles.sectionTitle}>Featured Demonstration Products</Text>
          </View>
        </View>

        {isLoading && featuredProducts.length === 0 ? (
          <View style={styles.skeletonGrid}>
            <LoadingSkeleton height={280} borderRadius={radii.lg} />
          </View>
        ) : (
          <View style={styles.gridRow}>
            {featuredProducts.map((prod) => (
              <View
                key={prod.id}
                style={{
                  width: layout.isTablet
                    ? (layout.isLandscape ? '24%' : '32%')
                    : (layout.isLandscape ? '48%' : '48%'),
                }}
              >
                <ProductCard
                  product={prod}
                  onPress={() => navigation.navigate('ProductDetail', { productId: prod.id, product: prod })}
                />
              </View>
            ))}
          </View>
        )}

        {/* Recently Viewed Products */}
        {recentProducts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleBox}>
                <History size={20} color={colors.primaryNavy} />
                <Text style={styles.sectionTitle}>Recently Demonstrated Products</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentList}>
              {recentProducts.map((prod) => (
                <View key={prod.id} style={{ width: 180 }}>
                  <ProductCard
                    product={prod}
                    onPress={() => navigation.navigate('ProductDetail', { productId: prod.id, product: prod })}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeBanner: {
    backgroundColor: colors.primaryNavy,
    borderRadius: radii.xl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    ...shadows.card,
  },
  welcomeSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.amberGold,
    letterSpacing: 0.6,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  welcomeDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  bannerBadge: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  sinceLogo: {
    width: 56,
    height: 56,
  },

  searchSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    marginVertical: 14,
  },
  sectionTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skeletonGrid: {
    marginVertical: 10,
  },
  recentList: {
    gap: 12,
    paddingVertical: 6,
  },
});
