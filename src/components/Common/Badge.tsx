import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii } from '../../theme';

export type BadgeVariant = 'navy' | 'accent' | 'amber' | 'danger' | 'success' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'accent',
  icon,
  size = 'md',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'navy':
        return { bg: '#1E2B58', text: '#FFFFFF' };
      case 'accent':
        return { bg: 'rgba(13, 96, 174, 0.12)', text: '#0D60AE' };
      case 'amber':
        return { bg: 'rgba(217, 119, 6, 0.12)', text: '#D97706' };
      case 'danger':
        return { bg: 'rgba(200, 35, 51, 0.12)', text: '#C82333' };
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981' };
      default:
        return { bg: '#F2F4F7', text: '#344054' };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'sm' && styles.badgeSm]}>
      {icon}
      <Text style={[styles.text, { color: text }, size === 'sm' && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
});
