import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, shadows } from '../../theme';
import { Building2, ShieldCheck } from 'lucide-react-native';

interface ApplicableAreasListProps {
  areas?: string[] | null;
}

export const ApplicableAreasList: React.FC<ApplicableAreasListProps> = ({ areas }) => {
  if (!areas || !Array.isArray(areas) || areas.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Building2 size={18} color={colors.accentBlue} />
        <Text style={styles.title}>Applicable Areas & Industries</Text>
      </View>

      <View style={styles.chipsGrid}>
        {areas.map((area, index) => (
          <View key={index} style={styles.chip}>
            <ShieldCheck size={14} color={colors.accentBlue} />
            <Text style={styles.chipText}>{area}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginVertical: 10,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(13, 96, 174, 0.2)',
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
});
