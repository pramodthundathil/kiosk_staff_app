import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SubCategorySimple } from '../../types/category';
import { colors, radii, shadows } from '../../theme';
import { AnimatedPressable } from '../Common/AnimatedPressable';
import { Layers, ChevronRight, Package } from 'lucide-react-native';

interface SubCategoryCardProps {
  subCategory: SubCategorySimple;
  onPress: () => void;
  width?: number | `${number}%`;
  isSelected?: boolean;
}

export const SubCategoryCard: React.FC<SubCategoryCardProps> = ({
  subCategory,
  onPress,
  width = '100%',
  isSelected = false,
}) => {
  const prodCount = subCategory.products_count || 0;

  return (
    <AnimatedPressable
      style={[
        styles.card,
        { width },
        isSelected && styles.cardSelected,
      ]}
      onPress={onPress}
    >
      <View style={styles.imageBox}>
        {subCategory.image_url && subCategory.image_url.trim().length > 0 ? (
          <Image source={{ uri: subCategory.image_url.trim() }} style={styles.image} resizeMode="contain" />
        ) : (
          <Layers size={40} color={isSelected ? '#FFFFFF' : colors.accentBlue} />
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[styles.name, isSelected && styles.nameSelected]}>
            {subCategory.name}
          </Text>
        </View>

        <View style={styles.tagsRow}>
          {subCategory.code ? (
            <View style={[styles.codeBadge, isSelected && styles.codeBadgeSelected]}>
              <Text style={[styles.codeText, isSelected && styles.codeTextSelected]}>
                {subCategory.code}
              </Text>
            </View>
          ) : null}

          {prodCount > 0 && (
            <View style={[styles.countBadge, isSelected && styles.countBadgeSelected]}>
              <Package size={13} color={isSelected ? '#FFFFFF' : colors.primaryNavy} />
              <Text style={[styles.countText, isSelected && styles.countTextSelected]}>
                {prodCount} Items
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.arrowBox, isSelected && styles.arrowBoxSelected]}>
        <ChevronRight size={22} color={isSelected ? '#FFFFFF' : colors.accentBlue} />
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 14,
    gap: 16,
    ...shadows.card,
  },
  cardSelected: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.accentBlue,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: radii.lg,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryNavy,
    flex: 1,
  },
  nameSelected: {
    color: '#FFFFFF',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeBadge: {
    backgroundColor: 'rgba(13, 96, 174, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  codeBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  codeTextSelected: {
    color: colors.amberGold,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    gap: 5,
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  countTextSelected: {
    color: '#FFFFFF',
  },
  arrowBox: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(13, 96, 174, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBoxSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});


