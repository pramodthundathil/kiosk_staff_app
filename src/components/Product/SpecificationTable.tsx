import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SpecificationsMap } from '../../types/product';
import { formatSpecificationValue } from '../../utils/formatters';
import { colors, radii, shadows } from '../../theme';
import { Sliders } from 'lucide-react-native';

interface SpecificationTableProps {
  specifications?: SpecificationsMap | null;
}

export const SpecificationTable: React.FC<SpecificationTableProps> = ({ specifications }) => {
  if (!specifications || typeof specifications !== 'object') return null;

  const entries = Object.entries(specifications);
  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sliders size={18} color={colors.accentBlue} />
        <Text style={styles.title}>Technical Specifications</Text>
      </View>

      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={[styles.cell, styles.headerCell, styles.keyCol]}>Specification</Text>
          <Text style={[styles.cell, styles.headerCell, styles.valCol]}>Value / Parameter</Text>
        </View>

        {/* Table Rows */}
        {entries.map(([key, rawValue], index) => {
          const displayVal = formatSpecificationValue(rawValue);
          const isEven = index % 2 === 0;

          return (
            <View
              key={key}
              style={[
                styles.row,
                isEven ? styles.evenRow : styles.oddRow,
                index === entries.length - 1 && styles.lastRow,
              ]}
            >
              <Text style={[styles.cell, styles.keyText, styles.keyCol]}>{key}</Text>
              <Text style={[styles.cell, styles.valText, styles.valCol]}>{displayVal}</Text>
            </View>
          );
        })}
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
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 4,
  },
  tableHeader: {
    backgroundColor: colors.primaryNavy,
  },
  evenRow: {
    backgroundColor: '#FFFFFF',
  },
  oddRow: {
    backgroundColor: '#F8FAFC',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerCell: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  keyCol: {
    flex: 1,
    paddingRight: 8,
  },
  valCol: {
    flex: 1.3,
    paddingLeft: 8,
  },
  keyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  valText: {
    fontSize: 13,
    color: colors.accentBlue,
    fontWeight: '700',
  },
});
