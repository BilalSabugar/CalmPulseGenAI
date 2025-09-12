import { StyleSheet, Dimensions, Platform } from 'react-native';
import { spacing, radius, effects } from './tokens';
import { webBlur } from './palette';

const { width, height } = Dimensions.get('window');
const MAX_W = width > height ? width / 1.25 : width - 25;

export const components = StyleSheet.create({
  // Badges / chips
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },

  // Buttons
  ctaPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: radius.xl,
    ...effects.shadowCard,
  },
  ctaGhost: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
  },

  // Cards
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },

  // Feature tiles
  feature: {
    flexGrow: 1,
    minWidth: 260,
    flexBasis: width >= 1024 ? (MAX_W - 32) / 4 - 12 : width >= 640 ? (MAX_W - 32) / 2 - 12 : MAX_W - 32,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg - 2,
  },
  featureHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md - 2 },
  featureIconWrap: {
    height: 40, width: 40, borderRadius: radius.md,
    backgroundColor: 'rgba(56,189,248,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)',
  },

  // Stat / pill
  stat: {
    minWidth: 120,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...effects.shadowChip,
    ...(Platform.OS === 'web' ? webBlur : null),
  },

  // “Practice approach” cards
  whyCard: {
    flexGrow: 1,
    minWidth: 260,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Office card
  officeCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },

  // Modals (Confirm, etc.)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  modalCard: { width: '100%', maxWidth: 480, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1 },
  modalRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: { paddingHorizontal: 14, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  modalBtnOutline: { borderWidth: 1 },
});
