import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/theme';

export const equipmentStyles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  flex: { flex: 1 },
  card: { gap: spacing.md },
  quickActions: { gap: spacing.sm, padding: spacing.lg },
  group: { gap: spacing.xs },
  groupHeader: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 },
  groupTitle: { ...typography.body, color: colors.text, fontWeight: '700', flex: 1 },
  compactItem: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  compactItemBody: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  compactItemTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  compactAction: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, backgroundColor: colors.surfaceElevated },
  pressed: { opacity: 0.7 },
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
