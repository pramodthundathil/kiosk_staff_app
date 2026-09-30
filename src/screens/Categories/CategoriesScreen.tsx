import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/Header/AppHeader';
import { Input } from '../../components/Common/Input';
import { CategoryCard } from '../../components/Product/CategoryCard';
import { LoadingSkeleton } from '../../components/Common/LoadingSkeleton';
import { EmptyState } from '../../components/Common/EmptyState';
import { fetchCategories } from '../../api/categories';
import { Category } from '../../types/category';
import { useResponsiveLayout } from '../../utils/responsive';
import { colors, radii, shadows } from '../../theme';
import { Layers, Search, FolderTree } from 'lucide-react-native';

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const layout = useResponsiveLayout();

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
      setFilteredCategories(data);
    } catch (e) {
      console.warn('Failed to load categories:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
    } else {
      const q = searchQuery.toLowerCase().trim();
      setFilteredCategories(
        categories.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q) ||
            (c.description && c.description.toLowerCase().includes(q))
        )
      );
    }
  }, [searchQuery, categories]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Product Categories"
        showSearch={true}
        onSearchPress={() => navigation.navigate('Search')}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
        }
      >
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerHeader}>
            <FolderTree size={28} color={colors.amberGold} />
            <Text style={styles.bannerTitle}>Catalogue Categories</Text>
          </View>
          <Text style={styles.bannerDesc}>
            Select a primary category to view subcategories and explore products.
          </Text>
        </View>

        {/* Live Filter Bar */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Filter categories by name or code..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={16} color={colors.accentBlue} />}
            onClear={() => setSearchQuery('')}
          />
        </View>

        {isLoading && categories.length === 0 ? (
          <View style={styles.skeletonContainer}>
            <LoadingSkeleton height={180} borderRadius={radii.xl} style={{ marginBottom: 16 }} />
            <LoadingSkeleton height={180} borderRadius={radii.xl} style={{ marginBottom: 16 }} />
          </View>
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            title="No categories found"
            description="No categories match your search term."
          />
        ) : (
          <View style={styles.grid}>
            {filteredCategories.map((cat) => (
              <View
                key={cat.id}
                style={{
                  width: layout.isTablet
                    ? (layout.isLandscape ? '32%' : '48%')
                    : (layout.isLandscape ? '48%' : '100%'),
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
  banner: {
    backgroundColor: colors.primaryNavy,
    borderRadius: radii.xl,
    padding: 18,
    marginBottom: 14,
    ...shadows.card,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: 17,
  },
  searchContainer: {
    marginBottom: 16,
  },
  skeletonContainer: {
    marginVertical: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
});

