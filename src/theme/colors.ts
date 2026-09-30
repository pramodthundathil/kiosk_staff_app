/**
 * Centralized theme colors for Excel Earthing Staff Catalogue App.
 * Strictly derived from brand identity guidelines.
 */
export const colors = {
  primaryNavy: '#1E2B58',
  accentBlue: '#0D60AE',
  brandRed: '#C82333',
  amberGold: '#D97706',

  // Semantic mappings
  primary: '#1E2B58',
  secondary: '#0D60AE',
  danger: '#C82333',
  accent: '#D97706',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Surface & Backgrounds
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  navyDark: '#0B1329',
  navyCard: '#152042',

  // Typography
  textPrimary: '#172033',
  textSecondary: '#667085',
  textMuted: '#98A2B3',
  textInverted: '#FFFFFF',

  // Borders & Dividers
  border: '#E4E7EC',
  borderLight: '#F2F4F7',
  borderDark: 'rgba(255, 255, 255, 0.12)',

  // Interactive States
  hoverBg: 'rgba(13, 96, 174, 0.08)',
  activeBg: 'rgba(13, 96, 174, 0.15)',
  disabledBg: '#F2F4F7',
  disabledText: '#98A2B3',

  // WhatsApp
  whatsAppGreen: '#25D366',
  whatsAppDarkGreen: '#128C7E',
} as const;

export type ColorsType = typeof colors;
