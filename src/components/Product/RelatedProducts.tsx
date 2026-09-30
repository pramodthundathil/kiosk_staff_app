import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Product } from '../../types/product';
import { colors, radii, shadows } from '../../theme';
import { AnimatedPressable } from '../Common/AnimatedPressable';
import { Box, Sparkles } from 'lucide-react-native';

interface RelatedProductsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ products, onSelectProduct }) => {
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={16} color={colors.accentBlue} />
        <Text style={styles.title}>Related Catalogue Products</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {products.map((item) => (
          <AnimatedPressable
            key={item.id}
            style={styles.card}
            onPress={() => onSelectProduct(item)}
          >
            <View style={styles.imageBox}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
              ) : (
                <Box size={24} color={colors.textMuted} />
              )}
            </View>
            <Text style={styles.sku} numberOfLines={1}>{item.sku}</Text>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          </AnimatedPressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  list: {
    gap: 12,
  },
  card: {
    width: 150,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    ...shadows.subtle,
  },
  imageBox: {
    height: 90,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  sku: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentBlue,
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 16,
  },
});
