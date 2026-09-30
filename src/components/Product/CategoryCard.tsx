import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Category } from '../../types/category';
import { colors, radii, shadows } from '../../theme';
import { AnimatedPressable } from '../Common/AnimatedPressable';
import { ChevronRight, Layers, Package, FolderTree } from 'lucide-react-native';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  width?: number | `${number}%`;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  width = '100%',
}) => {
  const subCount = category.subcategories_count || category.subcategories?.length || 0;
  const prodCount = category.products_count || 0;

  return (
    <AnimatedPressable style={[styles.card, { width }]} onPress={onPress}>
      <View style={styles.imageContainer}>
        {category.image_url ? (
          <Image
            source={{ uri: category.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Layers size={42} color={colors.accentBlue} strokeWidth={1.5} />
          </View>
        )}

        <View style={styles.badgeOverlay}>
          {prodCount > 0 && (
            <View style={styles.badgeNavy}>
              <Package size={11} color="#FFFFFF" />
              <Text style={styles.badgeNavyText}>{prodCount} Products</Text>
            </View>
          )}
          {subCount > 0 && (
            <View style={styles.badgeBlue}>
              <FolderTree size={11} color={colors.accentBlue} />
              <Text style={styles.badgeBlueText}>{subCount} Subcats</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={styles.name}>{category.name}</Text>
          <View style={styles.arrowCircle}>
            <ChevronRight size={16} color={colors.accentBlue} />
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.subCountText}>
            {subCount > 0 ? `${subCount} Subcategories` : 'Direct Catalogue Products'}
          </Text>
          <Text style={styles.viewLink}>View Category →</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 14,
    ...shadows.card,
  },
  imageContainer: {
    height: 140,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4FA',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  badgeNavy: {
    backgroundColor: colors.primaryNavy,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...shadows.subtle,
  },
  badgeNavyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  badgeBlue: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...shadows.subtle,
  },
  badgeBlueText: {
    color: colors.accentBlue,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryNavy,
    flex: 1,
    marginRight: 8,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 96, 174, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  subCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  viewLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentBlue,
  },
});

