import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import Animated, { FadeInDown, useReducedMotion, Easing } from 'react-native-reanimated';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/Header/AppHeader';
import { ProductCard } from '../../components/Product/ProductCard';
import { LoadingSkeleton } from '../../components/Common/LoadingSkeleton';
import { EmptyState } from '../../components/Common/EmptyState';
import { fetchProducts } from '../../api/products';
import { Product } from '../../types/product';
import { SubCategorySimple } from '../../types/category';
import { useResponsiveLayout } from '../../utils/responsive';
import { colors, radii, shadows } from '../../theme';
import { Input } from '../../components/Common/Input';
import { Search, Layers } from 'lucide-react-native';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const BANNER_ENTER = FadeInDown.duration(250).easing(EASE_OUT);

const ProductGridItem: React.FC<{
  product: Product;
  index: number;
  width: number | `${number}%`;
  reduced: boolean;
  onPress: () => void;
}> = ({ product, index, width, reduced, onPress }) => {
  const entering = useMemo(
    () =>
      reduced
        ? undefined
        : FadeInDown.duration(250)
            .delay(Math.min(index, 10) * 40)
            .easing(EASE_OUT),
    [index, reduced]
  );

  return (
    <Animated.View entering={entering} style={{ width }}>
      <ProductCard product={product} onPress={onPress} />
    </Animated.View>
  );
};

export const SubCategoryProductsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const layout = useResponsiveLayout();
  const reduced = useReducedMotion();

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

  const itemWidth: `${number}%` = layout.isTablet
    ? layout.isLandscape
      ? '24%'
      : '32%'
    : '48%';

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
        <Animated.View entering={reduced ? undefined : BANNER_ENTER} style={styles.banner}>
          <View style={styles.bannerTopRow}>
            <View style={styles.bannerIconBox}>
              {subCategory?.image_url ? (
                <Image
                  source={{ uri: subCategory.image_url }}
                  style={styles.bannerImage}
                  resizeMode="contain"
                />
              ) : (
                <Layers size={30} color="#FFFFFF" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryBreadcrumb}>{categoryName} →</Text>
              <Text style={styles.subTitle}>{subCategory?.name}</Text>
            </View>
          </View>
          {subCategory?.description ? <Text style={styles.subDesc}>{subCategory.description}</Text> : null}
          <Text style={styles.countText}>{filteredProducts.length} Catalogue Items Available</Text>
        </Animated.View>

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
            {filteredProducts.map((prod, idx) => (
              <ProductGridItem
                key={prod.id}
                product={prod}
                index={idx}
                width={itemWidth}
                reduced={reduced}
                onPress={() => navigation.navigate('ProductDetail', { productId: prod.id, product: prod })}
              />
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
    padding: 18,
    borderRadius: radii.xl,
    marginBottom: 16,
    ...shadows.card,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerIconBox: {
    width: 58,
    height: 58,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
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
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 8,
    lineHeight: 18,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentBlue,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginTop: 12,
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

