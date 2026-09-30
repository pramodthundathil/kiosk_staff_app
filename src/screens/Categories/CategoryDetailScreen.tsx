import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/Header/AppHeader';
import { SubCategoryCard } from '../../components/Product/SubCategoryCard';
import { ProductCard } from '../../components/Product/ProductCard';
import { LoadingSkeleton } from '../../components/Common/LoadingSkeleton';
import { EmptyState } from '../../components/Common/EmptyState';
import { Category, SubCategorySimple } from '../../types/category';
import { Product } from '../../types/product';
import { fetchProducts } from '../../api/products';
import { fetchSubCategories } from '../../api/categories';
import { colors, radii, shadows } from '../../theme';
import { useResponsiveLayout } from '../../utils/responsive';
import { Layers, Package, Sparkles, FolderTree, Filter, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { AnimatedPressable } from '../../components/Common/AnimatedPressable';

export const CategoryDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const layout = useResponsiveLayout();

  const initialCategory: Category = route.params?.category;

  const [category, setCategory] = useState<Category | null>(initialCategory || null);
  const [subcategories, setSubcategories] = useState<SubCategorySimple[]>(
    initialCategory?.subcategories || []
  );
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [selectedSubCatId, setSelectedSubCatId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCategoryData = async () => {
    if (!initialCategory?.id) return;
    setIsLoading(true);
    try {
      // Fetch subcategories & products concurrently
      const [fetchedSubs, fetchedProds] = await Promise.all([
        fetchSubCategories(initialCategory.id),
        fetchProducts({ category_id: initialCategory.id }),
      ]);

      if (fetchedSubs && fetchedSubs.length > 0) {
        setSubcategories(fetchedSubs);
      } else if (initialCategory.subcategories) {
        setSubcategories(initialCategory.subcategories);
      }

      setCategoryProducts(fetchedProds);
    } catch (err) {
      console.warn('Failed to load category data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategoryData();
  }, [initialCategory?.id]);

  if (!initialCategory) return null;

  const activeCategory = category || initialCategory;
  const hasSubcategories = subcategories.length > 0;

  // Filter products by selected subcategory pill
  const filteredProducts = selectedSubCatId === 'all'
    ? categoryProducts
    : categoryProducts.filter((p) => {
        const subId = p.sub_category_id || p.sub_category?.id;
        return String(subId) === String(selectedSubCatId);
      });

  const selectedSubCategoryObj = subcategories.find((s) => String(s.id) === String(selectedSubCatId));

  return (
    <View style={styles.container}>
      <AppHeader
        title={activeCategory.name}
        showBack={true}
        onBack={() => navigation.goBack()}
        showSearch={true}
        onSearchPress={() => navigation.navigate('Search')}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadCategoryData();
            }}
          />
        }
      >
        {/* Category Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.bannerHeader}>
            <View style={styles.iconCircle}>
              <Layers size={28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryCode}>CATEGORY CODE: {activeCategory.code || 'CAT'}</Text>
              <Text style={styles.categoryTitle}>{activeCategory.name}</Text>
            </View>
          </View>

          {activeCategory.description ? (
            <Text style={styles.categoryDesc}>{activeCategory.description}</Text>
          ) : null}

          {/* Stats Badges Row */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Package size={13} color={colors.amberGold} />
              <Text style={styles.statChipText}>
                {categoryProducts.length || activeCategory.products_count || 0} Total Products
              </Text>
            </View>

            {hasSubcategories && (
              <View style={styles.statChip}>
                <FolderTree size={13} color="#FFFFFF" />
                <Text style={styles.statChipText}>
                  {subcategories.length} Subcategories
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Subcategories Section */}
        {hasSubcategories && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FolderTree size={20} color={colors.accentBlue} />
              <Text style={styles.sectionTitle}>Subcategories & Product Lines</Text>
            </View>

            <View style={styles.subGrid}>
              {subcategories.map((sub) => {
                const isSelected = String(sub.id) === String(selectedSubCatId);
                return (
                  <View
                    key={sub.id}
                    style={{
                      width: layout.isTablet ? '48%' : '100%',
                    }}
                  >
                    <SubCategoryCard
                      subCategory={sub}
                      isSelected={isSelected}
                      onPress={() => {
                        // Toggle subcategory filter or navigate to subcategory screen if tapped again
                        if (isSelected) {
                          navigation.navigate('SubCategoryProducts', {
                            subCategory: sub,
                            categoryName: activeCategory.name,
                          });
                        } else {
                          setSelectedSubCatId(String(sub.id));
                        }
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Interactive Subcategory Filter Pills Bar */}
        {hasSubcategories && (
          <View style={styles.filterBarSection}>
            <View style={styles.filterHeader}>
              <Filter size={16} color={colors.primaryNavy} />
              <Text style={styles.filterTitle}>Filter Catalogue by Line:</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.filterPill,
                  selectedSubCatId === 'all' && styles.filterPillActive,
                ]}
                onPress={() => setSelectedSubCatId('all')}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedSubCatId === 'all' && styles.filterPillTextActive,
                  ]}
                >
                  All Products ({categoryProducts.length})
                </Text>
              </TouchableOpacity>

              {subcategories.map((sub) => {
                const isSubSelected = String(sub.id) === String(selectedSubCatId);
                const subProdsCount = categoryProducts.filter(
                  (p) => String(p.sub_category_id || p.sub_category?.id) === String(sub.id)
                ).length;

                return (
                  <TouchableOpacity
                    key={sub.id}
                    activeOpacity={0.8}
                    style={[
                      styles.filterPill,
                      isSubSelected && styles.filterPillActive,
                    ]}
                    onPress={() => setSelectedSubCatId(String(sub.id))}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isSubSelected && styles.filterPillTextActive,
                      ]}
                    >
                      {sub.name} ({subProdsCount || sub.products_count || 0})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Products Grid Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color={colors.amberGold} />
            <Text style={styles.sectionTitle}>
              {selectedSubCategoryObj
                ? `${selectedSubCategoryObj.name} Products (${filteredProducts.length})`
                : `Category Products (${filteredProducts.length})`}
            </Text>
          </View>

          {isLoading && categoryProducts.length === 0 ? (
            <View style={styles.skeletonGrid}>
              <LoadingSkeleton height={260} borderRadius={radii.lg} style={{ marginBottom: 12 }} />
              <LoadingSkeleton height={260} borderRadius={radii.lg} style={{ marginBottom: 12 }} />
            </View>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              description="No catalogue products are available under this subcategory filter."
            />
          ) : (
            <View style={styles.productGrid}>
              {filteredProducts.map((prod) => (
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
                    onPress={() =>
                      navigation.navigate('ProductDetail', { productId: prod.id, product: prod })
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </View>
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
  heroBanner: {
    backgroundColor: colors.primaryNavy,
    borderRadius: radii.xl,
    padding: 20,
    marginBottom: 20,
    ...shadows.card,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCode: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.amberGold,
    letterSpacing: 0.6,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  categoryDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    gap: 6,
  },
  statChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  subGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterBarSection: {
    marginBottom: 20,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  pillScroll: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  skeletonGrid: {
    marginVertical: 10,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

