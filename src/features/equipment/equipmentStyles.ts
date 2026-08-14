import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/theme';

export const equipmentStyles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  flex: { flex: 1 },
  card: { gap: spacing.md },
  label: { ...typography.label, color: colors.textMuted },
  input: { ...typography.body, minHeight: 48, borderRadius: radii.md, backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1, color: colors.text, paddingHorizontal: spacing.lg },
  multiline: { minHeight: 84, paddingTop: spacing.md, textAlignVertical: 'top' },
  title: { ...typography.heading, color: colors.text },
  body: { ...typography.body, color: colors.textMuted },
  caption: { ...typography.caption, color: colors.textMuted },
  subtle: { ...typography.caption, color: colors.textSubtle },
  success: { ...typography.caption, color: colors.success, fontWeight: '700' },
  primary: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  danger: { ...typography.caption, color: colors.danger },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
});
