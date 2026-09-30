import React from 'react';
import { Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { colors, radii, shadows } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'whatsApp';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'md',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primaryNavy, text: '#FFFFFF', border: 'transparent' };
      case 'secondary':
        return { bg: colors.accentBlue, text: '#FFFFFF', border: 'transparent' };
      case 'danger':
        return { bg: colors.brandRed, text: '#FFFFFF', border: 'transparent' };
      case 'outline':
        return { bg: 'transparent', text: colors.primaryNavy, border: colors.border };
      case 'whatsApp':
        return { bg: colors.whatsAppGreen, text: '#FFFFFF', border: 'transparent' };
      default:
        return { bg: colors.primaryNavy, text: '#FFFFFF', border: 'transparent' };
    }
  };

  const { bg, text, border } = getStyles();

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: disabled ? colors.disabledBg : bg, borderColor: border },
        size === 'sm' && styles.sizeSm,
        size === 'lg' && styles.sizeLg,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: disabled ? colors.disabledText : text },
              size === 'sm' && styles.textSm,
              size === 'lg' && styles.textLg,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 8,
    ...shadows.subtle,
  },
  sizeSm: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
  },
  sizeLg: {
    minHeight: 56,
    paddingHorizontal: 24,
    borderRadius: radii.lg,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 13,
  },
  textLg: {
    fontSize: 17,
  },
});
