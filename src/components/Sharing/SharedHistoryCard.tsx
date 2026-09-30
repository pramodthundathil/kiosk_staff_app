import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SharedProductLog } from '../../types/share';
import { colors, radii, shadows } from '../../theme';
import { Send, Clock, UserCheck, Shield } from 'lucide-react-native';
import { formatDate } from '../../utils/formatters';

interface SharedHistoryCardProps {
  item: SharedProductLog;
}

export const SharedHistoryCard: React.FC<SharedHistoryCardProps> = ({ item }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Send size={14} color="#FFFFFF" />
          <Text style={styles.badgeText}>WhatsApp Shared</Text>
        </View>

        <View style={styles.timeBox}>
          <Clock size={12} color={colors.textMuted} />
          <Text style={styles.timeText}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>

      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.sku}>SKU: {item.productSku}</Text>

      {item.variantName ? (
        <Text style={styles.variant}>Variant: {item.variantName}</Text>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.phoneBox}>
          <Shield size={14} color={colors.accentBlue} />
          <Text style={styles.phoneText}>
            Customer: {item.customerName ? `${item.customerName} (${item.maskedPhone})` : item.maskedPhone}
          </Text>
        </View>


        <View style={styles.staffBox}>
          <UserCheck size={14} color={colors.textSecondary} />
          <Text style={styles.staffText}>Staff: {item.staffUsername}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
    ...shadows.subtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.whatsAppGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sku: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentBlue,
    marginTop: 2,
  },
  variant: {
    fontSize: 12,
    color: colors.amberGold,
    fontWeight: '600',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  staffBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  staffText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
