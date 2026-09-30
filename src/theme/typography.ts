/**
 * Typography system that scales between mobile and tablet devices.
 */
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    display: 32,
    h1: 26,
    h2: 22,
    h3: 18,
    h4: 16,
    body: 15,
    bodySmall: 13,
    caption: 12,
    label: 11,
  },
  lineHeight: {
    display: 40,
    h1: 34,
    h2: 28,
    h3: 24,
    h4: 22,
    body: 22,
    bodySmall: 18,
    caption: 16,
    label: 14,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};
