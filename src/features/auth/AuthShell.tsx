import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Screen } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <Screen><View style={styles.brand}><Text style={styles.logo}>GymTrack</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View><View style={styles.content}>{children}</View></Screen>;
}

export function AuthField({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput autoCapitalize="none" placeholderTextColor={colors.textSubtle} style={styles.input} {...props} /></View>;
}

const styles = StyleSheet.create({
  brand: { paddingTop: spacing.huge, gap: spacing.sm }, logo: { ...typography.label, color: colors.primary, letterSpacing: 1.2 },
  title: { ...typography.display, color: colors.text }, subtitle: { ...typography.body, color: colors.textMuted }, content: { gap: spacing.lg },
  field: { gap: spacing.sm }, label: { ...typography.label, color: colors.textMuted },
  input: { ...typography.body, minHeight: 54, borderRadius: radii.md, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, color: colors.text, paddingHorizontal: spacing.lg },
});
