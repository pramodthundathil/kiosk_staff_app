import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/Header/AppHeader';
import { ProductCard } from '../../components/Product/ProductCard';
import { LoadingSkeleton } from '../../components/Common/LoadingSkeleton';
import { EmptyState } from '../../components/Common/EmptyState';
import { fetchProducts } from '../../api/products';
import { Product } from '../../types/product';
import { SubCategorySimple } from '../../types/category';
import { useResponsiveLayout } from '../../utils/responsive';
import { colors, radii } from '../../theme';
import { Input } from '../../components/Common/Input';
import { Search } from 'lucide-react-native';

export const SubCategoryProductsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const layout = useResponsiveLayout();

  const subCategory: SubCategorySimple = route.params?.subCategory;
  const categoryName: string = route.params?.categoryName || subCategory?.category_name || 'Category';

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (subCategory?.id) {
        const data = await fetchProducts({ sub_category_id: subCategory.id });
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (err) {
      console.warn('Failed to load subcategory products:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subCategory?.id]);

  useEffect(() => {
    if (!filterQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const q = filterQuery.toLowerCase().trim();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q))
        )
      );
    }
  }, [filterQuery, products]);

  return (
    <View style={styles.container}>
      <AppHeader
        title={subCategory?.name || 'Subcategory'}
        showBack={true}
        onBack={() => navigation.goBack()}
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
          <Text style={styles.categoryBreadcrumb}>{categoryName} →</Text>
          <Text style={styles.subTitle}>{subCategory?.name}</Text>
          {subCategory?.description && <Text style={styles.subDesc}>{subCategory.description}</Text>}
          <Text style={styles.countText}>{filteredProducts.length} Catalogue Items Available</Text>
        </View>

        {/* Local Filter Bar */}
        <Input
          placeholder={`Filter inside ${subCategory?.name || 'subcategory'}...`}
          value={filterQuery}
          onChangeText={setFilterQuery}
          leftIcon={<Search size={16} color={colors.accentBlue} />}
          onClear={() => setFilterQuery('')}
        />

        {isLoading && products.length === 0 ? (
          <View style={styles.skeletonGrid}>
            <LoadingSkeleton height={280} borderRadius={radii.lg} />
          </View>
        ) : filteredProducts.length === 0 ? (
          <EmptyState title="No products found" description="No products match the selected subcategory or filter." />
        ) : (
          <View style={styles.grid}>
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
                  onPress={() => navigation.navigate('ProductDetail', { productId: prod.id, product: prod })}
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
    padding: 16,
    borderRadius: radii.lg,
    marginBottom: 14,
  },
  categoryBreadcrumb: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.amberGold,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  subDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentBlue,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  skeletonGrid: {
    marginVertical: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
