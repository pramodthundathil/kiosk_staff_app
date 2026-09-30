import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ProductVariant } from '../../types/product';
import { colors, radii, shadows } from '../../theme';
import { AnimatedPressable } from '../Common/AnimatedPressable';
import { Check, Layers } from 'lucide-react-native';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId?: string | null;
  onSelectVariant: (variant: ProductVariant | null) => void;
  mainProductName: string;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onSelectVariant,
  mainProductName,
}) => {
  if (!variants || variants.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Layers size={16} color={colors.accentBlue} />
        <Text style={styles.headerTitle}>Select Product Variant ({variants.length + 1} options)</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
        {/* Main Product Choice */}
        <AnimatedPressable
          style={[
            styles.variantChip,
            !selectedVariantId && styles.selectedChip,
          ]}
          onPress={() => onSelectVariant(null)}
        >
          <View style={styles.chipHeader}>
            <Text style={[styles.variantName, !selectedVariantId && styles.selectedText]} numberOfLines={1}>
              Standard / Main
            </Text>
            {!selectedVariantId && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <Text style={[styles.variantSku, !selectedVariantId && styles.selectedSubText]}>
            Main Base Item
          </Text>
        </AnimatedPressable>

        {/* Variant Items */}
        {variants.map((v) => {
          const isSelected = v.id === selectedVariantId;
          return (
            <AnimatedPressable
              key={v.id}
              style={[
                styles.variantChip,
                isSelected && styles.selectedChip,
              ]}
              onPress={() => onSelectVariant(v)}
            >
              <View style={styles.chipHeader}>
                <Text style={[styles.variantName, isSelected && styles.selectedText]} numberOfLines={1}>
                  {v.name}
                </Text>
                {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={[styles.variantSku, isSelected && styles.selectedSubText]}>
                CODE: {v.sku}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  scrollList: {
    gap: 10,
  },
  variantChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: colors.border,
    minWidth: 120,
  },
  selectedChip: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.primaryNavy,
  },
  chipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 4,
  },
  variantName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  variantSku: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectedSubText: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
