import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/Header/AppHeader';
import { Input } from '../../components/Common/Input';
import { ProductCard } from '../../components/Product/ProductCard';
import { LoadingSkeleton } from '../../components/Common/LoadingSkeleton';
import { EmptyState } from '../../components/Common/EmptyState';
import { fetchProducts } from '../../api/products';
import { Product } from '../../types/product';
import { useResponsiveLayout } from '../../utils/responsive';
import { colors, radii } from '../../theme';
import { Search, Sparkles } from 'lucide-react-native';

export const SearchScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const layout = useResponsiveLayout();

  const initialQuery: string = route.params?.initialQuery || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await fetchProducts({ search: searchQuery });
      setResults(data);
    } catch (err) {
      console.warn('Search query error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search effect (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Fast Catalogue Search"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Input
            placeholder="Search products by name, code/SKU, category, or spec..."
            value={query}
            onChangeText={setQuery}
            autoFocus={!initialQuery}
            leftIcon={<Search size={18} color={colors.accentBlue} />}
            onClear={() => {
              setQuery('');
              setResults([]);
            }}
          />
        </View>

        {/* Loading Skeleton */}
        {isLoading ? (
          <View style={styles.skeletonGrid}>
            <LoadingSkeleton height={280} borderRadius={radii.lg} />
          </View>
        ) : hasSearched && results.length === 0 ? (
          <EmptyState
            title="No catalogue items found"
            description={`No products match "${query}". Try searching by SKU code (e.g. CBE-3000) or product name.`}
          />
        ) : (
          <>
            {results.length > 0 && (
              <Text style={styles.resultCount}>
                Found {results.length} matching products for "{query}"
              </Text>
            )}

            <View style={styles.grid}>
              {results.map((prod) => (
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
  searchBox: {
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginBottom: 14,
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
