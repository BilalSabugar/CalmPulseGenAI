import { Platform } from 'react-native';

export const buildPalette = (isDark) => ({
  pageBg: isDark ? '#0b1220' : '#f8fafc',
  heading: isDark ? '#ffffff' : '#0f172a',
  text: isDark ? '#e2e8f0' : '#0f172a',
  subdued: isDark ? '#cbd5e1' : '#334155',
  link: isDark ? '#7dd3fc' : '#0369a1',

  sectionMutedBg: isDark ? 'rgba(2,6,23,0.4)' : 'rgba(255,255,255,0.65)',
  sectionBorder: isDark ? 'rgba(30,41,59,0.6)' : 'rgba(15,23,42,0.1)',

  cardBg: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.9)',
  cardBorder: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(15,23,42,0.12)',

  chipBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  chipBorder: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(15,23,42,0.12)',
  chipK: isDark ? '#cbd5e1' : '#475569',
  chipV: isDark ? '#ffffff' : '#0f172a',

  badgeBg: isDark ? 'rgba(56,189,248,0.1)' : 'rgba(2,132,199,0.12)',
  badgeBorder: isDark ? 'rgba(56,189,248,0.3)' : 'rgba(2,132,199,0.25)',
  badgeText: isDark ? '#bae6fd' : '#075985',

  ctaPrimaryBg: isDark ? '#ffffff' : '#0f172a',
  ctaPrimaryText: isDark ? '#0b1220' : '#ffffff',
  ctaGhostBorder: isDark ? 'rgba(51,65,85,0.6)' : 'rgba(15,23,42,0.2)',
  ctaGhostText: isDark ? '#ffffff' : '#0f172a',

  footerBorder: isDark ? 'rgba(30,41,59,0.6)' : 'rgba(15,23,42,0.1)',
  footerText: isDark ? '#94a3b8' : '#334155',

  whyText: isDark ? '#e2e8f0' : '#0f172a',

  // Accent used for native (non-web) gradient fallback
  h1AccentNative: isDark ? '#a5b4fc' : '#4f46e5',
});

export const webBlur = Platform.OS === 'web' ? { backdropFilter: 'blur(6px)' } : null;
