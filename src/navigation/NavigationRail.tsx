import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Home, Layers, Search, Send, User, LogOut } from 'lucide-react-native';
import { colors, radii, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import { AnimatedPressable } from '../components/Common/AnimatedPressable';

interface NavigationRailProps {
  currentTab: string;
  onSelectTab: (tabName: string) => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({ currentTab, onSelectTab }) => {
  const { logout } = useAuth();

  const items = [
    { name: 'HomeTab', label: 'Home', icon: Home },
    { name: 'CategoriesTab', label: 'Categories', icon: Layers },
    { name: 'SearchTab', label: 'Search', icon: Search },
    { name: 'SharedTab', label: 'Shared Log', icon: Send },
    { name: 'ProfileTab', label: 'Profile', icon: User },
  ];

  return (
    <View style={styles.rail}>
      {/* Brand Header */}
      <View style={styles.brandBox}>
        <Image
          source={require('../../assets/excel_logo_white.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>EXCEL</Text>
      </View>

      {/* Nav Items */}
      <View style={styles.menuContainer}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.name;

          return (
            <AnimatedPressable
              key={item.name}
              style={[styles.railItem, isActive && styles.activeRailItem]}
              onPress={() => onSelectTab(item.name)}
            >
              <Icon size={22} color={isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)'} />
              <Text style={[styles.itemLabel, isActive && styles.activeItemLabel]}>
                {item.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      {/* Footer / Logout */}
      <View style={styles.footer}>
        <AnimatedPressable style={styles.logoutBtn} onPress={logout}>
          <LogOut size={20} color={colors.brandRed} />
        </AnimatedPressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rail: {
    width: 92,
    backgroundColor: colors.primaryNavy,
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    ...shadows.card,
  },
  brandBox: {
    alignItems: 'center',
    gap: 4,
  },
  logoImage: {
    width: 44,
    height: 40,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  menuContainer: {
    gap: 16,
    width: '100%',
    alignItems: 'center',
  },
  railItem: {
    width: 70,
    height: 60,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  activeRailItem: {
    backgroundColor: colors.accentBlue,
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  activeItemLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(200, 35, 51, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
