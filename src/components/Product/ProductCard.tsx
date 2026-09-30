import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Product } from '../../types/product';
import { colors, radii, shadows } from '../../theme';
import { AnimatedPressable } from '../Common/AnimatedPressable';
import { Badge } from '../Common/Badge';
import { Box, Layers, ArrowRight } from 'lucide-react-native';
import { truncateText } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  width?: number | `${number}%`;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  width = '100%',
}) => {
  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const variantCount = product.variants ? product.variants.length : 0;
  const has3D = product.media_assets?.some((a) => a.asset_type === 'THREE_D');

  return (
    <AnimatedPressable style={[styles.card, { width }]} onPress={onPress}>
      {/* Media Header */}
      <View style={styles.mediaContainer}>
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Box size={40} color={colors.textMuted} strokeWidth={1.5} />
          </View>
        )}

        <View style={styles.badgeContainer}>
          {hasVariants && (
            <Badge
              label={`${variantCount} Variants`}
              variant="accent"
              size="sm"
            />
          )}
          {has3D && (
            <Badge
              label="3D Model"
              variant="amber"
              size="sm"
            />
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.sku} numberOfLines={1}>
          {product.sku || 'EXE-PRODUCT'}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>

        {product.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {truncateText(product.description, 70)}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <ArrowRight size={14} color={colors.accentBlue} />
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    height: 290, // Fixed height to prevent layout break from long text
    justifyContent: 'space-between',
    ...shadows.card,
  },
  mediaContainer: {
    height: 140,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  content: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  sku: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentBlue,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentBlue,
  },
});
