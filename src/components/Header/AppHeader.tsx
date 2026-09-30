import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ChevronLeft, Search, User } from 'lucide-react-native';
import { colors, radii, shadows } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { AnimatedPressable } from '../Common/AnimatedPressable';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearchPress?: () => void;
  showProfile?: boolean;
  onProfilePress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showSearch = true,
  onSearchPress,
  showProfile = true,
  onProfilePress,
}) => {
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBack && onBack ? (
          <AnimatedPressable style={styles.backBtn} onPress={onBack}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </AnimatedPressable>
        ) : (
          <View style={styles.brandContainer}>
            <Image
              source={require('../../../assets/excel_logo_white.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

        )}
        {title && <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>}
      </View>

      <View style={styles.rightSection}>
        {showSearch && onSearchPress && (
          <AnimatedPressable style={styles.iconBtn} onPress={onSearchPress}>
            <Search size={20} color="#FFFFFF" />
          </AnimatedPressable>
        )}

        {showProfile && onProfilePress && user && (
          <AnimatedPressable style={styles.profileBtn} onPress={onProfilePress}>
            <User size={18} color={colors.accentBlue} />
            <Text numberOfLines={1} style={styles.staffName}>
              {user.username}
            </Text>
          </AnimatedPressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: colors.primaryNavy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    ...shadows.card,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 95,
    height: 38,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.amberGold,
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  staffName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryNavy,
    maxWidth: 90,
  },
});
