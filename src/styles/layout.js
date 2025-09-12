import { StyleSheet, Dimensions, Platform } from 'react-native';
import { spacing, z } from './tokens';

const { width, height } = Dimensions.get('window');
const MAX_W = width > height ? width / 1.25 : width - 25;

export const NAV_PROGRESS_H = 3;

export const layout = StyleSheet.create({
  page: { flex: 1 },
  container: {
    width: '100%',
    maxWidth: MAX_W,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    ...(Platform.OS === 'web' ? { boxSizing: 'border-box' } : null),
  },

  section: { paddingVertical: 56, position: 'relative' },
  sectionMuted: { paddingVertical: 56, borderTopWidth: 1 },

  heroGrid: {
    flexDirection: width >= 1024 ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  },

  progressWrap: { position: 'absolute', left: 0, right: 0, zIndex: z.header },
  progressBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0, width: '100%',
    transform: [{ scaleX: 0 }],
    transformOrigin: 'left',
    zIndex: z.progress,
  },

  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },

  featureGrid: { marginTop: spacing.md, gap: spacing.md, flexDirection: 'row', flexWrap: 'wrap' },

  grid: { flexDirection: width >= 1024 ? 'row' : 'column' },

  whyGrid: { marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' },
});
