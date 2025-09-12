import { StyleSheet, Platform, Dimensions } from 'react-native';
import { spacing } from './tokens';

const { width: W, height } = Dimensions.get('window');

export const typography = StyleSheet.create({
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  h1: {
    fontWeight: '900',
    fontSize: W > 1024 ? 44 : W > 640 ? 34 : 28,
    lineHeight: W > 1024 ? 52 : W > 640 ? 42 : 34,
  },
  h1Accent: {
    ...(Platform.OS === 'web'
      ? { backgroundImage: 'linear-gradient(90deg, #7dd3fc, #c7d2fe)', WebkitBackgroundClip: 'text', color: 'transparent' }
      : null),
    fontWeight: '900',
  },
  h2: { fontWeight: '800', fontSize: W > 640 ? 24 : 20, marginTop: spacing.sm },
  sub: { marginTop: spacing.sm, lineHeight: 20 },
  lead: { lineHeight: 22, marginTop: 4, width: W > height ? W / 2 : W - 10 },

  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  ctaPrimaryText: { fontWeight: '900' },
  ctaGhostText: { fontWeight: '700' },

  statK: { fontSize: 12 },
  statV: { fontSize: 18, fontWeight: '800', marginTop: 2 },

  whyText: { fontSize: 14 },

  officeLabel: { fontSize: 12 },
  officeAddr: { fontWeight: '700', marginTop: spacing.sm },
  officeTime: { fontSize: 12, marginTop: spacing.sm + 2 },
});
