// components/responsive/responsive.js
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

// Tailwind-like breakpoints
export const BREAKPOINTS = { md: 640, lg: 1024, xl: 1280 };

/** Returns flags + width/height that update on resize/orientation */
export function useBreakpoints() {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const bp = {
      width,
      height,
      sm: width < BREAKPOINTS.md,
      md: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      lg: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
      xl: width >= BREAKPOINTS.xl,
    };
    bp.isMobile = bp.sm;
    bp.isTablet = bp.md;
    bp.isDesktop = bp.lg || bp.xl;
    return bp;
  }, [width, height]);
}

/** Pick a value by breakpoint. Usage: rv({ sm:12, md:14, lg:16, xl:18 }) */
export function useResponsiveValue(map) {
  const { width } = useWindowDimensions();
  if (width >= BREAKPOINTS.xl && map.xl !== undefined) return map.xl;
  if (width >= BREAKPOINTS.lg && map.lg !== undefined) return map.lg;
  if (width >= BREAKPOINTS.md && map.md !== undefined) return map.md;
  return map.sm ?? map.md ?? map.lg ?? map.xl;
}

/** Container max width */
export function useContainerMaxWidth() {
  return useResponsiveValue({ sm: '100%', md: 720, lg: 960, xl: 1200 });
}
