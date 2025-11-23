import { StyleSheet } from 'react-native';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

/**
 * Reusable style helpers
 */
export const createStyles = StyleSheet.create({
  // Flexbox containers
  flex: {
    flex: 1,
  },
  flexCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Text variants
  textBase: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.normal,
  },
  textTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  textHeading: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  textSmall: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
  },

  // Buttons
  buttonBase: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#4f46e5',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },

  // Separators
  separator: {
    height: 1,
    width: '80%',
    marginVertical: spacing.xl,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '80%',
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
  },
});
