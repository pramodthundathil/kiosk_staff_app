import { useWindowDimensions } from 'react-native';

export interface LayoutInfo {
  width: number;
  height: number;
  isLandscape: boolean;
  isPortrait: boolean;
  isTablet: boolean;
  isMobile: boolean;
  columnsCount: number;
}

export function useResponsiveLayout(): LayoutInfo {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isPortrait = !isLandscape;

  // Tablet threshold is generally 600dp shortest width
  const minDimension = Math.min(width, height);
  const isTablet = minDimension >= 600;
  const isMobile = !isTablet;

  let columnsCount = 1;
  if (isTablet) {
    columnsCount = isLandscape ? 4 : 3;
  } else {
    columnsCount = isLandscape ? 3 : 2;
  }

  return {
    width,
    height,
    isLandscape,
    isPortrait,
    isTablet,
    isMobile,
    columnsCount,
  };
}

export function scaleFont(size: number, width: number, isTablet: boolean): number {
  const baseWidth = isTablet ? 768 : 375;
  const scale = width / baseWidth;
  const newSize = size * scale;
  
  // Bound scaling to keep text legible and bounded
  const min = size * 0.85;
  const max = size * (isTablet ? 1.35 : 1.15);
  return Math.round(Math.min(Math.max(newSize, min), max));
}
